export function isValidPhone(value: string, country: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/[^\d]/g, "");
  return digits.length === 12;
}

export function formatPhone(value: string, country: string) {
  const digits = value.replace(/[^\d]/g, "");
  const limited = digits.slice(0, 12);
  if (!limited) return "";
  if (limited.length <= 2) return `+${limited}`;
  const countryCode = limited.slice(0, 2);
  const rest = limited.slice(2);
  if (rest.length <= 3) return `+${countryCode} ${rest}`;
  if (rest.length <= 6) return `+${countryCode} ${rest.slice(0, 3)}-${rest.slice(3)}`;
  return `+${countryCode} ${rest.slice(0, 3)}-${rest.slice(3, 6)}-${rest.slice(6)}`;
}
