/** 秒 → mm:ss */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** ISO 文字列 → "M/D HH:mm"（時刻が無い日付のみの場合は "M/D"） */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const hasTime = iso.includes("T");
  const md = `${date.getMonth() + 1}/${date.getDate()}`;
  if (!hasTime) return md;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${md} ${hh}:${mm}`;
}

/** 現在時刻を Notion に書き込む用の ISO(ローカルオフセット付き) で返す */
export function nowIsoWithOffset(): string {
  const now = new Date();
  const tzMin = -now.getTimezoneOffset();
  const sign = tzMin >= 0 ? "+" : "-";
  const abs = Math.abs(tzMin);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` +
    `${sign}${oh}:${om}`
  );
}
