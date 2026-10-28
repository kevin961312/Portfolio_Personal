# Guía técnica para los agentes de navegador (Claude in Chrome)

Lecciones de la búsqueda del 22-oct-2026. Leer completa antes de empezar.

## Reglas generales
- Cargar las herramientas del navegador en UNA sola llamada ToolSearch (tabs_context_mcp, tabs_create_mcp, tabs_close_mcp, navigate, computer, javascript_tool, get_page_text, browser_batch).
- Llamar tabs_context_mcp con createIfEmpty, crear una pestaña propia y cerrarla al terminar. No tocar pestañas del usuario.
- Solo lectura: nunca hacer clic en "Solicitar", "Postularme", "Aplicar", "Enviar", "Seguir" ni "Unirse"; no comentar, no reaccionar, no escribir mensajes. Expandir "Ver más" está permitido.
- Si un sitio no tiene la sesión iniciada: NO iniciar sesión ni crear cuentas. Anotar "requiere sesión" en la cobertura y seguir.
- Si aparece un captcha: no resolverlo. Anotar y seguir.
- **Salidas largas:** javascript_tool corta la respuesta en ~1.000 caracteres. Para leer mucho texto: guardar resultados en `sessionStorage`, luego reemplazar el body con `<article><pre>` + el texto y leerlo con get_page_text (lee hasta ~50.000 caracteres).
- La salida de javascript_tool a veces queda bloqueada si parece contener cookies o query strings: en ese caso usar el truco de get_page_text.
- Si javascript_tool tarda más de 45 s da timeout: lanzar los bucles largos como `(async()=>{...})()` en segundo plano, guardar en sessionStorage y leer después.

## Correos ocultos (Cloudflare)
Muchas webs (Las2orillas, canales regionales) ocultan los correos: WebFetch muestra "[email protected]", pero con el navegador se pueden leer. En la página, ejecutar:
```js
const dec=h=>{const k=parseInt(h.substr(0,2),16);let s='';for(let i=2;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.substr(i,2),16)^k);return s;};
const E=new Set();
document.querySelectorAll('[data-cfemail]').forEach(e=>E.add(dec(e.getAttribute('data-cfemail'))));
document.querySelectorAll('a[href*="email-protection#"]').forEach(a=>E.add(dec(a.getAttribute('href').split('#')[1])));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>E.add(a.getAttribute('href').slice(7).split('?')[0]));
[...E].join(', ')
```
Para cada correo, leer el texto de alrededor y quedarse solo con los de talento humano, selección o redacción (no jurídicos, PQRS, pauta, facturación ni datos personales).

## LinkedIn
- NO usar la API pública `jobs-guest/...`: da 429 (bloqueo) tras ~20 consultas rápidas. Usar la interfaz con la sesión iniciada.
- Búsqueda de empleos: `https://www.linkedin.com/jobs/search/?keywords=<término>&location=Colombia&f_TPR=r604800` (r604800 = última semana; r2592000 = último mes; r86400 = 24 h). Para Bogotá: `location=Bogot%C3%A1%2C%20Distrito%20Capital%2C%20Colombia`. Siguiente página: `&start=25`.
- Extraer tarjetas (esperar 3 s tras navegar):
  ```js
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for (const li of document.querySelectorAll('li[data-occludable-job-id]')){ li.scrollIntoView(); await sleep(120);}
  const S=JSON.parse(sessionStorage.__li||'{}'); const k=new URL(location.href).searchParams.get('keywords');
  for(const li of document.querySelectorAll('li[data-occludable-job-id]')){const id=li.dataset.occludableJobId; if(!S[id]) S[id]={k,txt:li.innerText.replace(/\n+/g,' · ').slice(0,200)};}
  sessionStorage.__li=JSON.stringify(S); Object.keys(S).length
  ```
- Detalle de una oferta: navegar a `https://www.linkedin.com/jobs/view/<id>/`, esperar 3 s y tomar de `main.innerText` el encabezado (empresa, cargo, "hace X días", modalidad) y el texto desde "Acerca del empleo".
- Publicaciones: `https://www.linkedin.com/search/results/content/?keywords=<texto>&datePosted=%22past-week%22&sortBy=%22date_posted%22`. Hacer scroll por JS (scrollTop de los contenedores con overflow + window.scrollBy, 6 veces con 1,3 s de pausa) y leer `main.innerText`.
- LinkedIn a veces redirige solo a otra página (p. ej. /mynetwork): volver a navegar a la URL.

## Instagram
- **Límite estricto: máximo 40 llamadas a la API por día, con 2 s de pausa entre llamadas. Si una respuesta es 429, PARAR Instagram de inmediato** (el 22-oct se bloqueó tras ~100 llamadas y se arriesga la cuenta de Laura).
- Búsqueda por palabra/hashtag: `https://www.instagram.com/explore/search/keyword/?q=%23vacanteperiodista`. Hacer scroll 4 veces (1,2 s) y recoger enlaces `a[href*="/p/"]`, `a[href*="/reel/"]`.
- La fecha sale del código del post, sin pedir nada a Instagram:
  ```js
  const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const sc2id=sc=>{let id=0n; for(const ch of sc.slice(0,11)) id=id*64n+BigInt(A.indexOf(ch)); return id;};
  const fecha=sc=>new Date(Number(sc2id(sc)>>23n)+1314220021721).toISOString().slice(0,10);
  ```
  Filtrar por fecha ANTES de pedir el texto, y pedir texto solo de los posts dentro de la ventana.
