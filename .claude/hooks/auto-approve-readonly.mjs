#!/usr/bin/env node
/**
 * PreToolUse hook: 読み取り専用コマンドの自動承認 + "***" アラート表示
 *
 * 直近セッションで繰り返し手動承認していた「読み取り専用の複合コマンド」
 * (cat/grep/echo の && 連結・for ループ等) と、副作用がリポジトリ内に
 * 閉じる pnpm typecheck/build、localhost への curl GET のみを自動承認する。
 *
 * 安全設計:
 *  - 判定できない/少しでも怪しい場合は「何も出力せず exit 0」
 *    → 通常の権限確認フローにフォールバック(fail-open で確認が出るだけ)
 *  - コマンド置換 `$( )` / バッククォート / リダイレクト(>, <) を含むものは対象外
 *  - 書き込み系 (sed -i, find -delete/-exec 等) は対象外
 *  - curl は localhost への GET (-s / -o /dev/null / -w) のみ
 *  - プロジェクト外のファイルを変更しうるコマンドは一切自動承認しない
 */

const SAFE_COMMANDS = new Set([
  "echo", "printf", "cat", "head", "tail", "grep", "egrep", "fgrep", "rg",
  "ls", "cd", "pwd", "find", "sed", "sort", "uniq", "wc", "cut", "tr",
  "diff", "jq", "file", "stat", "basename", "dirname", "realpath",
  "which", "type", "true", "false", "nl", "column", "date", "tree",
  "du", "df",
]);

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function isAllowed(cmd) {
  // コマンド置換・プロセス置換・バッククォートは即対象外
  if (/[`]|\$\(|<\(|>\(/.test(cmd)) return false;

  let s = cmd;

  // localhost URL は判定に使うため置換前にマーカー化
  s = s.replace(/"(https?:\/\/localhost[^"]*)"/g, " URLLOCAL ");
  s = s.replace(/'(https?:\/\/localhost[^']*)'/g, " URLLOCAL ");

  // クォート内は引数(データ)として不活性化
  s = s.replace(/'[^']*'/g, " Q ");
  s = s.replace(/"[^"]*"/g, " Q ");
  // クォートが残る(対応が取れない)場合は対象外
  if (/['"]/.test(s)) return false;

  // 許可するリダイレクトのみ除去し、その他の < > は対象外
  s = s.replace(/2>&1/g, " ");
  s = s.replace(/2>\s*\/dev\/null/g, " ");
  s = s.replace(/&?>\s*\/dev\/null/g, " ");
  if (/[<>]/.test(s)) return false;

  const segments = s.split(/\n|&&|\|\||[|;]/);

  for (let seg of segments) {
    let t = seg.trim();
    if (!t) continue;
    // シェル構文キーワード(for ループ等)
    if (/^(done|fi|then|else|do)$/.test(t)) continue;
    if (/^for\s+[A-Za-z_][A-Za-z0-9_]*\s+in\b/.test(t)) continue;
    if (/^(if|elif|while|until|case|function)\b/.test(t)) return false;
    t = t.replace(/^do\s+/, "").replace(/^then\s+/, "").replace(/^else\s+/, "");
    // 環境変数代入プレフィックス / 単独代入
    t = t.replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=[^\s]*\s+)+/, "");
    if (t === "" || /^[A-Za-z_][A-Za-z0-9_]*=[^\s]*$/.test(t)) continue;

    // ---- プロジェクト固有の許可(副作用がリポジトリ内に閉じるもの) ----
    if (/^pnpm(\s+-r)?\s+(typecheck|build)$/.test(t)) continue;
    if (/^pnpm\s+--filter\s+@repo\/[A-Za-z0-9_.-]+\s+(typecheck|build)$/.test(t)) continue;
    // localhost への GET のみ (POST/PATCH は -X が付くので一致しない)
    if (/^curl\s+-s(\s+-o\s+\/dev\/null)?(\s+-w\s+Q)?\s+(URLLOCAL|https?:\/\/localhost[^\s]*)$/.test(t)) continue;

    // ---- 汎用の読み取り専用コマンド ----
    const tok = t.split(/\s+/)[0];
    if (!SAFE_COMMANDS.has(tok)) return false;
    if (tok === "sed" && /(^|\s)-i/.test(t)) return false;
    if (
      tok === "find" &&
      /-(delete|exec|execdir|ok|okdir|fprint|fprintf|fprint0|fls|files0-from)\b/.test(t)
    ) {
      return false;
    }
  }
  return true;
}

const input = await readStdin();
let payload;
try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}
if (payload?.tool_name !== "Bash") process.exit(0);
const cmd = String(payload?.tool_input?.command ?? "").trim();
if (!cmd) process.exit(0);

let ok = false;
try {
  ok = isAllowed(cmd);
} catch {
  process.exit(0); // fail-open: 通常の権限確認に戻す
}
if (!ok) process.exit(0);

const display = cmd.length > 200 ? cmd.slice(0, 200) + "…" : cmd;
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "読み取り専用ルールによる自動承認",
    },
    systemMessage: `*** 自動承認(読み取り専用): ${display} ***`,
  }),
);
process.exit(0);
