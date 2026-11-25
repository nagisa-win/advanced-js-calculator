/**
 * 演算台前端：直接用仓库里 jison 编译好的解析器，不引任何框架。
 * parser.mjs 由 build.mjs 从 src/output/calculator.mjs 复制而来，保证页面跑的就是仓库里的文法。
 */
// 解析器在站点根目录，与 index.html 同级
import calc from "../parser.mjs";

const $ = (sel) => document.querySelector(sel);

const parser = calc.parser;
const symbols = parser.symbols_ || {};
const terminals = parser.terminals_ || {};

const EXAMPLES = [
  "2 * sin(30) + 3! - sqrt(16) / (1 + 1)",
  "2 ^ 10 % 7",
  "log(100) + ln(E)",
  "atan(1) * 4",
  "(1 + 2) * (3 + 4) ^ 2",
  "170!",
];

/** 词法分析：逐颗吐 token，标出类型方便上色 */
function tokenize(expr) {
  const tokens = [];
  const lexer = parser.lexer;
  lexer.setInput(expr);
  lexer.yy = {};

  for (let guard = 0; guard < 512; guard += 1) {
    const id = lexer.lex();
    if (id === 1 || id === undefined) break; // EOF
    if (id === 0) throw new Error(lexer.yytext ? `无法识别：${lexer.yytext}` : "无法识别输入");

    const name = terminals[id] || symbols[id] || `T${id}`;
    const text = lexer.yytext ?? String(lexer.yylval ?? "");
    const kind = name === "NUMBER" ? "num" : /^(sin|cos|tan|asin|acos|atan|ln|log|SQRT)$/.test(name) ? "fn" : "op";
    tokens.push({ name, text, kind });
  }

  return tokens;
}

function renderTokens(tokens) {
  const list = $("#tokens");
  $("#token-count").textContent = `${tokens.length} tokens`;
  list.replaceChildren(
    ...tokens.map((t) => {
      const li = document.createElement("li");
      li.className = `token token--${t.kind}`;
      li.innerHTML = `<span>${escapeHtml(t.text)}</span><small>${t.name}</small>`;
      return li;
    })
  );
  if (!tokens.length) list.innerHTML = '<li class="token">空表达式</li>';
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** 统一在这里算值：顺带把角度制开关喂给文法里的 isDeg */
function evaluate(expr, deg) {
  calc.parse(`isDeg(${deg ? 1 : 0})`);
  return calc.parse(expr);
}

function format(v) {
  if (typeof v !== "number") return String(v);
  if (!Number.isFinite(v)) return String(v);
  if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
  return String(Number(v.toPrecision(12)));
}

function showResult(value, error) {
  const box = $("#result");
  box.classList.toggle("result--error", Boolean(error));
  box.innerHTML = error
    ? `<span class="result__eq">ERROR</span><span class="result__value">${escapeHtml(error)}</span>`
    : `<span class="result__eq">=</span><span class="result__value">${escapeHtml(value)}</span>`;
}

function run() {
  const expr = $("#expr").value.trim();
  const deg = $("#deg").checked;

  if (!expr) {
    renderTokens([]);
    showResult("", "请输入表达式");
    return;
  }

  let tokens = [];
  try {
    tokens = tokenize(expr);
  } catch (err) {
    renderTokens([]);
    showResult("", err.message);
    return;
  }

  renderTokens(tokens);

  try {
    const value = evaluate(expr, deg);
    showResult(format(value));
  } catch (err) {
    // jison 的报错信息偏长，截到第一行更像人话
    showResult("", String(err.message || err).split("\n")[0]);
  }
}

/** 把文法源码摊在右侧，行首加序号 */
async function loadGrammar() {
  try {
    const res = await fetch("grammar.txt");
    const text = await res.text();
    const rules = text
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("/*"))
      .map((line) => escapeHtml(line))
      .join("\n");
    $("#grammar").innerHTML = rules;
    $("#prod-count").textContent = `${rules.split("\n").length} lines`;
  } catch {
    $("#grammar").textContent = "文法加载失败";
  }
}

function initFacts() {
  $("#f-states").textContent = String(parser.table?.length ?? "—");
  $("#f-terms").textContent = String(Object.keys(terminals).length);
  $("#f-nonterms").textContent = String(Object.keys(symbols).length - Object.keys(terminals).length);
}

function initExamples() {
  const box = $("#examples");
  box.replaceChildren(
    ...EXAMPLES.map((ex) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ex";
      b.textContent = ex;
      b.addEventListener("click", () => {
        $("#expr").value = ex;
        run();
      });
      return b;
    })
  );
}

/* ---------- 启动 ---------- */

initExamples();
initFacts();
loadGrammar();
run();

let timer = 0;
$("#expr").addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(run, 180);
});

$("#deg").addEventListener("change", run);

// Ctrl/⌘ + Enter 立即求值
$("#expr").addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    run();
  }
});
