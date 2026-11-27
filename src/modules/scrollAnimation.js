import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export function createScrollAnimation(sequence, count) {
  const media = gsap.matchMedia();
  const track = document.querySelector('.scroll-track');
  const viewport = document.querySelector('.sequence-viewport');
  const cards = [...document.querySelectorAll('.story-card')];
  const windows = [[.10, .25], [.45, .60], [.80, .95]];

  media.add('(prefers-reduced-motion: no-preference)', () => {
    document.documentElement.classList.add('motion-enabled');
    const playhead = { frame: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: track, start: 'top top', end: 'bottom bottom',
        pin: viewport, pinSpacing: false, scrub: .5, invalidateOnRefresh: true,
      },
      onUpdate() {
        sequence.setFrame(playhead.frame);
        const progress = playhead.frame / (count - 1);
        cards.forEach((card, i) => card.setAttribute('aria-hidden', String(progress < windows[i][0] || progress > windows[i][1])));
      },
    });
    timeline.to(playhead, { frame: count - 1, duration: 1 }, 0);
    timeline.to('.hero-intro', { autoAlpha: 0, y: -25, duration: .075 }, .015);
    cards.forEach((card, i) => {
      const [start, end] = windows[i];
      timeline.fromTo(card, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .035 }, start);
      timeline.to(card, { autoAlpha: 0, y: -20, duration: .035 }, end - .035);
    });
    ScrollTrigger.refresh();
    return () => {
      document.documentElement.classList.remove('motion-enabled');
      cards.forEach(card => card.setAttribute('aria-hidden', 'true'));
    };
  });
  media.add('(prefers-reduced-motion: reduce)', () => {
    sequence.setFrame(0);
  });
  return () => media.revert();
}
