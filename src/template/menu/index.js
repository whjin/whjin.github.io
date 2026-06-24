async function generateCard() {
  const menuData = await fetchData('src/template/menu/data.json');
  const finalMenuData = processMenuData(menuData);

  const containerEl = document.querySelector('.card-container');
  const fragment = document.createDocumentFragment();

  const validTitles = finalMenuData
    .filter((m) => !m.hide && m.items.length > 0)
    .map((m) => m.title);

  finalMenuData.forEach((m) => {
    if (!m.hide && m.items.length > 0) {
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
        if (m.items.length > 99) {
          countBadge.classList.remove('normal');
        } else {
          countBadge.classList.add('normal');
        }
        headerEl.appendChild(countBadge);
      }

      if (m.sticky) {
        headerEl.classList.add('sticky-mark');
      }

      const listEl = document.createElement(m.tagName || 'ul');
      listEl.className = 'card-list';
      listEl.dataset.cardListTitle = m.title;

      m.items.forEach((i) => {
        const liEl = document.createElement('li');
        const aEl = document.createElement('a');
        aEl.rel = 'noopener noreferrer';
        aEl.target = '_blank';
        aEl.innerText = i.text;
        aEl.title = i.title || i.text;
        aEl.href = i.href;

        liEl.appendChild(aEl);
        listEl.appendChild(liEl);
      });

      cardEl.appendChild(headerEl);
      cardEl.appendChild(listEl);
      fragment.appendChild(cardEl);
    }
  });
  containerEl.appendChild(fragment);

  setCardHeight();

  // 绑定滚动监听（仅更新当前操作卡片）
  bindCardScroll();
  // 恢复上次滚动卡片位置
  restoreCardScroll();
}

async function fetchData(filePath) {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`文件加载失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('读取文件失败：', error.message);
  }
}

function processMenuData(originalData) {
  if (!originalData || !Array.isArray(originalData)) return [];

  const copyData = JSON.parse(JSON.stringify(originalData));

  const getTimeStamp = (dateStr) => {
    if (!dateStr) return 0;

    const normalizedDate = dateStr.replace(/-/g, '/');
    return new Date(normalizedDate).getTime() || 0;
  };

  copyData.sort((a, b) => {
    const stickyA = a.sticky || Infinity;
    const stickyB = b.sticky || Infinity;
    if (stickyA !== stickyB) {
      return stickyA - stickyB;
    }

    const timeA = getTimeStamp(a.updated);
    const timeB = getTimeStamp(b.updated);
    return timeB - timeA;
  });

  return copyData;
}

function setCardHeight() {
  const cardItems = document.querySelectorAll('.card-item');
  if (cardItems.length > 0) {
    let maxHeight = 0;
    cardItems.forEach((card) => {
      card.style.height = 'auto';
      const currentHeight = card.clientHeight;
      if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
      }
    });

    const finalHeight = Math.min(maxHeight, 'fit-content');

    cardItems.forEach((card) => {
      card.style.height = `${finalHeight}px`;
    });
  }
}

function bindCardScroll() {
  const cardLists = document.querySelectorAll('.card-list');
  cardLists.forEach((list) => {
    let debounceTimer = null;
    list.addEventListener('scroll', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const title = list.dataset.cardListTitle;
        const scrollVal = list.scrollTop;
        localStorage.setItem('lastScrollCardTitle', title);
        localStorage.setItem('lastScrollCardTop', scrollVal);
      }, 100);
    });
  });
}

function restoreCardScroll() {
  const savedTitle = localStorage.getItem('lastScrollCardTitle');
  const savedTop = localStorage.getItem('lastScrollCardTop');
  if (!savedTitle || savedTop === null) return;

  const targetList = document.querySelector(`.card-list[data-card-list-title="${savedTitle}"]`);
  if (targetList) {
    targetList.scrollTop = Number(savedTop);
  }
}
