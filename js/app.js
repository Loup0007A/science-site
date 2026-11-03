/* ══════════════════════════════════════════════════════════
   NEXPLORIA v3 — Science Interactive Engine
   Chargé par le petit chargeur inline de index.html, autorisé par
   la CSP stricte (hash + 'strict-dynamic') définie dans _headers.
   Toute insertion de HTML passe par la politique Trusted Types
   « nexploria » ci-dessous.
══════════════════════════════════════════════════════════ */

// ══════════════════════════════════════
//  TRUSTED TYPES
// ══════════════════════════════════════
// Seules les balises de mise en forme simples (sans attributs) sont conservées :
// tout le reste est échappé et affiché comme du texte.
function sanitizeHTML(str) {
  return String(str)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)(strong|em|b|i|br|sub|sup|code|small)\s*\/?&gt;/gi, '<$1$2>');
}
const ttPolicy = (window.trustedTypes && window.trustedTypes.createPolicy)
  ? window.trustedTypes.createPolicy('nexploria', {
      createHTML: sanitizeHTML,
      // Utilisé uniquement pour les blocs JSON-LD : on n'accepte que du JSON valide.
      createScript: s => { JSON.parse(s); return s; },
      // Seuls nos propres fichiers /js/*.js peuvent être chargés.
      createScriptURL: u => { if (/^\/js\/[\w.-]+\.js$/.test(u)) return u; throw new TypeError('Script refusé : ' + u); },
    })
  : { createHTML: sanitizeHTML, createScript: s => s, createScriptURL: u => u };
function setRichText(el, html) { el.innerHTML = ttPolicy.createHTML(html); }

// ══════════════════════════════════════
//  UTILITAIRES
// ══════════════════════════════════════
const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
// Laisse le navigateur respirer entre deux tâches lourdes (évite les « long tasks »).
const yieldToMain = () => (window.scheduler && typeof window.scheduler.yield === 'function')
  ? window.scheduler.yield()
  : new Promise(r => setTimeout(r, 0));
function arrMax(a, floor = -Infinity) { let m = floor; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }

// ══════════════════════════════════════
//  BOUCLES D'ANIMATION DES EXPÉRIENCES
// ══════════════════════════════════════
// Chaque expérience appelle expRAF()/expInterval() au lieu de requestAnimationFrame()/setInterval().
// stopExperiment() incrémente la « génération » : toutes les boucles de l'expérience précédente
// s'arrêtent d'elles-mêmes, même si plusieurs boucles tournaient en parallèle.
let raf = null;
let expGen = 0;
const expTimers = new Set();
function expRAF(cb) {
  const gen = expGen;
  return requestAnimationFrame(t => { if (gen === expGen) cb(t); });
}
function expInterval(fn, ms) {
  const gen = expGen;
  const id = setInterval(() => {
    if (gen !== expGen) { clearInterval(id); expTimers.delete(id); return; }
    fn();
  }, ms);
  expTimers.add(id);
  return id;
}
function stopExperiment() {
  expGen++;
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  expTimers.forEach(clearInterval);
  expTimers.clear();
}

// ══════════════════════════════════════
//  CONTRÔLES (boutons / curseurs)
// ══════════════════════════════════════
let ctrlSeq = 0;
function addCtrl(bar, type, opts) {
  if (type === 'btn') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ctrl-btn' + (opts.ghost ? ' ghost' : '');
    b.textContent = opts.label;
    b.addEventListener('click', () => {
      try { opts.fn(); } catch (err) { console.error(err); }
    });
    if (opts.id) b.id = opts.id;
    bar.appendChild(b);
    return b;
  }
  if (type === 'slider') {
    const id = 'ctrl-' + (++ctrlSeq);
    const wrap = document.createElement('div'); wrap.className = 'ctrl-group';
    const lbl = document.createElement('label'); lbl.className = 'ctrl-lbl'; lbl.htmlFor = id; lbl.textContent = opts.label;
    const inp = document.createElement('input');
    inp.type = 'range'; inp.id = id;
    inp.min = opts.min; inp.max = opts.max; inp.step = opts.step || 1; inp.value = opts.val;
    const val = document.createElement('output'); val.className = 'ctrl-val'; val.htmlFor = id; val.textContent = opts.val;
    // Les calculs lourds (bruit de Perlin, fractales…) ne sont relancés qu'une fois par image,
    // avec la dernière valeur : le curseur reste fluide même si le rendu prend du temps.
    let pending = false;
    const gen = expGen;
    inp.addEventListener('input', () => {
      val.textContent = inp.value;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (gen !== expGen) return; // l'expérience a été fermée entre-temps
        try { opts.fn(+inp.value); } catch (err) { console.error(err); }
      });
    });
    wrap.append(lbl, inp, val);
    bar.appendChild(wrap);
    return inp;
  }
}

