/* ==========================================================================
   TYCHE MOTION CONTROLLER (Modeled on Pathos Minimal Scroll Feel)
   IntersectionObserver scroll reveals, pop-ins, and sticky effects.
   ========================================================================== */

class TycheMotion {
  constructor() {
    this.observer = null;
    this.initScrollReveal();
    this.initStickyHeader();
  }

  initScrollReveal() {
    const options = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Optional: unobserve once revealed for clean performance
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    this.observeAll();
  }

  observeAll() {
    const elements = document.querySelectorAll('[data-reveal]');
    elements.forEach((el, index) => {
      // Add stagger classes if inside a grid or list
      if (!el.classList.contains('is-revealed')) {
        this.observer.observe(el);
      }
    });
  }

  initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 120) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  refresh() {
    setTimeout(() => {
      this.observeAll();
    }, 50);
  }
}

window.motion = new TycheMotion();
