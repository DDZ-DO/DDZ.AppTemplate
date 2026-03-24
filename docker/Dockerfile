ARG VERSION=0.0.0

# ============================================
# Stage 1: Build Frontend (React + Vite)
# ============================================
FROM node:22-alpine AS frontend-build
ARG VERSION
WORKDIR /app

COPY libs/DDZ.Libs/DDZ.Shared.React ./libs/DDZ.Libs/DDZ.Shared.React
COPY libs/DDZ.Libs/DDZ.Shared.Admin/src/frontend ./libs/DDZ.Libs/DDZ.Shared.Admin/src/frontend
COPY libs/DDZ.Libs/DDZ.Shared.Tasks/src/frontend ./libs/DDZ.Libs/DDZ.Shared.Tasks/src/frontend

WORKDIR /app/libs/DDZ.Libs/DDZ.Shared.React
RUN npm install --include=dev --ignore-scripts

WORKDIR /app/libs/DDZ.Libs/DDZ.Shared.Admin/src/frontend
RUN npm install --ignore-scripts

WORKDIR /app/libs/DDZ.Libs/DDZ.Shared.Tasks/src/frontend
RUN npm install --ignore-scripts

WORKDIR /app
COPY src/frontend/package*.json ./src/frontend/

WORKDIR /app/src/frontend
RUN npm install --ignore-scripts

COPY src/frontend/ ./

ENV VITE_APP_VERSION=${VERSION}
RUN npm run build

# ============================================
# Stage 2: Build Backend (.NET)
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
ARG VERSION
WORKDIR /src

COPY DDZ.__AppName__.sln ./
COPY src/backend/DDZ.__AppName__.API/DDZ.__AppName__.API.csproj src/backend/DDZ.__AppName__.API/
COPY libs/DDZ.Libs/ libs/DDZ.Libs/

RUN mkdir -p /root/.nuget/NuGet
COPY nuget.config.secret /root/.nuget/NuGet/NuGet.Config

RUN dotnet restore src/backend/DDZ.__AppName__.API/DDZ.__AppName__.API.csproj

COPY src/backend/ src/backend/

RUN dotnet publish src/backend/DDZ.__AppName__.API/DDZ.__AppName__.API.csproj \
    -c Release \
    -o /app/publish \
    -p:Version=${VERSION}

# ============================================
# Stage 3: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    TZ=Europe/Berlin

COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/src/frontend/dist ./wwwroot

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dotnet", "DDZ.__AppName__.API.dll"]
