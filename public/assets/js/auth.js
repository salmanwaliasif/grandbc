/* Sign up + sign in */
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, Store, toast } = GBCApp;
  const next = () => { const n = new URLSearchParams(location.search).get("next"); return n && /^[a-z-]+\.html/.test(n) ? n : "account.html"; };
  const err = (f, k, m) => { const e = $(`[data-err=${k}]`, f); if (e) e.textContent = m; const i = f.elements[k]; if (i && i.setAttribute) i.setAttribute("aria-invalid", m ? "true" : "false"); return !m; };

  const su = $("[data-signup]");
  if (su) {
    if (Store.current()) location.replace("account.html");
    $("[data-interest]").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"); });
    $("[data-existing]").addEventListener("change", (e) => ($("[data-office]").hidden = !e.target.checked));
    su.addEventListener("submit", async (e) => {
      e.preventDefault(); const f = su.elements; let ok = true;
      ok = err(su, "name", f.name.value.trim().length > 1 ? "" : "Enter your full name.") && ok;
      ok = err(su, "email", /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim()) ? "" : "Enter a valid email, like name@company.com.") && ok;
      ok = err(su, "phone", f.phone.value.replace(/\D/g, "").length >= 8 ? "" : "Enter a mobile number with at least 8 digits.") && ok;
      ok = err(su, "password", f.password.value.length >= 8 ? "" : "Use at least 8 characters.") && ok;
      ok = err(su, "terms", f.terms.checked ? "" : "Please accept the terms to continue.") && ok;
      if (!ok) return;
      try {
        await Store.register({
          name: f.name.value, company: f.company.value, email: f.email.value, phone: f.phone.value, password: f.password.value,
          interest: $$("[data-interest] [aria-pressed=true]").map((c) => c.dataset.v).join(","),
          plan: f.existing.checked ? "office-member" : null
        });
        if (f.existing.checked) Store.updateUser({ office: f.office.value.trim() });
        toast("Account created. Welcome to Grand Business Center.");
        setTimeout(() => (location.href = next()), 600);
      } catch (ex) { err(su, "email", ex.message); }
    });
  }

  const li = $("[data-login]");
  if (li) {
    if (Store.current()) location.replace(next());
    li.addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await Store.login(li.email.value.trim(), li.password.value); location.href = next(); }
      catch (ex) { err(li, "login", ex.message + " Check for typos, or create an account."); }
    });
  }
});
