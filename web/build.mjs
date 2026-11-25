/**
 * 演算台构建：把仓库里的 jison 产物与文法源文件一起装进发布目录。
 * 无第三方依赖，CI 里只需要 node。
 * 用法：node web/build.mjs
 */
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = dirname(fileURLToPath(import.meta.url));
const root = join(web, "..");
const dist = join(web, "dist");

/** 只保留文法正文（两个 %% 之间的规则段），去掉语义动作以外的噪音 */
function extractGrammar(source) {
  const parts = source.split(/^%%$/m);
  if (parts.length < 3) return source;
  return parts[1]
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, "assets"), { recursive: true });

// 资源加内容指纹：改版后浏览器不会继续用十天前的缓存
const hash = (buf) => createHash("sha1").update(buf).digest("hex").slice(0, 8);
const css = await readFile(join(web, "assets/app.css"));
const js = await readFile(join(web, "assets/app.js"));

let html = await readFile(join(web, "index.html"), "utf8");
html = html
  .replace("assets/app.css", `assets/app.css?v=${hash(css)}`)
  .replace("assets/app.js", `assets/app.js?v=${hash(js)}`);
await writeFile(join(dist, "index.html"), html);
await cp(join(web, "assets/app.css"), join(dist, "assets/app.css"));
await cp(join(web, "assets/app.js"), join(dist, "assets/app.js"));

// 页面直接跑的解析器就是仓库里的编译产物，避免第二份实现
await cp(join(web, "vendor/calculator.mjs"), join(dist, "parser.mjs"));

const grammar = extractGrammar(await readFile(join(root, "src/jison/calculator.jison"), "utf8"));
await writeFile(join(dist, "grammar.txt"), grammar + "\n");

await writeFile(join(dist, ".nojekyll"), "");

console.log(`built web → web/dist（文法 ${grammar.split("\n").length} 行）`);
