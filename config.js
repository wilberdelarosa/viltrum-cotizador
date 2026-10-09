/* Configuración de runtime (sin secretos: este archivo es público). */
window.VT_CONFIG = {
  WA_NUMBER: "18494870092",            // WhatsApp Business de Viltrum Tek
  DOP_RATE: 63,                        // tasa REFERENCIAL aproximada USD→DOP (no oficial; solo para mostrar)
  // Colector de leads en la box (server/collector.mjs). run.sh tunnel lo reescribe al cambiar la URL del túnel.
  LEADS_ENDPOINT: "",
  // Relay cifrado (activo): el navegador cifra la cotización (RSA-OAEP-256 + AES-GCM) y la publica en ntfy.sh.
  // Solo la box tiene la llave privada (server/keys/private.pem); server/ntfy-sync.mjs la descifra y guarda en data/quotes.jsonl.
  NTFY: { server: "https://ntfy.sh", topic: "vt-quotes-7d8d7ddd90c96c95b8299243", publicKeyJwk: {"kty":"RSA","n":"ubvyZVIUMycpHDtq6v8b-fdN8cFYkC_HumUJX5YBZRp9pHj8AmHnjTjRW-i4qi4jf-1L_1_j5uyNdbzhVxqJo6ED1Qwar4p-k4zuhpV5xt-3qS1vTQpwTdFNn7IB3NzCjcwMp4PI9z5u5YztOfLWcBX7DUl7xFv-7HML1T7MIC6FMXSyPtn9Nxtt-UYKu3PFnKY6kT0Zy-b03O6pCpX6HlTFNYXN7O43SisfYjqLcauqCWHSNnWP2OAG03Rhu5leiH-cpuEExsQgvdWH-nEhu0GFdjlCBxz625WjsM7pMRU5jIrW5My_wW2Jfnf7YQmnB6-rMi6a_g-SDj93wgJg8w","e":"AQAB","alg":"RSA-OAEP-256","ext":true,"key_ops":["encrypt"]} },
  // Firestore (opcional, plan Spark). Rellenar tras `firebase login` + crear proyecto. Se usa la REST API con API key web.
  FIRESTORE: { projectId: "", apiKey: "", collection: "quotes" }
};
