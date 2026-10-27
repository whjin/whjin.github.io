(function () {
  'use strict';

  const MENU_URL = 'src/template/feed/data.json';

  let allItems = [];
  let cat = 'all';
  let query = '';
  let currentPage = 1;
  let pageSize = 0;  // 0 = 不分页（全部展示）
  let feedList = null;
  let pagerEl = null;
  let cardAvgH = 220;  // 文章卡片平均高度（含间距），全量渲染后实测缓存

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
        const desc = (it.desc || '').toLowerCase();
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
    // 方案 A：按 标题+分类 去重；同一文章在多分组重复时优先保留静态页链接（SEO），避免搜索/首页重复展示
    const seenMap = new Map();
    const deduped = [];
    list.forEach((it) => {
      const key = (it.title || '') + '|' + (it.category || '');
      const isStatic = !!(it.url && /\/html\//.test(it.url));
      const existing = seenMap.get(key);
      if (!existing) {
        seenMap.set(key, it);
        deduped.push(it);
      } else if (isStatic && !/\/html\//.test(existing.url || '')) {
        const i = deduped.indexOf(existing);
        deduped[i] = it;
        seenMap.set(key, it);
      }
    });
    list = deduped;
    return list;
  }

  // 精选模块已移除：置顶精选通过文章卡置顶 + ★ Featured 标识实现，不再重复展示

  // 卡片模板（Dev.to 风格，单数据集）：各区块按字段是否存在条件渲染
  // 封面(cover)存在 → 左图右文；标题行右侧为「分类+精选」标识；摘要(description)→标签→互动统计+阅读时长
  function cardHTML(it) {
    const topText = t('fc_top'); // 国际化：英文 Top / 中文 置顶
    const topTag = it.top ? '<span class="fc-top" title="' + esc(topText) + '">' + esc(topText) + '</span>' : '';
    const hasCover = !!it.cover;
    const cover = hasCover
      ? '<div class="fc-cover"><img src="' + esc(it.cover) + '" alt="' + esc(it.title) + '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : '';
    const tags = (it.tags || []).slice(0, 4)
      .map((g) => '<span class="fc-tag">#' + esc(g) + '</span>').join('');
    const featured = it.featured ? '<span class="fc-featured">★ ' + esc(t('featured_badge', 'Featured')) + '</span>' : '';
    const category = (it.category || it._group) ? '<span class="fc-category">' + esc(it.category || it._group) + '</span>' : '';
    const badges = (category || featured) ? '<div class="fc-badges">' + category + featured + '</div>' : '';
    const description = it.desc
      ? '<div class="fc-excerpt" title="' + esc(it.desc) + '">' + esc(it.desc) + '</div>'
      : '';
    // 互动统计（可选字段，存在才渲染）
    let stats = '';
    if (it.reactions != null) stats += '<span class="fc-stat">' + it.reactions + ' <span data-i18n="reactions">reactions</span></span>';
    if (it.comments != null) stats += '<span class="fc-stat">' + it.comments + ' <span data-i18n="comments">comments</span></span>';
    // 字数统计（本地文章才有；外部 AI 工具链接不显示）
    let readtime = '';
    if (it.wordCount) {
      const label = t('words_unit', 'words');
      readtime = '<span class="fc-readtime">' + it.wordCount + ' ' + label + '</span>';
    }
    return (
      topTag +
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

  // 测量左右总高度对比，按右侧侧边栏高度计算每页能放几张卡片
  function decidePagination() {
    const list = filtered();
    if (list.length === 0) { pageSize = 0; return; }

    const sidebar = document.querySelector('.home-sidebar');
    const listEl = document.getElementById('home-feed-list');
    if (!sidebar || !listEl) { pageSize = 0; return; }

    const rightH = sidebar.offsetHeight;
    const cards = listEl.querySelectorAll('.feed-card');
    if (cards.length === 0) { pageSize = 0; return; }

    const totalCardH = Array.from(cards).reduce((sum, c) => sum + c.offsetHeight, 0);
    const cardAvgH = (totalCardH / cards.length) + 18;

    const pagerH = 48;
    const size = Math.floor((rightH - pagerH) / cardAvgH);
    pageSize = Math.max(2, Math.min(size, list.length));
  }

  function renderPager(total) {
    if (pageSize <= 0) {
      // 不分页 → 移除分页控件
      if (pagerEl) { pagerEl.remove(); pagerEl = null; }
      return;
    }
    if (!pagerEl) {
      pagerEl = document.createElement('div');
      feedList.parentNode.appendChild(pagerEl);
    }
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(currentPage, totalPages);
    // 统一使用公共 Pager 组件（样式与 reward.html 一致：胶囊按钮、"第N页 / 共M页"）
    if (window.Pager && window.Pager.mount) {
      window.Pager.mount(pagerEl, {
        current: cur,
        totalPages: totalPages,
        onChange: goPage
      });
    }
  }

  function goPage(p) {
    currentPage = p;
    render();
    // 翻页后从新一页第一张卡片开始看：滚动到卡片列表顶部，避开 sticky banner/header。
    // 这样不管一页卡片高矮、多少，都从头顺次浏览；pager 自然在卡片流末尾，
    // 不会出现顶部露半截卡片、尾页停在空白处的问题。
    requestAnimationFrame(() => {
      const listEl = document.getElementById('home-feed-list');
      if (!listEl) return;
      const headerH = document.querySelector('.header')?.offsetHeight || 0;
      const bannerH = document.querySelector('.banner')?.offsetHeight || 0;
      const top = listEl.getBoundingClientRect().top + window.scrollY - headerH - bannerH - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }

  function render() {
    if (!feedList) feedList = document.getElementById('home-feed-list');
    if (!feedList) return;
    const list = filtered();
    const total = list.length;

    // 分页：slice 当前页；不分页：全量
    let slice;
    if (pageSize > 0 && total > pageSize) {
      const start = (currentPage - 1) * pageSize;
      slice = list.slice(start, start + pageSize);
    } else {
      slice = list;
    }

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
    renderPager(total);
  }

  // 测量左侧文章卡片平均高度（需在全量渲染后调用），结果缓存到模块变量
  function measureCardAvg(listEl) {
    const cards = listEl.querySelectorAll('.feed-card');
    if (!cards.length) return cardAvgH;
    const total = Array.from(cards).reduce((s, c) => s + c.offsetHeight, 0) + (cards.length - 1) * 18;
    cardAvgH = total / cards.length;
    return cardAvgH;
  }

  // 移动端每页固定卡片数（单列布局不按右侧高度算，sidebar 在顶部高度不稳定）
  const MOBILE_PAGE_SIZE = 6;

  // 根据右侧实际高度决定分页（ResizeObserver 实测修正用）
  function applyPaginationByRight(rightH, cardAvgH, total) {
    // 移动端单列布局：固定每页 MOBILE_PAGE_SIZE 张；总数不足则不分页
    if (!window.matchMedia('(min-width: 1025px)').matches) {
      pageSize = total > MOBILE_PAGE_SIZE ? MOBILE_PAGE_SIZE : 0;
      return;
    }
    // 左侧总高 = 全部文章数 * 平均高度
    const leftTotalH = total * cardAvgH;
    if (leftTotalH <= rightH) { pageSize = 0; return; }
    // 左 > 右：按右侧高度计算每页卡片数（预留分页控件 48px）。
    // 向上取整：让左侧卡片流 + 分页条刚好撑满右侧高度，并自然略高出一点点（一张卡片的零头），
    // 既不短一截留白，也不会多塞一整张卡片导致左侧突出太多。
    const size = Math.ceil((rightH - 48) / cardAvgH);
    pageSize = Math.max(1, Math.min(size, total));
  }

  // 根据 feed/data.json 数据预估右侧侧边栏高度（侧边栏还没渲染时先用）
  // 侧边栏宽320px，卡片间距14px；下面的常量由 .sb-block 实际样式推算
  function estimateSidebarHeight(menu) {
    const GAP = 14;                 // 卡片间距
    const BLOCK_HEAD = 74;          // 每个 sb-block 基础高度（padding + 标题 + margin）

    // 复现 sidebar/index.js 中 tags 的生成逻辑
    const visible = (Array.isArray(menu) ? menu : []).filter((c) => c.show !== false && c.list && c.list.length);
    const menuTitles = visible.map((c) => c.title);
    const articleCard = (Array.isArray(menu) ? menu : []).find((c) => c.title === '原创文章');
    const feedItems = (articleCard && articleCard.list) ? articleCard.list : [];
    const tagCounts = new Map();
    feedItems.forEach((it) => (it.tags || []).forEach((g) => tagCounts.set(g, (tagCounts.get(g) || 0) + 1)));
    const autoTags = [...tagCounts.keys()].sort((a, b) => tagCounts.get(b) - tagCounts.get(a)).slice(0, 10);
    const tagCount = Math.min(1 + menuTitles.length + autoTags.length, 16);
    // 分类数
    const catSet = new Set(feedItems.map((it) => it.category).filter(Boolean));
    const catCount = catSet.size;

    // 标签云：侧边栏可用宽度约288px，每行约3个中文标签，每行36px
    const tagRows = (n) => Math.ceil(n / 3) * 36;
    // event 区块默认收起只显示1条（带图约200，无图约110）
    const EVENT_H = 180;
    // 广告区块（友链广告/AdSense fluid）预留高度
    const ADS_H = 300;

    const blocks = [
      BLOCK_HEAD + 110,   // intro  About：头像+约4行文本+链接
      BLOCK_HEAD + 80,    // social Connect：2行图标
      BLOCK_HEAD + 200,   // member Subscribe：文本+3条权益+按钮
      BLOCK_HEAD + tagRows(tagCount), // tags Popular tags
      BLOCK_HEAD + tagRows(catCount), // categories
      EVENT_H,            // Updates（1条）
      EVENT_H,            // What's happening（默认1条）
      EVENT_H,            // Livestreams（默认1条）
      BLOCK_HEAD + ADS_H, // ads
      BLOCK_HEAD + 40,    // links
    ];
    return blocks.reduce((s, h) => s + h, 0) + GAP * (blocks.length - 1);
  }

  // 首次渲染：用 data.json 预估高度立即分页，再用 ResizeObserver 等侧边栏实际渲染后修正
  function afterFirstRender(menu) {
    pageSize = 0;
    render();

    const listEl = document.getElementById('home-feed-list');
    measureCardAvg(listEl);  // 实测并缓存文章卡片平均高度
    const total = filtered().length;

    // 1) 立即用预估高度设置初始分页（打开页面即有分页，无需等待滚动）
    const estH = estimateSidebarHeight(menu);
    applyPaginationByRight(estH, cardAvgH, total);
    currentPage = 1;
    render();

    // 2) ResizeObserver 监听侧边栏实际高度，渲染完成 / 广告加载后自动修正；
    //    侧边栏高度连续 2.5 秒无变化即视为稳定，自动断开，避免之后翻页/搜索被打断
    const sidebar = document.getElementById('home-sidebar');
    if (sidebar && typeof ResizeObserver !== 'undefined') {
      let debounce = null;
      let stableTimer = null;
      const ro = new ResizeObserver(() => {
        clearTimeout(debounce);
        clearTimeout(stableTimer);
        debounce = setTimeout(() => {
          const rightH = sidebar.offsetHeight;
          if (rightH < 50) return;  // 侧边栏还没渲染
          const oldSize = pageSize;
          applyPaginationByRight(rightH, cardAvgH, filtered().length);
          if (pageSize !== oldSize) {
            currentPage = 1;
            render();
          }
        }, 300);
        // 每次高度变化后重新计时，2.5 秒无变化则断开
        stableTimer = setTimeout(() => {
          ro.disconnect();
        }, 2500);
      });
      ro.observe(sidebar);
    }
  }

  // 基于右侧侧边栏实际高度重新计算分页（搜索/筛选/resize 时调用）
  function decidePagination() {
    // 移动端：固定每页 MOBILE_PAGE_SIZE 张，与 applyPaginationByRight 保持一致
    if (!window.matchMedia('(min-width: 1025px)').matches) {
      const total = filtered().length;
      pageSize = total > MOBILE_PAGE_SIZE ? MOBILE_PAGE_SIZE : 0;
      return;
    }
    const sidebar = document.querySelector('.home-sidebar');
    if (!sidebar) { pageSize = 0; return; }
    const rightH = sidebar.offsetHeight;
    if (rightH < 50) { pageSize = 0; return; }
    applyPaginationByRight(rightH, cardAvgH, filtered().length);
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
        cat = 'all';
        currentPage = 1;
        // 筛选后先全量渲染，再测量决定是否分页
        pageSize = 0;
        render();
        setTimeout(() => { decidePagination(); render(); }, 200);
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
        return c.home === true && c.list && c.list.length > 0;
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
        (c.list || []).forEach(function (it) {
          it._group = c.title;
          allItems.push(it);
        });
      });
      // top 全局置顶：top:true 的文章提升到整个首页 feed 流最前（最高优先级）；
      // 多个 top 之间按 date 倒序（date 越新越靠前）；其余非 top 保持 data.json 顺序（稳定排序）
      allItems.sort(function (a, b) {
        const ta = Number(!!a.top), tb = Number(!!b.top);
        if (tb !== ta) return tb - ta;          // top 优先
        if (ta === 1 && a.date && b.date) {     // 同为 top 时按 date 倒序，date 越新越前
          return (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
        }
        return 0;                                // 其余保持原顺序
      });
      afterFirstRender(menu);
      bindSearch();
    } catch (err) {
      console.error('Feed 初始化失败：', err.message);
    }
  }

  window.HomeFeed = {
    init,
    setCategory(name) {
      cat = (name === cat) ? 'all' : name;
      query = '';
      const input = document.getElementById('home-search');
      if (input) input.value = '';
      currentPage = 1;
      pageSize = 0;
      render();
      setTimeout(() => { decidePagination(); render(); }, 200);
      scrollTop();
    },
    reset() {
      cat = 'all';
      query = '';
      const input = document.getElementById('home-search');
      if (input) input.value = '';
      currentPage = 1;
      pageSize = 0;
      render();
      setTimeout(() => { decidePagination(); render(); }, 200);
      scrollTop();
    },
    getCategory() { return cat; },
    scrollTop,
    refresh() { currentPage = 1; pageSize = 0; render(); setTimeout(() => { decidePagination(); render(); }, 200); },
  };

  // 窗口 resize 时重新测量决定是否分页（PC↔移动端切换）
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentPage = 1;
      decidePagination();
      render();
    }, 200);
  });
})();
