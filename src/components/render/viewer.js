window.addEventListener('DOMContentLoaded', async (e) => {
  const params = new URLSearchParams(window.location.search);
  const pathPart = params.get('path') || '';
  const formatType = params.get('format') || '';
  const pathArr = pathPart.split('_');
  const fileName = pathArr.pop();
  const folderPath = pathArr.join('/');
  const contentEl = document.getElementById('markdown-content');
  const navContainer = document.querySelector('.nav-container');

  if (formatType === 'html') {
    const htmlUrl = `posts/${folderPath}/${fileName}.html`;
    document.querySelector('.sidebar-area').style.display = 'none';
    navContainer.classList.add('hide-toc');
    contentEl.innerHTML = '';

    fetch(htmlUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`文件不存在：${htmlUrl}`);
        return res.text();
      })
      .then((htmlStr) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlStr, 'text/html');
        const realTitle = doc.querySelector('title')?.textContent?.trim() || '';
        document.title = realTitle || `${folderPath} « 吴华锦`;

        const basePath = `posts/${folderPath}/`;
        const baseTag = document.createElement('base');
        baseTag.href = basePath;
        document.head.appendChild(baseTag);

        contentEl.innerHTML = htmlStr;

        const scripts = contentEl.querySelectorAll('script');
        scripts.forEach((script) => {
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        });

        const links = contentEl.querySelectorAll('a');
        links.forEach((link) => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });

        hideLoading();
      })
      .catch((err) => {
        console.error('HTML页面加载失败:', err);
        contentEl.innerHTML = `<p class="load-fail">
        HTML页面加载失败，请检查文件路径<br>错误信息：${err.message}
        </p>`;
        hideLoading();
      });
  } else if (formatType === 'pdf') {
    document.title = `${fileName} « 吴华锦`;
    document.querySelector('.sidebar-area').style.display = 'none';
    navContainer.classList.add('hide-toc');
    const pdfUrl = `posts/${folderPath}/${fileName}.pdf`;
    renderPDF(document.getElementById('view-container'), pdfUrl).then(() => {
      hideLoading();
    });
  } else {
    document.title = `${fileName} « 吴华锦`;
    const mdUrl = `posts/${folderPath}/${fileName}.md`;
    loadMarkdown('markdown-content', mdUrl).then(() => {
      generateTOC();
      const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0 || isMobile()) {
        navContainer.classList.add('hide-toc');
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

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = originViewport.width * cssScale * dpr;
      canvas.height = originViewport.height * cssScale * dpr;
      container.appendChild(canvas);

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({ scale: cssScale * dpr }),
      }).promise;
    }
  } catch (error) {
    console.error('PDF文件加载失败:', error);
    container.innerHTML = `<p class="load-fail">PDF 加载失败，请检查文件路径<br>错误信息：${error.message}</p>`;
  }
}
