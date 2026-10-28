export const Celebrate = {
  run() {
    // Banner
    const banner = document.createElement('div');
    banner.className = 'celebrate-banner';
    banner.textContent = '🎉 Congratulations on the offer!';
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.remove();
    }, 3200);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Confetti canvas
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3000';
    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    document.body.appendChild(cv);

    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const colors = ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#facc15', '#14b8a6'];
    const bits = Array.from({ length: 170 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
    }));

    const t0 = performance.now();
    function frame(now: number) {
      if (!ctx) return;
      const t = now - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = t > 2600 ? Math.max(0, 1 - (t - 2600) / 600) : 1;
      bits.forEach((b) => {
        b.vy += 0.35;
        b.vx *= 0.99;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      });
      if (t < 3200) {
        requestAnimationFrame(frame);
      } else {
        cv.remove();
      }
    }
    requestAnimationFrame(frame);
  },
};
