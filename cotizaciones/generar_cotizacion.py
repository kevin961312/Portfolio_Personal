"""Genera la cotización del sitio web de Martin Galindo en Excel y PDF.

Uso:  python3 cotizaciones/generar_cotizacion.py
Salida: cotizaciones/<AAAA-MM-DD>/Cotizacion_Web_Martin_Galindo_V<n>.{xlsx,pdf}

Los textos y valores se editan en la sección DATOS. Cada ejecución crea la
versión siguiente sin sobrescribir las anteriores.
"""
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (KeepTogether, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

# ───────────────────────────── DATOS ─────────────────────────────
HOY = date.today()
CLIENTE = "Martin Galindo"
PERFIL_CLIENTE = "Audiovisual · Storytelling · Photography"
SITIO_ACTUAL = "martinphotojournal.wixsite.com/work"
PROVEEDOR = ""          # nombre de quien cotiza; vacío deja la línea para firmar
VALIDEZ_DIAS = 30
PLAZO = "3 semanas a partir del anticipo y de la entrega del material (fotos, textos y enlaces)"
PAGO = "50 % de anticipo al aprobar la cotización y 50 % contra entrega del sitio publicado"
AJUSTES = "2 rondas de ajustes sobre el diseño y el contenido antes de la entrega"

# (sección, subsecciones, qué incluye, valor COP)
ITEMS = [
    ("Diseño y estructura base", "Menú, inicio, pie de página",
     "Adaptación de la arquitectura del portafolio base (React + Vite + TypeScript) "
     "con identidad visual propia, menú por pestañas y diseño adaptable a celular, "
     "tableta y computador.", 150_000),
    ("Sobre mí", "—",
     "Presentación, foto de perfil, trayectoria, enfoque de trabajo y enlaces a redes.",
     80_000),
    ("Instagram", "Reels · Carruseles",
     "Dos vistas: Reels y Carruseles. Las publicaciones se muestran en vivo desde "
     "Instagram con su portada y se abren dentro del sitio, sin salir de la página.",
     180_000),
    ("Producción fotográfica", "Galería de fotos · Corporativo · FotoReportajes",
     "Tres galerías con visor a pantalla completa, navegación entre fotos y "
     "créditos o descripción por imagen.", 220_000),
    ("Reportaje", "—",
     "Página de reportaje con texto, fotos intercaladas y datos de publicación "
     "(medio, fecha, enlace a la nota original).", 120_000),
    ("Contactos", "—",
     "Correo, WhatsApp y redes con botones directos.", 60_000),
    ("Contenido abierto a ítems", "Todas las secciones",
     "Carga inicial de todas las fotos que se necesiten. Cada sección queda abierta: "
     "se agregan fotos, reels, carruseles o reportajes nuevos sumando un ítem a una "
     "lista, sin tocar el diseño.", 70_000),
    ("Despliegue en GitHub Pages", "Publicación y dominio",
     "Publicación del sitio en GitHub Pages (sin costo de hosting) y conexión del "
     "dominio propio cuando el cliente lo adquiera.", 50_000),
    ("Entrega del código y explicación", "Código fuente + guía",
     "Entrega del código completo con su explicación: guía escrita paso a paso y "
     "sesión explicativa sobre cómo agregar contenido y volver a publicar.", 70_000),
]

INCLUYE = [
    "Las 5 pestañas: Sobre mí, Instagram (Reels y Carruseles), Producción fotográfica "
    "(Galería de fotos, Corporativo y FotoReportajes), Reportaje y Contactos.",
    "Se pueden adjuntar todas las fotos que se necesiten; no hay límite de imágenes.",
    "Secciones abiertas a ítems: el contenido crece sin rehacer el sitio.",
    "Despliegue en GitHub Pages, sin costo mensual de hosting.",
    "Entrega del código fuente al cliente con su respectiva explicación (guía escrita "
    "y sesión explicativa).",
    "Diseño adaptable a celular, tableta y computador.",
    AJUSTES + ".",
]

NO_INCLUYE = [
    "Compra y renovación del dominio: corre por cuenta del cliente. El sitio se "
    "conecta al dominio una vez adquirido.",
    "Producción de fotos o videos, redacción de textos y edición de imágenes.",
    "Mantenimiento o carga de contenido nuevo después de la entrega.",
    "Funciones fuera de este alcance (tienda, pagos, blog con comentarios, "
    "panel de administración).",
]

CONDICIONES = [
    ("Valor total", "$1.000.000 COP"),
    ("Forma de pago", PAGO),
    ("Plazo de entrega", PLAZO),
    ("Validez de la oferta", f"{VALIDEZ_DIAS} días calendario desde la fecha de emisión"),
    ("Propiedad", "Al recibir el pago total, el código y el contenido son del cliente."),
]

TOTAL = sum(i[3] for i in ITEMS)
assert TOTAL == 1_000_000, f"El desglose suma {TOTAL:,}, no 1.000.000"

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]
FECHA_TXT = f"{HOY.day} de {MESES[HOY.month - 1]} de {HOY.year}"


