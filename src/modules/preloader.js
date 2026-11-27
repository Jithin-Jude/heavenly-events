export const FRAME_COUNT = 100;

export const frameUrl = (index, base = import.meta.env?.BASE_URL ?? '/') =>
  `${base}frames/frame_${String(index + 1).padStart(4, '0')}.webp`;

/** Bounded concurrency and timeouts: a missing asset can never trap the loader. */
export function createPreloader({ count = FRAME_COUNT, onProgress = () => {}, onFrame = () => {} } = {}) {
  const frames = Array(count).fill(null);
  let settled = 0;
  let loaded = 0;
  let stopped = false;
  const active = new Set();
  const maxWidth = matchMedia('(max-width: 600px)').matches ? 800 : 1440;

  async function loadFrame(index) {
    if (stopped) return;
    let image = new Image();
    image.decoding = 'async';
    if (index === 0) image.fetchPriority = 'high';
    let cancel;
    let timer;
    try {
      await new Promise((resolve, reject) => {
        const cleanup = () => { clearTimeout(timer); image.onload = null; image.onerror = null; };
        cancel = () => { cleanup(); image.src = ''; reject(new Error('Cancelled')); };
        active.add(cancel);
        timer = setTimeout(() => { cleanup(); image.src = ''; reject(new Error('Frame timeout')); }, 8000);
        image.onload = () => { cleanup(); resolve(); };
        image.onerror = () => { cleanup(); reject(new Error('Frame unavailable')); };
        image.src = frameUrl(index);
      });
      // Resize decoded storage as well as the canvas backing store on mobile.
      // Keep all frames available for backwards scrubbing without refetching.
      let drawable = image;
      if (typeof createImageBitmap === 'function') {
        try {
          drawable = await createImageBitmap(image, {
            resizeWidth: Math.min(maxWidth, image.naturalWidth),
            resizeQuality: 'high',
          });
        } catch { /* Older Safari can draw the original HTMLImageElement. */ }
      }
      if (stopped) { drawable.close?.(); return; }
      frames[index] = drawable;
      loaded++;
      onFrame(index);
    } catch { /* Render the nearest successfully loaded frame, or a gradient. */ }
    finally {
      active.delete(cancel);
      settled++;
      if (!stopped) onProgress({ settled, loaded, failed: settled - loaded, total: count });
      image = null;
    }
  }

  async function batch(start, end, concurrency = 5) {
    let next = start;
    await Promise.all(Array.from({ length: Math.min(concurrency, end - start) }, async () => {
      while (next < end && !stopped) await loadFrame(next++);
    }));
  }

  return {
    frames,
    loadInitial: () => batch(0, Math.min(15, count)),
    loadRemaining: () => batch(Math.min(15, count), count, 4),
    destroy() {
      stopped = true;
      for (const cancel of active) cancel();
      frames.forEach(frame => frame?.close?.());
      frames.fill(null);
    },
  };
}
