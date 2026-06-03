/// <reference types="node" />

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

// 引数を配列で取得 2つ目以降の要素が実際の引数になる
const args = process.argv.slice(2);
/**
 * argsの配列内から取得したいコンポーネント名を抽出
 * 条件
 * 1. "--" でないこと
 * 2. "-" で始まらないこと
 * 3. 小文字の英数字とハイフンのみで構成されていること
 * 4. 例: "button", "card", "dialog", "badge", "accordion", "textarea", "input"
 * 5. これらの条件を満たす引数はコンポーネント名として扱う
*/
const componentNames = args.filter(
  (arg) => arg !== "--" && !arg.startsWith("-") && /^[a-z0-9-]+$/.test(arg),
);

// コマンドを実行する関数   
const run = (command: string, commandArgs: string[]): Promise<number> =>
  new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });

const exitCode = await run("pnpm", [
  "dlx",
  "shadcn@latest",
  "add",
  "-c",
  "packages/ui",
  ...args,
]);

if (exitCode !== 0) {
  process.exit(exitCode);
}

if (componentNames.length === 0) {
  process.exit(0);
}

const indexPath = "packages/ui/index.ts";
let current = "";

try {
  current = await readFile(indexPath, "utf8");
} catch {
  // If the index file does not exist yet, start from empty content.
}

const missingLines = componentNames
  .map((name) => `export * from "./components/ui/${name}";`)
  .filter((line) => !current.includes(line));

if (missingLines.length === 0) {
  process.exit(0);
}

const hasTrailingNewline = current.length === 0 || current.endsWith("\n");
const separator = hasTrailingNewline ? "" : "\n";
const next = `${current}${separator}${missingLines.join("\n")}\n`;

await writeFile(indexPath, next, "utf8");
