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
    let grid = rand(), running = false, interval = 80;
    function rand() { return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < .25 ? 1 : 0)); }
    function empty() { return Array.from({ length: rows }, () => new Array(cols).fill(0)); }
    canvas.onclick = e => { const col = Math.min(cols - 1, Math.floor(e.offsetX / canvas.offsetWidth * cols)), row = Math.min(rows - 1, Math.floor(e.offsetY / canvas.offsetHeight * rows)); grid[row][col] ^= 1; draw(); };
    const playBtn = add('btn', { label: '▶ Play', fn: () => { running = !running; playBtn.textContent = running ? '⏸ Pause' : '▶ Play'; if (running) loop(); } });
    add('btn', { label: 'Reset', ghost: true, fn: () => { grid = rand(); draw(); } });
    add('btn', { label: 'Vider', ghost: true, fn: () => { grid = empty(); draw(); } });
    add('btn', { label: 'Glider', ghost: true, fn: () => { grid = empty(); [[1,0],[2,1],[0,2],[1,2],[2,2]].forEach(([dc,dr]) => { grid[10+dr][10+dc] = 1; }); draw(); } });
    add('btn', { label: 'Pulsar', ghost: true, fn: () => { grid = empty(); const p=[[2,4],[3,4],[4,4],[8,4],[9,4],[10,4],[2,9],[3,9],[4,9],[8,9],[9,9],[10,9],[2,14],[3,14],[4,14],[8,14],[9,14],[10,14]]; p.forEach(([r,c])=>{ if(r<rows&&c<cols) grid[r][c]=1; }); draw(); } });
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
    draw();
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
    let ax = Math.floor(cols / 2), ay = Math.floor(rows / 2), dir = 0, running = false, steps = 0, speed = 100;
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
    const playBtn = add('btn', { label: '▶ Play', fn: () => { running = !running; playBtn.textContent = running ? '⏸ Pause' : '▶ Play'; if (running) loop(); } });
    add('btn', { label: 'Reset', ghost: true, fn: () => { grid.fill(0); ax = Math.floor(cols/2); ay = Math.floor(rows/2); dir = 0; steps = 0; draw(); } });
    add('btn', { label: '+1000 étapes', ghost: true, fn: () => { step(1000); draw(); } });
    add('slider', { label: 'Vitesse', min: 1, max: 50, val: 10, fn: v => speed = v });
    function loop() { if (!running) return; step(speed); draw(); raf = expRAF(loop); }
    draw();
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
    let harmonics = 7, speed = .6, t = 0; const history = [];
    add('slider', { label: 'Harmoniques', min: 1, max: 25, val: harmonics, fn: v => { harmonics = v; history.length = 0; } });
    add('slider', { label: 'Vitesse', min: 1, max: 10, val: 3, fn: v => speed = v * .2 });
    function loop() {
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = 'rgba(8,8,16,.12)'; ctx.fillRect(0, 0, W, H);
      let cx = W * .22, cy = H / 2;
      for (let k = 0; k < harmonics; k++) {
        const n = 2 * k + 1, r = (4 / Math.PI) * (1 / n) * H * .35;
        const angle = n * t * speed;
        const nx = cx + r * Math.cos(angle), ny = cy + r * Math.sin(angle);
        ctx.strokeStyle = `rgba(214,63,14,${.55 - k * .015})`; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(214,63,14,.8)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
        cx = nx; cy = ny;
      }
      history.unshift(cy); if (history.length > W * .6) history.pop();
      ctx.strokeStyle = 'rgba(240,237,230,.2)'; ctx.lineWidth = .5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(W * .38, history[0]); ctx.stroke();
      ctx.strokeStyle = '#d63f0e'; ctx.lineWidth = 2; ctx.beginPath();
      history.forEach((y, i) => { const x = W * .38 + i; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
      t += .016; raf = expRAF(loop);
    }
    ctx.fillStyle = '#080810'; ctx.fillRect(0, 0, canvas.width, canvas.height); loop();
  }
};
EXPS.fourier = { tag: 'Physique · Analyse Harmonique', title: 'Synthèse de Fourier', hint: 'Augmentez les harmoniques pour approcher une onde carrée parfaite', info: '<strong>La série de Fourier</strong> (Joseph Fourier, 1822) montre que toute fonction périodique est une somme infinie de sinusoïdes. En ajoutant des harmoniques impaires (fréquences 1, 3, 5…), on approche progressivement une onde carrée. Plus on ajoute de termes, plus la forme est précise — mais les oscillations de Gibbs persistent aux discontinuités. Ce théorème fonde le traitement du signal, la musique numérique et l\'analyse spectrale.', setup: fourier.setup };

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
    const W = canvas.width, H = canvas.height;
    let pts = [], G = 500;
    function spawn(x, y, n=5) { for (let i=0;i<n;i++) { const a=Math.random()*Math.PI*2, s=Math.random()*.6; pts.push({x:x+Math.random()*12-6,y:y+Math.random()*12-6,vx:Math.cos(a)*s,vy:Math.sin(a)*s,m:Math.random()*2+.5,hue:Math.random()*60+10}); } }
    for (let i=0;i<80;i++) spawn(W/2+Math.random()*180-90,H/2+Math.random()*180-90,1);
    canvas.onclick = e => spawn(e.offsetX/canvas.offsetWidth*W,e.offsetY/canvas.offsetHeight*H,8);
    add('btn', { label: 'Big Bang', fn: () => { pts=[]; for(let i=0;i<120;i++) spawn(W/2+Math.random()*20-10,H/2+Math.random()*20-10,1); } });
    add('btn', { label: 'Reset', ghost: true, fn: () => { pts=[]; for(let i=0;i<80;i++) spawn(W/2+Math.random()*180-90,H/2+Math.random()*180-90,1); } });
    add('slider', { label: 'Gravité', min: 100, max: 2000, val: 500, fn: v => G=v });
    function loop() {
      ctx.fillStyle = 'rgba(8,8,16,.14)'; ctx.fillRect(0,0,W,H);
      for (let i=0;i<pts.length;i++) {
        let ax=0,ay=0;
        for (let j=0;j<pts.length;j++) { if(i===j) continue; const dx=pts[j].x-pts[i].x,dy=pts[j].y-pts[i].y,d=Math.max(Math.sqrt(dx*dx+dy*dy),5),f=G*pts[j].m/(d*d); ax+=f*dx/d; ay+=f*dy/d; }
        pts[i].vx=(pts[i].vx+ax*.016)*.985; pts[i].vy=(pts[i].vy+ay*.016)*.985;
        pts[i].x+=pts[i].vx; pts[i].y+=pts[i].vy;
        if(pts[i].x<0)pts[i].x=W; if(pts[i].x>W)pts[i].x=0;
        if(pts[i].y<0)pts[i].y=H; if(pts[i].y>H)pts[i].y=0;
        ctx.fillStyle=`hsl(${pts[i].hue},80%,60%)`; ctx.beginPath(); ctx.arc(pts[i].x,pts[i].y,pts[i].m*1.4,0,Math.PI*2); ctx.fill();
      }
      if(pts.length>250) pts=pts.slice(-250);
      raf = expRAF(loop);
    }
    ctx.fillStyle='#080810'; ctx.fillRect(0,0,W,H); loop();
  }
};
EXPS.particles = { tag: 'Physique · Mécanique Newtonienne', title: 'Gravité et Particules', hint: 'Cliquez sur le canvas pour ajouter un amas de masse', info: '<strong>La simulation n-corps</strong> calcule l\'attraction gravitationnelle de chaque particule sur toutes les autres (F = Gm₁m₂/r²). Cette méthode exacte, dite de force brute O(n²), est identique aux simulations utilisées pour modéliser la formation des galaxies. À grande échelle, on l\'optimise avec l\'algorithme de Barnes-Hut.', setup: particles.setup };

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
    const W = canvas.width, H = canvas.height;
    let L1=H*.28,L2=H*.22,M1=10,M2=8,g_=9.81,dt=.016;
    let pends = [
      {a1:Math.PI/2,a2:Math.PI/2,v1:0,v2:0,trail:[],color:'#5230cc'},
      {a1:Math.PI/2+.001,a2:Math.PI/2,v1:0,v2:0,trail:[],color:'#d63f0e'}
    ];
    function step(p) {
      const num1=-(g_*(2*M1+M2)*Math.sin(p.a1)-M2*g_*Math.sin(p.a1-2*p.a2)-2*Math.sin(p.a1-p.a2)*M2*(p.v2*p.v2*L2+p.v1*p.v1*L1*Math.cos(p.a1-p.a2)));
      const den1=L1*(2*M1+M2-M2*Math.cos(2*p.a1-2*p.a2));
      const num2=2*Math.sin(p.a1-p.a2)*((M1+M2)*p.v1*p.v1*L1+g_*(M1+M2)*Math.cos(p.a1)+M2*p.v2*p.v2*L2*Math.cos(p.a1-p.a2));
      const den2=L2*(2*M1+M2-M2*Math.cos(2*p.a1-2*p.a2));
      p.v1+=dt*(num1/den1); p.v2+=dt*(num2/den2); p.a1+=dt*p.v1; p.a2+=dt*p.v2;
    }
    const cx=W/2,cy=H*.22;
    function loop() {
      ctx.fillStyle='rgba(8,8,16,.08)'; ctx.fillRect(0,0,W,H);
      pends.forEach(p => {
        for(let i=0;i<3;i++) step(p);
        const x1=cx+L1*Math.sin(p.a1),y1=cy+L1*Math.cos(p.a1);
        const x2=x1+L2*Math.sin(p.a2),y2=y1+L2*Math.cos(p.a2);
        p.trail.push({x:x2,y:y2}); if(p.trail.length>800) p.trail.shift();
        if(p.trail.length>1){
          ctx.strokeStyle=p.color; ctx.lineWidth=0.8; ctx.beginPath();
          p.trail.forEach(({x,y},i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)); ctx.stroke();
        }
        ctx.strokeStyle='rgba(240,237,230,.4)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.fillStyle='rgba(240,237,230,.8)'; ctx.beginPath(); ctx.arc(x1,y1,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(x2,y2,7,0,Math.PI*2); ctx.fill();
      });
      raf = expRAF(loop);
    }
    add('btn', { label: 'Reset', fn: () => { pends = [{a1:Math.PI/2,a2:Math.PI/2,v1:0,v2:0,trail:[],color:'#5230cc'},{a1:Math.PI/2+.001,a2:Math.PI/2,v1:0,v2:0,trail:[],color:'#d63f0e'}]; } });
    add('slider', { label: 'Gravité', min: 1, max: 20, val: 9, fn: v => g_=v });
    ctx.fillStyle='#080810'; ctx.fillRect(0,0,W,H); loop();
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
    let dA=1.0,dB=.5,feed=.055,kill=.062;
    function seed(){A.fill(1);B.fill(0);for(let i=0;i<25;i++){const cx=Math.floor(Math.random()*W),cy=Math.floor(Math.random()*H);for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const idx=((cy+dy+H)%H)*W+((cx+dx+W)%W);B[idx]=1;A[idx]=0;}}}
    seed();
    const NA=new Float32Array(W*H),NB=new Float32Array(W*H);
    const img=ctx.createImageData(canvas.width,canvas.height);
    const lap=(gr,idx,x,y)=>gr[((y-1+H)%H)*W+x]+gr[((y+1)%H)*W+x]+gr[y*W+(x-1+W)%W]+gr[y*W+(x+1)%W]-4*gr[idx];
    add('slider',{label:'Feed',min:1,max:10,val:5,fn:v=>feed=v*.011});
    add('slider',{label:'Kill',min:1,max:10,val:6,fn:v=>kill=v*.010+.05});
    add('btn',{label:'Réensemencer',ghost:true,fn:seed});
    add('btn',{label:'Preset Zèbre',ghost:true,fn:()=>{feed=.037;kill=.06;seed();}});
    add('btn',{label:'Preset Léopard',ghost:true,fn:()=>{feed=.04;kill=.067;seed();}});
    function loop(){
      for(let s=0;s<8;s++){
        for(let y=0;y<H;y++)for(let x=0;x<W;x++){
          const idx=y*W+x,a=A[idx],b=B[idx],abb=a*b*b;
          NA[idx]=Math.max(0,Math.min(1,a+(dA*lap(A,idx,x,y)-abb+feed*(1-a))*.5));
          NB[idx]=Math.max(0,Math.min(1,b+(dB*lap(B,idx,x,y)+abb-(kill+feed)*b)*.5));
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
    let arr=shuffle(),algo='bubble',running=false,gen=null;
    function shuffle(){return Array.from({length:N},(_,i)=>i+1).sort(()=>Math.random()-.5);}
    function drawArr(a,hi=[]){
      ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);
      const bw=(W-20)/N;
      a.forEach((v,i)=>{const t=v/N;ctx.fillStyle=hi.includes(i)?'#fff':`hsl(${t*60+10},70%,${40+t*30}%)`;const bh=(v/N)*H*.9;ctx.fillRect(10+i*bw,H-bh,bw-1,bh);});
    }
    function*bubbleGen(a){for(let i=0;i<a.length;i++)for(let j=0;j<a.length-i-1;j++){if(a[j]>a[j+1])[a[j],a[j+1]]=[a[j+1],a[j]];yield{a:[...a],hi:[j,j+1]};}}
    function*quickGen(a,lo,hi){if(lo>=hi)return;let piv=a[hi],i=lo-1;for(let j=lo;j<hi;j++){if(a[j]<=piv){i++;[a[i],a[j]]=[a[j],a[i]];}yield{a:[...a],hi:[i,j,hi]};}[a[i+1],a[hi]]=[a[hi],a[i+1]];yield{a:[...a],hi:[i+1]};yield*quickGen(a,lo,i);yield*quickGen(a,i+2,hi);}
    function*mergeGen(a,s=0){if(a.length<=1)return;const m=Math.floor(a.length/2),L=a.slice(0,m),R=a.slice(m);yield*mergeGen(L,s);yield*mergeGen(R,s+m);let i=0,j=0,k=s;while(i<L.length&&j<R.length){if(L[i]<=R[j])arr[k]=L[i++];else arr[k]=R[j++];k++;yield{a:[...arr],hi:[k-1]};}while(i<L.length){arr[k++]=L[i++];yield{a:[...arr],hi:[k-1]};}while(j<R.length){arr[k++]=R[j++];yield{a:[...arr],hi:[k-1]};}}
    add('btn',{label:'▶ Lancer',fn:()=>{if(running)return;arr=shuffle();running=true;const a=[...arr];gen=algo==='bubble'?bubbleGen(a):algo==='quick'?quickGen(a,0,N-1):mergeGen(a);run();}});
    add('btn',{label:'Bubble',ghost:true,fn:()=>algo='bubble'});
    add('btn',{label:'Quick',ghost:true,fn:()=>algo='quick'});
    add('btn',{label:'Merge',ghost:true,fn:()=>algo='merge'});
    add('btn',{label:'Mélanger',ghost:true,fn:()=>{arr=shuffle();drawArr(arr);}});
    function run(){if(!gen)return;let r;for(let s=0;s<4;s++)r=gen.next();if(!r.done){drawArr(r.value.a,r.value.hi||[]);raf=expRAF(run);}else{running=false;drawArr(arr);}}
    drawArr(arr);
  }
};
EXPS.sort={tag:'Informatique · Algorithmique',title:'Algorithmes de Tri',hint:'Choisissez un algorithme puis cliquez Lancer',info:'<strong>Les algorithmes de tri</strong> illustrent des paradigmes fondamentaux : Bubble Sort (O(n²)) compare et échange des éléments adjacents ; Quick Sort (O(n log n) moyen, O(n²) pire cas) divise autour d\'un pivot ; Merge Sort (O(n log n) garanti) fusionne des sous-listes triées. La visualisation révèle leurs "empreintes" caractéristiques : les vagues de Bubble, les strates de Quick, les colonnes de Merge.',setup:sort.setup};

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
    const W=canvas.width,H=canvas.height;
    let fx=3,fy=2,phase=Math.PI/4,speed=1,trail=[],t=0;
    add('slider',{label:'Fréq. X',min:1,max:10,val:fx,fn:v=>{fx=v;trail=[];}});
    add('slider',{label:'Fréq. Y',min:1,max:10,val:fy,fn:v=>{fy=v;trail=[];}});
    add('slider',{label:'Phase',min:0,max:100,val:25,fn:v=>{phase=v/100*Math.PI*2;trail=[];}});
    add('btn',{label:'3:2',ghost:true,fn:()=>{fx=3;fy=2;phase=Math.PI/4;trail=[];}});
    add('btn',{label:'5:4',ghost:true,fn:()=>{fx=5;fy=4;phase=Math.PI/3;trail=[];}});
    add('btn',{label:'7:3',ghost:true,fn:()=>{fx=7;fy=3;phase=Math.PI/2;trail=[];}});
    function loop(){
      ctx.fillStyle='rgba(8,8,16,.06)';ctx.fillRect(0,0,W,H);
      const A=W*.42,B=H*.42,cx=W/2,cy=H/2;
      t+=.012*speed;
      const x=cx+A*Math.sin(fx*t+phase),y=cy+B*Math.sin(fy*t);
      trail.push({x,y});if(trail.length>1200)trail.shift();
      if(trail.length>1){
        ctx.beginPath();
        trail.forEach(({x:px,y:py},i)=>{const a=i/trail.length;ctx.strokeStyle=`hsl(${a*60+10},85%,${50+a*20}%)`;ctx.lineWidth=a*2;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});
        ctx.stroke();
      }
      ctx.fillStyle='white';ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
      raf=expRAF(loop);
    }
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);loop();
  }
};
EXPS.lissajous={tag:'Mathématiques · Géométrie Harmonique',title:'Courbes de Lissajous',hint:'Modifiez les fréquences pour changer la figure',info:'<strong>Les figures de Lissajous</strong> (Jules Antoine Lissajous, 1857) sont les trajectoires paramétriques x=A·sin(at+δ), y=B·sin(bt). Quand a/b est rationnel, la courbe est fermée. En musique, les rapports 2:1 (octave), 3:2 (quinte), 4:3 (quarte) correspondent à des consonances précises — les oscilloscopes utilisent ces figures pour accorder des instruments. Une relation directe entre mathématiques, physique et musique.',setup:lissajous.setup};

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
    const W=canvas.width,H=canvas.height;
    let walkers=[],N=80,step=3,running=true;
    function init(){walkers=Array.from({length:N},(_,i)=>({x:W/2,y:H/2,trail:[],hue:i*4.5}));}
    init();
    add('slider',{label:'Marcheurs',min:10,max:200,val:80,fn:v=>{N=v;init();}});
    add('slider',{label:'Pas',min:1,max:10,val:3,fn:v=>step=v});
    add('btn',{label:'Reset',ghost:true,fn:()=>{init();ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);}});
    function loop(){
      ctx.fillStyle='rgba(8,8,16,.04)';ctx.fillRect(0,0,W,H);
      walkers.forEach(w=>{
        const a=Math.random()*Math.PI*2;
        w.x+=Math.cos(a)*step;w.y+=Math.sin(a)*step;
        if(w.x<0)w.x=W;if(w.x>W)w.x=0;if(w.y<0)w.y=H;if(w.y>H)w.y=0;
        w.trail.push({x:w.x,y:w.y});if(w.trail.length>150)w.trail.shift();
        if(w.trail.length>1){
          const last=w.trail.length-1;
          ctx.strokeStyle=`hsla(${w.hue},70%,60%,.5)`;ctx.lineWidth=.8;
          ctx.beginPath();ctx.moveTo(w.trail[last-1].x,w.trail[last-1].y);ctx.lineTo(w.x,w.y);ctx.stroke();
        }
      });
      // Distribution histogram
      const bins=new Array(20).fill(0);
      walkers.forEach(w=>{const b=Math.min(19,Math.floor((w.x/W)*20));bins[b]++;});
      const maxB=Math.max(...bins);
      bins.forEach((b,i)=>{
        const bh=(b/maxB)*H*.2;
        ctx.fillStyle=`rgba(214,63,14,.4)`;
        ctx.fillRect(i*(W/20),H-bh,W/20-1,bh);
      });
      raf=expRAF(loop);
    }
    ctx.fillStyle='#080810';ctx.fillRect(0,0,W,H);loop();
  }
};
EXPS.walk={tag:'Mathématiques · Probabilités',title:'Marche Aléatoire et Diffusion',hint:'L\'histogramme rouge montre la distribution émergente',info:'<strong>La marche aléatoire</strong> modélise le mouvement brownien (Einstein, 1905), la diffusion moléculaire, les marchés financiers et la dispersion d\'une tache d\'encre dans l\'eau. Malgré le hasard pur de chaque pas, la distribution des positions converge vers une gaussienne (courbe en cloche) — illustration directe du <em>théorème central limite</em>, fondement de toute la statistique.',setup:walk.setup};

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
