#!/usr/bin/env python3
"""Injects the shared <head> assets, header and footer into every page in public/.

Pages keep their own content; the blocks between the @head/@header/@footer
markers are regenerated each time you run:  python3 build.py
Also rebuilds a slim icon bundle containing only the Lucide icons the site uses.
"""
import re, pathlib, json, subprocess

ROOT = pathlib.Path(__file__).parent / "public"

HEAD = """<!-- @head:start -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0F3D2C">
<link rel="icon" type="image/png" href="favicon.png">
<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/site.css">
<script>if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver"in window){document.documentElement.classList.add("motion");setTimeout(function(){var h=document.querySelector("[data-hero]");h&&h.classList.add("hero-in")},2500)}</script>
<script src="assets/js/data.js" defer></script>
<script src="assets/vendor/icons.js" defer></script>
<script src="assets/js/app.js" defer></script>
<script src="assets/js/motion.js" defer></script>
<!-- @head:end -->"""

NAV = [
    ("spaces", "spaces.html", "Spaces"),
    ("meeting", "meeting-rooms.html", "Meeting rooms"),
    ("setup", "business-setup.html", "Business setup"),
    ("pricing", "pricing.html", "Pricing"),
    ("contact", "contact.html", "Visit us"),
]

def nav_links():
    return "\n".join(f'        <li><a href="{h}" data-nav="{k}">{t}</a></li>' for k, h, t in NAV)

HEADER = f"""<!-- @header:start -->
<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap">
  <span class="tb-hours">Open 24/7 for members. Enquiries answered within one working day.</span>
  <span class="tb-links"><a href="tel:+96891580111">+968 9158 0111</a><a class="tb-mail" href="mailto:info@grand-bc.com">info@grand-bc.com</a></span>
</div></div>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="index.html" aria-label="Grand Business Center, home">
      <img src="assets/brand/mark.svg" alt="" width="34" height="43">
      <span class="brand-text"><span class="brand-name">Grand Business Center</span><span class="brand-ar" lang="ar">مركز الكبير للأعمال</span></span>
    </a>
    <nav aria-label="Main"><ul class="nav-links">
{nav_links()}
    </ul></nav>
    <div class="nav-actions">
      <span data-account-slot></span>
      <a class="btn btn--sm" href="book.html">Book a space</a>
    </div>
    <button class="nav-toggle" type="button" aria-label="Open menu"><i data-lucide="menu"></i></button>
  </div>
</header>
<div class="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="drawer-bg"></div>
  <div class="drawer-panel">
    <button class="drawer-close" type="button" aria-label="Close menu"><i data-lucide="x"></i></button>
    <a href="index.html">Home</a>
{chr(10).join(f'    <a href="{h}">{t}</a>' for k, h, t in NAV)}
    <span data-drawer-account style="display:contents"></span>
    <a class="btn" href="book.html">Book a space</a>
    <a class="btn btn--wa" href="#" data-wa><i data-lucide="message-circle"></i>WhatsApp us</a>
  </div>
</div>
<!-- @header:end -->"""

FOOTER = """<!-- @footer:start -->
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="index.html"><img src="assets/brand/mark.svg" alt="" width="34" height="43"><span class="brand-text"><span class="brand-name">Grand Business Center</span><span class="brand-ar" lang="ar">مركز الكبير للأعمال</span></span></a>
        <p>Serviced offices, meeting rooms and company formation at Muscat Grand Mall — helping Oman's entrepreneurs, SMEs and investors for over 10 years.</p>
      </div>
      <div>
        <h4>Workspaces</h4>
        <ul>
          <li><a href="spaces.html?type=office">Private offices</a></li>
          <li><a href="meeting-rooms.html">Meeting rooms</a></li>
          <li><a href="spaces.html?type=desk">Coworking desks</a></li>
          <li><a href="spaces.html?type=virtual">Virtual office</a></li>
          <li><a href="book.html?space=desk-day&amp;free=1">Free day pass</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="business-setup.html">Business setup</a></li>
          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="contact.html">Visit us</a></li>
          <li><a href="signup.html">Become a member</a></li>
          <li><a href="account.html">My bookings</a></li>
        </ul>
      </div>
      <div>
        <h4>Find us</h4>
        <p>Building 4, 5th Floor, Tilal Offices<br>Muscat Grand Mall, Al Khuwair<br>P.O. Box 7, PC 136, Sultanate of Oman</p>
        <p><a href="tel:+96891580111">+968 9158 0111</a><br><a href="tel:+96894990212">+968 9499 0212</a><br><a href="mailto:info@grand-bc.com">info@grand-bc.com</a></p>
      </div>
    </div>
    <div class="foot-legal">
      <span>© <span data-year></span> Grand Business Center LLC, CR No. 1382948</span>
      <span>Workplace for today; flexibility for tomorrow</span>
    </div>
  </div>
</footer>
<a class="wa-float" href="#" data-wa aria-label="Chat with us on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.62l6.02-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03"/></svg></a>
<!-- @footer:end -->"""

