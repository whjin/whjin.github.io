window.addEventListener('DOMContentLoaded', (e) => {
  let query = decodeURIComponent(window.location.search.slice(1));
  let idx = query.indexOf('_');
  let dir = query.slice(0, idx);
  let title = query.slice(idx + 1);

  const contentEl = document.getElementById('markdown-content');
  const nacContainer = document.querySelector('.nav-container');

  if (title.includes('&format=')) {
    const splits = title.split('&format=');
    document.title = `${splits[0]} \u00AB 吴华锦`;

    document.querySelector('.sidebar-area').style.display = 'none';
    nacContainer.classList.add('hide-toc');

    renderPDF(
      document.getElementById('view-container'),
      `posts/${dir}/${splits[0]}.${splits[1]}`
    ).then(() => {
      hideLoading();
    });
  } else {
    document.title = `${title} \u00AB 吴华锦`;

    loadMarkdown('markdown-content', `posts/${dir}/${title}.md`).then(() => {
      generateTOC();
      const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0 || isMobile()) {
        nacContainer.classList.add('hide-toc');
      }
      hideLoading();
    });
  }
});

window.addEventListener('load', () => {
  const links = document.querySelectorAll('#markdown-content a');
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});

async function renderPDF(container, url) {
  if (!container) {
    console.error('PDF渲染失败：未找到 id="view-container" 的容器元素，请检查HTML结构');
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = '../js/pdf.worker.min.js';
  try {
    container.innerHTML = '';
    const pdf = await pdfjsLib.getDocument(url).promise;
    const containerWidth = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const originViewport = page.getViewport({ scale: 1 });

      const cssScale = containerWidth / originViewport.width;
      const displayViewport = page.getViewport({ scale: cssScale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = displayViewport.width * dpr;
      canvas.height = displayViewport.height * dpr;

      canvas.style.width = `${displayViewport.width}px`;
      canvas.style.height = `${displayViewport.height}px`;
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 16px auto';

      container.appendChild(canvas);

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale: cssScale * dpr }),
      }).promise;
    }
  } catch (error) {
    console.error('PDF文件加载失败:', error);
    container.innerHTML = `<p style="text-align:center; padding:40px; color:red;">PDF 加载失败，请检查文件路径<br>错误信息：${error.message}</p>`;
  }
}
