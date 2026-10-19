import {palette} from '../nature-palette.js';

export const natureColors = Array.from({length: 10}, (_, i) => palette[i * 9 + 2]);

// Merge configuration without sharing Mermaid's mutable theme objects between charts.
export function mergeConfig(...layers) {
  const result = {};
  for (const layer of layers) {
    if (!layer || typeof layer !== 'object' || Array.isArray(layer)) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) continue;
      result[key] = value && typeof value === 'object' && !Array.isArray(value)
        ? mergeConfig(result[key], value) : value;
    }
  }
  return result;
}

export function chartConfig(site = {}, page = {}, style = null) {
  const css = (key, fallback) => style?.getPropertyValue(key).trim() || fallback;
  const font = css('--font-sans', '"DM Sans", Arial, sans-serif');
  const text = css('--text-secondary', '#333333');
  const background = css('--bg-card', '#ffffff');
  const variables = {
    fontFamily: font, fontSize: '16px', background, textColor: text,
    primaryColor: natureColors[0], primaryTextColor: text, primaryBorderColor: palette[5],
    secondaryColor: natureColors[2], secondaryTextColor: text, secondaryBorderColor: palette[23],
    tertiaryColor: natureColors[7], tertiaryTextColor: text, tertiaryBorderColor: palette[68],
    lineColor: '#818588', edgeLabelBackground: background,
    clusterBkg: '#f6f6f4', clusterBorder: '#c1c1c1',
    actorBkg: natureColors[0], actorBorder: palette[5], actorTextColor: text,
    actorLineColor: '#979b9e', signalColor: text, signalTextColor: text,
    activationBkgColor: natureColors[2], activationBorderColor: palette[23],
    noteBkgColor: natureColors[3], noteBorderColor: palette[32], noteTextColor: text,
    quadrant1Fill: natureColors[0], quadrant2Fill: natureColors[2],
    quadrant3Fill: natureColors[3], quadrant4Fill: natureColors[7],
    xyChart: {backgroundColor: background, plotColorPalette: natureColors.join(',')},
  };
  natureColors.forEach((color, i) => {
    variables[`cScale${i}`] = color;
    variables[`cScaleLabel${i}`] = text;
    variables[`pie${i + 1}`] = color;
    variables[`git${i}`] = color;
    variables[`gitBranchLabel${i}`] = text;
  });
  variables.pie11 = natureColors[0];
  variables.pie12 = natureColors[1];
  const config = mergeConfig({
    theme: 'base', fontFamily: font, themeVariables: variables,
    flowchart: {htmlLabels: true, curve: 'basis', useMaxWidth: true},
    sequence: {useMaxWidth: true},
  }, site, page);
  // Preserve native per-chart front matter/init/style/classDef overrides while
  // keeping the renderer lifecycle and execution policy under site control.
  return {...config, startOnLoad: false, securityLevel: 'strict',
    suppressErrorRendering: true,
    secure: ['secure', 'securityLevel', 'startOnLoad', 'suppressErrorRendering', 'maxTextSize', 'maxEdges']};
}