// ══════════════════════════════════════
//  DÉFINITIONS DES EXPÉRIENCES
// ══════════════════════════════════════
// Les 100 expériences sont réparties dans js/exp-1.js … exp-5.js, chargés en parallèle
// juste après ce fichier : chacun s'exécute dans sa propre tâche courte.
const EXPS = {};
const EXP_FILES = ['/js/exp-1.js', '/js/exp-2.js', '/js/exp-3.js', '/js/exp-4.js', '/js/exp-5.js'];
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = ttPolicy.createScriptURL(src);
    s.async = false; // exécution dans l'ordre
    s.onload = resolve;
    s.onerror = () => reject(new Error('Chargement impossible : ' + src));
    document.body.appendChild(s);
  });
}
const expsReady = Promise.all(EXP_FILES.map(loadScript));
expsReady.then(() => { document.documentElement.dataset.expsReady = '1'; }, err => console.error(err));

// Rendu pixel à résolution réduite (S) puis agrandi : 4× moins de calcul pour les textures douces (bruit, aperçus)
function renderScaled(c,g,S,fill){const w=Math.max(1,Math.ceil(c.width/S)),h=Math.max(1,Math.ceil(c.height/S));const off=document.createElement('canvas');off.width=w;off.height=h;const og=off.getContext('2d');const img=og.createImageData(w,h);fill(img.data,w,h);og.putImageData(img,0,0);g.imageSmoothingEnabled=true;g.drawImage(off,0,0,c.width,c.height)}
// Tas de sable abélien : on dépose tous les grains d'un coup puis on stabilise avec une pile (résultat identique, bien plus rapide)
function sandpileStabilize(grid,W,H){const st=[];for(let i=0;i<grid.length;i++)if(grid[i]>=4)st.push(i);while(st.length){const i=st.pop(),x=i%W,y=(i/W)|0;if(x<1||y<1||x>=W-1||y>=H-1||grid[i]<4)continue;const q=grid[i]>>2;grid[i]-=q*4;for(const j of [i-1,i+1,i-W,i+W]){grid[j]+=q;if(grid[j]>=4)st.push(j)}}}

/* ══════════════════════════════════════════════════════════
   INTERFACE — thème, recherche, aperçus, modale, routage
   (placé après les définitions : EXPS est complet ici)
══════════════════════════════════════════════════════════ */
const SITE = 'https://nexploria-2.netlify.app';
const DEFAULT_TITLE = 'Nexploria — Laboratoire de Science Interactive';
const DEFAULT_DESC = document.querySelector('meta[name="description"]').content;

// ── Thème ──
const themeBtn = $('theme-btn');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function isDark() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : prefersDark.matches;
}
function syncThemeUI() {
  const dark = isDark();
  themeBtn.textContent = dark ? '☀️' : '🌙';
  themeBtn.setAttribute('aria-pressed', String(dark));
  if (themeMeta) themeMeta.content = dark ? '#0d0d0f' : '#f4f2ed';
}
try {
  const saved = localStorage.getItem('nexploria-theme');
  if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
} catch (e) { /* stockage indisponible : on suit le système */ }
syncThemeUI();
themeBtn.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('nexploria-theme', next); } catch (e) { /* ignoré */ }
  syncThemeUI();
});
prefersDark.addEventListener('change', syncThemeUI);

