window.addEventListener('DOMContentLoaded', (e) => {
  loadMarkdown('markdown-content', 'src/template/home.html')
    .then(() => {
      generateCard();
      generateTOC();
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
  window.scrollTo({
    top: savedScrollTop ? parseInt(savedScrollTop, 10) : 0,
    behavior: 'auto',
  });
});