def pesos(v: int) -> str:
    return "$" + f"{v:,}".replace(",", ".")


# ─────────────────────────── VERSIONES ───────────────────────────
BASE = Path(__file__).resolve().parent
CARPETA = BASE / HOY.isoformat()
CARPETA.mkdir(parents=True, exist_ok=True)
n = 1
while (CARPETA / f"Cotizacion_Web_Martin_Galindo_V{n}.pdf").exists():
    n += 1
NOMBRE = f"Cotizacion_Web_Martin_Galindo_V{n}"
NUMERO = f"COT-{HOY:%Y%m%d}-V{n}"

# Paleta sobria de fotografía: carbón y un dorado cálido
CARBON = "1E1E1E"
GRIS = "6B6B6B"
CLARO = "F4F1EC"
DORADO = "B8893B"


# ───────────────────────────── EXCEL ─────────────────────────────
def excel():
    wb = Workbook()
    ws = wb.active
    ws.title = "Cotización"
    ws.sheet_view.showGridLines = False
    for col, w in zip("ABCDE", (4, 30, 34, 70, 18)):
        ws.column_dimensions[col].width = w

    fino = Side(style="thin", color="D9D4CC")
    borde = Border(bottom=fino)
    envolver = Alignment(wrap_text=True, vertical="top")

    ws["B2"] = "COTIZACIÓN · SITIO WEB PORTAFOLIO"
    ws["B2"].font = Font(name="Georgia", size=18, bold=True, color=CARBON)
    ws["B3"] = f"{CLIENTE} — {PERFIL_CLIENTE}"
    ws["B3"].font = Font(size=12, color=DORADO, bold=True)

    datos = [("Número", NUMERO), ("Fecha", FECHA_TXT), ("Cliente", CLIENTE),
             ("Sitio actual", SITIO_ACTUAL),
             ("Base técnica", "Portafolio_Personal (React + Vite + TypeScript)"),
             ("Publicación", "GitHub Pages — dominio por cuenta del cliente")]
    for i, (k, v) in enumerate(datos, start=5):
        ws.cell(i, 2, k).font = Font(bold=True, color=GRIS)
        ws.cell(i, 3, v)

    fila = 12
    encabezado = ["Sección (tag)", "Subsecciones", "Qué incluye", "Valor (COP)"]
    for j, t in enumerate(encabezado, start=2):
        c = ws.cell(fila, j, t)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=CARBON)
        c.alignment = Alignment(vertical="center", horizontal="right" if j == 5 else "left")
    ws.row_dimensions[fila].height = 22

    primera = fila + 1
    for k, (sec, sub, desc, val) in enumerate(ITEMS):
        r = primera + k
        ws.cell(r, 2, sec).font = Font(bold=True)
        ws.cell(r, 3, sub)
        ws.cell(r, 4, desc)
        ws.cell(r, 5, val).number_format = '"$"#,##0'
        for j in range(2, 6):
            c = ws.cell(r, j)
            c.alignment = envolver
            c.border = borde
            if k % 2:
                c.fill = PatternFill("solid", fgColor=CLARO)
        ws.row_dimensions[r].height = 48
    ultima = primera + len(ITEMS) - 1

    rt = ultima + 1
    ws.cell(rt, 4, "VALOR TOTAL").font = Font(bold=True, size=12, color=CARBON)
    ws.cell(rt, 4).alignment = Alignment(horizontal="right")
    t = ws.cell(rt, 5, f"=SUM(E{primera}:E{ultima})")
    t.number_format = '"$"#,##0'
    t.font = Font(bold=True, size=12, color="FFFFFF")
    t.fill = PatternFill("solid", fgColor=DORADO)
    ws.row_dimensions[rt].height = 24

    r = rt + 2
    for titulo, lista in (("Incluye", INCLUYE), ("No incluye", NO_INCLUYE)):
        ws.cell(r, 2, titulo).font = Font(name="Georgia", bold=True, size=13, color=DORADO)
        r += 1
        for item in lista:
            ws.cell(r, 2, "•").alignment = Alignment(horizontal="right", vertical="top")
            ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
            c = ws.cell(r, 3, item)
            c.alignment = envolver
            ws.row_dimensions[r].height = 30
            r += 1
        r += 1

    ws.cell(r, 2, "Condiciones").font = Font(name="Georgia", bold=True, size=13, color=DORADO)
    r += 1
    for k, v in CONDICIONES:
        ws.cell(r, 2, k).font = Font(bold=True, color=GRIS)
        ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=5)
        c = ws.cell(r, 3, f"=TEXT(E{rt},\"$#,##0\")&\" COP\"" if k == "Valor total" else v)
        c.alignment = envolver
        r += 1

    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_title_rows = f"{fila}:{fila}"

    destino = CARPETA / f"{NOMBRE}.xlsx"
    wb.save(destino)
    return destino


