# -*- coding: utf-8 -*-
"""
Genera los tres PDF de la Hoja de Vida imprimiendo el HTML con Chrome headless
(el mismo motor con el que se hicieron los originales: Producer «Skia/PDF»).

No se ejecuta a mano: usa el guion de al lado.

    ./hv/generar.sh            # crea la versión siguiente, si algo cambió
    ./hv/generar.sh --forzar   # la crea aunque nada haya cambiado

Salida: una carpeta por versión, `CV/V1`, `CV/V2`…, con los tres
`CV_Laura_Hernandez_*_V<n>.pdf` y además:

    contenido.txt   el texto de las tres HV, para leerlo sin abrir el PDF
    cambios.txt     qué cambió en ese texto respecto a la versión anterior
    huella.txt      huella del HTML impreso; si no cambia, no hay versión nueva

La HV cambia tanto al editar `hv/` como al editar `src/data/` (de ahí salen
las cifras), por eso se compara el resultado y no los archivos de origen.
`CV/V0` es la HV original, anterior al generador.

Solo necesita Python 3 y el Chrome instalado en el sistema (o el que indique
la variable de entorno CHROME_BIN). Sin dependencias que instalar.
"""

import difflib
import hashlib
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from datos import HOJAS                      # noqa: E402
from plantilla import construir_html, url_perfil   # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
CARPETA_CV = RAIZ / "CV"

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


def texto_visible(documento):
    """El texto que se lee en la HV, sin el <head>, estilos, etiquetas ni imágenes."""
    sin_bloques = re.sub(r"(?is)<(head|style|script)\b.*?</\1>", "", documento)
    con_saltos = re.sub(r"(?i)<(br|/p|/div|/li|/h\d|/section|/header|/tr)\b[^>]*>", "\n", sin_bloques)
    plano = html.unescape(re.sub(r"<[^>]+>", " ", con_saltos))
    lineas = (re.sub(r"[ \t ]+", " ", linea).strip() for linea in plano.splitlines())
    return "\n".join(linea for linea in lineas if linea)


def preparar(hojas):
    """HTML de cada hoja, el texto de las tres y la huella del conjunto."""
    documentos = [(hoja, construir_html(hoja)) for hoja in hojas]
    huella = hashlib.sha256()
    partes = []
    for hoja, documento in documentos:
        huella.update(documento.encode("utf-8"))
        partes.append("=== %s ===\n%s\n" % (hoja["archivo"], texto_visible(documento)))
    return documentos, "\n".join(partes), huella.hexdigest()


def ultima_version():
    numeros = []
    for carpeta in CARPETA_CV.glob("V*"):
        coincide = re.fullmatch(r"V(\d+)", carpeta.name)
        if carpeta.is_dir() and coincide:
            numeros.append(int(coincide.group(1)))
    return max(numeros, default=0)


def nombre_versionado(archivo, n):
    base = Path(archivo)
    return "%s_V%d%s" % (base.stem, n, base.suffix)


def escribir_registro(destino, n, contenido, huella):
    """Guarda contenido.txt, huella.txt y cambios.txt de la versión `n`."""
    (destino / "contenido.txt").write_text(contenido, encoding="utf-8")
    (destino / "huella.txt").write_text(huella + "\n", encoding="utf-8")

    previo = CARPETA_CV / ("V%d" % (n - 1)) / "contenido.txt"
    if previo.exists():
        diferencias = "".join(difflib.unified_diff(
            previo.read_text(encoding="utf-8").splitlines(keepends=True),
            contenido.splitlines(keepends=True),
            fromfile="V%d" % (n - 1),
            tofile="V%d" % n,
        ))
        cambios = diferencias or (
            "El texto no cambió respecto a V%d; cambió el diseño o la foto.\n" % (n - 1))
    else:
        cambios = "V%d: primera versión registrada.\n" % n
    (destino / "cambios.txt").write_text(cambios, encoding="utf-8")


def main():
    forzar = "--forzar" in sys.argv[1:]
    documentos, contenido, huella = preparar(HOJAS)

    ultima = ultima_version()
    huella_previa = CARPETA_CV / ("V%d" % ultima) / "huella.txt"
    if not forzar and huella_previa.exists() and huella_previa.read_text().strip() == huella:
        print("Sin cambios desde V%d: no se crea una versión nueva.\n"
              "(Para crearla igual:  ./hv/generar.sh --forzar)" % ultima)
        return

    chrome = buscar_chrome()
    n = ultima + 1
    destino = CARPETA_CV / ("V%d" % n)
    destino.mkdir(parents=True)
    trabajo = Path(tempfile.mkdtemp(prefix="hv-"))

    try:
        for hoja, documento in documentos:
            ruta_html = trabajo / ("%s.html" % hoja["perfil"])
            ruta_pdf = destino / nombre_versionado(hoja["archivo"], n)

            ruta_html.write_text(documento, encoding="utf-8")

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
            print("✓ %-52s %4.0f KB   →  %s"
                  % (ruta_pdf.relative_to(CARPETA_CV), kb, url_perfil(hoja["perfil"])))

        escribir_registro(destino, n, contenido, huella)
    except BaseException:
        # Una versión a medias confundiría la próxima comparación.
        shutil.rmtree(destino, ignore_errors=True)
        raise
    finally:
        shutil.rmtree(trabajo, ignore_errors=True)

    print("\nVersión V%d lista en CV/V%d (qué cambió: CV/V%d/cambios.txt)" % (n, n, n))


if __name__ == "__main__":
    main()
