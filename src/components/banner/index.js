(function () {
  // 轮播条幅总开关：false 时不请求数据、不渲染条幅，页面与无条幅时完全一致
  const BANNER_ENABLED = true;
  // 每条信息默认停留时间（秒），数据项缺少 duration 或值非法时使用
  const DEFAULT_DURATION = 30;

  if (!BANNER_ENABLED) return;

  // 必须在同步阶段记录脚本地址，异步回调中 document.currentScript 会失效
  const scriptSrc = document.currentScript ? document.currentScript.src : '';
  const dataUrl = new URL('data.json', scriptSrc || window.location.href).href;

  // 渲染前筛选：show 不为 false 且标题非空，否则不展示
  function isValidItem(item) {
    return (
      item &&
      typeof item === 'object' &&
      item.show !== false &&
      typeof item.title === 'string' &&
      item.title.trim() !== ''
    );
  }

  // 当前条目的停留时长（毫秒），非法值回退到默认时长
  function getDuration(item) {
    const duration = Number(item.duration);
    return Number.isFinite(duration) && duration > 0 ? duration * 1000 : DEFAULT_DURATION * 1000;
  }

  // 箭头图标：使用内联 SVG，颜色通过 currentColor 跟随文字颜色
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

  // 每条条幅保持同一套 DOM 结构：文字 + 箭头；有 url 时整体用 a 包裹
  function createSlide(item) {
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    const slide = document.createElement(url ? 'a' : 'div');
    slide.className = 'banner-slide';
    if (url) {
      slide.href = url;
      slide.target = '_blank';
      slide.rel = 'noopener noreferrer';
    }
    // 颜色支持 red、#ff0000、#f00 等任意合法 CSS 颜色，非法值浏览器自动忽略
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

  function renderBanner(list) {
    document.body.classList.add('has-banner');
    const banner = document.createElement('div');
    banner.className = 'banner';
    document.body.insertBefore(banner, document.body.firstChild);

    // 只有一条时静态展示，不启动轮播
    if (list.length === 1) {
      banner.appendChild(createSlide(list[0]));
      return;
    }

    let currentIndex = 0;
    let timer = null;
    let remaining = 0; // 距下一次切换的剩余时间（毫秒）
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
      banner.replaceChildren(createSlide(list[currentIndex]));
      scheduleNext(getDuration(list[currentIndex]));
    }

    // 标签页隐藏时暂停计时，恢复后按剩余时间继续，避免后台堆积或可见性抖动导致重头计时
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
      // 筛选后列表为空：不渲染、不占位，相当于不显示条幅
      if (bannerList.length > 0) renderBanner(bannerList);
    })
    .catch((error) => {
      console.error('条幅数据读取失败：', error.message);
    });
})();
