(function () {
  const html = `
    <div class="footer-content">
      <span>&copy;${isMobile() ? '' : '2013-'}${new Date().getFullYear()}</span>
      <a
        href="https://wuhuajin.com"
        target="_blank"
        rel="noopener noreferrer"
        title="博客"
      >
      吴华锦  
      </a>
      |&nbsp;访问
      <span id="busuanzi_value_site_uv" class="count"></span>人   
      <span id="busuanzi_value_site_pv" class="count"></span>次            
    </div>
    `;
  const footerEl = document.querySelector('.footer');
  footerEl.innerHTML = html;
})();
