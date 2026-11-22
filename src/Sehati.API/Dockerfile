FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Sehati.sln ./
COPY src/Sehati.API/Sehati.API.csproj src/Sehati.API/
COPY src/Sehati.Application/Sehati.Application.csproj src/Sehati.Application/
COPY src/Sehati.Domain/Sehati.Domain.csproj src/Sehati.Domain/
COPY src/Sehati.Infrastructure/Sehati.Infrastructure.csproj src/Sehati.Infrastructure/
RUN dotnet restore src/Sehati.API/Sehati.API.csproj

COPY src/ src/
RUN dotnet publish src/Sehati.API/Sehati.API.csproj --configuration Release --no-restore --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Sehati.API.dll"]
