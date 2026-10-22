/* Motion layer: section fade-ins, hero intro, counters, 3D card tilt.
   Only transform/opacity are animated (GPU-composited), every observer
   unobserves after firing, and everything is skipped for reduced motion. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document.documentElement;
  if (!reduce && "IntersectionObserver" in window) doc.classList.add("motion");

  document.addEventListener("DOMContentLoaded", () => {
    if (!doc.classList.contains("motion")) return;

    /* Hero intro: one orchestrated sequence on load */
    const hero = document.querySelector("[data-hero]");
    if (hero) {
      const go = () => requestAnimationFrame(() => hero.classList.add("hero-in"));
      const im = hero.querySelector(".hero-img");
      if (im && !im.complete) { im.addEventListener("load", go, { once: true }); setTimeout(go, 600); } else go();
    }

    /* Section fade-ins: tag blocks automatically so every page gets them */
    const targets = new Set();
    document.querySelectorAll("main .section > .wrap > *, main .page-head .wrap > *, main .auth-box, main .auth-side-in").forEach((el) => {
      if (el.closest("[data-hero]") || el.matches("[data-floor]")) return;
      targets.add(el);
    });
    // grids reveal their children in a short stagger
    const groups = "main .spaces, main .catalog, main .plans, main .amen, main .gallery, main .route, main .stats, main .steps, main .faq";
    document.querySelectorAll(groups).forEach((g) => {
      targets.delete(g);
      Array.from(g.children).forEach((c, i) => { c.style.setProperty("--rd", Math.min(i, 8) * 70 + "ms"); targets.add(c); });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const watch = (el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add("reveal", "is-in"); return; } // already on screen: no flash
      el.classList.add("reveal"); io.observe(el);
    };
    targets.forEach(watch);
    // content rendered later by scripts (catalog filters, account tabs) fades in too
    document.querySelectorAll("[data-catalog], [data-panel]").forEach((box) => {
      new MutationObserver(() => box.querySelectorAll(":scope > *:not(.reveal)").forEach((c, i) => {
        c.style.setProperty("--rd", Math.min(i, 8) * 60 + "ms"); c.classList.add("reveal");
        requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("is-in")));
      })).observe(box, { childList: true });
    });

    /* Count-up numbers */
    const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      const el = e.target, end = Number(el.dataset.count), t0 = performance.now(), dur = 1100;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      el.textContent = "0"; requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    /* 3D tilt on cards — desktop pointers only, one rAF per frame */
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let active = null, px = 0, py = 0, raf = 0;
    const apply = () => {
      raf = 0; if (!active) return;
      const b = active.getBoundingClientRect(); const x = (px - b.left) / b.width - 0.5, y = (py - b.top) / b.height - 0.5;
      active.style.transform = `perspective(900px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(y * -7).toFixed(2)}deg) translateZ(0)`;
      active.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%"); active.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
    };
    document.addEventListener("pointerover", (e) => {
      const c = e.target.closest(".space, .plan, .item, .stat"); if (c === active) return;
      if (active) { active.style.transform = ""; active.classList.remove("tilting"); }
      active = c; if (c) c.classList.add("tilting");
    });
    document.addEventListener("pointermove", (e) => { if (!active) return; px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(apply); }, { passive: true });
  });
})();
