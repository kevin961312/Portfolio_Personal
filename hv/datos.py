# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════╗
║  CONTENIDO DE LAS TRES HOJAS DE VIDA — ESTE ES EL ARCHIVO A EDITAR   ║
╚══════════════════════════════════════════════════════════════════════╝

Cambia aquí los textos y luego ejecuta:

    ./hv/generar.sh

Fuente de verdad: la web. La experiencia, la educación y las referencias
salen de `src/pages/SobreMiPage.tsx`; el rol, el «sobre mí» y las
habilidades, de `src/data/perfiles.ts`. Si cambia la web, cambia aquí.

Las cifras NO se escriben a mano: `M` las calcula desde `src/data/*.ts`
igual que el sitio (ver `hv/metricas.py`). Para usarlas en un texto:

    f"{M.reels} Reels con una media de {miles(M.media_reels)} interacciones"

Secciones opcionales de cada hoja:
  · `metricas`   — el recuadro de cifras. Si la hoja no la trae, no se imprime.
  · `destacados` — el bloque «Trabajo destacado». Hoy ninguna lo trae (se
                   quitó de los PDF); para devolverlo, añade la lista a la
                   hoja que quieras. En la web sigue estando.
"""

from metricas import M, compacto, miles  # noqa: F401  (miles se usa al editar)

SITIO = "https://kevin961312.github.io/Portfolio_Personal/"


# ─────────────────────────────────────────────────────────────────────
#  Datos comunes a las tres hojas
# ─────────────────────────────────────────────────────────────────────
COMUN = {
    "nombre": "LAURA HERNÁNDEZ",
    "nombre_completo": "Laura Viviana Hernández Martin",

    # Los mismos contactos que muestra la web en «Sobre mí».
    "telefono": "3222448811",
    "correo": "laurahernandezfcb@hotmail.com",
    "ubicacion": "Bogotá",

    "educacion": [
        {
            "periodo": "2025 – 2026",
            "titulo": "Programa de la Escuela de Periodismo Multimedia EL TIEMPO",
            "institucion": "El Tiempo",
        },
        {
            "periodo": "2024",
            "titulo": "Diplomado en Reportería y presentación de noticias con énfasis "
                      "en periodismo judicial y político",
            "institucion": "Universidad Cooperativa de Colombia",
        },
        {
            "periodo": "2021 – 2026",
            "titulo": "Comunicación Social",
            "institucion": "Universidad Cooperativa de Colombia",
        },
    ],

    # Experiencia y proyectos son comunes a los tres perfiles; lo único que
    # cambia es el cargo, que cada hoja resuelve en su diccionario `cargos`.
    "experiencia": [
        {
            "periodo": "2026 – Actualmente",
            "empresa": "Cuestión Pública",
            "items": [
                "Análisis y selección de temas para creación de parrillas de contenido.",
                "Pre producción, producción, edición y publicación de carruseles, reels e "
                "historias para Instagram.",
                "Seguimiento de resultados y creación de estrategia.",
            ],
        },
        {
            "periodo": "2025 – 2026",
            "empresa": "No Es Hora de Callar · Casa Editorial El Tiempo",
            "items": [
                "Investigación y redacción de notas periodísticas para el periódico digital e impreso.",
                "Creación de parrillas de contenido, carruseles, reels e historias para Instagram.",
                "Producción, pietaje y pasos en cámara para programa televisivo.",
            ],
        },
        {
            "periodo": "2025 – 2026",
            "empresa": "Escuela de Periodismo Multimedia El Tiempo",
            "items": [
                "Investigación y redacción de notas periodísticas para el periódico digital e impreso.",
                "Cobertura fotográfica y en video de conciertos y eventos.",
                "Producción de nota periodística para televisión.",
            ],
        },
    ],

    "proyectos": [
        {
            "periodo": "2024 – 2025",
            "empresa": "Ventana U",
            "items": [
                "Realización de notas en video y escritas para este periódico universitario.",
                "Trabajo de producción, edición y presentación de eventos.",
            ],
        },
        {
            "periodo": "2024",
            "empresa": "Capital Enigma",
            "items": [
                "Investigación periodística para creación de contenido en redes sociales "
                "sobre casos judiciales mediáticos.",
            ],
        },
    ],

    "referencias": [
        {
            "nombre": "Carlos Solano",
            "cargo": "Director de Escuela de Periodismo Multimedia EL TIEMPO y Editor de Podcasts",
            "telefono": "320 865 1735",
            "correo": "carsol@eltiempo.com",
        },
        {
            "nombre": "Abrahán Gutiérrez Navarro",
            "cargo": "Periodista y Publicista",
            "telefono": "316 981 2674",
        },
    ],

    # Cierre de la carta de presentación: viene de la HV original.
    "cierre": "Destaco por mi creatividad, curiosidad, aprendizaje continuo y "
              "habilidades de liderazgo.",
}


# ─────────────────────────────────────────────────────────────────────
#  Las tres hojas
# ─────────────────────────────────────────────────────────────────────
HOJAS = [

    # ═══════════════════ Comunicadora Social ═══════════════════
    {
        "perfil": "comunicadora",
        "archivo": "CV_Laura_Hernandez_Comunicadora_Social.pdf",
        "titulo_doc": "CV Laura Hernández — Comunicadora Social",
        "rol": "Comunicadora Social",
        "subrol": "Estratega Transmedia",
        "perfil_texto": [
            "Comunicadora Social con una visión integral del ecosistema de medios: "
            "desarrollo una idea central y la adapto estratégicamente a cada plataforma, "
            "formato y audiencia.",
            "He trabajado el mismo tema como nota de prensa impresa, artículo digital, "
            "pieza para redes sociales y contenido para televisión en Cuestión Pública y "
            "la Casa Editorial EL TIEMPO. Mi portafolio acredita un ejercicio transmedia "
            "real, con piezas verificables en cada formato.",
            "Aporto pensamiento estratégico, oratoria y paso en cámara, y una comunicación "
            "con enfoque de derechos orientada a construir relación y confianza con las "
            "audiencias.",
        ],
        "metricas_titulo": "Alcance",
        "metricas": [
            {"valor": str(M.plataformas), "etiqueta": "Plataformas gestionadas"},
            {"valor": compacto(M.interacciones) + "+", "etiqueta": "Interacciones digitales"},
            {"valor": str(M.prensa), "etiqueta": "Publicaciones en prensa"},
            {"valor": compacto(M.mediana), "etiqueta": "Promedio por pieza"},
        ],
        "habilidades": [
            {"nombre": "Redacción y ortografía", "nivel": 96},
            {"nombre": "Producción audiovisual", "nivel": 96},
            {"nombre": "Narrativas transmedia", "nivel": 90},
            {"nombre": "Estrategia de contenidos", "nivel": 88},
            {"nombre": "Investigación", "nivel": 85},
            {"nombre": "Relación con audiencias", "nivel": 85},
            {"nombre": "Oratoria y presentación", "nivel": 80},
        ],
        "herramientas": ["CapCut", "Canva", "Instagram Insights", "Producción de TV",
                         "Fotografía y video"],
        "cargos": {
            "Cuestión Pública": "Estratega de contenidos digitales",
            "No Es Hora de Callar · Casa Editorial El Tiempo":
                "Comunicadora social · Producción transmedia",
            "Escuela de Periodismo Multimedia El Tiempo": "Comunicadora multimedia",
            "Ventana U": "Periodista · Producción y presentación de eventos",
            "Capital Enigma": "Investigadora periodística",
        },
    },

    # ═══════════════════ Periodista Multimedia ═══════════════════
    {
        "perfil": "periodista",
        "archivo": "CV_Laura_Hernandez_Periodista_Multimedia.pdf",
        "titulo_doc": "CV Laura Hernández — Periodista Multimedia",
        "rol": "Periodista Multimedia",
        "subrol": "Investigadora",
        "perfil_texto": [
            "Periodista multimedia e investigadora, formada en Comunicación Social y en la "
            "Escuela de Periodismo Multimedia de EL TIEMPO, con diplomado en reportería y "
            "presentación de noticias, con énfasis en periodismo judicial y político.",
            "Mi trabajo ha sido publicado en eltiempo.com y en la edición impresa de EL "
            "TIEMPO, además de contar con un reportaje audiovisual emitido por Canal CityTV. "
            "Tengo experiencia en reportería, investigación periodística y cobertura de temas "
            "de interés público, con manejo de fuentes oficiales, testimoniales, "
            "institucionales y expertas.",
            "También cubro temas de cultura y ciudad, y desarrollo contenidos para prensa "
            "escrita, plataformas digitales y televisión, adaptando la información a distintos "
            "formatos y audiencias.",
        ],
        "metricas_titulo": "Trabajo publicado",
        "metricas": [
            {"valor": str(M.piezas_periodisticas), "etiqueta": "Piezas periodísticas"},
            {"valor": str(M.digitales), "etiqueta": "Artículos en eltiempo.com"},
            {"valor": str(M.coberturas_genero), "etiqueta": "Coberturas de género y DD.HH."},
            {"valor": str(M.reportajes_tv), "etiqueta": "Reportaje emitido en TV"},
        ],
        "habilidades": [
            {"nombre": "Redacción y ortografía", "nivel": 96},
            {"nombre": "Edición de video / CapCut", "nivel": 96},
            {"nombre": "Investigación y verificación", "nivel": 90},
            {"nombre": "Reportería en terreno", "nivel": 88},
            {"nombre": "Periodismo judicial y político", "nivel": 86},
            {"nombre": "Enfoque de género y DD.HH.", "nivel": 86},
            {"nombre": "Producción para televisión", "nivel": 84},
        ],
        "herramientas": ["CapCut", "Canva", "Fotografía y video",
                         "Entrevista en profundidad", "Paso en cámara"],
        "cargos": {
            "Cuestión Pública": "Periodista · Contenido investigativo para audiencias digitales",
            "No Es Hora de Callar · Casa Editorial El Tiempo": "Periodista con enfoque de género",
            "Escuela de Periodismo Multimedia El Tiempo": "Reportera multimedia",
            "Ventana U": "Periodista",
            "Capital Enigma": "Investigadora periodística",
        },
    },

    # ═══════════════════ Community Manager ═══════════════════
    {
        "perfil": "community-manager",
        "archivo": "CV_Laura_Hernandez_Community_Manager.pdf",
        "titulo_doc": "CV Laura Hernández — Community Manager",
        "rol": "Community Manager",
        "subrol": "Digital Content Strategist",
        "perfil_texto": [
            "Community Manager y creadora de contenido digital con formación en Comunicación "
            "Social y experiencia en el manejo de redes sociales de medios periodísticos de "
            "alto impacto: Cuestión Pública y Casa Editorial EL TIEMPO.",
            "Diseño parrillas de contenido a partir del análisis y selección de temas, y "
            "ejecuto el ciclo completo de producción: preproducción, grabación, edición en "
            "CapCut, diseño en Canva, redacción de copys y publicación de Reels, carruseles "
            "e historias.",
            "Trabajo con enfoque en datos: hago seguimiento de resultados en Instagram "
            "Insights y ajusto la estrategia de contenidos según el rendimiento real de "
            "cada formato.",
        ],
        # Sin `metricas`: esta hoja no lleva el recuadro de cifras.
        "habilidades": [
            {"nombre": "Edición de video (Reels)", "nivel": 96},
            {"nombre": "Copywriting y ganchos", "nivel": 92},
            {"nombre": "Parrillas de contenido", "nivel": 90},
            {"nombre": "Diseño de carruseles", "nivel": 88},
            {"nombre": "Analítica y métricas", "nivel": 85},
            {"nombre": "Storytelling / guion", "nivel": 85},
            {"nombre": "Community management", "nivel": 82},
        ],
        "herramientas": ["CapCut", "Canva", "Instagram Reels", "Meta Business Suite",
                         "Instagram Insights"],
        "cargos": {
            "Cuestión Pública": "Community Manager · Creadora de contenido digital",
            "No Es Hora de Callar · Casa Editorial El Tiempo":
                "Creadora de contenido digital · Producción audiovisual",
            "Escuela de Periodismo Multimedia El Tiempo":
                "Reportera multimedia · Contenido para plataformas digitales",
            "Ventana U": "Periodista · Producción y presentación",
            "Capital Enigma": "Investigadora periodística para redes sociales",
        },
    },
]
