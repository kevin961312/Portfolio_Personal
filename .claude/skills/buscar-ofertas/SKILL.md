---
name: buscar-ofertas
description: Búsqueda diaria de ofertas de trabajo para la HV de Laura Hernández. Lanza el workflow orquestado buscar-ofertas (cada agente con su modelo y esfuerzo) y entrega el informe y el Excel del día.
disable-model-invocation: true
argument-hint: "[desde AAAA-MM-DD opcional]"
---

# Búsqueda diaria de ofertas — Laura Hernández

Al invocar este comando, el usuario autoriza ejecutar el workflow `buscar-ofertas`. No pidas confirmación para lanzarlo.

## 1. Fechas
Calcula las fechas con este comando (desde = última ejecución menos 2 días, nunca antes de 30 días atrás; si es la primera vez, 30 días atrás):

```bash
cd /Users/KEPINEDA/Downloads/Portfolio_Personal && python3 -I -c "
from datetime import date, timedelta; from pathlib import Path
hoy=date.today(); p=Path('ofertas/ultima_ejecucion.txt'); tope=hoy-timedelta(days=30)
d=max(date.fromisoformat(p.read_text().strip())-timedelta(days=2), tope) if p.exists() else tope
print(hoy.isoformat(), d.isoformat())"
```

Si el usuario pasó una fecha en `$ARGUMENTS`, úsala como `desde`.

## 2. Navegador
Los agentes de LinkedIn, Instagram, Facebook y X usan el Chrome del usuario con sus sesiones abiertas. Antes de lanzar, carga las herramientas de Claude in Chrome y llama `tabs_context_mcp`:
- Si responde, sigue.
- Si no está conectado, avisa al usuario y pregúntale si quiere abrir Chrome o seguir solo con las fuentes web (en ese caso los agentes de navegador quedarán como "no revisado").

## 3. Lanzar el workflow
`Workflow({ name: "buscar-ofertas", args: { fecha: "<hoy>", desde: "<desde>" } })`

Modelo y esfuerzo de cada agente (definidos en `.claude/workflows/buscar-ofertas.js`, objeto `AGENTES`):

| Agente | Modelo | Esfuerzo | Por qué |
|---|---|---|---|
| LinkedIn (empleos + publicaciones) | Sonnet | medium | Navegador con sesión; búsquedas repetitivas y lectura de fichas |
| Instagram (hashtags) | Sonnet | medium | Límite estricto de llamadas; distinguir Colombia de otros países |
| Facebook + X | Sonnet | medium | Fechas ofuscadas y correos dentro de imágenes |
| Portales de empleo | Sonnet | medium | Muchas fichas, fechas relativas, detectar estafas |
| Webs oficiales de medios (prensa, TV y radio) | Haiku | medium | Lista fija de ~25 plataformas, pero hay que abrir fichas y separar empleos de contrataciones |
| ONG y organismos | Haiku | medium | URLs conocidas; juzgar idioma, modalidad y cierre |
| Verificador | Sonnet | high | Confirma vigencia de las mejores ofertas |
| Consolidador | Opus | high | Duplicados, afinidad final y prioridades |
| Archivos | Haiku | low | Escribir el JSON y correr el script |

Los tres agentes de navegador corren uno detrás de otro (comparten el Chrome); los de web corren en paralelo con ellos.

## 4. Al terminar
Responde al usuario en español, breve:
1. Resumen del día y cuántas ofertas son **nuevas** (no estaban en el historial).
2. Las prioridades, en orden, con cómo aplicar.
3. Tabla de esfuerzo: agente, modelo, esfuerzo asignado, dificultad real y recomendación.
4. Rutas: `ofertas/<fecha>/ofertas_<fecha>.xlsx` e `informe.md`.

Si la tabla de esfuerzo recomienda subir o bajar el modelo o el esfuerzo de un agente, propón el cambio en `AGENTES` de `.claude/workflows/buscar-ofertas.js` y aplícalo solo si el usuario lo aprueba. Si hay `fuentes_nuevas`, ofrece agregarlas a `ofertas/fuentes.md`.

Nunca postules, ni envíes correos o mensajes en nombre de Laura: este comando solo busca.
