/* ──────────────────────────────────────────────────────────────
   Genera los tres PDF de la Hoja de Vida imprimiendo el HTML con
   Chrome headless (el mismo motor con el que se hicieron los
   originales: Producer «Skia/PDF»).

       node hv/generar.mjs

   Salida: los tres CV_Laura_Hernandez_*.pdf en la raíz del repo.
   ────────────────────────────────────────────────────────────── */

import { execFile } from 'node:child_process';
import { mkdtemp, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { HOJAS } from './datos.mjs';
import { construirHtml, urlPerfil } from './plantilla.mjs';

const ejecutar = promisify(execFile);
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CHROME =
  process.env.CHROME_BIN ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const trabajo = await mkdtemp(join(tmpdir(), 'hv-'));

try {
  for (const hoja of HOJAS) {
    const rutaHtml = join(trabajo, `${hoja.perfil}.html`);
    const rutaPdf = join(RAIZ, hoja.archivo);

    await writeFile(rutaHtml, construirHtml(hoja), 'utf8');

    await ejecutar(CHROME, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--generate-pdf-document-outline',
      `--print-to-pdf=${rutaPdf}`,
      `file://${rutaHtml}`,
    ]);

    const { size } = await stat(rutaPdf);
    console.log(`✓ ${hoja.archivo.padEnd(46)} ${(size / 1024).toFixed(0).padStart(4)} KB   →  ${urlPerfil(hoja.perfil)}`);
  }
} finally {
  await rm(trabajo, { recursive: true, force: true });
}
