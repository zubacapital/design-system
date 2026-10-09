import StyleDictionary from "style-dictionary";

/**
 * zuba design tokens are authored against the W3C DTCG 2025.10 spec, which
 * represents color as a structured {colorSpace, components, alpha?, hex?} object
 * and dimension as a {value, unit} object rather than plain CSS strings. Style
 * Dictionary 5.6.0 has some native DTCG color awareness (color/css, color/oklch, ...)
 * but every built-in color transform forces one output representation for *all*
 * colors (e.g. color/css always collapses to hex/rgba). We need some tokens to keep
 * their hex ("#102b38") and others to keep their native color-space syntax
 * ("oklch(0.8614 0.018 229.04)") depending on whether a hex fallback was authored -
 * hence the small custom transform below instead of a built-in one.
 */

/** @param {{value:number,unit:string}} dim */
function dimensionToCss(dim) {
  return `${dim.value}${dim.unit}`;
}

/** @param {{colorSpace:string,components:number[],alpha?:number,hex?:string}} color */
function colorToCss(color) {
  const { colorSpace, components, alpha, hex } = color;
  const hasAlpha = alpha !== undefined && alpha !== 1;

  if (!hasAlpha && hex) return hex;

  if (colorSpace === "srgb") {
    const [r, g, b] = components.map((c) => Math.round(c * 255));
    return hasAlpha ? `rgb(${r} ${g} ${b} / ${alpha})` : `rgb(${r} ${g} ${b})`;
  }

  const comps = components.join(" ");
  return hasAlpha
    ? `${colorSpace}(${comps} / ${alpha})`
    : `${colorSpace}(${comps})`;
}

StyleDictionary.registerTransform({
  name: "zuba/name/css",
  type: "name",
  transform: (token) =>
    token.$extensions?.zuba?.cssName ?? token.path.join("-"),
});

StyleDictionary.registerTransform({
  name: "zuba/color/css",
  type: "value",
  filter: (token, options) =>
    (options.usesDtcg ? token.$type : token.type) === "color",
  // whole-value aliases (e.g. "{color.primitive.navy900}") are substituted with the
  // primitive's already-transformed CSS string before this runs - pass those through as-is.
  transform: (token, _config, options) => {
    const val = options.usesDtcg ? token.$value : token.value;
    return typeof val === "string" ? val : colorToCss(val);
  },
});

StyleDictionary.registerTransform({
  name: "zuba/dimension/css",
  type: "value",
  filter: (token, options) =>
    (options.usesDtcg ? token.$type : token.type) === "dimension",
  transform: (token, _config, options) => {
    const val = options.usesDtcg ? token.$value : token.value;
    return typeof val === "string" ? val : dimensionToCss(val);
  },
});

StyleDictionary.registerTransform({
  name: "zuba/fluidDimension/css",
  type: "value",
  filter: (token, options) =>
    (options.usesDtcg ? token.$type : token.type) === "fluidDimension",
  // already a ready CSS calc() string once references are resolved - passthrough.
  transform: (token, _config, options) =>
    options.usesDtcg ? token.$value : token.value,
});

StyleDictionary.registerTransformGroup({
  name: "zuba/css",
  transforms: [
    "zuba/name/css",
    "zuba/color/css",
    "zuba/dimension/css",
    "zuba/fluidDimension/css",
    "fontFamily/css",
    "shadow/css/shorthand",
  ],
});

export default {
  source: ["src/tokens/primitives/**/*.json", "src/tokens/semantic/**/*.json"],
  platforms: {
    css: {
      transformGroup: "zuba/css",
      buildPath: "dist/css/",
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
};