# ────────────────────────────── PDF ──────────────────────────────
def pdf():
    fuentes = Path("/System/Library/Fonts/Supplemental")
    serif, serif_b = "Times-Roman", "Times-Bold"
    if (fuentes / "Georgia.ttf").exists():
        pdfmetrics.registerFont(TTFont("Georgia", str(fuentes / "Georgia.ttf")))
        pdfmetrics.registerFont(TTFont("Georgia-Bold", str(fuentes / "Georgia Bold.ttf")))
        serif, serif_b = "Georgia", "Georgia-Bold"

    carbon, gris = colors.HexColor("#" + CARBON), colors.HexColor("#" + GRIS)
    claro, dorado = colors.HexColor("#" + CLARO), colors.HexColor("#" + DORADO)

    est = {
        "titulo": ParagraphStyle("t", fontName=serif_b, fontSize=22, leading=26, textColor=carbon),
        "sub": ParagraphStyle("s", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
                              textColor=dorado, spaceAfter=2),
        "h2": ParagraphStyle("h2", fontName=serif_b, fontSize=13.5, leading=17,
                             textColor=carbon, spaceBefore=14, spaceAfter=6),
        "txt": ParagraphStyle("x", fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=carbon),
        "peq": ParagraphStyle("p", fontName="Helvetica", fontSize=8.5, leading=11.5, textColor=carbon),
        "peqb": ParagraphStyle("pb", fontName="Helvetica-Bold", fontSize=8.5, leading=11.5, textColor=carbon),
        "dato": ParagraphStyle("d", fontName="Helvetica", fontSize=8.5, leading=12, textColor=gris),
        "der": ParagraphStyle("r", fontName="Helvetica", fontSize=8.5, leading=11.5,
                              textColor=carbon, alignment=TA_RIGHT),
        "bul": ParagraphStyle("b", fontName="Helvetica", fontSize=9.5, leading=13.5,
                              textColor=carbon, leftIndent=12, bulletIndent=0, spaceAfter=3),
    }

    destino = CARPETA / f"{NOMBRE}.pdf"
    doc = SimpleDocTemplate(str(destino), pagesize=letter, leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=1.8 * cm, bottomMargin=1.8 * cm,
                            title=f"Cotización sitio web — {CLIENTE}", author=PROVEEDOR or "")
    ancho = doc.width
    h = []

    cabecera = Table([[
        [Paragraph("Cotización", est["titulo"]),
         Paragraph("SITIO WEB PORTAFOLIO · " + CLIENTE.upper(), est["sub"])],
        [Paragraph(f"<b>N.º</b> {NUMERO}", est["der"]),
         Paragraph(f"<b>Fecha</b> {FECHA_TXT}", est["der"]),
         Paragraph(f"<b>Validez</b> {VALIDEZ_DIAS} días", est["der"])],
    ]], colWidths=[ancho * 0.62, ancho * 0.38])
    cabecera.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LINEBELOW", (0, 0), (-1, 0), 1.6, dorado),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    h += [cabecera, Spacer(1, 10)]

    info = Table([
        [Paragraph("<b>Cliente</b>", est["dato"]), Paragraph(f"{CLIENTE} — {PERFIL_CLIENTE}", est["peq"])],
        [Paragraph("<b>Sitio actual</b>", est["dato"]), Paragraph(SITIO_ACTUAL, est["peq"])],
        [Paragraph("<b>Base técnica</b>", est["dato"]),
         Paragraph("Portafolio_Personal (React + Vite + TypeScript), adaptado a su marca", est["peq"])],
        [Paragraph("<b>Publicación</b>", est["dato"]),
         Paragraph("GitHub Pages — el dominio corre por cuenta del cliente", est["peq"])],
    ], colWidths=[3 * cm, ancho - 3 * cm])
    info.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0),
                              ("TOPPADDING", (0, 0), (-1, -1), 1.5),
                              ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5)]))
    h.append(info)

    h.append(Paragraph("Propuesta", est["h2"]))
    h.append(Paragraph(
        f"Migrar el portafolio de {CLIENTE} desde Wix a un sitio propio, rápido y sin "
        "publicidad, tomando como base la estructura del portafolio Portafolio_Personal. "
        "El sitio queda organizado en cinco pestañas pensadas para su trabajo audiovisual "
        "y fotográfico, con secciones abiertas a ítems para que pueda seguir sumando fotos "
        "y publicaciones sin rehacer el diseño. Se publica en GitHub Pages, y el código se "
        "le entrega con su respectiva explicación.", est["txt"]))

    h.append(Paragraph("Pestañas del sitio", est["h2"]))
    mapa = [
        ("Sobre mí", ""),
        ("Instagram", "Reels · Carruseles"),
        ("Producción fotográfica", "Galería de fotos · Corporativo · FotoReportajes"),
        ("Reportaje", ""),
        ("Contactos", ""),
    ]
    filas = [[Paragraph(f"<b>{i}. {t}</b>", est["peq"]), Paragraph(s or "—", est["peq"])]
             for i, (t, s) in enumerate(mapa, 1)]
    tabla_mapa = Table(filas, colWidths=[6 * cm, ancho - 6 * cm])
    tabla_mapa.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [claro, colors.white]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    h.append(tabla_mapa)

    h.append(Paragraph("Desglose del valor", est["h2"]))
    blanco = ParagraphStyle("hdr", parent=est["peqb"], textColor=colors.white)
    blanco_der = ParagraphStyle("hdrr", parent=blanco, alignment=TA_RIGHT)
    total_der = ParagraphStyle("tot", parent=blanco_der, fontSize=10, leading=13)
    filas = [[Paragraph("Sección", blanco), Paragraph("Qué incluye", blanco),
              Paragraph("Valor", blanco_der)]]
    for sec, sub, desc, val in ITEMS:
        sub_txt = f"<br/><font color='#{GRIS}'>{sub}</font>" if sub != "—" else ""
        filas.append([Paragraph(f"<b>{sec}</b>{sub_txt}", est["peq"]),
                      Paragraph(desc, est["peq"]), Paragraph(pesos(val), est["der"])])
    filas.append(["", Paragraph("VALOR TOTAL", total_der),
                  Paragraph(f"{pesos(TOTAL)} COP", total_der)])
    desglose = Table(filas, colWidths=[4.6 * cm, ancho - 7.8 * cm, 3.2 * cm], repeatRows=1)
    n_filas = len(filas)
    desglose.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), carbon),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, n_filas - 2), [colors.white, claro]),
        ("LINEBELOW", (0, 1), (-1, n_filas - 2), 0.4, colors.HexColor("#D9D4CC")),
        ("BACKGROUND", (1, n_filas - 1), (-1, n_filas - 1), dorado),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    h.append(desglose)

    for titulo, lista in (("Incluye", INCLUYE), ("No incluye", NO_INCLUYE)):
        bloque = [Paragraph(titulo, est["h2"])]
        bloque += [Paragraph(i, est["bul"], bulletText="•") for i in lista]
        h.append(KeepTogether(bloque))

    cond = [[Paragraph(f"<b>{k}</b>", est["peq"]), Paragraph(v, est["peq"])] for k, v in CONDICIONES]
    tabla_cond = Table(cond, colWidths=[4 * cm, ancho - 4 * cm])
    tabla_cond.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#D9D4CC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    h.append(KeepTogether([Paragraph("Condiciones", est["h2"]), tabla_cond]))

    firmas = Table([
        [Paragraph(PROVEEDOR or " ", est["peq"]), "", Paragraph(CLIENTE, est["peq"])],
        [Paragraph("Desarrollador", est["dato"]), "", Paragraph("Acepto la cotización", est["dato"])],
    ], colWidths=[ancho * 0.42, ancho * 0.16, ancho * 0.42])
    firmas.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (0, 0), 0.8, carbon), ("LINEABOVE", (2, 0), (2, 0), 0.8, carbon),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    h.append(KeepTogether([Spacer(1, 42), firmas]))

    def pie(canvas, d):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(gris)
        canvas.drawString(d.leftMargin, 1.1 * cm, f"{NUMERO} · Cotización sitio web — {CLIENTE}")
        canvas.drawRightString(d.leftMargin + d.width, 1.1 * cm, f"Página {d.page}")
        canvas.restoreState()

    doc.build(h, onFirstPage=pie, onLaterPages=pie)
    return destino


if __name__ == "__main__":
    print(excel())
    print(pdf())
