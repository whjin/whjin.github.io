/**
 * Cookie Consent Banner（GDPR / CCPA 合规）
 * 单文件组件：自带样式注入，localStorage 记忆用户选择
 * 用法：在页面 </body> 前 <script src="src/components/cookie-consent/index.js"></script>
 */
(function () {
  try {
    var KEY = 'cookie_consent_v1';
    var choice = null;
    try {
      choice = localStorage.getItem(KEY);
    } catch (e) {
      choice = null;
    }
    if (choice === 'accepted' || choice === 'declined') return;

    var css =
      '.cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;' +
      'background:#fff;border-top:1px solid #e5e8ec;box-shadow:0 -2px 12px rgba(0,0,0,.08);' +
      'padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;' +
      'font-size:14px;color:#1f2329;}' +
      '.cc-text{flex:1;min-width:260px;line-height:1.6;}' +
      '.cc-text a{color:#007bff;text-decoration:none;}' +
      '.cc-text small{display:block;color:#666;font-size:12px;margin-top:2px;}' +
      '.cc-btns{display:flex;gap:8px;flex-shrink:0;}' +
      '.cc-btn{border:none;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:600;' +
      'cursor:pointer;font-family:inherit;}' +
      '.cc-accept{background:#007bff;color:#fff;}' +
      '.cc-decline{background:#fff;color:#007bff;border:1px solid #007bff;}' +
      '@media(max-width:640px){.cc-banner{padding:12px 14px;}.cc-btns{width:100%;}' +
      '.cc-btn{flex:1;}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie Consent');
    banner.innerHTML =
      '<div class="cc-text">' +
      'We use cookies and similar technologies to improve your experience, analyze traffic, and serve ' +
      'advertisements via Google AdSense. See our ' +
      '<a href="privacy.html">Privacy Policy</a> for details.' +
      '<small>本站使用 Cookie 与 Google AdSense 广告，详见隐私政策。点击"接受"表示同意，"拒绝"仍可继续浏览。</small>' +
      '</div>' +
      '<div class="cc-btns">' +
      '<button class="cc-btn cc-decline" type="button">Decline / 拒绝</button>' +
      '<button class="cc-btn cc-accept" type="button">Accept / 接受</button>' +
      '</div>';

    function close(val) {
      try {
        localStorage.setItem(KEY, val);
      } catch (e) {}
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }
    banner.querySelector('.cc-accept').addEventListener('click', function () {
      close('accepted');
    });
    banner.querySelector('.cc-decline').addEventListener('click', function () {
      close('declined');
    });

    function mount() {
      document.body.appendChild(banner);
    }
    if (document.body) {
      mount();
    } else {
      document.addEventListener('DOMContentLoaded', mount);
    }
  } catch (e) {
    // 组件失败不影响页面
  }
})();
