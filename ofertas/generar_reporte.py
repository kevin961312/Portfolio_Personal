"""Genera el informe diario de ofertas a partir de <dia>/final.json.

Uso: python3 generar_reporte.py ofertas/AAAA-MM-DD

Escribe en la carpeta del día: informe.md, un CSV por pestaña y ofertas.xlsx
(una pestaña por CSV). Actualiza ofertas/historial.csv,
ofertas/contactos.csv y ofertas/ultima_ejecucion.txt.
"""
import csv
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

CATEGORIAS = [
    ("bogota", "Bogotá y remoto CO"),
    ("fecha_no_verificada", "Fecha no verificada"),
    ("remota_internacional", "Remotas internacionales"),
    ("fuera_bogota", "Fuera de Bogotá"),
]
# Laura ya tiene título: prácticas, pasantías y becas no se muestran.
NO_PRACTICAS = re.compile(r"pr[aá]ctica|practicante|pasant|\bbecas?\b|fellow|aprendiz|\binternship\b", re.I)
COLS_OFERTA = [
    ("estado", "Estado"), ("fecha_pub", "Fecha pub."), ("cargo", "Cargo"),
    ("empresa", "Empresa"), ("ciudad_modalidad", "Ciudad / modalidad"),
    ("donde", "Dónde se encontró"), ("enlace", "Enlace"), ("hv", "HV"),
    ("afinidad", "Afinidad"), ("razon", "Razón"), ("como_aplicar", "Cómo aplicar"),
    ("correo", "Correo"), ("cierre", "Cierre"), ("salario", "Salario"),
    ("alertas", "Alertas"), ("verificacion", "Verificación"),
]
COLS_CONTACTO = [
    ("organizacion", "Organización"), ("persona", "Persona / área"), ("cargo", "Cargo"),
    ("tipo", "Tipo"), ("correo", "Correo"), ("url", "URL donde aparece"), ("hv", "HV sugerida"),
    ("primera_vez", "Primera vez"), ("ultima_vez", "Última vez vista"),
]
COLS_CONTACTO_HOJA = [("nuevo", "¿Nuevo hoy?")] + COLS_CONTACTO
COLS_ESFUERZO = [
    ("agente", "Agente"), ("modelo", "Modelo"), ("esfuerzo_asignado", "Esfuerzo asignado"),
    ("fuentes_revisadas", "Fuentes revisadas"), ("bloqueos", "Bloqueos"),
    ("dificultad", "Dificultad real"), ("recomendacion", "Recomendación"),
    ("porque_asignado", "Por qué ese modelo"),
]
HIST_COLS = ["clave", "primera_vez", "fecha_pub", "cargo", "empresa", "ciudad_modalidad",
             "enlace", "hv", "afinidad", "categoria", "cierre"]


def clave(o):
    enlace = (o.get("enlace") or "").strip()
    if enlace.startswith("http"):
        u = urlparse(enlace)
        q = parse_qs(u.query)
        keep = next((f"{k}={q[k][0]}" for k in ("jk", "id") if k in q), "")
        path = re.sub(r"/+$", "", u.path)
        return f"{u.netloc.lower().removeprefix('www.')}{path}{'?' + keep if keep else ''}"
    texto = f"{o.get('empresa', '')}|{o.get('cargo', '')}".lower()
    return re.sub(r"\s+", " ", texto).strip()


