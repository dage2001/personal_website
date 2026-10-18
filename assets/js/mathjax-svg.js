const MATHJAX_SVG_STYLE = '[data-frame],[data-line]{stroke-width:70px;fill:none}.mjx-dashed{stroke-dasharray:140}.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}';

let ready;

export function mathJaxReady() {
  if (!ready) {
    ready = new Promise((resolve, reject) => {
      const start = () => {
        const mathJax = window.MathJax;
        if (!mathJax?.startup?.promise) {
          reject(new Error('MathJax did not load. Reload the page to render math.'));
          return;
        }
        mathJax.startup.promise.then(() => resolve(mathJax), reject);
      };

      if (window.MathJax?.startup?.promise) start();
      else {
        const script = document.getElementById('MathJax-script');
        if (!script) {
          reject(new Error('Unable to find the MathJax loader.'));
          return;
        }
        script.addEventListener('load', start, { once: true });
        script.addEventListener('error', () => reject(new Error('Unable to load MathJax.')), { once: true });
      }
    });
  }
  return ready;
}

export function stripMathDelimiters(text) {
  const pairs = [['$$', '$$'], ['\\[', '\\]'], ['\\(', '\\)'], ['$', '$']];
  for (const [start, end] of pairs) {
    if (text.startsWith(start) && text.endsWith(end) && text.length >= start.length + end.length) {
      return text.slice(start.length, -end.length).trim();
    }
  }
  return text;
}

// Use MathJax's adaptor rather than DOM querySelector().  In MathJax 4 some
// inline results expose nested glyph SVGs to querySelector() before the full
// equation SVG, while adaptor.tags() returns the output root as documented.
export function findMathSvg(result, adaptor) {
  const svg = adaptor?.tags?.(result, 'svg')?.[0]
    || (result?.localName === 'svg' ? result : result?.querySelector?.('svg'));
  if (!svg) throw new Error('MathJax did not produce an SVG.');
  return svg;
}

export async function renderMathSvg(source, { display = true, stripDelimiters = false, reset = true } = {}) {
  const mathJax = await mathJaxReady();
  const latex = stripDelimiters ? stripMathDelimiters(source) : source;
  if (reset) mathJax.texReset();
  const result = await mathJax.tex2svgPromise(latex, { display });
  const error = result.querySelector?.('[data-mml-node="merror"]');
  if (error) throw new Error(error.getAttribute('data-mjx-error') || error.textContent || 'Invalid LaTeX expression.');
  return findMathSvg(result, mathJax.startup.adaptor).cloneNode(true);
}

export function addMathSvgStyle(svg) {
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = MATHJAX_SVG_STYLE;
  svg.prepend(style);
}
