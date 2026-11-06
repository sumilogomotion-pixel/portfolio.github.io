(() => {
  'use strict';
  const area = document.querySelector('.playground');
  const button = document.querySelector('.runner');
  const image = button.querySelector('img');
  const status = document.querySelector('#play-status');
  const control = document.querySelector('#motion-control');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const poster = '../assets/relay/05_run.png', gif = '../assets/relay/05_run.gif';
  let animation = null, timer = null, playing = false, gesture = null;
  let ignoreClick = false, clickTimer = null;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function limits() {
    return { x: Math.max(0, area.clientWidth - button.offsetWidth),
      y: Math.max(0, area.clientHeight - button.offsetHeight - 64) };
  }
  function position(x, y) {
    const edge = limits();
    button.style.left = clamp(x, 0, edge.x) + 'px';
    button.style.top = clamp(y, 0, edge.y) + 'px';
  }
  function stop(message = 'もういちど、ふれてみて') {
    clearTimeout(timer);
    animation?.cancel();
    animation = null;
    image.src = poster;
    playing = false;
    control.hidden = true;
    status.textContent = message;
  }
  function endGesture(cancelled = false) {
    if (!gesture) return;
    const { id, moved } = gesture;
    gesture = null;
    button.classList.remove('is-dragging');
    if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
    if (moved || cancelled) {
      ignoreClick = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { ignoreClick = false; }, 700);
      stop('ここに、ぴたっ。');
    }
  }
  function play() {
    stop();
    if (reduce.matches) {
      status.textContent = 'ドラッグでうごかせるよ';
      return;
    }
    playing = true;
    image.src = gif;
    control.hidden = false;
    status.textContent = 'とことこ';
    const edge = limits(), x = button.offsetLeft;
    animation = button.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${edge.x - x}px)`, offset: .35 },
      { transform: `translateX(${-x}px)`, offset: .75 },
      { transform: 'translateX(0)' }
    ], { duration: 2960, easing: 'ease-in-out' });
    timer = setTimeout(() => stop(), 2960);
  }
  button.addEventListener('pointerdown', event => {
    if (gesture || event.isPrimary === false || event.button !== 0) return;
    // Freeze at the visible position when a running character is picked up.
    const rect = button.getBoundingClientRect(), bounds = area.getBoundingClientRect();
    stop('つかんで、うごかしてみて');
    position(rect.left - bounds.left, rect.top - bounds.top);
    ignoreClick = false;
    clearTimeout(clickTimer);
    gesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY,
      x: button.offsetLeft, y: button.offsetTop, moved: false };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.startX, dy = event.clientY - gesture.startY;
    if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
    gesture.moved = true;
    button.classList.add('is-dragging');
    if (!reduce.matches && image.getAttribute('src') !== gif) image.src = gif;
    position(gesture.x + dx, gesture.y + dy);
    status.textContent = 'とことこ、どこへ？';
  });
  button.addEventListener('pointerup', event => {
    if (gesture?.id === event.pointerId) endGesture();
  });
  button.addEventListener('pointercancel', event => {
    if (gesture?.id === event.pointerId) endGesture(true);
  });
  button.addEventListener('lostpointercapture', event => {
    if (gesture?.id === event.pointerId) endGesture(true);
  });
  button.addEventListener('click', event => {
    if (ignoreClick && event.detail !== 0) { event.preventDefault(); return; }
    play();
  });
  button.addEventListener('keydown', event => {
    const steps = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    endGesture(true);
    stop('ここに、ぴたっ。');
    position(button.offsetLeft + step[0], button.offsetTop + step[1]);
  });
  control.addEventListener('click', () => stop());
  function resetMotion() { endGesture(true); stop(); position(button.offsetLeft, button.offsetTop); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetMotion(); });
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && (playing || gesture)) resetMotion(); }, { threshold: .1 }).observe(area);
  reduce.addEventListener('change', resetMotion);
  window.addEventListener('resize', resetMotion);
  image.addEventListener('load', () => position(button.offsetLeft, button.offsetTop));
  position(button.offsetLeft, button.offsetTop);

  const cards = Array.from(document.querySelectorAll('.scene-card'));
  const sceneKey = 'tentendou.kutan.last-scenes.v2';
  const legacyKey = 'tentendou.kutan.last-scene.v1';
  const candidates = (window.SEASONS?.works || []).filter(w => w.id && w.title && w.thumb && w.people?.length);
  let remembered = [];
  function chooseScenes() {
    if (!candidates.length) return;
    let previous = remembered;
    try {
      const saved = localStorage.getItem(sceneKey);
      const parsed = saved ? JSON.parse(saved) : [localStorage.getItem(legacyKey)];
      if (Array.isArray(parsed)) previous = parsed;
    } catch {}
    const available = candidates.filter(w => !previous.includes(w.id) && !remembered.includes(w.id));
    const pool = available.length >= Math.min(cards.length, candidates.length) ? available : [...candidates];
    const selected = [];
    for (const card of cards) {
      if (!pool.length) { card.hidden = true; continue; }
      card.hidden = false;
      const chosen = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      selected.push(chosen.id);
      const base = new URL('seasons/index.html', location.href), destination = new URL(base);
      destination.searchParams.set('person', chosen.people[0]);
      destination.searchParams.set('work', chosen.id);
      const img = card.querySelector('img');
      card.href = destination.href;
      card.dataset.work = chosen.id;
      card.setAttribute('aria-label', chosen.title + 'の作品を見る');
      img.src = new URL(chosen.thumb, base).href;
      img.alt = chosen.title;
      img.width = chosen.thumb_width;
      img.height = chosen.thumb_height;
      img.style.maxWidth = chosen.thumb_width + 'px';
      card.querySelector('.scene-title').textContent = chosen.title;
    }
    remembered = selected;
    try { localStorage.setItem(sceneKey, JSON.stringify(selected)); } catch {}
  }
  chooseScenes();
  window.addEventListener('pageshow', event => { if (event.persisted) chooseScenes(); });
})();
