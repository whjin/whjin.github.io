/* 轻量 UI i18n：界面英文优先 + 中文切换（图标在社交区）；正文（文章）保持中文 */
(function () {
  'use strict';

  const DICT = {
    nav_articles: ['Articles', '文章'],
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
    loading: ['Loading…', '加载中…'],
    reactions: ['reactions', '次反应'],
    comments: ['comments', '条评论'],
    feed_empty: ['No articles found. 没有找到相关文章。', '没有找到相关文章。'],
    words_unit: ['words', '字'],
    fc_top: ['Top', '置顶'],
    sb_about: ['About', '关于'],
    sb_about_intro: [
      'Wu Huajin | Full-stack developer. Writing about web engineering, AI tooling, and the craft of building for the modern web.',
      '吴华锦 | 锦绣年华・写意人间。\n雅致寓于高阁渔舟唱晚，古典悠然；\n格调外发园林绿树萦绕，馥郁清香。',
    ],
    sb_happening: ["What's happening", '近期动态'],
    sb_live: ['Livestreams', '直播'],
    sb_now: ['Happening Now! 🚀', '正在进行 🚀'],
    sb_tags: ['Popular tags', '热门标签'],
    sb_categories: ['Categories', '分类'],
    sb_social: ['Connect', '社交'],
    sb_member: ['Subscribe', '订阅'],
    sb_member_intro: [
      'Enjoy my content? Become a member to unlock exclusive articles and resources, and directly support my work.',
      '喜欢我的内容吗？成为会员，解锁专属文章与资源，直接支持我的创作。',
    ],
    sb_member_b1: ['Unlock all member-only articles', '解锁全部会员专属文章'],
    sb_member_b2: ['Early access to tutorials & learning roadmaps', '抢先获取教程与学习路线图'],
    sb_member_b3: ['Full source code collections', '获得完整源代码合集'],
    sb_member_btn: ['Become a Member →', '成为会员 →'],
    sb_ads: ['Advertisement', '广告位'],
    sb_ad_placeholder: ['Advertisement', '虚位以待'],
    sb_links: ['Links', '链接'],
  };

  const STORAGE_KEY = 'wj_lang';
  let lang = localStorage.getItem(STORAGE_KEY) === 'zh' ? 'zh' : 'en'; // 默认英文优先

  function t(key) {
    const pair = DICT[key];
    if (!pair) return key;
    return pair[lang === 'en' ? 0 : 1];
  }

  // 顶部导航栏模块已移除（首页不再展示 category 栏；二级页有独立导航）

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
    apply();
  }

  window.I18N = { t, lang: () => lang, toggle, apply, init };
  document.addEventListener('DOMContentLoaded', init);
})();
