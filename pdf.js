/* Viltrum Tek · PDF de cotización (jsPDF + autotable, carga diferida). Fondo blanco. */
(function () {
  "use strict";
  const C = window.VT_CATALOG, CFG = window.VT_CONFIG || {};
  const byId = Object.fromEntries(C.items.map(i => [i.id, i]));
  let libs;
  function loadScript(src) { return new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  async function ensureLibs() {
    if (!libs) libs = (async () => { await loadScript("vendor/jspdf.umd.min.js"); await loadScript("vendor/jspdf.plugin.autotable.min.js"); })();
    return libs;
  }
  function imgData(src) {
    return new Promise((ok, ko) => { const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext("2d").drawImage(im, 0, 0); ok(c.toDataURL("image/png")); }; im.onerror = ko; im.src = src; });
  }
  // Helvetica estándar = WinAnsi: normalizar caracteres fuera de rango
  const T = s => String(s ?? "").replace(/[\u2013\u2014\u2212]/g, "-").replace(/[\u2022\u25C6\u25A3]/g, "·").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u2192/g, "->").replace(/\u2026/g, "...").replace(/[^\x00-\xFF]/g, "");
  const money = n => "US$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const unitLbl = u => u === "año" || u === "mes" ? " /año" : "";
  const fmtDate = iso => new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
  const GOLD = [201, 138, 30], INK = [17, 17, 17], MUT = [110, 110, 110], LINE = [225, 222, 215], SOFT = [248, 246, 241];

  async function build(q) {
    await ensureLibs();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const W = 210, H = 297, M = 16;
    doc.setProperties({ title: `Cotización ${q.quote_no} - Viltrum Tek`, author: "Viltrum Tek", subject: "Cotización", creator: "viltrumtek.com" });
    let logo; try { logo = await imgData("assets/viltrum-icon.png"); } catch {}

    // ---------- encabezado ----------
    if (logo) doc.addImage(logo, "PNG", M - 3, 10, 26, 26);
    doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.setTextColor(...INK); doc.text("VILTRUM TEK", M + 25, 21);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...MUT);
    doc.text(T("Diseño web, e-commerce y software a medida"), M + 25, 26.5);
    doc.text(T(`${C.company.city} · ${C.company.web}`), M + 25, 31);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...GOLD); doc.text(T("COTIZACIÓN"), W - M, 19, { align: "right" });
    doc.setFontSize(9); doc.setTextColor(...INK); doc.setFont("helvetica", "normal");
    const rows = [["No.", q.quote_no], ["Fecha", fmtDate(q.created_at)], ["Válida hasta", fmtDate(q.valid_until)]];
    if (q.rev > 1) rows.push(["Revisión", `R${q.rev}`]);
    rows.forEach((r, i) => { doc.setTextColor(...MUT); doc.text(T(r[0]), W - M - 64, 26 + i * 4.6); doc.setTextColor(...INK); doc.setFont("helvetica", "bold"); doc.text(T(r[1]), W - M, 26 + i * 4.6, { align: "right" }); doc.setFont("helvetica", "normal"); });
    const HL = q.rev > 1 ? 45 : 41; doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.line(M, HL, W - M, HL);

    // ---------- cliente / proyecto ----------
    const c = q.client; let y = HL + 6; const bw = (W - 2 * M - 6) / 2;
    function box(x, title, lines) {
      doc.setFontSize(8.8);
      const wrapped = lines.map(l => doc.splitTextToSize(T(l[1] || "-"), bw - 30).slice(0, 2));
      const h = 8 + wrapped.reduce((a, w) => a + w.length * 4.2 + 0.6, 0) + 3; return { h, draw: (hh) => {
      doc.setFillColor(...SOFT); doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.roundedRect(x, y, bw, hh, 2, 2, "FD");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GOLD); doc.text(T(title.toUpperCase()), x + 4, y + 5.5);
      doc.setFontSize(8.8); let yy = y + 11; lines.forEach((l, i) => { doc.setFont("helvetica", "bold"); doc.setTextColor(...MUT); doc.text(T(l[0]), x + 4, yy);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...INK); doc.text(wrapped[i], x + 26, yy, { lineHeightFactor: 1.35 }); yy += wrapped[i].length * 4.2 + 0.6; }); } };
    }
    const h1 = box(M, "Cliente", [["Negocio", c.business], ["Contacto", c.contact], ["WhatsApp", c.whatsapp], ["Correo", c.email || "-"], ["Nicho", c.niche]]);
    const h2 = box(M + bw + 6, "Proyecto", [["Objetivo", c.goals.join(", ")], ["Plazo", c.deadline], ["Ya tiene", c.has.join(", ") || "-"], ["Origen", q.ref || (q.wa_param ? "WhatsApp" : "Web")], ["Moneda", "USD (dólares)"]]);
    const hh = Math.max(h1.h, h2.h); h1.draw(hh); h2.draw(hh); y += hh + 7;

    // ---------- tabla de ítems ----------
    const body = q.items.map((it, i) => {
      const src = byId[it.id] || {};
      const unit = it.min == null ? "A cotizar" : money(it.min) + unitLbl(it.unit);
      const sub = it.min == null ? "A cotizar" : money(it.min * it.qty) + unitLbl(it.unit);
      const range = it.min != null && it.max && it.max !== it.min ? `\nRango publicado: ${money(it.min)} - ${money(it.max)}${unitLbl(it.unit)}` : "";
      return [String(i + 1), T(it.name), T((src.desc || "") + range), String(it.qty), T(unit), T(sub)];
    });
    doc.autoTable({
      startY: y, margin: { left: M, right: M }, head: [["#", "Concepto", "Descripción", "Cant.", "Precio unit.", "Subtotal"]], body,
      theme: "grid", styles: { font: "helvetica", fontSize: 8.4, cellPadding: 2.4, textColor: INK, lineColor: LINE, lineWidth: 0.2, valign: "top" },
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.4 },
      alternateRowStyles: { fillColor: [252, 251, 248] },
      columnStyles: { 0: { cellWidth: 7, halign: "center" }, 1: { cellWidth: 38, fontStyle: "bold" }, 2: { cellWidth: "auto" }, 3: { cellWidth: 12, halign: "center" }, 4: { cellWidth: 26, halign: "right" }, 5: { cellWidth: 26, halign: "right", fontStyle: "bold" } }
    });
    y = doc.lastAutoTable.finalY + 5;

    // ---------- totales ----------
    const t = q.totals; const tl = [];
    tl.push(["Inversión inicial (desde)", money(t.oneMin), true]);
    if (t.oneMax !== t.oneMin) tl.push(["Rango estimado del proyecto", `${money(t.oneMin)} - ${money(t.oneMax)}`]);
    if (t.yrMin || t.yrMax) tl.push(["Recurrente anual", (t.yrMin === t.yrMax ? money(t.yrMin) : `${money(t.yrMin)} - ${money(t.yrMax)}`) + " /año"]);
    if (t.yrMin || t.yrMax) tl.push(["Total primer año (desde)", money(t.oneMin + t.yrMin)]);
    if (t.tbd.length) tl.push(["A cotizar", t.tbd.join(", ")]);
    if (q.dop_rate) tl.push([`Equivalente aprox. (1 USD = RD$${q.dop_rate}, referencial)`, "RD$" + Math.round(t.oneMin * q.dop_rate).toLocaleString("en-US")]);
    tl.push(["ITBIS (18%) sobre servicios", "No incluido"]);
    const tw = 104, tx = W - M - tw, th = tl.length * 6 + 4;
    if (y + th > H - 24) { doc.addPage(); y = 20; }
    doc.setFillColor(...SOFT); doc.setDrawColor(...LINE); doc.roundedRect(tx, y, tw, th, 2, 2, "FD");
    tl.forEach((r, i) => {
      const yy = y + 6.5 + i * 6;
      doc.setFont("helvetica", r[2] ? "bold" : "normal"); doc.setFontSize(r[2] ? 10.5 : 8.6); doc.setTextColor(...(r[2] ? INK : MUT)); doc.text(T(r[0]), tx + 4, yy);
      doc.setTextColor(...(r[2] ? GOLD : INK)); doc.setFont("helvetica", "bold"); doc.text(doc.splitTextToSize(T(r[1]), 48)[0], tx + tw - 4, yy, { align: "right" });
    });
    // condiciones rápidas a la izquierda de totales
    doc.setFontSize(8.2); doc.setFont("helvetica", "bold"); doc.setTextColor(...INK); doc.text(T("Forma de pago"), M, y + 5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...MUT);
    doc.text(doc.splitTextToSize(T(C.terms.payment), tx - M - 6), M, y + 9.5);
    y += th + 8;

    // ---------- alcance detallado ----------
    function ensure(h) { if (y + h > H - 22) { doc.addPage(); y = 20; } }
    function heading(txt) { ensure(14); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...INK); doc.text(T(txt), M, y); doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.line(M, y + 1.8, M + 18, y + 1.8); y += 7; }
    heading("Alcance detallado");
    q.items.forEach((it, i) => {
      const s = byId[it.id] || {};
      if (it.unit !== "proyecto") { ensure(10); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(T(`${i + 1}. ${it.name}`), M, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.4); doc.setTextColor(80, 80, 80); doc.text(T(`Servicio recurrente${unitLbl(it.unit)} · ${s.desc || ""}`), M + 4, y + 4.6, { maxWidth: W - 2 * M - 4 });
        y += 10; doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M, y - 1.5, W - M, y - 1.5); y += 3; return; }
      const feats = s.features && s.features.length ? s.features : [s.desc];
      const meta = [["Páginas / alcance", s.pages || (it.unit === "proyecto" ? "Según levantamiento" : "Servicio recurrente")], ["Entrega estimada", s.timeline || "a confirmar"], ["Soporte post-lanzamiento", s.support || "a confirmar"]];
      const fl = feats.map(f => doc.splitTextToSize(T(f), W - 2 * M - 70));
      const need = 8 + fl.reduce((a, l) => a + l.length * 3.9, 0) + 2;
      ensure(Math.max(need, 22));
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(T(`${i + 1}. ${it.name}`), M, y);
      y += 5; const y0 = y;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.4); doc.setTextColor(50, 50, 50);
      fl.forEach(lines => { doc.setFillColor(...GOLD); doc.circle(M + 1.6, y - 1.1, 0.7, "F"); doc.text(lines, M + 4, y); y += lines.length * 3.9; });
      let ym = y0; const mx = W - M - 62;
      meta.forEach(m => { doc.setFont("helvetica", "bold"); doc.setTextColor(...MUT); doc.setFontSize(7.4); doc.text(T(m[0].toUpperCase()), mx, ym); doc.setFont("helvetica", "normal"); doc.setTextColor(...INK); doc.setFontSize(8.4); doc.text(T(m[1]), mx, ym + 3.6); ym += 8.4; });
      y = Math.max(y, ym) + 3;
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M, y - 1.5, W - M, y - 1.5); y += 3;
    });

    // ---------- infraestructura ----------
    heading("Infraestructura");
    const has = k => q.items.some(it => (byId[it.id] || {}).infra === k);
    const hasFlag = k => q.items.some(it => (byId[it.id] || {})[k]);
    const name = k => (q.items.find(it => (byId[it.id] || {}).infra === k) || {}).name;
    const infra = [
      ["Hosting", has("hosting") ? `En esta cotización: ${name("hosting")}` : "Se cotiza aparte (hosting compartido desde US$140/año o VPS Hostinger desde US$108/año); se paga directo al proveedor"],
      ["Certificado SSL (HTTPS)", "Incluido: Let's Encrypt con renovación automática (US$0)"],
      ["Dominio", has("domain") ? "En esta cotización: registro anual a nombre del cliente" : (c.has.includes("Dominio") ? "El cliente ya tiene dominio; se conecta en el lanzamiento" : "Se cotiza aparte (.com / .com.do desde US$12/año)")],
      ["CDN / media", has("cdn") ? "En esta cotización: CDN / almacenamiento de media" : "Optimización de imágenes incluida; CDN dedicado opcional (desde US$100/año)"],
      ["Backups", hasFlag("backups") ? "Incluidos en el alcance (backups programados)" : "Opcional: backups automáticos diarios (desde US$133, pago único)"],
      ["Analítica", hasFlag("analytics") ? "Incluida: analítica base / GA4 y medición según plan" : "Configuración de analítica básica a confirmar en el levantamiento"],
      ["Mantenimiento", has("maint") ? `En esta cotización: ${name("maint")}` : "Opcional; si no se contrata, no se factura"],
      ["Correo corporativo", has("email") ? "En esta cotización: Google Workspace" : "Opcional (Google Workspace desde US$70/año por usuario)"]
    ];
    ensure(50);
    doc.autoTable({ startY: y, margin: { left: M, right: M }, body: infra.map(r => [T(r[0]), T(r[1])]), theme: "plain",
      styles: { fontSize: 8.4, cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 }, textColor: INK, lineColor: LINE, lineWidth: { bottom: 0.2 } },
      columnStyles: { 0: { cellWidth: 42, fontStyle: "bold", textColor: [60, 60, 60] } } });
    y = doc.lastAutoTable.finalY + 8;

    // ---------- condiciones ----------
    heading("Condiciones");
    const cond = [
      `Forma de pago: ${C.terms.payment}`,
      `Validez: ${C.terms.validityDays} días a partir de la fecha de emisión (hasta el ${fmtDate(q.valid_until)}).`,
      ...C.terms.notes, C.terms.itbis,
      "Tiempos de entrega estimados desde la recepción de contenidos (logo, textos, fotos) y el anticipo."
    ];
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.3); doc.setTextColor(55, 55, 55);
    cond.forEach(s => { const l = doc.splitTextToSize(T(s), W - 2 * M - 5); ensure(l.length * 3.9 + 2); doc.setFillColor(...GOLD); doc.circle(M + 1.4, y - 1.1, 0.6, "F"); doc.text(l, M + 4, y); y += l.length * 3.9 + 1.4; });

    // ---------- próximos pasos ----------
    y += 4; ensure(24);
    doc.setFillColor(...INK); doc.roundedRect(M, y, W - 2 * M, 20, 2.5, 2.5, "F");
    doc.setTextColor(...GOLD); doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.text(T("Próximo paso"), M + 6, y + 7.5);
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "normal"); doc.setFontSize(8.8);
    doc.text(T(`Escríbenos por WhatsApp al ${C.company.phone} con tu número ${q.quote_no} y agendamos la reunión de levantamiento.`), M + 6, y + 13, { maxWidth: W - 2 * M - 12 });

    // ---------- pie en todas las páginas ----------
    const n = doc.getNumberOfPages();
    for (let p = 1; p <= n; p++) {
      doc.setPage(p);
      // motivo de esquinas doradas (sutil)
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.35); const k = 7, e = 6;
      [[e, e, 1, 1], [W - e, e, -1, 1], [e, H - e, 1, -1], [W - e, H - e, -1, -1]].forEach(([x, yy, sx, sy]) => { doc.line(x, yy, x + k * sx, yy); doc.line(x, yy, x, yy + k * sy); });
      doc.setDrawColor(...LINE); doc.setLineWidth(0.2); doc.line(M, H - 14, W - M, H - 14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.6); doc.setTextColor(...MUT);
      doc.text(T(`Viltrum Tek · ${C.company.email} · ${C.company.phone} · ${C.company.web}`), M, H - 9);
      doc.text(T(`${q.quote_no} · Página ${p} de ${n}`), W - M, H - 9, { align: "right" });
    }
    return doc;
  }

  window.VT_PDF = {
    build,
    async download(q) { const d = await build(q); d.save(`Cotizacion-${q.quote_no}-Viltrum-Tek.pdf`); return d; },
    async dataUri(q) { const d = await build(q); return d.output("datauristring"); }
  };
})();
