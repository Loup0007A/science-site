// Page 404 : même réseau de points que l'accueil (en pause si l'utilisateur limite les animations).
(function () {
  // Les routes de l'application (/experience/…, /categorie/…) sont réécrites vers index.html par _redirects.
  // Si un ancien lien arrive malgré tout ici, on le confie au routeur de l'accueil.
  var path = location.pathname;
  if (/^\/(experience|categorie)\/[\w-]+\/?$/.test(path)) {
    try { sessionStorage.setItem('redirect', path); } catch (e) { /* ignoré */ }
    location.replace('/');
    return;
  }
  var c = document.getElementById('c'), g = c.getContext('2d'), pts = [];
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, running = false;
  function resize() { c.width = innerWidth; c.height = innerHeight; }
  resize(); addEventListener('resize', resize, { passive: true });
  for (var i = 0; i < 60; i++) pts.push({ x: Math.random() * c.width, y: Math.random() * c.height, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 });
  function draw() {
    g.clearRect(0, 0, c.width, c.height);
    pts.forEach(function (p) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > c.width) p.vx *= -1; if (p.y < 0 || p.y > c.height) p.vy *= -1; });
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i];
      for (var j = i + 1; j < pts.length; j++) {
        var b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) { g.strokeStyle = 'rgba(17,16,16,' + (1 - d / 100) * .3 + ')'; g.lineWidth = .5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
      }
      g.fillStyle = 'rgba(17,16,16,.4)'; g.beginPath(); g.arc(a.x, a.y, 1.5, 0, Math.PI * 2); g.fill();
    }
    running = !still && !document.hidden;
    if (running) requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !still && !running) draw(); });
  draw();
})();
