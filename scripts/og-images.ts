/**
 * Generates the link-preview images (WhatsApp / Facebook / X) into public/og/:
 *   home.jpg       — site preview
 *   <event-id>.jpg — one per event
 * 1200×630 JPEG (the large-card size every platform supports), well under WhatsApp's ~600 KB limit.
 *
 * Re-run after changing events or photos:
 *   npx -y -p playwright@1 -p tsx tsx scripts/og-images.ts
 * (Set PLAYWRIGHT_MODULE / CHROMIUM_PATH to use an existing Playwright install or browser.)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { formatEventDates } from "../src/dates"
import { events, type SiteEvent } from "../src/data"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const out = resolve(root, "public/og")
const fileUrl = (p: string) => pathToFileURL(resolve(root, p)).href
/** "/assets/x.png" (app path) → file URL of public/assets/x.png */
const photo = (appPath: string) => fileUrl(`public/assets/${appPath.split("/assets/")[1]}`)
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const css = `
  @font-face { font-family: Assistant; font-weight: 200 800; src: url(${fileUrl("src/fonts/assistant-hebrew-wght-normal.woff2")}) format("woff2"); unicode-range: U+0590-05FF, U+FB1D-FB4F, U+05F3, U+05F4; }
  @font-face { font-family: Assistant; font-weight: 200 800; src: url(${fileUrl("src/fonts/assistant-latin-wght-normal.woff2")}) format("woff2"); }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; }
  body { background: #f4efeb; color: #221e1b; font-family: Assistant, sans-serif; direction: rtl; }
  .frame { position: absolute; inset: 0; padding: 56px; display: flex; gap: 56px; align-items: center; }
  .text { flex: 1; min-width: 0; display: flex; flex-direction: column; height: 100%; }
  .logo { height: 72px; width: auto; align-self: flex-start; }
  .photo { flex: none; border-radius: 32px; object-fit: cover; box-shadow: 0 2px 4px rgba(45,38,30,.06), 0 12px 32px -8px rgba(45,38,30,.18); }
  .muted { color: #6b645c; }
  .accent { color: #8c442d; }
  .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`

function homeHtml(): string {
  const a = events["yoga-by-the-sea"].image
  const b = events["sound-meditation"].image
  return `<!doctype html><html lang="he"><head><meta charset="utf-8"><style>${css}
    .stack { display: flex; flex-direction: column; gap: 24px; }
    .stack .photo { width: 520px; height: 247px; }
  </style></head><body><div class="frame">
    <div class="text" style="justify-content:center">
      <img class="logo" style="height:104px" src="${fileUrl("public/assets/77585.png")}">
      <p style="margin-top:40px;font-size:52px;font-weight:700;line-height:1.15">אירועי וולנס, סדנאות<br>וריטריטים מכל הארץ</p>
      <p class="muted" style="margin-top:20px;font-size:34px;line-height:1.3">מרוכזים במקום אחד — כדי שיהיה קל<br>למצוא את מה שמתאים לכם.</p>
    </div>
    <div class="stack"><img class="photo" src="${photo(a)}"><img class="photo" src="${photo(b)}"></div>
  </div></body></html>`
}

function eventHtml(e: SiteEvent): string {
  const date = formatEventDates(e.dates, "long")
  const when = [date, e.time].filter(Boolean).join(" · ")
  return `<!doctype html><html lang="he"><head><meta charset="utf-8"><style>${css}
    .photo { width: 540px; height: 518px; }
  </style></head><body><div class="frame">
    <div class="text">
      <img class="logo" src="${fileUrl("public/assets/77585.png")}">
      <div style="margin-top:auto">
        <p class="clamp2" style="font-size:76px;font-weight:700;line-height:1.1;letter-spacing:-1px">${esc(e.title)}</p>
        ${e.subtitle ? `<p class="muted clamp2" style="margin-top:16px;font-size:34px;line-height:1.3">${esc(e.subtitle)}</p>` : ""}
      </div>
      <div style="margin-top:36px;padding-top:28px;border-top:2px solid rgba(34,30,27,.1);font-size:32px;line-height:1.35">
        ${when ? `<p style="font-weight:700">${esc(when)}</p>` : ""}
        <p class="muted">${esc(e.location)}</p>
      </div>
    </div>
    <img class="photo" src="${photo(e.image)}">
  </div></body></html>`
}

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright")
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
mkdirSync(out, { recursive: true })

const jobs: [string, string][] = [["home", homeHtml()], ...Object.values(events).map((e): [string, string] => [e.id, eventHtml(e)])]
for (const [name, html] of jobs) {
  const tmp = resolve(out, `.${name}.html`)
  writeFileSync(tmp, html)
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  const path = resolve(out, `${name}.jpg`)
  await page.screenshot({ path, type: "jpeg", quality: 84 })
  const kb = Math.round(readFileSync(path).length / 1024)
  console.log(`og/${name}.jpg  ${kb} KB`)
  const { unlinkSync } = await import("node:fs")
  unlinkSync(tmp)
}
await browser.close()
