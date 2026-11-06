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
  let ignoreClick = false, clickTimer = null, frame = null, lastFrame = null;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function stop(message = 'タップでとことこ · はなすともどるよ') {
    clearTimeout(timer);
    animation?.cancel();
    animation = null;
    image.src = poster;
    playing = false;
    control.hidden = true;
    status.textContent = message;
  }
  function showPosition() {
    if (!gesture?.moved) return;
    const g = gesture;
    const x = clamp(g.clientX + scrollX - g.grabX, 0, Math.max(0, g.pageWidth - g.width));
    const y = clamp(g.clientY + scrollY - g.grabY, 0, Math.max(0, g.pageHeight - g.height));
    g.dx = x - g.homeX;
    g.dy = y - g.homeY;
    button.style.transform = `translate(${g.dx}px, ${g.dy}px)`;
  }
  function autoScroll(now) {
    if (!gesture?.moved) { frame = null; return; }
    const elapsed = Math.min(40, lastFrame === null ? 16 : now - lastFrame);
    lastFrame = now;
    // Only scroll while the held pointer is near a viewport edge. This lets
    // one-finger touch dragging reach the entire document, not just the screen.
    const edge = Math.min(64, innerHeight / 5);
    const y = gesture.clientY;
    let velocity = y < edge ? -(edge - y) / edge : y > innerHeight - edge ? (y - innerHeight + edge) / edge : 0;
    velocity = clamp(velocity, -1, 1);
    const next = clamp(scrollY + velocity * elapsed * .65, 0, Math.max(0, gesture.pageHeight - innerHeight));
    if (Math.abs(next - scrollY) > .1) window.scrollTo({ top: next, left: scrollX, behavior: 'instant' });
    showPosition();
    frame = requestAnimationFrame(autoScroll);
  }
  function endGesture(cancelled = false) {
    if (!gesture) return;
    const g = gesture;
    gesture = null;
    cancelAnimationFrame(frame);
    frame = null;
    lastFrame = null;
    if (g.id !== null && button.hasPointerCapture(g.id)) button.releasePointerCapture(g.id);
    button.classList.remove('is-dragging');
    stop(g.moved ? 'おかえり。もういちど、あそぼう' : undefined);
    const from = button.style.transform || 'translate(0px, 0px)';
    button.style.transform = '';
    if (g.moved || cancelled) {
      ignoreClick = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { ignoreClick = false; }, 700);
      if (g.moved && !cancelled && !reduce.matches) {
        animation = button.animate([{ transform: from }, { transform: 'translate(0px, 0px)' }], { duration: 360, easing: 'ease-out' });
        timer = setTimeout(() => { animation?.cancel(); animation = null; area.classList.remove('is-roaming'); }, 360);
      } else area.classList.remove('is-roaming');
    } else area.classList.remove('is-roaming');
  }
  function play() {
    stop();
    area.classList.remove('is-roaming');
    if (reduce.matches) { status.textContent = 'ドラッグでおさんぽ。はなすともどるよ'; return; }
    playing = true;
    image.src = gif;
    control.hidden = false;
    status.textContent = 'とことこ';
    const space = Math.max(0, area.clientWidth - button.offsetWidth), x = button.offsetLeft;
    animation = button.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${space - x}px)`, offset: .35 },
      { transform: `translateX(${-x}px)`, offset: .75 },
      { transform: 'translateX(0)' }
    ], { duration: 2960, easing: 'ease-in-out' });
    timer = setTimeout(() => stop(), 2960);
  }
  function begin(clientX, clientY, id) {
    const visible = button.getBoundingClientRect();
    stop('ページをおさんぽ。はなすともどるよ');
    button.style.transform = '';
    const home = button.getBoundingClientRect();
    gesture = { id, clientX, clientY, startX: clientX, startY: clientY,
      grabX: clientX - visible.left, grabY: clientY - visible.top,
      homeX: home.left + scrollX, homeY: home.top + scrollY,
      width: home.width, height: home.height,
      pageWidth: document.documentElement.clientWidth,
      pageHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      moved: false, dx: 0, dy: 0 };
    ignoreClick = false;
    clearTimeout(clickTimer);
    area.classList.add('is-roaming');
    button.style.transform = `translate(${visible.left - home.left}px, ${visible.top - home.top}px)`;
  }
  function move() {
    if (!gesture.moved) {
      gesture.moved = true;
      button.classList.add('is-dragging');
      if (!reduce.matches) image.src = gif;
      status.textContent = 'とことこ、どこへ？';
    }
    showPosition();
  }
  button.addEventListener('pointerdown', event => {
    if (gesture || event.isPrimary === false || event.button !== 0) return;
    begin(event.clientX, event.clientY, event.pointerId);
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.clientX = event.clientX;
    gesture.clientY = event.clientY;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 6) return;
    move();
    if (frame === null) frame = requestAnimationFrame(autoScroll);
  });
  button.addEventListener('pointerup', e => { if (gesture?.id === e.pointerId) endGesture(); });
  button.addEventListener('pointercancel', e => { if (gesture?.id === e.pointerId) endGesture(true); });
  button.addEventListener('lostpointercapture', e => { if (gesture?.id === e.pointerId) endGesture(true); });
  button.addEventListener('click', event => {
    if (ignoreClick && event.detail !== 0) { event.preventDefault(); return; }
    play();
  });
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') { endGesture(true); return; }
    const step = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[event.key];
    if (!step || (gesture && gesture.id !== null)) return;
    event.preventDefault();
    if (!gesture) { const r = button.getBoundingClientRect(); begin(r.left + r.width / 2, r.top + r.height / 2, null); }
    gesture.clientX += step[0];
    gesture.clientY += step[1];
    move();
  });
  button.addEventListener('keyup', e => { if (gesture?.id === null && e.key.startsWith('Arrow')) endGesture(); });
  button.addEventListener('blur', () => { if (gesture?.id === null) endGesture(true); });
  control.addEventListener('click', () => stop());
  function resetMotion() { endGesture(true); stop(); button.style.transform = ''; area.classList.remove('is-roaming'); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetMotion(); });
  window.addEventListener('blur', resetMotion);
  window.addEventListener('pagehide', resetMotion);
  window.addEventListener('scroll', showPosition, { passive: true });
  // Scrolling the playground away must not cancel a page-wide drag.
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && playing && !gesture) resetMotion(); }, { threshold: .1 }).observe(area);
  reduce.addEventListener('change', resetMotion);
  let layoutWidth = document.documentElement.clientWidth;
  window.addEventListener('resize', () => {
    const width = document.documentElement.clientWidth;
    if (width !== layoutWidth) { layoutWidth = width; resetMotion(); return; }
    // Mobile address bars change viewport height during a scroll. Keep the
    // held character and capture alive; edge scrolling uses the new height.
    if (gesture) showPosition();
    else resetMotion();
  });

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
