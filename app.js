/* Viltrum Tek · Cotizador v2 (prueba). Vanilla JS, sin build.
 * Novedades v2: tema claro/oscuro, cotizaciones guardadas + edición con revisiones (VT-…-R2), enlace compartible
 * con el estado comprimido en el hash (#q=…, nunca llega a ningún servidor), Compartir (Web Share / copiar). */
(function () {
  "use strict";
  const C = window.VT_CATALOG, CFG = window.VT_CONFIG || {};
  const byId = Object.fromEntries(C.items.map(i => [i.id, i]));
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const LS_CART = "vt_cart_v1", LS_FORM = "vt_form_v1", LS_SAVED = "vt_saved_v2", LS_EDIT = "vt_edit_v2", LS_THEME = "vt_theme";
  const BASE_RE = /^VT-\d{6}-[A-Z0-9]{4}$/;

  // ---------- params (?wa= / ?ref= / ?cat=) ----------
  const qs = new URLSearchParams(location.search);
  const params = {
    wa: (qs.get("wa") || "").replace(/[^\d+]/g, "").slice(0, 20),
    ref: (qs.get("ref") || "").slice(0, 60),
    cat: qs.get("cat") || "",
    utm: ["utm_source", "utm_medium", "utm_campaign"].reduce((o, k) => (qs.get(k) && (o[k] = qs.get(k).slice(0, 60)), o), {})
  };

  // ---------- helpers ----------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const unitLbl = u => u === "año" || u === "mes" ? "/año" : "";
  function priceText(it) {
    if (it.min == null) return "A cotizar";
    if (it.min === 0 && !it.max) return "Incluido · $0";
    return (it.max ? "Desde " : "") + money(it.min) + unitLbl(it.unit);
  }
  const rangeText = it => it.min != null && it.max && it.max !== it.min ? `Rango publicado: ${money(it.min)} - ${money(it.max)}${unitLbl(it.unit)}` : "";
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 2200); }
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const fmtDate = iso => new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });
  const fullNo = (base, rev) => rev > 1 ? `${base}-R${rev}` : base;

  // ---------- tema ----------
  function setTheme(t, persist = true) {
    document.documentElement.dataset.theme = t;
    if (persist) try { localStorage.setItem(LS_THEME, t); } catch {}
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#0a0a0a" : "#f8f5ee";
    $("#themeToggle").setAttribute("aria-label", t === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }
  $("#themeToggle").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");

  // ---------- state ----------
  let cart = load(LS_CART, {});                // { itemId: qty }
  Object.keys(cart).forEach(k => { if (!byId[k] || !(cart[k] >= 1)) delete cart[k]; });
  let activeCat = C.categories.some(c => c.id === params.cat) ? params.cat : C.categories[0].id;
  let lastQuote = null;
  let editing = load(LS_EDIT, null);           // { base } cotización que se está editando
  let saved = load(LS_SAVED, []);              // [{ base, rev, quote, cart, sig, history:[{rev,quote_no,at,total}] }]

  function totalsFor(c) {
    const t = { oneMin: 0, oneMax: 0, yrMin: 0, yrMax: 0, tbd: [], count: 0 };
    for (const [id, q] of Object.entries(c)) {
      const it = byId[id]; if (!it) continue; t.count += q;
      if (it.min == null) { t.tbd.push(it.name); continue; }
      const mx = (it.max ?? it.min) * q, mn = it.min * q;
      if (it.unit === "año") { t.yrMin += mn; t.yrMax += mx; }
      else if (it.unit === "mes") { t.yrMin += mn * 12; t.yrMax += mx * 12; } // por si quedara algo mensual: se cobra anual
      else { t.oneMin += mn; t.oneMax += mx; }
    }
    return t;
  }
  const totals = () => totalsFor(cart);
  const rng = (a, b, u = "") => a === b ? money(a) + u : `${money(a)} - ${money(b)}${u}`;
  const dop = n => "RD$" + Math.round(n * (CFG.DOP_RATE || 0)).toLocaleString("en-US");

  // ---------- catálogo ----------
  function renderCats() {
    $("#cats").innerHTML = C.categories.map(c =>
      `<button class="cat" type="button" data-cat="${c.id}" aria-pressed="${c.id === activeCat}">${esc(c.icon)} ${esc(c.name)}</button>`).join("");
  }
  function card(it) {
    const inCart = !!cart[it.id];
    const feats = it.features || [];
    const shown = feats.slice(0, 4), more = feats.slice(4);
    const meta = [it.pages, it.timeline && it.timeline !== "a confirmar" ? "Entrega " + it.timeline : "", it.support && it.support !== "a confirmar" ? "Soporte " + it.support : ""].filter(Boolean);
    return `<article class="card corners${it.addon ? " sm" : ""}${inCart ? " sel" : ""}" data-id="${it.id}">
      ${it.badge ? `<span class="badge">${esc(it.badge)}</span>` : ""}
      <h3>${esc(it.name)}</h3>
      <div class="price">${esc(priceText(it))}${it.unit === "proyecto" && it.min ? `<small>pago único</small>` : ""}</div>
      ${rangeText(it) ? `<div class="range">${esc(rangeText(it))}</div>` : ""}
      <p>${esc(it.desc)}</p>
      ${shown.length ? `<ul>${shown.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
      ${more.length ? `<details><summary>Ver ${more.length} más</summary><ul>${more.map(f => `<li>${esc(f)}</li>`).join("")}</ul></details>` : ""}
      ${meta.length ? `<div class="meta">${meta.map(m => `<span>${esc(m)}</span>`).join("")}</div>` : ""}
      <button class="btn add ${inCart ? "added" : "gold"}" type="button" data-add="${it.id}">${inCart ? "✓ Agregado · quitar" : "Agregar"}</button>
    </article>`;
  }
  function renderCatalog() {
    const cat = C.categories.find(c => c.id === activeCat);
    const items = C.items.filter(i => i.cat === activeCat);
    const plans = items.filter(i => !i.addon), addons = items.filter(i => i.addon);
    $("#catalog").innerHTML = `<h2>${esc(cat.name)}</h2><p class="cat-blurb">${esc(cat.blurb)}</p>
      <div class="grid">${plans.map(card).join("")}</div>
      ${addons.length ? `<h2 style="margin-top:22px;font-size:17px">Extras para tu plan</h2><div class="grid compact" style="margin-top:12px">${addons.map(card).join("")}</div>` : ""}`;
  }

  // ---------- carrito ----------
  function add(id) {
    const it = byId[id];
    if (cart[id]) { delete cart[id]; toast("Quitado"); }
    else {
      if (it.group) for (const k of Object.keys(cart)) if (byId[k].group === it.group) delete cart[k]; // un nivel por familia
      cart[id] = 1; toast("Agregado ✓");
    }
    persistCart(); renderCatalog();
  }
  function persistCart() { save(LS_CART, cart); renderCartBar(); if (!$("#cartSheet").hidden) renderCart(); }
  function renderCartBar() {
    const t = totals();
    $("#cartbar").hidden = t.count === 0;
    $("#cartCount").textContent = t.count;
    $("#cartTotal").textContent = money(t.oneMin) + (t.tbd.length ? " +" : "");
    $("#cartMonthly").textContent = t.yrMin || t.yrMax ? `+ ${rng(t.yrMin, t.yrMax, "/año")}` : "";
  }
  function totalsHtml(t) {
    let h = `<div><span>Inversión inicial desde</span><b class="big">${money(t.oneMin)}</b></div>`;
    if (t.oneMax !== t.oneMin) h += `<div><small>Rango estimado</small><small>${rng(t.oneMin, t.oneMax)}</small></div>`;
    if (t.yrMin || t.yrMax) { h += `<div><span>Recurrente anual</span><b>${rng(t.yrMin, t.yrMax, "/año")}</b></div>`;
      h += `<div><span>Total primer año desde</span><b>${money(t.oneMin + t.yrMin)}</b></div>`; }
    if (t.tbd.length) h += `<div><small>A cotizar</small><small>${esc(t.tbd.join(", "))}</small></div>`;
    if (CFG.DOP_RATE) h += `<div><small>≈ en pesos (tasa referencial 1 USD ≈ RD$${CFG.DOP_RATE})</small><small>${dop(t.oneMin)}</small></div>`;
    return h;
  }
  function renderCart() {
    const ids = Object.keys(cart);
    $("#cartList").innerHTML = ids.length ? ids.map(id => {
      const it = byId[id], q = cart[id];
      const sub = it.min == null ? "A cotizar" : money(it.min * q) + unitLbl(it.unit);
      return `<div class="ci"><b>${esc(it.name)}</b><span class="p">${sub}</span>
        <small>${esc(rangeText(it) || priceText(it))}</small><span></span>
        <div class="ctl">${it.group ? "" : `<button type="button" data-dec="${id}" aria-label="Menos">−</button><span>${q}</span><button type="button" data-inc="${id}" aria-label="Más">+</button>`}
        <button type="button" class="rm" data-rm="${id}">Quitar</button></div></div>`;
    }).join("") : `<p class="empty">Aún no agregas servicios.</p>`;
    $("#cartTotals").innerHTML = ids.length ? totalsHtml(totals()) : "";
    $("#cartTotals").hidden = !ids.length;
    $("#cartCheckout").disabled = !ids.length;
  }

  // ---------- sheets ----------
  function open(id) { $$(".sheet").forEach(s => s.hidden = true); $(id).hidden = false; document.body.style.overflow = "hidden"; }
  function closeAll() { $$(".sheet").forEach(s => s.hidden = true); document.body.style.overflow = ""; }

  // ---------- formulario ----------
  let step = 1;
  const form = $("#quoteForm");
  function chipVals(name) { return $$(`.chips[data-name="${name}"] button[aria-pressed=true]`).map(b => b.dataset.v); }
  function readForm() {
    const f = Object.fromEntries(new FormData(form).entries());
    return {
      business: (f.business || "").trim(), contact: (f.contact || "").trim(), whatsapp: (f.whatsapp || "").trim(),
      email: (f.email || "").trim(), niche: f.niche || "", notes: (f.notes || "").trim(),
      goals: chipVals("goals"), deadline: chipVals("deadline")[0] || "", has: chipVals("has"), consent: !!f.consent
    };
  }
  function setForm(f = {}) {
    for (const k of ["business", "contact", "whatsapp", "email", "niche", "notes"]) if (form.elements[k]) form.elements[k].value = f[k] || "";
    form.elements.consent.checked = !!f.consent;
    for (const n of ["goals", "deadline", "has"]) {
      const vals = Array.isArray(f[n]) ? f[n] : f[n] ? [f[n]] : [];
      $$(`.chips[data-name="${n}"] button`).forEach(b => b.setAttribute("aria-pressed", String(vals.includes(b.dataset.v))));
    }
  }
  function restoreForm() {
    const f = load(LS_FORM, {});
    if (params.wa && !f.whatsapp) f.whatsapp = "+" + params.wa.replace(/^\+/, "");
    setForm(f);
  }
  const saveForm = () => save(LS_FORM, readForm());
  function validate(s) {
    const f = readForm();
    if (s === 1) {
      if (!f.business) return "Escribe el nombre de tu negocio.";
      if (!f.contact) return "Escribe tu nombre.";
      if (f.whatsapp.replace(/\D/g, "").length < 10) return "Escribe un WhatsApp válido (con código de área).";
      if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return "Revisa el correo.";
    }
    if (s === 2) { if (!f.niche) return "Selecciona tu nicho."; if (!f.goals.length) return "Elige al menos un objetivo."; }
    if (s === 3) { if (!f.deadline) return "Elige un plazo."; if (!f.consent) return "Necesitamos tu autorización para preparar la propuesta."; }
    return "";
  }
  function showStep(s) {
    step = s;
    $$(".step").forEach(fs => fs.hidden = +fs.dataset.step !== s);
    $("#progressBar").style.width = (s / 3 * 100) + "%";
    $("#prevStep").style.visibility = s === 1 ? "hidden" : "visible";
    const sv = editing && getSaved(editing.base);
    $("#nextStep").textContent = s === 3 ? (sv ? `Generar revisión R${sv.rev + 1}` : "Generar cotización") : "Siguiente";
    $("#formErr").textContent = "";
  }

  // ---------- guardadas / edición ----------
  const getSaved = base => saved.find(s => s.base === base);
  const persistSaved = () => { saved.sort((a, b) => (b.quote.created_at || "").localeCompare(a.quote.created_at || "")); save(LS_SAVED, saved.slice(0, 30)); renderSavedCount(); };
  function sigOf(c, f) { const { consent, ...rest } = f; return JSON.stringify([Object.entries(c).sort(), rest]); }
  function upsertSaved(q, c) {
    let s = getSaved(q.base_no);
    const h = { rev: q.rev, quote_no: q.quote_no, at: q.created_at, total: q.totals.oneMin };
    if (!s) { s = { base: q.base_no, history: [] }; saved.push(s); }
    if (s.rev && s.rev > q.rev) return s;               // ya hay una revisión más nueva
    Object.assign(s, { rev: q.rev, quote: q, cart: { ...c }, sig: sigOf(c, q.client) });
    if (!s.history.some(x => x.rev === q.rev)) s.history.push(h);
    persistSaved(); return s;
  }
  function setEditing(base) {
    editing = base ? { base } : null; save(LS_EDIT, editing); renderEditNote();
  }
  function renderEditNote() {
    const s = editing && getSaved(editing.base);
    $("#editNote").hidden = !s;
    if (s) { $("#editNo").textContent = s.quote.quote_no; $("#editNext").textContent = `revisión R${s.rev + 1}`; }
  }
  function renderSavedCount() { const n = saved.length; $("#savedCount").hidden = !n; $("#savedCount").textContent = n; }
  function renderSaved() {
    $("#savedList").innerHTML = saved.length ? saved.map(s => {
      const q = s.quote, t = q.totals;
      return `<article class="sv corners sm" data-base="${esc(s.base)}">
        <div class="sv-top"><span class="sv-no">${esc(q.quote_no)}</span><span class="sv-total">${money(t.oneMin)}${t.yrMin || t.yrMax ? `<small style="color:var(--mut);font-weight:500"> + ${rng(t.yrMin, t.yrMax, "/año")}</small>` : ""}</span></div>
        <div class="sv-meta">${esc(q.client.business)} · ${q.items.length} servicio${q.items.length === 1 ? "" : "s"} · ${fmtDate(q.created_at)}${s.history.length > 1 ? ` · ${s.history.length} revisiones` : ""}</div>
        <div class="sv-actions">
          <button type="button" class="pri" data-sv="open">Abrir</button>
          <button type="button" data-sv="edit">Editar</button>
          <button type="button" data-sv="pdf">PDF</button>
          <button type="button" class="wa" data-sv="wa">WhatsApp</button>
          <button type="button" data-sv="share">Compartir</button>
          <button type="button" class="del" data-sv="del" aria-label="Eliminar">✕</button>
        </div></article>`;
    }).join("") : `<p class="empty">Aún no tienes cotizaciones guardadas.</p>`;
  }
  function loadIntoEditor(s) {
    cart = { ...s.cart }; persistCart();
    setForm({ ...s.quote.client }); saveForm();
    setEditing(s.base); lastQuote = s.quote;
    renderCatalog();
  }
  function newQuote() {
    setEditing(null); lastQuote = null; cart = {}; persistCart(); renderCatalog();
    const f = readForm(); setForm({ business: f.business, contact: f.contact, whatsapp: f.whatsapp, email: f.email, niche: f.niche }); saveForm();
    toast("Nueva cotización: elige servicios");
  }

  // ---------- enlace compartible (#q=…) ----------
  const b64u = bytes => { let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb64u = str => { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); };
  async function pack(obj) {
    const json = JSON.stringify(obj);
    if (window.CompressionStream) {
      const st = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      return "z" + b64u(new Uint8Array(await new Response(st).arrayBuffer()));
    }
    return "j" + b64u(new TextEncoder().encode(json));
  }
  async function unpack(str) {
    const bytes = unb64u(str.slice(1));
    if (str[0] === "z") { const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw")); return JSON.parse(await new Response(st).text()); }
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  async function shareUrl(q, c) {
    const f = q.client;
    const st = { v: 2, n: q.base_no, r: q.rev, d: q.created_at, c: Object.entries(c), ref: q.ref, wa: q.wa_param,
      f: [f.business, f.contact, f.whatsapp, f.email, f.niche, f.notes, f.goals, f.deadline, f.has] };
    return `${location.origin}${location.pathname}#q=${await pack(st)}`;
  }
  const S = (v, n = 200) => String(v ?? "").slice(0, n);
  function quoteFromState(st) {
    if (!st || !BASE_RE.test(st.n || "")) throw new Error("enlace inválido");
    const rev = Math.max(1, Math.min(99, parseInt(st.r, 10) || 1));
    const c = {}; for (const [id, q] of st.c || []) if (byId[id]) c[id] = Math.max(1, Math.min(20, parseInt(q, 10) || 1));
    const [business, contact, whatsapp, email, niche, notes, goals, deadline, has] = st.f || [];
    const client = { business: S(business, 120), contact: S(contact, 120), whatsapp: S(whatsapp, 30), email: S(email, 120), niche: S(niche, 60),
      notes: S(notes, 600), goals: (goals || []).map(g => S(g, 60)).slice(0, 10), deadline: S(deadline, 60), has: (has || []).map(g => S(g, 60)).slice(0, 10), consent: true };
    const created = isNaN(Date.parse(st.d)) ? new Date() : new Date(st.d);
    return { cart: c, quote: buildQuote({ base: st.n, rev, cartObj: c, client, created, ref: st.ref || null, wa: st.wa || null }) };
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); return ok; }
  }
  async function shareQuote(q, c, viaButton = true) {
    const url = await shareUrl(q, c);
    $("#shareLink").value = url; $("#shareBox").hidden = false;
    const data = { title: `Cotización ${q.quote_no} · Viltrum Tek`, text: `Cotización ${q.quote_no} - ${q.client.business} (Viltrum Tek)`, url };
    if (viaButton && navigator.share) { try { await navigator.share(data); return url; } catch (e) { if (e.name === "AbortError") return url; } }
    toast(await copy(url) ? "Enlace copiado ✓" : "Copia el enlace de abajo");
    return url;
  }

  // ---------- cotización ----------
  function quoteNo(d = new Date()) {
    const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", r = new Uint32Array(4); crypto.getRandomValues(r);
    const p = n => String(n).padStart(2, "0");
    return `VT-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${[...r].map(x => A[x % A.length]).join("")}`;
  }
  function buildQuote(o = {}) {
    const now = o.created || new Date(), valid = new Date(now.getTime() + C.terms.validityDays * 864e5);
    const c = o.cartObj || cart, base = o.base || quoteNo(now), rev = o.rev || 1;
    const items = Object.entries(c).map(([id, qty]) => {
      const it = byId[id]; return { id, name: it.name, cat: it.cat, qty, min: it.min, max: it.max ?? it.min, unit: it.unit, source: it.source };
    });
    return {
      quote_no: fullNo(base, rev), base_no: base, rev, revision_of: o.revisionOf || null,
      created_at: now.toISOString(), valid_until: valid.toISOString(),
      client: o.client || readForm(), items, totals: totalsFor(c),
      ref: o.ref !== undefined ? o.ref : (params.ref || null), wa_param: o.wa !== undefined ? o.wa : (params.wa || null), utm: params.utm,
      page: location.origin + location.pathname, ua: navigator.userAgent.slice(0, 160), lang: navigator.language,
      dop_rate: CFG.DOP_RATE || null, catalog_version: C.updated
    };
  }
  function waMessage(q) {
    const t = q.totals, c = q.client;
    const lines = [q.rev > 1 ? `Hola Viltrum Tek 👋 Actualicé mi cotización: *${q.quote_no}* (revisión ${q.rev}, reemplaza a ${q.revision_of || q.base_no}).` : `Hola Viltrum Tek 👋 Generé mi cotización *${q.quote_no}*.`,
      `Negocio: ${c.business} (${c.niche})`, `Contacto: ${c.contact}`, "Servicios:"];
    q.items.forEach(i => lines.push(`• ${i.name}${i.qty > 1 ? " x" + i.qty : ""} — ${i.min == null ? "a cotizar" : money(i.min * i.qty) + unitLbl(i.unit)}`));
    let tot = `Total: desde ${money(t.oneMin)}`;
    if (t.oneMax !== t.oneMin) tot += ` (rango ${rng(t.oneMin, t.oneMax)})`;
    if (t.yrMin || t.yrMax) tot += ` + ${rng(t.yrMin, t.yrMax, "/año")}`;
    lines.push(tot + " USD");
    lines.push(`Objetivo: ${c.goals.join(", ")}`);
    lines.push(`Plazo: ${c.deadline}${c.has.length ? " · Ya tengo: " + c.has.join(", ") : ""}`);
    if (c.notes) lines.push(`Nota: ${c.notes.slice(0, 160)}`);
    return lines.join("\n");
  }
  const waUrl = q => `https://wa.me/${CFG.WA_NUMBER || C.company.wa}?text=${encodeURIComponent(waMessage(q))}`;

  // ---------- persistencia de leads (relay cifrado / colector / Firestore) ----------
  async function persistLead(payload, type = "quote") {
    const body = JSON.stringify({ type, ...payload });
    const jobs = [];
    const ep = CFG.LEADS_ENDPOINT || (/^https?:$/.test(location.protocol) && !location.hostname.endsWith("github.io") ? location.origin : "");
    if (ep) jobs.push(fetch(ep.replace(/\/$/, "") + "/api/quotes", {
      method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body, keepalive: true, mode: "cors" }));
    if (CFG.NTFY && CFG.NTFY.topic && CFG.NTFY.publicKeyJwk && window.crypto && crypto.subtle) jobs.push(sealAndRelay(body));
    const fs = CFG.FIRESTORE || {};
    if (fs.projectId && fs.apiKey && (type === "quote" || type === "revision")) {
      const url = `https://firestore.googleapis.com/v1/projects/${fs.projectId}/databases/(default)/documents/${fs.collection || "quotes"}?documentId=${encodeURIComponent(payload.quote_no)}&key=${fs.apiKey}`;
      const Sv = v => ({ stringValue: String(v ?? "") });
      jobs.push(fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: {
        quote_no: Sv(payload.quote_no), created_at: { timestampValue: payload.created_at }, business: Sv(payload.client.business),
        whatsapp: Sv(payload.client.whatsapp), niche: Sv(payload.client.niche), total_min: { doubleValue: payload.totals.oneMin },
        ref: Sv(payload.ref), wa_param: Sv(payload.wa_param), json: Sv(body) } }) }));
    }
    const res = await Promise.allSettled(jobs);
    return res.some(r => r.status === "fulfilled" && r.value.ok);
  }
  // Cifrado híbrido: gzip → AES-GCM (clave aleatoria) → clave envuelta con RSA-OAEP-256 (pública). Formato vt1.<z>.<key>.<iv>.<ct>
  const b64 = buf => { let s = "", b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); };
  async function gzip(str) {
    if (!window.CompressionStream) return { data: new TextEncoder().encode(str), z: 0 };
    const cs = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));
    return { data: new Uint8Array(await new Response(cs).arrayBuffer()), z: 1 };
  }
  async function sealAndRelay(body) {
    const N = CFG.NTFY, sub = crypto.subtle;
    const pub = await sub.importKey("jwk", N.publicKeyJwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
    const aes = await sub.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12)), { data, z } = await gzip(body);
    const ct = await sub.encrypt({ name: "AES-GCM", iv }, aes, data);
    const wk = await sub.encrypt({ name: "RSA-OAEP" }, pub, await sub.exportKey("raw", aes));
    return fetch(`${N.server.replace(/\/$/, "")}/${N.topic}`, { method: "POST", body: `vt1.${z}.${b64(wk)}.${b64(iv)}.${b64(ct)}`, keepalive: true });
  }
  const logEvent = (q, type) => persistLead({ quote_no: q.quote_no, at: new Date().toISOString() }, type);

  // ---------- resultado ----------
  function showDone(q) {
    lastQuote = q;
    $("#doneNo").textContent = q.quote_no;
    $("#doneRev").hidden = q.rev <= 1; $("#doneRev").textContent = `Revisión ${q.rev}`;
    $("#doneTitle").textContent = q.rev > 1 ? "¡Revisión lista!" : "¡Cotización lista!";
    $("#shareBox").hidden = true;
    $("#doneSummary").innerHTML = `<p style="margin:0 0 4px;font-weight:650">${esc(q.client.business)}</p><ul>${q.items.map(i => `<li>${esc(i.name)}${i.qty > 1 ? " x" + i.qty : ""}</li>`).join("")}</ul><div class="totals corners sm">${totalsHtml(q.totals)}</div>
      <p class="fine" style="margin:10px 0 0">Válida hasta el ${new Date(q.valid_until).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })}.</p>`;
    $("#backWa").href = waUrl(q);
    open("#doneSheet");
  }
  async function finish() {
    const f = readForm(), sig = sigOf(cart, f), s = editing && getSaved(editing.base);
    let q, type = "quote";
    if (s && s.sig === sig) { q = s.quote; toast("Sin cambios: misma revisión"); }     // nada cambió → no subir revisión
    else if (s) { q = buildQuote({ base: s.base, rev: s.rev + 1, revisionOf: s.quote.quote_no, ref: s.quote.ref, wa: s.quote.wa_param }); type = "revision"; }
    else q = buildQuote();
    if (q !== (s && s.quote)) { upsertSaved(q, cart); persistLead(q, type); }
    setEditing(q.base_no);
    showDone(q);
  }

  // ---------- importar desde enlace ----------
  async function importFromHash() {
    const m = location.hash.match(/^#q=([zj][A-Za-z0-9_-]+)$/); if (!m) return false;
    try {
      const { cart: c, quote: q } = quoteFromState(await unpack(m[1]));
      const s = getSaved(q.base_no);
      if (!s || s.rev <= q.rev) upsertSaved(q, c);
      const cur = getSaved(q.base_no);
      loadIntoEditor(cur);
      history.replaceState(null, "", location.pathname + location.search);
      showDone(cur.quote);
      if (cur.rev > q.rev) toast(`Tienes una revisión más nueva (R${cur.rev})`);
      else toast(`Cotización ${q.quote_no} abierta`);
      logEvent(q, "link_open");
      return true;
    } catch (e) { console.error(e); toast("El enlace de la cotización no es válido"); return false; }
  }

  // ---------- eventos ----------
  document.addEventListener("click", async e => {
    const t = e.target.closest("button, a, [data-close]"); if (!t) return;
    if (t.dataset.cat) { activeCat = t.dataset.cat; renderCats(); renderCatalog(); window.scrollTo({ top: $("#cats").offsetTop - 60, behavior: "smooth" }); }
    else if (t.dataset.add) add(t.dataset.add);
    else if (t.dataset.inc) { cart[t.dataset.inc] = Math.min(20, cart[t.dataset.inc] + 1); persistCart(); }
    else if (t.dataset.dec) { cart[t.dataset.dec] = Math.max(1, cart[t.dataset.dec] - 1); persistCart(); }
    else if (t.dataset.rm) { delete cart[t.dataset.rm]; persistCart(); renderCatalog(); }
    else if (t.dataset.sv) {
      const s = getSaved(t.closest("[data-base]").dataset.base); if (!s) return;
      const a = t.dataset.sv;
      if (a === "open") { loadIntoEditor(s); showDone(s.quote); }
      else if (a === "edit") { loadIntoEditor(s); closeAll(); renderCart(); open("#cartSheet"); toast(`Editando ${s.quote.quote_no}`); }
      else if (a === "pdf") { await window.VT_PDF.download(s.quote); logEvent(s.quote, "pdf_download"); }
      else if (a === "wa") { window.open(waUrl(s.quote), "_blank", "noopener"); logEvent(s.quote, "wa_click"); }
      else if (a === "share") { const url = await shareUrl(s.quote, s.cart); if (navigator.share) { try { await navigator.share({ title: `Cotización ${s.quote.quote_no}`, url }); return; } catch (er) { if (er.name === "AbortError") return; } } toast(await copy(url) ? "Enlace copiado ✓" : "No se pudo copiar"); }
      else if (a === "del" && confirm(`¿Eliminar ${s.quote.quote_no} de este dispositivo?`)) { saved = saved.filter(x => x !== s); persistSaved(); if (editing && editing.base === s.base) setEditing(null); renderSaved(); }
    }
    else if (t.hasAttribute("data-close")) closeAll();
    else if (t.closest(".chips")) {
      const box = t.closest(".chips");
      if (box.classList.contains("single")) box.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"));
      const on = t.getAttribute("aria-pressed") === "true";
      t.setAttribute("aria-pressed", box.classList.contains("single") ? "true" : String(!on));
      if (box.dataset.name === "has" && t.dataset.v === "Nada aún" && !on) box.querySelectorAll("button").forEach(b => b !== t && b.setAttribute("aria-pressed", "false"));
      else if (box.dataset.name === "has") { const n = box.querySelector('[data-v="Nada aún"]'); n && n.setAttribute("aria-pressed", "false"); }
      saveForm();
    }
  });
  $("#openCart").onclick = () => { renderCart(); open("#cartSheet"); };
  $("#goCheckout").onclick = $("#cartCheckout").onclick = () => { showStep(1); open("#formSheet"); };
  $("#prevStep").onclick = () => showStep(Math.max(1, step - 1));
  $("#nextStep").onclick = () => {
    const err = validate(step); $("#formErr").textContent = err; if (err) return;
    saveForm();
    if (step < 3) showStep(step + 1); else finish();
  };
  form.addEventListener("input", saveForm);
  form.addEventListener("submit", e => e.preventDefault());
  $("#downloadPdf").onclick = async () => {
    if (!lastQuote) return;
    const b = $("#downloadPdf"); b.disabled = true; b.textContent = "Generando PDF…";
    try { await window.VT_PDF.download(lastQuote); logEvent(lastQuote, "pdf_download"); }
    catch (err) { console.error(err); toast("No se pudo generar el PDF"); }
    b.disabled = false; b.textContent = "⬇ Descargar PDF";
  };
  $("#backWa").addEventListener("click", () => lastQuote && logEvent(lastQuote, "wa_click"));
  $("#saveQuote").onclick = async () => {
    if (!lastQuote) return; const s = getSaved(lastQuote.base_no) || upsertSaved(lastQuote, cart);
    await shareQuote(s.quote, s.cart, false); toast("Guardada en Mis cotizaciones · enlace copiado ✓"); logEvent(s.quote, "saved");
  };
  $("#shareQuote").onclick = async () => { if (!lastQuote) return; const s = getSaved(lastQuote.base_no); await shareQuote(lastQuote, s ? s.cart : cart, true); logEvent(lastQuote, "share"); };
  $("#copyLink").onclick = async () => toast(await copy($("#shareLink").value) ? "Enlace copiado ✓" : "Selecciona y copia el enlace");
  $("#editQuote").onclick = () => { if (lastQuote) { const s = getSaved(lastQuote.base_no); if (s) loadIntoEditor(s); } renderCart(); open("#cartSheet"); toast("Cambia lo que quieras y genera la revisión"); };
  $("#openSaved").onclick = () => { renderSaved(); open("#savedSheet"); };
  $("#savedNew").onclick = () => { closeAll(); newQuote(); };
  $("#newQuote").onclick = newQuote;
  document.addEventListener("keydown", e => e.key === "Escape" && closeAll());
  window.addEventListener("hashchange", importFromHash);

  // ---------- init ----------
  setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light", false);
  if (params.wa || params.ref) { const n = $("#refNote"); n.hidden = false; n.textContent = "Llegaste desde WhatsApp: al final vuelves al mismo chat con tu cotización."; }
  if (editing && !getSaved(editing.base)) setEditing(null);
  renderCats(); renderCatalog(); renderCartBar(); restoreForm(); renderSavedCount(); renderEditNote();
  importFromHash();
  window.VT_APP = { waMessage, waUrl, buildQuote, shareUrl, get lastQuote() { return lastQuote; }, get saved() { return saved; } }; // para QA
})();
