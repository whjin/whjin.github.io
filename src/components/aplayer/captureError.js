(function () {
  'use strict';

  // 需要过滤的关键词列表
  const FILTER_KEYWORDS = [
    'APlayer',
    'Meting',
    'Failed to load because no supported source was found',
    'NotSupportedError',
    'Uncaught (in promise)',
    'The element has no supported sources',
  ];

  function shouldFilter(...args) {
    const content = args.join(' ').toLowerCase();
    return FILTER_KEYWORDS.some((keyword) => content.includes(keyword.toLowerCase()));
  }

  // 1. 屏蔽 console.error
  const originalError = console.error;
  console.error = function (...args) {
    if (!shouldFilter(...args)) {
      originalError.apply(console, args);
    }
  };

  // 2. 屏蔽 console.warn
  const originalWarn = console.warn;
  console.warn = function (...args) {
    if (!shouldFilter(...args)) {
      originalWarn.apply(console, args);
    }
  };

  // 3. 屏蔽 console.info
  const originalInfo = console.info;
  console.info = function (...args) {
    if (!shouldFilter(...args)) {
      originalInfo.apply(console, args);
    }
  };

  // 4. 捕获全局同步错误
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (shouldFilter(message, source)) {
      return true; // 阻止输出
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  // 5. 捕获 Promise 未处理拒绝（Uncaught in promise）
  window.addEventListener(
    'unhandledrejection',
    function (event) {
      const reason = event.reason || '';
      const message = typeof reason === 'string' ? reason : reason.message || '';
      if (shouldFilter(message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  // 6. 捕获音频元素错误（APlayer 内部）
  window.addEventListener(
    'error',
    function (event) {
      const target = event.target || event.srcElement;
      if (target && target.tagName === 'AUDIO') {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    true
  );
})();
