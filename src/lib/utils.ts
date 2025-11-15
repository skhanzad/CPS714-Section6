type ClassValue = string | number | false | null | undefined;

export function cn(...inputs: ClassValue[]) {
  return inputs
    .flatMap((input) => {
      if (!input && input !== 0) return [];
      return String(input).trim();
    })
    .filter(Boolean)
    .join(" ");
}
