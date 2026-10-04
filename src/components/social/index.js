(function () {
  'use strict';

  // 付费会员订阅入口：跳转到 Ko-fi 会员页（替换为你的实际 Ko-fi 地址）
  const KO_FI_URL = 'https://ko-fi.com/whjin';

  const HEADER_ICONS = [
    { name: 'subscribe', title: '订阅 / Subscribe', icon: 28 },
    { name: 'lang', title: '语言 / Language', icon: 28 },
    { name: 'search', title: '搜索 / Search', icon: 28 },
  ];

  const GRID_ICONS = [
    { href: '/viewer.html?path=友链_link&format=html', title: 'AI应用', name: 'ai', icon: 28 },
    { href: '', title: '微信', name: 'wechat', icon: 28, show: true },
    { href: '', title: '打赏', name: 'reward', icon: 28, show: true },
    { href: '', title: '我的音乐', name: 'music', icon: 30 },
    { href: '', title: 'QQ音乐', name: 'qqmusic', icon: 28 },
    { href: '', title: '网易云音乐', name: 'netmusic', icon: 28 },
    { href: 'https://ifdian.net/a/whjin', title: '爱发电', name: 'aifadian', icon: 28 },
    { href: 'https://weibo.com/u/1710899102', title: '微博', name: 'weibo', icon: 28 },
    { href: 'https://wuhuajin.com', title: '博客', name: 'blog', icon: 28 },
    { href: 'mailto:wuhuajin09@163.com', title: '邮箱', name: 'email', icon: 28 },
    { href: 'https://github.com/whjin', title: 'Github', name: 'github', icon: 28 },
    { href: 'https://x.com/whjin', title: 'Twitter', name: 'twitter', icon: 28 },
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
      // 搜索：宽度足够时默认显示；宽度不足时点击图标展开搜索框
      if (isNarrow()) {
        socialEl.classList.remove('show');
        barsEl.style.display = 'block';
        document.body.classList.add('search-open');
        syncSearchCollapse();
      } else {
        const input = document.getElementById('home-search');
        if (input) input.focus();
      }
      return;
    }
    if (className.includes('icon-subscribe')) {
      window.open(KO_FI_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    if (className.includes('icon-lang')) {
      if (window.I18N && window.I18N.toggle) window.I18N.toggle();
      return;
    }
  });

  // ---- 微信 / 打赏 二维码弹窗 ----
  const wechatList = [
    { src: 'src/images/social/wechat.jpg', title: '微信' },
    { src: 'src/images/social/wechat_oa.jpg', title: '微信公众号' },
    { src: 'src/images/social/wechat_video.jpg', title: '微信视频号' },
  ];
  const rewardList = [
    { src: 'src/images/social/wx_pay.jpg', title: '微信支付' },
    { src: 'src/images/social/ali_pay.jpg', title: '支付宝' },
  ];

  const overlayEl = document.createElement('div');
  overlayEl.className = 'modal-overlay';
  overlayEl.setAttribute('id', 'wechat-modal');
  const containerEl = document.createElement('div');
  containerEl.className = 'modal-container';
  overlayEl.appendChild(containerEl);
  const fullscreenOverlayEl = document.createElement('div');
  fullscreenOverlayEl.className = 'fullscreen-modal-overlay';
  const fullscreenImgEl = document.createElement('img');
  fullscreenImgEl.className = 'fullscreen-modal-img';
  fullscreenOverlayEl.appendChild(fullscreenImgEl);
  document.body.appendChild(fullscreenOverlayEl);
  document.body.appendChild(overlayEl);

  function renderQrcodeList(list) {
    containerEl.innerHTML = '';
    const fragment1 = document.createDocumentFragment();
    list.forEach((q) => {
      const imgEl = document.createElement('img');
      imgEl.src = q.src;
      imgEl.alt = imgEl.title = q.title;
      fragment1.appendChild(imgEl);
      imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        fullscreenImgEl.src = q.src;
        fullscreenImgEl.alt = fullscreenImgEl.title = q.title;
        fullscreenOverlayEl.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });
    containerEl.appendChild(fragment1);
  }

  let currentQrLink = null;
  function positionQrModal(linkEl) {
    const r = linkEl.getBoundingClientRect();
    const mw = containerEl.offsetWidth || 280;
    const iconCx = r.left + r.width / 2;
    let left = iconCx - mw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
    containerEl.style.setProperty('--triangle-left', Math.max(8, iconCx - left) + 'px');
    overlayEl.style.left = left + 'px';
    overlayEl.style.top = (r.bottom + 10) + 'px';
  }

  function openQrModal(linkEl, list) {
    renderQrcodeList(list);
    overlayEl.classList.add('show');
    currentQrLink = linkEl;
    positionQrModal(linkEl);
  }

  // 弹窗为 fixed 定位：页面（.content-area）滚动时按图标当前位置重定位，避免固定原位不跟随
  const repositionOnScroll = () => {
    if (currentQrLink && overlayEl.classList.contains('show')) {
      positionQrModal(currentQrLink);
    }
  };
  const qrScrollContainer = document.querySelector('.content-area');
  if (qrScrollContainer) {
    qrScrollContainer.addEventListener('scroll', repositionOnScroll, { passive: true });
  }
  window.addEventListener('scroll', repositionOnScroll, { passive: true });

  document.addEventListener('click', () => {
    overlayEl.classList.remove('show');
  });
  overlayEl.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenOverlayEl.classList.contains('show')) {
      fullscreenOverlayEl.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
  fullscreenOverlayEl.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlayEl) {
      fullscreenOverlayEl.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
  fullscreenImgEl.addEventListener('click', (e) => {
    e.stopPropagation();
    fullscreenOverlayEl.classList.remove('show');
    document.body.style.overflow = '';
  });

  // ---- 右侧社交卡片网格（供 sidebar 调用）----
  window.SocialGrid = {
    renderInto(el) {
      const grid = document.createElement('div');
      grid.className = 'social-grid';
      GRID_ICONS.forEach((s) => {
        const a = makeIcon(s);
        a.addEventListener('click', (ev) => {
          if (s.name === 'music') {
            ev.preventDefault();
            ev.stopPropagation();
            togglePlayer('.aplayer-container');
          } else if (s.name === 'qqmusic') {
            ev.preventDefault();
            ev.stopPropagation();
            togglePlayer('.qqmusic-container');
          } else if (s.name === 'netmusic') {
            ev.preventDefault();
            ev.stopPropagation();
            togglePlayer('.netmusic-container');
          } else if (s.name === 'wechat') {
            ev.preventDefault();
            ev.stopPropagation();
            openQrModal(a, wechatList);
          } else if (s.name === 'reward') {
            ev.preventDefault();
            ev.stopPropagation();
            openQrModal(a, rewardList);
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
