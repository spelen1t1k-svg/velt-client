/**
 * Сборка через esbuild.
 *
 * Зачем бандлер, если в рендерере vanilla JS:
 * preload обязан быть ОДНИМ файлом, чтобы работать при sandbox: true.
 * В песочнице preload не может делать require() произвольных модулей —
 * доступен только урезанный набор (electron, events, timers, url).
 * Поэтому весь клиентский слой собирается в один preload-бандл.
 * Это цена за максимальную изоляцию, и она того стоит.
 *
 * Main-процесс бандлить не обязательно, но так проще: один выход,
 * никаких сюрпризов с путями внутри asar.
 */

import * as esbuild from "esbuild";
import { rm, mkdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";

const watch = process.argv.includes("--watch");
const prod = process.argv.includes("--prod");

/**
 * Облегчённый вариант. Флаг подставляется в код через define
 * и определяет имя приложения, набор скриптов и пресет флагов.
 *
 * Выход у обоих вариантов один и тот же — dist/. Так сделано,
 * чтобы поле main в package.json подходило обеим сборкам:
 * альтернатива (extraMetadata в конфиге electron-builder)
 * переписывает исходный package.json и сносит из него scripts.
 *
 * Значит, в dist/ лежит тот вариант, который собран последним.
 */
const lite = process.argv.includes("--lite");
const OUT = "dist";

/** Общие настройки для всех сборок. */
const base = {
  bundle: true,
  platform: "node",
  target: "node20", // Electron 40 = Node 20.x
  format: "cjs",
  sourcemap: prod ? false : "inline",
  minify: prod,
  logLevel: "info",
  define: { __VELT_LITE__: String(lite) },
};

const targets = [
  {
    // Main-процесс. electron-updater остаётся внешним —
    // он тянет нативные зависимости, бандлить его нельзя.
    entryPoints: ["src/main/index.js"],
    outfile: `${OUT}/main/index.js`,
    external: ["electron", "electron-updater"],
    ...base,
  },
  {
    // Preload + весь клиентский слой в одном файле.
    // platform: browser, потому что этот код живёт в изолированном
    // мире рендерера и работает с DOM, а не с Node.
    entryPoints: ["src/preload/index.js"],
    outfile: `${OUT}/preload/index.js`,
    external: ["electron"],
    ...base,
    platform: "browser",
    target: "chrome130",
  },
  {
    // Скрипт экрана загрузки — обычный браузерный бандл.
    entryPoints: ["src/renderer/loading/loading.js"],
    outfile: `${OUT}/renderer/loading/loading.js`,
    ...base,
    platform: "browser",
    target: "chrome130",
    format: "iife",
    external: [],
  },
];

/** Копирует статику, которую esbuild не трогает. */
async function copyStatic() {
  await mkdir(`${OUT}/renderer/loading`, { recursive: true });
  await cp("src/renderer/loading/loading.html", `${OUT}/renderer/loading/loading.html`);
  if (existsSync("src/assets")) {
    await cp("src/assets", `${OUT}/assets`, { recursive: true });
  }
}

if (watch) {
  const contexts = await Promise.all(targets.map((t) => esbuild.context(t)));
  await Promise.all(contexts.map((c) => c.watch()));
  await copyStatic();
  console.log(`[build] watch-режим запущен (${lite ? "lite" : "обычный"})`);
} else {
  await rm(OUT, { recursive: true, force: true });
  await Promise.all(targets.map((t) => esbuild.build(t)));
  await copyStatic();
  console.log(`[build] готово — ${lite ? "VELT Lite" : "VELT Client"} в ${OUT}/`);
}
