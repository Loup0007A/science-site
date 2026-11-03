/* Nexploria — expériences, lot 1/5.
   Chargé par js/app.js (qui définit EXPS, expRAF, addCtrl…) ; chaque lot s'exécute dans
   sa propre tâche pour ne pas bloquer le fil principal au chargement. */
/* ─────────────────────────────────────
   1. MANDELBROT
───────────────────────────────────── */
const mandelbrot = {
  preview(c, g) {
    const W = c.width, H = c.height, img = g.createImageData(W, H);
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const x0 = px / W * 3.5 - 2.5, y0 = py / H * 2 - 1;
      let x = 0, y = 0, i = 0;
      while (x * x + y * y <= 4 && i < 80) { const t = x * x - y * y + x0; y = 2 * x * y + y0; x = t; i++; }
      const t = i / 80, idx = (py * W + px) * 4;
      img.data[idx] = Math.floor(9 * (1 - t) * t * t * t * 255);
      img.data[idx + 1] = Math.floor(15 * (1 - t) ** 2 * t * t * 255);
      img.data[idx + 2] = Math.floor(8.5 * (1 - t) ** 3 * t * 255);
      img.data[idx + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  },
  setup(canvas, ctx, add) {
    let zoom = 200, cx = -0.5, cy = 0, maxIter = 120, dragging = false, lx, ly;
    canvas.style.cursor = 'crosshair';
    canvas.onmousedown = e => { dragging = true; lx = e.clientX; ly = e.clientY; };
    canvas.onmouseup = () => dragging = false;
    canvas.onmousemove = e => { if (!dragging) return; cx -= (e.clientX - lx) / zoom; cy -= (e.clientY - ly) / zoom; lx = e.clientX; ly = e.clientY; draw(); };
    canvas.onwheel = e => { e.preventDefault(); const f = e.deltaY < 0 ? 1.3 : 0.77; const mx = (e.offsetX - canvas.width / 2) / zoom, my = (e.offsetY - canvas.height / 2) / zoom; zoom *= f; cx += mx * (1 - 1 / f); cy += my * (1 - 1 / f); draw(); };
    add('btn', { label: 'Reset', ghost: true, fn: () => { zoom = 200; cx = -0.5; cy = 0; draw(); } });
    add('slider', { label: 'Itérations', min: 40, max: 500, val: maxIter, fn: v => { maxIter = v; draw(); } });
    add('btn', { label: 'Mini Mandelbrot', ghost: true, fn: () => { cx = -1.749; cy = 0; zoom = 4000; draw(); } });
    add('btn', { label: 'Spirale', ghost: true, fn: () => { cx = -0.7269; cy = 0.1889; zoom = 8000; draw(); } });
    function draw() {
      const W = canvas.width, H = canvas.height, img = ctx.createImageData(W, H);
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
        const x0 = (px - W / 2) / zoom + cx, y0 = (py - H / 2) / zoom + cy;
        let x = 0, y = 0, i = 0;
        while (x * x + y * y <= 4 && i < maxIter) { const t = x * x - y * y + x0; y = 2 * x * y + y0; x = t; i++; }
        const smooth = i < maxIter ? i + 1 - Math.log(Math.log(Math.sqrt(x * x + y * y))) / Math.log(2) : maxIter;
        const t = smooth / maxIter, idx = (py * W + px) * 4;
        if (i >= maxIter) { img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = 0; }
        else { img.data[idx] = Math.floor(Math.sin(t * Math.PI) ** 2 * 220 + 20); img.data[idx + 1] = Math.floor(Math.sin(t * Math.PI + 1) ** 2 * 150); img.data[idx + 2] = Math.floor(Math.sin(t * Math.PI + 2) ** 2 * 200 + 30); }
        img.data[idx + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    draw();
  }
};
EXPS.mandelbrot = { tag: 'Mathématiques · Fractales', title: 'Ensemble de Mandelbrot', hint: 'Scroll pour zoomer · Drag pour déplacer', info: '<strong>L\'ensemble de Mandelbrot</strong> regroupe les nombres complexes <em>c</em> pour lesquels la suite z → z² + c reste bornée. Sa frontière est un fractal de dimension ~2 dont la complexité est infinie : chaque zoom révèle de nouveaux détails auto-similaires. Inventé par Benoît Mandelbrot en 1980, il est devenu l\'icône de la géométrie fractale.', setup: mandelbrot.setup };

/* ─────────────────────────────────────
   2. JULIA
───────────────────────────────────── */
const julia = {
  preview(c, g) {
    const W = c.width, H = c.height, img = g.createImageData(W, H);
    const cr = -0.7, ci = 0.27;
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      let x = (px / W) * 3.2 - 1.6, y = (py / H) * 2 - 1, i = 0;
      while (x * x + y * y <= 4 && i < 80) { const t = x * x - y * y + cr; y = 2 * x * y + ci; x = t; i++; }
      const t = i / 80, idx = (py * W + px) * 4;
      img.data[idx] = Math.floor(t * 180 + 40); img.data[idx + 1] = Math.floor((1 - t) * 120); img.data[idx + 2] = Math.floor(t * 220); img.data[idx + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  },
  setup(canvas, ctx, add) {
    let cr = -0.7, ci = 0.27, maxIter = 100, zoom = 1;
    canvas.style.cursor = 'crosshair';
    canvas.onmousemove = e => {
      cr = (e.offsetX / canvas.offsetWidth) * 4 - 2;
      ci = (e.offsetY / canvas.offsetHeight) * 4 - 2;
      draw();
    };
    add('slider', { label: 'Itérations', min: 30, max: 300, val: maxIter, fn: v => { maxIter = v; draw(); } });
    add('btn', { label: 'Dragon', ghost: true, fn: () => { cr = -0.7; ci = 0.27; draw(); } });
    add('btn', { label: 'Dentelle', ghost: true, fn: () => { cr = -0.4; ci = 0.6; draw(); } });
    add('btn', { label: 'Lapin', ghost: true, fn: () => { cr = -0.123; ci = 0.745; draw(); } });
    function draw() {
      const W = canvas.width, H = canvas.height, img = ctx.createImageData(W, H);
      for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
        let x = (px / W) * 3.5 / zoom - 1.75 / zoom, y = (py / H) * 3.5 * H / W / zoom - 1.75 * H / W / zoom, i = 0;
        while (x * x + y * y <= 4 && i < maxIter) { const t = x * x - y * y + cr; y = 2 * x * y + ci; x = t; i++; }
        const t = i / maxIter, idx = (py * W + px) * 4;
        img.data[idx] = Math.floor(Math.sin(t * 6) ** 2 * 200 + 30);
        img.data[idx + 1] = Math.floor(Math.sin(t * 6 + 2) ** 2 * 180);
        img.data[idx + 2] = Math.floor(Math.sin(t * 6 + 4) ** 2 * 240);
        img.data[idx + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    draw();
  }
};
EXPS.julia = { tag: 'Mathématiques · Fractales', title: 'Ensemble de Julia', hint: 'Déplacez la souris sur le canvas pour changer le paramètre c', info: '<strong>Les ensembles de Julia</strong> sont les compagnons de Mandelbrot : pour chaque point <em>c</em> du plan complexe, il existe un ensemble de Julia. Bougez la souris sur le canvas pour faire varier <em>c</em> et observer la métamorphose du fractal en temps réel. Lorsque <em>c</em> est dans l\'ensemble de Mandelbrot, Julia est connexe ; sinon, il se fragmente en poussière de Cantor.', setup: julia.setup };

/* ─────────────────────────────────────
   3. CONWAY
───────────────────────────────────── */
const conway = {
  preview(c, g) {
    const S = 6, cols = Math.floor(c.width / S), rows = Math.floor(c.height / S);
    g.fillStyle = '#080810'; g.fillRect(0, 0, c.width, c.height);
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++)
      if (Math.random() < 0.28) { g.fillStyle = '#2aaa7a'; g.fillRect(col * S, r * S, S - 1, S - 1); }
  },
  setup(canvas, ctx, add) {
    const S = 8, cols = Math.floor(canvas.width / S), rows = Math.floor(canvas.height / S);
    let grid = rand(), running = true, interval = 80;
    function rand() { return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < .25 ? 1 : 0)); }
    function empty() { return Array.from({ length: rows }, () => new Array(cols).fill(0)); }
    canvas.onclick = e => { const col = Math.min(cols - 1, Math.floor(e.offsetX / canvas.offsetWidth * cols)), row = Math.min(rows - 1, Math.floor(e.offsetY / canvas.offsetHeight * rows)); grid[row][col] ^= 1; draw(); };
    const playBtn = add('btn', { label: '⏸ Pause', fn: () => { running = !running; playBtn.textContent = running ? '⏸ Pause' : '▶ Play'; if (running) loop(); } });
    add('btn', { label: 'Aléatoire', ghost: true, fn: () => { grid = rand(); draw(); } });
    add('btn', { label: 'Vider', ghost: true, fn: () => { grid = empty(); draw(); } });
    add('btn', { label: 'Glider', ghost: true, fn: () => { grid = empty(); [[1,0],[2,1],[0,2],[1,2],[2,2]].forEach(([dc,dr]) => { grid[10+dr][10+dc] = 1; }); draw(); } });
    add('btn', { label: 'Pulsar', ghost: true, fn: () => { grid = empty(); const r0 = Math.floor(rows / 2) - 6, c0 = Math.floor(cols / 2) - 6; for (const a of [0, 5, 7, 12]) for (const b of [2, 3, 4, 8, 9, 10]) { grid[r0 + a][c0 + b] = 1; grid[r0 + b][c0 + a] = 1; } draw(); } });
    add('btn', { label: 'Canon à planeurs', ghost: true, fn: () => { grid = empty(); const g = [[5,1],[5,2],[6,1],[6,2],[5,11],[6,11],[7,11],[4,12],[8,12],[3,13],[9,13],[3,14],[9,14],[6,15],[4,16],[8,16],[5,17],[6,17],[7,17],[6,18],[3,21],[4,21],[5,21],[3,22],[4,22],[5,22],[2,23],[6,23],[1,25],[2,25],[6,25],[7,25],[3,35],[4,35],[3,36],[4,36]]; g.forEach(([r, c]) => { if (r + 2 < rows && c + 2 < cols) grid[r + 2][c + 2] = 1; }); draw(); } });
    add('slider', { label: 'Vitesse', min: 1, max: 60, val: 12, fn: v => interval = Math.floor(1000 / v) });
    function step() {
      const next = empty();
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (dr === 0 && dc === 0) continue; n += grid[(r + dr + rows) % rows][(c + dc + cols) % cols]; }
        next[r][c] = (grid[r][c] && (n === 2 || n === 3)) || (!grid[r][c] && n === 3) ? 1 : 0;
      }
      grid = next;
    }
    function draw() {
      ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        if (grid[r][c]) { ctx.fillStyle = '#2aaa7a'; ctx.fillRect(c * S + 1, r * S + 1, S - 1, S - 1); }
    }
    let last = 0;
    function loop(ts = 0) { if (!running) return; if (ts - last > interval) { step(); draw(); last = ts; } raf = expRAF(loop); }
    draw(); loop();
  }
};
EXPS.conway = { tag: 'Biologie · Automates Cellulaires', title: 'Jeu de la Vie de Conway', hint: 'Cliquez sur le canvas pour dessiner des cellules', info: '<strong>Le Jeu de la Vie</strong> (John H. Conway, 1970) est un automate cellulaire à 4 règles : une cellule vivante avec 2 ou 3 voisins survit ; avec moins de 2 elle meurt d\'isolement ; avec plus de 3 elle meurt de surpopulation ; une cellule morte avec exactement 3 voisins naît. Ces règles minimales génèrent des oscillateurs, des vaisseaux, des générateurs de gliders — un modèle fondamental en biologie théorique et en théorie de la computation.', setup: conway.setup };

/* ─────────────────────────────────────
   4. LANGTON ANT
───────────────────────────────────── */
const langton = {
  preview(c, g) {
    g.fillStyle = '#080810'; g.fillRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2;
    g.fillStyle = '#e09030'; g.fillRect(cx - 20, cy - 2, 40, 4); g.fillRect(cx - 2, cy - 20, 4, 40);
    for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(224,144,48,${Math.random() * .4})`; g.fillRect(Math.random() * c.width, Math.random() * c.height, 4, 4); }
  },
  setup(canvas, ctx, add) {
    const S = 4, cols = Math.floor(canvas.width / S), rows = Math.floor(canvas.height / S);
    const grid = new Uint8Array(cols * rows);
    let ax = Math.floor(cols / 2), ay = Math.floor(rows / 2), dir = 0, running = true, steps = 0, speed = 60;
    const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
    function step(n=1) {
      for (let i = 0; i < n; i++) {
        const idx = ay * cols + ax;
        if (grid[idx] === 0) { dir = (dir + 1) % 4; grid[idx] = 1; }
        else { dir = (dir + 3) % 4; grid[idx] = 0; }
        ax = (ax + DIRS[dir][0] + cols) % cols;
        ay = (ay + DIRS[dir][1] + rows) % rows;
        steps++;
      }
    }
    function draw() {
      ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        if (grid[r * cols + c]) { ctx.fillStyle = '#e09030'; ctx.fillRect(c * S, r * S, S, S); }
      ctx.fillStyle = '#ff4040'; ctx.fillRect(ax * S - 1, ay * S - 1, S + 2, S + 2);
      document.getElementById('canvas-info') && (document.getElementById('canvas-info').textContent = `Étape : ${steps.toLocaleString()}`);
    }
    const playBtn = add('btn', { label: '⏸ Pause', fn: () => { running = !running; playBtn.textContent = running ? '⏸ Pause' : '▶ Play'; if (running) loop(); } });
    add('btn', { label: 'Reset', ghost: true, fn: () => { grid.fill(0); ax = Math.floor(cols/2); ay = Math.floor(rows/2); dir = 0; steps = 0; draw(); } });
    add('btn', { label: '+1000 étapes', ghost: true, fn: () => { step(1000); draw(); } });
    add('slider', { label: 'Pas / image', min: 1, max: 200, val: speed, fn: v => speed = v });
    function loop() { if (!running) return; step(speed); draw(); raf = expRAF(loop); }
    loop();
  }
};
EXPS.langton = { tag: 'Informatique · Automates', title: 'Fourmi de Langton', hint: 'La fourmi rouge suit ses règles simples', info: '<strong>La fourmi de Langton</strong> (1986) obéit à deux règles : sur une case blanche, tourner à droite, la peindre en noir et avancer ; sur une case noire, tourner à gauche, la peindre en blanc et avancer. Après ~10 000 pas de chaos apparent, la fourmi construit spontanément une <em>autoroute</em> périodique se prolongeant indéfiniment. Ce comportement émergent est un des plus étonnants exemples d\'ordre naissant du désordre.', setup: langton.setup };

/* ─────────────────────────────────────
   5. FOURIER
───────────────────────────────────── */
const fourier = {
  preview(c, g) {
    g.fillStyle = '#080810'; g.fillRect(0, 0, c.width, c.height);
    const colors = ['#d63f0e','#1a7a5a','#5230cc','rgba(240,237,230,.25)'];
    [1, 3, 5, 0].forEach((h, i) => {
      g.strokeStyle = colors[i]; g.lineWidth = i === 3 ? 2 : 1; g.beginPath();
      for (let x = 0; x < c.width; x++) {
        const n = h || [1,3,5].reduce((a, k) => a + Math.sin(x * k * .04) / k, 0);
        const y = c.height / 2 - (h ? Math.sin(x * h * .04) / (h * .7) : n) * 50;
        x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    });
  },
  setup(canvas, ctx, add) {
    const W = canvas.width, H = canvas.height, A = H * .27, cx0 = W * .2, cy = H / 2, x0 = W * .44;
    let harmonics = 7, speed = 3, t = 0, wave = 'square'; const history = [];
    const WAVES = {
      square: { label: 'carrée', terms: n => Array.from({ length: n }, (_, k) => [2 * k + 1, 4 / (Math.PI * (2 * k + 1))]), target: u => Math.sign(Math.sin(u)) },
      saw: { label: 'en dents de scie', terms: n => Array.from({ length: n }, (_, k) => [k + 1, (k % 2 ? -2 : 2) / (Math.PI * (k + 1))]), target: u => (((u + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) / Math.PI },
      tri: { label: 'triangulaire', terms: n => Array.from({ length: n }, (_, k) => [2 * k + 1, (k % 2 ? -8 : 8) / (Math.PI * Math.PI * (2 * k + 1) ** 2)]), target: u => 2 / Math.PI * Math.asin(Math.sin(u)) },
    };
    add('slider', { label: 'Harmoniques', min: 1, max: 30, val: harmonics, fn: v => harmonics = v });
    add('slider', { label: 'Vitesse', min: 1, max: 10, val: speed, fn: v => speed = v });
    const btns = {};
    const pick = w => { wave = w; history.length = 0; for (const k in btns) btns[k].classList.toggle('ghost', k !== w); };
    btns.square = add('btn', { label: 'Carrée', fn: () => pick('square') });
    btns.saw = add('btn', { label: 'Dent de scie', ghost: true, fn: () => pick('saw') });
    btns.tri = add('btn', { label: 'Triangle', ghost: true, fn: () => pick('tri') });
    const dT = () => .012 * speed;
    function loop() {
      ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
      const W8 = WAVES[wave], terms = W8.terms(harmonics);
      let x = cx0, y = cy;
      for (const [n, c] of terms) {
        const r = Math.abs(c) * A, ang = n * t + (c < 0 ? Math.PI : 0);
        const nx = x + r * Math.cos(ang), ny = y - r * Math.sin(ang);
        ctx.strokeStyle = 'rgba(240,96,64,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(240,237,230,.8)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        x = nx; y = ny;
      }
      history.unshift(y); if (history.length > W - x0 - 10) history.pop();
      ctx.strokeStyle = 'rgba(240,237,230,.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x0, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(155,133,245,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = 0; i < W - x0 - 10; i++) { const Y = cy - A * W8.target(t - i * dT()); i ? ctx.lineTo(x0 + i, Y) : ctx.moveTo(x0, Y); } ctx.stroke();
      ctx.strokeStyle = '#f06040'; ctx.lineWidth = 2.2; ctx.beginPath(); history.forEach((Y, i) => { i ? ctx.lineTo(x0 + i, Y) : ctx.moveTo(x0, Y); }); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      const ci = document.getElementById('canvas-info'); if (ci) ci.textContent = `Onde ${W8.label} — ${harmonics} harmonique(s) (rouge) · cible (violet)`;
      t += dT(); raf = expRAF(loop);
    }
    loop();
  }
};
EXPS.fourier = { tag: 'Physique · Analyse Harmonique', title: 'Synthèse de Fourier', hint: '', info: '<strong>La série de Fourier</strong> (Joseph Fourier, 1822) montre que toute fonction périodique est une somme infinie de sinusoïdes. En ajoutant des harmoniques impaires (fréquences 1, 3, 5…), on approche progressivement une onde carrée. Plus on ajoute de termes, plus la forme est précise — mais les oscillations de Gibbs persistent aux discontinuités. Ce théorème fonde le traitement du signal, la musique numérique et l\'analyse spectrale.', setup: fourier.setup };

/* ─────────────────────────────────────
   6. WAVE INTERFERENCE
───────────────────────────────────── */
const waves = {
  preview(c, g) {
    const W = c.width, H = c.height, img = g.createImageData(W, H);
    const s1x = W * .35, s1y = H * .5, s2x = W * .65, s2y = H * .5;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d1 = Math.sqrt((x-s1x)**2+(y-s1y)**2), d2 = Math.sqrt((x-s2x)**2+(y-s2y)**2);
      const v = Math.sin(d1*.25)*Math.sin(d2*.25);
      const n = (v+1)/2, idx = (y*W+x)*4;
      img.data[idx] = Math.floor(n*20); img.data[idx+1] = Math.floor(n*130); img.data[idx+2] = Math.floor(n*180); img.data[idx+3] = 255;
    }
    g.putImageData(img, 0, 0);
  },
  setup(canvas, ctx, add) {
    let t = 0, f1 = 1, f2 = 1, sources = [{ x: canvas.width*.35, y: canvas.height*.5 }, { x: canvas.width*.65, y: canvas.height*.5 }];
    canvas.onclick = e => { if (sources.length < 4) { sources.push({ x: e.offsetX / canvas.offsetWidth * canvas.width, y: e.offsetY / canvas.offsetHeight * canvas.height }); } else { sources = sources.slice(1); sources.push({ x: e.offsetX / canvas.offsetWidth * canvas.width, y: e.offsetY / canvas.offsetHeight * canvas.height }); } };
    add('slider', { label: 'Fréq. 1', min: 1, max: 5, val: 1, fn: v => f1 = v });
    add('slider', { label: 'Fréq. 2', min: 1, max: 5, val: 1, fn: v => f2 = v });
    add('btn', { label: 'Reset sources', ghost: true, fn: () => { sources = [{ x: canvas.width*.35, y: canvas.height*.5 }, { x: canvas.width*.65, y: canvas.height*.5 }]; } });
    const img = ctx.createImageData(canvas.width, canvas.height);
    function loop() {
      const W = canvas.width, H = canvas.height, k = .1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let v = 0;
        sources.forEach((s, i) => { const d = Math.sqrt((x-s.x)**2+(y-s.y)**2); v += Math.sin(d*k - t * (i%2===0?f1:f2)); });
        const n = (v/sources.length + 1)/2, idx = (y*W+x)*4;
        img.data[idx] = Math.floor(n*20); img.data[idx+1] = Math.floor(n*140); img.data[idx+2] = Math.floor(n*200); img.data[idx+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      sources.forEach(s => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI*2); ctx.fill(); });
      t += .12; raf = expRAF(loop);
    }
    loop();
  }
};
EXPS.waves = { tag: 'Physique · Optique et Acoustique', title: 'Vagues et Interférence', hint: 'Cliquez pour ajouter des sources (max 4)', info: '<strong>Les interférences</strong> se produisent lorsque deux ou plusieurs ondes se superposent. Les zones brillantes (crêtes + crêtes) sont des interférences constructives ; les zones sombres (crêtes + creux) sont des interférences destructives. Ce principe, expliqué par Huygens et Young (1801), fonde l\'optique ondulatoire, l\'acoustique architecturale, le sonar et les antennes à réseau phasé.', setup: waves.setup };

/* ─────────────────────────────────────
   7. PARTICLES
───────────────────────────────────── */
const particles = {
  preview(c, g) {
    g.fillStyle = '#080810'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(214,63,14,${Math.random()*.7+.2})`; g.beginPath(); g.arc(Math.random()*c.width, Math.random()*c.height, Math.random()*2.5+.5, 0, Math.PI*2); g.fill(); }
  },
  setup(canvas, ctx, add) {
    const W = canvas.width, H = canvas.height, S = .016, EPS2 = 120;
    let pts = [], G = 500, M0 = 0;
    function galaxy() {
      pts = []; M0 = 60; const R = Math.min(W, H) * .42;
      pts.push({ x: W / 2, y: H / 2, vx: 0, vy: 0, m: M0, hue: 45, core: true });
      for (let i = 0; i < 180; i++) {
        const r = 25 + Math.pow(Math.random(), .8) * R, a = Math.random() * Math.PI * 2, m = .3 + Math.random() * 1.2;
        const enc = M0 + 180 * .9 * Math.min(1, (r / R) ** 2), v = Math.sqrt(G * S * enc / Math.sqrt(r * r + EPS2)) * .95;
        pts.push({ x: W / 2 + r * Math.cos(a), y: H / 2 + r * Math.sin(a), vx: -v * Math.sin(a), vy: v * Math.cos(a), m, hue: 10 + Math.random() * 50 });
      }
    }
    function bigBang() { pts = []; M0 = 0; for (let i = 0; i < 200; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * 2.2; pts.push({ x: W / 2 + Math.cos(a) * 4, y: H / 2 + Math.sin(a) * 4, vx: Math.cos(a) * s, vy: Math.sin(a) * s, m: .4 + Math.random() * 1.4, hue: 10 + Math.random() * 50 }); } }
    function spawn(x, y) { for (let i = 0; i < 12; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * 14; pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: 0, vy: 0, m: .5 + Math.random(), hue: 180 + Math.random() * 40 }); } if (pts.length > 320) pts.splice(1, pts.length - 320); }
    galaxy();
    canvas.onclick = e => spawn(e.offsetX / canvas.offsetWidth * W, e.offsetY / canvas.offsetHeight * H);
    add('btn', { label: 'Galaxie', fn: galaxy });
    add('btn', { label: 'Big Bang', ghost: true, fn: bigBang });
    add('slider', { label: 'Gravité', min: 100, max: 1500, val: 500, fn: v => G = v });
    ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
    function loop() {
      const n = pts.length;
      for (let i = 0; i < n; i++) { const p = pts[i]; p.ax = 0; p.ay = 0; }
      for (let i = 0; i < n; i++) { const p = pts[i]; for (let j = i + 1; j < n; j++) { const o = pts[j], dx = o.x - p.x, dy = o.y - p.y, r2 = dx * dx + dy * dy + EPS2, f = G * S / (r2 * Math.sqrt(r2)); p.ax += f * o.m * dx; p.ay += f * o.m * dy; o.ax -= f * p.m * dx; o.ay -= f * p.m * dy; } }
      ctx.fillStyle = 'rgba(8,8,16,.2)'; ctx.fillRect(0, 0, W, H);
      for (const p of pts) {
        if (p.core) { ctx.fillStyle = 'rgba(255,220,120,.25)'; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill(); continue; }
        p.vx += p.ax; p.vy += p.ay; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) { p.vx *= -.6; p.x = Math.max(0, Math.min(W, p.x)); }
        if (p.y < 0 || p.y > H) { p.vy *= -.6; p.y = Math.max(0, Math.min(H, p.y)); }
        ctx.fillStyle = `hsl(${p.hue},85%,62%)`; ctx.beginPath(); ctx.arc(p.x, p.y, .8 + p.m * 1.2, 0, Math.PI * 2); ctx.fill();
      }
      raf = expRAF(loop);
    }
    loop();
  }
};
EXPS.particles = { tag: 'Physique · Mécanique Newtonienne', title: 'Gravité et Particules', hint: 'Cliquez pour ajouter un amas de masse', info: '<strong>La simulation n-corps</strong> calcule l\'attraction gravitationnelle de chaque particule sur toutes les autres (F = Gm₁m₂/r²). Cette méthode exacte, dite de force brute O(n²), est identique aux simulations utilisées pour modéliser la formation des galaxies. À grande échelle, on l\'optimise avec l\'algorithme de Barnes-Hut.', setup: particles.setup };

