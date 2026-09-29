async function generateAPlayer() {
  const audioData = await fetch('src/components/aplayer/audio.json').then((r) => r.json());
  const ap = new APlayer({
    container: document.querySelector('.aplayer-container'),
    fixed: true,
    mini: true,
    listFolded: true,
    lrcType: 3,
    volume: 1.0,
    audio: audioData,
  });

  window.ap = ap;
}