def leer_csv(p):
    if not p.exists():
        return []
    with open(p, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def escribir_csv(p, cols, filas):
    with open(p, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow([t for _, t in cols])
        for r in filas:
            w.writerow([str(r.get(k, "") if r.get(k) is not None else "") for k, _ in cols])


def hoja(wb, titulo, cols, filas):
    ws = wb.create_sheet(titulo[:31])
    ws.append([t for _, t in cols])
    for r in filas:
        ws.append([str(r.get(k, "") if r.get(k) is not None else "") for k, _ in cols])
    head = Font(name="Arial", bold=True, color="FFFFFF")
    fill = PatternFill("solid", fgColor="4B2A84")
    body = Font(name="Arial", size=10)
    link = Font(name="Arial", size=10, color="0563C1", underline="single")
    for c in ws[1]:
        c.font, c.fill = head, fill
        c.alignment = Alignment(wrap_text=True, vertical="center")
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.font = body
            c.alignment = Alignment(wrap_text=True, vertical="top")
            if isinstance(c.value, str) and re.match(r"^https?://\S+$", c.value):
                c.hyperlink, c.font = c.value, link
    for i, (_, t) in enumerate(cols, 1):
        largo = max([len(t)] + [len(str(r.get(cols[i - 1][0], "") or "")) for r in filas])
        ws.column_dimensions[get_column_letter(i)].width = max(8, min(largo + 2, 45))
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions


def tabla_md(cols, filas):
    if not filas:
        return "_Sin filas._\n"
    out = ["| " + " | ".join(t for _, t in cols) + " |", "|" + "---|" * len(cols)]
    for r in filas:
        out.append("| " + " | ".join(str(r.get(k, "") or "").replace("|", "/") for k, _ in cols) + " |")
    return "\n".join(out) + "\n"


def tipo_contacto(c):
    if (c.get("correo") or "").strip():
        return "Correo"
    url = (c.get("url") or "").lower()
    if "linkedin.com/in/" in url:
        return "LinkedIn"
    if "instagram.com" in url or "facebook.com" in url or "x.com" in url:
        return "Red social"
    return "Formulario / web"


def compactar_contactos(previos, nuevos, hoy):
    """Une todos los contactos en una sola lista sin duplicados (clave: correo, o URL si no hay correo)."""
    out, ultima_url = {}, {}
    def clave_c(c):
        return ((c.get("correo") or "").strip() or (c.get("url") or "").strip()).lower()
    for origen, filas in (("previo", previos), ("hoy", nuevos)):
        for c in filas:
            c = {k: (str(v).strip() if v is not None else "") for k, v in c.items()}
            org = c.get("organizacion", "")
            if c.get("url", "").lower() in ("ídem", "idem", ""):
                c["url"] = ultima_url.get(org, c.get("url", ""))
            elif c.get("url"):
                ultima_url[org] = c["url"]
            if NO_PRACTICAS.search(f"{c.get('persona', '')} {c.get('cargo', '')}") and \
                    re.search(r"solo para pasant|solo pr[aá]ctic", f"{c.get('persona', '')} {c.get('cargo', '')}", re.I):
                continue
            if (c.get("correo") or "").lower().startswith("pasantias@"):
                continue
            k = clave_c(c)
            if not k:
                continue
            if k in out:
                viejo = out[k]
                for campo in ("persona", "cargo", "hv", "url"):
                    if not viejo.get(campo) and c.get(campo):
                        viejo[campo] = c[campo]
                if origen == "hoy":
                    viejo["ultima_vez"] = hoy
                continue
            c["primera_vez"] = c.get("primera_vez") or hoy
            c["ultima_vez"] = hoy if origen == "hoy" else (c.get("ultima_vez") or c["primera_vez"])
            c["tipo"] = tipo_contacto(c)
            out[k] = c
    return out


def main(dia_dir):
    dia = Path(dia_dir)
    base = dia.parent
    data = json.loads((dia / "final.json").read_text(encoding="utf-8"))
    hoy = data["fecha"]
    limite = (date.fromisoformat(hoy) - timedelta(days=30)).isoformat()

    hist_path = base / "historial.csv"
    historial = {r["clave"]: r for r in leer_csv(hist_path)}

    ofertas = [o for o in data.get("ofertas", [])
               if o.get("categoria") != "practicas" and not NO_PRACTICAS.search(o.get("cargo") or "")]
    ofertas = sorted(ofertas, key=lambda o: str(o.get("fecha_pub") or "").lstrip("≈"), reverse=True)
    ofertas.sort(key=lambda o: int(o.get("afinidad") or 0), reverse=True)
    for o in ofertas:
        k = clave(o)
        o["clave"] = k
        visto = historial.get(k, {}).get("primera_vez")
        o["estado"] = "NUEVA" if not visto or visto == hoy else f"Vista desde {visto}"
        if o.get("fecha_aprox") and o.get("fecha_pub") and not str(o["fecha_pub"]).startswith("≈"):
            o["fecha_pub"] = f"≈{o['fecha_pub']}"
        if k not in historial:
            historial[k] = {c: o.get(c, "") for c in HIST_COLS if c not in ("clave", "primera_vez")}
            historial[k].update(clave=k, primera_vez=hoy,
                                fecha_pub=str(o.get("fecha_pub", "")).lstrip("≈"))
    nuevas = [o for o in ofertas if o["estado"] == "NUEVA"]

    cont_path = base / "contactos.csv"
    contactos = compactar_contactos(leer_csv(cont_path), data.get("contactos", []), hoy)
    contactos_hoy = [c for c in contactos.values() if c.get("primera_vez") == hoy]
    todos_contactos = sorted(contactos.values(),
                             key=lambda c: (c.get("primera_vez") != hoy, (c.get("organizacion") or "").lower()))
    for c in todos_contactos:
        c["nuevo"] = "NUEVO" if c.get("primera_vez") == hoy else ""

    acumulado = [r for r in historial.values()
                 if (r.get("fecha_pub") or r.get("primera_vez") or "") >= limite
                 and r.get("categoria") != "practicas" and not NO_PRACTICAS.search(r.get("cargo") or "")]
    acumulado.sort(key=lambda r: (r.get("fecha_pub") or r.get("primera_vez") or ""), reverse=True)
    cols_acum = [("primera_vez", "Primera vez"), ("fecha_pub", "Fecha pub."), ("cargo", "Cargo"),
                 ("empresa", "Empresa"), ("ciudad_modalidad", "Ciudad / modalidad"), ("enlace", "Enlace"),
                 ("hv", "HV"), ("afinidad", "Afinidad"), ("categoria", "Categoría"), ("cierre", "Cierre")]

    pestañas = [("Nuevas hoy", "nuevas", COLS_OFERTA, nuevas)]
    for cat, titulo in CATEGORIAS:
        pestañas.append((titulo, cat, COLS_OFERTA, [o for o in ofertas if o.get("categoria") == cat]))
    pestañas += [
        ("Contactos", "contactos", COLS_CONTACTO_HOJA, todos_contactos),
        ("Acumulado 30 días", "acumulado_30_dias", cols_acum, acumulado),
        ("Esfuerzo agentes", "esfuerzo_agentes", COLS_ESFUERZO, data.get("esfuerzo", [])),
    ]

    wb = Workbook()
    wb.remove(wb.active)
    for titulo, slug, cols, filas in pestañas:
        escribir_csv(dia / f"{slug}.csv", cols, filas)
        hoja(wb, titulo, cols, filas)
    wb.save(dia / f"ofertas_{hoy}.xlsx")

    # Archivo maestro de contactos: uno solo, se actualiza en cada búsqueda.
    wbc = Workbook()
    wbc.remove(wbc.active)
    hoja(wbc, "Contactos", COLS_CONTACTO_HOJA, todos_contactos)
    wbc.save(base / "Contactos_Laura.xlsx")

    md = [f"# Ofertas para Laura Hernández — {hoy}", "",
          f"Ventana de búsqueda: desde {data.get('desde', '')}. Solo búsqueda: no se postuló ni se envió nada.", "",
          "## Resumen", "", data.get("resumen", ""), "", "## Prioridades", ""]
    md += [f"{i}. {p}" for i, p in enumerate(data.get("prioridades", []), 1)]
    md += ["", f"## Nuevas hoy ({len(nuevas)})", "",
           tabla_md([c for c in COLS_OFERTA if c[0] in ("fecha_pub", "cargo", "empresa", "ciudad_modalidad",
                                                         "enlace", "hv", "afinidad", "como_aplicar", "cierre")], nuevas),
           "## Conteo por pestaña", ""]
    md += [f"- {t}: {len(f)}" for t, _, _, f in pestañas]
    md += ["", f"## Contactos nuevos hoy ({len(contactos_hoy)} de {len(contactos)} acumulados)", "",
           tabla_md([c for c in COLS_CONTACTO if c[0] in ("organizacion", "persona", "correo", "url", "hv")], contactos_hoy)]
    md += ["", "## Cobertura", "", tabla_md([("fuente", "Fuente"), ("estado", "Estado"), ("nota", "Nota")],
                                            data.get("cobertura", [])),
           "## Esfuerzo por agente", "", tabla_md(COLS_ESFUERZO, data.get("esfuerzo", [])),
           "## Descartadas", "", tabla_md([("cargo", "Cargo"), ("empresa", "Empresa"), ("motivo", "Motivo")],
                                          data.get("descartadas", []))]
    (dia / "informe.md").write_text("\n".join(md), encoding="utf-8")

    with open(hist_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=HIST_COLS, extrasaction="ignore")
        w.writeheader()
        w.writerows(historial.values())
    with open(cont_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=[k for k, _ in COLS_CONTACTO], extrasaction="ignore")
        w.writeheader()
        w.writerows(contactos.values())
    (base / "ultima_ejecucion.txt").write_text(hoy + "\n", encoding="utf-8")

    print(json.dumps({"ofertas": len(ofertas), "nuevas": len(nuevas), "contactos_nuevos": len(contactos_hoy),
                      "contactos_total": len(contactos), "contactos_xlsx": str(base / "Contactos_Laura.xlsx"),
                      "xlsx": str(dia / f"ofertas_{hoy}.xlsx"), "informe": str(dia / "informe.md")},
                     ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1])
