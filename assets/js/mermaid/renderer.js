import mermaid from 'mermaid';
import {chartConfig} from './theme.js';

let serial = 0;

export async function renderCharts(blocks, site, page) {
  // Mermaid measures labels during rendering; wait for the site's actual fonts.
  if (document.fonts?.ready) await document.fonts.ready;
  for (const block of blocks) {
    const source = block.querySelector('code')?.textContent ?? block.textContent;
    const stage = document.createElement('div');
    stage.className = 'mermaid-staging';
    document.body.append(stage);
    const id = `site-mermaid-${++serial}`;
    try {
      mermaid.initialize(chartConfig(site, page, getComputedStyle(block)));
      const {svg, bindFunctions} = await mermaid.render(id, source, stage);
      const figure = document.createElement('figure');
      figure.className = 'mermaid-chart tex2jax_ignore';
      const viewport = document.createElement('div');
      viewport.className = 'mermaid-viewport';
      viewport.setAttribute('role', 'region');
      viewport.setAttribute('aria-label', 'Mermaid diagram');
      viewport.tabIndex = 0;
      viewport.innerHTML = svg;
      const diagram = viewport.querySelector('svg');
      // Keep long labels legible on phones; large diagrams can scroll locally.
      if (diagram?.viewBox.baseVal.width) {
        diagram.style.minWidth = `${Math.min(diagram.viewBox.baseVal.width, 480)}px`;
      }
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Mermaid source';
      details.append(summary);
      figure.append(viewport, details);
      block.replaceWith(figure);
      details.append(block);
      bindFunctions?.(viewport);
    } catch (error) {
      const message = document.createElement('p');
      message.className = 'mermaid-error';
      message.setAttribute('role', 'status');
      message.textContent = `Mermaid diagram could not be rendered: ${error.message || error}`;
      block.before(message);
    } finally {
      stage.remove();
    }
  }
}
