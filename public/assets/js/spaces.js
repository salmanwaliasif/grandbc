/* Catalog: spaces.html and meeting-rooms.html */
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, esc, space, img, omr, icons } = GBCApp;
  const list = $("[data-catalog]"); if (!list) return;
  const fixed = list.dataset.catalog; // optional fixed type
  const typeNames = { all: "All spaces", office: "Private offices", meeting: "Meeting rooms", desk: "Coworking desks", virtual: "Virtual offices" };
  const unitText = (s) => (s.billing === "annual" ? "/ month, billed yearly" : `/ ${s.unit}`);
  const cta = (s) => (s.type === "meeting" || (s.type === "desk" && s.unit === "day") ? "Book now" : s.type === "office" ? "Reserve office" : "Sign up");
  let type = fixed || new URLSearchParams(location.search).get("type") || "all";

  const filters = $("[data-filters]");
  if (filters) {
    filters.innerHTML = Object.entries(typeNames).map(([k, v]) => `<button type="button" class="chip chip--light" data-t="${k}" aria-pressed="${k === type}">${v}</button>`).join("");
    filters.addEventListener("click", (e) => {
      const b = e.target.closest("[data-t]"); if (!b) return; type = b.dataset.t;
      $$("[data-t]", filters).forEach((x) => x.setAttribute("aria-pressed", x === b));
      history.replaceState(null, "", type === "all" ? "spaces.html" : `spaces.html?type=${type}`); render();
    });
  }

  function render() {
    const items = GBC.spaces.filter((s) => type === "all" || s.type === type);
    list.innerHTML = items.map((s) => `
      <article class="item">
        <div class="item-img"><img src="${img(s.img, 1)}" alt="${esc(s.name)}" loading="lazy">${s.popular ? '<span class="tag tag--pine">Most booked</span>' : ""}</div>
        <div class="item-body">
          <h3>${esc(s.name)}</h3>
          <div class="item-meta"><span><i data-lucide="users"></i>${esc(s.capacity)}</span><span><i data-lucide="${{ office: "door-closed", meeting: "presentation", desk: "laptop", virtual: "mail" }[s.type]}"></i>${typeNames[s.type].replace(/s$/, "")}</span></div>
          <p class="muted" style="font-size:.95rem">${esc(s.blurb)}</p>
          <ul>${s.features.map((f) => `<li><i data-lucide="check"></i>${esc(f)}</li>`).join("")}</ul>
          <div class="item-foot">
            <span class="price">${omr(s.price)} <small>${unitText(s)}</small></span>
            <span class="flex"><button class="btn btn--ghost btn--sm" type="button" data-detail="${s.id}">Photos</button><a class="btn btn--sm" href="book.html?space=${s.id}">${cta(s)}</a></span>
          </div>
        </div>
      </article>`).join("");
    icons();
  }
  render();

  /* detail modal with photo switcher */
  const modal = document.createElement("div");
  modal.className = "modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
  document.body.appendChild(modal);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-detail]"); if (!b) return;
    const s = space(b.dataset.detail);
    modal.setAttribute("aria-label", s.name);
    modal.innerHTML = `<div class="modal-bg"></div><div class="modal-box"><button class="modal-close" aria-label="Close"><i data-lucide="x"></i></button>
      <div class="md-grid"><div><div class="md-img" style="height:360px"><img src="${img(s.photos[0])}" alt="${esc(s.name)}" data-main></div>
      <div class="md-thumbs">${s.photos.map((p, i) => `<button type="button" aria-pressed="${i === 0}" data-p="${p}" aria-label="Photo ${i + 1}"><img src="${img(p, 1)}" alt=""></button>`).join("")}</div></div>
      <div class="md-body"><h2 style="font-size:1.7rem">${esc(s.name)}</h2><p class="muted">${esc(s.capacity)}</p><p>${esc(s.blurb)}</p>
      <ul class="ticks">${s.features.map((f) => `<li><i data-lucide="check"></i>${esc(f)}</li>`).join("")}</ul>
      <p class="price">${omr(s.price)} <small>${unitText(s)}</small></p>
      <div class="flex"><a class="btn" href="book.html?space=${s.id}">${cta(s)}</a><a class="btn btn--ghost" href="contact.html?space=${s.id}#tour">Book a tour</a></div></div></div></div>`;
    modal.classList.add("open"); icons(); $(".modal-close", modal).focus();
  });
  modal.addEventListener("click", (e) => {
    if (e.target.closest(".modal-close") || e.target.classList.contains("modal-bg")) modal.classList.remove("open");
    const t = e.target.closest("[data-p]");
    if (t) { $("[data-main]", modal).src = img(t.dataset.p); $$("[data-p]", modal).forEach((x) => x.setAttribute("aria-pressed", x === t)); }
  });
});
