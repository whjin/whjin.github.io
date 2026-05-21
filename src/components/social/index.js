(function () {
  const socialList = [
    {
      href: '',
      title: '微信',
      name: 'wechat',
      icon: 24,
    },
    {
      href: '',
      title: '打赏',
      name: 'reward',
      icon: 26,
    },
    {
      href: 'https://weibo.com/u/1710899102',
      title: '微博',
      name: 'weibo',
      icon: 24,
    },
    {
      href: 'https://wuhuajin.com',
      title: '博客',
      name: 'blog',
      icon: 24,
    },
    {
      href: 'mailto:wuhuajin09@163.com',
      title: '邮箱',
      name: 'email',
      icon: 24,
    },
    {
      href: 'https://github.com/whjin',
      title: 'Github',
      name: 'github',
      icon: 24,
    },
  ];

  const wechatList = [
    {
      src: 'src/images/social/wechat.jpg',
      title: '微信',
    },
    {
      src: 'src/images/social/wechat_oa.jpg',
      title: '微信公众号',
    },
    {
      src: 'src/images/social/wechat_video.jpg',
      title: '微信视频号',
    },
  ];
  const rewardList = [
    {
      src: 'src/images/social/wx_pay.jpg',
      title: '微信支付',
    },
    {
      src: 'src/images/social/ali_pay.jpg',
      title: '支付宝',
    },
  ];

  let qrcodeLink = null;

  const titleEl = document.querySelector('.title');
  const socialEl = document.createElement('nav');
  socialEl.className = 'social';

  const fragment = document.createDocumentFragment();
  socialList.forEach((s) => {
    const aEl = document.createElement('a');
    const imgEl = document.createElement('img');

    if (s.href) aEl.href = s.href;
    aEl.rel = 'noopener noreferrer';
    aEl.target = '_blank';
    aEl.title = s.title;
    aEl.className = `icon-${s.name}`;

    imgEl.src = `src/images/icons/${s.name}.png`;
    imgEl.alt = s.title;
    imgEl.className = `img-${s.name}`;
    imgEl.width = imgEl.height = s.icon;

    aEl.appendChild(imgEl);
    fragment.appendChild(aEl);

    if (['wechat', 'reward'].includes(s.name)) {
      aEl.removeAttribute('href');
      aEl.style.cursor = 'pointer';
    }
  });
  socialEl.appendChild(fragment);
  titleEl.after(socialEl);

  const headerEl = document.querySelector('.header');
  headerEl.style.justifyContent = isMobile() ? 'flex-start' : 'center';

  const overlayEl = document.createElement('div');
  overlayEl.className = 'modal-overlay';
  overlayEl.setAttribute('id', 'wechat-modal');
  socialEl.after(overlayEl);

  const containerEl = document.createElement('div');
  containerEl.className = 'modal-container';
  overlayEl.appendChild(containerEl);

  const fullscreenOverlayEl = document.createElement('div');
  fullscreenOverlayEl.className = 'fullscreen-modal-overlay';
  const fullscreenImgEl = document.createElement('img');
  fullscreenImgEl.className = 'fullscreen-modal-img';
  fullscreenOverlayEl.appendChild(fullscreenImgEl);
  document.body.appendChild(fullscreenOverlayEl);

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

  function calcTrianglePosition() {
    if (!qrcodeLink) return;
    const modalEl = document.querySelector('.modal-container');

    const linkRect = qrcodeLink.getBoundingClientRect();

    const offset = isMobile() ? -5 : 3;
    const offsetRight = window.innerWidth - linkRect.right - offset;
    modalEl.style.setProperty('--offset-right', `${offsetRight}px`);
  }

  socialEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const targetA = e.target.closest('a');
    if (!targetA) return;

    const className = targetA.className;
    if (className.includes('icon-wechat')) {
      qrcodeLink = targetA;
      renderQrcodeList(wechatList);
    } else if (className.includes('icon-reward')) {
      qrcodeLink = targetA;
      renderQrcodeList(rewardList);
    } else {
      return;
    }

    overlayEl.classList.add('show');
    calcTrianglePosition();
  });

  document.addEventListener('click', () => {
    overlayEl.classList.remove('show');
  });
  overlayEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  function hideQrcode(e) {
    e.stopPropagation();
    fullscreenOverlayEl.classList.remove('show');
    document.body.style.overflow = '';
  }

  fullscreenOverlayEl.addEventListener('click', (e) => {
    if (e.target === fullscreenOverlayEl) {
      hideQrcode(e);
    }
  });

  fullscreenImgEl.addEventListener('click', hideQrcode);

  document.addEventListener('keydown', (e) => {
    let flag =
      e.key === 'Escape' && fullscreenOverlayEl.classList.contains('show');
    if (flag) {
      hideQrcode(e);
    }
  });
})();
