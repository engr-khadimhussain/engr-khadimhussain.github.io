export function slug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(input: string, maxLength = 3): string {
  const words = input
    .replace(/[^a-zA-Z0-9\s&/-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0].slice(0, maxLength).toUpperCase();
  }

  return words
    .map((w) => w[0])
    .join("")
    .slice(0, maxLength)
    .toUpperCase();
}

export function firstSentence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}
