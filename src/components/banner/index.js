(function () {
  const BANNER_ENABLED = true;
  const DEFAULT_DURATION = 30;

  if (!BANNER_ENABLED) return;

  // 数据复用：统一从友链数据源读取 link === "banner" 的节点，避免双份维护
  const dataUrl = new URL('/src/template/posts/Link/友链/data.json', location.origin).href;

  function findBannerSection(data) {
    if (!data || typeof data !== 'object') return null;
    for (const key of Object.keys(data)) {
      const node = data[key];
      if (node && typeof node === 'object' && node.link === 'banner' && Array.isArray(node.list)) {
        return node.list;
      }
    }
    return null;
  }

  function isValidItem(item) {
    return (
      item &&
      typeof item === 'object' &&
      item.show !== false &&
      typeof item.title === 'string' &&
      item.title.trim() !== ''
    );
  }

  // banner 展示文案：优先用长 slogan（desc），退回到 title，保持原条幅视觉长度
  function itemText(item) {
    if (typeof item.desc === 'string' && item.desc.trim()) return item.desc.trim();
    if (typeof item.title === 'string' && item.title.trim()) return item.title.trim();
    return '';
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

    const imageSrc =
      typeof item.image === 'string' && item.image.trim()
        ? item.image.trim()
        : 'https://picsum.photos/seed/ai/100';
    const image = document.createElement('img');
    image.className = 'banner-avatar';
    image.src = imageSrc;
    image.alt = '';

    const text = document.createElement('span');
    text.className = 'banner-text';
    text.textContent = itemText(item);

    slide.appendChild(image);
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

    // 轮播轨道（订阅按钮已移至社交图标栏，banner 内容居中）
    const track = document.createElement('div');
    track.className = 'banner-track';
    banner.appendChild(track);

    let currentSlide = null;
    let currentItem = null;

    function updateTitle() {
      if (currentSlide && currentItem) {
        applyTitleIfOverflow(currentSlide, itemText(currentItem));
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
      track.appendChild(currentSlide);
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
      track.replaceChildren(currentSlide);
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
      const list = findBannerSection(data);
      if (!list) return;
      const bannerList = list.filter(isValidItem);
      if (bannerList.length > 0) renderBanner(bannerList);
    })
    .catch((error) => {
      console.error('条幅数据读取失败：', error.message);
    });
})();
