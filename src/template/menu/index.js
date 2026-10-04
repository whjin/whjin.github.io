

(function () {
  var host = window.location.hostname;
  var isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0';
  // 热重载仅本地开发启用；渲染逻辑（generateCard 等）本地/线上都需执行
  if (isLocal) {
    var ws;
    function connect() {
      try {
        ws = new WebSocket('ws://' + window.location.host);
        ws.onmessage = function (e) {
          if (e.data === 'reload') window.location.reload();
        };
        ws.onclose = function () {
          setTimeout(connect, 1000);
        };
        ws.onerror = function () {
          try { ws.close(); } catch (x) { }
        };
      } catch (e) { }
    }
    connect();
  }

  generateCard();
  generateTOC();

  const MARKED_HTML = '<span class="marked">*</span>';
  const STORAGE_KEYS = {
    lastScrollCardTitle: 'lastScrollCardTitle',
    lastScrollCardTop: 'lastScrollCardTop',
    navigateToLink: 'navigateToLink',
  };
  function debounce(func, delay = 100) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }
  function createMenuItem(item) {
    const liEl = document.createElement('li');
    const aEl = document.createElement('a');
    aEl.rel = 'noopener noreferrer';
    aEl.target = '_blank';
    aEl.innerHTML = item.marked ? `${MARKED_HTML}${item.title}` : item.title;
    aEl.title = item.description || item.title || '';
    aEl.href = item.url || '';
    let isLinkPage = !!item.url && item.url.includes('/viewer.html?') && item.url.includes('&format=html');
    if (isLinkPage) {
      aEl.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEYS.navigateToLink, true);
      });
    }
    liEl.appendChild(aEl);
    return liEl;
  }
  async function generateCard() {
    const menuData = await fetchData('/src/template/feed/data.json');
    const finalMenuData = processMenuData(menuData);
    const containerEl = document.querySelector('.card-container');
    const fragment = document.createDocumentFragment();
    finalMenuData.forEach((m) => {
      if (m.show !== false && m.items.length > 0) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.dataset.cardTitle = m.title;
        const headerEl = document.createElement('div');
        headerEl.className = 'card-title';
        headerEl.innerText = m.title;
        if (m.items.length > 7) {
          const countBadge = document.createElement('sup');
          countBadge.textContent = m.items.length;
          countBadge.className = 'count-badge';
          countBadge.classList.toggle('normal', m.items.length <= 99);
          headerEl.appendChild(countBadge);
          const expandBtn = document.createElement('span');
          expandBtn.className = 'card-expand-btn';
          expandBtn.title = '展开';
          const expandImg = document.createElement('img');
          expandImg.src = '/src/images/icons/zoomout.png';
          expandImg.alt = '展开';
          expandBtn.appendChild(expandImg);
          expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(m);
          });
          cardEl.appendChild(expandBtn);
        }
        if (m.sticky) {
          headerEl.classList.add('sticky-mark');
        }
        const listEl = document.createElement(m.tagName || 'ul');
        listEl.className = 'card-list';
        listEl.dataset.cardListTitle = m.title;
        m.items.forEach((item) => {
          listEl.appendChild(createMenuItem(item));
        });
        cardEl.appendChild(headerEl);
        cardEl.appendChild(listEl);
        fragment.appendChild(cardEl);
      }
    });
    containerEl.appendChild(fragment);
    bindCardScroll();
    restoreCardScroll();
    adjustCardLayout();
  }
  async function fetchData(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`文件加载失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('读取文件失败：', error.message);
    }
  }
  function processMenuData(originalData) {
    if (!originalData || !Array.isArray(originalData)) return [];
    const copyData = JSON.parse(JSON.stringify(originalData));
    copyData.sort((a, b) => {
      const stickyA = a.sticky || Infinity;
      const stickyB = b.sticky || Infinity;
      if (stickyA !== stickyB) return stickyA - stickyB;
      return getTimeStamp(b.updated) - getTimeStamp(a.updated);
    });
    return copyData;
  }
  function bindCardScroll() {
    const cardLists = document.querySelectorAll('.card-list');
    cardLists.forEach((list) => {
      const handleScroll = debounce(() => {
        const title = list.dataset.cardListTitle;
        const scrollVal = list.scrollTop;
        localStorage.setItem(STORAGE_KEYS.lastScrollCardTitle, title);
        localStorage.setItem(STORAGE_KEYS.lastScrollCardTop, scrollVal);
      });
      list.addEventListener('scroll', handleScroll);
    });
  }
  function restoreCardScroll() {
    const savedTitle = localStorage.getItem(STORAGE_KEYS.lastScrollCardTitle);
    const savedTop = localStorage.getItem(STORAGE_KEYS.lastScrollCardTop);
    if (!savedTitle || savedTop === null) return;
    const targetList = document.querySelector(`.card-list[data-card-list-title="${savedTitle}"]`);
    if (targetList) {
      targetList.scrollTop = Number(savedTop);
    }
  }
  function adjustCardLayout() {
    const container = document.querySelector('.card-container');
    if (!container) return;
    const cards = container.querySelectorAll('.card-item');
    const cardCount = cards.length;
    if (cardCount === 0) return;

    if (isMobile()) {
      container.style.gridTemplateColumns = '';
      container.style.gridTemplateRows = '';
      container.style.height = '';
      container.style.minHeight = '';
      container.style.overflow = '';
      cards.forEach((card) => {
        card.style.maxHeight = '';
        card.style.minHeight = '';
      });
      return;
    }

    // 可用高度 = 内容区高度 - 外层上下 padding
    const contentArea = container.closest('.content-area');
    const markdown = container.closest('.markdown-content');
    let H = window.innerHeight;
    if (contentArea) {
      const padTop = markdown ? (parseFloat(getComputedStyle(markdown).paddingTop) || 0) : 0;
      const padBottom = markdown ? (parseFloat(getComputedStyle(markdown).paddingBottom) || 0) : 0;
      H = contentArea.clientHeight - padTop - padBottom;
    }
    H = Math.max(1, Math.round(H));

    // 列数由宽度决定（每列最小 240px），行数 = 卡片数 / 列数
    const cs = getComputedStyle(container);
    const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 16;
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const W = container.clientWidth - padL - padR;

    const MIN = 240; // 列宽下限
    const MIN_W = 300; // 少量卡片时卡片最小宽度，屏宽不足则换行
    const MAX_COLS = 4; // 单行最多 4 个卡片
    const CARD_H = 300; // 卡片超过 2 行时固定高度
    let cols, rows;
    if (cardCount < 5) {
      // 少量卡片：每张宽度 ≥300px，屏宽不足时换行
      const maxCols = Math.max(1, Math.floor((W + gap) / (MIN_W + gap)));
      cols = Math.min(cardCount, maxCols);
      rows = Math.ceil(cardCount / cols);
    } else {
      const maxCols = Math.max(1, Math.floor((W + gap) / (MIN + gap)));
      cols = Math.min(cardCount, maxCols, MAX_COLS);
      rows = Math.ceil(cardCount / cols);
    }

    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    if (rows <= 2) {
      // ≤2 行：高度撑满并均分（1 行整高、2 行各半），外层不滚动
      container.style.height = H + 'px';
      container.style.minHeight = '';
      container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      container.style.overflow = 'hidden';
      cards.forEach((card) => {
        card.style.maxHeight = 'none';
        card.style.minHeight = MIN + 'px';
      });
    } else {
      // >2 行：卡片固定 300px，容器自适应，外层可滚动
      container.style.height = 'auto';
      container.style.minHeight = H + 'px';
      container.style.gridTemplateRows = `repeat(${rows}, ${CARD_H}px)`;
      container.style.overflow = '';
      cards.forEach((card) => {
        card.style.minHeight = CARD_H + 'px';
        card.style.maxHeight = CARD_H + 'px';
      });
    }
  }
  window.addEventListener('resize', debounce(adjustCardLayout, 150));
  let modalMask = null;
  function initModal(m) {
    if (modalMask) return;
    modalMask = document.createElement('div');
    modalMask.className = 'modal-mask';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const modalHeaderEl = document.createElement('div');
    modalHeaderEl.className = 'modal-close';
    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    const closeImg = document.createElement('img');
    closeImg.src = '/src/images/icons/zoomin.png';
    closeImg.alt = '关闭';
    closeImg.title = '关闭';
    const fragment = document.createDocumentFragment();
    fragment.appendChild(modalTitle);
    fragment.appendChild(closeImg);
    modalHeaderEl.appendChild(fragment);
    closeImg.addEventListener('click', closeModal);
    const modalList = document.createElement(m.tagName || 'ul');
    modalList.className = 'modal-list';
    modalContent.appendChild(modalHeaderEl);
    modalContent.appendChild(modalList);
    modalMask.appendChild(modalContent);
    modalMask.addEventListener('click', (e) => {
      if (e.target === modalMask) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalMask.classList.contains('show')) {
        closeModal();
      }
    });
    document.body.appendChild(modalMask);
  }
  function openModal(m) {
    if (!modalMask) initModal(m);
    const titleEl = modalMask.querySelector('.modal-title');
    const listEl = modalMask.querySelector('.modal-list');
    titleEl.innerText = m.title;
    listEl.innerHTML = '';
    m.items.forEach((item) => {
      listEl.appendChild(createMenuItem(item));
    });
    modalMask.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modalMask) return;
    modalMask.classList.remove('show');
    document.body.style.overflow = '';
  }
})();
