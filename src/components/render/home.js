window.addEventListener('DOMContentLoaded', (e) => {
  loadMarkdown('markdown-content', 'src/template/home.html')
    .then(() => {
      generateCard();
      generateTOC();
      generateAPlayer();
    })
    .catch((error) => {
      console.error('加载 Markdown 失败：', error);
    });
});

window.addEventListener('load', () => {
  const links = document.querySelectorAll('#markdown-content a');
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  hideLoading();

  const savedScrollTop = localStorage.getItem('scrollPosition_home');
  if (savedScrollTop) {
    window.scrollTo({
      top: parseInt(savedScrollTop, 10),
      behavior: 'auto',
    });
  }

  if (typeof restoreCardScroll === 'function') {
    restoreCardScroll();
  }
});
