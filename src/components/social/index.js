/* 首页社交功能：
 * - 头部标题栏 .social 仅保留「搜索 / 订阅 / 语言切换」三图标（+ 移动端三横杠）。
 * - 其余社交图标（音乐/QQ/网易/爱发电/微博/博客/邮箱/GitHub/X 等）移至主体右侧新增的
 *   「社交」卡片平铺展示，由 window.SocialGrid.renderInto(el) 注入，供 sidebar 组件调用。
 */
(function () {
  'use strict';

  const HEADER_ICONS = [
    { name: 'search', title: '搜索 / Search', icon: 26 },
    { name: 'subscribe', title: '订阅 / Subscribe', icon: 28 },
    { name: 'link', title: '语言 / Language', icon: 28 },
  ];

  const GRID_ICONS = [
    { href: 'src/template/viewer.html?path=友链_link&format=html', title: 'AI应用', name: 'ai', icon: 28 },
    { href: '', title: '我的音乐', name: 'music', icon: 30 },
    { href: '', title: 'QQ音乐', name: 'qqmusic', icon: 28 },
    { href: '', title: '网易云音乐', name: 'netmusic', icon: 28 },
    { href: 'https://ifdian.net/a/whjin', title: '爱发电', name: 'aifadian', icon: 28 },
    { href: 'https://weibo.com/u/1710899102', title: '微博', name: 'weibo', icon: 28 },
    { href: 'https://wuhuajin.com', title: '博客', name: 'blog', icon: 28 },
    { href: 'mailto:wuhuajin09@163.com', title: '邮箱', name: 'email', icon: 28 },
    { href: 'https://github.com/whjin', title: 'Github', name: 'github', icon: 28 },
    { href: 'https://x.com/whjin', title: 'X / Twitter', name: 'twitter', icon: 28 },
  ];

  const titleEl = document.querySelector('.title');
  const socialEl = document.createElement('nav');
  socialEl.className = 'social';

  const barsEl = document.createElement('img');
  barsEl.className = 'social-bars';
  barsEl.src = 'src/images/icons/bars.png';
  barsEl.title = barsEl.alt = '展开';
  barsEl.width = barsEl.height = 26;

  function makeIcon(icon) {
    const aEl = document.createElement('a');
    const imgEl = document.createElement('img');
    aEl.className = `icon-${icon.name}`;
    imgEl.src = `src/images/icons/${icon.name}.png`;
    imgEl.alt = icon.title;
    imgEl.className = `img-${icon.name}`;
    imgEl.width = imgEl.height = icon.icon;
    aEl.title = icon.title;
    if (icon.href) {
      aEl.href = icon.href;
      aEl.rel = 'noopener noreferrer';
      aEl.target = '_blank';
    } else {
      aEl.style.cursor = 'pointer';
    }
    aEl.appendChild(imgEl);
    return aEl;
  }

  // 头部社交栏：搜索 / 订阅 / 语言
  const hf = document.createDocumentFragment();
  HEADER_ICONS.forEach((s) => hf.appendChild(makeIcon(s)));
  socialEl.appendChild(hf);
  titleEl.after(barsEl);
  titleEl.after(socialEl);
  titleEl.innerText = isMobile() ? '吴华锦' : '吴华锦的个人主页';

  // ---- 播放器开关（供头部与右侧社交卡片共用）----
  function togglePlayer(activeSelector) {
    const playerConfigs = [
      { selector: '.aplayer-container', pause: () => { if (window.ap) window.ap.pause(); } },
      {
        selector: '.qqmusic-container',
        pause: () => {
          const metingEl = document.querySelector('.qqmusic-container');
          if (metingEl?.aplayer) metingEl.aplayer.pause();
        },
      },
      {
        selector: '.netmusic-container',
        pause: () => {
          const metingEl = document.querySelector('.netmusic-container');
          if (metingEl?.aplayer) metingEl.aplayer.pause();
        },
      },
    ];

    let isActiveShow = false;
    const footerContentEl = document.querySelector('.footer-content');
    const footerLinksEl = document.querySelector('.footer-links');

    playerConfigs.forEach(({ selector, pause }) => {
      const playerEl = document.querySelector(selector);
      if (selector === activeSelector) {
        playerEl.classList.toggle('show');
        isActiveShow = playerEl.classList.contains('show');
        if (!isActiveShow) pause();
      } else {
        pause();
        playerEl.classList.remove('show');
      }
    });

    // 播放器显示时隐藏 footer 版权/统计与合规内容
    const hidden = isActiveShow ? 'hidden' : 'visible';
    if (footerContentEl) footerContentEl.style.visibility = hidden;
    if (footerLinksEl) footerLinksEl.style.visibility = hidden;

    if (isActiveShow) document.body.classList.add('player-show');
    else document.body.classList.remove('player-show');
  }

  // ---- 头部社交栏点击 ----
  socialEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const targetA = e.target.closest('a');
    if (!targetA) return;
    const className = targetA.className;

    if (className.includes('icon-search')) {
      // 搜索：桌面切换 search-open；移动端收起社交并显示搜索框
      if (isNarrow()) {
        socialEl.classList.remove('show');
        barsEl.style.display = 'block';
        document.body.classList.remove('search-collapsed');
        syncSearchCollapse();
      } else {
        document.body.classList.toggle('search-open');
      }
      return;
    }
    if (className.includes('icon-subscribe')) {
      window.location.href = 'mailto:wuhuajin09@163.com?subject=Subscribe';
      return;
    }
    if (className.includes('icon-link')) {
      if (window.I18N && window.I18N.toggle) window.I18N.toggle();
      return;
    }
  });

  // ---- 右侧社交卡片网格（供 sidebar 调用）----
  window.SocialGrid = {
    renderInto(el) {
      const grid = document.createElement('div');
      grid.className = 'social-grid';
      GRID_ICONS.forEach((s) => {
        const a = makeIcon(s);
        a.addEventListener('click', (ev) => {
          if (s.name === 'music' || s.name === 'qqmusic' || s.name === 'netmusic') {
            ev.preventDefault();
            ev.stopPropagation();
            togglePlayer('.' + s.name + '-container');
          }
        });
        grid.appendChild(a);
      });
      el.appendChild(grid);
    },
  };

  // ---- 移动端三横杠 / 社交栏切换 ----
  function isNarrow() {
    return window.innerWidth < 768;
  }

  function syncSearchCollapse() {
    if (isNarrow()) {
      document.body.classList.toggle('search-collapsed', socialEl.classList.contains('show'));
    } else {
      document.body.classList.remove('search-collapsed');
    }
  }

  function toggleSocial() {
    if (isNarrow()) {
      const isSocialShow = socialEl.classList.contains('show');
      barsEl.style.display = isSocialShow ? 'none' : 'block';
    } else {
      socialEl.classList.add('show');
      barsEl.style.display = 'none';
    }
    syncSearchCollapse();
  }
  toggleSocial();

  barsEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShow = socialEl.classList.toggle('show');
    barsEl.style.display = isShow ? 'none' : 'block';
    syncSearchCollapse();
  });

  titleEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isNarrow()) return;
    socialEl.classList.remove('show');
    barsEl.style.display = 'block';
    syncSearchCollapse();
  });

  // ---- 缩放切换 ----
  let prevIsMobile = isMobile();
  const debounce = (fn, delay = 150) => {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };
  const handleResize = debounce(() => {
    const currentIsMobile = isMobile();
    if (currentIsMobile !== prevIsMobile) {
      prevIsMobile = currentIsMobile;
      window.location.reload();
      return;
    }
    toggleSocial();
  });
  window.addEventListener('resize', handleResize);
})();
