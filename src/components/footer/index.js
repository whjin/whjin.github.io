(function () {
  let showOriginalRight = true;
  const currentYear = new Date().getFullYear();

  function getRightHtml() {
    if (showOriginalRight) {
      return `
        <a href="https://wuhuajin.com" target="_blank" rel="noopener noreferrer" title="吴华锦的个人主页">吴华锦</a>
        |&nbsp;访问
        <span id="goatcounter_total" class="count">0</span>&nbsp;次
      `;
    } else {
      return `
        <span class="beian-text">粤ICP备2026112434号</span>
      `;
    }
  }

  function renderFooter() {
    const footer = document.querySelector('.footer');
    footer.innerHTML = `
      <div class="footer-content">
        <span class="copyright-dblclick">&copy;${isMobile() ? '' : '2013-'}${currentYear}</span>
        <span class="footer-right-part">${getRightHtml()}</span>
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
    const copyrightSpan = document.querySelector('.copyright-dblclick');
    copyrightSpan.addEventListener('dblclick', () => {
      showOriginalRight = !showOriginalRight;
      renderFooter();
    });

    const beianEl = document.querySelector('.beian-text');
    if (beianEl) {
      beianEl.addEventListener('click', () => {
        window.open('https://beian.miit.gov.cn/', '_blank');
      });
    }
  }

  renderFooter();
})();
