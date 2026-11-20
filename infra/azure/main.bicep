@description('Short, globally unique lowercase alphanumeric prefix used in Azure resource names.')
@minLength(3)
@maxLength(12)
param namePrefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Immutable release tag used for both container images.')
param imageTag string

@description('Exact public frontend origin allowed by the API CORS policy.')
param publicOrigin string

@description('Azure SQL connection string for the application identity configured by the operator.')
@secure()
param sqlConnectionString string

@description('Random JWT signing secret of at least 32 bytes.')
@secure()
param jwtSecret string

var registryName = '${namePrefix}acr'
var environmentName = '${namePrefix}-env'
var apiName = '${namePrefix}-api'
var webName = '${namePrefix}-web'

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource logs 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${namePrefix}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

resource pullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${namePrefix}-pull'
  location: location
}

resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, pullIdentity.id, 'AcrPull')
  scope: registry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
    principalId: pullIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource api 'Microsoft.App/containerApps@2024-03-01' = {
  name: apiName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${pullIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          identity: pullIdentity.id
        }
      ]
      secrets: [
        {
          name: 'sql-connection'
          value: sqlConnectionString
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
      ingress: {
        external: false
        targetPort: 8080
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${registry.properties.loginServer}/sehati-api:${imageTag}'
          env: [
            {
              name: 'ASPNETCORE_ENVIRONMENT'
              value: 'Production'
            }
            {
              name: 'ASPNETCORE_HTTP_PORTS'
              value: '8080'
            }
            {
              name: 'CorsSettings__AllowedOrigins__0'
              value: publicOrigin
            }
            {
              name: 'ConnectionStrings__DefaultConnection'
              secretRef: 'sql-connection'
            }
            {
              name: 'JwtSettings__Secret'
              secretRef: 'jwt-secret'
            }
            {
              name: 'RateLimiting__Disabled'
              value: 'false'
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [
    acrPullRole
  ]
}

resource web 'Microsoft.App/containerApps@2024-03-01' = {
  name: webName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${pullIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          identity: pullIdentity.id
        }
      ]
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${registry.properties.loginServer}/sehati-web:${imageTag}'
          env: [
            {
              name: 'API_BASE_URL'
              value: 'https://${api.properties.configuration.ingress.fqdn}'
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [
    acrPullRole
  ]
}

output registryName string = registry.name
output registryServer string = registry.properties.loginServer
output apiUrl string = 'https://${api.properties.configuration.ingress.fqdn}'
output webUrl string = 'https://${web.properties.configuration.ingress.fqdn}'
