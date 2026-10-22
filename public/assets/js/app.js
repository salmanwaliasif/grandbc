/* Grand Business Center — shared site logic (prototype: data is kept in the visitor's browser) */
(function () {
  const C = GBC.company;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- storage ---------- */
  const mem = {};
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } }
  };

  async function hash(pw) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("gbc:" + pw));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) { return "p:" + btoa(unescape(encodeURIComponent(pw))); }
  }

  const Store = {
    users() { return LS.get("gbc_users", []); },
    user(email) { return this.users().find((u) => u.email === String(email).toLowerCase()); },
    current() { const s = LS.get("gbc_session", null); return s ? this.user(s) : null; },
    async register(data) {
      const email = data.email.trim().toLowerCase();
      if (this.user(email)) throw new Error("An account with this email already exists. Sign in instead.");
      const u = { email, name: data.name.trim(), company: (data.company || "").trim(), phone: (data.phone || "").trim(),
        interest: data.interest || "", plan: data.plan || null, pw: await hash(data.password), created: new Date().toISOString(), freePassUsed: false };
      const all = this.users(); all.push(u); LS.set("gbc_users", all); LS.set("gbc_session", email);
      return u;
    },
    async login(email, pw) {
      const u = this.user(email);
      if (!u || u.pw !== (await hash(pw))) throw new Error("That email and password don't match an account.");
      LS.set("gbc_session", u.email); return u;
    },
    logout() { LS.set("gbc_session", null); },
    updateUser(patch) {
      const cur = this.current(); if (!cur) return null;
      const all = this.users().map((u) => (u.email === cur.email ? Object.assign(u, patch) : u));
      LS.set("gbc_users", all); return this.current();
    },
    bookings() { return LS.get("gbc_bookings", []); },
    myBookings() { const u = this.current(); return u ? this.bookings().filter((b) => b.contact.email === u.email) : []; },
    addBooking(b) { const all = this.bookings(); all.push(b); LS.set("gbc_bookings", all); return b; },
    updateBooking(ref, patch) { LS.set("gbc_bookings", this.bookings().map((b) => (b.ref === ref ? Object.assign(b, patch) : b))); },
    enquiries() { return LS.get("gbc_enquiries", []); },
    addEnquiry(e) { const all = this.enquiries(); all.push(e); LS.set("gbc_enquiries", all); return e; },
    freePassAvailable() { const u = this.current(); return u ? !u.freePassUsed : !LS.get("gbc_freepass_guest", false); },
    useFreePass() { const u = this.current(); if (u) this.updateUser({ freePassUsed: true }); else LS.set("gbc_freepass_guest", true); }
  };

  /* ---------- helpers ---------- */
  const space = (id) => GBC.spaces.find((s) => s.id === id);
  const img = (name, sm) => `assets/img/${name}${sm ? "-sm" : ""}.webp`;
  const omr = (n) => "OMR " + (Math.round(n * 1000) / 1000).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 3 : 0, maximumFractionDigits: 3 });
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const hourLabel = (h) => { const hh = Math.floor(h); const m = h % 1 ? "30" : "00"; const ap = hh >= 12 ? "pm" : "am"; return `${((hh + 11) % 12) + 1}:${m} ${ap}`; };
  const niceDate = (s, opts) => parseYmd(s).toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const unitLabel = { hour: "hour", day: "day", month: "month" };
  const ref = () => "GBC-" + Math.random().toString(36).slice(2, 6).toUpperCase() + (Date.now() % 1000).toString().padStart(3, "0");

  /* Mock availability: deterministic per room/date/hour so it looks real and stays stable */
  function seeded(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
  function isBusy(spaceId, date, hour) {
    const taken = Store.bookings().some((b) => b.spaceId === spaceId && b.date === date && b.status !== "cancelled" && hour >= b.start && hour < b.start + b.hours);
    if (taken) return true;
    const dow = parseYmd(date).getDay();
    const base = dow === 5 ? 0.08 : dow === 6 ? 0.15 : (hour >= 10 && hour < 13) || (hour >= 16 && hour < 18) ? 0.42 : 0.2;
    return seeded(spaceId + date + Math.floor(hour)) < base;
  }
  function isPast(date, hour) { const now = new Date(); const d = parseYmd(date); d.setHours(Math.floor(hour), hour % 1 ? 30 : 0); return d < now; }

  function waLink(text) { return `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`; }

  function toast(msg) {
    let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2800);
  }
  function icons() { if (window.lucide) lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }

  /* Price engine shared by booking + calculator */
  function quote(o) {
    const s = space(o.spaceId); if (!s) return null;
    const lines = []; let base = 0, recurring = 0, once = 0, deposit = 0; const notes = [];
    const u = Store.current();
    if (s.type === "meeting") {
      const h = o.hours || 1; let rate = s.price * h; let label = `${h} hr × ${omr(s.price)}`;
      if (h >= 8) { rate = s.price * 6; label = "Full day rate"; } else if (h >= 4) { rate = s.price * 3.5; label = "Half day rate"; }
      if (u && u.plan && u.plan.startsWith("office")) { lines.push([`${s.name} (${label})`, "Included"]); notes.push("Meeting rooms are included with your office plan."); }
      else { base += rate; lines.push([`${s.name} (${label})`, omr(rate)]); }
    } else if (s.type === "desk" && s.unit === "day") {
      const days = o.days || 1; let cost = s.price * days;
      if (o.free && Store.freePassAvailable()) { cost = s.price * (days - 1); lines.push(["Free first day", "−" + omr(s.price)]); }
      base += cost; lines.unshift([`${s.name} × ${days} day${days > 1 ? "s" : ""}`, omr(s.price * days)]);
    } else if (s.type === "virtual") {
      base += s.price * 12; lines.push([`${s.name} — 12 months`, omr(s.price * 12)]); notes.push("Billed annually.");
    } else {
      const months = o.term || (s.type === "office" ? 12 : 1);
      recurring += s.price; lines.push([`${s.name} — monthly`, omr(s.price)]);
      if (s.type === "office") { deposit = s.price * 3; notes.push("Office leases run 12 months with post-dated cheques; a 3-month refundable deposit secures the office."); }
      base += s.price; // first month due
      o._months = months;
    }
    (o.addons || []).forEach((id) => {
      const a = (GBC.addons[s.type] || []).find((x) => x.id === id); if (!a) return;
      if (a.per === "quote") { lines.push([a.name, "Quote"]); return; }
      let cost = a.price;
      if (a.per === "guest") cost = a.price * (o.guests || 1);
      if (a.per === "month") { recurring += a.price; base += s.type === "virtual" ? a.price * 12 : a.price; cost = s.type === "virtual" ? a.price * 12 : a.price; lines.push([a.name + (s.type === "virtual" ? " — 12 months" : " — monthly"), omr(cost)]); return; }
      if (a.per === "once") once += cost; else base += cost;
      if (a.per === "once") base += cost;
      lines.push([a.name + (a.per === "guest" ? ` × ${o.guests || 1}` : ""), omr(cost)]);
    });
    const vat = base * C.vat;
    return { space: s, lines, subtotal: base, vat, total: base + vat, recurring, deposit, once, notes };
  }

  function renderAccount() {
    const u = Store.current();
    $$("[data-account-slot]").forEach((el) => {
      if (u) {
        const initials = u.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
        el.innerHTML = `<a class="nav-account" href="account.html"><span class="avatar">${esc(initials)}</span><span>My bookings</span></a>`;
      } else el.innerHTML = `<a class="btn btn--ghost btn--sm" href="login.html">Sign in</a>`;
    });
    $$("[data-drawer-account]").forEach((el) => {
      el.innerHTML = u ? `<a href="account.html">My account</a><a href="#" data-logout>Sign out</a>` : `<a href="login.html">Sign in</a><a href="signup.html">Create account</a>`;
    });
  }

  /* ---------- layout: nav state, drawer, WhatsApp ---------- */
  function initLayout() {
    const page = document.body.dataset.page;
    $$(`[data-nav="${page}"]`).forEach((a) => a.setAttribute("aria-current", "page"));
    renderAccount();
    const drawer = $(".drawer");
    $(".nav-toggle")?.addEventListener("click", () => { drawer.classList.add("open"); $(".drawer-close").focus(); });
    $$(".drawer-close, .drawer-bg").forEach((b) => b.addEventListener("click", () => drawer.classList.remove("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { drawer?.classList.remove("open"); $$(".modal.open, .lightbox.open").forEach((m) => m.classList.remove("open")); } });
    document.addEventListener("click", (e) => { const l = e.target.closest("[data-logout]"); if (l) { e.preventDefault(); Store.logout(); location.href = "index.html"; } });
    $$("[data-wa]").forEach((a) => { a.href = waLink(a.dataset.wa || "Hello Grand Business Center, I'd like to know more about your workspaces."); a.target = "_blank"; a.rel = "noopener"; });
    document.addEventListener("click", (e) => { const m = e.target.closest("[data-map]"); if (!m) return; const f = document.createElement("iframe"); f.title = "Map showing Muscat Grand Mall"; f.src = m.dataset.map; f.referrerPolicy = "no-referrer-when-downgrade"; m.replaceWith(f); });
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- lightbox for [data-gallery] ---------- */
  function initGallery() {
    const items = $$("[data-lb]"); if (!items.length) return;
    let lb = $(".lightbox");
    if (!lb) {
      lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
      lb.innerHTML = `<figure style="margin:0"><img alt=""><figcaption></figcaption></figure><button class="lb-close" aria-label="Close"><i data-lucide="x"></i></button><button class="lb-prev" aria-label="Previous photo"><i data-lucide="chevron-left"></i></button><button class="lb-next" aria-label="Next photo"><i data-lucide="chevron-right"></i></button>`;
      document.body.appendChild(lb); icons();
    }
    let i = 0;
    const show = (n) => { i = (n + items.length) % items.length; const el = items[i]; $("img", lb).src = el.dataset.lb; $("img", lb).alt = el.dataset.cap || ""; $("figcaption", lb).textContent = el.dataset.cap || ""; };
    items.forEach((el, n) => el.addEventListener("click", () => { show(n); lb.classList.add("open"); $(".lb-close", lb).focus(); }));
    $(".lb-close", lb).onclick = () => lb.classList.remove("open");
    $(".lb-prev", lb).onclick = () => show(i - 1);
    $(".lb-next", lb).onclick = () => show(i + 1);
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("open"); });
  }

  /* ---------- availability board (home + meeting rooms) ---------- */
  function initBoard() {
    const board = $("[data-board]"); if (!board) return;
    const rooms = GBC.spaces.filter((s) => s.type === "meeting");
    const daysEl = $(".board-days", board); const rowsEl = $("[data-rows]", board);
    const start = new Date(); if (start.getHours() >= C.closeHour - 4) start.setDate(start.getDate() + 1);
    let cur = ymd(start);
    const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(start); d.setDate(d.getDate() + k); return d; });
    daysEl.innerHTML = days.map((d, k) => `<button class="day-chip" type="button" aria-pressed="${k === 0}" data-day="${ymd(d)}"><b>${d.getDate()}</b><span>${k === 0 && ymd(d) === ymd(new Date()) ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" })}</span></button>`).join("");
    const hours = []; for (let h = C.openHour; h < C.closeHour; h++) hours.push(h);
    function render() {
      rowsEl.innerHTML = rooms.map((r) => {
        const slots = hours.map((h) => {
          const past = isPast(cur, h + 0.99), busy = isBusy(r.id, cur, h);
          const lbl = `${r.name}, ${hourLabel(h)}${busy ? ", booked" : past ? ", past" : ", available"}`;
          return `<button type="button" class="slot${busy ? " busy" : ""}${past ? " past" : ""}" ${busy || past ? "disabled" : ""} data-room="${r.id}" data-h="${h}" aria-label="${lbl}">${h > 12 ? h - 12 : h}${h >= 12 ? "p" : "a"}</button>`;
        }).join("");
        return `<div class="board-row"><div class="board-room"><img src="${img(r.img, 1)}" alt="" loading="lazy"><div><h4>${r.name}</h4><p>${r.capacity} · ${omr(r.price)}/hr</p></div></div><div class="slots">${slots}</div></div>`;
      }).join("");
    }
    daysEl.addEventListener("click", (e) => { const b = e.target.closest(".day-chip"); if (!b) return; $$(".day-chip", daysEl).forEach((x) => x.setAttribute("aria-pressed", x === b)); cur = b.dataset.day; render(); });
    rowsEl.addEventListener("click", (e) => { const s = e.target.closest(".slot:not([disabled])"); if (!s) return; location.href = `book.html?space=${s.dataset.room}&date=${cur}&start=${s.dataset.h}&hours=1`; });
    render();
    const n = $(".slots", board) ? hours.length : 0;
    $$(".slots", board).forEach((el) => { if (window.innerWidth > 860) el.style.gridTemplateColumns = `repeat(${n}, minmax(28px,1fr))`; });
  }

  /* ---------- hero booking bar ---------- */
  function initBookbar() {
    const bar = $("[data-bookbar]"); if (!bar) return;
    const tabs = $$(".bb-tab", bar); const sel = $("[name=space]", bar); const date = $("[name=date]", bar); const third = $("[data-third]", bar);
    date.min = ymd(new Date()); date.value = ymd(new Date(Date.now() + 864e5));
    function setType(t) {
      tabs.forEach((x) => x.setAttribute("aria-selected", x.dataset.type === t));
      sel.innerHTML = GBC.spaces.filter((s) => s.type === t).map((s) => `<option value="${s.id}">${s.name} — ${s.capacity}</option>`).join("");
      const dl = $("[data-date-label]", bar);
      if (t === "meeting") { dl.textContent = "Date"; third.innerHTML = `<label for="bb-time">Start time</label><select id="bb-time" name="start">${Array.from({ length: C.closeHour - C.openHour }, (_, k) => C.openHour + k).map((h) => `<option value="${h}" ${h === 10 ? "selected" : ""}>${hourLabel(h)}</option>`).join("")}</select>`; }
      else if (t === "office") { dl.textContent = "Move-in date"; third.innerHTML = `<label for="bb-team">Team size</label><select id="bb-team" name="team"><option>1–2</option><option selected>2–3</option><option>3–4</option><option>4–6</option><option>7+</option></select>`; }
      else if (t === "desk") { dl.textContent = "Start date"; third.innerHTML = `<label for="bb-days">Days</label><select id="bb-days" name="days">${[1, 2, 3, 5].map((d) => `<option value="${d}">${d} day${d > 1 ? "s" : ""}</option>`).join("")}</select>`; }
      else { dl.textContent = "Start date"; third.innerHTML = `<label for="bb-bill">Billing</label><select id="bb-bill" name="bill"><option>Annual</option></select>`; }
      bar.dataset.type = t;
    }
    tabs.forEach((t) => t.addEventListener("click", () => setType(t.dataset.type)));
    $("form", bar).addEventListener("submit", (e) => {
      e.preventDefault(); const t = bar.dataset.type; const p = new URLSearchParams({ space: sel.value, date: date.value });
      if (t === "meeting") { p.set("start", $("[name=start]", bar).value); p.set("hours", "1"); }
      if (t === "desk") p.set("days", $("[name=days]", bar).value);
      if (t === "office") { const map = { "1–2": "office-starter", "2–3": "office-standard", "3–4": "office-professional", "4–6": "office-business", "7+": "office-business" }; const team = $("[name=team]", bar).value; if (!sel.dataset.touched) p.set("space", map[team]); }
      location.href = "book.html?" + p.toString();
    });
    sel.addEventListener("change", () => (sel.dataset.touched = "1"));
    setType("meeting");
  }

  /* ---------- setup chips (home) ---------- */
  function initChips() {
    $$("[data-chips]").forEach((wrap) => {
      wrap.innerHTML = GBC.setupServices.map((s) => `<button type="button" class="chip${wrap.dataset.chips === "light" ? " chip--light" : ""}" aria-pressed="false" data-id="${s.id}"><i data-lucide="${s.icon}"></i>${s.name}</button>`).join("");
      wrap.addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (!c) return; c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"); const go = $("[data-chips-go]"); if (go) { const ids = $$(".chip[aria-pressed=true]", wrap).map((x) => x.dataset.id); go.href = "business-setup.html" + (ids.length ? "?services=" + ids.join(",") : ""); } });
    });
  }

  function initAmenities() {
    $$("[data-amenities]").forEach((el) => { el.innerHTML = GBC.amenities.map(([i, t, d]) => `<div><i data-lucide="${i}"></i><h4>${t}</h4><p>${d}</p></div>`).join(""); });
  }

  window.GBCApp = { renderAccount, $, $$, esc, Store, space, img, omr, ymd, parseYmd, hourLabel, niceDate, unitLabel, ref, isBusy, isPast, waLink, toast, icons, quote };

  document.addEventListener("DOMContentLoaded", () => {
    initLayout(); initBookbar(); initBoard(); initChips(); initAmenities(); initGallery(); icons();
  });
})();
