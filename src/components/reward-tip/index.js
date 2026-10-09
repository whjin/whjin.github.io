/* 可复用赞赏触发卡片（1:1 复刻 zhheo 博客文章底部 post-copyright 卡片）
 * 特性：浅灰卡片底 + 圆角12px；头像探出卡片顶部（66px 圆，hover 内部回缩动效）；
 * 红色「打赏作者」/ 绿色「订阅」圆角胶囊按钮，hover 变主色并带左侧滑入动画；
 * 底部版权声明（作者名加粗）。
 * 依赖：无。自包含 CSS（注入 <style>），可在任意二级页面正文之后注入。
 * 用法：
 *   <script src="/src/components/reward-tip/index.js"></script>
 *   RewardTip.renderInto(document.querySelector('#markdown-content')); // 追加到正文末尾
 * 开关：由调用方按文章 reward 参数决定是否调用（默认调用=显示）。
 */
(function () {
  'use strict';

  var CONFIG = {
    mascot: '/src/images/reward/mascot.webp',
    name: '吴华锦',
    intro: '分享设计与科技生活',
    rewardUrl: '/reward.html',
    koFiUrl: 'https://ko-fi.com/whjin',
    // 头像点击跳转地址（默认首页，可自定义）
    avatarUrl: '/viewer.html?path=Link_资源_resource&format=html',
    // 作者名点击跳转地址（网站首页，新标签打开）
    authorUrl: '/',
    // 主色（按钮 hover 变主色，参考 zhheo --heo-main）
    themeColor: '#425AEF',
    // 打赏按钮红色 / 订阅按钮绿色（参考 zhheo --heo-red / --heo-green）
    rewardColor: '#FF3842',
    subscribeColor: '#57bd6a',
    // 版权声明（末尾作者名加粗）
    notePrefix:
      '主观感受，仅供参考。本文是原创文章，采用 CC BY-NC-ND 4.0 协议，完整转载请注明来自 ',
    noteAuthor: '吴华锦',
  };

  var CSS_ID = 'reward-tip-style';
  var CSS = [
    /* icomoon 字体图标：icon-hand-heart-fill=打赏作者、icon-plant-fill=订阅（字体文件 src/images/codesign/iconfont.woff） */
    '@font-face{font-family:heoblogIcon;font-display:swap;src:url("/src/images/codesign/iconfont.woff") format("woff")}',
    '.heoblogIcon{font-family:heoblogIcon!important;font-size:16px;font-style:normal;font-weight:400;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-variant:normal;text-transform:none;speak:none}',
    '.heoblogIcon.icon-hand-heart-fill:before{content:"\\e048"}',
    '.heoblogIcon.icon-plant-fill:before{content:"\\e049"}',
    '.rt-btn-content .heoblogIcon{font-size:22px;display:inline-block;vertical-align:middle}',
    '.reward-tip-block{width:100%;margin:80px 0 30px;box-sizing:border-box}',
    /* 卡片主体：浅灰底 + 淡边框，圆角12px，padding-top 给探出的头像留位 */
    '.rt-card{position:relative;width:100%;background:#f7f7f9;border:1px solid #e3e8f7;border-radius:12px;padding:34px 12px 20px;text-align:center;box-sizing:border-box}',
    /* 头像：负 margin 向上探出卡片顶部。整体圆形图标：黄色圆环 + 白色内圆 + 形象。overflow:hidden 强制圆形裁剪；border-radius 用 !important 免疫站点全局 a:link{border-radius:3px} 覆盖，确保始终正圆；hover 内部形象轻微回缩 */
    '.rt-avatar-wrap{position:relative;display:block;width:66px;height:66px;margin:-66px auto 0}',
    '.rt-avatar-link{display:block;width:66px;height:66px;border-radius:50%!important;overflow:hidden;background:#fff;border:3px solid #ffc848;box-shadow:0 8px 12px -3px rgba(66,90,239,.35);text-decoration:none;box-sizing:border-box;transition:box-shadow .4s ease}',
    '.rt-avatar{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;cursor:pointer;transition:transform .4s cubic-bezier(.4,0,.2,1);transform:scale(1)}',
    '.rt-avatar-link:hover{box-shadow:0 8px 16px -3px rgba(66,90,239,.4);background:#fff!important}',
    '.rt-avatar-link:hover .rt-avatar{transform:scale(.9)}',
    /* 昵称 / 简介 */
    '.rt-name{font-size:22px;font-weight:700;color:#363636;margin:14px 0 0;line-height:1;letter-spacing:.3px}',
    '.rt-intro{font-size:15px;color:rgba(60,60,67,.8);margin:6px 0 0}',
    /* 按钮区：flex 居中，打赏(红) + 订阅(绿)，圆角胶囊，hover 变主色 */
    '.rt-actions{display:flex;justify-content:center;align-items:center;margin-top:14px;flex-wrap:wrap}',
    '.rt-reward,.rt-subscribe{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 16px;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;color:#fff!important;border:none;border-radius:20px!important;box-sizing:border-box;transition:color .4s,background-color .4s,box-shadow .4s}',
    '.rt-reward{background:#FF3842;box-shadow:0 8px 12px -3px rgba(238,125,121,.21)}',
    '.rt-subscribe{background:#57bd6a;box-shadow:0 8px 12px -3px rgba(135,238,121,.21);margin-left:8px}',
    /* 左侧滑入动画层（对应参考站 .button--animated::before） */
    '.rt-reward::before,.rt-subscribe::before{content:"";position:absolute;inset:0;z-index:0;background:#425AEF;transition:transform .5s ease-out;transform:scaleX(0);transform-origin:0 50%}',
    '.rt-reward:hover::before,.rt-subscribe:hover::before{transform:scaleX(1);transition-timing-function:cubic-bezier(.45,1.64,.47,.66)}',
    '.rt-reward:hover,.rt-subscribe:hover{background:#425AEF;box-shadow:none}',
    '.rt-btn-content{position:relative;z-index:2;display:inline-flex;align-items:center;gap:6px}',
    /* 按钮左侧图标：内联 SVG，白色线性图标，无圆形/方形底 */
    '.rt-btn-icon{width:18px;height:18px;fill:currentColor;display:inline-block}',
    /* 版权声明 */
    '.rt-note{font-size:15px;color:rgba(60,60,67,.8);line-height:1.6;margin:14px 0 6px;text-align:center}',
    '.rt-note strong{color:#363636;font-weight:600}',
    /* 作者名链接：常态为加粗深色，hover 主题色圆角框白字（参考 zhheo .post-copyright-info a:hover），点击新标签跳网站首页。
       注意：padding 固定（常态即预留 hover 空间），hover 仅变背景/颜色，不改变 padding，避免整行文本跳动 */
    '.rt-author-link{font-weight:700;color:#363636;text-decoration:none;border-radius:4px!important;padding:0 4px;cursor:pointer;transition:background-color .3s,color .3s}',
    '.rt-author-link:hover{background-color:#425AEF;color:#fff}',
    '@media (max-width:640px){.rt-card{padding:30px 12px 18px}.rt-name{font-size:20px}.rt-intro{font-size:14px}.rt-reward,.rt-subscribe{height:38px;padding:0 14px;font-size:14px}}',
  ].join('');

  function ensureStyle() {
    if (document.getElementById(CSS_ID)) return;
    var style = document.createElement('style');
    style.id = CSS_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function buildCard() {
    var block = document.createElement('section');
    block.className = 'reward-tip-block';

    // 卡片主体
    var card = document.createElement('div');
    card.className = 'rt-card';

    // 头像（探出卡片顶部，可点击回首页；hover 内部回缩动效）
    var avatarWrap = document.createElement('div');
    avatarWrap.className = 'rt-avatar-wrap';

    var avatarLink = document.createElement('a');
    avatarLink.className = 'rt-avatar-link';
    avatarLink.href = CONFIG.avatarUrl || '/';
    avatarLink.setAttribute('aria-label', CONFIG.name);
    var avatar = document.createElement('img');
    avatar.className = 'rt-avatar';
    avatar.src = CONFIG.mascot;
    avatar.alt = CONFIG.name;
    avatar.onerror = function () {
      avatar.style.display = 'none';
    };
    avatarLink.appendChild(avatar);
    avatarWrap.appendChild(avatarLink);

    // 昵称 / 简介
    var name = document.createElement('div');
    name.className = 'rt-name';
    name.textContent = CONFIG.name;
    var intro = document.createElement('div');
    intro.className = 'rt-intro';
    intro.textContent = CONFIG.intro;

    // 按钮（打赏作者 → 赞赏页；订阅 → Ko-fi）
    var actions = document.createElement('div');
    actions.className = 'rt-actions';
    var rewardBtn = document.createElement('a');
    rewardBtn.className = 'rt-reward';
    rewardBtn.href = CONFIG.rewardUrl;
    rewardBtn.target = '_blank';
    rewardBtn.rel = 'noopener noreferrer';
    rewardBtn.innerHTML =
      '<span class="rt-btn-content"><i class="heoblogIcon icon-hand-heart-fill"></i> 打赏作者</span>';
    var subscribeBtn = document.createElement('a');
    subscribeBtn.className = 'rt-subscribe';
    subscribeBtn.href = CONFIG.koFiUrl;
    subscribeBtn.target = '_blank';
    subscribeBtn.rel = 'noopener noreferrer';
    subscribeBtn.innerHTML =
      '<span class="rt-btn-content"><i class="heoblogIcon icon-plant-fill"></i> 订阅</span>';
    actions.appendChild(rewardBtn);
    actions.appendChild(subscribeBtn);

    // 版权声明（作者名：可点击链接，hover 主题色圆角框，点击新标签跳网站首页）
    var note = document.createElement('div');
    note.className = 'rt-note';
    note.innerHTML = '';
    note.appendChild(document.createTextNode(CONFIG.notePrefix));
    var authorLink = document.createElement('a');
    authorLink.className = 'rt-author-link';
    authorLink.href = CONFIG.authorUrl;
    authorLink.target = '_blank';
    authorLink.rel = 'noopener noreferrer';
    authorLink.textContent = CONFIG.noteAuthor;
    note.appendChild(authorLink);

    card.appendChild(avatarWrap);
    card.appendChild(name);
    card.appendChild(intro);
    card.appendChild(actions);
    card.appendChild(note);

    block.appendChild(card);
    return block;
  }

  window.RewardTip = {
    CONFIG: CONFIG,
    // 在正文末尾追加赞赏卡片（幂等：已存在则不重复）。
    // 文章内容里可能带 AdSense 广告（<ins class="adsbygoogle">），卡片应位于广告上方、文章下方：
    // 插到第一个广告元素之前；无广告则追加到末尾。
    renderInto: function (container) {
      if (!container || container.querySelector('.reward-tip-block')) return;
      ensureStyle();
      const card = buildCard();
      const ad = container.querySelector('ins.adsbygoogle, .adsbygoogle, ins');
      if (ad) {
        ad.parentNode.insertBefore(card, ad);
      } else {
        container.appendChild(card);
      }
    },
  };
})();
