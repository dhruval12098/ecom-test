export function isValidPhone(value: string, country: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/[^\d]/g, "");
  const isBelgium =
    String(country || "").trim().toLowerCase() === "belgium" ||
    String(country || "").trim().toLowerCase() === "be";
  if (digits.startsWith("32") || isBelgium) {
    const normalized = digits.startsWith("32") ? digits : `32${digits.replace(/^0/, "")}`;
    return normalized.length === 11; // +32 + 9 digits
  }
  return digits.length === 12; // 2-digit country code + 10 digits
}

export function formatPhone(value: string, country: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  const isBelgium =
    String(country || "").trim().toLowerCase() === "belgium" ||
    String(country || "").trim().toLowerCase() === "be" ||
    digits.startsWith("32");
  if (isBelgium) {
    let normalized = digits;
    if (normalized.startsWith("320")) {
      normalized = `32${normalized.slice(3)}`;
    } else if (!normalized.startsWith("32")) {
      normalized = `32${normalized.replace(/^0/, "")}`;
    }
    const limited = normalized.slice(0, 11);
    const countryCode = limited.slice(0, 2);
    const rest = limited.slice(2);
    if (rest.length <= 3) return `+${countryCode} ${rest}`;
    if (rest.length <= 5) return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3)}`;
    if (rest.length <= 7) return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5)}`;
    if (rest.length <= 9) return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7)}`;
    return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7)}`;
  }
  const limited = digits.slice(0, 12);
  if (limited.length <= 2) return `+${limited}`;
  const countryCode = limited.slice(0, 2);
  const rest = limited.slice(2);
  if (rest.length <= 3) return `+${countryCode} ${rest}`;
  if (rest.length <= 6) return `+${countryCode} ${rest.slice(0, 3)}-${rest.slice(3)}`;
  return `+${countryCode} ${rest.slice(0, 3)}-${rest.slice(3, 6)}-${rest.slice(6)}`;
}
