/* Booking wizard */
document.addEventListener("DOMContentLoaded", () => {
  const A = GBCApp; const { $, $$, esc, Store, space, img, omr, ymd, hourLabel, niceDate, icons } = A; const C = GBC.company;
  const q = new URLSearchParams(location.search);
  const tomorrow = ymd(new Date(Date.now() + 864e5));
  const pre = space(q.get("space"));
  const S = {
    type: pre ? pre.type : "meeting", spaceId: pre ? pre.id : null,
    date: q.get("date") || tomorrow, start: q.has("start") ? Number(q.get("start")) : null, hours: Number(q.get("hours") || 1), guests: 2,
    days: Number(q.get("days") || 1), free: q.get("free") === "1", term: 1, team: "", pref: "Any", addons: [], notes: "",
    contact: {}, createAccount: true
  };
  if (pre && pre.type === "office") S.term = 12;
  let step = pre ? 1 : 0;
  const steps = $$(".step"); const prog = $$(".progress li");
  const form = $("[data-form]");

  const cur = () => space(S.spaceId);

  /* ---------- step 1: space ---------- */
  function renderTypes() {
    $$("[data-types] button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.type === S.type));
    const opts = GBC.spaces.filter((s) => s.type === S.type);
    $("[data-space-opts]").innerHTML = opts.map((s) => `
      <label class="opt opt--img"><input type="radio" name="space" value="${s.id}" ${s.id === S.spaceId ? "checked" : ""}>
        <img src="${img(s.img, 1)}" alt="" loading="lazy">
        <span class="opt-in"><span class="opt-title">${esc(s.name)}${s.popular ? '<span class="tag">Popular</span>' : ""}</span>
        <span class="opt-sub">${esc(s.capacity)} — ${esc(s.blurb)}</span>
        <span class="opt-price">${omr(s.price)} <small class="muted">/ ${s.unit}${s.billing === "annual" ? ", billed yearly" : ""}</small></span></span>
      </label>`).join("");
  }
  $("[data-types]").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; S.type = b.dataset.type; S.spaceId = null; S.addons = []; renderTypes(); summary(); });
  $("[data-space-opts]").addEventListener("change", (e) => {
    S.spaceId = e.target.value; const s = cur(); S.addons = [];
    S.term = s.type === "office" ? 12 : 1; S.guests = Math.min(S.guests, s.seats || 1);
    $("[data-err=space]").textContent = ""; summary();
  });

  /* ---------- step 2: when ---------- */
  function slotFree(start, hours) { for (let h = start; h < start + hours; h++) { if (h >= C.closeHour || A.isBusy(S.spaceId, S.date, h) || A.isPast(S.date, h + 0.99)) return false; } return true; }
  function stepper(name, val, min, max, label) {
    return `<div class="field"><span class="label" id="lb-${name}">${label}</span><div class="stepper" role="group" aria-labelledby="lb-${name}"><button type="button" data-dec="${name}" aria-label="Decrease">−</button><output data-out="${name}">${val}</output><button type="button" data-inc="${name}" aria-label="Increase">+</button></div><span class="hint" data-hint="${name}"></span></div>`;
  }
  const limits = () => { const s = cur(); return { hours: [1, 13], guests: [1, s ? Math.max(1, s.seats) : 1], days: [1, 10] }; };

  function renderWhen() {
    const s = cur(); const w = $("[data-when]"); const today = ymd(new Date());
    if (!s) { w.innerHTML = ""; return; }
    if (s.type === "meeting") {
      $("[data-when-title]").textContent = "Pick a date and time";
      w.innerHTML = `<div class="row2"><div class="field"><label for="w-date">Date</label><input class="input" type="date" id="w-date" min="${today}" value="${S.date}"></div>
        <div class="flex" style="gap:24px;align-items:flex-start">${stepper("hours", S.hours, 1, 13, "Duration (hours)")}${stepper("guests", S.guests, 1, s.seats, `Guests (max ${s.seats})`)}</div></div>
        <div class="field"><span class="label">Start time</span><div class="timegrid" data-times role="group" aria-label="Start time"></div><p class="err" data-err="time"></p></div>
        <div class="notice"><i data-lucide="info"></i><span>Book 4 hours or more and the half-day rate applies; 8 hours or more gets the full-day rate.</span></div>`;
      renderTimes();
    } else if (s.type === "desk" && s.unit === "day") {
      $("[data-when-title]").textContent = "When will you come in?";
      const canFree = Store.freePassAvailable();
      w.innerHTML = `<div class="row2"><div class="field"><label for="w-date">First day</label><input class="input" type="date" id="w-date" min="${today}" value="${S.date}"></div>${stepper("days", S.days, 1, 10, "Number of days")}</div>
        ${canFree ? `<label class="addon"><input type="checkbox" id="w-free" ${S.free ? "checked" : ""}><span class="a-body"><b>Use my free day pass</b><span>Your first day at Grand Business Center is free — one per person.</span></span><span class="a-price">−${omr(s.price)}</span></label>` : `<div class="notice"><i data-lucide="info"></i><span>You've already used your free day pass.</span></div>`}`;
    } else if (s.type === "office") {
      $("[data-when-title]").textContent = "When would you like to move in?";
      w.innerHTML = `<div class="row2"><div class="field"><label for="w-date">Move-in date</label><input class="input" type="date" id="w-date" min="${today}" value="${S.date}"></div>
        <div class="field"><label for="w-team">Team size</label><select class="select" id="w-team"><option value="">Select</option>${["1", "2", "3", "4", "5", "6", "7+"].map((n) => `<option ${S.team === n ? "selected" : ""}>${n}</option>`).join("")}</select><p class="err" data-err="team"></p></div></div>
        <div class="field"><span class="label">Office preference</span><div class="opts" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">${["Any", "Window office", "Near reception", "Quiet corner"].map((p) => `<label class="opt"><input type="radio" name="pref" value="${p}" ${S.pref === p ? "checked" : ""}><span class="opt-title">${p}</span></label>`).join("")}</div></div>
        <div class="notice"><i data-lucide="file-text"></i><span>Office leases run for 12 months. We'll confirm the exact office, prepare your agreement and arrange a viewing before you sign.</span></div>`;
    } else {
      const monthly = s.type === "desk";
      $("[data-when-title]").textContent = monthly ? "When do you want to start?" : "When should your address go live?";
      w.innerHTML = `<div class="row2"><div class="field"><label for="w-date">Start date</label><input class="input" type="date" id="w-date" min="${today}" value="${S.date}"></div>
        ${monthly ? `<div class="field"><label for="w-term">Commitment</label><select class="select" id="w-term">${[1, 3, 6, 12].map((m) => `<option value="${m}" ${S.term === m ? "selected" : ""}>${m} month${m > 1 ? "s" : ""}</option>`).join("")}</select></div>`
          : `<div class="field"><label for="w-co">Your company</label><select class="select" id="w-co"><option ${S.team === "Already registered in Oman" ? "selected" : ""}>Already registered in Oman</option><option ${S.team === "Need to set up a company" ? "selected" : ""}>Need to set up a company</option></select></div>`}</div>`;
    }
    icons();
  }
  function renderTimes() {
    const box = $("[data-times]"); if (!box) return;
    const hrs = []; for (let h = C.openHour; h < C.closeHour; h++) hrs.push(h);
    if (S.start !== null && !slotFree(S.start, S.hours)) { /* keep but flag */ }
    box.innerHTML = hrs.map((h) => {
      const ok = slotFree(h, S.hours); const sel = h === S.start;
      return `<button type="button" class="slot${ok ? "" : " busy"}${sel ? " sel" : ""}" data-h="${h}" ${ok ? "" : "disabled"} aria-pressed="${sel}">${hourLabel(h)}</button>`;
    }).join("");
    $("[data-err=time]").textContent = S.start !== null && !slotFree(S.start, S.hours) ? `${hourLabel(S.start)} for ${S.hours} hr isn't available any more — pick another start time.` : "";
    const hint = $("[data-hint=hours]"); if (hint) hint.textContent = S.hours >= 8 ? "Full-day rate" : S.hours >= 4 ? "Half-day rate" : "";
  }
  $("[data-when]").addEventListener("click", (e) => {
    const t = e.target.closest("[data-h]"); if (t && !t.disabled) { S.start = Number(t.dataset.h); renderTimes(); summary(); return; }
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"); const b = inc || dec; if (!b) return;
    const k = b.dataset.inc || b.dataset.dec; const [mn, mx] = limits()[k];
    S[k] = Math.max(mn, Math.min(mx, S[k] + (inc ? 1 : -1))); $(`[data-out=${k}]`).textContent = S[k];
    renderTimes(); summary();
  });
  $("[data-when]").addEventListener("change", (e) => {
    const id = e.target.id;
    if (id === "w-date") { S.date = e.target.value; renderTimes(); }
    if (id === "w-free") S.free = e.target.checked;
    if (id === "w-team" || id === "w-co") { S.team = e.target.value; const er = $("[data-err=team]"); if (er) er.textContent = ""; }
    if (id === "w-term") S.term = Number(e.target.value);
    if (e.target.name === "pref") S.pref = e.target.value;
    summary();
  });

  /* ---------- step 3: add-ons ---------- */
  function renderAddons() {
    const s = cur(); const list = (s && GBC.addons[s.type]) || [];
    const per = { guest: "per guest", booking: "per booking", month: "per month", once: "one-time", quote: "on quote" };
    $("[data-addons]").innerHTML = list.length ? list.map((a) => `<label class="addon"><input type="checkbox" value="${a.id}" ${S.addons.includes(a.id) ? "checked" : ""}><span class="a-body"><b>${esc(a.name)}</b><span>${esc(a.note)}</span></span><span class="a-price">${a.per === "quote" ? "Quote" : omr(a.price)} <small class="muted">${a.per === "quote" ? "" : per[a.per]}</small></span></label>`).join("") : `<p class="muted">No extras for this space.</p>`;
    $("#notes").value = S.notes;
  }
  $("[data-addons]").addEventListener("change", (e) => { S.addons = $$("[data-addons] input:checked").map((i) => i.value); summary(); });
  $("#notes").addEventListener("input", (e) => (S.notes = e.target.value));

  /* ---------- step 4: details ---------- */
  function renderDetails() {
    const u = Store.current(); const d = $("[data-details]");
    if (u) {
      S.contact = { name: u.name, email: u.email, phone: u.phone, company: u.company };
      d.innerHTML = `<div class="notice"><i data-lucide="user-check"></i><span>Booking as <b>${esc(u.name)}</b> (${esc(u.email)}). This booking will appear in <a href="account.html">My bookings</a>.</span></div>
        <div class="row2 mt-2"><div class="field"><label for="d-phone">Mobile number</label><input class="input" id="d-phone" type="tel" value="${esc(u.phone)}" autocomplete="tel"></div><div class="field"><label for="d-company">Company</label><input class="input" id="d-company" value="${esc(u.company)}" autocomplete="organization"></div></div>`;
    } else {
      const c = S.contact;
      d.innerHTML = `<p class="muted">Already a member? <a href="login.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search)}">Sign in</a> to book faster.</p>
        <div class="row2"><div class="field"><label for="d-name">Full name</label><input class="input" id="d-name" autocomplete="name" value="${esc(c.name)}"><p class="err" data-err="name"></p></div>
        <div class="field"><label for="d-company">Company <span class="muted">(optional)</span></label><input class="input" id="d-company" autocomplete="organization" value="${esc(c.company)}"></div></div>
        <div class="row2"><div class="field"><label for="d-email">Email</label><input class="input" id="d-email" type="email" autocomplete="email" value="${esc(c.email)}"><p class="err" data-err="email"></p></div>
        <div class="field"><label for="d-phone">Mobile number</label><input class="input" id="d-phone" type="tel" autocomplete="tel" placeholder="+968 9XXX XXXX" value="${esc(c.phone)}"><p class="err" data-err="phone"></p></div></div>
        <label class="check"><input type="checkbox" id="d-acct" ${S.createAccount ? "checked" : ""}><span>Create a free account so I can manage, reschedule or cancel this booking online</span></label>
        <div class="field mt-2" data-pw ${S.createAccount ? "" : "hidden"}><label for="d-pw">Choose a password</label><input class="input" id="d-pw" type="password" autocomplete="new-password" minlength="8"><span class="hint">At least 8 characters</span><p class="err" data-err="pw"></p></div>`;
    }
    icons();
  }
  $("[data-details]").addEventListener("change", (e) => { if (e.target.id === "d-acct") { S.createAccount = e.target.checked; $("[data-pw]").hidden = !S.createAccount; } });
  const val = (id) => ($("#" + id)?.value || "").trim();

  /* ---------- step 5: review ---------- */
  function whenText() {
    const s = cur(); if (!s) return "";
    if (s.type === "meeting") return S.start === null ? niceDate(S.date) : `${niceDate(S.date)}, ${hourLabel(S.start)}–${hourLabel(S.start + S.hours)}`;
    if (s.type === "desk" && s.unit === "day") return `${niceDate(S.date)}${S.days > 1 ? ` + ${S.days - 1} more day${S.days > 2 ? "s" : ""}` : ""}`;
    if (s.type === "office") return `Move in from ${niceDate(S.date)}, 12 months`;
    if (s.type === "desk") return `From ${niceDate(S.date)}, ${S.term} month${S.term > 1 ? "s" : ""}`;
    return `From ${niceDate(S.date)}, 12 months`;
  }
  function renderReview() {
    const s = cur(); const Q = A.quote(qopts()); const c = S.contact;
    $("[data-review]").innerHTML = `<div class="card" style="padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:160px 1fr;gap:0" class="rv">
      <img src="${img(s.img, 1)}" alt="" style="width:100%;height:100%;object-fit:cover;min-height:140px">
      <div style="padding:18px 20px"><h3 class="mb-0">${esc(s.name)}</h3><p class="muted mb-0">${esc(whenText())}${s.type === "meeting" ? `, ${S.guests} guest${S.guests > 1 ? "s" : ""}` : ""}</p>
      <p class="mb-0 mt-2 small"><b>${esc(c.name)}</b>${c.company ? ", " + esc(c.company) : ""}<br>${esc(c.email)} · ${esc(c.phone)}</p></div></div></div>
      ${S.notes ? `<p class="mt-2"><b>Notes:</b> ${esc(S.notes)}</p>` : ""}
      ${Q.notes.map((n) => `<div class="notice mt-2"><i data-lucide="info"></i><span>${esc(n)}</span></div>`).join("")}`;
    icons();
  }

  /* ---------- summary ---------- */
  const qopts = () => ({ spaceId: S.spaceId, hours: S.hours, guests: S.guests, days: S.days, free: S.free, term: S.term, addons: S.addons });
  function summary() {
    const s = cur(); const box = $("[data-summary]");
    if (!s) { box.innerHTML = `<h3>Your booking</h3><p class="muted">Choose a space to see the price.</p>`; return; }
    const Q = A.quote(qopts()); const instant = s.type === "meeting" || (s.type === "desk" && s.unit === "day");
    box.innerHTML = `<img class="sum-img" src="${img(s.img, 1)}" alt=""><h3>${esc(s.name)}</h3><p class="muted small">${esc(whenText())}</p>
      <ul class="sum-lines">${Q.lines.map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join("")}<li><span>VAT 5%</span><span>${omr(Q.vat)}</span></li></ul>
      <div class="sum-total"><span>${s.type === "office" || (s.type === "desk" && s.unit === "month") ? "First month" : "Total"}</span><strong>${omr(Q.total)}</strong></div>
      ${Q.deposit ? `<p class="sum-note">Plus a refundable deposit of ${omr(Q.deposit)} when you sign.</p>` : ""}
      <p class="sum-note">${instant ? "Confirmed instantly. Pay at reception or by bank transfer." : "No payment now — our team confirms availability and sends your agreement."}</p>`;
  }

  /* ---------- navigation ---------- */
  function validate(n) {
    const s = cur(); const err = (k, m) => { const e = $(`[data-err=${k}]`); if (e) e.textContent = m; return !m; };
    if (n === 0) return err("space", s ? "" : "Choose a space to continue.");
    if (n === 1) {
      if (s.type === "meeting") { if (S.start === null) return err("time", "Pick a start time."); if (!slotFree(S.start, S.hours)) return err("time", "That time isn't available for the length you chose. Pick another start time."); }
      if (s.type === "office" && !S.team) return err("team", "Tell us how many people will use the office.");
      return true;
    }
    if (n === 3) {
      if (Store.current()) { S.contact.phone = val("d-phone") || S.contact.phone; S.contact.company = val("d-company"); return true; }
      const c = { name: val("d-name"), email: val("d-email").toLowerCase(), phone: val("d-phone"), company: val("d-company") };
      S.contact = c; let ok = true;
      ok = err("name", c.name.length > 1 ? "" : "Enter your full name.") && ok;
      ok = err("email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email) ? "" : "Enter a valid email, like name@company.com.") && ok;
      ok = err("phone", c.phone.replace(/\D/g, "").length >= 8 ? "" : "Enter a mobile number with at least 8 digits.") && ok;
      if (S.createAccount) {
        const pw = $("#d-pw").value;
        ok = err("pw", pw.length >= 8 ? "" : "Use at least 8 characters.") && ok;
        if (ok && Store.user(c.email)) ok = err("email", "There's already an account with this email. Sign in above, or untick “Create a free account”.");
        S.password = pw;
      }
      return ok;
    }
    if (n === 4) return err("terms", form.terms.checked ? "" : "Please accept the booking terms to confirm.");
    return true;
  }
  function go(n) {
    step = n;
    steps.forEach((el, i) => el.classList.toggle("active", i === n));
    prog.forEach((el, i) => { el.className = i < n ? "done" : i === n ? "now" : ""; });
    $("[data-back]").style.visibility = n === 0 ? "hidden" : "visible";
    const s = cur(); const instant = s && (s.type === "meeting" || (s.type === "desk" && s.unit === "day"));
    $("[data-next]").textContent = n === 4 ? (instant ? "Confirm booking" : "Send request") : "Continue";
    if (n === 0) renderTypes(); if (n === 1) renderWhen(); if (n === 2) renderAddons(); if (n === 3) renderDetails(); if (n === 4) renderReview();
    summary();
    if (n > 0) $(".progress").scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  $("[data-back]").addEventListener("click", () => go(Math.max(0, step - 1)));
  $("[data-next]").addEventListener("click", async () => {
    if (!validate(step)) { const f = $(".step.active .err:not(:empty)"); f && f.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    if (step < 4) return go(step + 1);
    await submit();
  });

  async function submit() {
    const btn = $("[data-next]"); btn.disabled = true;
    try {
      if (!Store.current() && S.createAccount) await Store.register({ name: S.contact.name, email: S.contact.email, phone: S.contact.phone, company: S.contact.company, password: S.password, interest: S.type });
    } catch (e) { btn.disabled = false; A.toast(e.message); return; }
    const s = cur(); const Q = A.quote(qopts()); const instant = s.type === "meeting" || (s.type === "desk" && s.unit === "day");
    if (s.type === "desk" && s.unit === "day" && S.free && Store.freePassAvailable()) Store.useFreePass();
    const b = A.Store.addBooking({
      ref: A.ref(), spaceId: s.id, type: s.type, name: s.name, date: S.date,
      start: s.type === "meeting" ? S.start : null, hours: s.type === "meeting" ? S.hours : null, guests: S.guests, days: S.days, term: S.term,
      team: S.team, pref: S.pref, addons: S.addons, notes: S.notes, contact: S.contact, when: whenText(),
      total: Q.total, recurring: Q.recurring, deposit: Q.deposit, status: instant ? "confirmed" : "pending", created: new Date().toISOString()
    });
    done(b, s, instant);
  }

  function ics(b, s) {
    const d = b.date.replace(/-/g, ""); const p = (h) => String(Math.floor(h)).padStart(2, "0") + "0000";
    const startH = b.start ?? 8, endH = b.start != null ? b.start + b.hours : 18;
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grand Business Center//Booking//EN", "BEGIN:VEVENT", `UID:${b.ref}@grand-bc.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART;TZID=Asia/Muscat:${d}T${p(startH)}`, `DTEND;TZID=Asia/Muscat:${d}T${p(endH)}`,
      `SUMMARY:${s.name} — Grand Business Center`, `LOCATION:${C.address}`, `DESCRIPTION:Booking ${b.ref}. Reception: ${C.phones[0]}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  }

  function done(b, s, instant) {
    $("[data-flow]").hidden = true; const d = $("[data-done]"); d.hidden = false; A.renderAccount();
    const msg = `Hello Grand Business Center, I've just ${instant ? "booked" : "requested"} ${s.name} (${b.when}). Reference ${b.ref}. Name: ${b.contact.name}, ${b.contact.phone}.`;
    d.innerHTML = `<div class="confirm card">
      <div class="tick"><i data-lucide="check"></i></div>
      <h1 style="font-size:2.2rem">${instant ? "You're booked" : "Request sent"}</h1>
      <p class="ref">${b.ref}</p>
      <p class="lede" style="margin:0 auto 8px">${instant ? `${esc(s.name)} is reserved for you on ${esc(b.when)}. Show this reference at reception on the 5th floor.` : `Thanks, ${esc(b.contact.name.split(" ")[0])}. Our team will call you within one working day to confirm your ${esc(s.name.toLowerCase())} and next steps.`}</p>
      <p class="muted small">A copy has been saved to ${Store.current() ? "your account" : "this device"}. Send it to us on WhatsApp for a quicker reply.</p>
      <div class="confirm-actions">
        <a class="btn btn--wa" target="_blank" rel="noopener" href="${A.waLink(msg)}"><i data-lucide="message-circle"></i>Send on WhatsApp</a>
        ${instant ? `<a class="btn btn--ghost" href="${ics(b, s)}" download="${b.ref}.ics"><i data-lucide="calendar-plus"></i>Add to calendar</a>` : ""}
        ${Store.current() ? `<a class="btn btn--ghost" href="account.html">View my bookings</a>` : `<a class="btn btn--ghost" href="signup.html">Create an account</a>`}
      </div>
      <p class="small muted">Questions? Call <a href="tel:+96891580111">+968 9158 0111</a> or email <a href="mailto:${C.email}?subject=Booking%20${b.ref}">${C.email}</a>.</p>
    </div>`;
    icons(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderTypes(); go(step);
});
