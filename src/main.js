import './style.css';
import { createPreloader, FRAME_COUNT } from './modules/preloader.js';
import { createCanvasSequence } from './modules/canvasSequence.js';
import { createScrollAnimation } from './modules/scrollAnimation.js';
import { setupForm } from './modules/formHandler.js';

setupForm(document.querySelector('#enquiry-form'));
document.querySelector('#year').textContent = new Date().getFullYear();

const loaderElement = document.querySelector('#preloader');
const background = document.querySelector('#background-progress');
loaderElement.hidden = false;
background.hidden = false;
let sequence;
const loader = createPreloader({
  onFrame: () => sequence?.invalidate(),
  onProgress({ settled, loaded, failed, total }) {
    const percent = Math.round(loaded / total * 100);
    document.querySelector('#loader-fill').style.width = `${Math.min(settled / 15 * 100, 100)}%`;
    document.querySelector('#loader-label').textContent = `Preparing ${Math.min(settled, 15)} of 15 opening frames`;
    document.querySelector('#background-label').textContent = `Loaded ${percent}%${failed ? ' · fallback active' : ''}`;
    document.querySelector('#background-fill').style.width = `${percent}%`;
    if (settled === total && !failed) background.hidden = true;
    if (settled === total && failed) {
      document.querySelector('#background-label').textContent = loaded ? 'Preview ready · some imagery unavailable' : 'Imagery unavailable · explore below';
    }
  },
});
sequence = createCanvasSequence(document.querySelector('#sequence'), loader.frames);
// Establish the full scroll layout before waiting on network requests.
const stopAnimation = createScrollAnimation(sequence, FRAME_COUNT);
let dismissed = false;
function dismissLoader() {
  if (dismissed) return;
  dismissed = true;
  loaderElement.classList.add('is-ready');
  setTimeout(() => { loaderElement.hidden = true; }, 450);
}
// Exceptional slow/offline network escape; normal path waits for the first 15.
const safetyTimeout = setTimeout(dismissLoader, 12000);
loader.loadInitial().then(() => {
  clearTimeout(safetyTimeout); dismissLoader();
  return loader.loadRemaining();
});
document.querySelectorAll('a[href="#enquiry"]').forEach(link => link.addEventListener('click', dismissLoader));

if (import.meta.hot) import.meta.hot.dispose(() => {
  clearTimeout(safetyTimeout); stopAnimation(); sequence.destroy(); loader.destroy();
});
