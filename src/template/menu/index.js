function generateCard() {
  const containerEl = document.querySelector('.card-container');

  const fragment = document.createDocumentFragment();
  const finalMenuData = processMenuData(menuData);
  finalMenuData.forEach((m) => {
    if (m.items.length > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-item';

      const headerEl = document.createElement('div');
      headerEl.className = 'card-title';
      headerEl.innerText = m.title;
      if (m.sticky) {
        headerEl.classList.add('sticky-mark');
      }

      const listEl = document.createElement(m.tagName);
      listEl.className = 'card-list';

      m.items.forEach((i) => {
        const liEl = document.createElement('li');
        const aEl = document.createElement('a');
        aEl.rel = 'noopener noreferrer';
        aEl.target = '_blank';
        aEl.title = i.text;
        aEl.innerText = i.text;
        aEl.href = i.href;

        liEl.appendChild(aEl);
        listEl.appendChild(liEl);
      });

      cardEl.appendChild(headerEl);
      cardEl.appendChild(listEl);
      fragment.appendChild(cardEl);
    }
  });
  containerEl.appendChild(fragment);
}

function processMenuData(originalData) {
  const copyData = JSON.parse(JSON.stringify(originalData));
  const stickyItems = copyData.filter((m) => !!m.sticky);
  const normalItems = copyData.filter((m) => !m.sticky);
  return stickyItems.length > 0 ? [...stickyItems, ...normalItems] : copyData;
}
