(function () {
  const currentYear = new Date().getFullYear();

  function renderFooter() {
    const footer = document.querySelector('.footer');
    footer.innerHTML = `
      <div class="footer-row footer-copyright">
        &copy;${isMobile() ? '' : '2013-'}${currentYear}
        <a href="https://wuhuajin.com" target="_blank" rel="noopener noreferrer" title="吴华锦的个人主页">吴华锦</a>
        |&nbsp;访问
        <span id="goatcounter_total" class="count">0</span>&nbsp;次
      </div>
      <div class="footer-row footer-beian-email">
        <span class="beian-text">粤ICP备2026112434号</span>
        <a href="mailto:wuhuajin09@163.com" title="客服邮箱">wuhuajin09@163.com</a>
      </div>
      <div class="footer-links">
        <a href="about.html" title="关于我">About 关于</a>
        <span class="sep">&middot;</span>
        <a href="contact.html" title="联系我">Contact 联系</a>
        <span class="sep">&middot;</span>
        <a href="privacy.html" title="隐私政策">Privacy 隐私</a>
        <span class="sep">&middot;</span>
        <a href="terms.html" title="服务条款">Terms 条款</a>
      </div>
      <!-- 新趣集徽章：所有权验证 + Featured on 展示（长期保留，勿删） -->
      <div class="footer-badge">
        <a href="https://xinquji.com" target="_blank" rel="noopener noreferrer">
          <img src="https://xinquji.com/badge?theme=light&lang=zh" alt="Featured on 新趣集" style="width:200px;height:54px;" width="200" height="54" loading="lazy" />
        </a>
      </div>
    `;
    bindEvents();
    loadGoatCount();
  }

  function loadGoatCount() {
    var el = document.querySelector('#goatcounter_total');
    if (!el) return;
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    fetch('https://stats.wuhuajin.com/hit', { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.total) el.textContent = d.total;
      })
      .catch(function () {});
  }

  function bindEvents() {
    const beianEl = document.querySelector('.beian-text');
    if (beianEl) {
      beianEl.addEventListener('click', () => {
        window.open('https://beian.miit.gov.cn/', '_blank');
      });
    }
  }

  renderFooter();
})();
