# -*- coding: utf-8 -*-
"""
Cifras de la Hoja de Vida, leídas de las MISMAS fuentes que alimentan la web
(`src/data/*.ts`), para que el PDF y el sitio nunca muestren números distintos.

`src/data/perfiles.ts` hace este mismo cálculo en TypeScript; aquí se repite
leyendo los literales del archivo, sin compilar nada.

No hay que tocar este archivo: al añadir un post o un artículo a `src/data/`,
todo se recalcula solo.
"""

import re
from datetime import date
from pathlib import Path
from types import SimpleNamespace

RAIZ = Path(__file__).resolve().parent.parent


def _leer(ruta):
    return (RAIZ / ruta).read_text(encoding="utf-8")


def _recorrer(texto, desde, abre, cierra):
    """Devuelve el tramo equilibrado que empieza en `desde`, ignorando lo que
    vaya dentro de comillas (un `}` en un título no debe contar)."""
    profundidad = 0
    comilla = None
    i = desde
    while i < len(texto):
        c = texto[i]
        if comilla:
            if c == "\\":
                i += 2
                continue
            if c == comilla:
                comilla = None
        elif c in "\"'`":
            comilla = c
        elif c == abre:
            profundidad += 1
        elif c == cierra:
            profundidad -= 1
            if profundidad == 0:
                return texto[desde : i + 1]
        i += 1
    raise ValueError("Literal sin cerrar en los datos")


def _arreglo(fuente, nombre):
    """El arreglo literal que sigue a `export const <nombre>`."""
    inicio = fuente.find("export const " + nombre)
    if inicio == -1:
        raise ValueError("No se encontró «%s» en la fuente" % nombre)
    # El `[` del tipo (`: PostInstagram[]`) va antes del `=`; hay que saltarlo.
    igual = fuente.index("=", inicio)
    return _recorrer(fuente, fuente.index("[", igual), "[", "]")


def _objetos(bloque):
    """Trocea el arreglo en sus objetos de primer nivel."""
    salida = []
    i = 0
    while i < len(bloque):
        if bloque[i] == "{":
            objeto = _recorrer(bloque, i, "{", "}")
            salida.append(objeto)
            i += len(objeto)
        else:
            i += 1
    return salida


def _texto(objeto, clave):
    m = re.search(r"\b%s\s*:\s*[\"'](.*?)[\"']" % clave, objeto, re.S)
    return m.group(1) if m else None


def _entero(objeto, clave):
    m = re.search(r"\b%s\s*:\s*(\d+)" % clave, objeto)
    return int(m.group(1)) if m else 0


posts = _objetos(_arreglo(_leer("src/data/posts-instagram.ts"), "postsInstagram"))
digitales = _objetos(_arreglo(_leer("src/data/articulos-digitales.ts"), "articulosDigitales"))

likes = [_entero(p, "likes") for p in posts]
tipos = [_texto(p, "tipo") for p in posts]
fechas = sorted(f for f in (_texto(p, "fecha") for p in posts) if f)

reels = [n for n, t in zip(likes, tipos) if t == "video"]
carruseles = [n for n, t in zip(likes, tipos) if t == "carrusel"]


def _media(lista):
    return round(sum(lista) / len(lista)) if lista else 0


# La web etiqueta como «promedio por pieza» la MEDIANA de interacciones
# (`src/data/perfiles.ts`); se repite el mismo criterio.
_orden = sorted(likes)
_mitad = len(_orden) // 2
if not _orden:
    _mediana = 0
elif len(_orden) % 2:
    _mediana = _orden[_mitad]
else:
    _mediana = round((_orden[_mitad - 1] + _orden[_mitad]) / 2)

# Meses cumplidos entre la primera y la última publicación.
if len(fechas) < 2:
    _meses = 0
else:
    _d1, _d2 = (date.fromisoformat(f) for f in (fechas[0], fechas[-1]))
    _meses = round((_d2 - _d1).days / 30.44)

# `src/data/articulos-impresos.ts` sigue vacío: estos dos valores se declaran
# a mano igual que en la web.
IMPRESOS = 5
REPORTAJES_TV = 1


#: Las cifras, como atributos: `M.interacciones`, `M.reels`…
M = SimpleNamespace(
    piezas_ig=len(posts),
    interacciones=sum(likes),
    mediana=_mediana,
    pico=max(likes) if likes else 0,
    reels=len(reels),
    carruseles=len(carruseles),
    media_reels=_media(reels),
    media_carruseles=_media(carruseles),
    pico_carrusel=max(carruseles) if carruseles else 0,
    sobre_10k=len([n for n in likes if n >= 10000]),
    sobre_5k=len([n for n in likes if n >= 5000]),
    meses=_meses,
    digitales=len(digitales),
    impresos=IMPRESOS,
    reportajes_tv=REPORTAJES_TV,
    prensa=len(digitales) + IMPRESOS,
    piezas_periodisticas=len(digitales) + IMPRESOS + REPORTAJES_TV,
    coberturas_genero=8,
    plataformas=4,  # impreso · digital · televisión · redes sociales
)


def compacto(n):
    """362589 → «363K» · 4400 → «4.4K» · 33 → «33»"""
    if n < 1000:
        return str(n)
    valor = n / 1000.0
    if valor >= 100:
        return "%dK" % round(valor)
    return ("%.1f" % valor).replace(".0", "") + "K"


def miles(n):
    """362589 → «362.589» (separador de miles en español)."""
    return "{:,}".format(n).replace(",", ".")


if __name__ == "__main__":
    for clave, valor in sorted(vars(M).items()):
        print("%-22s %s" % (clave, valor))
