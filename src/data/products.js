// ============================================================
// ATHLETIC VAULT · Datos de productos
// Tienda independiente que importa y comercializa activewear
// ORIGINAL de marcas premium de USA para clientes en México.
// ============================================================

export const CONFIG = {
  // Número de WhatsApp con código de país, SOLO números (sin +, espacios ni guiones).
  // México: 521 + número.
  whatsapp: "5219981836360",
  // Usuario de Instagram SIN el @.
  instagram: "athletic_vault",
  // Nombre de la tienda en los mensajes.
  storeName: "Athletic Vault",
  // Fecha objetivo del próximo drop (para el contador regresivo).
  nextDrop: "2026-11-27T09:00:00-06:00",
};

// ------------------------------------------------------------
// MARCAS disponibles (no somos distribuidores oficiales;
// simplemente comercializamos productos originales de estas marcas).
// ------------------------------------------------------------
export const BRANDS = [
  { name: "Gymshark", slug: "gymshark", tag: "Performance" },
  { name: "lululemon", slug: "lululemon", tag: "Premium" },
  { name: "Under Armour", slug: "under-armour", tag: "Training" },
  { name: "Alo", slug: "alo", tag: "Lifestyle" },
];

export const brandSlug = (name) =>
  (BRANDS.find((b) => b.name.toLowerCase() === name.toLowerCase()) || { slug: name.toLowerCase().replace(/\s+/g, "-") }).slug;