// ── Hero : réseau de points animé (mis en pause hors écran / onglet caché / modale ouverte) ──
let heroKick = () => {};
(function heroNetwork() {
  const c = $('hero-canvas');
  const hero = document.querySelector('.hero');
  if (!c || !hero) return;
  const g = c.getContext('2d');
  const overlayEl = $('overlay');
  const pts = [];
  let visible = true, running = false, last = 0;
  // Taille lue une fois au chargement puis à chaque redimensionnement (ResizeObserver : pas de reflow forcé)
  new ResizeObserver(([entry]) => {
    const bb = entry.borderBoxSize && entry.borderBoxSize[0];
    c.width = Math.round(bb ? bb.inlineSize : hero.offsetWidth);
    c.height = Math.round(bb ? bb.blockSize : hero.offsetHeight);
    if (!pts.length) seed();
    frame();
  }).observe(hero);
  function seed() {
    // Densité proportionnelle à la surface : moins de calculs sur mobile
    const n = Math.max(30, Math.min(90, Math.round(c.width * c.height / 9000)));
    for (let i = 0; i < n; i++) pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
  }
  const BUCKETS = 6;
  const paths = Array.from({ length: BUCKETS }, () => []);
  let rgb = '17,16,16';
  const syncColor = () => { rgb = isDark() ? '240,237,230' : '17,16,16'; };
  syncColor();
  function frame() {
    if (!c.width) return;
    g.clearRect(0, 0, c.width, c.height);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > c.width) p.vx *= -1;
      if (p.y < 0 || p.y > c.height) p.vy *= -1;
    }
    // Segments regroupés par niveau d'opacité : 6 tracés au lieu d'un par segment
    for (const b of paths) b.length = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 12100) paths[Math.min(BUCKETS - 1, (Math.sqrt(d2) / 110 * BUCKETS) | 0)].push(a.x, a.y, b.x, b.y);
      }
    }
    g.lineWidth = .5;
    paths.forEach((seg, k) => {
      if (!seg.length) return;
      g.strokeStyle = `rgba(${rgb},${((1 - (k + .5) / BUCKETS) * .25).toFixed(3)})`;
      g.beginPath();
      for (let i = 0; i < seg.length; i += 4) { g.moveTo(seg[i], seg[i + 1]); g.lineTo(seg[i + 2], seg[i + 3]); }
      g.stroke();
    });
    g.fillStyle = `rgba(${rgb},.35)`;
    g.beginPath();
    for (const a of pts) { g.moveTo(a.x + 1.5, a.y); g.arc(a.x, a.y, 1.5, 0, Math.PI * 2); }
    g.fill();
  }
  function loop(t) {
    if (!visible || document.hidden || overlayEl.classList.contains('open') || reduceMotion.matches) { running = false; return; }
    if (t - last > 30) { last = t; frame(); } // ~30 images/s suffisent pour ce décor
    requestAnimationFrame(loop);
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
  heroKick = kick;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  reduceMotion.addEventListener('change', () => { frame(); kick(); });
  prefersDark.addEventListener('change', () => { syncColor(); frame(); });
  themeBtn.addEventListener('click', () => { syncColor(); frame(); });
  // Démarre l'animation quand le navigateur est inactif après le chargement, pour ne pas concurrencer le premier rendu.
  const start = () => (window.requestIdleCallback ? requestIdleCallback(kick, { timeout: 2000 }) : setTimeout(kick, 500));
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();

// ── Cartes, recherche et filtres ──
const grid = $('exp-grid');
const cards = Array.from(document.querySelectorAll('.card'));
const chips = Array.from(document.querySelectorAll('.filter-chip'));
const searchInput = $('search-input');
const countEl = $('exp-count');
const TOTAL = cards.length;
let activeFilter = 'all', searchQ = '';

// Index de recherche : sans accents, en minuscules.
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let searchIndexed = false;
function buildSearchIndex() {
  if (searchIndexed) return;
  searchIndexed = true;
  cards.forEach(c => {
    c._search = norm([c.querySelector('h3').textContent, c.querySelector('p').textContent, (c.querySelector('.card-tag') || {}).textContent || ''].join(' '));
  });
}
document.querySelectorAll('[data-total]').forEach(el => { if (el.textContent !== String(TOTAL)) el.textContent = TOTAL; });

function applyFilters() {
  let vis = 0;
  const q = norm(searchQ);
  if (q) buildSearchIndex();
  for (const c of cards) {
    const cats = (c.dataset.cats || '').split(' ');
    const show = (activeFilter === 'all' || cats.includes(activeFilter)) && (!q || c._search.includes(q));
    if (c.hidden === show) c.hidden = !show;
    if (show) vis++;
  }
  const label = `${vis} / ${TOTAL}`;
  if (countEl.textContent !== label) countEl.textContent = label;
  let noRes = $('no-results');
  if (vis === 0 && !noRes) {
    noRes = document.createElement('li');
    noRes.id = 'no-results'; noRes.className = 'no-results';
    noRes.textContent = 'Aucune expérience ne correspond à cette recherche.';
    grid.appendChild(noRes);
  } else if (vis > 0 && noRes) noRes.remove();
}
function setFilter(f) {
  activeFilter = f;
  chips.forEach(ch => {
    const on = ch.dataset.filter === f;
    ch.classList.toggle('active', on);
    ch.setAttribute('aria-pressed', String(on));
  });
  applyFilters();
}
chips.forEach(ch => ch.addEventListener('click', () => {
  const f = ch.dataset.filter;
  setFilter(f);
  const slug = CAT_SLUGS[f];
  if (slug) { history.replaceState({ path: 'categorie/' + slug }, '', '/categorie/' + slug); applyCategoryMeta(f); }
  else { history.replaceState({}, '', '/'); resetMeta(); }
}));
searchInput.addEventListener('input', () => { searchQ = searchInput.value.trim(); applyFilters(); });
// Raccourci « / » pour rechercher (annoncé par l'indice dans l'en-tête)
document.addEventListener('keydown', e => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || overlay.classList.contains('open')) return;
  e.preventDefault();
  searchInput.focus();
});

