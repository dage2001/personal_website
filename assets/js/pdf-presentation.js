import {
  GlobalWorkerOptions,
  getDocument,
} from '../vendor/pdfjs/pdf.min.mjs';

GlobalWorkerOptions.workerSrc = new URL(
  '../vendor/pdfjs/pdf.worker.min.mjs',
  import.meta.url,
).href;

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

document.querySelectorAll('[data-pdf-presentation]').forEach((viewer) => {
  const stage = viewer.querySelector('[data-pdf-stage]');
  const canvas = viewer.querySelector('[data-pdf-canvas]');
  const context = canvas.getContext('2d', { alpha: false });
  const status = viewer.querySelector('[data-pdf-status]');
  const previous = viewer.querySelector('[data-pdf-prev]');
  const next = viewer.querySelector('[data-pdf-next]');
  const pageInput = viewer.querySelector('[data-pdf-page]');
  const total = viewer.querySelector('[data-pdf-total]');
  const progress = viewer.querySelector('[data-pdf-progress]');
  const zoomOut = viewer.querySelector('[data-pdf-zoom-out]');
  const zoomReset = viewer.querySelector('[data-pdf-zoom-reset]');
  const zoomIn = viewer.querySelector('[data-pdf-zoom-in]');
  const fullscreen = viewer.querySelector('[data-pdf-fullscreen]');

  let documentHandle;
  let currentPage = 1;
  let zoom = 1;
  let renderTask;
  let renderRequest = 0;
  let resizeTimer;

  const pageFromHash = () => {
    const match = window.location.hash.match(/^#page-(\d+)$/);
    return match ? Number(match[1]) : 1;
  };

  const updateControls = () => {
    const pageCount = documentHandle?.numPages || Number(total.textContent) || 1;
    pageInput.value = String(currentPage);
    pageInput.max = String(pageCount);
    total.textContent = String(pageCount);
    previous.disabled = currentPage <= 1;
    next.disabled = currentPage >= pageCount;
    progress.style.width = `${(currentPage / pageCount) * 100}%`;
    zoomReset.textContent = zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`;
    canvas.setAttribute('aria-label', `Page ${currentPage} of ${pageCount}`);
  };

  const renderPage = async () => {
    if (!documentHandle) return;
    const request = ++renderRequest;
    const page = await documentHandle.getPage(currentPage);
    if (request !== renderRequest) return;

    if (renderTask) {
      renderTask.cancel();
      renderTask = undefined;
    }

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(stage.clientWidth - 2, 320);
    const availableHeight = Math.max(stage.clientHeight - 2, 180);
    const fitScale = Math.min(
      availableWidth / baseViewport.width,
      availableHeight / baseViewport.height,
    );
    const cssScale = fitScale * zoom;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const viewport = page.getViewport({ scale: cssScale * pixelRatio });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${baseViewport.width * cssScale}px`;
    canvas.style.height = `${baseViewport.height * cssScale}px`;

    status.hidden = false;
    status.textContent = `Rendering page ${currentPage}…`;

    let task;
    try {
      task = page.render({ canvasContext: context, viewport });
      renderTask = task;
      await task.promise;
      if (request !== renderRequest) return;
      status.hidden = true;
      updateControls();
    } catch (error) {
      if (error?.name === 'RenderingCancelledException') return;
      status.hidden = false;
      status.textContent = 'This page could not be rendered. Use “Download PDF” to open the original file.';
      console.error(error);
    } finally {
      if (renderTask === task) renderTask = undefined;
    }
  };

  const showPage = (pageNumber, updateHash = true) => {
    if (!documentHandle) return;
    currentPage = clamp(Number(pageNumber) || 1, 1, documentHandle.numPages);
    stage.scrollTo({ top: 0, left: 0 });
    updateControls();
    if (updateHash) history.replaceState(null, '', `#page-${currentPage}`);
    renderPage();
  };

  const setZoom = (nextZoom) => {
    zoom = clamp(Math.round(nextZoom * 100) / 100, 0.5, 2.5);
    updateControls();
    renderPage();
  };

  previous.addEventListener('click', () => showPage(currentPage - 1));
  next.addEventListener('click', () => showPage(currentPage + 1));
  pageInput.addEventListener('change', () => showPage(pageInput.value));
  pageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      showPage(pageInput.value);
      pageInput.blur();
    }
  });
  zoomOut.addEventListener('click', () => setZoom(zoom - 0.25));
  zoomReset.addEventListener('click', () => setZoom(1));
  zoomIn.addEventListener('click', () => setZoom(zoom + 0.25));

  fullscreen.addEventListener('click', () => {
    if (document.fullscreenElement === viewer) {
      document.exitFullscreen();
    } else {
      viewer.requestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === viewer;
    fullscreen.textContent = active ? 'Exit fullscreen' : 'Fullscreen';
    window.setTimeout(renderPage, 80);
  });

  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') showPage(currentPage + 1);
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') showPage(currentPage - 1);
    if (event.key === 'Home') showPage(1);
    if (event.key === 'End' && documentHandle) showPage(documentHandle.numPages);
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderPage, 140);
  });

  getDocument({ url: viewer.dataset.pdfUrl }).promise
    .then((pdf) => {
      documentHandle = pdf;
      currentPage = clamp(pageFromHash(), 1, pdf.numPages);
      updateControls();
      renderPage();
    })
    .catch((error) => {
      status.textContent = 'The presentation could not be loaded. Use “Download PDF” to open the original file.';
      console.error(error);
    });
});
