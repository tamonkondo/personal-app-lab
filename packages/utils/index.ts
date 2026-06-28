export type FormatOptions = "slash" | "dash" | "dot" | "hyphen" | "space";

export function formatDate(
  date: Date | string,
  format: FormatOptions = "slash",
): string {
  const formatMap: Record<FormatOptions, string> = {
    slash: "/",
    dash: "-",
    dot: ".",
    hyphen: "-",
    space: " ",
  };

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const separator = formatMap[format];
  // 2重で出ているseparatorを1つにする
  return `${year}${separator}${month}${separator}${day}`;
}
