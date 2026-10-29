(function () {
  'use strict';

  const currentYear = new Date().getFullYear();

  // 数据路径（相对根目录 index.html）
  const FEED_DATA_URL = 'src/template/feed/data.json';
  const SIDEBAR_DATA_URL = 'src/components/sidebar/data.json';

  // 订阅链接（与顶部 subscribe 图标一致）
  const SUBSCRIBE_URL =
    'https://pancake.waffo.ai/store/wuhuajin-tshj54ck/product/PROD_54U7EAdjVS3qPkFqB35gZ1/unavailable?code=STORE_NOT_APPROVED';

  // 站点链接（固定项）
  const SITE_LINKS = [
    { text: '资源导航', url: '/src/template/posts/Link/资源/resource.html' },
    { text: '友链页面', url: '/src/template/posts/Link/友链/link.html' },
    { text: '文章导航', url: '/src/template/posts/Link/文章/article.html' },
    { text: '商品产品', url: 'product.html' },
    { text: '订阅会员', url: SUBSCRIBE_URL, external: true },
    { text: 'RSS 订阅', url: 'rss.xml' },
    { text: '关于我', url: 'about.html' },
    { text: '联系我', url: 'contact.html' },
    { text: '赞赏墙', url: 'reward.html' },
    { text: '隐私政策', url: 'privacy.html' },
    { text: '服务条款', url: 'terms.html' },
    { text: 'AIGC 规范', url: 'aigc-policy.html' },
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchJSON(url) {
    const r = await fetch(url, { cache: 'force-cache' });
    if (!r.ok) throw new Error('fetch failed: ' + url);
    return r.json();
  }

  // 从 feed/data.json 统计分类排行，返回 { hot: [], more: [] }
  function extractCategories(feedData) {
    let posts = [];
    feedData.forEach(function (block) {
      if (block.title === '原创文章') posts = block.list || [];
    });
    const counts = {};
    posts.forEach(function (it) {
      const c = it.category || '未分类';
      counts[c] = (counts[c] || 0) + 1;
    });
    // 按数量降序，数量相同按名称
    const sorted = Object.keys(counts)
      .map(function (k) {
        return { name: k, count: counts[k] };
      })
      .sort(function (a, b) {
        return b.count - a.count || a.name.localeCompare(b.name, 'zh');
      });
    return {
      hot: sorted.slice(0, 6),
      more: sorted.slice(6, 12),
    };
  }

  // 从 feed/data.json 提取友情链接块
  function extractFriendLinks(feedData) {
    let result = [];
    feedData.forEach(function (block) {
      if (block.title === '友情链接') result = block.list || [];
    });
    return result;
  }

  // 从 sidebar/data.json 提取广告位卡片第 1 项
  function extractAdFirst(sidebarData) {
    const sections = (sidebarData && sidebarData.sections) || [];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].type === 'ads' && sections[i].list && sections[i].list.length) {
        return sections[i].list[0];
      }
    }
    return null;
  }

  function catLinkHtml(cat) {
    // 分类链接：首页用 JS 筛选，其他页跳首页带 ?c=
    return (
      '<a href="/?c=' +
      encodeURIComponent(cat.name) +
      '" class="ft-cat-link" data-cat="' +
      esc(cat.name) +
      '">' +
      esc(cat.name) +
      '</a>'
    );
  }

  function render() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    Promise.all([fetchJSON(FEED_DATA_URL), fetchJSON(SIDEBAR_DATA_URL)])
      .then(function (results) {
        const feedData = results[0];
        const sidebarData = results[1];

        const cats = extractCategories(feedData);
        const friends = extractFriendLinks(feedData);
        const adFirst = extractAdFirst(sidebarData);

        // 站点链接：如果有广告位第1项，插到"商品产品"后面
        const siteLinks = SITE_LINKS.slice();
        if (adFirst && adFirst.url) {
          // 找到"商品产品"位置，在其后插入
          const idx = siteLinks.findIndex(function (l) {
            return l.text === '商品产品';
          });
          siteLinks.splice(idx + 1, 0, {
            text: adFirst.title || '推荐广告',
            url: adFirst.url,
            external: true,
          });
        }

        footer.innerHTML = buildHTML(cats, friends, siteLinks);
        bindCatLinks();
        bindBeian();
        loadGoatCount();
      })
      .catch(function (err) {
        // 数据加载失败时降级为简单版权行
        console.warn('Footer 数据加载失败，使用降级渲染：', err);
        footer.innerHTML = buildFallbackHTML();
        bindBeian();
      });
  }

  function buildHTML(cats, friends, siteLinks) {
    const isHome = /^\/(index\.html)?$/.test(location.pathname) || location.pathname === '/';

    // 品牌区
    var brand =
      '' +
      '<div class="ft-brand">' +
      '  <a class="ft-logo" href="/">' +
      '    <img src="/src/images/favicon.png" alt="吴华锦" width="32" height="32" />' +
      '    <span class="ft-logo-name">吴华锦</span>' +
      '  </a>' +
      '  <p class="ft-desc">吴华锦 | 锦绣年华・写意人间。<br/>全栈开发者，记录前端技术、AI 工具与构建心得。</p>' +
      '  <div class="ft-badge-wrap">' +
      '    <a href="https://xinquji.com" target="_blank" rel="noopener noreferrer">' +
      '      <img src="https://xinquji.com/badge" alt="Featured on 新趣集" style="width:200px;height:54px;" width="200" height="54" />' +
      '    </a>' +
      '  </div>' +
      '</div>';

    // 热门分类
    var hotHtml = cats.hot.map(catLinkHtml).join('');
    var hotCol =
      '' +
      '<div class="ft-col">' +
      '  <h4 class="ft-col-title">热门分类</h4>' +
      '  <div class="ft-links">' +
      hotHtml +
      '</div>' +
      '</div>';

    // 更多分类
    var moreHtml = cats.more.map(catLinkHtml).join('');
    var moreCol =
      '' +
      '<div class="ft-col">' +
      '  <h4 class="ft-col-title">更多分类</h4>' +
      '  <div class="ft-links">' +
      moreHtml +
      '</div>' +
      '</div>';

    // 站点链接
    var siteHtml = siteLinks
      .map(function (l) {
        var ext = l.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a href="' + esc(l.url) + '"' + ext + '>' + esc(l.text) + '</a>';
      })
      .join('');
    var siteCol =
      '' +
      '<div class="ft-col ft-col-wide">' +
      '  <h4 class="ft-col-title">站点链接</h4>' +
      '  <div class="ft-links">' +
      siteHtml +
      '</div>' +
      '</div>';

    // 友情链接
    var friendHtml = friends
      .map(function (f) {
        return (
          '<a href="' +
          esc(f.url) +
          '" target="_blank" rel="noopener noreferrer" title="' +
          esc(f.desc || f.title) +
          '">' +
          esc(f.title) +
          '</a>'
        );
      })
      .join('');
    var friendCol =
      '' +
      '<div class="ft-col ft-col-wide">' +
      '  <h4 class="ft-col-title">友情链接</h4>' +
      '  <div class="ft-links">' +
      friendHtml +
      '</div>' +
      '</div>';

    // 底部版权栏
    var copyrightBar =
      '' +
      '<div class="ft-bottom">' +
      '  <div class="ft-bottom-row">' +
      '    <span class="ft-copy">© 2013–' +
      currentYear +
      ' <a href="/" class="ft-copy-link">吴华锦</a> · 累计访问 <span id="goatcounter_total" class="ft-count">0</span> 次</span>' +
      '  </div>' +
      '  <div class="ft-bottom-row">' +
      '    <a class="ft-beian" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">粤ICP备2026112434号</a>' +
      '    <span class="ft-sep">|</span>' +
      '    <a class="ft-email-bottom" href="mailto:wuhuajin09@163.com">wuhuajin09@163.com</a>' +
      '  </div>' +
      '</div>';

    return (
      '' +
      '<div class="ft-inner">' +
      '  <div class="ft-grid">' +
      brand +
      hotCol +
      moreCol +
      siteCol +
      friendCol +
      '  </div>' +
      '  <div class="ft-divider"></div>' +
      copyrightBar +
      '</div>'
    );
  }

  function buildFallbackHTML() {
    return (
      '' +
      '<div class="ft-inner">' +
      '  <div class="ft-bottom">' +
      '    <span class="ft-copy">© 2013–' +
      currentYear +
      ' 吴华锦</span>' +
      '    <a class="ft-beian" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">粤ICP备2026112434号</a>' +
      '  </div>' +
      '</div>'
    );
  }

  // 分类链接点击：首页拦截做筛选，其他页正常跳转
  function bindCatLinks() {
    document.querySelectorAll('.ft-cat-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (window.HomeFeed && window.HomeFeed.setCategory) {
          e.preventDefault();
          var cat = a.dataset.cat;
          window.HomeFeed.setCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  function bindBeian() {
    // 备案号已包在 <a> 里，无需额外事件
  }

  function loadGoatCount() {
    var el = document.querySelector('#goatcounter_total');
    if (!el) return;
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    fetch('https://stats.wuhuajin.com/hit', { method: 'POST' })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d && d.total) el.textContent = d.total;
      })
      .catch(function () {});
  }

  render();
})();
