#!/usr/bin/env bash
#
# Genera las tres Hojas de Vida en PDF, en una carpeta nueva por versión
# (CV/V1, CV/V2…). Si nada cambió desde la última, no crea otra.
#
#     ./hv/generar.sh            # versión siguiente, si hubo cambios
#     ./hv/generar.sh --forzar   # versión siguiente aunque no haya cambios
#
# Edita los textos en hv/datos.py y vuelve a ejecutarlo. Qué cambió entre
# versiones: CV/V<n>/cambios.txt.
# Si Chrome no está en la ruta habitual:  CHROME_BIN='/ruta/a/Chrome' ./hv/generar.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v python3 >/dev/null 2>&1; then
  echo "Falta Python 3. Instálalo con:  brew install python" >&2
  exit 1
fi

python3 hv/generar.py "$@"
