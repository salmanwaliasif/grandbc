/* Member dashboard */
document.addEventListener("DOMContentLoaded", () => {
  const A = GBCApp; const { $, $$, esc, Store, space, img, omr, ymd, niceDate, icons, toast } = A;
  let u = Store.current();
  if (!u) { location.replace("login.html?next=account.html"); return; }
  const panel = $("[data-panel]");
  $("[data-hello]").textContent = `Hello, ${u.name.split(" ")[0]}`;
  $("[data-sub]").textContent = u.plan === "office-member" ? `Office member${u.office ? `, office ${u.office}` : ""} — meeting rooms are included when you book.` : (u.company || "Manage your bookings, billing and requests.");

  const today = ymd(new Date());
  const statusTag = (b) => `<span class="status ${b.status === "pending" ? "status--pending" : b.status === "cancelled" ? "status--cancelled" : ""}">${b.status === "pending" ? "Awaiting confirmation" : b.status === "cancelled" ? "Cancelled" : "Confirmed"}</span>`;
  const isUpcoming = (b) => b.status !== "cancelled" && (b.date >= today || b.type === "office" || b.type === "virtual" || (b.type === "desk" && b.term > 1));
  const bkRow = (b) => {
    const s = space(b.spaceId) || { img: "glass-corridor" };
    const canCancel = b.status !== "cancelled" && b.date >= today;
    return `<div class="bk"><img src="${img(s.img, 1)}" alt=""><div><div class="flex" style="gap:8px"><h4>${esc(b.name)}</h4>${statusTag(b)}</div><p>${esc(b.when)}</p><p class="small muted">Ref ${b.ref} · ${omr(b.total)}${b.recurring ? " first month" : ""}</p></div>
      <div class="bk-actions">${canCancel ? `<button class="btn btn--ghost btn--sm" data-cancel="${b.ref}">Cancel</button>` : ""}<a class="btn btn--sm" href="book.html?space=${b.spaceId}">Book again</a></div></div>`;
  };
  const empty = (msg, cta) => `<div class="empty"><i data-lucide="calendar-plus"></i><h3>${msg}</h3><p class="muted">Meeting rooms from OMR 6 an hour, or try a desk free for a day.</p>${cta}</div>`;

  const views = {
    overview() {
      const mine = Store.myBookings(); const up = mine.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
      const spent = mine.filter((b) => b.status !== "cancelled").reduce((t, b) => t + b.total, 0);
      const hours = mine.filter((b) => b.type === "meeting" && b.status !== "cancelled").reduce((t, b) => t + b.hours, 0);
      return `<div class="stats"><div class="stat"><b>${up.length}</b><span>Upcoming bookings</span></div><div class="stat"><b>${hours}</b><span>Meeting-room hours booked</span></div><div class="stat"><b>${omr(spent)}</b><span>Total booked (incl. VAT)</span></div></div>
        <div class="flex between" style="margin-bottom:12px"><h2 style="font-size:1.4rem" class="mb-0">Coming up</h2><button class="link-btn" data-goto="bookings">See all bookings</button></div>
        <div class="blist">${up.length ? up.slice(0, 3).map(bkRow).join("") : empty("No upcoming bookings", `<a class="btn" href="book.html">Book a space</a> <a class="btn btn--ghost" href="book.html?space=desk-day&free=1">Claim free day pass</a>`)}</div>
        <div class="card mt-3 flex between"><div><h3 class="mb-0">Need help with anything?</h3><p class="muted mb-0">Our reception team replies on WhatsApp during working hours.</p></div><a class="btn btn--wa" href="${A.waLink(`Hello, this is ${u.name}${u.company ? " from " + u.company : ""}.`)}" target="_blank" rel="noopener"><i data-lucide="message-circle"></i>Message reception</a></div>`;
    },
    bookings() {
      const mine = Store.myBookings().sort((a, b) => b.created.localeCompare(a.created));
      return `<h2 style="font-size:1.4rem">All bookings</h2><div class="blist">${mine.length ? mine.map(bkRow).join("") : empty("You haven't booked anything yet", `<a class="btn" href="book.html">Book a space</a>`)}</div>`;
    },
    billing() {
      const mine = Store.myBookings().filter((b) => b.status !== "cancelled");
      const rows = mine.map((b) => `<tr><td>${b.ref}</td><td>${esc(b.name)}<br><span class="small muted">${esc(b.when)}</span></td><td>${b.status === "pending" ? "Issued after agreement" : "Pay at reception or bank transfer"}</td><td class="num">${omr(b.total)}</td><td><button class="link-btn" data-print="${b.ref}">${b.status === "pending" ? "Quote" : "Pro-forma"}</button></td></tr>`).join("");
      return `<h2 style="font-size:1.4rem">Billing</h2><p class="muted">Pro-forma invoices for your bookings. Amounts include 5% VAT.</p>
        ${mine.length ? `<div class="table-scroll"><table class="rate-table"><thead><tr><th>Ref</th><th>Booking</th><th>Payment</th><th class="num">Amount</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : empty("No invoices yet", `<a class="btn" href="book.html">Book a space</a>`)}`;
    },
    requests() {
      const mine = Store.enquiries().filter((e) => e.email === u.email).sort((a, b) => b.created.localeCompare(a.created));
      return `<h2 style="font-size:1.4rem">Setup and tour requests</h2>
        <div class="blist">${mine.length ? mine.map((e) => `<div class="bk" style="grid-template-columns:1fr auto"><div><div class="flex" style="gap:8px"><h4>${esc(e.title)}</h4><span class="status status--pending">With our team</span></div><p>${esc(e.summary)}</p><p class="small muted">Ref ${e.ref} · sent ${new Date(e.created).toLocaleDateString("en-GB")}</p></div></div>`).join("")
          : `<div class="empty"><i data-lucide="inbox"></i><h3>No requests yet</h3><p class="muted">Planning a company in Oman or want to see an office first?</p><a class="btn" href="business-setup.html">Plan my business setup</a> <a class="btn btn--ghost" href="contact.html#tour">Book a tour</a></div>`}</div>`;
    },
    profile() {
      return `<h2 style="font-size:1.4rem">Profile</h2><form class="card" data-profile novalidate>
        <div class="row2"><div class="field"><label for="p-name">Full name</label><input class="input" id="p-name" name="pname" value="${esc(u.name)}"></div><div class="field"><label for="p-company">Company</label><input class="input" id="p-company" name="company" value="${esc(u.company)}"></div></div>
        <div class="row2"><div class="field"><label for="p-email">Email</label><input class="input" id="p-email" value="${esc(u.email)}" disabled><span class="hint">Contact reception to change your login email.</span></div><div class="field"><label for="p-phone">Mobile number</label><input class="input" id="p-phone" name="phone" value="${esc(u.phone)}"></div></div>
        <label class="check"><input type="checkbox" name="member" ${u.plan === "office-member" ? "checked" : ""}><span>I rent an office at Grand Business Center</span></label>
        <div class="field mt-2"><label for="p-office">Office number</label><input class="input" id="p-office" name="office" value="${esc(u.office || "")}"></div>
        <div class="flex between mt-2"><button class="btn" type="submit">Save changes</button><button class="btn btn--ghost" type="button" data-logout>Sign out</button></div></form>`;
    }
  };

  function show(tab) {
    $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab));
    panel.innerHTML = views[tab](); icons(); history.replaceState(null, "", "#" + tab);
  }
  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  panel.addEventListener("click", (e) => {
    const g = e.target.closest("[data-goto]"); if (g) show(g.dataset.goto);
    const c = e.target.closest("[data-cancel]");
    if (c) {
      if (c.dataset.armed) { Store.updateBooking(c.dataset.cancel, { status: "cancelled" }); toast("Booking cancelled"); show($("[aria-selected=true]").dataset.tab); }
      else { c.dataset.armed = "1"; c.textContent = "Tap again to cancel"; c.classList.remove("btn--ghost"); c.style.background = "var(--danger)"; setTimeout(() => { if (c.isConnected) { delete c.dataset.armed; c.textContent = "Cancel"; c.classList.add("btn--ghost"); c.style.background = ""; } }, 4000); }
    }
    const p = e.target.closest("[data-print]"); if (p) printDoc(Store.bookings().find((b) => b.ref === p.dataset.print));
  });
  panel.addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    u = Store.updateUser({ name: f.pname.value.trim() || u.name, company: f.company.value.trim(), phone: f.phone.value.trim(), plan: f.member.checked ? "office-member" : null, office: f.office.value.trim() });
    toast("Changes saved"); $("[data-hello]").textContent = `Hello, ${u.name.split(" ")[0]}`;
  });

  function printDoc(b) {
    const C = GBC.company; const net = b.total / 1.05;
    const w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups to view the document"); return; }
    w.document.write(`<!doctype html><title>${b.ref}</title><style>body{font:15px/1.5 system-ui;margin:40px;color:#15211C}h1{color:#0F3D2C;margin:0}table{width:100%;border-collapse:collapse;margin:24px 0}td,th{padding:10px;border-bottom:1px solid #D6E2DB;text-align:left}.r{text-align:right}.muted{color:#74847C}</style>
      <h1>${C.legal}</h1><p class="muted">${C.address}<br>${C.postal}<br>CR ${C.cr} · ${C.email} · ${C.phones[0]}</p>
      <h2>${b.status === "pending" ? "Quotation" : "Pro-forma invoice"} ${b.ref}</h2><p>Billed to: <b>${esc(b.contact.name)}</b>${b.contact.company ? ", " + esc(b.contact.company) : ""}<br>${esc(b.contact.email)}</p>
      <table><tr><th>Description</th><th class="r">Amount</th></tr><tr><td>${esc(b.name)} — ${esc(b.when)}</td><td class="r">${omr(net)}</td></tr><tr><td>VAT 5%</td><td class="r">${omr(b.total - net)}</td></tr><tr><th>Total</th><th class="r">${omr(b.total)}</th></tr></table>
      <p class="muted">Prototype document generated by the Grand Business Center website.</p><script>print()<\/script>`);
    w.document.close();
  }

  show((location.hash || "#overview").slice(1) in views ? location.hash.slice(1) || "overview" : "overview");
});