// ── Slugs (source unique : les liens des cartes dans le HTML) ──
const SLUG_OF = {}, ID_OF_SLUG = {};
cards.forEach(c => {
  const a = c.querySelector('.card-link');
  const slug = a.getAttribute('href').replace(/^\/experience\//, '');
  SLUG_OF[c.dataset.id] = slug;
  ID_OF_SLUG[slug] = c.dataset.id;
});
const CAT_SLUGS = { math: 'mathematiques', physics: 'physique', biology: 'biologie', cs: 'informatique', chaos: 'chaos', art: 'art-generatif' };
const CAT_META = {
  math:    { title: 'Expériences Mathématiques',     desc: 'Fractales, géométrie, théorie des nombres, probabilités : explorez les expériences mathématiques interactives de Nexploria.' },
  physics: { title: 'Expériences de Physique',       desc: 'Ondes, gravité, thermodynamique, électromagnétisme : explorez les expériences de physique interactives de Nexploria.' },
  biology: { title: 'Expériences de Biologie',       desc: 'Automates cellulaires, morphogenèse, écologie, évolution : explorez comment la complexité biologique émerge de règles simples.' },
  cs:      { title: 'Expériences d\'Informatique',   desc: 'Algorithmes de tri, automates, pathfinding, réseaux de neurones : explorez les fondements visuels de l\'informatique.' },
  chaos:   { title: 'Expériences sur le Chaos',      desc: 'Attracteurs étranges, pendule double, suite logistique : visualisez la théorie du chaos et la sensibilité aux conditions initiales.' },
  art:     { title: 'Art Génératif',                 desc: 'Bruit de Perlin, kaléidoscopes, champs de vecteurs, textures procédurales : quand les mathématiques deviennent images.' },
};
const FILTER_OF_CAT_SLUG = Object.fromEntries(Object.entries(CAT_SLUGS).map(([f, s]) => [s, f]));
// Descriptions SEO détaillées (les autres expériences utilisent le texte de leur carte).
const EXP_DESC = {
  mandelbrot: 'Zoomez dans la frontière fractale infinie du plan complexe. Explorez les auto-similarités de l\'ensemble de Mandelbrot en temps réel.',
  julia: 'Faites varier le paramètre complexe c et regardez la fractale de Julia se métamorphoser instantanément sous votre souris.',
  conway: 'Quatre règles, une complexité infinie. Explorez cet automate cellulaire fondateur de la biologie théorique et de la computation.',
  langton: 'Une fourmi, deux règles. Après 10 000 pas chaotiques, elle construit spontanément une autoroute périodique — l\'ordre émergent en action.',
  fourier: 'Superposez des sinusoïdes et reconstruisez n\'importe quelle forme. Visualisez le théorème de Fourier qui fonde le son numérique et l\'IRM.',
  waves: 'Ajoutez des sources d\'ondes et observez les zones d\'interférence constructive et destructive — le principe de Huygens visualisé.',
  particles: 'Simulation n-corps newtonienne interactive. Créez des orbites, des systèmes binaires et des éjections hyperboliques en temps réel.',
  pendulum: 'Deux trajectoires quasi-identiques divergent totalement. Le pendule double illustre le chaos déterministe et l\'effet papillon.',
  lorenz: 'Le modèle météorologique de 1963 qui a fondé la théorie du chaos. Regardez deux trajectoires irrémédiablement diverger sur l\'attracteur étrange.',
  turing: 'La réaction-diffusion d\'Alan Turing explique les rayures du zèbre et les taches du guépard. Générez vos propres motifs biologiques.',
  sort: 'Visualisez Bubble Sort, Quick Sort et Merge Sort en parallèle. Comparez leurs empreintes caractéristiques sur les mêmes données.',
  lissajous: 'Deux oscillations perpendiculaires dessinent des figures harmoniques. Explorez les liens entre géométrie, physique et musique.',
  walk: 'Observez le mouvement brownien et le théorème central limite en direct. L\'ordre statistique émerge du hasard pur.',
  wolfram: 'L\'automate cellulaire 1D de Wolfram, prouvé Turing-complet en 2004. Explorez les 256 règles et leurs comportements émergents.',
};
const RELATED = {
  mandelbrot: ['julia', 'burningship', 'newton'], julia: ['mandelbrot', 'newton', 'lyapunov'],
  conway: ['langton', 'wolfram', 'life3d'], langton: ['conway', 'turmite', 'wolfram'],
  fourier: ['fftdraw', 'audiospectrum', 'waves'], waves: ['doubleslit', 'fourier', 'doppler'],
  particles: ['nbody3', 'orbits', 'pendulum'], pendulum: ['lorenz', 'forcedpendulum', 'coupledpend'],
  lorenz: ['rossler', 'halvorsen', 'thomas'], turing: ['grayscott', 'bz', 'conway'],
  sort: ['astar', 'maze', 'wolfram'], lissajous: ['fourier', 'spirograph', 'rose'],
  walk: ['brownian', 'dla', 'percolation'], wolfram: ['conway', 'xorca', 'langton'],
};
function relatedOf(id) {
  if (RELATED[id]) return RELATED[id].filter(r => EXPS[r]);
  const me = cards.find(c => c.dataset.id === id);
  const cats = me ? me.dataset.cats.split(' ') : [];
  const i = cards.indexOf(me);
  const ordered = cards.slice(i + 1).concat(cards.slice(0, i));
  return ordered.filter(c => c.dataset.cats.split(' ').some(k => cats.includes(k))).slice(0, 3).map(c => c.dataset.id);
}
function cardOf(id) { return cards.find(c => c.dataset.id === id); }
function expTitle(id) { const c = cardOf(id); return c ? c.querySelector('h3').textContent.trim() : (EXPS[id] && EXPS[id].title) || id; }
function expDesc(id) { const c = cardOf(id); return EXP_DESC[id] || (c ? c.querySelector('p').textContent.trim() : DEFAULT_DESC); }

// ── Aperçus des cartes : dessinés à la demande (quand la carte approche de l'écran),
//    un par tâche, pour ne jamais bloquer le fil principal. ──
const previewQueue = [];
let previewBusy = false;
function previewFn(id) {
  return EXPS[id] && typeof EXPS[id].preview === 'function' ? EXPS[id].preview.bind(EXPS[id]) : null;
}
async function drainPreviews() {
  if (previewBusy) return;
  previewBusy = true;
  try { await expsReady; } catch (e) { previewBusy = false; return; }
  while (previewQueue.length) {
    const c = previewQueue.shift();
    if (c.dataset.drawn) continue;
    if (c.closest('.card').hidden) { previewObserver.observe(c); continue; }
    c.dataset.drawn = '1';
    const fn = previewFn(c.closest('.card').dataset.id);
    if (fn) {
      c.width = c.clientWidth || 300; c.height = 170;
      try { fn(c, c.getContext('2d')); } catch (err) { console.error('Aperçu', c.id, err); }
    }
    c.classList.add('ready');
    await yieldToMain();
  }
  previewBusy = false;
}
const previewObserver = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) { previewObserver.unobserve(e.target); previewQueue.push(e.target); }
  drainPreviews();
}, { rootMargin: '120px 0px' });
function startPreviews() { document.querySelectorAll('canvas.card-preview').forEach(c => previewObserver.observe(c)); }

