# Sehati Deployment Guide

This guide prepares the application for a container-based deployment behind a TLS-enabled ingress or reverse proxy. The database is an externally managed SQL Server or Azure SQL instance; neither Compose nor the Azure template creates a database.

## Runtime configuration

Set these variables in the deployment platform's secret/configuration store. Do not commit a populated `.env` file.

| Variable | Required | Description |
|---|---:|---|
| `SEHATI_DB_CONNECTION` | Yes | Production SQL Server connection string. Use encrypted transport, a least-privilege application identity, and a managed secret. |
| `SEHATI_JWT_SECRET` | Yes | Random signing key of at least 32 bytes. Keep it stable across API replicas and store it in a secret manager. |
| `SEHATI_PUBLIC_ORIGIN` | Yes | Exact public HTTPS origin serving the frontend, for example `https://sehati.example.com`. The API uses it for CORS. |
| `SEHATI_HTTP_PORT` | No | Host port for local Compose smoke checks; defaults to `8080`. In production, publish only through the TLS ingress. |

`docker-compose.yml` starts the API and Angular/Nginx frontend. The API has no published host port and is reachable only on the Compose network. Nginx proxies `/api/` to the API and falls back to `index.html` for Angular routes. Terminate TLS at the ingress, restrict direct access to the frontend container, and pass the original forwarded protocol to Nginx. Production browser calls use the frontend origin; Nginx proxies API requests server-side.

## Build and run

From the repository root, set the variables in your shell or deployment platform, then run:

```sh
docker compose config
docker compose build
docker compose up -d
```

Open the configured HTTPS origin and check `GET /api/health`. Review container logs and the hosting platform's health/availability signals before routing users to the release. For a local HTTP smoke check only, set `SEHATI_HTTP_PORT=8080` and open `http://localhost:8080`.

## Azure Container Apps

`infra/azure/main.bicep` creates an Azure Container Registry, Log Analytics workspace, Container Apps environment, an internal API app, and a public HTTPS frontend app. A user-assigned identity with the `AcrPull` role lets both apps pull images without an ACR admin password. The frontend Nginx container proxies `/api/` to the internal API. Use Azure SQL or another managed SQL Server separately and supply its connection string as a deployment secret.

Prerequisites: Azure CLI with Bicep support, a subscription, permissions to create resources and role assignments, and an Azure region that supports Container Apps. Set a globally unique lowercase alphanumeric `namePrefix` (3–12 characters) so the derived ACR name is valid. Pick an immutable release tag. Create the registry first so the images exist before the apps are deployed:

```sh
az login
az bicep install
az account set --subscription "<subscription-id>"
az group create --name "<resource-group>" --location "<azure-region>"
az acr create --resource-group "<resource-group>" --name "<namePrefix>acr" --sku Basic --admin-enabled false
az acr build --resource-group "<resource-group>" --registry "<namePrefix>acr" --image "sehati-api:<release-tag>" --file src/Sehati.API/Dockerfile .
az acr build --resource-group "<resource-group>" --registry "<namePrefix>acr" --image "sehati-web:<release-tag>" --file Dockerfile src/Sehati.Web
```

Set `SEHATI_PUBLIC_ORIGIN`, `SEHATI_DB_CONNECTION`, and `SEHATI_JWT_SECRET` in the deployment shell, then deploy. The sample parameter file reads them from the environment; keep secrets out of source control and shell command history.

```powershell
$env:SEHATI_DB_CONNECTION = '<managed SQL connection string>'
$env:SEHATI_JWT_SECRET = '<random secret of at least 32 bytes>'
$env:SEHATI_PUBLIC_ORIGIN = 'https://sehati.example.com'
az deployment group create --resource-group "<resource-group>" --template-file infra/azure/main.bicep --parameters infra/azure/main.example.bicepparam --parameters namePrefix='<namePrefix>' imageTag='<release-tag>'
```

The deployment outputs the frontend and API URLs. Only the frontend URL is public. The API uses separate liveness (`/api/health/live`) and database readiness (`/api/health/ready`) probes. Configure custom DNS and confirm HTTPS, `/api/health`, both probe states, container logs, and an application smoke check before sending users to the release. The template uses baseline Basic ACR and small container sizes; adjust capacity, networking, retention, alerting, and cost controls for the selected environment.

To roll forward, build new images under a new immutable tag and redeploy with that tag. Preserve the previous tag for application rollback. Database recovery remains a separate operator-led action.

## Production database migration plan

Migrations are deliberately not run automatically when the API starts. Use a reviewed, idempotent SQL script and a database operator for production changes.

1. Confirm the target database, release commit, current migration history, maintenance window, and named operator. Verify the application identity has only runtime permissions; use a separate migration identity for schema changes.
2. Take and verify a restorable database backup. Test the release and migration against a recent, sanitized production copy in staging.
3. Install the .NET 10 SDK and EF tool `10.0.15` on a controlled build workstation, then generate an idempotent script:

   ```sh
   dotnet tool install --global dotnet-ef --version 10.0.15
   dotnet ef migrations script --idempotent \
     --project src/Sehati.Infrastructure \
     --startup-project src/Sehati.API \
     --output artifacts/sehati-migrations.sql
   ```

4. Review the SQL and its data impact with the database operator; confirm lock duration, storage needs, and whether an expand/contract rollout is required. Do not run an unreviewed script against production.
5. During the approved window, pause or drain writes if required, take a final backup, execute the script with the migration identity, and verify the expected entries in `__EFMigrationsHistory` and application smoke checks.
6. Deploy the matching API and frontend images. Confirm login, health, and critical read/write paths using approved non-sensitive test accounts, then monitor errors and database health.
7. If migration or rollout fails, stop the rollout and follow the incident plan. Prefer a forward fix for schema changes; restore the verified backup only under the database recovery procedure because restoring loses writes since that backup.

Do not place real patient data in test environments. Use the organization's approved privacy, retention, encryption, backup, access-review, and incident-response policies before production use.

## Release and rollback

Build immutable images from a reviewed commit and record their digests with the deployment record. Deploy to staging first. Keep the previous application image available for rollback; verify schema compatibility before rolling application code back. Database rollback is a separate recovery decision and is not equivalent to reverting the application image.

## Deployment limitations to close before production

- **Runtime verification:** the API and container configuration now target .NET 10 LTS, and all 156 backend tests pass. Complete the production security review before deployment. See the [official .NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).
- Configure private network access from Container Apps to the production SQL database (for example, VNet integration and a private endpoint), or another explicitly reviewed restricted network path. This template does not create or connect a virtual network or SQL firewall rules.
- Configure a real TLS ingress, domain, certificate renewal, firewall rules, and secrets manager in the selected hosting environment.
- Azure Container Apps uses separate API liveness and database readiness probes. Configure platform monitoring and alerting before production; the legacy `/api/health` endpoint remains a process-level check.
- Validate capacity, backups/restore, privacy and regulatory obligations, and the selected hosting region with the operating team.
- Pin container base images to approved immutable digests as part of the release pipeline.
