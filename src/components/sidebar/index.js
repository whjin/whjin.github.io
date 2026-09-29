/* 首页右栏信息/广告区（dev.to 式独立带边框区块）：读 src/components/sidebar/data.json 渲染，可无限扩展 */
(function () {
  'use strict';

  const DATA_URL = 'src/components/sidebar/data.json';

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

  function makeBlock(section) {
    const block = document.createElement('div');
    block.className = 'sb-block';
    const h = document.createElement('h3');
    h.dataset.i18n = section.i18n_title || '';
    h.textContent = t(section.i18n_title || '', section.title || '');
    block.appendChild(h);
    return block;
  }

  function renderIntro(section) {
    const block = makeBlock(section);
    const inner = document.createElement('div');
    inner.className = 'sb-intro';
    inner.innerHTML =
      '<img class="sb-avatar" src="' + esc(section.avatar) + '" alt="" />' +
      '<div class="sb-text">' + esc(section.text) +
      (section.link ? '<div style="margin-top:8px;"><a href="' + esc(section.link.url) + '">' + esc(section.link.text) + '</a></div>' : '') +
      '</div>';
    block.appendChild(inner);
    return block;
  }

  function renderList(section) {
    const block = makeBlock(section);
    const ul = document.createElement('ul');
    ul.className = 'sb-list';
    (section.items || []).forEach((it) => {
      const li = document.createElement('li');
      if (it.url) {
        const a = document.createElement('a');
        a.href = it.url;
        a.textContent = it.text;
        li.appendChild(a);
        if (it.time) { const s = document.createElement('span'); s.className = 'sb-time'; s.textContent = it.time; li.appendChild(s); }
      } else {
        li.textContent = it.text;
        if (it.time) { const s = document.createElement('span'); s.className = 'sb-time'; s.textContent = it.time; li.appendChild(s); }
      }
      ul.appendChild(li);
    });
    block.appendChild(ul);
    return block;
  }

  function renderNotice(section) {
    const block = makeBlock(section);
    const p = document.createElement('div');
    p.className = 'sb-text';
    p.textContent = section.text;
    block.appendChild(p);
    if (section.url) {
      const a = document.createElement('a');
      a.href = section.url;
      a.textContent = section.url_text || '→';
      a.style.display = 'inline-block';
      a.style.marginTop = '10px';
      a.style.fontWeight = '600';
      block.appendChild(a);
    }
    return block;
  }

  function renderTags(section, autoTags) {
    const block = makeBlock(section);
    const wrap = document.createElement('div');
    wrap.className = 'sb-tags';
    const tags = (section.tags && section.tags.length ? section.tags : autoTags).slice(0, 10);
    tags.forEach((tg) => {
      const b = document.createElement('span');
      b.className = 'sb-tag';
      b.textContent = '#' + tg;
      b.addEventListener('click', () => {
        if (window.HomeFeed && window.HomeFeed.setCategory) window.HomeFeed.setCategory(tg);
      });
      wrap.appendChild(b);
    });
    block.appendChild(wrap);
    return block;
  }

  // 词云：展示全部分类（带数量），点击过滤文章流
  function renderCategories(section, catCounts) {
    const block = makeBlock(section);
    const wrap = document.createElement('div');
    wrap.className = 'sb-tags';
    catCounts.forEach(([key, count]) => {
      const b = document.createElement('span');
      b.className = 'sb-tag sb-cat';
      b.textContent = key + ' ' + count;
      b.addEventListener('click', () => {
        if (window.HomeFeed && window.HomeFeed.setCategory) window.HomeFeed.setCategory(key);
      });
      wrap.appendChild(b);
    });
    block.appendChild(wrap);
    return block;
  }

  // 社交卡片：把头部移出的社交图标平铺展示（由 social 组件提供网格渲染）
  function renderSocial(section) {
    const block = makeBlock(section);
    if (window.SocialGrid && window.SocialGrid.renderInto) {
      window.SocialGrid.renderInto(block);
    } else {
      const ph = document.createElement('div');
      ph.className = 'sb-text';
      ph.textContent = '—';
      block.appendChild(ph);
    }
    return block;
  }

  function renderAd(section) {
    const block = makeBlock(section);
    if (section.ad_slot) {
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', section.ad_client || '');
      ins.setAttribute('data-ad-slot', section.ad_slot);
      ins.setAttribute('data-ad-format', 'fluid');
      block.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    } else {
      const ph = document.createElement('div');
      ph.className = 'sb-ad';
      ph.textContent = 'Advertisement';
      block.appendChild(ph);
    }
    return block;
  }

  function renderLinks(section) {
    const block = makeBlock(section);
    const wrap = document.createElement('div');
    wrap.className = 'sb-links';
    (section.items || []).forEach((it) => {
      const a = document.createElement('a');
      a.href = it.url;
      a.textContent = it.text;
      wrap.appendChild(a);
    });
    block.appendChild(wrap);
    return block;
  }

  async function init() {
    const wrap = document.getElementById('home-sidebar');
    if (!wrap) return;
    let autoTags = [];
    let catCounts = [];
    try {
      const menu = await (await fetch('src/template/menu/data.json')).json();
      const articleCard = (Array.isArray(menu) ? menu : []).find((c) => c.title === '原创文章');
      const feedItems = (articleCard && Array.isArray(articleCard.items)) ? articleCard.items : [];
      const tagCounts = new Map();
      feedItems.forEach((it) => (it.tags || []).forEach((g) => tagCounts.set(g, (tagCounts.get(g) || 0) + 1)));
      autoTags = [...tagCounts.keys()].sort((a, b) => tagCounts.get(b) - tagCounts.get(a)).slice(0, 10);
      // 分类词云：按分类聚合（含数量）
      const catMap = new Map();
      feedItems.forEach((it) => catMap.set(it.category, (catMap.get(it.category) || 0) + 1));
      catCounts = [...catMap.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    } catch (e) { /* 忽略 */ }
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('sidebar 加载失败');
      const data = await res.json();
      (data.sections || []).forEach((sec) => {
        let el = null;
        if (sec.type === 'intro') el = renderIntro(sec);
        else if (sec.type === 'list') el = renderList(sec);
        else if (sec.type === 'notice') el = renderNotice(sec);
        else if (sec.type === 'tags') el = renderTags(sec, autoTags);
        else if (sec.type === 'categories') el = renderCategories(sec, catCounts);
        else if (sec.type === 'social') el = renderSocial(sec);
        else if (sec.type === 'ads') el = renderAd(sec);
        else if (sec.type === 'links') el = renderLinks(sec);
        if (el) wrap.appendChild(el);
      });
    } catch (err) {
      console.error('Sidebar 初始化失败：', err.message);
    }
  }

  window.HomeSidebar = { init };
})();
