#!/usr/bin/env bash
#
# Genera las tres Hojas de Vida en PDF.
#
#     ./hv/generar.sh
#
# Edita los textos en hv/datos.py y vuelve a ejecutarlo.
# Si Chrome no está en la ruta habitual:  CHROME_BIN='/ruta/a/Chrome' ./hv/generar.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v python3 >/dev/null 2>&1; then
  echo "Falta Python 3. Instálalo con:  brew install python" >&2
  exit 1
fi

python3 hv/generar.py "$@"