// ------------------------------------------------------------
// Siluetas SVG de ropa (estilo plano, fondo claro) por categoría.
// Se dibujan con el color de la prenda (fill) sobre fondo neutro.
// ------------------------------------------------------------
// Formas internas por categoría (sin fondo). Se reutilizan en
// silhouette (vista completa) y silhouetteAlt (vista detalle/zoom).
function _shapes(category, c, bg) {
  switch (category) {
    case "Legging":
      return `
        <path d='M110 40 h80 v40 c0 10 4 20 4 30 l-6 150 c0 8 -6 12 -14 12 h-10 c-8 0 -12 -6 -12 -14 l-4 -120 h-8 l-4 120 c0 8 -4 14 -12 14 h-10 c-8 0 -14 -4 -14 -12 l-6 -150 c0 -10 4 -20 4 -30 z'/>
        <rect x='108' y='38' width='84' height='16' rx='4'/>`;
    case "Bra deportivo":
      return `
        <path d='M95 90 h110 v30 c0 30 -25 55 -55 55 s-55 -25 -55 -55 z'/>
        <path d='M100 90 l10 -30 h90 l10 30' fill='none' stroke='${c}' stroke-width='10'/>`;
    case "Tank top":
      return `
        <path d='M110 50 h80 l10 40 c0 60 -10 110 -50 110 s-50 -50 -50 -110 z'/>
        <path d='M120 50 c0 20 10 30 30 30 s30 -10 30 -30' fill='${bg}'/>`;
    case "Camiseta":
      return `
        <path d='M100 60 l30 -14 c8 8 32 8 40 0 l30 14 l26 34 l-24 20 l-10 -10 v120 c0 8 -6 14 -14 14 h-60 c-8 0 -14 -6 -14 -14 v-120 l-10 10 l-24 -20 z'/>`;
    case "Short":
      return `
        <path d='M100 90 h100 v70 l-14 70 c-2 8 -8 12 -16 12 h-10 c-8 0 -14 -6 -14 -14 l-6 -50 h-4 l-6 50 c0 8 -6 14 -14 14 h-10 c-8 0 -14 -4 -16 -12 l-14 -70 z'/>
        <rect x='98' y='86' width='104' height='16' rx='4'/>`;
    case "Hoodie":
      return `
        <path d='M95 90 l30 -16 c8 8 52 8 60 0 l30 16 l24 30 l-22 20 l-8 -8 v120 c0 10 -8 18 -18 18 h-72 c-10 0 -18 -8 -18 -18 v-120 l-8 8 l-22 -20 z'/>
        <path d='M120 78 c0 -18 14 -30 30 -30 s30 12 30 30 c0 10 -14 16 -30 16 s-30 -6 -30 -16 z' fill='${bg}'/>
        <rect x='135' y='150' width='30' height='40' rx='6' fill='${bg}'/>`;
    case "Chaqueta":
      return `
        <path d='M100 70 l30 -16 c8 8 32 8 40 0 l30 16 l26 34 l-24 20 l-10 -10 v130 c0 8 -6 14 -14 14 h-60 c-8 0 -14 -6 -14 -14 v-130 l-10 10 l-24 -20 z'/>
        <path d='M150 70 v160' stroke='${bg}' stroke-width='6' fill='none'/>`;
    case "Pantalón":
      return `
        <path d='M110 50 h80 v40 l-6 160 c0 8 -6 12 -14 12 h-10 c-8 0 -12 -6 -12 -14 l-4 -120 h-8 l-4 120 c0 8 -4 14 -12 14 h-10 c-8 0 -14 -4 -14 -12 l-6 -160 z'/>
        <rect x='108' y='48' width='84' height='16' rx='4'/>`;
    case "Gorra":
      return `
        <path d='M90 150 c0 -40 27 -65 60 -65 s60 25 60 65 z'/>
        <path d='M80 150 h140 c10 0 14 8 8 14 l-10 8 c-4 4 -10 4 -14 0 l-124 -14 z'/>
        <circle cx='150' cy='120' r='8' fill='${bg}'/>`;
    case "Bolsa":
      return `
        <path d='M95 110 h110 l-12 120 c-1 8 -8 14 -16 14 h-54 c-8 0 -15 -6 -16 -14 z'/>
        <path d='M120 110 c0 -26 12 -40 30 -40 s30 14 30 40' fill='none' stroke='${c}' stroke-width='10'/>`;
    case "Botella":
      return `
        <rect x='128' y='70' width='44' height='160' rx='14'/>
        <rect x='134' y='52' width='32' height='22' rx='6'/>
        <rect x='128' y='120' width='44' height='26' fill='${bg}'/>`;
    case "Conjunto":
      return `
        <path d='M70 70 l22 -12 c6 6 24 6 30 0 l22 12 l18 24 l-18 14 l-6 -8 v90 c0 6 -4 10 -10 10 h-34 c-6 0 -10 -4 -10 -10 v-90 l-6 8 l-18 -14 z'/>
        <path d='M175 110 h55 v26 c0 8 3 14 3 22 l-4 90 c0 6 -4 9 -9 9 h-8 c-5 0 -8 -4 -8 -9 l-3 -70 h-5 l-3 70 c0 5 -3 9 -8 9 h-8 c-5 0 -9 -3 -9 -9 l-4 -90 c0 -8 3 -14 3 -22 z'/>`;
    default:
      return `<rect x='90' y='70' width='120' height='160' rx='10'/>`;
  }
}

// Vista completa: prenda centrada sobre fondo claro.
export function silhouette(category, color = "#1a1a1a") {
  const c = color;
  const bg = "#ececec";
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
      <rect width='300' height='300' fill='${bg}'/>
      <g fill='${c}' stroke='rgba(0,0,0,.12)' stroke-width='2'>${_shapes(category, c, bg)}</g>
    </svg>`;
}

// Vista detalle: zoom a la parte superior de la prenda sobre fondo oscuro
// (segunda imagen de la galería).
export function silhouetteAlt(category, color = "#1a1a1a") {
  const c = color;
  const bg = "#1c1c1c";
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
      <rect width='300' height='300' fill='${bg}'/>
      <g transform='translate(-75 -55) scale(1.5)' fill='${c}' stroke='rgba(255,255,255,.18)' stroke-width='1.5'>${_shapes(category, c, bg)}</g>
    </svg>`;
}

export const svgURI = (svg) => "data:image/svg+xml," + encodeURIComponent(svg);

