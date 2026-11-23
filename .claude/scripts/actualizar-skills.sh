#!/usr/bin/env bash
# Instala o actualiza las skills externas que no van en git
# (Impeccable y taste-skill) desde sus repos de GitHub.
#
# Lo lanza el hook SessionStart de .claude/settings.json en segundo plano
# cada vez que se abre Claude Code en el proyecto; también se puede correr
# a mano:   bash .claude/scripts/actualizar-skills.sh
#
# Los repos se guardan una sola vez en ~/.cache/claude-skills/ (compartidos
# entre proyectos) y de ahí se copian a .claude/. Registro en
# .claude/skills-actualizacion.log.
set -euo pipefail

PROYECTO="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/claude-skills"
SKILLS="$PROYECTO/.claude/skills"
AGENTES="$PROYECTO/.claude/agents"
mkdir -p "$CACHE" "$SKILLS" "$AGENTES"

# Candado: si otra sesión (u otro proyecto) ya está actualizando, salir.
CANDADO="$CACHE/.actualizando"
if ! mkdir "$CANDADO" 2>/dev/null; then
  # Candado huérfano de más de 10 minutos: se libera.
  if [ -n "$(find "$CANDADO" -maxdepth 0 -mmin +10 2>/dev/null)" ]; then
    rm -rf "$CANDADO"; mkdir "$CANDADO"
  else
    echo "$(date '+%F %T') otra actualización en curso; se omite"; exit 0
  fi
fi
trap 'rm -rf "$CANDADO"' EXIT

# Clona o trae la última versión de un repo (solo el último commit).
traer() {
  local repo="$1" dir="$CACHE/$(echo "$1" | tr / _)"
  if [ -d "$dir/.git" ]; then
    git -C "$dir" fetch -q --depth 1 origin HEAD
    git -C "$dir" reset -q --hard FETCH_HEAD
  else
    git clone -q --depth 1 "https://github.com/$repo.git" "$dir"
  fi
  echo "$dir"
}

echo "$(date '+%F %T') actualizando skills en $PROYECTO"

# ── Impeccable: skill + subagentes ──
IMP="$(traer pbakaus/impeccable)"
rsync -a --delete --exclude 'scripts/bin/' "$IMP/.claude/skills/impeccable/" "$SKILLS/impeccable/"
cp "$IMP/LICENSE" "$IMP/NOTICE.md" "$SKILLS/impeccable/"
rm -f "$AGENTES"/impeccable-*.md
cp "$IMP"/.claude/agents/impeccable-*.md "$AGENTES/"
echo "  impeccable $(cat "$SKILLS/impeccable/scripts/VERSION" 2>/dev/null) ($(git -C "$IMP" rev-parse --short HEAD))"

# ── taste-skill ──
TASTE="$(traer leonxlnx/taste-skill)"
rsync -a --delete "$TASTE/skills/taste-skill/" "$SKILLS/taste-skill/"
cp "$TASTE/LICENSE" "$SKILLS/taste-skill/"
echo "  taste-skill ($(git -C "$TASTE" rev-parse --short HEAD))"
