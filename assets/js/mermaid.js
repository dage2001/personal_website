// Only pages containing Mermaid download the bundled renderer. All assets are local.
const blocks = [...document.querySelectorAll('.post pre')].filter(pre =>
  pre.matches('.mermaid, .mermaid-source, .language-mermaid') ||
  pre.querySelector('code.language-mermaid') || pre.closest('.language-mermaid')
).map(pre => pre.closest('.highlighter-rouge') || pre);

if (blocks.length) {
  const settings = document.getElementById('mermaid-config');
  try {
    const {renderCharts} = await import('./mermaid.min.js');
    await renderCharts([...new Set(blocks)],
      JSON.parse(settings?.dataset.site || 'null'),
      JSON.parse(settings?.dataset.page || 'null'));
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'mermaid-error';
    message.setAttribute('role', 'status');
    message.textContent = 'Mermaid renderer could not be loaded. Diagram source is shown below.';
    blocks[0].before(message);
    console.error('Mermaid renderer:', error);
  }
}
