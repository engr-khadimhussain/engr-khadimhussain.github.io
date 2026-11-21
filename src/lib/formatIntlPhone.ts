export function formatIntlPhone(digits: string): string {
  const normalized = digits.replace(/\D/g, "");

  if (/^923\d{9}$/.test(normalized)) {
    return `+92 ${normalized.slice(2, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
  }

  return `+${normalized}`;
}
