/* 首页文章流（Dev.to 风格）：读 src/template/feed/data.json 渲染精选+文章卡，分类 chips 进固定 category 栏 */
(function () {
  'use strict';

  const PAGE = 10;
  const DATA_URL = 'src/template/feed/data.json';

  let allItems = [];
  let cat = 'all';
  let query = '';
  let shown = PAGE;
  let feedList = null;
  let sentinel = null;
  let observer = null;
  let loading = false;

  // i18n 助手：window.I18N 由 i18n/index.js 提供
  function t(key, zh) {
    if (window.I18N && window.I18N.t) return window.I18N.t(key);
    return zh || key;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function filtered() {
    let list = allItems.slice();
    if (cat !== 'all') list = list.filter((it) => it.category === cat);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((it) => {
        const hay = (it.title + ' ' + (it.category || '') + ' ' + (it.tags || []).join(' ')).toLowerCase();
        return hay.includes(q);
      });
    }
    // relevant：精选优先 + 按日期倒序
    const dateVal = (it) => (it.date ? new Date(it.date).getTime() : 0);
    const cmpDate = (a, b) => dateVal(b) - dateVal(a);
    const cmpFeatured = (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    list.sort((a, b) => cmpFeatured(a, b) || cmpDate(a, b));
    return list;
  }

  // 精选模块已移除：置顶精选通过文章卡置顶 + ★ Featured 标识实现，不再重复展示

  function cardHTML(it) {
    const tags = (it.tags || []).slice(0, 4)
      .map((g) => '<span class="fc-tag">#' + esc(g) + '</span>').join('');
    const featured = it.featured ? '<span class="fc-featured">★ ' + esc(t('featured_badge', 'Featured')) + '</span>' : '';
    const read = it.readTime ? ' · ' + it.readTime + ' min' : '';
    return (
      '<div class="fc-top">' +
      '<span class="fc-category">' + esc(it.category || '') + '</span>' +
      featured +
      '</div>' +
      '<div class="fc-title">' + esc(it.title) + '</div>' +
      (it.excerpt ? '<div class="fc-excerpt">' + esc(it.excerpt) + '</div>' : '') +
      '<div class="fc-meta"><span>' + (it.date || '') + '</span><span>' + (it.readTime ? it.readTime + ' min read' : '') + '</span></div>' +
      (tags ? '<div class="fc-tags">' + tags + '</div>' : '')
    );
  }

  function render() {
    if (!feedList) feedList = document.getElementById('home-feed-list');
    if (!feedList) return;
    const list = filtered();
    const slice = list.slice(0, shown);
    feedList.innerHTML = '';
    if (!slice.length) {
      feedList.innerHTML = '<div class="feed-empty">' + esc(t('feed_empty', 'No articles found. 没有找到相关文章。')) + '</div>';
    } else {
      slice.forEach((it) => {
        const a = document.createElement('a');
        a.className = 'feed-card';
        a.href = it.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = cardHTML(it);
        feedList.appendChild(a);
      });
    }
    setupInfiniteScroll();
  }

  // 下拉触底加载更多（替代 Load More 按钮）
  function teardownInfiniteScroll() {
    if (observer) { observer.disconnect(); observer = null; }
    if (sentinel) { sentinel.remove(); sentinel = null; }
  }

  function loadMore() {
    if (loading) return;
    const list = filtered();
    if (shown >= list.length) { teardownInfiniteScroll(); return; }
    loading = true;
    shown += PAGE;
    render();
    loading = false;
  }

  function setupInfiniteScroll() {
    teardownInfiniteScroll();
    const list = filtered();
    if (shown >= list.length) return; // 已全部加载
    sentinel = document.createElement('div');
    sentinel.className = 'feed-sentinel';
    sentinel.setAttribute('data-i18n', 'loading');
    sentinel.textContent = t('loading', 'Loading… 加载中…');
    feedList.appendChild(sentinel);
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
      }, { rootMargin: '240px 0px' });
      observer.observe(sentinel);
    } else {
      // 兜底：窗口滚动
      window.addEventListener('scroll', function onScroll() {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 240) {
          loadMore();
          if (shown >= filtered().length) window.removeEventListener('scroll', onScroll);
        }
      });
    }
  }

  function bindSearch() {
    const input = document.getElementById('home-search');
    if (!input) return;
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        query = input.value.trim();
        shown = PAGE;
        render();
      }, 150);
    });
  }

  async function init() {
    const wrap = document.getElementById('home-feed');
    if (!wrap) return;
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('feed 加载失败 ' + res.status);
      const data = await res.json();
      allItems = Array.isArray(data.items) ? data.items : [];
      render();
      bindSearch();
    } catch (err) {
      console.error('Feed 初始化失败：', err.message);
    }
  }

  window.HomeFeed = {
    init,
    setCategory(name) { cat = name; shown = PAGE; render(); },
    refresh() { shown = PAGE; render(); },
  };
})();