// ══════════════════════════════════════
//  MODALE
// ══════════════════════════════════════
const overlay = $('overlay');
const fsOverlay = $('fs-overlay');
const expControls = $('exp-controls');
const fsControls = $('fs-controls');
const modalContent = overlay.querySelector('.modal-content');
let expCanvas = $('exp-canvas');
let fsCanvas = $('fs-canvas');
let currentExp = null, lastFocus = null, openedByPush = false;

// Un canvas neuf à chaque lancement : aucun gestionnaire d'événements ni état de contexte
// (transformations, textAlign…) ne fuit d'une expérience à l'autre.
function freshCanvas(old) {
  const c = document.createElement('canvas');
  c.id = old.id;
  if (old.className) c.className = old.className;
  c.setAttribute('role', 'img');
  old.replaceWith(c);
  return c;
}
function mountExperiment(where) {
  const e = EXPS[currentExp];
  stopExperiment();
  expControls.replaceChildren();
  fsControls.replaceChildren();
  let canvas, bar;
  if (where === 'fs') {
    fsCanvas = freshCanvas(fsCanvas);
    fsCanvas.width = window.innerWidth; fsCanvas.height = window.innerHeight;
    canvas = fsCanvas; bar = fsControls;
  } else {
    expCanvas = freshCanvas(expCanvas);
    const w = Math.max(240, Math.min(900, (modalContent.clientWidth || window.innerWidth) - 48, window.innerWidth - 80));
    expCanvas.width = w; expCanvas.height = Math.round(w * 9 / 16);
    canvas = expCanvas; bar = expControls;
  }
  canvas.setAttribute('aria-label', `Simulation : ${e.title}` + (e.hint ? ` — ${e.hint}` : ''));
  $('canvas-info').textContent = e.hint || '';
  try {
    e.setup(canvas, canvas.getContext('2d'), (type, opts) => addCtrl(bar, type, opts));
  } catch (err) {
    console.error('Expérience', currentExp, err);
    $('canvas-info').textContent = 'Cette expérience a rencontré une erreur. Essayez de la relancer.';
  }
}

