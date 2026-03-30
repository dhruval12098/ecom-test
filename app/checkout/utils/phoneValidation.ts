export function isValidPhone(value: string, country: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function formatPhone(value: string, country: string) {
  return value;
}
