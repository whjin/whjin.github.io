async function generateAPlayer(func) {
  const audioData = await func('src/components/aplayer/audio.json');
  const ap = new APlayer({
    container: document.querySelector('.aplayer-container'),
    theme: '#e9e9e9',
    fixed: true,
    mini: true,
    listFolded: true,
    lrcType: 3,
    audio: audioData,
  });

  // const colorThief = new ColorThief();
  // const image = new Image();
  // const xhr = new XMLHttpRequest();
  // const setTheme = (index) => {
  //   if (!ap.list.audios[index].theme) {
  //     xhr.onload = function () {
  //       let coverUrl = URL.createObjectURL(this.response);
  //       image.onload = function () {
  //         let color = colorThief.getColor(image);
  //         ap.theme(`rgb(${color[0]}, ${color[1]}, ${color[2]})`, index);
  //         URL.revokeObjectURL(coverUrl);
  //       };
  //       image.src = coverUrl;
  //     };
  //     xhr.open('GET', ap.list.audios[index].cover, true);
  //     xhr.responseType = 'blob';
  //     xhr.send();
  //   }
  // };
  // setTheme(ap.list.index);
  // ap.on('listswitch', (index) => {
  //   setTheme(index);
  // });

  window.ap = ap;
}
