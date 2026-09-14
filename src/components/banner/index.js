(function () {
  const BANNER_ENABLED = true;
  const DEFAULT_DURATION = 30;

  if (!BANNER_ENABLED) return;

  const scriptSrc = document.currentScript ? document.currentScript.src : '';
  const dataUrl = new URL('data.json', scriptSrc || window.location.href).href;

  function isValidItem(item) {
    return (
      item &&
      typeof item === 'object' &&
      item.show !== false &&
      typeof item.title === 'string' &&
      item.title.trim() !== ''
    );
  }

  function getDuration(item) {
    const duration = Number(item.duration);
    return Number.isFinite(duration) && duration > 0 ? duration * 1000 : DEFAULT_DURATION * 1000;
  }

  function createArrowIcon() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'banner-arrow');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', '5');
    line.setAttribute('y1', '12');
    line.setAttribute('x2', '19');
    line.setAttribute('y2', '12');
    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', '12 5 19 12 12 19');
    svg.appendChild(line);
    svg.appendChild(polyline);
    return svg;
  }

  function createSlide(item) {
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const slide = document.createElement(url ? 'a' : 'div');
    slide.className = 'banner-slide';
    if (url) {
      slide.href = url;
      slide.target = '_blank';
      slide.rel = 'noopener noreferrer';
    }
    if (typeof item.color === 'string' && item.color.trim() !== '') {
      slide.style.color = item.color.trim();
    }

    const text = document.createElement('span');
    text.className = 'banner-text';
    text.textContent = item.title.trim();

    slide.appendChild(text);
    slide.appendChild(createArrowIcon());
    return slide;
  }

  function applyTitleIfOverflow(slide, fullText) {
    const isOverflowing = slide.scrollWidth > slide.clientWidth;
    if (isOverflowing) {
      slide.title = fullText;
    } else {
      slide.removeAttribute('title');
    }
  }

  function renderBanner(list) {
    document.body.classList.add('has-banner');
    const banner = document.createElement('div');
    banner.className = 'banner';
    document.body.insertBefore(banner, document.body.firstChild);

    let currentSlide = null;
    let currentItem = null;

    function updateTitle() {
      if (currentSlide && currentItem) {
        applyTitleIfOverflow(currentSlide, currentItem.title.trim());
      }
    }

    let resizeRaf = null;
    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        updateTitle();
      });
    });

    if (list.length === 1) {
      currentItem = list[0];
      currentSlide = createSlide(currentItem);
      banner.appendChild(currentSlide);
      updateTitle();
      return;
    }

    let currentIndex = 0;
    let timer = null;
    let remaining = 0;
    let startTime = 0;

    function scheduleNext(delay) {
      clearTimeout(timer);
      remaining = delay;
      startTime = Date.now();
      timer = setTimeout(() => {
        showSlide((currentIndex + 1) % list.length);
      }, delay);
    }

    function showSlide(index) {
      currentIndex = index;
      currentItem = list[currentIndex];
      currentSlide = createSlide(currentItem);
      banner.replaceChildren(currentSlide);
      updateTitle();
      scheduleNext(getDuration(currentItem));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(timer);
        remaining -= Date.now() - startTime;
      } else if (remaining > 0) {
        scheduleNext(Math.max(remaining, 200));
      }
    });

    showSlide(0);
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`条幅数据加载失败: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) return;
      const bannerList = data.filter(isValidItem);
      if (bannerList.length > 0) renderBanner(bannerList);
    })
    .catch((error) => {
      console.error('条幅数据读取失败：', error.message);
    });
})();
