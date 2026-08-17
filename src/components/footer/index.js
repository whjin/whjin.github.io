(function () {
  let showOriginalRight = true;
  const currentYear = new Date().getFullYear();

  function getRightHtml() {
    if (showOriginalRight) {
      return `
        <a href="https://wuhuajin.com" target="_blank" rel="noopener noreferrer" title="吴华锦的个人主页">吴华锦</a>
        |&nbsp;访问
        <span id="vercount_value_site_uv" class="count"></span>人
        <span id="vercount_value_site_pv" class="count"></span>次
      `;
    } else {
      return `
        <span class="beian-text" style="color:#007bff;cursor:pointer;">粤ICP备2026112434号</span>
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
    `;
    bindEvents();
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
