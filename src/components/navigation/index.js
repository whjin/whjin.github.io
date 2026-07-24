function handleNavigation() {
  const navImgs = [
    {
      src: '../images/icons/toc.png',
      alt: '隐藏目录',
      class: 'nav-toc',
    },
    {
      src: '../images/icons/back.png',
      alt: '回到首页',
      class: 'nav-back',
    },
  ];

  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;

  let isMobileDevice = isMobile();
  const fragment = document.createDocumentFragment();

  navImgs.forEach((img, index) => {
    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = imgEl.title = img.alt;
    imgEl.className = img.class;
    if (index === 0) {
      imgEl.classList.add(isMobileDevice ? 'hide' : 'hidden');
    }
    fragment.appendChild(imgEl);
  });
  navContainer.appendChild(fragment);

  const navToc = document.querySelector('.nav-toc');
  const navBack = document.querySelector('.nav-back');
  const sidebarArea = document.querySelector('.sidebar-area');

  function checkIsLinkPage() {
    if (document.querySelector('.link-container')) return true;
    const pathname = window.location.pathname.toLowerCase();
    const search = decodeURIComponent(window.location.search);
    return pathname.includes('viewer.html') && search.includes('index&format=html');
  }

  const isLinkPage = checkIsLinkPage();
  const SHOW_NAVIGATION = false; // 是否显示导航栏
  const hasNavigateFlag = localStorage.getItem('navigateToLink') || SHOW_NAVIGATION;

  if (isLinkPage) {
    if (hasNavigateFlag) {
      navContainer.style.display = '';
      navContainer.dataset.forceHidden = 'false';
    } else {
      navContainer.style.display = 'none';
      navContainer.dataset.forceHidden = 'true';
    }
  }

  if (!isMobileDevice && navToc) {
    navContainer.addEventListener('mouseenter', () => {
      navToc.classList.remove('hidden');
    });
    navContainer.addEventListener('mouseleave', () => {
      navToc.classList.add('hidden');
    });
    navToc.addEventListener('click', () => {
      if (!sidebarArea) return;
      const isHidden = sidebarArea.style.display === 'none';
      sidebarArea.style.display = isHidden ? 'block' : 'none';
      navToc.alt = navToc.title = isHidden ? '隐藏目录' : '显示目录';
    });
  }

  if (navBack) {
    navBack.addEventListener('click', (e) => {
      e.stopPropagation();
      localStorage.removeItem('navigateToLink');
      window.location.href = window.location.origin;
    });
  }

  window.addEventListener('resize', () => {
    const newIsMobile = isMobile();
    if (newIsMobile !== isMobileDevice) {
      isMobileDevice = newIsMobile;
      window.location.reload();
    }
  });
}

document.addEventListener('DOMContentLoaded', handleNavigation);
