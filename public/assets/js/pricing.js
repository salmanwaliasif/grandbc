/* Pricing page: plans, rates table, cost calculator */
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, esc, omr, icons } = GBCApp; const C = GBC.company;
  const offices = GBC.spaces.filter((s) => s.type === "office");
  $("[data-plans]").innerHTML = offices.map((s) => `
    <div class="plan ${s.popular ? "plan--pick" : ""}">${s.popular ? '<span class="tag tag--pine">Most chosen</span>' : ""}
      <h3>${esc(s.name.replace(" office", ""))}</h3><p class="cap">${esc(s.capacity)}</p>
      <div class="amount">${s.price} <small>OMR / month</small></div>
      <ul>${s.features.map((f) => `<li><i data-lucide="check"></i>${esc(f)}</li>`).join("")}</ul>
      <a class="btn ${s.popular ? "" : "btn--ghost"}" href="book.html?space=${s.id}">Reserve ${esc(s.name.replace(" office", "").toLowerCase())}</a>
    </div>`).join("");

  const groups = [["meeting", "Meeting rooms"], ["desk", "Coworking"], ["virtual", "Virtual office"]];
  $("[data-rates]").innerHTML = `<thead><tr><th>Space</th><th>Capacity</th><th class="num">Price</th><th class="num">Half / full day</th><th></th></tr></thead><tbody>` +
    groups.map(([t, label]) => `<tr><td colspan="5" style="background:var(--frost);font-weight:700;color:var(--pine)">${label}</td></tr>` +
      GBC.spaces.filter((s) => s.type === t).map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.capacity)}</td><td class="num">${omr(s.price)} / ${s.unit}${s.billing === "annual" ? "<br><span class='small muted'>billed yearly</span>" : ""}</td><td class="num">${t === "meeting" ? `${omr(s.price * 3.5)} / ${omr(s.price * 6)}` : "—"}</td><td><a class="link-btn" href="book.html?space=${s.id}">Book</a></td></tr>`).join("")).join("") + "</tbody>";

  const st = { park: 0, phone: 0 };
  const plan = $("#c-plan");
  plan.innerHTML = offices.map((s) => `<option value="${s.id}" ${s.popular ? "selected" : ""}>${s.name} — ${s.capacity} — OMR ${s.price}</option>`).join("");
  function calc() {
    const s = GBC.spaces.find((x) => x.id === plan.value);
    const monthly = s.price + st.park * 25 + st.phone * 10; const vat = monthly * C.vat;
    $("[data-calc-out]").innerHTML = `<h3>${esc(s.name)}</h3><ul class="sum-lines">
      <li><span>Office rent</span><span>${omr(s.price)}</span></li>
      ${st.park ? `<li><span>Parking × ${st.park}</span><span>${omr(st.park * 25)}</span></li>` : ""}
      ${st.phone ? `<li><span>Extra lines × ${st.phone}</span><span>${omr(st.phone * 10)}</span></li>` : ""}
      <li><span>VAT 5%</span><span>${omr(vat)}</span></li></ul>
      <div class="sum-total"><span>Per month</span><strong>${omr(monthly + vat)}</strong></div>
      <ul class="sum-lines" style="margin-top:14px"><li><span>Refundable deposit</span><span>${omr(s.price * 3)}</span></li><li><span>12-month total</span><span>${omr((monthly + vat) * 12)}</span></li>
      ${$("#c-setup").checked ? `<li><span>Company formation</span><span>Quoted</span></li>` : ""}</ul>
      <a class="btn btn--light btn--block mt-2" href="book.html?space=${s.id}">Reserve this office</a>`;
  }
  $("[data-calc]").addEventListener("click", (e) => { const b = e.target.closest("[data-i],[data-d]"); if (!b) return; const k = b.dataset.i || b.dataset.d; st[k] = Math.max(0, Math.min(6, st[k] + (b.dataset.i ? 1 : -1))); $(`[data-o=${k}]`).textContent = st[k]; calc(); });
  $("[data-calc]").addEventListener("change", calc);
  calc(); icons();
});
