function handleScroll() {
  const IDLE_TIME = 6000;
  let idleTimer = null;
  let scrollDebounceTimer = null;
  const scrollTopBtn = document.querySelector('.scroll-top');
  const navContainer = document.querySelector('.nav-container');
  const scrollContainer = document.querySelector('.content-area');
  if (!scrollContainer) return;

  function clearTransition(element) {
    if (element._fadeEndHandler) {
      element.removeEventListener('transitionend', element._fadeEndHandler);
      element._fadeEndHandler = null;
    }
    void element.offsetWidth;
  }

  function fadeIn(element, duration = 500) {
    if (element.dataset.visible === 'true') return;
    clearTransition(element);
    element.dataset.visible = 'true';
    element.style.display = 'block';
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    const onEnd = () => {
      element.style.opacity = '';
      element.style.transition = '';
      element.removeEventListener('transitionend', onEnd);
      element._fadeEndHandler = null;
    };
    element._fadeEndHandler = onEnd;
    element.addEventListener('transitionend', onEnd);
  }

  function fadeOut(element, duration = 500) {
    if (element.dataset.visible === 'false') return;
    clearTransition(element);
    element.dataset.visible = 'false';
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = '0';
    });
    const onEnd = () => {
      element.style.display = 'none';
      element.style.opacity = '';
      element.style.transition = '';
      element.removeEventListener('transitionend', onEnd);
      element._fadeEndHandler = null;
    };
    element._fadeEndHandler = onEnd;
    element.addEventListener('transitionend', onEnd);
  }

  function smoothScrollToTop(container, duration = 500) {
    const startScrollTop = container.scrollTop;
    if (startScrollTop === 0) return;
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      container.scrollTop = startScrollTop * (1 - easeProgress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  function resetIdleTimer() {
    if (!scrollTopBtn) return;
    if (idleTimer) clearTimeout(idleTimer);
    if (scrollTopBtn.dataset.visible === 'true') {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.transition = 'opacity 500ms ease';
      idleTimer = setTimeout(() => {
        scrollTopBtn.style.opacity = '0';
      }, IDLE_TIME);
    }
  }

  function wakeUpButton() {
    if (!scrollTopBtn || scrollTopBtn.dataset.visible !== 'true') return;
    if (idleTimer) clearTimeout(idleTimer);
    scrollTopBtn.style.transition = 'opacity 150ms ease';
    scrollTopBtn.style.opacity = '1';
  }

  function handleScroll() {
    const scrollTop = scrollContainer.scrollTop;

    if (navContainer && navContainer.dataset.forceHidden !== 'true') {
      if (scrollTop > 100) {
        fadeOut(navContainer);
      } else {
        fadeIn(navContainer);
      }
    }

    if (scrollTopBtn) {
      if (scrollTop > 100) {
        fadeIn(scrollTopBtn);
        resetIdleTimer();
      } else {
        fadeOut(scrollTopBtn);
        if (idleTimer) clearTimeout(idleTimer);
      }
    }
  }

  scrollContainer.addEventListener('scroll', function () {
    wakeUpButton();
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = setTimeout(handleScroll, 50);
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      smoothScrollToTop(scrollContainer);
    });
    scrollTopBtn.addEventListener('mouseenter', function () {
      if (idleTimer) clearTimeout(idleTimer);
      this.style.transition = 'opacity 150ms ease';
      this.style.opacity = '1';
    });
    scrollTopBtn.addEventListener('mouseleave', function () {
      resetIdleTimer();
    });
  }

  handleScroll();
}

document.addEventListener('DOMContentLoaded', handleScroll);
