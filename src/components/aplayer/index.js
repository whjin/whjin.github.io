async function generateAPlayer(func) {
  const audioData = await func('src/components/aplayer/audio.json');
  const ap = new APlayer({
    container: document.querySelector('.aplayer-container'),
    fixed: true,
    mini: true,
    autoplay: false,
    loop: 'all',
    preload: 'auto',
    volume: 0.7,
    mutex: true,
    listFolded: true,
    listMaxHeight: 300,
    lrcType: 3,
    audio: audioData,
  });

  window.ap = ap;
}
