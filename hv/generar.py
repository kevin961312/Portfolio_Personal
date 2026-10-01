# -*- coding: utf-8 -*-
"""
Genera los tres PDF de la Hoja de Vida imprimiendo el HTML con Chrome headless
(el mismo motor con el que se hicieron los originales: Producer «Skia/PDF»).

No se ejecuta a mano: usa el guion de al lado.

    ./hv/generar.sh

Salida: los tres `CV_Laura_Hernandez_*.pdf` en la raíz del repositorio.
Solo necesita Python 3 y el Chrome instalado en el sistema (o el que indique
la variable de entorno CHROME_BIN). Sin dependencias que instalar.
"""

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from datos import HOJAS                      # noqa: E402
from plantilla import construir_html, url_perfil   # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent

CANDIDATOS_CHROME = [
    os.environ.get("CHROME_BIN", ""),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    shutil.which("google-chrome") or "",
    shutil.which("chromium") or "",
]


def buscar_chrome():
    for ruta in CANDIDATOS_CHROME:
        if ruta and Path(ruta).exists():
            return ruta
    sys.exit(
        "No encuentro Chrome.\n"
        "Instálalo, o indica dónde está:\n"
        "    CHROME_BIN='/ruta/a/Chrome' ./hv/generar.sh"
    )


def main():
    chrome = buscar_chrome()
    trabajo = Path(tempfile.mkdtemp(prefix="hv-"))

    try:
        for hoja in HOJAS:
            ruta_html = trabajo / ("%s.html" % hoja["perfil"])
            ruta_pdf = RAIZ / hoja["archivo"]

            ruta_html.write_text(construir_html(hoja), encoding="utf-8")

            subprocess.run(
                [
                    chrome,
                    "--headless",
                    "--disable-gpu",
                    "--no-pdf-header-footer",
                    "--generate-pdf-document-outline",
                    "--print-to-pdf=%s" % ruta_pdf,
                    "file://%s" % ruta_html,
                ],
                check=True,
                capture_output=True,
            )

            kb = ruta_pdf.stat().st_size / 1024
            print("✓ %-46s %4.0f KB   →  %s"
                  % (hoja["archivo"], kb, url_perfil(hoja["perfil"])))
    finally:
        shutil.rmtree(trabajo, ignore_errors=True)


if __name__ == "__main__":
    main()
