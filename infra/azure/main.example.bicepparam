using './main.bicep'

param namePrefix = 'replace123'
param imageTag = 'replace-with-release-tag'
param publicOrigin = readEnvironmentVariable('SEHATI_PUBLIC_ORIGIN')
param sqlConnectionString = readEnvironmentVariable('SEHATI_DB_CONNECTION')
param jwtSecret = readEnvironmentVariable('SEHATI_JWT_SECRET')
