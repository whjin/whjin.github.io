window.addEventListener('DOMContentLoaded', (e) => {
  loadMarkdown('markdown-content', 'src/template/home.html')
    .then(() => {
      if (window.HomeFeed && window.HomeFeed.init) window.HomeFeed.init();
      if (window.HomeSidebar && window.HomeSidebar.init) window.HomeSidebar.init();
      if (window.MenuGrid && window.MenuGrid.generateCard) window.MenuGrid.generateCard();
      if (typeof generateAPlayer === 'function') generateAPlayer();
      // 触发 in-article 广告单元填充
      try {
        if (document.querySelector('.home-ad-in-article .adsbygoogle')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (adErr) { /* 忽略 */ }
    })
    .catch((error) => {
      console.error('加载首页失败：', error);
    });
});

window.addEventListener('load', () => {
  const links = document.querySelectorAll('#markdown-content a');
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  hideLoading();

  // 整页滚动：恢复滚动位置
  window.addEventListener('scroll', () => {
    localStorage.setItem('scrollPosition_home', String(window.scrollY));
  }, { passive: true });
  const savedScrollTop = localStorage.getItem('scrollPosition_home');
  if (savedScrollTop) {
    window.scrollTo({ top: parseInt(savedScrollTop, 10), behavior: 'auto' });
  }
});