// ============================================================
// CATÁLOGO
// brand: nombre de la marca · gender: 'Hombre'|'Mujer'
// category: tipo de prenda (determina la silueta)
// oldPrice: precio anterior (opcional, para descuento)
// stock: piezas restantes (bajo => badge "ÚLTIMAS PIEZAS")
// rating: 0-5 (placeholder hasta tener reseñas reales)
// ============================================================
export const PRODUCTS = [
  // ---------- LULULEMON · MUJER ----------
  { brand:"lululemon", gender:"Mujer", category:"Legging", name:"Align™ Leggings", price:1799, oldPrice:2199, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Cereza",hex:"#7f1d1d"},{name:"Niebla",hex:"#cbd5e1"},{name:"Salvia",hex:"#8a9a5b"}], badge:"MÁS VENDIDO", stock:14, rating:5, desc:"Legging buttery-soft de Nulu™, perfecto para yoga y uso diario.", materials:"Nulu™ (92% poliéster, 8% elastano)", care:"Lavar en frío, secar a la sombra, no usar secadora." },
  { brand:"lululemon", gender:"Mujer", category:"Bra deportivo", name:"Wonderbra Medium Support", price:1090, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Perla",hex:"#e7e5e4"},{name:"Turquesa",hex:"#2dd4bf"}], stock:9, rating:4, desc:"Sujetador de soporte medio con tecnología anti-humedad.", materials:"Nulux™ (86% poliéster, 14% elastano)", care:"Lavar en frío con jabón neutro, secar al aire." },
  { brand:"lululemon", gender:"Mujer", category:"Tank top", name:"Freestyle Tank", price:950, oldPrice:1150, sizes:["XS","S","M","L"], colors:[{name:"Blanco",hex:"#f5f5f4"},{name:"Coral",hex:"#fb7185"},{name:"Negro",hex:"#1a1a1a"}], badge:"MÁS VENDIDO", stock:18, rating:5, desc:"Tank versátil de corte clásico, se ve bien solo o sobre una blusa.", materials:"Everlux™ (88% poliéster, 12% elastano)", care:"Lavar en frío, secar colgado." },
  { brand:"lululemon", gender:"Mujer", category:"Short", name:"Swift Speed Short", price:1150, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Limón",hex:"#bef264"},{name:"Uva",hex:"#7c3aed"}], stock:11, rating:4, desc:"Short ligero de Swift™, tu aliado para correr y entrenar.", materials:"Swift™ (87% poliéster, 13% elastano)", care:"Lavar en frío, secar al aire." },
  { brand:"lululemon", gender:"Mujer", category:"Chaqueta", name:"Rainshell Jacket", price:2490, oldPrice:2890, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Azul cielo",hex:"#7dd3fc"}], badge:"NUEVO", stock:6, rating:5, desc:"Chaqueta impermeable ultraligera con costuras selladas.", materials:"Nylon ripstop con membrana impermeable", care:"Lavar a mano, no frotar, secar colgado." },
  { brand:"lululemon", gender:"Mujer", category:"Conjunto", name:"Yoga Set (Align + Freestyle)", price:2840, oldPrice:3349, sizes:["XS","S","M","L"], colors:[{name:"Dúo perla",hex:"#e7e5e4"},{name:"Dúo cereza",hex:"#7f1d1d"}], badge:"MÁS VENDIDO", stock:5, rating:5, desc:"El set favorito: legging Align + tank Freestyle.", materials:"Nulu™ y Everlux™", care:"Lavar en frío, secar a la sombra." },

  // ---------- LULULEMON · HOMBRE ----------
  { brand:"lululemon", gender:"Hombre", category:"Camiseta", name:"Metal Vent Tech Tee", price:1290, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Oliva",hex:"#556b2f"}], badge:"MÁS VENDIDO", stock:16, rating:5, desc:"Playera de ventilación estratégica para sesiones intensas.", materials:"Everlux™ (88% poliéster, 12% elastano)", care:"Lavar en frío, secar al aire." },
  { brand:"lululemon", gender:"Hombre", category:"Pantalón", name:"ABZ Sweater Pant", price:2190, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Piedra",hex:"#d6d3d1"},{name:"Caqui",hex:"#a3855c"}], stock:10, rating:5, desc:"Pantalón tipo suéter ultra suave, del gym a la calle.", materials:"ABZ (70% algodón, 28% poliéster, 2% elastano)", care:"Lavar en frío, secar a la sombra." },
  { brand:"lululemon", gender:"Hombre", category:"Hoodie", name:"Everlux Half-Zip", price:1790, oldPrice:2090, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"}], stock:8, rating:4, desc:"Media cremallera de Everlux, ligero y de secado rápido.", materials:"Everlux™ (88% poliéster, 12% elastano)", care:"Lavar en frío, secar colgado." },
  { brand:"lululemon", gender:"Hombre", category:"Chaqueta", name:"Pace Breaker Shell", price:2690, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Verde bosque",hex:"#14532d"}], badge:"NUEVO", stock:4, rating:5, desc:"Shell impermeable y transpirable para todo clima.", materials:"Nylon con membrana impermeable", care:"Lavar a mano, secar colgado." },
  { brand:"lululemon", gender:"Hombre", category:"Short", name:"Pace Breaker Short", price:1499, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Naranja",hex:"#ea580c"},{name:"Azul",hex:"#2563eb"},{name:"Oliva",hex:"#556b2f"}], stock:13, rating:4, desc:"Short de running 5\" con malla interior y bolsillo trasero.", materials:"Everlux™ con malla interior", care:"Lavar en frío, secar al aire." },
  { brand:"lululemon", gender:"Hombre", category:"Gorra", name:"Classic Cap", price:899, sizes:["Única"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Rojo",hex:"#dc2626"},{name:"Marino",hex:"#1e3a5f"}], stock:20, rating:4, desc:"Gorra estructurada con bordado Athletic Vault.", materials:"Algodón 100%", care:"Lavar a mano, secar a la sombra." },

  // ---------- GYMSHARK · MUJER ----------
  { brand:"Gymshark", gender:"Mujer", category:"Legging", name:"Sculpt High-Rise Legging", price:899, oldPrice:1099, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"},{name:"Salvia",hex:"#8a9a5b"}], badge:"MÁS VENDIDO", stock:22, rating:5, desc:"Legging de compresión media con cintura alta y bolsillo lateral.", materials:"92% poliéster, 8% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Mujer", category:"Bra deportivo", name:"Adapt Sports Bra", price:1199, sizes:["XS","S","M","L"], colors:[{name:"Rosa palo",hex:"#e7b7c4"},{name:"Negro",hex:"#1a1a1a"},{name:"Perla",hex:"#e7e5e4"},{name:"Turquesa",hex:"#2dd4bf"}], stock:15, rating:4, desc:"Sujetador de soporte medio con costuras planas y espalda cruzada.", materials:"88% poliéster, 12% elastano", care:"Lavar en frío, secar colgado." },
  { brand:"Gymshark", gender:"Mujer", category:"Tank top", name:"Seamless Tank Top", price:499, sizes:["XS","S","M","L","XL"], colors:[{name:"Blanco",hex:"#f5f5f4"},{name:"Lavanda",hex:"#c4b5fd"},{name:"Negro",hex:"#1a1a1a"}], badge:"NUEVO", stock:25, rating:4, desc:"Top sin costuras de secado rápido, ideal para HIIT y yoga.", materials:"85% poliéster, 15% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Mujer", category:"Short", name:"Biker Short 7/8", price:699, oldPrice:849, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Terracota",hex:"#c1663f"},{name:"Oliva",hex:"#556b2f"}], stock:19, rating:5, desc:"Short biker de tiro alto con acabado mate.", materials:"90% poliéster, 10% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Mujer", category:"Conjunto", name:"Studio Set (Top + Legging)", price:1399, oldPrice:1698, sizes:["XS","S","M","L"], colors:[{name:"Dúo negro",hex:"#1a1a1a"},{name:"Dúo salvia",hex:"#8a9a5b"}], badge:"MÁS VENDIDO", stock:7, rating:5, desc:"Set coordinado de top y legging para entrenar o salir.", materials:"Poliéster con elastano", care:"Lavar en frío, secar a la sombra." },

  // ---------- GYMSHARK · HOMBRE ----------
  { brand:"Gymshark", gender:"Hombre", category:"Camiseta", name:"Vital T-Shirt", price:899, sizes:["S","M","L","XL","XXL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Gris",hex:"#71717a"},{name:"Oliva",hex:"#556b2f"}], stock:28, rating:5, desc:"Playera técnica transpirable de ajuste entallado.", materials:"95% algodón, 5% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Hombre", category:"Short", name:"Training Short 7\"", price:599, oldPrice:749, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Marino",hex:"#1e3a5f"},{name:"Rojo",hex:"#dc2626"}], stock:24, rating:4, desc:"Short de entrenamiento 7 pulgadas con malla interior.", materials:"100% poliéster", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Hombre", category:"Pantalón", name:"Flex Training Pant", price:849, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Pizarra",hex:"#334155"}], stock:12, rating:4, desc:"Pantalón de entrenamiento elástico con puños y bolsillos.", materials:"92% poliéster, 8% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Hombre", category:"Camiseta", name:"Long Sleeve Racer", price:549, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"}], badge:"NUEVO", stock:17, rating:4, desc:"Manga larga racerback para mayor libertad de movimiento.", materials:"90% algodón, 10% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Gymshark", gender:"Hombre", category:"Hoodie", name:"Crest Hoodie", price:1899, oldPrice:2299, sizes:["S","M","L","XL"], colors:[{name:"Crema",hex:"#efe9dd"},{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"},{name:"Mostaza",hex:"#d4a017"}], stock:9, rating:5, desc:"Sudadera con capucha de punto pesado, corte relajado.", materials:"80% algodón, 20% poliéster", care:"Lavar en frío, secar a la sombra." },

  // ---------- ALO · MUJER ----------
  { brand:"Alo", gender:"Mujer", category:"Legging", name:"Airlift Legging", price:1990, oldPrice:2390, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Menta",hex:"#99f6e4"},{name:"Arena",hex:"#d8c3a5"}], badge:"NUEVO", stock:8, rating:5, desc:"Legging de compresión con cintura alta y acabado satinado.", materials:"Alo Air (88% poliéster, 12% elastano)", care:"Lavar en frío, secar a la sombra." },
  { brand:"Alo", gender:"Mujer", category:"Bra deportivo", name:"Airlift Bra", price:1290, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Menta",hex:"#99f6e4"},{name:"Perla",hex:"#e7e5e4"}], stock:10, rating:5, desc:"Bra de soporte medio a juego con la línea Airlift.", materials:"Alo Air (88% poliéster, 12% elastano)", care:"Lavar en frío, secar colgado." },
  { brand:"Alo", gender:"Mujer", category:"Hoodie", name:"Yuzo Hoodie", price:2490, sizes:["S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Hueso",hex:"#e7e5e4"},{name:"Salvia",hex:"#8a9a5b"}], badge:"MÁS VENDIDO", stock:5, rating:5, desc:"Hoodie oversize de punto premium, el favorito de la marca.", materials:"70% algodón, 30% poliéster", care:"Lavar en frío, secar a la sombra." },

  // ---------- ALO · HOMBRE ----------
  { brand:"Alo", gender:"Hombre", category:"Camiseta", name:"Aero Tee", price:1090, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Grafito",hex:"#3f3f46"}], stock:14, rating:4, desc:"Playera técnica de secado rápido con corte relajado.", materials:"92% poliéster, 8% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Alo", gender:"Hombre", category:"Short", name:"Aero Short", price:990, oldPrice:1190, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Marino",hex:"#1e3a5f"}], stock:16, rating:4, desc:"Short de entrenamiento ligero con bolsillo lateral.", materials:"90% poliéster, 10% elastano", care:"Lavar en frío, secar al aire." },

  // ---------- UNDER ARMOUR · HOMBRE ----------
  { brand:"Under Armour", gender:"Hombre", category:"Camiseta", name:"Tech 2.0 Tee", price:849, oldPrice:1049, sizes:["S","M","L","XL","XXL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Grafito",hex:"#3f3f46"}], stock:22, rating:4, desc:"Playera técnica de secado rápido con ajuste entallado.", materials:"92% poliéster, 8% elastano", care:"Lavar en frío, secar al aire." },
  { brand:"Under Armour", gender:"Hombre", category:"Short", name:"Rival Fleece Short", price:749, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Marino",hex:"#1e3a5f"}], stock:20, rating:4, desc:"Short de punto Rival Fleece, cómodo para el día a día.", materials:"88% algodón, 12% poliéster", care:"Lavar en frío, secar a la sombra." },

  // ---------- ACCESORIOS ----------
  { brand:"lululemon", gender:"Mujer", category:"Bolsa", name:"Everyday Tote", price:1590, sizes:["Única"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Arena",hex:"#d8c3a5"}], stock:15, rating:4, desc:"Bolsa de tela resistente para el gym o la ciudad.", materials:"Poliéster reciclado", care:"Lavar a mano, secar al aire." },
  { brand:"Gymshark", gender:"Hombre", category:"Botella", name:"Steel Bottle 750ml", price:499, sizes:["750ml"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Plata",hex:"#c0c0c0"},{name:"Rojo",hex:"#dc2626"}], stock:35, rating:4, desc:"Botella de acero inoxidable que mantiene la temperatura.", materials:"Acero inoxidable 304", care:"Lavar a mano, no usar en microondas." },
  { brand:"Alo", gender:"Mujer", category:"Bolsa", name:"Alo Gym Duffel", price:2190, oldPrice:2590, sizes:["Única"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Hueso",hex:"#e7e5e4"}], badge:"NUEVO", stock:6, rating:5, desc:"Duffel premium con compartimento para zapatos.", materials:"Poliéster balístico", care:"Limpieza con paño húmedo." },
];

// Asignar id estable + slug de marca a cada producto
PRODUCTS.forEach((p, i) => {
  p.id = i;
  p.brandSlug = brandSlug(p.brand);
  p.gender = p.gender.toLowerCase(); // "mujer" | "hombre"
  p.accessory = ["Bolsa", "Botella", "Gorra"].includes(p.category);
  p.offer = !!p.oldPrice;
  p.discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  p.lowStock = p.stock <= 6;
  p.sku = p.sku || `AV-${String(i + 1).padStart(4, "0")}`;
  p.createdAt = p.createdAt || Date.now() - (PRODUCTS.length - i) * 864e5;
});

export const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const byBrand = (slug) => PRODUCTS.filter((p) => p.brandSlug === slug);
export const byGender = (g) => PRODUCTS.filter((p) => p.gender === g.toLowerCase());
export const byAccessory = () => PRODUCTS.filter((p) => p.accessory);
export const byOffer = () => PRODUCTS.filter((p) => p.offer);
export const byNew = () => PRODUCTS.filter((p) => p.badge === "NUEVO");
// Piezas del próximo drop: novedades + stock limitado (edición limitada)
export const byDrop = () =>
  PRODUCTS.filter((p) => p.badge === "NUEVO" || p.lowStock).sort((a, b) => b.createdAt - a.createdAt);
export const related = (p, n = 4) =>
  PRODUCTS.filter((x) => x.id !== p.id && (x.brand === p.brand || x.gender === p.gender)).slice(0, n);