def inject(text, name, block):
    pat = re.compile(rf"<!-- @{name}:start -->.*?<!-- @{name}:end -->|<!-- @{name} -->", re.S)
    return pat.sub(lambda m: block, text, count=1)

def build_icons():
    """Write assets/vendor/icons.js with only the icons referenced in pages + scripts."""
    used = set()
    for f in list(ROOT.glob("*.html")) + list((ROOT / "assets/js").glob("*.js")) + [pathlib.Path(__file__)]:
        t = f.read_text(encoding="utf-8")
        used |= set(re.findall(r'data-lucide="([a-z0-9-]+)"', t))
        used |= set(re.findall(r'icon:\s*"([a-z0-9-]+)"', t))
        used |= set(re.findall(r'\["([a-z0-9-]+)",\s*"[^"]+",\s*"[^"]+"\]', t))
    used = {u for u in used if not (ROOT / "assets/img" / f"{u}.webp").exists()}
    used |= {"x", "chevron-left", "chevron-right", "menu", "message-circle"}
    src = ROOT / "assets/vendor/lucide.min.js"
    if not src.exists():
        print("lucide.min.js missing; skipping icon bundle"); return
    js = f"""
global.window = global; global.self = global;
const L = require({json.dumps(str(src))}); const want = {json.dumps(sorted(used))}; const out = {{}}; const missing = [];
const pascal = (n) => n.replace(/(^|-)([a-z0-9])/g, (m, a, b) => b.toUpperCase());
for (const n of want) {{ const ic = L.icons[pascal(n)]; if (ic) out[n] = ic; else missing.push(n); }}
if (missing.length) console.error("MISSING ICONS:", missing.join(", "));
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(["node", "-e", js], capture_output=True, text=True)
    if res.stderr: print(res.stderr.strip())
    if res.returncode != 0: raise SystemExit("icon build failed")
    data = res.stdout
    runtime = """(function(){var I=%s;function el(t,a){var e=document.createElementNS("http://www.w3.org/2000/svg",t);for(var k in a)e.setAttribute(k,a[k]);return e}
function toSvg(node,name,extra){var s=el("svg",{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round","class":"lucide lucide-"+name,"aria-hidden":"true"});
(node[0]==="svg"?node[2]:node).forEach(function(c){s.appendChild(el(c[0],c[1]))});return s}
window.lucide={createIcons:function(){document.querySelectorAll("i[data-lucide]").forEach(function(i){var n=i.getAttribute("data-lucide"),d=I[n];if(!d)return;var s=toSvg(d,n);if(i.className)s.setAttribute("class",s.getAttribute("class")+" "+i.className);i.replaceWith(s)})}};})();""" % data
    (ROOT / "assets/vendor/icons.js").write_text(runtime, encoding="utf-8")
    print(f"icons.js: {len(used)} icons, {len(runtime)//1024} KB")

def main():
    for f in sorted(ROOT.glob("*.html")):
        t = f.read_text(encoding="utf-8")
        t2 = inject(inject(inject(t, "head", HEAD), "header", HEADER), "footer", FOOTER)
        if t2 != t:
            f.write_text(t2, encoding="utf-8")
        print("built", f.name)
    build_icons()

if __name__ == "__main__":
    main()
