FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/Pedidos.Api.csproj backend/
RUN dotnet restore backend/Pedidos.Api.csproj
COPY backend/ backend/
RUN dotnet publish backend/Pedidos.Api.csproj -c Release -o /out --no-restore
FROM build AS tests
COPY tests/UnitTests/ tests/UnitTests/
RUN dotnet test tests/UnitTests/UnitTests.csproj -c Release
FROM build AS integration-tests
COPY database/ database/
COPY tests/IntegrationTests/ tests/IntegrationTests/
RUN dotnet build tests/IntegrationTests/IntegrationTests.csproj -c Release
ENTRYPOINT ["dotnet", "test", "tests/IntegrationTests/IntegrationTests.csproj", "-c", "Release", "--no-build", "--logger", "console;verbosity=normal"]
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_URLS=http://+:8080
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet","Pedidos.Api.dll"]
