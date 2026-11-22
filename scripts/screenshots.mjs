// Usage: node scripts/screenshots.mjs [baseUrl]  (app must be running)
import { chromium, webkit } from "playwright";

const base = process.argv[2] ?? "http://localhost:3111";
const out = new URL("../screenshots/", import.meta.url).pathname;
// Desktop shots use Chromium. Mobile shots use WebKit: headless Chromium with software GL leaves part of
// the WebGL canvas unpainted when a panel overlaps it (a capture artifact; WebKit renders it correctly).
const chrome = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const safari = await webkit.launch();

async function shot(name, viewport, scheme, steps) {
  const browser = viewport.width < 600 ? safari : chrome;
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base);
  await page.waitForTimeout(5000);
  await steps?.(page);
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${out}${name}.png` });
  console.log(name, errors.length ? errors.slice(0, 3) : "no console errors");
  await ctx.close();
}

const bethel = async (page) => {
  const s = page.getByRole("combobox");
  await s.fill("Bethel");
  await page.waitForTimeout(300);
  await s.press("Enter");
};
const genSearch = async (page) => {
  const s = page.getByRole("combobox");
  await s.fill("Gen 28");
};

await shot("desktop-light-home", { width: 1440, height: 900 }, "light");
await shot("desktop-light-bethel", { width: 1440, height: 900 }, "light", bethel);
await shot("desktop-dark-bethel", { width: 1440, height: 900 }, "dark", bethel);
await shot("desktop-search-gen28", { width: 1440, height: 900 }, "light", genSearch);
await shot("mobile-light-home", { width: 390, height: 844 }, "light");
await shot("mobile-light-bethel", { width: 390, height: 844 }, "light", bethel);
await shot("mobile-dark-bethel", { width: 390, height: 844 }, "dark", bethel);
await chrome.close();
await safari.close();
