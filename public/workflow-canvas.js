(() => {
  const canvases = [...document.querySelectorAll('[data-process-art]')];
  if (!canvases.length) return;

  const pale = '#e8f5ff';
  const blue = '#82c8f5';
  const muted = '#5d91b8';
  const green = '#8ce1c6';

  function line(ctx, points, color = blue, width = 2, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash(dash);
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function box(ctx, x, y, width, height, radius = 8, fill = 'rgba(12, 39, 64, .82)', stroke = muted) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function circle(ctx, x, y, radius, fill = null, stroke = blue, width = 2) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
  }

  function label(ctx, value, x, y, color = blue, size = 10) {
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px "DM Mono", monospace`;
    ctx.letterSpacing = '1.3px';
    ctx.fillText(value, x, y);
  }

  function check(ctx, x, y, size = 13, color = green) {
    line(ctx, [[x, y + size * .5], [x + size * .35, y + size], [x + size, y]], color, 3);
  }

  function backdrop(ctx, title, number) {
    const gradient = ctx.createLinearGradient(0, 0, 520, 220);
    gradient.addColorStop(0, '#1b486c');
    gradient.addColorStop(1, '#102c47');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 520, 220);
    ctx.strokeStyle = 'rgba(154, 207, 245, .09)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 520; x += 26) line(ctx, [[x, 0], [x, 220]], 'rgba(154, 207, 245, .09)', 1);
    for (let y = 0; y <= 220; y += 26) line(ctx, [[0, y], [520, y]], 'rgba(154, 207, 245, .09)', 1);
    label(ctx, `LABASS / ${title}`, 23, 29, '#b7d8ef', 10);
    label(ctx, number, 466, 29, '#b7d8ef', 10);
    line(ctx, [[23, 38], [497, 38]], 'rgba(154, 207, 245, .34)', 1);
    line(ctx, [[23, 200], [497, 200]], 'rgba(154, 207, 245, .34)', 1);
    circle(ctx, 29, 207, 2, blue, null);
    circle(ctx, 491, 207, 2, blue, null);
  }

  function assess(ctx) {
    backdrop(ctx, 'FIELD ASSESSMENT', '01');
    box(ctx, 69, 58, 259, 124, 4, 'rgba(10, 39, 65, .42)', '#a9d4f1');
    line(ctx, [[91, 59], [91, 111], [163, 111], [163, 59]], blue, 2);
    line(ctx, [[91, 131], [91, 182], [203, 182], [203, 132]], blue, 2);
    line(ctx, [[183, 59], [183, 111], [328, 111]], blue, 2);
    line(ctx, [[222, 111], [222, 182]], blue, 2);
    line(ctx, [[107, 95], [144, 95]], muted, 2);
    line(ctx, [[112, 149], [154, 149]], muted, 2);
    line(ctx, [[245, 80], [301, 80]], muted, 2);
    line(ctx, [[255, 156], [302, 156]], muted, 2);
    line(ctx, [[132, 148], [178, 148], [178, 126], [250, 126], [277, 105]], green, 2, [4, 5]);
    circle(ctx, 132, 148, 5, green, null);
    circle(ctx, 277, 105, 21, '#163e5d', pale, 2);
    circle(ctx, 277, 105, 8, blue, null);
    box(ctx, 358, 72, 106, 97, 8, '#103550', '#76aed3');
    label(ctx, 'SITE NOTES', 371, 92, pale, 9);
    [109, 128, 147].forEach((y, i) => {
      circle(ctx, 374, y - 3, 3, i === 2 ? green : blue, null);
      line(ctx, [[385, y - 3], [i === 1 ? 437 : 448, y - 3]], '#6fadd3', 2);
    });
  }

  function plan(ctx) {
    backdrop(ctx, 'SCOPE + PRICING', '02');
    box(ctx, 121, 57, 210, 130, 5, 'rgba(12, 47, 76, .6)', '#5d91b8');
    box(ctx, 145, 48, 222, 144, 5, '#163e5e', '#a9d4f1');
    label(ctx, 'PROJECT SCOPE', 162, 70, pale, 10);
    line(ctx, [[162, 80], [350, 80]], '#6fadd3', 1);
    [99, 123, 147].forEach((y, i) => {
      box(ctx, 163, y - 9, 14, 14, 3, 'rgba(77, 139, 181, .25)', '#7ebee9');
      check(ctx, 165, y - 7, 10);
      line(ctx, [[190, y - 2], [i === 1 ? 300 : 326, y - 2]], '#9fcbed', 2);
      line(ctx, [[190, y + 5], [i === 2 ? 268 : 285, y + 5]], muted, 1);
    });
    box(ctx, 280, 163, 70, 18, 3, 'rgba(140, 225, 198, .13)', green);
    label(ctx, 'FIXED', 291, 176, green, 9);
    line(ctx, [[395, 72], [439, 72], [439, 153], [395, 153], [395, 72]], muted, 2);
    [84, 98, 112, 126, 140].forEach((y, i) => line(ctx, [[403, y], [i % 2 ? 416 : 425, y]], blue, 2));
    circle(ctx, 417, 175, 12, '#153a58', pale, 2);
    check(ctx, 411, 170, 12);
  }

  function build(ctx) {
    backdrop(ctx, 'SYSTEM INSTALL', '03');
    box(ctx, 176, 49, 172, 145, 6, '#102d49', '#a9d4f1');
    [0, 1, 2, 3].forEach((i) => {
      const y = 65 + i * 29;
      box(ctx, 188, y, 148, 23, 3, '#194a6e', '#6a9ec3');
      circle(ctx, 203, y + 11, 3, i === 3 ? green : blue, null);
      [265, 277, 289, 301, 313].forEach((x, j) => box(ctx, x, y + 7, 7, 8, 1, j === i ? green : '#8fb8d7', null));
    });
    line(ctx, [[81, 77], [132, 77], [132, 103], [188, 103]], blue, 3);
    line(ctx, [[81, 102], [113, 102], [113, 132], [188, 132]], green, 3);
    line(ctx, [[81, 127], [99, 127], [99, 161], [188, 161]], pale, 3);
    [77, 102, 127].forEach((y) => circle(ctx, 80, y, 4, '#153a58', pale, 2));
    circle(ctx, 401, 105, 19, '#143d5c', pale, 2);
    circle(ctx, 401, 105, 5, green, null);
    line(ctx, [[348, 104], [382, 104]], blue, 2, [5, 4]);
    line(ctx, [[420, 105], [449, 105], [449, 144]], blue, 2, [5, 4]);
    box(ctx, 429, 144, 40, 29, 4, '#194a6e', '#8fb8d7');
    label(ctx, 'ID', 442, 162, pale, 10);
  }

  function verify(ctx) {
    backdrop(ctx, 'TEST + HANDOFF', '04');
    box(ctx, 101, 53, 219, 139, 6, '#153c5b', '#a9d4f1');
    box(ctx, 116, 68, 188, 105, 3, 'rgba(8, 35, 58, .45)', '#6a9ec3');
    label(ctx, 'SYSTEM CHECK', 131, 86, pale, 10);
    [104, 127, 150].forEach((y, i) => {
      circle(ctx, 139, y, 8, 'rgba(140, 225, 198, .11)', green, 2);
      check(ctx, 134, y - 5, 10);
      line(ctx, [[158, y - 3], [i === 1 ? 260 : 277, y - 3]], '#a1cce9', 2);
      line(ctx, [[158, y + 4], [i === 2 ? 228 : 243, y + 4]], muted, 1);
    });
    line(ctx, [[320, 112], [357, 112]], blue, 2, [5, 5]);
    circle(ctx, 401, 112, 44, '#174a68', '#9bd7f8', 3);
    circle(ctx, 401, 112, 32, '#103753', 'rgba(155, 215, 248, .4)', 1);
    check(ctx, 379, 97, 43, green);
    label(ctx, 'VERIFIED', 373, 175, green, 10);
  }

  const scenes = { assess, plan, build, verify };
  function draw(canvas) {
    const width = canvas.getBoundingClientRect().width;
    if (!width) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(width * pixelRatio * 220 / 520);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(canvas.width / 520, 0, 0, canvas.height / 220, 0, 0);
    scenes[canvas.dataset.processArt]?.(ctx);
  }

  let resizeFrame = 0;
  function drawAll() { canvases.forEach(draw); }
  drawAll();
  document.fonts?.ready.then(drawAll);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(drawAll);
  }, { passive: true });
})();