/* ─────────────────────────────────────
   8. DOUBLE PENDULUM
───────────────────────────────────── */
const pendulum = {
  preview(c, g) {
    g.fillStyle = '#080810'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#5230cc'; g.lineWidth = 1.5;
    const cx = c.width/2, cy = 40;
    [[1,0],[.7,.5],[.3,.9]].forEach(([a,b]) => {
      g.beginPath(); g.moveTo(cx,cy); g.lineTo(cx+Math.sin(a)*60,cy+Math.cos(a)*60);
      g.lineTo(cx+Math.sin(a)*60+Math.sin(b)*50,cy+Math.cos(a)*60+Math.cos(b)*50); g.stroke();
    });
  },
  setup(canvas, ctx, add) {
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, sc = Math.min(H * .23, W * .23);
    let g_ = 9.81, P = [];
    const L1 = 1, L2 = 1, M1 = 1, M2 = 1;
    function deriv([a1, a2, w1, w2]) {
      const d = a1 - a2, den = 2 * M1 + M2 - M2 * Math.cos(2 * d);
      const dw1 = (-g_ * (2 * M1 + M2) * Math.sin(a1) - M2 * g_ * Math.sin(a1 - 2 * a2) - 2 * Math.sin(d) * M2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) / (L1 * den);
      const dw2 = (2 * Math.sin(d) * (w1 * w1 * L1 * (M1 + M2) + g_ * (M1 + M2) * Math.cos(a1) + w2 * w2 * L2 * M2 * Math.cos(d))) / (L2 * den);
      return [w1, w2, dw1, dw2];
    }
    function rk4(s, h) { const k1 = deriv(s), k2 = deriv(s.map((v, i) => v + k1[i] * h / 2)), k3 = deriv(s.map((v, i) => v + k2[i] * h / 2)), k4 = deriv(s.map((v, i) => v + k3[i] * h)); return s.map((v, i) => v + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * h / 6); }
    function reset() { P = [{ s: [2.2, 2.6, 0, 0], trail: [], color: '#9b85f5' }, { s: [2.2 + .001, 2.6, 0, 0], trail: [], color: '#f06040' }]; }
    reset();
    add('btn', { label: 'Reset', fn: reset });
    add('btn', { label: 'Petites oscillations', ghost: true, fn: () => { P = [{ s: [.3, .3, 0, 0], trail: [], color: '#9b85f5' }, { s: [.301, .3, 0, 0], trail: [], color: '#f06040' }]; } });
    add('slider', { label: 'Gravité', min: 1, max: 20, val: 10, fn: v => g_ = v * .981 });
    const pos = s => { const x1 = cx + sc * Math.sin(s[0]), y1 = cy + sc * Math.cos(s[0]); return [x1, y1, x1 + sc * Math.sin(s[1]), y1 + sc * Math.cos(s[1])]; };
    function loop() {
      for (const p of P) { for (let i = 0; i < 8; i++) p.s = rk4(p.s, 1 / 480); const [, , x2, y2] = pos(p.s); p.trail.push(x2, y2); if (p.trail.length > 1200) p.trail.splice(0, 2); }
      ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, W, H);
      for (const p of P) {
        const n = p.trail.length / 2, B = 8;
        for (let k = 0; k < B; k++) { ctx.strokeStyle = p.color; ctx.globalAlpha = (k + 1) / B * .7; ctx.lineWidth = 1.4; ctx.beginPath(); const i0 = Math.floor(k * n / B), i1 = Math.floor((k + 1) * n / B); for (let i = i0; i <= Math.min(n - 1, i1); i++) { const x = p.trail[2 * i], y = p.trail[2 * i + 1]; i === i0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
        ctx.globalAlpha = 1;
        const [x1, y1, x2, y2] = pos(p.s);
        ctx.strokeStyle = 'rgba(240,237,230,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = 'rgba(240,237,230,.9)'; ctx.beginPath(); ctx.arc(x1, y1, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x2, y2, 8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      const d = Math.abs(P[0].s[1] - P[1].s[1]) * 180 / Math.PI, ci = document.getElementById('canvas-info');
      if (ci) ci.textContent = `Écart entre les deux pendules : ${d < .1 ? d.toFixed(4) : d.toFixed(1)}°`;
      raf = expRAF(loop);
    }
    loop();
  }
};
EXPS.pendulum = { tag: 'Physique · Systèmes Chaotiques', title: 'Pendule Double', hint: 'Les deux couleurs représentent des conditions initiales quasi-identiques', info: '<strong>Le pendule double</strong> est l\'exemple le plus pédagogique du chaos déterministe. Les deux pendules (violet et rouge) partagent des conditions initiales différant de 0.001 radian. Leurs trajectoires, d\'abord identiques, divergent exponentiellement — leur séparation croit selon e^(λt), où λ est l\'exposant de Lyapunov. Ce modèle illustre pourquoi les prédictions à long terme sont impossibles en présence de chaos.', setup: pendulum.setup };

/* ─────────────────────────────────────
   9. LORENZ
───────────────────────────────────── */
const lorenz = {
  preview(c, g) {
    g.fillStyle='#080810'; g.fillRect(0,0,c.width,c.height);
    let x=.1,y=0,z=0; g.strokeStyle='#5230cc'; g.lineWidth=.5; g.beginPath(); let f=true;
    for(let i=0;i<8000;i++){const dx=10*(y-x),dy=x*(28-z)-y,dz=x*y-(8/3)*z;x+=dx*.005;y+=dy*.005;z+=dz*.005;const px=(x+25)/50*c.width,py=(z-5)/35*c.height;f?(g.moveTo(px,py),f=false):g.lineTo(px,py);}
    g.stroke();
  },
  setup(canvas, ctx, add) {
    const W=canvas.width,H=canvas.height;
    let sigma=10,rho=28,beta=8/3,dt=.005;
    let p1={x:.1,y:0,z:0},p2={x:.1001,y:0,z:0},step=0;
    function lz(p){return{x:sigma*(p.y-p.x),y:p.x*(rho-p.z)-p.y,z:p.x*p.y-beta*p.z}}
    function int_(p){const d=lz(p);return{x:p.x+d.x*dt,y:p.y+d.y*dt,z:p.z+d.z*dt}}
    const proj=p=>({x:W*.5+p.x*Math.min(W,H*1.8)*.016,y:H*.96-p.z*H*.0185}); // z ∈ [0,50] : tout l'attracteur reste dans le cadre
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
    add('slider',{label:'σ',min:5,max:20,val:10,fn:v=>{sigma=v;ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);step=0;}});
    add('slider',{label:'ρ',min:10,max:50,val:28,fn:v=>{rho=v;ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);step=0;}});
    add('btn',{label:'Reset',ghost:true,fn:()=>{p1={x:.1,y:0,z:0};p2={x:.1001,y:0,z:0};step=0;ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);}});
    function loop(){
      for(let s=0;s<5;s++){
        const n1=int_(p1),n2=int_(p2);
        const a=proj(p1),b=proj(n1),c2=proj(p2),d=proj(n2);
        ctx.strokeStyle='rgba(82,48,204,.55)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        const div=Math.min(1,step/4000);
        ctx.strokeStyle=`rgba(214,${Math.floor(63+div*130)},14,.55)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(c2.x,c2.y);ctx.lineTo(d.x,d.y);ctx.stroke();
        p1=n1;p2=n2;step++;
        if(step>12000){ctx.fillStyle='rgba(8,8,16,.003)';ctx.fillRect(0,0,W,H);}
      }
      raf=expRAF(loop);
    }
    loop();
  }
};
EXPS.lorenz={tag:'Physique · Attracteur Étrange',title:'Attracteur de Lorenz',hint:'Violet et rouge partagent des conditions initiales quasi-identiques',info:'<strong>L\'attracteur de Lorenz</strong> (Edward Lorenz, 1963) est un système de 3 équations différentielles non-linéaires modélisant la convection atmosphérique. Sa solution trace une figure en forme de papillon : les deux "ailes" représentent les deux états possibles du système. Lorenz découvrit qu\'une différence de 0.0001 dans les conditions initiales suffisait à transformer totalement la trajectoire — naissance de la théorie du chaos et de l\'"effet papillon".',setup:lorenz.setup};

/* ─────────────────────────────────────
   10. TURING
───────────────────────────────────── */
const turing = {
  preview(c,g) {
    const W=c.width,H=c.height,img=g.createImageData(W,H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=Math.sin(x*.08)*Math.cos(y*.08)+Math.sin(x*.04+y*.04)*.5;const n=(v+1.5)/3,idx=(y*W+x)*4;img.data[idx]=Math.floor(n*232);img.data[idx+1]=Math.floor(n*180);img.data[idx+2]=Math.floor(n*60);img.data[idx+3]=255;}
    g.putImageData(img,0,0);
  },
  setup(canvas,ctx,add){
    const W=Math.floor(canvas.width/2),H=Math.floor(canvas.height/2);
    let A=new Float32Array(W*H).fill(1),B=new Float32Array(W*H);
    let dA=.2,dB=.1,feed=.055,kill=.062;
    function seed(){A.fill(1);B.fill(0);for(let i=0;i<25;i++){const cx=Math.floor(Math.random()*W),cy=Math.floor(Math.random()*H);for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const idx=((cy+dy+H)%H)*W+((cx+dx+W)%W);B[idx]=1;A[idx]=0;}}}
    seed();
    const NA=new Float32Array(W*H),NB=new Float32Array(W*H);
    const img=ctx.createImageData(canvas.width,canvas.height);
    const lap=(gr,idx,x,y)=>gr[((y-1+H)%H)*W+x]+gr[((y+1)%H)*W+x]+gr[y*W+(x-1+W)%W]+gr[y*W+(x+1)%W]-4*gr[idx];
    const fS=add('slider',{label:'Feed ×1000',min:10,max:80,val:55,fn:v=>feed=v/1000});
    const kS=add('slider',{label:'Kill ×1000',min:40,max:70,val:62,fn:v=>kill=v/1000});
    const setFK=(f,k)=>{feed=f;kill=k;fS.value=Math.round(f*1000);kS.value=Math.round(k*1000);fS.nextSibling.textContent=fS.value;kS.nextSibling.textContent=kS.value;seed()};
    add('btn',{label:'Réensemencer',ghost:true,fn:seed});
    add('btn',{label:'Zèbre (rayures)',ghost:true,fn:()=>setFK(.029,.057)});
    add('btn',{label:'Léopard (taches)',ghost:true,fn:()=>setFK(.035,.065)});
    add('btn',{label:'Corail',ghost:true,fn:()=>setFK(.0545,.062)});
    function loop(){
      for(let s=0;s<14;s++){
        for(let y=0;y<H;y++)for(let x=0;x<W;x++){
          const idx=y*W+x,a=A[idx],b=B[idx],abb=a*b*b;
          NA[idx]=Math.max(0,Math.min(1,a+dA*lap(A,idx,x,y)-abb+feed*(1-a)));
          NB[idx]=Math.max(0,Math.min(1,b+dB*lap(B,idx,x,y)+abb-(kill+feed)*b));
        }
        A.set(NA);B.set(NB);
      }
      const CW=canvas.width,CH=canvas.height;
      for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){
        const sx=Math.floor(x/2),sy=Math.floor(y/2),v=A[sy*W+sx],bv=B[sy*W+sx];
        const idx=(y*CW+x)*4;
        img.data[idx]=Math.floor(v*232);img.data[idx+1]=Math.floor(v*150+bv*50);img.data[idx+2]=Math.floor(v*40+bv*100);img.data[idx+3]=255;
      }
      ctx.putImageData(img,0,0);
      raf=expRAF(loop);
    }
    loop();
  }
};
EXPS.turing={tag:'Biologie · Morphogenèse Chimique',title:'Motifs de Turing (Réaction-Diffusion)',hint:'Les presets Zèbre/Léopard reproduisent les motifs réels',info:'<strong>Alan Turing</strong> (1952) proposa que les motifs biologiques émergent de deux substances chimiques en compétition : un <em>activateur</em> (se stimule localement) et un <em>inhibiteur</em> (le supprime à distance). Ce système "réaction-diffusion" génère spontanément des rayures, des taches et des labyrinthes selon les paramètres Feed (apport d\'activateur) et Kill (élimination de l\'inhibiteur). Des études récentes ont confirmé ce mécanisme dans les doigts de souris et les dents de requins.',setup:turing.setup};

/* ─────────────────────────────────────
   11. SORT
───────────────────────────────────── */
const sort = {
  preview(c,g){
    g.fillStyle='#080810';g.fillRect(0,0,c.width,c.height);
    const N=40,arr=Array.from({length:N},(_,i)=>i+1).sort(()=>Math.random()-.5);
    arr.forEach((v,i)=>{const t=v/N;g.fillStyle=`hsl(${t*60+10},70%,${40+t*30}%)`;g.fillRect(i*(c.width/N),c.height*(1-v/N),c.width/N-1,c.height*v/N);});
  },
  setup(canvas,ctx,add){
    const W=canvas.width,H=canvas.height,N=100;
    const NAMES={bubble:'Bubble Sort',quick:'Quick Sort',merge:'Merge Sort'};
    let arr=shuffle(),algo='bubble',gen=null,ops=0,state='prêt — cliquez sur Lancer';
    function shuffle(){const a=Array.from({length:N},(_,i)=>i+1);for(let i=N-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
    function drawArr(hi=[]){
      ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
      const bw=(W-20)/N;
      arr.forEach((v,i)=>{const t=v/N;ctx.fillStyle=hi.includes(i)?'#fff':`hsl(${t*60+10},70%,${40+t*30}%)`;const bh=(v/N)*H*.9;ctx.fillRect(10+i*bw,H-bh,bw-1,bh);});
    }
    function info(){const ci=document.getElementById('canvas-info');if(ci)ci.textContent=`${NAMES[algo]} — ${state}${ops?` — ${ops.toLocaleString()} opérations`:''}`}
    function*bubbleGen(a){for(let i=0;i<a.length;i++){let swapped=false;for(let j=0;j<a.length-i-1;j++){if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];swapped=true}yield[j,j+1]}if(!swapped)return}}
    function*quickGen(a,lo,hi){if(lo>=hi)return;const piv=a[hi];let i=lo-1;for(let j=lo;j<hi;j++){if(a[j]<=piv){i++;[a[i],a[j]]=[a[j],a[i]]}yield[i,j,hi]}[a[i+1],a[hi]]=[a[hi],a[i+1]];yield[i+1];yield*quickGen(a,lo,i);yield*quickGen(a,i+2,hi)}
    // Tri fusion en place : chaque moitié est triée dans le tableau lui-même avant la fusion
    function*mergeGen(a,lo,hi){if(hi<=lo)return;const m=(lo+hi)>>1;yield*mergeGen(a,lo,m);yield*mergeGen(a,m+1,hi);const L=a.slice(lo,m+1),R=a.slice(m+1,hi+1);let i=0,j=0,k=lo;while(i<L.length&&j<R.length){a[k++]=L[i]<=R[j]?L[i++]:R[j++];yield[k-1]}while(i<L.length){a[k++]=L[i++];yield[k-1]}while(j<R.length){a[k++]=R[j++];yield[k-1]}}
    function start(){arr=shuffle();ops=0;state='en cours…';gen=algo==='bubble'?bubbleGen(arr):algo==='quick'?quickGen(arr,0,N-1):mergeGen(arr,0,N-1);run()}
    function run(){if(!gen)return;let r,last;const perFrame=algo==='bubble'?14:4;for(let s=0;s<perFrame;s++){r=gen.next();if(r.done)break;last=r.value;ops++}if(!r.done){drawArr(last);info();raf=expRAF(run)}else{gen=null;state='trié ✓';drawArr();info()}}
    const btns={};
    function select(a){algo=a;gen=null;ops=0;state='prêt — cliquez sur Lancer';for(const k in btns){btns[k].classList.toggle('ghost',k!==a);btns[k].setAttribute('aria-pressed',String(k===a))}drawArr();info()}
    add('btn',{label:'▶ Lancer',fn:start});
    btns.bubble=add('btn',{label:'Bubble',fn:()=>select('bubble')});
    btns.quick=add('btn',{label:'Quick',ghost:true,fn:()=>select('quick')});
    btns.merge=add('btn',{label:'Merge',ghost:true,fn:()=>select('merge')});
    add('btn',{label:'Mélanger',ghost:true,fn:()=>{gen=null;arr=shuffle();ops=0;state='prêt — cliquez sur Lancer';drawArr();info()}});
    select('bubble');
  }
};
EXPS.sort={tag:'Informatique · Algorithmique',title:'Algorithmes de Tri',hint:'',info:'<strong>Les algorithmes de tri</strong> illustrent des paradigmes fondamentaux : Bubble Sort (O(n²)) compare et échange des éléments adjacents ; Quick Sort (O(n log n) moyen, O(n²) pire cas) divise autour d\'un pivot ; Merge Sort (O(n log n) garanti) fusionne des sous-listes triées. La visualisation révèle leurs "empreintes" caractéristiques : les vagues de Bubble, les strates de Quick, les colonnes de Merge.',setup:sort.setup};

/* ─────────────────────────────────────
   12. LISSAJOUS
───────────────────────────────────── */
const lissajous = {
  preview(c,g){
    g.fillStyle='#080810';g.fillRect(0,0,c.width,c.height);
    g.strokeStyle='#d63f0e';g.lineWidth=1.5;g.beginPath();
    const cx=c.width/2,cy=c.height/2,A=cx*.85,B=cy*.85;
    for(let t=0;t<Math.PI*2*5;t+=.01){const x=cx+A*Math.sin(3*t+Math.PI/4),y=cy+B*Math.sin(2*t);t<.01?g.moveTo(x,y):g.lineTo(x,y);}
    g.stroke();
  },
  setup(canvas,ctx,add){
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,A=W*.42,B=H*.42;
    let fx=3,fy=2,phase=Math.PI/4,speed=3,t=0;
    const gcd=(a,b)=>b?gcd(b,a%b):a;
    const NAMES={'1:1':'unisson','2:1':'octave','3:2':'quinte juste','4:3':'quarte juste','5:4':'tierce majeure','6:5':'tierce mineure','5:3':'sixte majeure','8:5':'sixte mineure','9:8':'seconde majeure','3:1':'douzième','5:2':'dixième majeure'};
    const fxS=add('slider',{label:'Fréq. X',min:1,max:10,val:fx,fn:v=>fx=v});
    const fyS=add('slider',{label:'Fréq. Y',min:1,max:10,val:fy,fn:v=>fy=v});
    const phS=add('slider',{label:'Phase (%)',min:0,max:100,val:12,fn:v=>phase=v/100*Math.PI*2});
    add('slider',{label:'Vitesse',min:1,max:10,val:speed,fn:v=>speed=v});
    const preset=(a,b,p)=>{fx=a;fy=b;phase=p;fxS.value=a;fyS.value=b;phS.value=Math.round(p/(Math.PI*2)*100);[fxS,fyS,phS].forEach(s=>s.nextSibling.textContent=s.value)};
    add('btn',{label:'3:2',ghost:true,fn:()=>preset(3,2,Math.PI/4)});
    add('btn',{label:'5:4',ghost:true,fn:()=>preset(5,4,Math.PI/3)});
    add('btn',{label:'7:3',ghost:true,fn:()=>preset(7,3,Math.PI/2)});
    const P=(u)=>[cx+A*Math.sin(fx*u+phase),cy+B*Math.sin(fy*u)];
    function loop(){
      const g=gcd(fx,fy),period=Math.PI*2/g;
      ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(240,237,230,.16)';ctx.lineWidth=1;ctx.beginPath();
      for(let i=0;i<=1600;i++){const[x,y]=P(i/1600*period);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
      const span=period*.45,BK=20;
      for(let k=0;k<BK;k++){ctx.strokeStyle=`hsl(${15+k*2.5},90%,${40+k*1.6}%)`;ctx.globalAlpha=(k+1)/BK;ctx.lineWidth=.6+k/BK*2.2;ctx.beginPath();for(let j=0;j<=12;j++){const u=t-span+span*(k+j/12)/BK;const[x,y]=P(u);j?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
      ctx.globalAlpha=1;const[x,y]=P(t);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();
      const a=fx/g,b=fy/g,key=Math.max(a,b)+':'+Math.min(a,b),ci=document.getElementById('canvas-info');
      if(ci)ci.textContent=`Rapport ${a}:${b}${NAMES[key]?' — '+NAMES[key]:''}`;
      t+=.006*speed;raf=expRAF(loop);
    }
    loop();
  }
};
EXPS.lissajous={tag:'Mathématiques · Géométrie Harmonique',title:'Courbes de Lissajous',hint:'',info:'<strong>Les figures de Lissajous</strong> (Jules Antoine Lissajous, 1857) sont les trajectoires paramétriques x=A·sin(at+δ), y=B·sin(bt). Quand a/b est rationnel, la courbe est fermée. En musique, les rapports 2:1 (octave), 3:2 (quinte), 4:3 (quarte) correspondent à des consonances précises — les oscilloscopes utilisent ces figures pour accorder des instruments. Une relation directe entre mathématiques, physique et musique.',setup:lissajous.setup};

/* ─────────────────────────────────────
   13. RANDOM WALK
───────────────────────────────────── */
const walk = {
  preview(c,g){
    g.fillStyle='#080810';g.fillRect(0,0,c.width,c.height);
    const N=40,cx=c.width/2,cy=c.height/2;
    for(let i=0;i<N;i++){
      let x=cx,y=cy;g.strokeStyle=`hsl(${i*9},70%,55%)`;g.lineWidth=.6;g.beginPath();g.moveTo(x,y);
      for(let s=0;s<80;s++){const a=Math.random()*Math.PI*2;x+=Math.cos(a)*4;y+=Math.sin(a)*4;g.lineTo(x,y);}g.stroke();
    }
  },
  setup(canvas,ctx,add){
    const W=canvas.width,H=canvas.height,cx=W/2,cy=H*.4;
    let walkers=[],N=400,step=3,n=0;
    function init(){walkers=Array.from({length:N},(_,i)=>({x:cx,y:cy,hue:i/N*300}));n=0;ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H)}
    init();
    add('slider',{label:'Marcheurs',min:50,max:1500,val:N,fn:v=>{N=v;init()}});
    add('slider',{label:'Pas (px)',min:1,max:8,val:step,fn:v=>{step=v;init()}});
    add('btn',{label:'Reset',ghost:true,fn:init});
    const BINS=61,bins=new Float32Array(BINS);
    function loop(){
      ctx.fillStyle='rgba(8,8,16,.06)';ctx.fillRect(0,0,W,H*.72);
      ctx.lineWidth=1;
      for(const w of walkers){const ox=w.x,oy=w.y;for(let s=0;s<3;s++){const a=Math.random()*Math.PI*2;w.x+=Math.cos(a)*step;w.y+=Math.sin(a)*step}if(oy<H*.72){ctx.strokeStyle=`hsla(${w.hue},75%,62%,.55)`;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(w.x,Math.min(w.y,H*.72));ctx.stroke()}}
      n+=3;
      const sigma=step*Math.sqrt(n/2),range=4*Math.max(sigma,step);bins.fill(0);
      for(const w of walkers){const b=Math.floor((w.x-cx+range)/(2*range)*BINS);if(b>=0&&b<BINS)bins[b]++}
      const top=H*.74,hh=H*.24,bw=(W-40)/BINS,peak=N*(2*range/BINS)/(sigma*Math.sqrt(2*Math.PI));
      const scale=hh*.9/Math.max(peak,1);
      ctx.fillStyle='#080810';ctx.fillRect(0,top,W,H-top);
      for(let i=0;i<BINS;i++){const h2=Math.min(hh,bins[i]*scale);ctx.fillStyle='rgba(240,96,64,.85)';ctx.fillRect(20+i*bw,H-h2,bw-1,h2)}
      ctx.strokeStyle='#fff';ctx.lineWidth=1.6;ctx.beginPath();
      for(let i=0;i<=200;i++){const xv=-range+2*range*i/200,g=peak*Math.exp(-xv*xv/(2*sigma*sigma));const X=20+(xv+range)/(2*range)*(W-40),Y=H-Math.min(hh,g*scale);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}ctx.stroke();
      const ci=document.getElementById('canvas-info');if(ci)ci.textContent=`${n} pas — histogramme des positions x (rouge) et loi normale prévue σ = s·√(n/2) = ${sigma.toFixed(0)} px (blanc)`;
      raf=expRAF(loop);
    }
    loop();
  }
};
EXPS.walk={tag:'Mathématiques · Probabilités',title:'Marche Aléatoire et Diffusion',hint:'',info:'<strong>La marche aléatoire</strong> modélise le mouvement brownien (Einstein, 1905), la diffusion moléculaire, les marchés financiers et la dispersion d\'une tache d\'encre dans l\'eau. Malgré le hasard pur de chaque pas, la distribution des positions converge vers une gaussienne (courbe en cloche) — illustration directe du <em>théorème central limite</em>, fondement de toute la statistique.',setup:walk.setup};

/* ─────────────────────────────────────
   14. WOLFRAM RULE 110
───────────────────────────────────── */
const wolfram = {
  preview(c,g){
    g.fillStyle='#080810';g.fillRect(0,0,c.width,c.height);
    const W=c.width,H=c.height,S=2,cols=Math.floor(W/S),rows=Math.floor(H/S);
    let row=new Uint8Array(cols);row[Math.floor(cols/2)]=1;
    const rule110=[0,1,1,1,0,1,1,0];
    for(let r=0;r<rows;r++){
      for(let c2=0;c2<cols;c2++)if(row[c2]){g.fillStyle='#e09030';g.fillRect(c2*S,r*S,S,S);}
      const next=new Uint8Array(cols);
      for(let c2=0;c2<cols;c2++){const l=row[(c2-1+cols)%cols],m=row[c2],ri2=row[(c2+1)%cols];next[c2]=rule110[l*4+m*2+ri2];}
      row=next;
    }
  },
  setup(canvas,ctx,add){
    const W=canvas.width,H=canvas.height;
    let S=2,ruleN=110,currentRow=0;
    const cols=Math.floor(W/S),rows=Math.floor(H/S);
    let row=new Uint8Array(cols),rows_data=[];
    function getRule(n){return Array.from({length:8},(_,i)=>((n>>i)&1));}
    function init(){currentRow=0;rows_data=[];row=new Uint8Array(cols);row[Math.floor(cols/2)]=1;ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);}
    init();
    add('slider',{label:'Règle #',min:0,max:255,val:110,fn:v=>{ruleN=v;init();}});
    add('btn',{label:'Règle 110',ghost:true,fn:()=>{ruleN=110;init();}});
    add('btn',{label:'Règle 90',ghost:true,fn:()=>{ruleN=90;init();}});
    add('btn',{label:'Règle 30',ghost:true,fn:()=>{ruleN=30;init();}});
    add('btn',{label:'Reset',ghost:true,fn:init});
    function loop(){
      if(currentRow>=rows){ctx.fillStyle='rgba(8,8,16,.003)';ctx.fillRect(0,0,W,H);currentRow=0;row=new Uint8Array(cols);row[Math.floor(cols/2)]=1;}
      const rule=getRule(ruleN);
      for(let s=0;s<3;s++){
        for(let c2=0;c2<cols;c2++)if(row[c2]){ctx.fillStyle='#e09030';ctx.fillRect(c2*S,currentRow*S,S,S);}
        const next=new Uint8Array(cols);
        for(let c2=0;c2<cols;c2++){const l=row[(c2-1+cols)%cols],m=row[c2],ri2=row[(c2+1)%cols];next[c2]=rule[l*4+m*2+ri2];}
        row=next;currentRow++;
        if(currentRow>=rows)break;
      }
      document.getElementById('canvas-info')&&(document.getElementById('canvas-info').textContent=`Règle ${ruleN} — génération ${currentRow}`);
      raf=expRAF(loop);
    }
    loop();
  }
};
EXPS.wolfram={tag:'Informatique · Automates 1D de Wolfram',title:'Automate Cellulaire — Règle 110',hint:'Chaque ligne = une génération. Gauche → droite : temps',info:'<strong>Les automates cellulaires élémentaires</strong> (Stephen Wolfram, 1983) sont des rangées de cellules binaires évoluant selon 256 règles possibles (8 voisinages possibles → 2^8 = 256 règles). La <em>Règle 110</em> a été prouvée Turing-complète en 2004 : elle peut simuler n\'importe quel calcul. La Règle 30 est utilisée comme générateur pseudo-aléatoire dans Mathematica. La Règle 90 produit le triangle de Sierpinski.',setup:wolfram.setup};

// Aperçus des 14 premières expériences (définis sur les objets ci-dessus)
[['mandelbrot', mandelbrot], ['julia', julia], ['conway', conway], ['langton', langton], ['fourier', fourier], ['waves', waves], ['particles', particles], ['pendulum', pendulum], ['lorenz', lorenz], ['turing', turing], ['sort', sort], ['lissajous', lissajous], ['walk', walk], ['wolfram', wolfram]]
  .forEach(([id, o]) => { EXPS[id].preview = o.preview.bind(o); });
