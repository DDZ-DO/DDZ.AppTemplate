#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================
# DDZ.__AppName__ Deploy Script
# ============================================

DOCKER_IMAGE="ddzdo/ddz-__appname__"
PLATFORMS="linux/amd64,linux/arm64"
DOCKERFILE="docker/Dockerfile"
NUGET_CONFIG="${HOME}/.nuget/NuGet/NuGet.Config"

NON_INTERACTIVE=false
if [[ ! -t 0 ]]; then
  NON_INTERACTIVE=true
fi

# ============================================
# Helper Functions
# ============================================

usage() {
  cat <<'EOF'
DDZ.__AppName__ Deploy Script

Usage: ./publish.sh [OPTIONS]

Options:
  --dry-run         Zeige was getan werden wuerde, ohne es auszufuehren
  --skip-push       Baue das Image, pushe es aber nicht
  --help            Diese Hilfe anzeigen
EOF
}

trap 'echo "Fehler aufgetreten. Abbruch."; exit 1' ERR

ask_yes_no() {
  local question="${1:-Fortfahren?}"
  local default="${2:-N}"
  local prompt reply

  if [[ "$default" == "Y" ]]; then
    prompt="${question} [Y/n]: "
  else
    prompt="${question} [y/N]: "
  fi

  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    [[ "$default" == "Y" ]]
    return
  fi

  if ! read -r -p "$prompt" reply; then
    reply=""
  fi
  [[ -z "${reply:-}" ]] && reply="$default"

  case "$reply" in
    [yY][eE][sS]|[yY]|Y) return 0 ;;
    *) return 1 ;;
  esac
}

generate_version() {
  local year month day time
  year=$(date +%y)
  month=$(date +%-m)
  day=$(date +%-d)
  time=$(date +%H%M)
  echo "${year}.${month}.${day}.${time}"
}

# ============================================
# Parse Arguments
# ============================================

DRY_RUN=false
SKIP_PUSH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --skip-push) SKIP_PUSH=true; shift ;;
    --help) usage; exit 0 ;;
    *) echo "Unbekanntes Argument: $1"; usage; exit 1 ;;
  esac
done

# ============================================
# Setup
# ============================================

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

if [[ ! -f "$DOCKERFILE" ]]; then
  echo "Dockerfile nicht gefunden: $DOCKERFILE"
  exit 1
fi

if [[ ! -f "$NUGET_CONFIG" ]]; then
  echo "NuGet Config nicht gefunden: $NUGET_CONFIG"
  exit 1
fi

VERSION=$(generate_version)

echo ""
echo "Build Konfiguration"
echo "==================="
echo "Version:     $VERSION"
echo "Image:       ${DOCKER_IMAGE}:latest"
echo "Platforms:   $PLATFORMS"
echo ""

# ============================================
# Dry Run
# ============================================

if [[ "$DRY_RUN" == "true" ]]; then
  echo "DRY RUN - Folgende Befehle wuerden ausgefuehrt:"
  echo ""
  echo "  docker buildx build . \\"
  echo "    -f $DOCKERFILE \\"
  echo "    --platform $PLATFORMS \\"
  echo "    --build-arg VERSION=$VERSION \\"
  echo "    --secret id=nugetconfig,src=$NUGET_CONFIG \\"
  echo "    -t ${DOCKER_IMAGE}:latest \\"
  echo "    --push"
  echo ""
  echo "  git tag -a 'v${VERSION}' -m 'Release v${VERSION}'"
  echo "  git push origin 'v${VERSION}'"
  exit 0
fi

# ============================================
# Git Status Check
# ============================================

CHANGES=$(git status --porcelain)
if [[ -n "$CHANGES" ]]; then
  echo "Uncommitted Aenderungen gefunden:"
  echo "$CHANGES"
  echo ""
  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    echo "Non-interactive Modus: Abbruch wegen uncommitted Aenderungen."
    exit 1
  fi
  if ask_yes_no "Aenderungen jetzt committen und pushen?" "N"; then
    git add -A
    git commit -m "chore: pre-release"
    git push
  else
    echo "Abbruch. Bitte Aenderungen manuell committen."
    exit 1
  fi
fi

if ! ask_yes_no "Build und Deploy starten?" "Y"; then
  echo "Abbruch."
  exit 1
fi

# ============================================
# Build & Push
# ============================================

BUILDER="ddz-__appname__-$(date +%s)-$$"
docker buildx create --name "$BUILDER" --driver docker-container --driver-opt network=host --use

cleanup() {
  docker buildx rm -f "$BUILDER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

if [[ "$SKIP_PUSH" == "true" ]]; then
  echo "Baue Image (kein Push)..."
  docker buildx build . \
    -f "$DOCKERFILE" \
    --build-arg "VERSION=${VERSION}" \
    --secret "id=nugetconfig,src=${NUGET_CONFIG}" \
    -t "${DOCKER_IMAGE}:latest" \
    --load
else
  echo "Baue und pushe Image..."
  docker buildx build . \
    -f "$DOCKERFILE" \
    --platform "$PLATFORMS" \
    --build-arg "VERSION=${VERSION}" \
    --secret "id=nugetconfig,src=${NUGET_CONFIG}" \
    -t "${DOCKER_IMAGE}:latest" \
    --push
fi

# ============================================
# Git Tag
# ============================================

git tag -a "v${VERSION}" -m "Release v${VERSION}"

if [[ "$SKIP_PUSH" == "false" ]]; then
  git push origin "v${VERSION}"
fi

echo ""
echo "Deployment erfolgreich!"
echo "======================="
echo "Version: $VERSION"
echo "Image:   ${DOCKER_IMAGE}:latest"
echo "Tag:     v${VERSION}"
echo ""
