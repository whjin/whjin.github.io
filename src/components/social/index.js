(function () {
  const socialList = [
    {
      href: '',
      title: '微信',
      name: 'wechat',
      icon: 26,
    },
    {
      href: '',
      title: '打赏',
      name: 'reward',
      icon: 28,
    },
    {
      href: '',
      title: '我的音乐',
      name: 'music',
      icon: 30,
    },
    {
      href: '',
      title: 'QQ音乐',
      name: 'qqmusic',
      icon: 28,
    },
    {
      href: '',
      title: '网易云音乐',
      name: 'netmusic',
      icon: 28,
    },
    {
      href: 'https://weibo.com/u/1710899102',
      title: '微博',
      name: 'weibo',
      icon: 28,
    },
    {
      href: 'https://wuhuajin.com',
      title: '博客',
      name: 'blog',
      icon: 28,
    },
    {
      href: 'mailto:wuhuajin09@163.com',
      title: '邮箱',
      name: 'email',
      icon: 28,
    },
    {
      href: 'https://github.com/whjin',
      title: 'Github',
      name: 'github',
      icon: 26,
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

    if (['wechat', 'reward', 'music', 'qqmusic', 'netmusic'].includes(s.name)) {
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

  function togglePlayer(activeSelector) {
    const playerConfigs = [
      {
        selector: '.aplayer-container',
        pause: () => {
          if (window.ap) {
            window.ap.pause();
          }
        },
      },
      {
        selector: '.qqmusic-container',
        pause: () => {
          const metingEl = document.querySelector('.qqmusic-container');
          if (metingEl?.aplayer) {
            metingEl.aplayer.pause();
          }
        },
      },
      {
        selector: '.netmusic-container',
        pause: () => {
          const metingEl = document.querySelector('.netmusic-container');
          if (metingEl?.aplayer) {
            metingEl.aplayer.pause();
          }
        },
      },
    ];

    const footerEl = document.querySelector('.footer-content');
    const menuEl = document.querySelector('.card-container');
    let isActiveShow = false;

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

    footerEl.style.visibility = isActiveShow ? 'hidden' : 'visible';
    menuEl.style.paddingBottom = isActiveShow ? '2em' : '1em';
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
    } else if (className.includes('icon-music')) {
      // 我的音乐
      togglePlayer('.aplayer-container');
      return;
    } else if (className.includes('icon-qqmusic')) {
      // QQ音乐
      togglePlayer('.qqmusic-container');
      return;
    } else if (className.includes('icon-netmusic')) {
      // 网易云音乐
      togglePlayer('.netmusic-container');
      return;
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
    let flag = e.key === 'Escape' && fullscreenOverlayEl.classList.contains('show');
    if (flag) {
      hideQrcode(e);
    }
  });
})();
