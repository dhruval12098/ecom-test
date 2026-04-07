export function isValidPhone(value: string, country: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits.length === 12;
}

export function formatPhone(value: string, country: string) {
  const digits = value.replace(/[^\d]/g, "");
  const limited = digits.slice(0, 12);
  return limited ? `+${limited}` : "";
}
