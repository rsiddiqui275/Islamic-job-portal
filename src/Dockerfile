FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["MolanaApp.API/MolanaApp.API.csproj", "MolanaApp.API/"]
COPY ["MolanaApp.Domain/MolanaApp.Domain.csproj", "MolanaApp.Domain/"]
COPY ["MolanaApp.Infrastructure/MolanaApp.Infrastructure.csproj", "MolanaApp.Infrastructure/"]
RUN dotnet restore "MolanaApp.API/MolanaApp.API.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/MolanaApp.API"
RUN dotnet build "MolanaApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MolanaApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "MolanaApp.API.dll"]
