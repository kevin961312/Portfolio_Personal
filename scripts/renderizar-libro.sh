#!/usr/bin/env bash
# Pre-renderiza las páginas del libro de fotos «40 años de I.R.A.» a WebP
# para el visor de la Galería (src/components/galeria/VisorLibro.tsx).
#
# Uso (desde la raíz del proyecto):
#   bash scripts/renderizar-libro.sh
#
# Necesita pdftoppm (poppler) y cwebp (libwebp); en macOS con Homebrew
# quedan en /opt/homebrew/bin. Por cada página NN (01…10) genera:
#   pagina-NN.webp         1920 × 1080  vista normal
#   pagina-NN-grande.webp  2880 × 1620  zoom y pantalla completa
#   miniatura-NN.webp       360 × 203   tira de miniaturas
# Las páginas del PDF son 16:9 (1440 × 810 pt). Si cambian las medidas,
# actualizar `ancho`/`alto` en src/data/galeria.ts.
set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

PDF="public/documentos/40-anos-de-ira.pdf"
SAL="public/images/libro-ira"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$SAL"

# 3000 px de ancho: suficiente para la versión grande sin ampliar.
pdftoppm -png -scale-to-x 3000 -scale-to-y 1688 "$PDF" "$TMP/p"

for f in "$TMP"/p-*.png; do
  n="$(basename "$f" .png | sed 's/^p-0*//')"
  nn="$(printf %02d "$n")"
  cwebp -quiet -q 80 -resize 2880 1620 "$f" -o "$SAL/pagina-$nn-grande.webp"
  cwebp -quiet -q 80 -resize 1920 1080 "$f" -o "$SAL/pagina-$nn.webp"
  cwebp -quiet -q 70 -resize 360 203 "$f" -o "$SAL/miniatura-$nn.webp"
done

ls -l "$SAL"
