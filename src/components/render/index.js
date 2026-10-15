// 给代码块添加一键复制按钮 + 语言标签 + 折叠展开
function addCopyButtonsToCodeBlocks(container) {
  if (!container) return;
  const codeBlocks = container.querySelectorAll('pre');
  codeBlocks.forEach((pre) => {
    // 避免重复添加
    if (pre.querySelector('.copy-btn')) return;

    // 提取语言
    const code = pre.querySelector('code');
    let lang = '';
    if (code) {
      const match = code.className.match(/language-(\w+)/);
      if (match) lang = match[1];
    }

    // 顶部工具栏容器
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    // 折叠/展开按钮（先创建，后面根据高度决定是否显示）
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.style.display = 'none';
    toolbar.appendChild(toggleBtn);

    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    copyBtn.title = '复制代码';
    copyBtn.setAttribute('aria-label', '复制代码');

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = code ? code.textContent : pre.textContent;

      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        copyBtn.title = '已复制';
        showCopyToast(pre);
        setTimeout(() => resetCopyBtn(copyBtn), 3000);
      }).catch((err) => console.error('复制失败:', err));
    });

    toolbar.appendChild(copyBtn);

    // 语言标签（最右边）
    if (lang) {
      const langLabel = document.createElement('span');
      langLabel.className = 'code-lang';
      langLabel.textContent = lang;
      toolbar.appendChild(langLabel);
    }

    pre.insertBefore(toolbar, pre.firstChild);

    // 折叠/展开逻辑
    const setupToggle = () => {
      if (pre.scrollHeight > 300) {
        pre.classList.add('collapsed');
        toggleBtn.textContent = '展开全部';
        toggleBtn.dataset.expanded = 'false';
        toggleBtn.style.display = 'block';

        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = toggleBtn.dataset.expanded === 'true';
          if (isExpanded) {
            // 收起
            pre.classList.add('collapsed');
            toggleBtn.textContent = '展开全部';
            toggleBtn.dataset.expanded = 'false';
          } else {
            // 展开
            pre.classList.remove('collapsed');
            toggleBtn.textContent = '收起';
            toggleBtn.dataset.expanded = 'true';
          }
        });
      }
    };

    // 延迟检查，确保代码已经高亮完成
    setTimeout(setupToggle, 100);
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
    const pre = btn.closest('pre') || btn.closest('blockquote');
    if (!pre) return;
    const rect = pre.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) {
      resetCopyBtn(btn);
    }
  });
}, { passive: true });

// 递归提取文本，保留 <br> 换行
function extractTextWithBreaks(element) {
  let text = '';
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        text += '\n';
      } else if (node.tagName === 'P' || node.tagName === 'DIV' || node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' || node.tagName === 'LI') {
        text += extractTextWithBreaks(node) + '\n';
      } else {
        text += extractTextWithBreaks(node);
      }
    }
  });
  return text;
}

