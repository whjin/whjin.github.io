loadData();

async function loadData() {
  try {
    const response = await fetch('./link.json');
    if (!response.ok) throw new Error('数据文件加载失败');
    const data = await response.json();
    const linkContainer = document.querySelector('.link-container');
    const categoryMap = data.categoryConfig || {};

    const buildSectionSkeleton = (sectionData, prefix) => {
      if (!sectionData?.show) return '';
      const { title, subtitle, list } = sectionData;
      return `
        <section class="section">
          <h2 class="section-title">${title} <span>(${list.length})</span></h2>
          <p class="section-subtitle">${subtitle}</p>
          <div id="${prefix}Grid" class="card-grid ${prefix}-grid"></div>
        </section>
      `;
    };

    const renderGrid = (gridId, list, cardTemplate) => {
      const gridEl = document.getElementById(gridId);
      if (!gridEl) return;
      gridEl.innerHTML = list.map(cardTemplate).join('');
    };

    const bindCardJump = (gridId) => {
      const gridEl = document.getElementById(gridId);
      if (!gridEl) return;
      gridEl.addEventListener('click', (e) => {
        const card = e.target.closest('.powering-card, .recommend-card');
        if (!card) return;
        const targetUrl = card.dataset.url;
        if (!targetUrl || targetUrl === '#') return;
        window.open(targetUrl, '_blank', 'noopener noreferrer');
      });
    };

    const poweringCardTemplate = (item) => `
      <div class="powering-card" data-url="${item.url || '#'}">
        <span class="card-tag ${categoryMap[item.category] || ''}">${item.category}</span>
        <img src="${item.cover}" alt="${item.name}" class="card-cover">
        <div class="card-footer">
          <img src="${item.avatar}" alt="${item.name}" class="card-avatar">
          <div class="card-info">
            <div class="card-name">${item.name}</div>
            <div class="card-desc" title="${item.desc}">${item.desc}</div>
          </div>
        </div>
      </div>
    `;

    const recommendCardTemplate = (item) => `
      <div class="recommend-card" data-url="${item.url || '#'}">
        <img src="${item.avatar}" alt="${item.name}" class="card-avatar">
        <div class="card-info">
          <div class="card-name">${item.name}</div>
          <div class="card-desc" title="${item.desc}">${item.desc}</div>
        </div>
      </div>
    `;

    linkContainer.innerHTML =
      buildSectionSkeleton(data.powering, 'powering') +
      buildSectionSkeleton(data.recommend, 'recommend');

    if (data.powering?.show) renderGrid('poweringGrid', data.powering.list, poweringCardTemplate);
    if (data.recommend?.show)
      renderGrid('recommendGrid', data.recommend.list, recommendCardTemplate);

    bindCardJump('poweringGrid');
    bindCardJump('recommendGrid');

    restoreScrollPosition();
    const scrollContainer = getScrollContainer();
    scrollContainer.addEventListener('scroll', saveScrollPosition);
  } catch (error) {
    console.error('页面加载出错:', error);
    document.querySelector('.link-container').innerHTML =
      '<p class="load-fail">内容加载失败，请检查link.json文件是否存在</p>';
  }
}

function throttle(fn, delay = 150) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

function getScrollContainer() {
  return document.querySelector('.content-area') || window;
}

const saveScrollPosition = throttle(() => {
  const container = getScrollContainer();
  const scrollY = container === window ? window.scrollY : container.scrollTop;
  localStorage.setItem('scrollPosition_link', String(scrollY));
});

function restoreScrollPosition() {
  const savedY = localStorage.getItem('scrollPosition_link');
  if (savedY === null) return;
  const container = getScrollContainer();
  const targetY = Number(savedY);
  if (container === window) {
    window.scrollTo(0, targetY);
  } else {
    container.scrollTop = targetY;
  }
}
