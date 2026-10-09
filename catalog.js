/* Catálogo Viltrum Tek — SOLO precios publicados.
 * Fuentes (validadas 2026-10-09 contra el sitio en vivo con Chrome headless; copia en qa/source/*.txt):
 *  - /precios       → tarjetas "Desde" (landing $250, corporativa $400, e-commerce $650/$750, app $1,000)
 *  - /servicios     → niveles Simple/Intermedio/Complejo por servicio (mismos planes del cotizador)
 *  - /inmobiliaria  → Web Inmobiliaria $400, Portal Broker $900, Portal Inteligente $1,600, extras fijos, Care (anual)
 *  - Cotizador de /precios (adicionales y recurrentes) → sincronizado en viltrum-agent/kb/planes.md (2026-09-25)
 *  - FAQ del sitio "¿Modalidad de pago?" → 50% al iniciar / 50% al finalizar
 * min = precio "desde" que se suma al total; max = tope del rango publicado (null = precio fijo).
 * Nunca inventar precios: si no hay precio publicado → min:null ("a cotizar").
 */
window.VT_CATALOG = {
  updated: "2026-10-09",
  categories: [
    { id: "landing", name: "Landing page", icon: "◆", blurb: "Una página para explicar tu oferta y convertir visitas en conversaciones." },
    { id: "corporativa", name: "Web corporativa", icon: "▣", blurb: "Sitio multi-página para generar confianza y verse profesional." },
    { id: "inmobiliaria", name: "Portafolio inmobiliario", icon: "⌂", blurb: "Web, portal y licencias para brokers, agentes e inmobiliarias." },
    { id: "ecommerce", name: "E-commerce", icon: "◎", blurb: "Catálogo digital o tienda online con carrito y pagos." },
    { id: "bots", name: "Bots WhatsApp / IG", icon: "✦", blurb: "Automatiza respuestas y captación en WhatsApp e Instagram." },
    { id: "apps", name: "Apps web a medida", icon: "⬡", blurb: "Plataformas, portales y paneles internos por módulos." },
    { id: "extras", name: "Extras", icon: "+", blurb: "SEO, idiomas, pagos, integraciones y más." },
    { id: "infra", name: "Infraestructura", icon: "☰", blurb: "Hosting, dominio, mantenimiento, correo, CDN y backups." }
  ],
  items: [
    // ---------- LANDING (fuente: /servicios + /precios) ----------
    { id: "landing-simple", cat: "landing", group: "landing", name: "Landing Simple", min: 250, max: 350, unit: "proyecto",
      desc: "Una página de hasta 4 secciones.",
      features: ["Una página de hasta 4 secciones", "Logo, colores y contenido entregado por tu equipo", "WhatsApp, mapa o formulario de contacto", "Versión móvil y SEO técnico básico", "Una ronda de ajustes y 15 días de soporte"],
      pages: "1 página (hasta 4 secciones)", timeline: "7-14 días", support: "15 días", source: "viltrumtek.com/servicios" },
    { id: "landing-intermedio", cat: "landing", group: "landing", name: "Landing Intermedio", badge: "Más elegido", min: 400, max: 550, unit: "proyecto",
      desc: "Landing de 6 a 8 secciones adaptada a tu marca.",
      features: ["Landing de 6 a 8 secciones", "Servicios o productos informativos, sin catálogo administrable", "Diseño adaptado a tu marca y CTA por objetivo", "Formulario, WhatsApp, mapa y analítica base", "SEO on-page y 30 días de soporte"],
      pages: "1 página (6-8 secciones)", timeline: "7-14 días", support: "30 días", analytics: true, source: "viltrumtek.com/servicios" },
    { id: "landing-complejo", cat: "landing", group: "landing", name: "Landing Complejo", min: 650, max: 900, unit: "proyecto",
      desc: "Landing avanzada con diseño a medida y flujo comercial.",
      features: ["Landing avanzada con diseño a medida", "Contenido bilingüe o módulos de prueba social", "Formulario calificador, CRM o newsletter básico", "Cotización o reserva como flujo comercial", "Medición de conversiones y 45 días de soporte"],
      pages: "1 página avanzada", timeline: "7-14 días", support: "45 días", analytics: true, source: "viltrumtek.com/servicios" },

    // ---------- CORPORATIVA (fuente: /servicios + /precios "Desde $400") ----------
    { id: "corp-simple", cat: "corporativa", group: "corp", name: "Web Corporativa Simple", min: 400, max: 550, unit: "proyecto",
      desc: "Hasta 5 páginas esenciales.",
      features: ["Hasta 5 páginas esenciales", "Inicio, servicios, nosotros y contacto", "Formulario, mapa, WhatsApp y redes", "Diseño responsive y SEO técnico básico", "30 días de soporte post-lanzamiento"],
      pages: "Hasta 5 páginas", timeline: "a confirmar", support: "30 días", source: "viltrumtek.com/servicios" },
    { id: "corp-intermedio", cat: "corporativa", group: "corp", name: "Web Corporativa Intermedia", badge: "Recomendado", min: 650, max: 900, unit: "proyecto",
      desc: "6-10 páginas con blog y CMS administrable.",
      features: ["6-10 páginas + blog o noticias", "CMS para contenido administrable", "Diseño semi-personalizado con componentes reutilizables", "Formularios por servicio y captación de leads", "SEO on-page, schema y medición de conversiones", "45 días de soporte y capacitación"],
      pages: "6-10 páginas + blog", timeline: "a confirmar", support: "45 días", analytics: true, source: "viltrumtek.com/servicios" },
    { id: "corp-complejo", cat: "corporativa", group: "corp", name: "Web Corporativa Compleja", min: 1000, max: 1400, unit: "proyecto",
      desc: "Arquitectura multi-sección, headless CMS e integraciones.",
      features: ["Arquitectura multi-sección o micrositios", "Diseño a medida con mini design system", "Headless CMS con roles de edición", "Blog, casos, recursos y formularios con lógica", "Integraciones CRM o automatización inicial", "SEO técnico avanzado y 90 días de soporte"],
      pages: "Multi-sección / micrositios", timeline: "a confirmar", support: "90 días", analytics: true, source: "viltrumtek.com/servicios" },

    // ---------- INMOBILIARIA (fuente: /inmobiliaria) ----------
    { id: "inmo-web", cat: "inmobiliaria", group: "inmo", name: "Web Inmobiliaria", min: 400, max: null, unit: "proyecto",
      desc: "Presencia clara y captación para corredores y agentes, sin catálogo administrable.",
      features: ["Landing de 5 a 7 secciones", "Diseño adaptado a tu marca", "WhatsApp y formulario de contacto", "Mapa y citas básicas", "SEO inicial y GA4", "2 idiomas; sin catálogo ni CMS", "Mantenimiento opcional: US$480/año"],
      pages: "5-7 secciones", timeline: "a confirmar", support: "a confirmar", analytics: true, source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-portal", cat: "inmobiliaria", group: "inmo", name: "Portal Broker", badge: "Recomendado", min: 900, max: null, unit: "proyecto",
      desc: "Portal público administrable: publica propiedades, filtra inventario y capta leads.",
      features: ["Catálogo inmobiliario y fichas de propiedades", "Filtros por tipo, zona y precio", "CMS básico", "Roles administrador y editor", "Carga inicial con importación CSV", "2 idiomas incluidos", "Mantenimiento opcional: US$720/año"],
      pages: "Portal + fichas de propiedades", timeline: "a confirmar", support: "a confirmar", analytics: true, source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-inteligente", cat: "inmobiliaria", group: "inmo", name: "Portal Inteligente", min: 1600, max: null, unit: "proyecto",
      desc: "Portal avanzado app-like con comparador, POI e IA inicial.",
      features: ["PWA y experiencia móvil app-like", "Notificaciones push", "Usuarios y favoritos sincronizados", "Comparador de propiedades", "Puntos de interés (POI)", "Hasta 4 idiomas", "Mantenimiento opcional: US$1,080/año"],
      pages: "Portal avanzado (PWA)", timeline: "a confirmar", support: "a confirmar", analytics: true, source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-os-broker", cat: "inmobiliaria", group: "inmo", name: "Broker Portal OS (licencia)", min: 1650, max: null, unit: "proyecto",
      desc: "Real Estate OS: portal premium + inventario + bandeja de leads.",
      features: ["Portal premium", "Inventario de propiedades", "Bandeja de leads", "Viltrum Care: US$588/año"],
      pages: "Licencia Real Estate OS", timeline: "a confirmar", support: "a confirmar", source: "viltrumtek.com/inmobiliaria (Real Estate OS desde US$1,650)" },
    { id: "inmo-os-growth", cat: "inmobiliaria", group: "inmo", name: "Growth OS (licencia)", min: 2750, max: null, unit: "proyecto",
      desc: "Portal OS + CRM, responsables y automatizaciones.",
      features: ["Todo Broker Portal OS", "CRM comercial", "Responsables por lead", "Automatizaciones", "Viltrum Care: US$948/año"],
      pages: "Licencia Real Estate OS", timeline: "a confirmar", support: "a confirmar", source: "kb/planes.md (sync /inmobiliaria)" },
    { id: "inmo-os-full", cat: "inmobiliaria", group: "inmo", name: "Real Estate OS (licencia)", min: 4500, max: null, unit: "proyecto",
      desc: "Operación integral: brokers, cartera, comisiones, BI y API.",
      features: ["Brokers y cartera de agentes", "Comisiones", "BI y reportes", "API", "Viltrum Care: US$1,548/año"],
      pages: "Licencia Real Estate OS", timeline: "a confirmar", support: "a confirmar", source: "kb/planes.md (sync /inmobiliaria)" },
    { id: "inmo-x-dual", cat: "inmobiliaria", name: "Extra inmo: Tema dual", min: 60, max: null, unit: "proyecto", addon: true, desc: "Tema claro y oscuro.", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-usuarios", cat: "inmobiliaria", name: "Extra inmo: Usuarios y favoritos", min: 120, max: null, unit: "proyecto", addon: true, desc: "Cuentas de usuario y favoritos sincronizados (desde Portal Broker).", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-comparador", cat: "inmobiliaria", name: "Extra inmo: Comparador", min: 90, max: null, unit: "proyecto", addon: true, desc: "Comparación de propiedades (desde Portal Broker).", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-pwa", cat: "inmobiliaria", name: "Extra inmo: PWA", min: 120, max: null, unit: "proyecto", addon: true, desc: "Aplicación web instalable (desde Portal Broker).", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-360", cat: "inmobiliaria", name: "Extra inmo: Visor 360", min: 75, max: null, unit: "proyecto", addon: true, desc: "Visor requerido para tours 360 (tours aparte).", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-poi", cat: "inmobiliaria", name: "Extra inmo: Puntos de interés", min: 60, max: null, unit: "proyecto", addon: true, desc: "Puntos de interés cercanos (desde Portal Broker).", source: "viltrumtek.com/inmobiliaria" },
    { id: "inmo-x-cms", cat: "inmobiliaria", name: "Extra inmo: CMS multilingüe", min: 120, max: null, unit: "proyecto", addon: true, desc: "Gestión multilingüe del contenido; idiomas extra aparte.", source: "viltrumtek.com/inmobiliaria" },

    // ---------- E-COMMERCE (fuente: /servicios + /precios) ----------
    { id: "cat-simple", cat: "ecommerce", group: "ecom", name: "Catálogo Digital Simple", min: 650, max: 800, unit: "proyecto",
      desc: "Hasta 40 productos con botón cotizar por WhatsApp.",
      features: ["Hasta 40 productos o servicios", "Categorías básicas y ficha de producto", "Botón cotizar por WhatsApp", "Galería optimizada por producto", "SEO base para categorías principales", "30 días de soporte"],
      pages: "Catálogo hasta 40 productos", timeline: "14-21 días", support: "30 días", source: "viltrumtek.com/servicios" },
    { id: "cat-intermedio", cat: "ecommerce", group: "ecom", name: "Catálogo Digital Intermedio", min: 900, max: 1200, unit: "proyecto",
      desc: "Hasta 150 productos con variantes, panel y filtros.",
      features: ["Hasta 150 productos con variantes", "Panel de gestión de productos", "Búsqueda, filtros y ordenamiento", "Importación inicial por CSV", "Leads por producto hacia WhatsApp o CRM", "45 días de soporte"],
      pages: "Catálogo hasta 150 productos", timeline: "14-21 días", support: "45 días", source: "viltrumtek.com/servicios" },
    { id: "shop-simple", cat: "ecommerce", group: "ecom", name: "Tienda Online Simple", badge: "Recomendado", min: 750, max: 1000, unit: "proyecto",
      desc: "Carrito, checkout y 1 pasarela de pago.",
      features: ["Hasta 50 productos cargados", "Carrito y checkout estándar", "1 pasarela de pago local o internacional", "Métodos de envío básicos", "Emails de pedido y confirmación", "SEO inicial, Analytics y 45 días de soporte"],
      pages: "Tienda hasta 50 productos", timeline: "14-21 días", support: "45 días", analytics: true, source: "viltrumtek.com/servicios" },
    { id: "shop-intermedio", cat: "ecommerce", group: "ecom", name: "Tienda Online Intermedia", min: 1200, max: 1800, unit: "proyecto",
      desc: "Hasta 250 productos, 2 pasarelas, cupones y upsells.",
      features: ["Hasta 250 productos con variantes", "2 pasarelas o métodos de pago", "Cupones, upsells y recuperación básica", "Panel de productos, pedidos y clientes", "Integración email marketing / pixel", "60 días de soporte y capacitación operativa"],
      pages: "Tienda hasta 250 productos", timeline: "a confirmar", support: "60 días", analytics: true, source: "viltrumtek.com/servicios" },
    { id: "shop-complejo", cat: "ecommerce", group: "ecom", name: "Tienda Online Compleja", min: 2000, max: 3000, unit: "proyecto",
      desc: "Catálogo amplio, integración fiscal/ERP y automatizaciones.",
      features: ["Catálogo amplio con variantes avanzadas", "Checkout optimizado y reglas de envío", "Integración fiscal, ERP o inventario según alcance", "Automatizaciones de remarketing", "Seguridad, backups y hardening de pagos", "90 días de soporte y formación"],
      pages: "Tienda a medida", timeline: "a confirmar", support: "90 días", analytics: true, backups: true, source: "viltrumtek.com/servicios" },

    // ---------- BOTS (fuente: adicionales del cotizador /precios; kb/planes.md §6) ----------
    { id: "bot-wa", cat: "bots", name: "Bot WhatsApp Business API", min: 300, max: 917, unit: "proyecto",
      desc: "Plantillas, webhooks y flujo básico por WhatsApp Business API.",
      features: ["Plantillas de mensajes", "Webhooks", "Flujo básico de atención/captación", "Consumo de Meta se paga aparte, directo al proveedor"],
      pages: "Integración", timeline: "a confirmar", support: "a confirmar", source: "Cotizador viltrumtek.com/precios (adicionales)" },
    { id: "bot-ig", cat: "bots", name: "Bot de Instagram DM", min: 300, max: 833, unit: "proyecto",
      desc: "Automatización de DMs, captación y respuestas frecuentes.",
      features: ["Automatización de DMs", "Captación de leads", "Respuestas frecuentes"], pages: "Integración", timeline: "a confirmar", support: "a confirmar", source: "Cotizador viltrumtek.com/precios (adicionales)" },
    { id: "bot-multi", cat: "bots", name: "Bot multi-canal", badge: "WhatsApp + IG + web", min: 700, max: 1800, unit: "proyecto",
      desc: "Bot conversacional para varios canales (WhatsApp, Instagram, web).",
      features: ["WhatsApp, Instagram y web", "Flujos conversacionales", "Handoff a humano"], pages: "Integración", timeline: "a confirmar", support: "a confirmar", source: "Cotizador viltrumtek.com/precios (adicionales)" },
    { id: "bot-ia", cat: "bots", name: "Chatbot con IA", min: 583, max: 1583, unit: "proyecto",
      desc: "Asistente IA entrenado con tu contenido y handoff a humano.",
      features: ["Entrenado con el contenido de tu negocio", "Handoff a humano", "Consumo de IA aparte"], pages: "Integración", timeline: "a confirmar", support: "a confirmar", source: "Cotizador viltrumtek.com/precios (adicionales)" },
    { id: "bot-n8n", cat: "bots", name: "Integración n8n / Make", min: 250, max: 650, unit: "proyecto",
      desc: "Flujos automatizados entre tus herramientas.", source: "Cotizador viltrumtek.com/precios (adicionales)" },

    // ---------- APPS (fuente: /servicios + /desarrollo-software-punta-cana) ----------
    { id: "app-mvp", cat: "apps", group: "app", name: "Plataforma Web - MVP Básico", min: 1000, max: 2000, unit: "proyecto",
      desc: "Discovery, 5-8 pantallas, login, roles y base de datos.",
      features: ["Discovery funcional y mapa de flujos", "5-8 pantallas clave", "Login, roles básicos y base de datos", "Dashboard inicial o flujo operativo principal", "1-2 integraciones externas", "Deploy, QA y 45 días de soporte"],
      pages: "5-8 pantallas", timeline: "6-10 semanas", support: "45 días", source: "viltrumtek.com/servicios" },
    { id: "app-producto", cat: "apps", group: "app", name: "Plataforma Web - Producto", min: 2500, max: 5000, unit: "proyecto",
      desc: "8-15 módulos, roles, dashboards y 3-5 integraciones.",
      features: ["8-15 pantallas o módulos", "Roles, permisos y auditoría básica", "Dashboards y reportes operativos", "3-5 integraciones o APIs", "Ambiente staging, CI/CD y backups", "60 días de soporte y documentación"],
      pages: "8-15 módulos", timeline: "a confirmar", support: "60 días", backups: true, source: "viltrumtek.com/servicios" },
    { id: "app-escalable", cat: "apps", group: "app", name: "Plataforma Web - Escalable", min: 6000, max: 10000, unit: "proyecto",
      desc: "Arquitectura multi-módulo, SSO/2FA y automatizaciones.",
      features: ["Arquitectura escalable y multi-módulo", "Workflows complejos o multi-tenant", "SSO/2FA, seguridad avanzada y logs", "Procesos en background y automatizaciones", "5 o más integraciones", "90 días de soporte, SLA y handoff técnico"],
      pages: "Multi-módulo", timeline: "a confirmar", support: "90 días", backups: true, source: "viltrumtek.com/servicios" },

    // ---------- EXTRAS (fuente: adicionales del cotizador /precios) ----------
    { id: "x-seo", cat: "extras", name: "SEO Avanzado", min: 200, max: 467, unit: "proyecto", desc: "Keyword research, metadata, schema, indexación y checklist técnico.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-i18n", cat: "extras", name: "Multi-idioma (ES/EN)", min: 300, max: 667, unit: "proyecto", desc: "Estructura bilingüe ES/EN, navegación y contenido duplicable.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-blog", cat: "extras", name: "Blog / Sistema de noticias", min: 333, max: 917, unit: "proyecto", desc: "CMS de artículos, categorías, autor y SEO por entrada.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-anim", cat: "extras", name: "Animaciones Premium", min: 250, max: 750, unit: "proyecto", desc: "Microinteracciones, motion hero, scroll effects o Lottie.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-azul", cat: "extras", name: "Integración Azul", min: 333, max: 750, unit: "proyecto", desc: "Checkout con Azul, configuración técnica y pruebas de pago.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-cardnet", cat: "extras", name: "Integración CardNet", min: 417, max: 917, unit: "proyecto", desc: "Pasarela local CardNet con pruebas y validación de checkout.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-paypal", cat: "extras", name: "Integración PayPal", min: 250, max: 583, unit: "proyecto", desc: "Pagos internacionales con PayPal y flujo de confirmación.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-newsletter", cat: "extras", name: "Newsletter (Mailchimp/Brevo)", min: 167, max: 467, unit: "proyecto", desc: "Captura, listas, automatización inicial y formulario conectado.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-crm", cat: "extras", name: "Integración CRM (HubSpot/Zoho)", min: 583, max: 1583, unit: "proyecto", desc: "Sincronización de leads y campos clave con CRM.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-ecf", cat: "extras", name: "Facturación electrónica (e-CF DGII)", min: 750, max: 2000, unit: "proyecto", desc: "Integración e-CF según proveedor fiscal y ambiente DGII.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-backups", cat: "extras", name: "Backups automáticos diarios", min: 133, max: 417, unit: "proyecto", desc: "Backups programados, retención y verificación básica.", backups: true, source: "Cotizador viltrumtek.com/precios" },
    { id: "x-security", cat: "extras", name: "Seguridad Avanzada", min: 333, max: 1000, unit: "proyecto", desc: "2FA, rate limit, headers, hardening y revisión básica.", source: "Cotizador viltrumtek.com/precios" },
    { id: "x-custom", cat: "extras", name: "Integración especial / app nativa", min: null, max: null, unit: "proyecto", desc: "Pagos especiales, app nativa o integración a medida: revisión manual.", source: "viltrumtek.com/inmobiliaria (revisión manual)" },

    // ---------- INFRA / RECURRENTES — TODO ANUAL (decisión Wilber 2026-10-09: nada mensual). Valores = columna anual del cotizador del sitio (fuente: cotizador /precios, paso "Recurrentes"; Hostinger en /inmobiliaria) ----------
    { id: "r-domain", cat: "infra", infra: "domain", name: "Dominio .com / .com.do", min: 12, max: 42, unit: "año", desc: "Registro anual a nombre del cliente.", source: "Cotizador viltrumtek.com/precios" },
    { id: "r-hosting", cat: "infra", infra: "hosting", group: "hosting", name: "Hosting compartido", min: 140, max: 360, unit: "año", desc: "Hosting administrado para sitios y landings (pago anual).", source: "Cotizador viltrumtek.com/precios (columna anual)" },
    { id: "r-vps", cat: "infra", infra: "hosting", group: "hosting", name: "VPS Hostinger KVM 2", min: 108, max: 180, unit: "año", desc: "2 vCPU · 8 GB RAM · 100 GB NVMe. US$107.88 el primer año (promo) y US$179.88/año al renovar; se paga directo a Hostinger.", source: "viltrumtek.com/inmobiliaria (Hostinger, verificados 15/09/2026)" },
    { id: "r-ssl", cat: "infra", infra: "ssl", name: "Certificado SSL (Let's Encrypt)", min: 0, max: 0, unit: "año", desc: "HTTPS gratuito con renovación automática.", source: "Cotizador viltrumtek.com/precios" },
    { id: "r-maint", cat: "infra", infra: "maint", group: "maint", name: "Mantenimiento básico anual", min: 500, max: 1200, unit: "año", desc: "Actualizaciones, monitoreo y ajustes menores durante el año.", source: "Cotizador viltrumtek.com/precios (columna anual)" },
    { id: "r-maint-sla", cat: "infra", infra: "maint", group: "maint", name: "Mantenimiento avanzado (SLA) anual", min: 1400, max: 3600, unit: "año", desc: "Soporte con tiempos de respuesta garantizados.", source: "Cotizador viltrumtek.com/precios (columna anual)" },
    { id: "r-email", cat: "infra", infra: "email", name: "Email corporativo (Google Workspace)", min: 70, max: 180, unit: "año", desc: "Correo @tudominio por usuario, pago anual.", source: "Cotizador viltrumtek.com/precios (columna anual)" },
    { id: "r-cdn", cat: "infra", infra: "cdn", name: "CDN / Almacenamiento media", min: 100, max: 500, unit: "año", desc: "Entrega rápida de imágenes y video.", source: "Cotizador viltrumtek.com/precios (columna anual)" }
  ],
  terms: {
    payment: "50% al iniciar y 50% al finalizar. Los productos adicionales se pagan una vez finalizada y entregada la web.",
    paymentSource: "FAQ viltrumtek.com «¿Modalidad de pago?»",
    validityDays: 15,
    itbis: "Montos sin ITBIS. El ITBIS (18%) aplica sobre servicios según comprobante; el desglose final se valida con el alcance.",
    notes: [
      "Precios orientativos en USD. El alcance final se confirma contigo en una reunión de levantamiento antes de iniciar.",
      "Hosting, dominio y mantenimiento se cotizan aparte como costos recurrentes; la infraestructura queda a nombre del cliente.",
      "Consumos de terceros (Meta/WhatsApp, IA, Maps, correo) se pagan aparte, directo al proveedor."
    ]
  },
  company: {
    name: "Viltrum Tek", tagline: "Tecnología más inteligente. Resultados que impulsan.",
    city: "Punta Cana, República Dominicana", email: "info@viltrumtek.com", phone: "+1 (849) 487-0092",
    web: "viltrumtek.com", wa: "18494870092", cal: "https://cal.com/viltrum-tek-prizcl/30min"
  }
};