- Texto del post (cuenta como 1 llamada): `fetch('/api/v1/media/'+sc2id(sc)+'/info/',{headers:{'X-IG-App-ID':'936619743392459','X-Requested-With':'XMLHttpRequest'},credentials:'include'})` → `items[0].caption.text`, `items[0].user.username`, `items[0].location.name`.
- La mayoría de resultados de hashtags son de otros países (México, Chile, Perú, Argentina): quedarse con los que mencionan Colombia, ciudades colombianas, celulares 3xx, dominios .co o pesos.
- No revisar cuentas una por una (gasta llamadas).

## Facebook
- Búsqueda de publicaciones: `https://www.facebook.com/search/posts/?q=<texto>` (con barra antes de `?`).
- Hacer scroll 8 veces (1,5 s), hacer clic por JS en los botones "Ver más"/"See more" (solo expanden texto) y leer `[role="feed"].innerText`.
- Las fechas no salen en el texto (están ofuscadas): para las ofertas que interesen, hacer una búsqueda específica y tomar captura con zoom sobre el encabezado del post para leer la fecha. Los correos suelen estar dentro de la imagen: usar zoom sobre la imagen.
- Muchas publicaciones son reposts viejos (2023, julio...): verificar siempre la fecha.

## X (Twitter)
- Búsqueda: `https://x.com/search?q=<consulta>&f=live` con `since:AAAA-MM-DD` dentro de la consulta.
- Extraer: `article[data-testid="tweet"]` → enlace `/status/<id>`, `time[datetime]`, `[data-testid="tweetText"]`. Scroll 10–12 veces (1,5 s).
- Consulta general:
  `(buscamos OR vacante OR convocatoria OR "estamos contratando" OR "estamos buscando") (periodista OR redactor OR redactora OR reportera OR reportero OR "community manager" OR "comunicador social" OR "comunicadora social") ("hoja de vida" OR HV OR CV OR postula OR envía) since:<desde> lang:es`
- Consulta Colombia:
  `(vacante OR convocatoria OR buscamos OR "hoja de vida") (periodista OR redactor OR "community manager" OR "comunicador social" OR comunicaciones) (Bogotá OR Colombia OR #TrabajoSíHay) since:<desde>`
- Cuentas de medios (dos tandas con `from:` unidos por OR + `(vacante OR convocatoria OR buscamos OR "hoja de vida" OR "trabaja con nosotros" OR únete) since:<desde>`):
  - Tanda 1: ELTIEMPO, elespectador, RevistaSemana, CambioColombia, lasillavacia, NoticiasCaracol, CaracolTV, NoticiasRCN, CanalRCN, Canal1Colombia, CanalCapital, senalcolombia, RTVCco, BluRadioCo, Caracol_Radio, WRadioColombia, lafm, RCNRadio, NTN24, PublimetroCol, pulzo, KienyKe, las2orillas, ElNuevoSiglo, elcolombiano, elpaiscali, elheraldoco
  - Tanda 2: voragine_co, MutanteOrg, BaudoAP, cerosetenta, RutasConflicto, VerdadAbierta, ColombiaCheck, LigaContraSilencio, RazonPublica, InfobaeColombia, Colprensa, CanalTrece, RadNalCo, eluniversalctg, vanguardiacom, teleantioquia, telepacifico, revistavolcanicas, cuestion_p, ConsejoRedaccion, FundacionGabo, FLIP_org, Dejusticia, SismaMujer, Indepaz, ideaspaz, TembloresOng
  - Tanda 3 (TV y radio; sin la palabra "convocatoria", que trae fútbol y becas): `(from:RedMasNoticias OR from:CABLENOTICIAS OR from:WinSportsTV OR from:TropiBogota OR from:CanalTRO OR from:Teleantioquia OR from:TPNoticias_ OR from:CanalCapital OR from:CanalTreceCO OR from:RadNalCo) (vacante OR "hoja de vida" OR "trabaja con nosotros" OR "estamos contratando") since:<desde>`
- Ojo: "RTVC" en X es también la televisión canaria (España). La mayoría de resultados generales son de otros países.

## LinkedIn por empresa (TV y radio)
- Una búsqueda de empleos por empresa, con f_TPR=r604800: "Caracol Televisión", "Canal RCN", "NTN24", "Claro Colombia" (solo cargos de noticias o contenido), "Caracol Radio", "RTVC".
- Si LinkedIn muestra "No se han encontrado empleos", la lista de abajo es de "Empleos que podrían interesarte" (relleno): no la reportes.
- LinkedIn no entiende OR en el buscador de empleos: una empresa por búsqueda.
- RCN publica sus vacantes en LinkedIn y en publicaciones de su coordinación de selección: buscar también en publicaciones "RCN Televisión vacante" y "Noticias Caracol vacante".
