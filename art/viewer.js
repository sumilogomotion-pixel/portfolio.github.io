(() => {
  'use strict';
  const links = [...document.querySelectorAll('.art-link')];
  const dialog = document.querySelector('dialog');
  if (!dialog || !links.length || !dialog.showModal) return;
  const image = dialog.querySelector('.viewer-image img');
  const previous = dialog.querySelector('.previous');
  const next = dialog.querySelector('.next');
  let index = 0;
  let opener = null;
  let overflowBefore = '';
  function show(n) {
    index = Math.max(0, Math.min(links.length - 1, n));
    const item = links[index];
    image.classList.remove('arriving');
    void image.offsetWidth;
    image.classList.add('arriving');
    image.src = item.getAttribute('href');
    image.alt = item.dataset.title || '';
    dialog.querySelector('.viewer-caption h2').textContent = item.dataset.title || '';
    dialog.querySelector('.viewer-caption p').textContent = item.dataset.note || '';
    dialog.querySelector('.viewer-count').textContent = `${index + 1} / ${links.length}`;
    previous.disabled = index === 0;
    next.disabled = index === links.length - 1;
  }
  links.forEach((link, n) => link.addEventListener('click', event => {
    event.preventDefault();
    opener = link;
    overflowBefore = document.body.style.overflow;
    show(n);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('close', () => {
    document.body.style.overflow = overflowBefore;
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && index < links.length - 1) { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); show(index - 1); }
  });
})();
