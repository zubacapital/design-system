import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensCssPath = path.join(__dirname, "../dist/css/tokens.css");
const tokensCss = readFileSync(tokensCssPath, "utf-8");

function parseCustomProperties(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const props = new Map();
  for (const match of withoutComments.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    props.set(match[1], match[2].trim());
  }
  return props;
}

function resolve(value, props, depth = 0) {
  if (depth > 10) throw new Error(`reference depth exceeded for "${value}"`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    const target = props.get(name);
    if (target === undefined) throw new Error(`undefined reference ${name}`);
    return resolve(target, props, depth + 1);
  });
}

const props = parseCustomProperties(tokensCss);

describe("tokens.css build", () => {
  it("resolves a representative primitive, semantic and component token", () => {
    assert.equal(
      resolve(props.get("--color-navy-900"), props),
      "rgb(16 43 56)",
    );
    assert.equal(
      resolve(props.get("--color-navy-200"), props),
      "oklch(0.8614 0.018 229.04)",
    );
    assert.equal(
      resolve(props.get("--color-background-page"), props),
      "rgb(255 255 255)",
    );
    assert.equal(
      resolve(props.get("--card-background"), props),
      "rgb(251 252 253)",
    );
  });

  it("outputs space.gutter.page's CSS escape, not a var() to its $value", () => {
    assert.equal(
      props.get("--space-gutter-page"),
      "max(var(--space-gutter-page-min), (100vw - var(--size-measure-page)) / 2)",
    );
  });

  it("keeps the page gutter and its cap in rem", () => {
    assert.equal(
      resolve(props.get("--space-gutter-page-min"), props),
      "1.5rem",
    );
    assert.equal(
      resolve(props.get("--space-gutter-page-min-wide"), props),
      "3rem",
    );
    assert.equal(resolve(props.get("--size-measure-page"), props), "80rem");
    assert.equal(props.get("--breakpoint-page"), "64rem");
  });

  it("collapses typography composites to a single font shorthand", () => {
    assert.equal(
      resolve(props.get("--button-typography"), props),
      "400 1rem/1.1 Cabin, Calibri, 'Trebuchet MS', sans-serif",
    );
  });

  it("collapses border composites to a single shorthand", () => {
    assert.equal(
      resolve(props.get("--card-border"), props),
      "1px solid rgb(226 232 240)",
    );
  });
});

describe("audit.md recommendation 1-2: dead tokens deleted", () => {
  for (const name of [
    "--color-black-alpha-5",
    "--color-black-alpha-8",
    "--color-black-alpha-12",
    "--shadow-sm",
    "--shadow-md",
    "--shadow-lg",
    "--elevation-low",
    "--elevation-medium",
    "--elevation-high",
    "--font-size-lg",
    "--font-size-5xl",
    "--z-index-base",
  ]) {
    it(`${name} no longer exists`, () => {
      assert.equal(props.has(name), false);
    });
  }
});

describe("the 16 migration decisions", () => {
  it("3. footer.typography adopts the flat 0.875rem token (drops the 0.9rem/1rem responsive bump)", () => {
    assert.equal(
      resolve(props.get("--footer-typography"), props),
      "400 0.875rem/1.5 Cabin, Calibri, 'Trebuchet MS', sans-serif",
    );
  });

  it("4. button.link.foreground resolves (fixes the footer.css --text-white typo)", () => {
    assert.equal(
      resolve(props.get("--button-link-foreground"), props),
      "rgb(70 85 110)",
    );
  });

  it("5. callout.title.typography is title.md uniformly (semibold, 1.25rem)", () => {
    assert.equal(
      resolve(props.get("--callout-title-typography"), props),
      "600 1.25rem/1.5 Cabin, Calibri, 'Trebuchet MS', sans-serif",
    );
  });

  it("6. card.radius is radius.card (12px) uniformly", () => {
    assert.equal(resolve(props.get("--card-radius"), props), "12px");
  });

  it("7. card.padding is space.inset.lg (1.5rem) uniformly", () => {
    assert.equal(resolve(props.get("--card-padding"), props), "1.5rem");
  });

  it("8. card.title.typography is title.md uniformly (semibold, 1.25rem)", () => {
    assert.equal(
      resolve(props.get("--card-title-typography"), props),
      "600 1.25rem/1.5 Cabin, Calibri, 'Trebuchet MS', sans-serif",
    );
  });

  it("9. footer.legal.gap is space.gap.default (1rem) uniformly", () => {
    assert.equal(resolve(props.get("--footer-legal-gap"), props), "1rem");
  });

  it("10. icon-tile.padding is space.inset.sm (0.75rem) uniformly", () => {
    assert.equal(resolve(props.get("--icon-tile-padding"), props), "0.75rem");
  });

  it("11. input.border is border.default uniformly", () => {
    assert.equal(
      resolve(props.get("--input-border"), props),
      "1px solid rgb(226 232 240)",
    );
  });

  it("12. modal.gap is space.gap.loose (1.5rem) uniformly", () => {
    assert.equal(resolve(props.get("--modal-gap"), props), "1.5rem");
  });

  it("13. prose.h1.typography is heading.xl uniformly (bold, 2.5rem)", () => {
    assert.equal(
      resolve(props.get("--prose-h1-typography"), props),
      "700 2.5rem/1.1 Cabin, Calibri, 'Trebuchet MS', sans-serif",
    );
  });

  it("14. input.background / input.foreground were dropped, not generated", () => {
    assert.equal(props.has("--input-background"), false);
    assert.equal(props.has("--input-foreground"), false);
  });

  it("15. prose.h3.color is set (not dropped)", () => {
    assert.equal(
      resolve(props.get("--prose-h3-color"), props),
      "rgb(16 43 56)",
    );
  });

  it("16. primitives used directly with no semantic/component home stay available", () => {
    assert.equal(resolve(props.get("--radius-sm"), props), "4px");
    assert.equal(resolve(props.get("--space-2xl"), props), "3rem");
    assert.equal(resolve(props.get("--breakpoint-md"), props), "900px");
    assert.equal(resolve(props.get("--breakpoint-lg"), props), "1200px");
  });
});
