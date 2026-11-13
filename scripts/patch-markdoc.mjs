// Fixes a Markdoc bug before each build (no extra dependency). Markdoc decides whether a line that starts with a tag
// is a block tag by comparing where the tag ends with the end of the line, measured as
// `state.src.slice(0, finish).trim().length`. trim() also drops the whitespace at the START of the file, and Astro
// turns the frontmatter into blank lines, so every short line that starts with an inline tag, like
// `- {% n v="5" /%}A short line`, was read as a block tag and the build failed. trimEnd() measures the line itself.
// The CMS writes tables this way, so the fix is needed for CMS saves. Remove it once Markdoc fixes the bug.
import { readFileSync, writeFileSync, globSync } from 'node:fs';

const BUG = 'state.src.slice(0, finish).trim().length';
const FIX = 'state.src.slice(0, finish).trimEnd().length';
for (const file of globSync('node_modules/**/@markdoc/markdoc/dist/index.{js,mjs}')) {
  const src = readFileSync(file, 'utf8');
  if (src.includes(BUG)) {
    writeFileSync(file, src.replaceAll(BUG, FIX));
    console.log('patched', file);
  }
}