function openExp(id, opts = {}) {
  const e = EXPS[id];
  if (!e) {
    // Lot pas encore chargé (clic très rapide ou lien direct) : on ouvre dès qu'il est prêt.
    if (SLUG_OF[id]) expsReady.then(() => { if (EXPS[id]) openExp(id, opts); });
    return;
  }
  if (!overlay.classList.contains('open')) lastFocus = document.activeElement;
  currentExp = id;
  $('modal-tag-el').textContent = e.tag;
  $('modal-title-el').textContent = e.title;
  $('fs-title').textContent = e.title;
  setRichText($('exp-info'), e.info);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  mountExperiment('modal');
  renderShareRow(id);
  renderRelated(id);
  // URL, titre et méta propres à l'expérience
  const slug = SLUG_OF[id];
  if (slug) {
    const path = 'experience/' + slug;
    if (opts.push !== false && location.pathname !== '/' + path) {
      if (opts.replace) history.replaceState({ path }, '', '/' + path);
      else { history.pushState({ path }, '', '/' + path); openedByPush = true; }
    }
    setMeta(expTitle(id), expDesc(id), path);
    setBreadcrumb([{ name: 'Expériences', path: '#experiences' }, { name: expTitle(id), path }]);
  }
  $('close-btn').focus({ preventScroll: true });
}

function closeModal(opts = {}) {
  if (!overlay.classList.contains('open')) return;
  stopExperiment();
  overlay.classList.remove('open');
  fsOverlay.classList.remove('open');
  document.body.style.overflow = '';
  currentExp = null;
  expControls.replaceChildren();
  const rp = $('related-panel'); if (rp) rp.remove();
  const sr = $('share-row'); if (sr) sr.remove();
  resetMeta(); clearBreadcrumb();
  if (opts.fromHistory !== true && location.pathname.startsWith('/experience/')) {
    if (openedByPush) history.back();
    else history.replaceState({}, '', '/');
  }
  openedByPush = false;
  heroKick();
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}

$('close-btn').addEventListener('click', () => closeModal());
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

// Plein écran : on relance l'expérience sur le grand canvas avec ses vrais contrôles.
function openFullscreen() {
  if (!currentExp) return;
  fsOverlay.classList.add('open');
  mountExperiment('fs');
  $('fs-close-btn').focus({ preventScroll: true });
}
function closeFullscreen() {
  if (!fsOverlay.classList.contains('open')) return;
  fsOverlay.classList.remove('open');
  if (currentExp) mountExperiment('modal');
  $('fs-btn').focus({ preventScroll: true });
}
$('fs-btn').addEventListener('click', openFullscreen);
$('fs-close-btn').addEventListener('click', closeFullscreen);

// Clavier : Échap ferme la couche du dessus, Tab reste piégé dans la boîte de dialogue ouverte.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (fsOverlay.classList.contains('open')) closeFullscreen();
    else if (overlay.classList.contains('open')) closeModal();
    else if (mobileNav.classList.contains('open')) closeMobileNav(true);
    return;
  }
  if (e.key !== 'Tab') return;
  const layer = fsOverlay.classList.contains('open') ? fsOverlay : overlay.classList.contains('open') ? overlay : null;
  if (!layer) return;
  const f = Array.from(layer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || !layer.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (document.activeElement === last || !layer.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
});

// ── Lien de partage ──
function renderShareRow(id) {
  const old = $('share-row'); if (old) old.remove();
  const slug = SLUG_OF[id];
  if (!slug) return;
  const url = `${SITE}/experience/${slug}`;
  const row = document.createElement('div');
  row.id = 'share-row'; row.className = 'share-row';
  const lbl = document.createElement('span'); lbl.className = 'share-lbl'; lbl.textContent = 'Lien :';
  const code = document.createElement('code'); code.className = 'share-url'; code.textContent = url;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'share-btn'; btn.textContent = 'Copier';
  btn.setAttribute('aria-label', 'Copier le lien de cette expérience');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(url); btn.textContent = '✓ Copié'; }
    catch (err) {
      const r = document.createRange(); r.selectNodeContents(code);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      btn.textContent = 'Ctrl+C pour copier';
    }
    setTimeout(() => { btn.textContent = 'Copier'; }, 1800);
  });
  row.append(lbl, code, btn);
  expControls.before(row);
}

