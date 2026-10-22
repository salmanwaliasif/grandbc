/* Business setup planner + tour request */
document.addEventListener("DOMContentLoaded", () => {
  const A = GBCApp; const { $, $$, esc, Store, ymd, icons } = A;
  const u = Store.current();
  const err = (f, k, m) => { const e = $(`[data-err=${k}]`, f); if (e) e.textContent = m; if (f.elements[k]) f.elements[k].setAttribute("aria-invalid", m ? "true" : "false"); return !m; };
  const checkContact = (f) => {
    let ok = true;
    ok = err(f, "cname", f.cname.value.trim().length > 1 ? "" : "Enter your full name.") && ok;
    ok = err(f, "email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim()) ? "" : "Enter a valid email, like name@company.com.") && ok;
    ok = err(f, "phone", f.phone.value.replace(/\D/g, "").length >= 8 ? "" : "Enter a phone number with at least 8 digits.") && ok;
    return ok;
  };
  const prefill = (f) => { if (!u) return; f.cname.value = u.name; f.email.value = u.email; f.phone.value = u.phone; };
  function success(f, e) {
    f.innerHTML = `<div class="confirm"><div class="tick"><i data-lucide="check"></i></div><h2>Thanks, ${esc(e.name.split(" ")[0])}</h2><p class="ref">${e.ref}</p>
      <p>${esc(e.done)}</p><div class="confirm-actions"><a class="btn btn--wa" target="_blank" rel="noopener" href="${A.waLink(e.wa)}"><i data-lucide="message-circle"></i>Send on WhatsApp</a>
      ${u ? `<a class="btn btn--ghost" href="account.html#requests">View in my account</a>` : `<a class="btn btn--ghost" href="signup.html">Create an account</a>`}</div></div>`;
    icons(); f.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---- setup planner ---- */
  const sf = $("[data-setup]");
  if (sf) {
    prefill(sf);
    const pre = (new URLSearchParams(location.search).get("services") || "formation").split(",");
    $$(".chip", sf).forEach((c) => c.setAttribute("aria-pressed", pre.includes(c.dataset.id)));
    const chosen = () => $$(".chip[aria-pressed=true]", sf).map((c) => GBC.setupServices.find((s) => s.id === c.dataset.id).name);
    function sum() {
      const f = sf.elements; const list = chosen();
      $("[data-setup-sum]").innerHTML = `<h3>Your setup plan</h3>
        <ul class="sum-lines"><li><span>Activity</span><span>${esc(f.activity.value || "—")}</span></li><li><span>Ownership</span><span>${esc(f.owner.value)}</span></li>
        <li><span>Shareholders</span><span>${esc(f.shareholders.value)}</span></li><li><span>Visas</span><span>${esc(f.visas.value)}</span></li><li><span>Office</span><span>${esc(f.office.value)}</span></li><li><span>Start</span><span>${esc(f.when.value)}</span></li></ul>
        <div class="bands bands--line"></div>
        <p class="label" style="font-weight:700;color:var(--pine);margin-top:10px">${list.length} service${list.length === 1 ? "" : "s"}</p>
        <ul class="ticks small">${list.map((n) => `<li><i data-lucide="check"></i>${esc(n)}</li>`).join("") || "<li class='muted'>Pick at least one service</li>"}</ul>
        <p class="sum-note">You'll get a fixed quote covering government fees and our service.</p>`;
      icons();
    }
    sf.addEventListener("click", (e) => { if (e.target.closest(".chip")) setTimeout(sum); });
    sf.addEventListener("change", sum); sum();
    sf.addEventListener("submit", (e) => {
      e.preventDefault(); const f = sf.elements;
      let ok = err(sf, "activity", f.activity.value ? "" : "Choose your main activity.");
      ok = checkContact(sf) && ok;
      if (!chosen().length) { A.toast("Pick at least one service"); ok = false; }
      if (!ok) { $(".err:not(:empty)", sf)?.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
      const list = chosen();
      const en = Store.addEnquiry({ ref: A.ref().replace("GBC", "SET"), kind: "setup", title: "Business setup plan", email: f.email.value.trim().toLowerCase(), name: f.cname.value.trim(),
        summary: `${f.activity.value}, ${f.owner.value}. ${list.join(", ")}.`, created: new Date().toISOString() });
      success(sf, { ...en, done: "Our setup team will email or call you within one working day with a fixed quote and timeline.",
        wa: `Hello Grand Business Center, I'd like a business setup quote (ref ${en.ref}).\nActivity: ${f.activity.value}\nOwnership: ${f.owner.value}\nShareholders: ${f.shareholders.value}\nVisas: ${f.visas.value}\nOffice: ${f.office.value}\nServices: ${list.join(", ")}\nName: ${en.name}, ${f.phone.value}` });
    });
  }

  /* ---- tour ---- */
  const tf = $("[data-tour]");
  if (tf) {
    prefill(tf);
    const d = tf.date; d.min = ymd(new Date()); d.value = ymd(new Date(Date.now() + 864e5));
    $("[data-tour-what]").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"); });
    tf.addEventListener("submit", (e) => {
      e.preventDefault(); let ok = err(tf, "date", tf.date.value ? "" : "Choose a day.");
      ok = checkContact(tf) && ok; if (!ok) return;
      const what = $$("[data-tour-what] [aria-pressed=true]").map((c) => c.dataset.v).join(", ") || "General";
      const when = `${A.niceDate(tf.date.value)}, ${tf.time.value}`;
      const en = Store.addEnquiry({ ref: A.ref().replace("GBC", "TOUR"), kind: "tour", title: "Tour request", email: tf.email.value.trim().toLowerCase(), name: tf.cname.value.trim(), summary: `${what} — ${when}`, created: new Date().toISOString() });
      success(tf, { ...en, done: `We'll call you to confirm your tour on ${when}.`, wa: `Hello Grand Business Center, I'd like to book a tour (ref ${en.ref}).\nInterested in: ${what}\nWhen: ${when}\nName: ${en.name}, ${tf.phone.value}${tf.notes.value ? "\n" + tf.notes.value : ""}` });
    });
  }
});
