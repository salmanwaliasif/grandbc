/* 5th-floor explorer — CSS 3D, no libraries.
   Layout is illustrative: a 12 × 8 grid. kind: office | room | shared */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-floor]"); if (!root) return;
  const { esc, space, img, omr, icons } = GBCApp;
  const R = [
    { id: "501", x: 0, y: 0, w: 2, h: 2, kind: "office", plan: "office-business", free: false },
    { id: "502", x: 2, y: 0, w: 2, h: 2, kind: "office", plan: "office-professional", free: true, note: "Window office facing the courtyard" },
    { id: "503", x: 4, y: 0, w: 2, h: 2, kind: "office", plan: "office-standard", free: false },
    { id: "504", x: 6, y: 0, w: 2, h: 2, kind: "office", plan: "office-standard", free: true },
    { id: "505", x: 8, y: 0, w: 2, h: 2, kind: "office", plan: "office-professional", free: false },
    { id: "Board", x: 10, y: 0, w: 2, h: 3, kind: "room", plan: "room-board" },
    { id: "Reception", x: 0, y: 3, w: 3, h: 2, kind: "shared", title: "Reception & lounge", text: "Our receptionist welcomes your guests, takes your calls and handles your mail.", photo: "reception-map-wall" },
    { id: "Coworking", x: 3, y: 3, w: 4, h: 2, kind: "shared", plan: "desk-hot", title: "Coworking area", text: "Hot desks and dedicated desks with Wi-Fi, power and lockers.", photo: "glass-corridor" },
    { id: "Pantry", x: 7, y: 3, w: 2, h: 2, kind: "shared", title: "Pantry", text: "Tea, coffee, soft drinks and zero-sodium water — included for every member.", photo: "office-corner-window" },
    { id: "Meeting", x: 9, y: 3, w: 3, h: 2, kind: "room", plan: "room-meeting" },
    { id: "506", x: 0, y: 6, w: 2, h: 2, kind: "office", plan: "office-starter", free: true },
    { id: "507", x: 2, y: 6, w: 2, h: 2, kind: "office", plan: "office-starter", free: false },
    { id: "508", x: 4, y: 6, w: 2, h: 2, kind: "office", plan: "office-standard", free: true },
    { id: "509", x: 6, y: 6, w: 2, h: 2, kind: "office", plan: "office-professional", free: false },
    { id: "Huddle", x: 8, y: 6, w: 2, h: 2, kind: "room", plan: "room-huddle" },
    { id: "510", x: 10, y: 6, w: 2, h: 2, kind: "office", plan: "office-business", free: true, note: "Corner suite with lounge" }
  ];
  const tower = root.querySelector("[data-tower]");
  const panel = root.querySelector("[data-floor-panel]");
  const label = (r) => r.kind === "office" ? `Office ${r.id}` : r.title || space(r.plan).name;
  const cls = (r) => r.kind === "office" ? (r.free ? "t-free" : "t-taken") : r.kind === "room" ? "t-room" : "t-shared";

  // Building: ghost floors below and above, detailed 5th floor in the middle
  let html = "";
  [3, 4].forEach((f) => (html += `<div class="slab slab--ghost" style="--z:${(f - 5) * 70}px"><span class="slab-n">${f}</span></div>`));
  html += `<div class="slab slab--five" style="--z:0px"><span class="slab-n">5</span><div class="fplan">` +
    R.map((r, i) => `<button type="button" class="tile ${cls(r)}" data-i="${i}" style="--x:${r.x};--y:${r.y};--w:${r.w};--h:${r.h};--d:${i * 40}ms" aria-label="${esc(label(r))}${r.kind === "office" ? (r.free ? ", available" : ", occupied") : ""}"><span class="tile-top"><b>${esc(r.kind === "office" ? r.id : r.id)}</b></span></button>`).join("") +
    `</div></div>`;
  [6, 7].forEach((f) => (html += `<div class="slab slab--ghost slab--up" style="--z:${(f - 5) * 70}px"><span class="slab-n">${f}</span></div>`));
  tower.innerHTML = html;

  function show(i) {
    const r = R[i]; const s = r.plan ? space(r.plan) : null;
    tower.querySelectorAll(".tile").forEach((t) => t.classList.toggle("on", Number(t.dataset.i) === i));
    const photo = r.photo || (s && s.img);
    let status = "", body = "", cta = "";
    if (r.kind === "office") {
      status = r.free ? `<span class="status">Available now</span>` : `<span class="status status--pending">Occupied</span>`;
      body = `<p>${esc(s.name)} for ${esc(s.capacity.toLowerCase())}. ${esc(r.note || s.blurb)}</p><p class="price">${omr(s.price)} <small>/ month</small></p>`;
      cta = r.free ? `<a class="btn" href="book.html?space=${s.id}">Reserve office ${r.id}</a>` : `<a class="btn btn--ghost" href="contact.html#tour">Join the waiting list</a>`;
    } else if (r.kind === "room") {
      status = `<span class="status">Bookable by the hour</span>`;
      body = `<p>${esc(s.blurb)}</p><p class="price">${omr(s.price)} <small>/ hour · ${esc(s.capacity.toLowerCase())}</small></p>`;
      cta = `<a class="btn" href="book.html?space=${s.id}">Book ${esc(s.name.toLowerCase())}</a>`;
    } else {
      status = `<span class="status">Shared by members</span>`;
      body = `<p>${esc(r.text)}</p>${s ? `<p class="price">${omr(s.price)} <small>/ month</small></p>` : ""}`;
      cta = s ? `<a class="btn" href="book.html?space=${s.id}">Get a desk</a>` : `<a class="btn btn--ghost" href="contact.html#tour">Book a tour</a>`;
    }
    panel.innerHTML = `<div class="fp-img"><img src="${img(photo, 1)}" alt="" loading="lazy"></div><div class="fp-body"><div class="flex" style="gap:8px;margin-bottom:6px">${status}</div><h3>${esc(label(r))}</h3>${body}<div class="flex">${cta}</div></div>`;
    panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
  }
  tower.addEventListener("click", (e) => { const t = e.target.closest(".tile"); if (t) show(Number(t.dataset.i)); });
  show(1);

  /* One orchestrated reveal when the section scrolls into view */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { root.classList.add("in"); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { root.classList.add("in"); io.disconnect(); } }), { threshold: 0.35 });
  io.observe(root);

  /* Pointer parallax: lerped in rAF, only while hovered, desktop only */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const stage = root.querySelector(".floor-stage");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    tower.style.setProperty("--rz", (cx * 8).toFixed(2) + "deg");
    tower.style.setProperty("--rx", (cy * -5).toFixed(2) + "deg");
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  stage.addEventListener("pointermove", (e) => {
    const b = stage.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - 0.5; ty = (e.clientY - b.top) / b.height - 0.5;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  stage.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
});