// ── Expériences liées ──
function renderRelated(id) {
  const old = $('related-panel'); if (old) old.remove();
  const ids = relatedOf(id);
  if (!ids.length) return;
  const panel = document.createElement('nav');
  panel.id = 'related-panel'; panel.className = 'related-panel';
  panel.setAttribute('aria-labelledby', 'related-title');
  const h = document.createElement('h3'); h.id = 'related-title'; h.className = 'related-title'; h.textContent = 'Expériences liées';
  const list = document.createElement('div'); list.className = 'related-list';
  for (const rid of ids) {
    const a = document.createElement('a');
    a.className = 'related-btn';
    a.href = '/experience/' + SLUG_OF[rid];
    a.textContent = expTitle(rid);
    a.addEventListener('click', ev => {
      if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button !== 0) return;
      ev.preventDefault();
      openExp(rid, { replace: true });
    });
    list.appendChild(a);
  }
  panel.append(h, list);
  $('exp-info').after(panel);
}

// ══════════════════════════════════════
//  MÉTA-DONNÉES & ROUTAGE (History API)
// ══════════════════════════════════════
function setMetaContent(sel, val) { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); }
function setMeta(title, desc, path) {
  const full = title + ' — Nexploria';
  const url = `${SITE}/${path || ''}`;
  document.title = full;
  setMetaContent('meta[name="description"]', desc);
  setMetaContent('meta[property="og:title"]', full);
  setMetaContent('meta[property="og:description"]', desc);
  setMetaContent('meta[property="og:url"]', url);
  setMetaContent('meta[name="twitter:title"]', full);
  setMetaContent('meta[name="twitter:description"]', desc);
  document.querySelector('link[rel="canonical"]').href = url;
}
function resetMeta() {
  document.title = DEFAULT_TITLE;
  setMetaContent('meta[name="description"]', DEFAULT_DESC);
  setMetaContent('meta[property="og:title"]', DEFAULT_TITLE);
  setMetaContent('meta[property="og:url"]', SITE + '/');
  setMetaContent('meta[name="twitter:title"]', DEFAULT_TITLE);
  document.querySelector('link[rel="canonical"]').href = SITE + '/';
}
function applyCategoryMeta(f) {
  const m = CAT_META[f]; if (!m) return;
  const path = 'categorie/' + CAT_SLUGS[f];
  setMeta(m.title, m.desc, path);
  setBreadcrumb([{ name: m.title, path }]);
}
let breadcrumbEl = null;
function setBreadcrumb(items) {
  clearBreadcrumb();
  breadcrumbEl = document.createElement('script');
  breadcrumbEl.type = 'application/ld+json';
  breadcrumbEl.text = ttPolicy.createScript(JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Nexploria', item: SITE + '/' },
      ...items.map((it, i) => ({ '@type': 'ListItem', position: i + 2, name: it.name, item: `${SITE}/${it.path}` })),
    ],
  }));
  document.head.appendChild(breadcrumbEl);
}
function clearBreadcrumb() { if (breadcrumbEl) { breadcrumbEl.remove(); breadcrumbEl = null; } }

function route(path, opts = {}) {
  const clean = String(path).replace(/^\//, '').replace(/\/$/, '');
  const [kind, slug] = clean.split('/');
  if (kind === 'experience' && ID_OF_SLUG[slug]) {
    openExp(ID_OF_SLUG[slug], { push: opts.push });
    return;
  }
  if (overlay.classList.contains('open')) closeModal({ fromHistory: true });
  if (kind === 'categorie' && FILTER_OF_CAT_SLUG[slug]) {
    const f = FILTER_OF_CAT_SLUG[slug];
    if (opts.push) history.pushState({ path: clean }, '', '/' + clean);
    setFilter(f);
    applyCategoryMeta(f);
    if (opts.scroll !== false) $('experiences').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    return;
  }
  resetMeta(); clearBreadcrumb();
}
window.addEventListener('popstate', () => {
  const p = location.pathname;
  if (p.startsWith('/experience/') || p.startsWith('/categorie/')) route(p, { push: false, scroll: false });
  else { closeModal({ fromHistory: true }); resetMeta(); clearBreadcrumb(); }
  openedByPush = false;
});

// Liens internes (cartes, pied de page, menu mobile, expériences liées) : navigation sans rechargement.
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href^="/experience/"], a[href^="/categorie/"]');
  if (!a || a.closest('#related-panel')) return;
  e.preventDefault();
  closeMobileNav();
  route(a.getAttribute('href'), { push: true });
});

