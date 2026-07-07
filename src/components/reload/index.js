(function () {
  const socket = new WebSocket(`ws://${location.host}`);

  socket.addEventListener('open', () => {});

  socket.addEventListener('message', (event) => {
    if (event.data === 'reload') {
      window.location.reload();
    }
  });

  socket.addEventListener('close', () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  socket.addEventListener('error', (err) => {
    console.error('[Live Server] WebSocket error:', err);
  });
})();
