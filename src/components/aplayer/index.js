async function generateAPlayer() {
  const audioData = await fetchData('src/components/aplayer/audio.json');
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
