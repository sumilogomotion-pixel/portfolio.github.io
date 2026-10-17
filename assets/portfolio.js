(() => {
  'use strict';
  const modal = document.getElementById('workModal');
  if (!modal) return;
  const video = modal.querySelector('video');
  const title = document.getElementById('modalTitle');
  let opener = null;
  let overflowBefore = '';
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', () => {
      if (!modal.showModal) { window.location.href = button.dataset.video; return; }
      opener = button;
      overflowBefore = document.body.style.overflow;
      title.textContent = button.dataset.title;
      video.src = button.dataset.video;
      modal.showModal();
      document.body.style.overflow = 'hidden';
      video.play().catch(() => {});
    });
  });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
  modal.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    document.body.style.overflow = overflowBefore;
    opener?.focus({ preventScroll: true });
  });
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  function pauseDecorativeMotion() {
    if (motionPreference.matches) document.querySelectorAll('video[autoplay]').forEach(item => item.pause());
  }
  pauseDecorativeMotion();
  motionPreference.addEventListener?.('change', pauseDecorativeMotion);
})();
