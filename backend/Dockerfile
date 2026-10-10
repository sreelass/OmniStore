# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["BopisRetail.Api.csproj", "./"]
RUN dotnet restore "BopisRetail.Api.csproj"

COPY . .
RUN dotnet build "BopisRetail.Api.csproj" -c Release -o /app/build
RUN dotnet publish "BopisRetail.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5050
ENV ASPNETCORE_URLS=http://+:5050
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BopisRetail.Api.dll"]
