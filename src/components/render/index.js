function handler(targetId, filePath, callback) {
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
