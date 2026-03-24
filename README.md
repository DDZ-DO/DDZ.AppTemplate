# DDZ App Template

Vorlage fuer neue DDZ-Webanwendungen mit React-Frontend und .NET-Backend.

## Enthaltene Features

- **Backend:** ASP.NET 8 mit JWT-Auth, PostgreSQL, NATS EventBus, SignalR
- **Frontend:** React + TypeScript + Tailwind CSS mit shared-react und shared-admin
- **Docker:** compose.yml, Dockerfile, publish.sh
- **System-Panel:** Integrierte Admin-UI mit Task-Center und CronJobs
- **Omni-Board:** Projekt-Konfiguration fuer lokale Entwicklung

## Neue App erstellen

### 1. Repository erstellen

Klicke auf **"Use this template"** in GitHub und erstelle ein neues Repository mit dem Namen `DDZ.<AppName>`.

### 2. Platzhalter ersetzen

Ersetze alle Platzhalter im gesamten Projekt:

| Platzhalter | Ersetzen durch | Beispiel |
|-------------|---------------|----------|
| `__AppName__` | App-Name (PascalCase) | `PhoneManager` |
| `__appname__` | App-Name (lowercase) | `phonemanager` |
| `__AppTagline__` | Kurzbeschreibung | `Telefonverwaltung` |
| `__ABBREV__` | 2-3 Buchstaben Kuerzel | `PM` |

```bash
# Beispiel: Neue App "TicketSystem"
find . -type f -not -path './.git/*' | xargs sed -i '' \
  -e 's/__AppName__/TicketSystem/g' \
  -e 's/__appname__/ticketsystem/g' \
  -e 's/__AppTagline__/Ticket-Verwaltung/g' \
  -e 's/__ABBREV__/TS/g'
```

### 3. Dateien und Verzeichnisse umbenennen

```bash
mv "DDZ.__AppName__.sln" "DDZ.TicketSystem.sln"
mv "src/backend/DDZ.__AppName__.API" "src/backend/DDZ.TicketSystem.API"
mv "src/backend/DDZ.TicketSystem.API/DDZ.__AppName__.API.csproj" "src/backend/DDZ.TicketSystem.API/DDZ.TicketSystem.API.csproj"
```

### 4. Git Submodul einrichten

```bash
git submodule add https://github.com/DDZ-DO/DDZ.Libs.git libs/DDZ.Libs
git submodule update --init --recursive
```

### 5. Frontend Dependencies installieren

```bash
cd src/frontend
npm install
```

### 6. Backend Port anpassen

In `src/backend/DDZ.<AppName>.API/Properties/launchSettings.json` einen freien Port waehlen (Standard: 5195).

### 7. Starten

```bash
# Backend
cd src/backend/DDZ.<AppName>.API
DDZ_JWT_SECRET="dev-secret-min-32-characters-long" dotnet run

# Frontend
cd src/frontend
npm run dev
```

## Projektstruktur

```
DDZ.<AppName>/
├── docker/                  # Docker-Deployment
│   ├── compose.yml
│   ├── Dockerfile
│   └── .env.example
├── libs/DDZ.Libs/           # Shared Libraries (Git Submodul)
├── src/
│   ├── backend/DDZ.<AppName>.API/
│   │   ├── Controllers/     # API-Endpunkte
│   │   ├── Data/            # DbContext, Entities
│   │   ├── Services/        # Business-Logik, JWT
│   │   └── Program.cs       # App-Konfiguration
│   └── frontend/
│       └── src/
│           ├── components/   # React-Komponenten
│           ├── lib/          # API-Client, Utilities
│           └── App.tsx       # Routing, Provider
├── .omni/                   # Omni-Board Konfiguration
└── publish.sh               # Build + Docker Push
```
