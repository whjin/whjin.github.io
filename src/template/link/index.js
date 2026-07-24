(function () {
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

  function getTimeStamp(dateStr) {
    if (!dateStr) return 0;
    const ts = new Date(dateStr).getTime();
    return isNaN(ts) ? 0 : ts;
  }

  function getScrollContainer() {
    return document.querySelector('.content-area') || window;
  }

  function getScrollKey() {
    const params = new URLSearchParams(window.location.search);
    const pathParam = params.get('path');
    let pathPart = 'link';
    if (pathParam && typeof pathParam === 'string') {
      const parts = pathParam.split('_');
      pathPart = parts[1] || parts[0] || 'link';
    }
    return `scrollPosition_${pathPart}`;
  }

  const defaultAvatar = 'https://picsum.photos/seed/jizhi-avatar/100';
  const defaultCover = 'https://picsum.photos/seed/jizhi/400/300';
  const renderModes = {
    recommend: {
      gridClass: 'recommend-grid',
      defaultFields: { url: 'url', avatar: 'avatar', name: 'name', desc: 'desc' },
      template: (item) => {
        const avatar = item.avatar || defaultAvatar;
        const name = item.name || '';
        const desc = item.desc || '';
        const url = item.url || '#';
        return `
          <div class="recommend-card" data-url="${url}">
            <img src="${avatar}" alt="${name}" class="card-avatar">
            <div class="card-info">
              <div class="card-name" title="${name}">${name}</div>
              <div class="card-desc" title="${desc}">${desc}</div>
            </div>
          </div>
        `;
      },
    },
    powering: {
      gridClass: 'powering-grid',
      defaultFields: {
        url: 'url',
        cover: 'cover',
        avatar: 'avatar',
        name: 'name',
        desc: 'desc',
        category: 'category',
      },
      template: (item, categoryConfig) => {
        const url = item.url || '#';
        const cover = item.cover || defaultCover;
        const avatar = item.avatar || defaultAvatar;
        const name = item.name || '';
        const desc = item.desc || '';

        let tagHtml = '';
        if (item.category) {
          const tagColor = categoryConfig?.[item.category] || '#6b7280';
          tagHtml = `<span class="card-tag" style="background-color: ${tagColor};">${item.category}</span>`;
        }

        return `
          <div class="powering-card" data-url="${url}">
            ${tagHtml}
            <img src="${cover}" alt="${name}" class="card-cover">
            <div class="card-footer">
              <img src="${avatar}" alt="${name}" class="card-avatar">
              <div class="card-info">
                <div class="card-name" title="${name}">${name}</div>
                <div class="card-desc" title="${desc}">${desc}</div>
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  function getModeConfig(sectionKey, sectionData) {
    const modeName = sectionData.mode || sectionKey;
    return { modeName, config: renderModes[modeName] || null };
  }

  function applyFieldMap(item, customMap, defaultFields) {
    const mergedMap = { ...defaultFields, ...customMap };
    const result = {};
    for (const [templateKey, dataKey] of Object.entries(mergedMap)) {
      result[templateKey] = item[dataKey];
    }
    return { ...item, ...result };
  }

  function sortListByUpdated(list) {
    return [...list].sort((a, b) => {
      const tsA = getTimeStamp(a.updated);
      const tsB = getTimeStamp(b.updated);
      if (tsA > 0 && tsB > 0) return tsB - tsA;
      if (tsA > 0) return -1;
      if (tsB > 0) return 1;
      return 0;
    });
  }

  function sortSectionKeys(keys, data) {
    const modePriority = ['recommend', 'powering'];
    return [...keys].sort((a, b) => {
      const { modeName: modeA } = getModeConfig(a, data[a]);
      const { modeName: modeB } = getModeConfig(b, data[b]);

      const idxA = modePriority.indexOf(modeA);
      const idxB = modePriority.indexOf(modeB);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      if (idxA !== idxB) return idxA - idxB;

      const isDefaultA = a === modeA;
      const isDefaultB = b === modeB;
      if (isDefaultA && !isDefaultB) return -1;
      if (!isDefaultA && isDefaultB) return 1;
      return 0;
    });
  }

  function buildSectionSkeleton(sectionKey, sectionData) {
    if (!sectionData?.show) return '';
    const { config } = getModeConfig(sectionKey, sectionData);
    if (!config) return '';

    const { title, subtitle, list } = sectionData;
    return `
      <section class="section">
        <h2 class="section-title">${title} <span>(${list.length})</span></h2>
        <p class="section-subtitle">${subtitle}</p>
        <div id="${sectionKey}Grid" class="card-grid ${config.gridClass}"></div>
      </section>
    `;
  }

  function renderGrid(gridId, list, modeConfig, categoryConfig, fieldMap) {
    const gridEl = document.getElementById(gridId);
    if (!gridEl) return;
    const mappedList = list.map((item) => applyFieldMap(item, fieldMap, modeConfig.defaultFields));
    gridEl.innerHTML = mappedList.map((item) => modeConfig.template(item, categoryConfig)).join('');
  }

  function bindGlobalCardJump(container) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const card = e.target.closest('[data-url]');
      if (!card) return;
      const targetUrl = card.dataset.url;
      if (!targetUrl || targetUrl === '#') return;
      window.open(targetUrl, '_blank', 'noopener noreferrer');
    });
  }

  async function loadData() {
    const linkContainer = document.querySelector('.link-container');
    if (!linkContainer) return;

    try {
      const response = await fetch('./data.json');
      if (!response.ok) throw new Error('数据文件加载失败');
      const data = await response.json();
      const categoryConfig = data.categoryConfig || {};

      const rawSectionKeys = Object.keys(data).filter((key) => {
        const item = data[key];
        return item && typeof item === 'object' && 'show' in item && 'list' in item;
      });
      const sectionKeys = sortSectionKeys(rawSectionKeys, data);

      linkContainer.innerHTML = sectionKeys
        .map((key) => buildSectionSkeleton(key, data[key]))
        .join('');

      sectionKeys.forEach((key) => {
        const sectionData = data[key];
        const { config } = getModeConfig(key, sectionData);
        if (!config) return;

        const sortedList = sortListByUpdated(sectionData.list);
        renderGrid(`${key}Grid`, sortedList, config, categoryConfig, sectionData.fieldMap || {});
      });

      bindGlobalCardJump(linkContainer);

      const scrollKey = getScrollKey();
      const scrollContainer = getScrollContainer();
      const saveScrollPosition = throttle(() => {
        const scrollY = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
        localStorage.setItem(scrollKey, scrollY);
      }, 150);

      function restoreScrollPosition() {
        const savedY = localStorage.getItem(scrollKey);
        if (savedY === null) return;
        const targetY = Number(savedY);
        scrollContainer === window
          ? window.scrollTo(0, targetY)
          : (scrollContainer.scrollTop = targetY);
      }

      requestAnimationFrame(restoreScrollPosition);
      scrollContainer.addEventListener('scroll', saveScrollPosition);
    } catch (error) {
      console.error('页面加载出错:', error);
      linkContainer.innerHTML =
        '<p class="load-fail">内容加载失败，请检查data.json文件是否存在</p>';
    }
  }

  loadData();
})();
