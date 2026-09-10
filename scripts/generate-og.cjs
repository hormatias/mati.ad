// Optional asset authoring tool: needs Playwright and Chromium, not used during deployment.
// Usage: node scripts/generate-og.cjs [path-to-playwright-module]
const { chromium } = require(process.argv[2] || 'playwright');
const { readFileSync } = require('node:fs');
const path = require('node:path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const portrait = readFileSync(path.join(root, 'assets/images/mati.png')).toString('base64');
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#f6f3ed;color:#232d26;font-family:Georgia,'Times New Roman',serif}
      main{height:100%;padding:76px 84px;display:flex;align-items:center;justify-content:space-between;gap:50px}
      h1{font-size:132px;font-weight:400;letter-spacing:-8px;line-height:1;margin:0 0 42px}h1 span{color:#62655e}
      .copy{width:580px}.rule{height:1px;background:#d6d7cb;margin-bottom:28px}
      p{font-size:28px;line-height:1.6;margin:0;color:#315840;letter-spacing:-.5px}
      img{width:354px;height:354px;border-radius:50%;filter:sepia(.3) hue-rotate(65deg) saturate(.65);box-shadow:0 14px 36px -12px rgb(35 45 38 / .2)}
    </style></head><body><main><div class="copy"><h1>mati<span>.ad</span></h1><div class="rule"></div><p>Contact me · Contáctame · Contacta’m<br>Contactez-moi · Fala comigo</p></div><img alt="Mati" src="data:image/png;base64,${portrait}"></main></body></html>`);
    await page.locator('img').evaluate(img=>img.decode());
    await page.screenshot({path:path.join(root,'assets/images/og-mati-v1.png'),type:'png'});
    console.log('Generated assets/images/og-mati-v1.png — 1200×630');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
