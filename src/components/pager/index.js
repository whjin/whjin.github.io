/* 公共分页组件：首页 / 上一页 / 第N页/共M页 / 下一页 / 尾页
 * 用法：
 *   Pager.mount(container, {
 *     current: 1,
 *     totalPages: 10,
 *     onChange: (page) => { ... }
 *   });
 * 样式见 ./index.css（类名 .pager，与 reward.html 保持一致）。
 */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s);
  }

  function mount(container, opts) {
    if (!container) return;
    const current = Math.max(1, opts.current | 0);
    const totalPages = Math.max(1, opts.totalPages | 0);
    const onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};

    container.innerHTML = '';
    container.classList.add('pager');

    const mkBtn = (label, disabled, go) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = esc(label);
      b.disabled = !!disabled;
      b.addEventListener('click', () => {
        const p = go();
        if (p >= 1 && p <= totalPages) onChange(p);
      });
      return b;
    };

    container.appendChild(mkBtn('首页', current <= 1, () => 1));
    container.appendChild(mkBtn('上一页', current <= 1, () => current - 1));

    const info = document.createElement('span');
    info.className = 'pager-info';
    info.textContent = current + '/' + totalPages;
    container.appendChild(info);

    container.appendChild(mkBtn('下一页', current >= totalPages, () => current + 1));
    container.appendChild(mkBtn('尾页', current >= totalPages, () => totalPages));
  }

  window.Pager = { mount };
})();
