(function () {
  'use strict';
  const root = document.getElementById('latex-tool');
  if (!root) return;
  const get = name => document.getElementById('latex-' + name);
  const input = get('input'), preview = get('preview'), status = get('status');
  const source = get('source'), scale = get('scale'), color = get('color');
  const renderButton = get('render'), download = get('download'), copy = get('copy');
  let ready = false, revision = 0, timer, svgSource = '';
  const examples = {
    integral: String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`,
    matrix: String.raw`A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}`,
    aligned: String.raw`\begin{aligned} \nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\ \nabla \cdot \mathbf{B} &= 0 \end{aligned}`
  };
  function message(text, error = false) {
    status.textContent = text;
    status.dataset.error = String(error);
  }
  function invalidate() {
    revision++;
    clearTimeout(timer);
    svgSource = '';
    source.value = '';
    download.disabled = copy.disabled = true;
  }
  function stripDelimiters(text) {
    const pairs = [['$$', '$$'], ['\\[', '\\]'], ['\\(', '\\)'], ['$', '$']];
    for (const [start, end] of pairs) {
      if (text.startsWith(start) && text.endsWith(end) && text.length >= start.length + end.length) {
        return text.slice(start.length, -end.length).trim();
      }
    }
    return text;
  }
  async function render() {
    invalidate();
    if (!ready) return;
    const current = revision;
    const equation = stripDelimiters(input.value.trim());
    if (!equation) {
      preview.replaceChildren();
      message('Enter an equation to get started.');
      return;
    }
    if (!scale.checkValidity()) {
      message('Choose a scale from 1 to 100 px per ex, in steps of 0.5.', true);
      return;
    }
    const pxPerEx = Number(scale.value);
    const equationColor = color.value;
    message('Rendering…');
    try {
      MathJax.texReset();
      const result = await MathJax.tex2svgPromise(equation, { display: get('display').checked });
      if (current !== revision) return;
      const error = result.querySelector('[data-mml-node="merror"]');
      if (error) throw new Error(error.getAttribute('data-mjx-error') || error.textContent || 'Invalid LaTeX expression.');
      const svg = result.querySelector('svg').cloneNode(true);
      const width = parseFloat(svg.getAttribute('width')) * pxPerEx;
      const height = parseFloat(svg.getAttribute('height')) * pxPerEx;
      if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error('Unable to determine the SVG dimensions.');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('width', width.toFixed(3) + 'px');
      svg.setAttribute('height', height.toFixed(3) + 'px');
      svg.removeAttribute('style');
      svg.removeAttribute('role');
      svg.removeAttribute('focusable');
      svg.removeAttribute('aria-hidden');
      svg.setAttribute('color', equationColor);
      const group = svg.querySelector('g');
      group.setAttribute('fill', equationColor);
      group.setAttribute('stroke', equationColor);
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = '[data-frame],[data-line]{stroke-width:70px;fill:none}.mjx-dashed{stroke-dasharray:140}.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}';
      svg.prepend(style);
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = equation;
      svg.prepend(title);
      svgSource = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
      source.value = svgSource;
      preview.replaceChildren(svg);
      preview.setAttribute('aria-label', 'Rendered equation: ' + equation);
      download.disabled = copy.disabled = false;
      message('Ready · ' + width.toFixed(1) + ' × ' + height.toFixed(1) + ' px');
    } catch (error) {
      if (current !== revision) return;
      preview.replaceChildren();
      preview.setAttribute('aria-label', 'Equation preview unavailable');
      message(error.message || 'Unable to render this equation.', true);
    }
  }
  function changed() {
    invalidate();
    if (!ready) return;
    if (get('auto').checked) timer = setTimeout(render, 300);
    else message('Input changed. Render the equation to update the SVG.');
  }
  [input, scale, color].forEach(control => control.addEventListener('input', changed));
  get('display').addEventListener('change', changed);
  get('auto').addEventListener('change', () => {
    if (get('auto').checked) render();
    else { clearTimeout(timer); }
  });
  renderButton.addEventListener('click', render);
  input.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      render();
    }
  });
  root.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    input.value = examples[button.dataset.example];
    render();
  }));
  download.addEventListener('click', () => {
    if (!svgSource) return;
    const url = URL.createObjectURL(new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equation.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  copy.addEventListener('click', async () => {
    if (!svgSource) return;
    try {
      await navigator.clipboard.writeText(svgSource);
      message('SVG copied to clipboard.');
    } catch (_) {
      root.querySelector('.tool-source').open = true;
      source.focus();
      source.select();
      message('Select and copy the SVG source below. Clipboard access is unavailable.');
    }
  });
  async function initialize() {
    let timeout;
    try {
      if (!window.MathJax || !MathJax.startup || !MathJax.startup.promise) throw new Error('MathJax could not load. Check your connection and reload the page.');
      await Promise.race([
        MathJax.startup.promise,
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('MathJax loading timed out. Check your connection and reload the page.')), 20000); })
      ]);
      ready = true;
      renderButton.disabled = false;
      render();
    } catch (error) { message(error.message, true); }
    finally { clearTimeout(timeout); }
  }
  initialize();
})();
