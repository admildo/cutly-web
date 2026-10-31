// Renders the social share images in public/og from the card layouts below.
// Run: node scripts/generate-og-images.mjs
// Needs Google Chrome (or set CHROME_PATH to another Chromium). Fonts and screenshots are inlined so each render is self-contained.
// The bundled Manrope subset (scripts/og/fonts) is released under the SIL Open Font License.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'og')
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const inline = (path, mime) => `data:${mime};base64,${readFileSync(join(root, path)).toString('base64')}`
const font = inline('scripts/og/fonts/Manrope-latin.woff2', 'font/woff2')
const image = (path) => inline(path, path.endsWith('.png') ? 'image/png' : 'image/webp')
const mark = image('public/favicon/web-app-manifest-512x512.png')

const baseCss = `
@font-face { font-family: 'Manrope'; src: url(${font}) format('woff2'); font-weight: 200 800; font-style: normal; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body {
  position: relative;
  background: #08090c;
  color: #f7f8fb;
  font-family: 'Manrope', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.backdrop {
  position: absolute; inset: 0;
  background:
    radial-gradient(760px 480px at 92% 0%, rgba(96, 124, 214, .30), transparent 70%),
    radial-gradient(620px 420px at 0% 100%, rgba(203, 214, 242, .10), transparent 72%);
}
.dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, .09) 1px, transparent 1.4px);
  background-size: 30px 30px;
  mask-image: linear-gradient(160deg, #000 10%, transparent 60%);
}
.copy {
  position: absolute; left: 72px; top: 64px; bottom: 60px; width: 520px;
  display: flex; flex-direction: column;
}
.brand { display: flex; align-items: center; gap: 14px; font-size: 25px; font-weight: 700; letter-spacing: -.01em; }
.brand img { width: 42px; height: 42px; border-radius: 11px; }
.text { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  font-size: 17px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #cbd6f2;
}
.eyebrow::before {
  content: ''; width: 9px; height: 9px; border-radius: 50%;
  background: #9bb8ff; box-shadow: 0 0 16px #9bb8ff;
}
h1 { margin-top: 24px; font-size: 80px; line-height: .98; letter-spacing: -.045em; font-weight: 800; text-wrap: balance; }
.lede { margin-top: 26px; font-size: 27px; line-height: 1.42; font-weight: 500; color: #b8bfcf; text-wrap: pretty; }
.url { font-size: 19px; font-weight: 600; letter-spacing: .01em; color: #7f8699; }
.shot {
  position: absolute; right: 40px; top: 112px; width: 540px; height: 405px;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 40px 90px rgba(0, 0, 0, .65), 0 0 0 1px rgba(255, 255, 255, .14);
}
.shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
`

const page = (css, body) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><style>${baseCss}${css}</style></head>
<body>
  <div class="backdrop"></div>
  <div class="dots"></div>
  ${body}
</body>
</html>`

const copy = ({ eyebrow, title, lede }) => `
  <div class="copy">
    <div class="brand"><img src="${mark}" alt="">Deyn Studio</div>
    <div class="text">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p class="lede">${lede}</p>
    </div>
    <p class="url">deynstudio.com</p>
  </div>`

const screenshot = (src) => `<div class="shot"><img src="${image(src)}" alt=""></div>`

const creatorCss = `
.hl {
  background: linear-gradient(95deg, #f7f8fb 10%, #9bb8ff 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.fan { position: absolute; left: 650px; top: 80px; width: 480px; height: 470px; }
.fan figure {
  position: absolute; margin: 0; overflow: hidden; border-radius: 22px;
  box-shadow: 0 34px 80px rgba(0, 0, 0, .7), 0 0 0 1px rgba(255, 255, 255, .16);
}
.fan img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fan .back-left { left: 0; top: 60px; width: 232px; height: 300px; transform: rotate(-8deg); }
.fan .back-right { left: 248px; top: 30px; width: 232px; height: 300px; transform: rotate(7deg); }
.fan .front { left: 110px; top: 118px; width: 250px; height: 322px; transform: rotate(-1.5deg); }
.chip {
  position: absolute; display: inline-flex; align-items: center; gap: 10px;
  padding: 13px 20px; border-radius: 999px; font-size: 20px; font-weight: 700;
  background: rgba(12, 14, 20, .72); border: 1px solid rgba(255, 255, 255, .18);
  backdrop-filter: blur(12px); box-shadow: 0 16px 40px rgba(0, 0, 0, .45);
}
.chip i { width: 10px; height: 10px; border-radius: 50%; background: #9bb8ff; box-shadow: 0 0 14px #9bb8ff; }
.chip.one { left: 24px; top: 380px; }
.chip.two { left: 300px; top: 12px; }
`

const creatorBody = `
  ${copy({
    eyebrow: 'Creator program',
    title: 'Deyn Studio,<br><span class="hl">free for creators.</span>',
    lede: 'Selected creators get a free license and usage credits for AI actions. Apply from your dashboard.'
  })}
  <div class="fan">
    <figure class="back-left"><img src="${image('public/card-media/se-2.webp')}" alt=""></figure>
    <figure class="back-right"><img src="${image('public/card-media/se-21.webp')}" alt=""></figure>
    <figure class="front"><img src="${image('public/card-media/se-15.webp')}" alt=""></figure>
    <span class="chip two"><i></i>Free license</span>
    <span class="chip one"><i></i>AI usage credits</span>
  </div>`

const cards = {
  default: {
    css: '',
    body: `${copy({
      eyebrow: 'AI video clip maker',
      title: 'Turn long videos into clips.',
      lede: 'Find the best moments, add captions, reframe, and export from one desktop app.'
    })}${screenshot('public/app-shots/home-p.webp')}`
  },
  creator: { css: creatorCss, body: creatorBody },
  download: {
    css: '',
    body: `${copy({
      eyebrow: 'Desktop app',
      title: 'Download Deyn Studio for macOS.',
      lede: 'Find, edit, and export clips from one desktop app. Windows and Linux are coming soon.'
    })}${screenshot('public/app-shots/editor.webp')}`
  },
  about: {
    css: '',
    body: `${copy({
      eyebrow: 'About',
      title: 'Long videos in. Clips out.',
      lede: 'Deyn Studio turns long videos into clips you can review, caption, frame, and export on your desktop.'
    })}${screenshot('public/app-shots/clips-p.webp')}`
  },
  blog: {
    css: '',
    body: `${copy({
      eyebrow: 'Journal',
      title: 'Video editing tips and product news.',
      lede: 'Practical editing notes, creator stories, and product updates from the team building Deyn Studio.'
    })}${screenshot('public/app-shots/tools-3.webp')}`
  }
}

const render = (html, file) => {
  const dir = mkdtempSync(join(tmpdir(), 'deyn-og-'))
  const htmlPath = join(dir, 'card.html')
  writeFileSync(htmlPath, html)
  try {
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=2000',
      `--user-data-dir=${join(dir, 'profile')}`,
      `--screenshot=${file}`,
      pathToFileURL(htmlPath).href
    ], { stdio: 'ignore' })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

mkdirSync(outDir, { recursive: true })
for (const [name, card] of Object.entries(cards)) {
  const file = join(outDir, `${name}.png`)
  render(page(card.css, card.body), file)
  console.log(`wrote ${file}`)
}
