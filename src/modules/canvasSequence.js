export function coverRect(sourceWidth, sourceHeight, width, height) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight };
}

export function nearestFrame(frames, target) {
  const index = Math.max(0, Math.min(frames.length - 1, Math.round(target)));
  for (let distance = 0; distance < frames.length; distance++) {
    if (frames[index - distance]) return frames[index - distance];
    if (frames[index + distance]) return frames[index + distance];
  }
  return null;
}

export function createCanvasSequence(canvas, frames) {
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return { setFrame() {}, invalidate() {}, destroy() {} };
  let current = 0;
  let raf = 0;
  let width = 1;
  let height = 1;
  let destroyed = false;

  function draw() {
    raf = 0;
    const image = nearestFrame(frames, current);
    if (!image) {
      const gradient = context.createRadialGradient(width * .57, height * .4, 0, width * .5, height * .5, Math.max(width, height));
      gradient.addColorStop(0, '#675432'); gradient.addColorStop(.4, '#242019'); gradient.addColorStop(1, '#090a09');
      context.fillStyle = gradient; context.fillRect(0, 0, width, height);
      return;
    }
    const rect = coverRect(image.naturalWidth || image.width, image.naturalHeight || image.height, width, height);
    context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  }
  function invalidate() { if (!destroyed && !raf) raf = requestAnimationFrame(draw); }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    invalidate();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  resize();
  return {
    setFrame(frame) { const next = Math.round(frame); if (current !== next) { current = next; invalidate(); } },
    invalidate,
    destroy() { destroyed = true; cancelAnimationFrame(raf); observer.disconnect(); window.removeEventListener('resize', resize); },
  };
}
