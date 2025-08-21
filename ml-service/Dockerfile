# Use .NET 8 SDK to build, then runtime to run
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY ./*.csproj ./
RUN dotnet restore

# copy rest and publish
COPY . .
RUN dotnet publish -c Release -o /app/publish /p:PublishTrimmed=false

# Final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

# Ensure Kestrel listens on port 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

# Replace this with the real DLL name if different
ENTRYPOINT ["dotnet", "IntelliInspect.Api.dll"]
