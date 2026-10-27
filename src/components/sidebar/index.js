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

  // 高亮当前处于激活筛选的标签（POPULAR TAGS / Categories 复用）
  function applyActiveTag() {
    const activeKey = (window.HomeFeed && window.HomeFeed.getCategory) ? window.HomeFeed.getCategory() : 'all';
    document.querySelectorAll('.sb-tag[data-key]').forEach((b) => {
      b.classList.toggle('active', b.dataset.key === activeKey);
    });
  }

  function makeBlock(section) {
    const block = document.createElement('div');
    block.className = 'sb-block';
    const h = document.createElement('h3');
    h.dataset.i18n = section.i18n_title || '';
    // 有 i18n_title 才走翻译；否则直接用 title（避免 I18N.t('') 返回空覆盖标题）
    h.textContent = section.i18n_title ? t(section.i18n_title, section.title || '') : (section.title || '');
    block.appendChild(h);
    return block;
  }

  function renderIntro(section) {
    const block = makeBlock(section);
    const inner = document.createElement('div');
    inner.className = 'sb-intro';
    inner.innerHTML = '<img class="sb-avatar" src="' + esc(section.avatar) + '" alt="" />';
    const textWrap = document.createElement('div');
    textWrap.className = 'sb-text';
    const introText = document.createElement('div');
    introText.className = 'art-font sb-about-text';
    if (section.i18n_text) {
      introText.dataset.i18n = section.i18n_text;
      const raw = t(section.i18n_text, section.text || '');
      // About 卡片：固定把"名字 | 身份。"这一句包成 <strong>，后面描述文字常规字重
      // （原来用 CSS ::first-line 做粗体，会随屏幕宽度漂移把描述也加粗）
      if (section.i18n_text === 'sb_about_intro') {
        const m = raw.match(/^([^.。]+[.。])/);
        if (m) {
          introText.innerHTML = '<strong>' + esc(m[1]) + '</strong><br>' + esc(raw.slice(m[1].length));
        } else {
          introText.textContent = raw;
        }
      } else {
        introText.textContent = raw;
      }
    } else {
      introText.textContent = section.text || '';
    }
    textWrap.appendChild(introText);
    if (section.link) {
      const linkDiv = document.createElement('div');
      linkDiv.style.marginTop = '8px';
      linkDiv.innerHTML = '<a href="' + esc(section.link.url) + '">' + esc(section.link.text) + '</a>';
      textWrap.appendChild(linkDiv);
    }
    inner.appendChild(textWrap);
    block.appendChild(inner);
    return block;
  }

  // 单条事件卡：图片 + 标题 + 描述（dev.to Happening Now 式），整张卡片可点击跳转，描述3行省略+悬停title全文
  function makeEventCard(it) {
    const href = it.url || '';
    const hasLink = !!href && href !== '#';
    // 有有效 url → 整张卡片渲染为 <a>；无 url（如"即将上线"占位）→ 渲染为 <div> 不可点击
    const card = document.createElement(hasLink ? 'a' : 'div');
    card.className = 'sb-event' + (hasLink ? ' sb-event-link' : '');
    if (hasLink) {
      card.href = href;
      // 外链新标签打开（广告/推荐位均为外链），内链（/viewer.html...）也保持新标签以减少跳出
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    if (it.image) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'sb-event-img';
      const img = document.createElement('img');
      img.src = it.image;
      img.alt = it.title || '';
      img.loading = 'lazy';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }
    if (it.title) {
      const t = document.createElement('div');
      t.className = 'sb-event-title';
      t.textContent = it.title;
      card.appendChild(t);
    }
    if (it.desc) {
      const p = document.createElement('p');
      p.className = 'sb-event-desc';
      p.textContent = it.desc;
      p.title = it.desc; // 悬停 title 显示完整描述
      card.appendChild(p);
    }
    return card;
  }

  // 事件/动态卡片：默认只显示1条，条目数>1时在标题右侧提供「更多 ›」按钮展开其余内容（省空间，利于移动端）
  // all:true → 默认全部显示、不提供「更多」按钮；all:false/缺省 → 收起为1条 + 「更多」
  function renderEvent(section) {
    const block = document.createElement('div');
    block.className = 'sb-block';
    const items = section.list || [];
    const count = items.length;
    const showAll = section.all === true;
    // 标题行：标题 + （条目>1且非all时）右侧「更多 ›」按钮
    const head = document.createElement('div');
    head.className = 'sb-event-head';
    const h = document.createElement('h3');
    h.dataset.i18n = section.i18n_title || '';
    h.textContent = t(section.i18n_title || '', section.title || '');
    head.appendChild(h);
    let moreBtn = null;
    let extraWrap = null;
    if (count > 1 && !showAll) {
      const ml = (function () {
        const v = (window.I18N && window.I18N.t) ? window.I18N.t('sb_more') : '';
        return (v && v !== 'sb_more') ? v : '更多';
      })();
      moreBtn = document.createElement('button');
      moreBtn.className = 'sb-event-more';
      moreBtn.type = 'button';
      moreBtn.innerHTML = '<span class="sb-event-more-text">' + esc(ml) + '</span><span class="sb-event-arrow">›</span>';
      head.appendChild(moreBtn);
    }
    block.appendChild(head);
    // 主列表：all 或只有1条 → 全部显示；否则只显示第1条
    const wrap = document.createElement('div');
    wrap.className = 'sb-events';
    if (showAll || count <= 1) {
      items.forEach((it) => wrap.appendChild(makeEventCard(it)));
    } else {
      wrap.appendChild(makeEventCard(items[0]));
    }
    block.appendChild(wrap);
    // 边框：仅当可见内容多于1条时呈现（sb-events-multi），收起为1条时去掉
    block.classList.toggle('sb-events-multi', (showAll || count <= 1) ? count > 1 : false);
    // 其余条目：默认隐藏，点「更多」展开
    if (count > 1 && !showAll) {
      extraWrap = document.createElement('div');
      extraWrap.className = 'sb-events-extra';
      extraWrap.hidden = true;
      items.slice(1).forEach((it) => extraWrap.appendChild(makeEventCard(it)));
      block.appendChild(extraWrap);
      moreBtn.addEventListener('click', () => {
        const isOpen = !extraWrap.hidden;
        extraWrap.hidden = isOpen;
        moreBtn.classList.toggle('open', !isOpen);
        // 展开(>1条)加边框，收起(1条)去边框
        block.classList.toggle('sb-events-multi', !isOpen);
      });
    }
    return block;
  }

  function renderList(section) {
    const block = makeBlock(section);
    const ul = document.createElement('ul');
    ul.className = 'sb-list';
    (section.list || []).forEach((it) => {
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

  // 热门标签：固定标签（支持 {name,url} 带跳转，置顶） + menu 卡标题（同类查找） + 文章标签
  function renderTags(section, autoTags, menuTitles) {
    const block = makeBlock(section);
    const wrap = document.createElement('div');
    wrap.className = 'sb-tags';
    const fixed = section.tags && section.tags.length ? section.tags : [];
    const tags = fixed.concat(menuTitles || []).concat(autoTags || []).slice(0, 16);
    tags.forEach((tg) => {
      const isObj = typeof tg === 'object' && tg !== null;
      const name = isObj ? tg.name : tg;
      const url = isObj ? tg.url : null;
      if (url) {
        // 带跳转的标签：渲染为真实链接，新标签打开（a target=_blank，利于 SEO 与可访问性）
        const a = document.createElement('a');
        a.className = 'sb-tag sb-tag-link';
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.key = name;
        a.textContent = '#' + name;
        wrap.appendChild(a);
        return;
      }
      const b = document.createElement('span');
      b.className = 'sb-tag';
      b.dataset.key = name;
      b.textContent = '#' + name;
      b.addEventListener('click', () => {
        if (window.HomeFeed && window.HomeFeed.setCategory) window.HomeFeed.setCategory(name);
        applyActiveTag();
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
      b.dataset.key = key;
      b.textContent = key + ' ' + count;
      b.addEventListener('click', () => {
        if (window.HomeFeed && window.HomeFeed.setCategory) window.HomeFeed.setCategory(key);
        applyActiveTag();
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

  // 广告卡片：若配置了 list（图片+标题+描述，同正在进行/近期动态结构）则复用 event 渲染（支持收起/更多/all）；
  // 图片和标题都为空 → 回退到当前广告位内容（AdSense 或占位）
  function renderAd(section) {
    const adItems = (section.list || []).filter((it) => it.image || it.title);
    if (adItems.length) {
      return renderEvent(Object.assign({}, section, { list: adItems }));
    }
    const block = makeBlock(section);
    if (section.ad_slot) {
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', section.ad_client || '');
      ins.setAttribute('data-ad-slot', section.ad_slot);
      ins.setAttribute('data-ad-format', 'fluid');
      block.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { }
    } else {
      const ph = document.createElement('div');
      ph.className = 'sb-ad';
      ph.dataset.i18n = 'sb_ad_placeholder';
      ph.textContent = t('sb_ad_placeholder', 'Advertisement');
      block.appendChild(ph);
    }
    return block;
  }

  function renderLinks(section) {
    const block = makeBlock(section);
    const wrap = document.createElement('div');
    wrap.className = 'sb-links';
    (section.list || []).forEach((it) => {
      const a = document.createElement('a');
      a.href = it.url;
      a.textContent = it.text;
      wrap.appendChild(a);
    });
    block.appendChild(wrap);
    return block;
  }

  // 支持/会员卡片：主标题 + 介绍文字 + 权益列表（无横线）+「成为会员」按钮；正文/列表/按钮均支持 i18n 切换
  function renderMember(section) {
    const block = makeBlock(section);
    // 介绍文字（国际化）
    const desc = document.createElement('p');
    desc.className = 'sb-member-text';
    if (section.i18n_text) {
      desc.dataset.i18n = section.i18n_text;
      desc.textContent = t(section.i18n_text, section.text || '');
    } else {
      desc.textContent = section.text || '';
    }
    block.appendChild(desc);
    // 权益列表（国际化，无横线分隔）
    if (Array.isArray(section.benefits) && section.benefits.length) {
      const ul = document.createElement('ul');
      ul.className = 'sb-member-list';
      section.benefits.forEach((b, i) => {
        const li = document.createElement('li');
        const key = section.i18n_benefits && section.i18n_benefits[i];
        if (key) {
          li.dataset.i18n = key;
          li.textContent = t(key, b);
        } else {
          li.textContent = b;
        }
        ul.appendChild(li);
      });
      block.appendChild(ul);
    }
    // 按钮（国际化）
    if (section.url) {
      const a = document.createElement('a');
      a.className = 'sb-member-btn';
      a.href = section.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      if (section.i18n_url_text) {
        a.dataset.i18n = section.i18n_url_text;
        a.textContent = t(section.i18n_url_text, section.url_text || '');
      } else {
        a.textContent = section.url_text || 'Support →';
      }
      block.appendChild(a);
    }
    return block;
  }

  async function init() {
    const wrap = document.getElementById('home-sidebar');
    if (!wrap) return;
    let autoTags = [];
    let menuTitles = [];
    let catCounts = [];
    let adsList = [];
    try {
      const menu = await (await fetch('src/template/feed/data.json')).json();
      menuTitles = (Array.isArray(menu) ? menu : [])
        .filter((c) => c.show !== false && c.list && c.list.length > 0)
        .map((c) => c.title);
      const articleCard = (Array.isArray(menu) ? menu : []).find((c) => c.title === '原创文章');
      const feedItems = (articleCard && Array.isArray(articleCard.list)) ? articleCard.list : [];
      const tagCounts = new Map();
      feedItems.forEach((it) => (it.tags || []).forEach((g) => tagCounts.set(g, (tagCounts.get(g) || 0) + 1)));
      autoTags = [...tagCounts.keys()].sort((a, b) => tagCounts.get(b) - tagCounts.get(a)).slice(0, 10);
      // 分类词云：按分类聚合（含数量）
      const catMap = new Map();
      feedItems.forEach((it) => catMap.set(it.category, (catMap.get(it.category) || 0) + 1));
      catCounts = [...catMap.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    } catch (e) { /* 忽略 */ }
    // 广告列表复用友链数据源：提取所有 type === "ads" 的条目，按 sort 字段升序排序（数字越小越靠前）
    try {
      const linkData = await (await fetch('src/template/posts/Link/友链/data.json')).json();
      if (linkData && typeof linkData === 'object') {
        Object.keys(linkData).forEach((key) => {
          const sec = linkData[key];
          if (!sec || !Array.isArray(sec.list)) return;
          sec.list.forEach((it) => {
            if (it && it.type === 'ads' && it.show !== false) {
              // ads 条目：cover→image，adsTitle→title，adsDesc→desc，供下游统一渲染
              adsList.push(Object.assign({}, it, { image: it.cover || it.image, title: it.adsTitle || it.title, desc: it.adsDesc || it.desc }));
            }
          });
        });
        // 按 sort 字段升序排序（无 sort 字段的排最后）
        adsList.sort((a, b) => {
          const sa = a.sort == null ? 9999 : a.sort;
          const sb = b.sort == null ? 9999 : b.sort;
          return sa - sb;
        });
      }
    } catch (e) { /* 忽略，广告位回退到 AdSense/占位 */ }
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('sidebar 加载失败');
      const data = await res.json();
      (data.sections || []).forEach((sec) => {
        let el = null;
        if (sec.type === 'intro') el = renderIntro(sec);
        else if (sec.type === 'event') el = renderEvent(sec);
        else if (sec.type === 'list') el = renderList(sec);
        else if (sec.type === 'notice') el = renderNotice(sec);
        else if (sec.type === 'tags') el = renderTags(sec, autoTags, menuTitles);
        else if (sec.type === 'categories') el = renderCategories(sec, catCounts);
        else if (sec.type === 'social') el = renderSocial(sec);
        else if (sec.type === 'ads') {
          // 合并 section 自带 list（如产品卡片）和友链提取的广告列表，section.list 在前
          const mergedList = (sec.list || []).concat(adsList);
          el = renderAd(Object.assign({}, sec, { list: mergedList }));
        }
        else if (sec.type === 'links') el = renderLinks(sec);
        else if (sec.type === 'member') el = renderMember(sec);
        if (el) wrap.appendChild(el);
      });
    } catch (err) {
      console.error('Sidebar 初始化失败：', err.message);
    }
  }

  window.HomeSidebar = { init, applyActiveTag };
})();
