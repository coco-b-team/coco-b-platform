const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
};

// WordPress titles/content come back as HTML — decode the entities that show up
// in practice (accents, quotes, dashes) instead of pulling in a full HTML parser.
export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&(amp|quot|apos|lt|gt);/g, (_, name) => NAMED_ENTITIES[name]);
}
