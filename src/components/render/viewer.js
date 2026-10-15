// html 文章底部赞赏卡片：format=html 内容基于 .html，无 frontmatter。
// reward 开关随静态 html 输出为 #markdown-content[data-reward]，此处据此决定是否显示。
// （旧逻辑会额外请求同名 .md 读取 reward 开关，但项目里并无 md 定义 reward，且该请求在只有 .html 的内容上产生 404 控制台报错，故移除）
function injectRewardCard(container) {
  if (!container) return;
  // 尊重文章 reward 配置：容器或嵌套元素 data-reward="false" 则不显示卡片（true/缺省默认显示）
  const rEl = (container.querySelector && container.querySelector('[data-reward]')) || container;
  if (rEl && rEl.getAttribute('data-reward') === 'false') return;
  renderRewardTip(container);
}

// 给代码块添加一键复制按钮
function addCopyButtonsToCodeBlocks(container) {
  if (!container) return;
  const codeBlocks = container.querySelectorAll('pre');
  codeBlocks.forEach((pre) => {
    // 避免重复添加
    if (pre.querySelector('.copy-btn')) return;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    copyBtn.title = '复制代码';
    copyBtn.setAttribute('aria-label', '复制代码');

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;

      navigator.clipboard.writeText(text).then(() => {
        // 复制成功，改变按钮状态
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        copyBtn.title = '已复制';

        // 显示提示
        showCopyToast(pre);

        // 3秒后恢复原状
        setTimeout(() => {
          resetCopyBtn(copyBtn);
        }, 3000);
      }).catch((err) => {
        console.error('复制失败:', err);
      });
    });

    pre.appendChild(copyBtn);
  });
}

// 恢复复制按钮原状
function resetCopyBtn(btn) {
  btn.classList.remove('copied');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  btn.title = '复制代码';
}

// 显示"已复制"提示
function showCopyToast(pre) {
  // 移除已有的提示
  const existing = pre.querySelector('.copy-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = '已复制';
  pre.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// 监听滚动，当代码块不在视口时恢复复制按钮状态
window.addEventListener('scroll', () => {
  const copyBtns = document.querySelectorAll('.copy-btn.copied');
  copyBtns.forEach((btn) => {
    const pre = btn.closest('pre');
    if (!pre) return;
    const rect = pre.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) {
      resetCopyBtn(btn);
    }
  });
}, { passive: true });

function renderRewardTip(container) {
  if (window.RewardTip) { window.RewardTip.renderInto(container); return; }
  const s = document.createElement('script');
  s.src = '/src/components/reward-tip/index.js';
  s.onload = s.onerror = () => { if (window.RewardTip) window.RewardTip.renderInto(container); };
  document.head.appendChild(s);
}

window.addEventListener('DOMContentLoaded', async (e) => {
  const { pathParam, formatType } = getSearchParams();
  const pathArr = pathParam.split('_');
  const fileName = pathArr.pop();
  const folderPath = pathArr.join('/');
  const contentEl = document.getElementById('markdown-content');
  const navContainer = document.querySelector('.nav-container');

  if (formatType === 'html') {
    const htmlUrl = `/src/template/posts/${folderPath}/${fileName}.html`;
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

        const basePath = `/src/template/posts/${folderPath}/`;
        let baseTag = document.querySelector('head base');
        if (!baseTag) {
          baseTag = document.createElement('base');
          document.head.insertBefore(baseTag, document.head.firstChild);
        }
        baseTag.href = basePath;

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

        addCopyButtonsToCodeBlocks(contentEl);

        injectRewardCard(contentEl);
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
    const pdfUrl = `/src/template/posts/${folderPath}/${fileName}.pdf`;
    renderPDF(document.getElementById('view-container'), pdfUrl).then(() => {
      hideLoading();
    });
  } else {
    document.title = `${fileName} « 吴华锦`;
    const mdUrl = `/src/template/posts/${folderPath}/${fileName}.md`;
    loadMarkdown('markdown-content', mdUrl).then(() => {
      generateTOC();
      const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0 || isMobile()) {
        navContainer.classList.add('hide-toc');
      }
      // 给 Markdown 格式的代码块也加复制按钮
      addCopyButtonsToCodeBlocks(contentEl);
      // 赞赏卡片由 render/index.js 的 maybeRenderRewardTip 按 md front matter 的 reward 控制注入
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
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/src/js/pdf.worker.min.js';

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
