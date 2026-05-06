function generateCard() {
  const containerEl = document.querySelector('.card-container');

  const fragment = document.createDocumentFragment();
  menuData.forEach((m) => {
    if (m.items.length > 0) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-item';

      const headerEl = document.createElement('div');
      headerEl.className = 'card-title';
      headerEl.innerText = m.title;

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
