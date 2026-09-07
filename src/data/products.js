// ============================================================
// LULUSHARK · Datos de productos
// Edita aquí tu catálogo. Cada prenda es un objeto.
// ============================================================

export const CONFIG = {
  // Número de WhatsApp con código de país, SOLO números (sin +, espacios ni guiones).
  // México: 521 + número. Cambia por el tuyo.
  whatsapp: "5215500000000",
  // Usuario de Instagram SIN el @.
  instagram: "lulushark",
  // Nombre de la tienda en los mensajes.
  storeName: "LuluShark",
};

// Siluetas SVG de ropa (estilo plano, fondo claro) para cada categoría.
// Se dibujan con el color de la prenda (fill) sobre fondo neutro.
export function silhouette(category, color = "#1a1a1a") {
  const c = color;
  const bg = "#ececec";
  const wrap = (inner) =>
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
      <rect width='300' height='300' fill='${bg}'/>
      <g fill='${c}' stroke='rgba(0,0,0,.15)' stroke-width='2'>${inner}</g>
    </svg>`;

  switch (category) {
    case "Legging":
      return wrap(`
        <path d='M110 40 h80 v40 c0 10 4 20 4 30 l-6 150 c0 8 -6 12 -14 12 h-10 c-8 0 -12 -6 -12 -14 l-4 -120 h-8 l-4 120 c0 8 -4 14 -12 14 h-10 c-8 0 -14 -4 -14 -12 l-6 -150 c0 -10 4 -20 4 -30 z'/>
        <rect x='108' y='34' width='84' height='16' rx='6'/>`);
    case "Bra deportivo":
      return wrap(`
        <path d='M95 70 c0 -10 10 -16 20 -16 h70 c10 0 20 6 20 16 v10 c0 30 -18 52 -40 52 c-8 0 -14 -4 -20 -10 c-6 6 -12 10 -20 10 c-22 0 -40 -22 -40 -52 z'/>
        <rect x='100' y='52' width='12' height='40' rx='6'/>
        <rect x='188' y='52' width='12' height='40' rx='6'/>`);
    case "Tank top":
      return wrap(`
        <path d='M105 45 c10 -8 20 -8 30 0 l15 12 l15 -12 c10 -8 20 -8 30 0 l15 15 c6 6 6 16 0 22 l-12 12 v120 c0 8 -6 14 -14 14 h-72 c-8 0 -14 -6 -14 -14 v-120 l-12 -12 c-6 -6 -6 -16 0 -22 z'/>`);
    case "Camiseta":
      return wrap(`
        <path d='M100 50 l30 -14 c8 8 32 8 40 0 l30 14 l22 26 l-20 18 l-8 -8 v120 c0 8 -6 14 -14 14 h-60 c-8 0 -14 -6 -14 -14 v-120 l-8 8 l-20 -18 z'/>`);
    case "Short":
      return wrap(`
        <path d='M95 70 h110 v30 l-14 90 c-2 8 -8 12 -16 12 h-14 c-8 0 -12 -6 -12 -14 l-2 -60 h-4 l-2 60 c0 8 -4 14 -12 14 h-14 c-8 0 -14 -4 -16 -12 l-14 -90 z'/>
        <rect x='93' y='64' width='114' height='14' rx='5'/>`);
    case "Hoodie":
      return wrap(`
        <path d='M100 70 c0 -20 20 -34 50 -34 c30 0 50 14 50 34 l14 16 c6 6 6 16 0 22 l-16 14 v110 c0 8 -6 14 -14 14 h-78 c-8 0 -14 -6 -14 -14 v-110 l-16 -14 c-6 -6 -6 -16 0 -22 z'/>
        <path d='M120 40 c0 -14 14 -22 30 -22 c16 0 30 8 30 22 c0 10 -8 16 -16 16 h-28 c-8 0 -16 -6 -16 -16 z' fill='rgba(0,0,0,.18)'/>
        <rect x='140' y='150' width='20' height='40' rx='4' fill='rgba(0,0,0,.18)'/>`);
    case "Chaqueta":
      return wrap(`
        <path d='M100 60 l30 -16 c8 8 32 8 40 0 l30 16 l20 24 l-18 16 l-6 -6 v120 c0 8 -6 14 -14 14 h-74 c-8 0 -14 -6 -14 -14 v-120 l-6 6 l-18 -16 z'/>
        <rect x='146' y='58' width='8' height='180' fill='rgba(0,0,0,.25)'/>`);
    case "Pantalón":
      return wrap(`
        <path d='M105 45 h90 v40 l-8 160 c0 8 -6 14 -14 14 h-12 c-8 0 -12 -6 -12 -14 l-4 -120 h-8 l-4 120 c0 8 -4 14 -12 14 h-12 c-8 0 -14 -6 -14 -14 l-8 -160 z'/>
        <rect x='103' y='39' width='94' height='16' rx='6'/>`);
    case "Gorra":
      return wrap(`
        <path d='M70 150 c0 -40 30 -66 80 -66 c50 0 80 26 80 66 v10 h-160 z'/>
        <path d='M70 160 c-14 0 -24 8 -24 18 c0 8 8 12 18 12 h150 c10 0 18 -6 18 -14 c0 -10 -10 -16 -24 -16 z'/>
        <circle cx='150' cy='120' r='10' fill='rgba(255,255,255,.5)'/>`);
    case "Bolsa":
      return wrap(`
        <path d='M90 110 h120 l-10 120 c-1 8 -8 14 -16 14 h-68 c-8 0 -15 -6 -16 -14 z'/>
        <path d='M115 110 c0 -22 12 -34 35 -34 c23 0 35 12 35 34' fill='none' stroke='${c}' stroke-width='10'/>`);
    case "Botella":
      return wrap(`
        <rect x='128' y='70' width='44' height='160' rx='14'/>
        <rect x='134' y='52' width='32' height='22' rx='6'/>
        <rect x='128' y='120' width='44' height='10' fill='rgba(255,255,255,.4)'/>`);
    default:
      return wrap(`<circle cx='150' cy='150' r='70'/>`);
  }
}

// Convierte el SVG a data URI para usar en <img>
export const svgURI = (svg) => "data:image/svg+xml," + encodeURIComponent(svg);

// ============================================================
// CATÁLOGO
// brand: 'Gymshark' | 'Lululemon'
// gender:'Hombre' | 'Mujer'
// category: tipo de prenda (determina la silueta)
// ============================================================
export const PRODUCTS = [
  // ---------- LULELEMON · MUJER ----------
  { brand:"Lululemon", gender:"Mujer", category:"Legging", name:"Align™ Leggings", price:1799, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Cereza",hex:"#7f1d1d"},{name:"Niebla",hex:"#cbd5e1"},{name:"Salvia",hex:"#8a9a5b"}], badge:"Más vendido", desc:"Legging buttery-soft de Nulu™, perfecto para yoga y uso diario." },
  { brand:"Gymshark", gender:"Mujer", category:"Bra deportivo", name:"Adapt Sports Bra", price:1199, sizes:["XS","S","M","L"], colors:[{name:"Rosa palo",hex:"#e7b7c4"},{name:"Negro",hex:"#1a1a1a"},{name:"Perla",hex:"#e7e5e4"},{name:"Turquesa",hex:"#2dd4bf"}], desc:"Sujetador de soporte medio con costuras planas y espalda cruzada." },
  { brand:"Gymshark", gender:"Hombre", category:"Camiseta", name:"Vital T-Shirt", price:899, sizes:["S","M","L","XL","XXL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Gris",hex:"#71717a"},{name:"Oliva",hex:"#556b2f"}], desc:"Playera técnica transpirable de ajuste entallado." },
  { brand:"Lululemon", gender:"Hombre", category:"Short", name:"Pace Breaker Short", price:1499, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Naranja",hex:"#ea580c"},{name:"Azul",hex:"#2563eb"},{name:"Oliva",hex:"#556b2f"}], desc:"Short de running 5\" con malla interior y bolsillo trasero." },
  { brand:"Gymshark", gender:"Hombre", category:"Hoodie", name:"Crest Hoodie", price:1899, sizes:["S","M","L","XL"], colors:[{name:"Crema",hex:"#efe9dd"},{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"},{name:"Mostaza",hex:"#d4a017"}], desc:"Sudadera con capucha de punto pesado, corte relajado." },
  { brand:"Lululemon", gender:"Hombre", category:"Gorra", name:"Classic Cap", price:899, sizes:["Única"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Rojo",hex:"#dc2626"},{name:"Marino",hex:"#1e3a5f"}], desc:"Gorra estructurada con bordado LuluShark." },

  // ---------- GYMSHARK · MUJER ----------
  { brand:"Gymshark", gender:"Mujer", category:"Legging", name:"Sculpt High-Rise Legging", price:899, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"},{name:"Salvia",hex:"#8a9a5b"}], badge:"Top ventas", desc:"Legging de compresión media con cintura alta y bolsillo lateral." },
  { brand:"Gymshark", gender:"Mujer", category:"Tank top", name:"Seamless Tank Top", price:499, sizes:["XS","S","M","L","XL"], colors:[{name:"Blanco",hex:"#f5f5f4"},{name:"Lavanda",hex:"#c4b5fd"},{name:"Negro",hex:"#1a1a1a"}], badge:"Nuevo", desc:"Top sin costuras de secado rápido, ideal para HIIT y yoga." },
  { brand:"Gymshark", gender:"Mujer", category:"Short", name:"Biker Short 7/8", price:699, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Terracota",hex:"#c1663f"},{name:"Oliva",hex:"#556b2f"}], desc:"Short biker de tiro alto con acabado mate." },
  { brand:"Gymshark", gender:"Mujer", category:"Conjunto", name:"Studio Set (Top + Legging)", price:1399, sizes:["XS","S","M","L"], colors:[{name:"Dúo negro",hex:"#1a1a1a"},{name:"Dúo salvia",hex:"#8a9a5b"}], badge:"Combo", desc:"Set coordinado de top y legging para entrenar o salir." },

  // ---------- GYMSHARK · HOMBRE ----------
  { brand:"Gymshark", gender:"Hombre", category:"Short", name:"Training Short 7\"", price:599, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Marino",hex:"#1e3a5f"},{name:"Rojo",hex:"#dc2626"}], desc:"Short de entrenamiento 7 pulgadas con malla interior." },
  { brand:"Gymshark", gender:"Hombre", category:"Pantalón", name:"Flex Training Pant", price:849, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Pizarra",hex:"#334155"}], desc:"Pantalón de entrenamiento elástico con puños y bolsillos." },
  { brand:"Gymshark", gender:"Hombre", category:"Camiseta", name:"Long Sleeve Racer", price:549, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"}], badge:"Nuevo", desc:"Manga larga racerback para mayor libertad de movimiento." },

  // ---------- LULELEMON · MUJER ----------
  { brand:"Lululemon", gender:"Mujer", category:"Bra deportivo", name:"Wonderbra Medium Support", price:1090, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Perla",hex:"#e7e5e4"},{name:"Turquesa",hex:"#2dd4bf"}], desc:"Sujetador de soporte medio con tecnología anti-humedad." },
  { brand:"Lululemon", gender:"Mujer", category:"Tank top", name:"Freestyle Tank", price:950, sizes:["XS","S","M","L"], colors:[{name:"Blanco",hex:"#f5f5f4"},{name:"Coral",hex:"#fb7185"},{name:"Negro",hex:"#1a1a1a"}], badge:"Top ventas", desc:"Tank versátil de corte clásico, se ve bien solo o sobre una blusa." },
  { brand:"Lululemon", gender:"Mujer", category:"Short", name:"Swift Speed Short", price:1150, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Limón",hex:"#bef264"},{name:"Uva",hex:"#7c3aed"}], desc:"Short ligero de Swift™, tu aliado para correr y entrenar." },
  { brand:"Lululemon", gender:"Mujer", category:"Chaqueta", name:"Rainshell Jacket", price:2490, sizes:["XS","S","M","L"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Azul cielo",hex:"#7dd3fc"}], badge:"Impermeable", desc:"Chaqueta impermeable ultraligera con costuras selladas." },
  { brand:"Lululemon", gender:"Mujer", category:"Conjunto", name:"Yoga Set (Align + Freestyle)", price:2840, sizes:["XS","S","M","L"], colors:[{name:"Dúo perla",hex:"#e7e5e4"},{name:"Dúo cereza",hex:"#7f1d1d"}], badge:"Combo", desc:"El set favorito: legging Align + tank Freestyle." },

  // ---------- LULELEMON · HOMBRE ----------
  { brand:"Lululemon", gender:"Hombre", category:"Camiseta", name:"Metal Vent Tech Tee", price:1290, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Blanco",hex:"#f5f5f4"},{name:"Oliva",hex:"#556b2f"}], badge:"Top ventas", desc:"Playera de ventilación estratégica para sesiones intensas." },
  { brand:"Lululemon", gender:"Hombre", category:"Pantalón", name:"ABZ Sweater Pant", price:2190, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Piedra",hex:"#d6d3d1"},{name:"Caqui",hex:"#a3855c"}], badge:"Comodidad", desc:"Pantalón tipo suéter ultra suave, del gym a la calle." },
  { brand:"Lululemon", gender:"Hombre", category:"Hoodie", name:"Everlux Half-Zip", price:1790, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Grafito",hex:"#3f3f46"}], desc:"Media cremallera de Everlux, ligero y de secado rápido." },
  { brand:"Lululemon", gender:"Hombre", category:"Chaqueta", name:"Pace Breaker Shell", price:2690, sizes:["S","M","L","XL"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Verde bosque",hex:"#14532d"}], badge:"Impermeable", desc:"Shell impermeable y transpirable para todo clima." },

  // ---------- ACCESORIOS ----------
  { brand:"Lululemon", gender:"Mujer", category:"Bolsa", name:"Everyday Tote", price:1590, sizes:["Única"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Arena",hex:"#d8c3a5"}], desc:"Bolsa de tela resistente para el gym o la ciudad." },
  { brand:"Gymshark", gender:"Hombre", category:"Botella", name:"Steel Bottle 750ml", price:499, sizes:["750ml"], colors:[{name:"Negro",hex:"#1a1a1a"},{name:"Plata",hex:"#c0c0c0"},{name:"Rojo",hex:"#dc2626"}], desc:"Botella de acero inoxidable que mantiene la temperatura." },
];
