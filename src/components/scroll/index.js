function scrollControls() {
  const IDLE_TIME = 6000;
  let idleTimer = null;
  let scrollDebounceTimer = null;
  const scrollTopBtn = document.querySelector('.scroll-top');
  const navContainer = document.querySelector('.nav-container');
  const contentArea = document.querySelector('.content-area');

  // 回到顶部按钮定位：bottom 首页 66px、二级页 40px；
  // right 无目录时贴视口最右（20px），有目录时贴目录左侧
  function positionScrollTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;
    const isHome = document.body.classList.contains('home-page');
    btn.style.bottom = isHome ? '66px' : '40px';
    const sidebar = document.querySelector('.sidebar-area');
    const hasToc =
      sidebar && getComputedStyle(sidebar).display !== 'none' && sidebar.offsetWidth > 0;
    if (hasToc) {
      const left = sidebar.getBoundingClientRect().left;
      btn.style.right = Math.max(0, window.innerWidth - left + 20) + 'px';
    } else {
      btn.style.right = '20px';
    }
  }

  // 实际滚动可能是 window（首页：.content-area overflow:visible）或 .content-area（二级页固定高度）
  // 同时监听两者，取最大滚动值，确保任意一种情况都生效
  function getScrollTop() {
    const w = window.pageYOffset || document.documentElement.scrollTop || 0;
    const c = contentArea ? contentArea.scrollTop || 0 : 0;
    return Math.max(w, c);
  }

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

  function smoothScrollToTop(duration = 500) {
    const startTop = getScrollTop();
    if (startTop === 0) return;
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const val = startTop * (1 - easeProgress);
      const w = window.pageYOffset || document.documentElement.scrollTop || 0;
      const c = contentArea ? contentArea.scrollTop || 0 : 0;
      if (w > 0) window.scrollTo(0, val);
      if (c > 0) contentArea.scrollTop = val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function resetIdleTimer() {
    if (!scrollTopBtn || scrollTopBtn.dataset.visible !== 'true') return;
    if (idleTimer) clearTimeout(idleTimer);
    scrollTopBtn.style.opacity = '1';
    scrollTopBtn.style.transition = 'opacity 500ms ease';
    idleTimer = setTimeout(() => {
      scrollTopBtn.style.opacity = '0';
    }, IDLE_TIME);
  }

  function wakeUpButton() {
    if (!scrollTopBtn) return;
    const scrollTop = getScrollTop();
    if (scrollTop <= 100) {
      fadeOut(scrollTopBtn);
      if (idleTimer) clearTimeout(idleTimer);
      return;
    }
    if (scrollTopBtn.dataset.visible !== 'true') return;
    if (idleTimer) clearTimeout(idleTimer);
    scrollTopBtn.style.transition = 'opacity 150ms ease';
    scrollTopBtn.style.opacity = '1';
  }

  function handleScroll() {
    const scrollTop = getScrollTop();

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

  const listener = function () {
    wakeUpButton();
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = setTimeout(handleScroll, 50);
  };
  window.addEventListener('scroll', listener, { passive: true });
  if (contentArea) contentArea.addEventListener('scroll', listener, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      smoothScrollToTop();
    });
    scrollTopBtn.addEventListener('mouseenter', function () {
      const scrollTop = getScrollTop();
      if (scrollTop <= 100) return;
      if (idleTimer) clearTimeout(idleTimer);
      this.style.transition = 'opacity 150ms ease';
      this.style.opacity = '1';
    });
    scrollTopBtn.addEventListener('mouseleave', function () {
      resetIdleTimer();
    });
  }

  handleScroll();
  positionScrollTop();
  window.addEventListener('resize', positionScrollTop);
  // 目录显隐变化（点「隐藏目录」按钮等）时重算按钮位置
  const sidebarEl = document.querySelector('.sidebar-area');
  if (sidebarEl && typeof MutationObserver !== 'undefined') {
    new MutationObserver(positionScrollTop).observe(sidebarEl, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }
  // 等 viewer 处理完 sidebar 显示状态后再校准一次
  setTimeout(positionScrollTop, 300);
}

document.addEventListener('DOMContentLoaded', scrollControls);