// Logo : retour à l'accueil, filtres remis à zéro.
document.querySelector('.logo').addEventListener('click', e => {
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  closeModal();
  searchQ = ''; searchInput.value = '';
  setFilter('all');
  resetMeta(); clearBreadcrumb();
  if (location.pathname !== '/') history.pushState({}, '', '/');
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
});

// ── Menu mobile ──
const hamburgerBtn = $('hamburger-btn');
const mobileNav = $('mobile-nav');
function closeMobileNav(restoreFocus) {
  if (!mobileNav.classList.contains('open')) return;
  hamburgerBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.style.overflow = '';
  if (restoreFocus) hamburgerBtn.focus();
}
hamburgerBtn.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  hamburgerBtn.classList.toggle('open', open);
  hamburgerBtn.setAttribute('aria-expanded', String(open));
  hamburgerBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) { const first = mobileNav.querySelector('a'); if (first) first.focus(); }
});
mobileNav.addEventListener('click', e => { if (e.target.closest('a')) closeMobileNav(); });

// ── Apparition au défilement (désactivée si l'utilisateur limite les animations) ──
// Le premier rappel de l'observateur indique ce qui est déjà visible : seuls les éléments
// hors écran reçoivent l'effet (aucune mesure synchrone → aucun recalcul de mise en page forcé).
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const seen = new WeakSet();
  const revealObserver = new IntersectionObserver(entries => {
    for (const e of entries) {
      const el = e.target;
      if (!seen.has(el)) {
        seen.add(el);
        if (e.isIntersecting) revealObserver.unobserve(el); else el.classList.add('reveal');
      } else if (e.isIntersecting) {
        el.classList.add('visible');
        revealObserver.unobserve(el);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  // Mis en place quand le navigateur est inactif : rien de tout cela n'est visible au premier écran.
  const setupReveal = () => document.querySelectorAll('.card, .feat, .about-inner > div').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.06 + 's';
    revealObserver.observe(el);
  });
  if (window.requestIdleCallback) requestIdleCallback(setupReveal, { timeout: 1500 }); else setTimeout(setupReveal, 300);
}

// ── Barre de progression de lecture (transform = animation composée par le GPU) ──
const progressBar = $('progress-bar');
let progressTick = false;
window.addEventListener('scroll', () => {
  if (progressTick) return;
  progressTick = true;
  requestAnimationFrame(() => {
    progressTick = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
  });
}, { passive: true });

// ── Newsletter (Netlify Forms) ──
const nlForm = document.querySelector('.cta-strip-form');
if (nlForm) nlForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = nlForm.querySelector('button[type="submit"]');
  const status = document.querySelector('.cta-status');
  btn.disabled = true;
  status.textContent = 'Envoi…';
  try {
    const body = new URLSearchParams(new FormData(nlForm)).toString();
    const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    status.textContent = 'Merci ! Votre inscription est enregistrée.';
    nlForm.reset();
  } catch (err) {
    status.textContent = 'L\'inscription n\'a pas pu être envoyée. Réessayez plus tard ou écrivez à hello@nexploria.science.';
  } finally {
    btn.disabled = false;
  }
});

// ══════════════════════════════════════
//  DÉMARRAGE
// ══════════════════════════════════════
(function init() {
  // Ancien mécanisme de redirection via 404.html (conservé pour les liens en cache)
  let stored = null;
  try { stored = sessionStorage.getItem('redirect'); sessionStorage.removeItem('redirect'); } catch (e) { /* ignoré */ }
  const path = stored || location.pathname;
  if (/^\/(experience|categorie)\//.test(path)) {
    if (stored) history.replaceState({}, '', path);
    route(path, { push: false });
  }
  // Recherche via l'URL (?q=…), annoncée aux moteurs dans les données structurées (SearchAction)
  const q = new URLSearchParams(location.search).get('q');
  if (q) {
    searchInput.value = q; searchQ = q.trim(); applyFilters();
    $('experiences').scrollIntoView();
  }
  const afterLoad = () => {
    // Les aperçus démarrent après le chargement complet, en tâches courtes.
    startPreviews();
    // Manifeste (PWA) ajouté après le chargement : il ne fait pas partie du chemin critique.
    if (!document.querySelector('link[rel="manifest"]')) {
      const l = document.createElement('link');
      l.rel = 'manifest'; l.href = '/manifest.webmanifest';
      document.head.appendChild(l);
    }
  };
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
})();
