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
  aEl.innerHTML = item.marked ? `${MARKED_HTML}${item.text}` : item.text;
  aEl.title = item.title || item.text;
  aEl.href = item.href;
  let isLinkPage = item.href.includes('viewer.html') && item.href.includes('index&format=html');
  if (isLinkPage) {
    aEl.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEYS.navigateToLink, true);
    });
  }
  liEl.appendChild(aEl);
  return liEl;
}
async function generateCard() {
  const menuData = await fetchData('src/template/menu/menu.json');
  const finalMenuData = processMenuData(menuData);
  const containerEl = document.querySelector('.card-container');
  const fragment = document.createDocumentFragment();
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
        countBadge.classList.toggle('normal', m.items.length <= 99);
        headerEl.appendChild(countBadge);
        const expandBtn = document.createElement('span');
        expandBtn.className = 'card-expand-btn';
        expandBtn.title = '展开';
        const expandImg = document.createElement('img');
        expandImg.src = 'src/images/icons/zoomout.png';
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
  closeImg.src = 'src/images/icons/zoomin.png';
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
