/* 轻量 UI i18n：界面英文优先 + 中文切换（图标在社交区）；正文（文章）保持中文 */
(function () {
  'use strict';

  const DICT = {
    nav_articles: ['Articles', '文章'],
    nav_tutorials: ['Tutorials', '教程'],
    nav_tools: ['Tools', '工具'],
    nav_ai: ['AI Apps', 'AI应用'],
    nav_poetry: ['Poetry', '诗词'],
    nav_about: ['About', '关于'],
    nav_contact: ['Contact', '联系'],
    ph_search: ['Search…', '搜索…'],
    subscribe_btn: ['Subscribe', '订阅'],
    featured_title: ['Trending · Featured', '精选'],
    featured_badge: ['Featured', '精选'],
    cat_all: ['All', '全部'],
    load_more: ['Load more', '加载更多'],
    feed_empty: ['No articles found. 没有找到相关文章。', '没有找到相关文章。'],
    sb_about: ['About', '关于'],
    sb_happening: ["What's happening", '近期动态'],
    sb_live: ['Livestreams', '直播'],
    sb_now: ['Happening Now! 🚀', '正在进行 🚀'],
    sb_tags: ['Popular tags', '热门标签'],
    sb_categories: ['Categories', '分类'],
    sb_ads: ['Advertisement', '广告'],
    sb_links: ['Links', '链接'],
  };

  const NAV_LINKS = [
    { key: 'nav_articles', url: '/src/template/viewer.html?path=文章_article&format=html' },
    { key: 'nav_tutorials', url: '/src/template/viewer.html?path=教程_tutorial&format=html' },
    { key: 'nav_tools', url: '/src/template/viewer.html?path=工具_tool&format=html' },
    { key: 'nav_ai', url: '/src/template/viewer.html?path=友链_link&format=html' },
    { key: 'nav_poetry', url: '/src/template/viewer.html?path=文学_原创诗词' },
    { key: 'nav_about', url: 'about.html' },
    { key: 'nav_contact', url: 'contact.html' },
  ];

  const STORAGE_KEY = 'wj_lang';
  let lang = localStorage.getItem(STORAGE_KEY) === 'zh' ? 'zh' : 'en'; // 默认英文优先

  function t(key) {
    const pair = DICT[key];
    if (!pair) return key;
    return pair[lang === 'en' ? 0 : 1];
  }

  // 在固定 category 栏内构建导航链接 + 预留分类 chips 容器
  function buildNav() {
    const bar = document.getElementById('category-bar');
    if (!bar) return;
    const links = document.createElement('div');
    links.className = 'nav-links';
    NAV_LINKS.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.dataset.i18n = link.key;
      a.textContent = t(link.key);
      links.appendChild(a);
    });
    bar.appendChild(links);
  }

  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    const search = document.getElementById('home-search');
    if (search) search.placeholder = t('ph_search');
  }

  function toggle() {
    lang = lang === 'en' ? 'zh' : 'en';
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
    // 动态区块重新应用文案
    if (window.HomeFeed && window.HomeFeed.refresh) window.HomeFeed.refresh();
  }

  function init() {
    buildNav();
    apply();
  }

  window.I18N = { t, lang: () => lang, toggle, apply, init };
  document.addEventListener('DOMContentLoaded', init);
})();