// 给 blockquote 添加一键复制按钮 + 折叠展开（只复制诗词正文）
function addCopyButtonsToBlockquotes(container) {
  if (!container) return;
  const blockquotes = container.querySelectorAll('blockquote');
  blockquotes.forEach((bq) => {
    // 避免重复添加
    if (bq.querySelector('.copy-btn')) return;

    // 把原有内容包裹一层 content-wrapper，让 wrapper 成为滚动容器
    const wrapper = document.createElement('div');
    wrapper.className = 'bq-content-wrapper';
    // 移动所有子元素到 wrapper
    while (bq.firstChild) {
      wrapper.appendChild(bq.firstChild);
    }
    bq.appendChild(wrapper);

    // 顶部工具栏容器
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    // 折叠/展开按钮（先创建，后面根据高度决定是否显示）
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.style.display = 'none';
    toolbar.appendChild(toggleBtn);

    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    copyBtn.title = '复制诗词';
    copyBtn.setAttribute('aria-label', '复制诗词');

    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // 提取诗词正文：跳过第一个 p（视频地址），从 hr 后面开始
      let text = '';
      const hr = wrapper.querySelector('hr');
      if (hr) {
        // 从 hr 后面的兄弟节点开始收集
        let node = hr.nextSibling;
        while (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            text += node.textContent;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            text += extractTextWithBreaks(node);
            // 元素后面加换行
            text += '\n';
          }
          node = node.nextSibling;
        }
      } else {
        // 没有 hr，复制全部文本
        text = extractTextWithBreaks(wrapper);
      }

      // 清理多余空行
      text = text.trim().replace(/\n{3,}/g, '\n\n');

      navigator.clipboard.writeText(text).then(() => {
        // 复制成功，改变按钮状态
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        copyBtn.title = '已复制';

        // 显示提示
        showCopyToast(bq);

        // 3秒后恢复原状
        setTimeout(() => {
          resetCopyBtn(copyBtn);
        }, 3000);
      }).catch((err) => {
        console.error('复制失败:', err);
      });
    });

    toolbar.appendChild(copyBtn);
    bq.insertBefore(toolbar, bq.firstChild);

    // 折叠/展开逻辑
    const setupToggle = () => {
      if (wrapper.scrollHeight > 300) {
        bq.classList.add('collapsed');
        toggleBtn.textContent = '展开全部';
        toggleBtn.dataset.expanded = 'false';
        toggleBtn.style.display = 'block';

        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = toggleBtn.dataset.expanded === 'true';
          if (isExpanded) {
            // 收起
            bq.classList.add('collapsed');
            toggleBtn.textContent = '展开全部';
            toggleBtn.dataset.expanded = 'false';
          } else {
            // 展开
            bq.classList.remove('collapsed');
            toggleBtn.textContent = '收起';
            toggleBtn.dataset.expanded = 'true';
          }
        });
      }
    };

    // 延迟检查高度
    setTimeout(setupToggle, 100);
  });
}

function handler(targetId, filePath, callback) {
  // 只有 hljs 存在时才注册代码高亮（首页不加载 highlight.min.js）
  if (typeof hljs !== 'undefined' && typeof markedHighlight !== 'undefined') {
    marked.use(
      markedHighlight.markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(code, { language: lang }).value;
            } catch (error) {
              console.error(`高亮${lang}代码失败`, error);
            }
          }
          return hljs.highlightAuto(code).value;
        },
      })
    );
  }

  // 解析文章 YAML front matter（返回 front 对象）
  function parseFrontMatter(text) {
    const front = {};
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
    if (!m) return front;
    m[1].split(/\r?\n/).forEach((line) => {
      const kv = /^([A-Za-z_][\w]*)\s*:\s*(.*)$/.exec(line);
      if (kv) front[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
    });
    return front;
  }

  function loadRewardTip(cb) {
    if (window.RewardTip) return cb();
    const s = document.createElement('script');
    s.src = '/src/components/reward-tip/index.js';
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  // 文章页底部赞赏卡片：默认显示，仅 frontmatter reward:false 时隐藏
  function maybeRenderRewardTip(targetEl, content) {
    if (!targetEl) return;
    // 仅在文章页注入：filePath 或当前页面地址属于 /posts/（首页 home.html / 其它页面不注入）
    const isPost =
      filePath.includes('/posts/') ||
      (typeof location !== 'undefined' && location.pathname && location.pathname.includes('/posts/'));
    if (!isPost) return;
    let rewardOn = true;
    if (!filePath.endsWith('.html')) {
      const front = parseFrontMatter(content);
      rewardOn = !(front.reward === 'false' || front.reward === false);
    }
    if (!rewardOn) return;
    loadRewardTip(() => {
      if (window.RewardTip) window.RewardTip.renderInto(targetEl);
    });
  }

  function stripFrontMatter(text) {
    // 剥离文章顶部 YAML front matter（Hexo 式），避免渲染进正文
    if (/^---\r?\n/.test(text)) {
      const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
      if (m) return text.slice(m[0].length);
    }
    return text;
  }

  fetch(filePath)
    .then((response) => {
      if (!response.ok) throw new Error(`文件加载失败: ${filePath}`);
      return response.text();
    })
    .then((content) => {
      const targetEl = document.getElementById(targetId);
      let htmlContent;

      if (filePath.endsWith('.html')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const bodyContent = tempDiv.querySelector('body');
        htmlContent = bodyContent ? bodyContent.innerHTML : content;
      } else {
        htmlContent = marked.parse(stripFrontMatter(content));
      }

      // 外链图片加 no-referrer：绕过图床防盗链（如语雀 cdn.nlark.com），请求不携带站点 Referer
      htmlContent = htmlContent.replace(
        /<img\b(?![^>]*\breferrerpolicy\s*=)(?=[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\/)/g,
        '<img referrerpolicy="no-referrer"'
      );

      targetEl.innerHTML = htmlContent;

      const scripts = targetEl.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = script.textContent;
        script.parentNode.replaceChild(newScript, script);
      });

      // 文章底部赞赏卡片（可复用组件，受 reward 参数控制）
      maybeRenderRewardTip(targetEl, content);

      callback && callback();
    })
    .catch((error) => {
      console.error('渲染失败:', error);
      document.getElementById(targetId).innerHTML =
        `<div style="color: red;">加载失败：${error.message}</div>`;
      callback && callback();
    });
}

