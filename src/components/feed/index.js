(function () {
  'use strict';

  const PAGE = 10;
  const MENU_URL = 'src/template/feed/data.json';

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

  function activeFilter() {
    return cat !== 'all' || !!query;
  }

  function filtered() {
    let list = allItems.slice();
    if (cat !== 'all') {
      // 统一匹配：文章分类 / 所属卡片分组(核心推荐/推荐/我的/站点/原创文章) / 文章标签 均可命中
      list = list.filter((it) => it.category === cat || it._group === cat || (it.tags || []).includes(cat));
    }
    if (query) {
      const q = query.toLowerCase();
      // 相关度排序：标题命中(3) > 分类/标签命中(2) > 仅描述命中(1)，同分保持原顺序
      const scored = [];
      list.forEach((it) => {
        const title = (it.title || '').toLowerCase();
        const cat = ((it.category || '') + ' ' + (it._group || '') + ' ' + (it.tags || []).join(' ')).toLowerCase();
        const desc = (it.description || '').toLowerCase();
        let score = 0;
        if (title.includes(q)) score = 3;
        else if (cat.includes(q)) score = 2;
        else if (desc.includes(q)) score = 1;
        if (score) scored.push({ it, score });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      list = scored.map(function (x) { return x.it; });
    }
    // 严格按 data.json 顺序渲染：sticky 置顶（数值小在前）已在 allItems 构建时排序，此处不再按日期/精选排序
    return list;
  }

  // 精选模块已移除：置顶精选通过文章卡置顶 + ★ Featured 标识实现，不再重复展示

  // 卡片模板（Dev.to 风格，单数据集）：各区块按字段是否存在条件渲染
  // 封面(cover)存在 → 左图右文；标题行右侧为「分类+精选」标识；摘要(description)→标签→互动统计+阅读时长
  function cardHTML(it) {
    const hasCover = !!it.cover;
    const cover = hasCover
      ? '<div class="fc-cover"><img src="' + esc(it.cover) + '" alt="' + esc(it.title) + '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : '';
    const tags = (it.tags || []).slice(0, 4)
      .map((g) => '<span class="fc-tag">#' + esc(g) + '</span>').join('');
    const featured = it.featured ? '<span class="fc-featured">★ ' + esc(t('featured_badge', 'Featured')) + '</span>' : '';
    const category = (it.category || it._group) ? '<span class="fc-category">' + esc(it.category || it._group) + '</span>' : '';
    const badges = (category || featured) ? '<div class="fc-badges">' + category + featured + '</div>' : '';
    const description = it.description
      ? '<div class="fc-excerpt" title="' + esc(it.description) + '">' + esc(it.description) + '</div>'
      : '';
    // 互动统计（可选字段，存在才渲染）
    let stats = '';
    if (it.reactions != null) stats += '<span class="fc-stat">' + it.reactions + ' <span data-i18n="reactions">reactions</span></span>';
    if (it.comments != null) stats += '<span class="fc-stat">' + it.comments + ' <span data-i18n="comments">comments</span></span>';
    const readtime = it.readTime ? '<span class="fc-readtime">' + it.readTime + ' min read</span>' : '';
    return (
      cover +
      '<div class="fc-body">' +
      '<div class="fc-title-row">' +
      '<div class="fc-title">' + esc(it.title) + '</div>' +
      badges +
      '</div>' +
      description +
      (tags ? '<div class="fc-tags">' + tags + '</div>' : '') +
      '<div class="fc-meta">' +
      (stats ? '<div class="fc-stats">' + stats + '</div>' : '') +
      '<span class="fc-date">' + esc(it.date || '') + '</span>' +
      readtime +
      '</div>' +
      '</div>'
    );
  }

  function render() {
    if (!feedList) feedList = document.getElementById('home-feed-list');
    if (!feedList) return;
    const list = filtered();
    // 筛选/搜索激活时一次性全量渲染所有匹配项（含未加载过的），保证"同类查找"能找到全部；默认浏览才分页触底加载
    const slice = activeFilter() ? list : list.slice(0, shown);
    feedList.innerHTML = '';
    if (!slice.length) {
      feedList.innerHTML = '<div class="feed-empty">' + esc(t('feed_empty', 'No articles found. 没有找到相关文章。')) + '</div>';
    } else {
      slice.forEach((it) => {
        const a = document.createElement('a');
        a.className = 'feed-card' + (it.cover ? ' fc-has-cover' : '');
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
    if (activeFilter()) { teardownInfiniteScroll(); return; } // 筛选状态已全量渲染，不触底加载
    const list = filtered();
    if (shown >= list.length) { teardownInfiniteScroll(); return; }
    loading = true;
    shown += PAGE;
    render();
    loading = false;
  }

  function setupInfiniteScroll() {
    teardownInfiniteScroll();
    if (activeFilter()) return; // 筛选状态一次性全量渲染，不启用触底加载
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

  // 回顶：首页滚动容器为 window，兼容 content-area 容器（二级页）
  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const ca = document.querySelector('.content-area');
    if (ca && ca.scrollTop) ca.scrollTop = 0;
  }

  function bindSearch() {
    const input = document.getElementById('home-search');
    if (!input) return;
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        query = input.value.trim();
        // 新搜索先重置分类/标签，避免与筛选叠加；并清除 sidebar 高亮
        cat = 'all';
        shown = PAGE;
        render();
        scrollTop();
        if (window.HomeSidebar && window.HomeSidebar.applyActiveTag) window.HomeSidebar.applyActiveTag();
      }, 150);
    });
  }

  // 移动端：导航栏下方的收缩/展开条，切换侧栏(sidebar)显隐，便于快速浏览搜索结果/筛选结果

  async function init() {
    const wrap = document.getElementById('home-feed');
    if (!wrap) return;
    try {
      const res = await fetch(MENU_URL);
      if (!res.ok) throw new Error('menu 加载失败 ' + res.status);
      const menu = await res.json();
      // 首页展示由 home 字段控制：home:true 显示，home:false 隐藏（show 只控制二级页/全站导航）
      const cards = (Array.isArray(menu) ? menu : []).filter(function (c) {
        return c.home === true && c.items && c.items.length > 0;
      });
      // 严格按 data.json 顺序：全部卡按 sticky 置顶（数值小在前），无 sticky 按数组序
      cards.sort(function (a, b) {
        const sa = a.sticky === undefined ? Infinity : a.sticky;
        const sb = b.sticky === undefined ? Infinity : b.sticky;
        return sa - sb;
      });
      // 扁平化所有卡的条目（保持 data.json 内顺序），卡标题作为链接条目的分类徽标（_group 始终记录所属分组）
      allItems = [];
      cards.forEach(function (c) {
        (c.items || []).forEach(function (it) {
          it._group = c.title;
          allItems.push(it);
        });
      });
      render();
      bindSearch();
    } catch (err) {
      console.error('Feed 初始化失败：', err.message);
    }
  }

  window.HomeFeed = {
    init,
    // 点击标签/分类：若点击的是当前筛选则重置为全部，否则应用筛选；切换时清空搜索词，避免筛选与搜索叠加；并回顶
    setCategory(name) {
      cat = (name === cat) ? 'all' : name;
      query = '';
      const input = document.getElementById('home-search');
      if (input) input.value = '';
      shown = PAGE;
      render();
      scrollTop();
    },
    // 重置筛选：分类=全部、清空搜索，并回顶
    reset() {
      cat = 'all';
      query = '';
      const input = document.getElementById('home-search');
      if (input) input.value = '';
      shown = PAGE;
      render();
      scrollTop();
    },
    getCategory() { return cat; },
    scrollTop,
    refresh() { shown = PAGE; render(); },
  };
})();
