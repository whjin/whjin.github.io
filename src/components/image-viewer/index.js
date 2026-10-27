/**
 * image-viewer/index.js
 * 正文图片全屏查看（lightbox），以「原图」渲染，支持缩放与平移：
 * - 打开时默认适应屏幕展示完整图片
 * - 点击图片：在「原尺寸(1x) / 适应屏幕」之间切换，可查看原图细节
 * - 滚轮：以中心缩放（fit ~ 4x）
 * - 拖动：放大后平移查看超出屏幕的部分
 * - 点击遮罩 / 右上角关闭按钮 / Esc：关闭
 * - 采用事件委托，对静态内联与动态渲染的图片均生效
 */
(function () {
  'use strict';

  var overlay = null;
  var big = null;
  var state = { s: 1, tx: 0, ty: 0, fit: 1, drag: false, moved: false, sx: 0, sy: 0, stx: 0, sty: 0 };

  // 适应屏幕的缩放比（小图不放大超过原尺寸）
  function fitScale() {
    if (!big) return 1;
    var availW = overlay.clientWidth - 48;
    var availH = overlay.clientHeight - 48;
    var nw = big.naturalWidth || 1;
    var nh = big.naturalHeight || 1;
    var s = Math.min(availW / nw, availH / nh);
    return Math.min(s, 1);
  }

  // 平移边界：放大后不允许拖出可视区
  function clamp() {
    var availW = overlay.clientWidth;
    var availH = overlay.clientHeight;
    var sw = (big.naturalWidth || 1) * state.s;
    var sh = (big.naturalHeight || 1) * state.s;
    var maxTx = sw > availW ? (sw - availW) / 2 : 0;
    var maxTy = sh > availH ? (sh - availH) / 2 : 0;
    state.tx = Math.max(-maxTx, Math.min(maxTx, state.tx));
    state.ty = Math.max(-maxTy, Math.min(maxTy, state.ty));
  }

  function apply() {
    big.style.transform =
      'translate(calc(-50% + ' + state.tx + 'px), calc(-50% + ' + state.ty + 'px)) scale(' + state.s + ')';
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'img-viewer-overlay';
    overlay.innerHTML =
      '<span class="img-viewer-close" title="关闭">&times;</span>' +
      '<img alt="" draggable="false" />' +
      '<p class="img-viewer-caption"></p>' +
      '<p class="img-viewer-hint"><span class="hint-desktop">Esc 关闭 · 滚轮缩放 · 拖动平移 · </span>点击查看原图</p>';
    big = overlay.querySelector('img');

    // 点击遮罩/关闭按钮 → 关闭
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('img-viewer-close')) close();
    });

    // 滚轮缩放（以图片中心为基准）
    overlay.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        var factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        state.s = Math.max(state.fit, Math.min(state.s * factor, 4));
        clamp();
        apply();
      },
      { passive: false }
    );

    // 拖动平移
    big.addEventListener('pointerdown', function (e) {
      state.drag = true;
      state.moved = false;
      state.sx = e.clientX;
      state.sy = e.clientY;
      state.stx = state.tx;
      state.sty = state.ty;
      if (big.setPointerCapture) big.setPointerCapture(e.pointerId);
    });
    big.addEventListener('pointermove', function (e) {
      if (!state.drag) return;
      var dx = e.clientX - state.sx;
      var dy = e.clientY - state.sy;
      if (Math.hypot(dx, dy) > 4) state.moved = true;
      state.tx = state.stx + dx;
      state.ty = state.sty + dy;
      clamp();
      apply();
    });
    function endDrag() {
      state.drag = false;
    }
    big.addEventListener('pointerup', endDrag);
    big.addEventListener('pointercancel', endDrag);

    // 单击：原图(1x) ⇄ 适应屏幕；拖动不算单击
    big.addEventListener('click', function () {
      if (state.moved) {
        state.moved = false;
        return;
      }
      var isFit = Math.abs(state.s - state.fit) < 0.02;
      state.s = isFit ? Math.max(1, state.fit) : state.fit;
      state.tx = 0;
      state.ty = 0;
      clamp();
      apply();
    });
    big.addEventListener('dblclick', function (e) {
      e.preventDefault();
      var isFit = Math.abs(state.s - state.fit) < 0.02;
      state.s = isFit ? Math.max(1, state.fit) : state.fit;
      state.tx = 0;
      state.ty = 0;
      clamp();
      apply();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') close();
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  function open(img) {
    var o = ensureOverlay();
    big = o.querySelector('img');
    var src = img.currentSrc || img.src;
    big.src = src;
    big.alt = img.alt || '';
    var caption = img.alt || (img.getAttribute('title') || '');
    o.querySelector('.img-viewer-caption').textContent = caption;

    o.classList.add('show');
    document.body.style.overflow = 'hidden';

    function ready() {
      state.fit = fitScale();
      state.s = state.fit;
      state.tx = 0;
      state.ty = 0;
      apply();
    }
    if (big.complete && big.naturalWidth) {
      ready(); // overlay 已显示（classList.add('show') 在前），可直接用其尺寸计算 fit
    } else {
      big.onload = ready;
    }
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    state.drag = false;
  }

  // 事件委托：点击正文（.markdown-content）内的图片即可全屏查看
  // 排除：被 <a> 或 <button> 包裹的图片（这些是交互元素，有自己的点击行为，不触发全屏预览）
  // 也排除：小尺寸图标（小于 64px），小图标全屏看没有意义
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (!t.closest('.markdown-content')) return;
    // 被链接或按钮包裹的图片 → 不预览
    if (t.closest('a, button')) return;
    // 小尺寸图标（宽或高小于 64px）→ 不预览
    var w = t.naturalWidth || t.width || 0;
    var h = t.naturalHeight || t.height || 0;
    if (w < 64 || h < 64) return;
    e.preventDefault();
    open(t);
  });

  window.ImageViewer = { open: open, close: close };
})();