async function loadMarkdown(targetId, filePath) {
  return new Promise((resolve, reject) => {
    const key = filePath.includes('home') ? 'home' : 'posts';
    const scrollKey = `scrollPosition_${key}`;

    const scrollContainer = document.querySelector('.content-area');

    scrollContainer.addEventListener('scroll', () => {
      const scrollTop = scrollContainer.scrollTop;
      localStorage.setItem(scrollKey, scrollTop);
    });

    handler(targetId, filePath, () => {
      const savedScrollTop = localStorage.getItem(scrollKey);
      if (savedScrollTop && scrollContainer) {
        scrollContainer.scrollTop = parseInt(savedScrollTop, 10);
      }
      resolve();
    });
  });
}

function generateTOC() {
  const contentEl = document.getElementById('markdown-content');
  const tocNavEl = document.getElementById('toc-nav');
  const sidebarArea = document.querySelector('.sidebar-area');

  if (!contentEl || !tocNavEl || !sidebarArea) return;

  if (isMobile()) {
    sidebarArea.style.display = 'none';
    return;
  }

  const headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0 || isMobile()) {
    sidebarArea.style.display = 'none';
    return;
  }

  const getFontWeight = (level) => {
    switch (level) {
      case 'h1':
      case 'h2':
        return '700';
      case 'h3':
        return '600';
      default:
        return '500';
    }
  };

  let tocHTML = '<ul>';
  const set = new Set();
  headings.forEach((heading, index) => {
    const headingId = `toc-${index}-${heading.tagName.toLowerCase()}`;
    heading.id = headingId;
    const level = heading.tagName.toLowerCase();
    const text = heading.textContent.trim();

    let idx = [...set.add(level)].findIndex((l) => l === level);

    tocHTML += `
      <li style="
        font-weight: ${getFontWeight(level)};
        padding-left: ${idx * 0.8}em;
      ">
        <a href="#${headingId}" title="${text}">${text}</a>
      </li>
    `;
  });
  tocHTML += '</ul>';
  tocNavEl.innerHTML = tocHTML;

  sidebarArea.style.display = 'block';

  tocNavEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      const scrollContainer = document.querySelector('.content-area');

      if (targetEl && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const offsetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop;
        const finalTop = Math.max(offsetTop - 60, 0);
        scrollContainer.scrollTo({
          top: finalTop,
          behavior: 'smooth',
        });
      }
    });
  });
}
