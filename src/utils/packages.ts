export function parsePackages(str: string): string[] {
  return str.split(/[\s+,]+/).filter(Boolean)
}
