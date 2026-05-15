export function sanitizeText(input: string) {
  return input
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(input: string) {
  return input
    .replace(/[<>]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeEmail(input: string) {
  return input.trim().toLowerCase();
}
