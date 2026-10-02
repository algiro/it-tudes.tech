# Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Directory.Packages.props ./
COPY src/Billing.Api/Billing.Api.csproj src/Billing.Api/
RUN dotnet restore src/Billing.Api/Billing.Api.csproj

COPY . .
RUN dotnet publish src/Billing.Api -c Release -o /app --no-restore

# Run: small image, no shell, non-root by default
FROM mcr.microsoft.com/dotnet/aspnet:10.0⟨|-noble-chiseled|later⟩
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Billing.Api.dll"]
