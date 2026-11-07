'use strict';

/* ReAlimenta: interfaz y almacenamiento local sin dependencias externas. */
const STORAGE_KEY = 'realimenta_data_v1';
const COLORS = {
  bread: ['#f4e8d7','#d9a35e'], fruits: ['#e8efdc','#82a66b'], meals: ['#f5e6d4','#c47d4e'], dairy: ['#e9eef0','#8daeb4'], dessert: ['#f2e2e6','#c98b98']
};
const initialProducts = [
  {id:'p01',name:'Bolsa de pan artesanal',category:'Panadería',merchant:'Panadería La Espiga',zone:'Centro',price:8500,oldPrice:16000,stock:6,unit:'bolsa surtida',type:'bread',description:'Selección de panes del día, ideal para compartir en casa.',pickup:'4:00 p. m. a 7:00 p. m.'},
  {id:'p02',name:'Canasta de frutas frescas',category:'Frutas y verduras',merchant:'Frutería El Huerto',zone:'San Mateo',price:12000,oldPrice:22000,stock:4,unit:'canasta',type:'fruits',description:'Frutas de temporada seleccionadas para disfrutar pronto.',pickup:'3:00 p. m. a 6:00 p. m.'},
  {id:'p03',name:'Almuerzo casero del día',category:'Comidas preparadas',merchant:'Cocina de Barrio',zone:'Centro',price:10500,oldPrice:19000,stock:5,unit:'porción',type:'meals',description:'Comida recién preparada con acompañamientos del día.',pickup:'1:30 p. m. a 3:30 p. m.'},
  {id:'p04',name:'Yogures naturales surtidos',category:'Lácteos',merchant:'Mercado Buen Día',zone:'Compartir',price:7000,oldPrice:12500,stock:8,unit:'paquete',type:'dairy',description:'Yogures refrigerados, disponibles para retiro el mismo día.',pickup:'2:00 p. m. a 6:00 p. m.'},
  {id:'p05',name:'Caja de repostería variada',category:'Repostería',merchant:'Dulce Esquina',zone:'San Mateo',price:14000,oldPrice:26000,stock:3,unit:'caja',type:'dessert',description:'Porciones surtidas de repostería horneada en el día.',pickup:'4:00 p. m. a 7:00 p. m.'},
  {id:'p06',name:'Verduras de temporada',category:'Frutas y verduras',merchant:'Frutería El Huerto',zone:'San Mateo',price:9000,oldPrice:17000,stock:7,unit:'bolsa',type:'fruits',description:'Combinación de verduras frescas ideales para tus preparaciones.',pickup:'3:00 p. m. a 6:00 p. m.'},
  {id:'p07',name:'Croissants recién horneados',category:'Panadería',merchant:'Panadería La Espiga',zone:'Centro',price:6500,oldPrice:12000,stock:9,unit:'paquete',type:'bread',description:'Croissants de mantequilla preparados durante la jornada.',pickup:'4:00 p. m. a 7:00 p. m.'},
  {id:'p08',name:'Ensalada lista para llevar',category:'Comidas preparadas',merchant:'Cocina de Barrio',zone:'Centro',price:8900,oldPrice:15500,stock:4,unit:'unidad',type:'meals',description:'Ensalada del día con ingredientes frescos y variados.',pickup:'1:30 p. m. a 3:30 p. m.'},
  {id:'p09',name:'Selección de quesos',category:'Lácteos',merchant:'Mercado Buen Día',zone:'Compartir',price:11500,oldPrice:20000,stock:5,unit:'paquete',type:'dairy',description:'Selección de quesos refrigerados listos para consumir.',pickup:'2:00 p. m. a 6:00 p. m.'},
  {id:'p10',name:'Porción de torta del día',category:'Repostería',merchant:'Dulce Esquina',zone:'San Mateo',price:5500,oldPrice:10000,stock:6,unit:'porción',type:'dessert',description:'Torta artesanal disponible según la preparación del día.',pickup:'4:00 p. m. a 7:00 p. m.'},
  {id:'p11',name:'Pan integral de semillas',category:'Panadería',merchant:'Panadería La Espiga',zone:'Centro',price:7800,oldPrice:14500,stock:5,unit:'unidad',type:'bread',description:'Pan integral elaborado con mezcla de semillas.',pickup:'4:00 p. m. a 7:00 p. m.'},
  {id:'p12',name:'Mercado de vegetales mixtos',category:'Frutas y verduras',merchant:'Frutería El Huerto',zone:'San Mateo',price:13500,oldPrice:24000,stock:3,unit:'canasta',type:'fruits',description:'Vegetales variados para preparar varias comidas en casa.',pickup:'3:00 p. m. a 6:00 p. m.'}
];
const formatMoney = value => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = selector => document.querySelector(selector);
let state = loadState();
let activeCategory = 'all';
let searchTerm = '';
let sortBy = 'recommended';
let favoritesOnly = false;
let activeModalProduct = null;
let requestedQty = 1;
let toastTimer;
let restoreFocus = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved && saved.version===1 && Array.isArray(saved.products) && Array.isArray(saved.reservations) && Array.isArray(saved.favorites)){
      const cleanProducts = saved.products.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && Number.isFinite(p.stock));
      return {version:1,products:cleanProducts,reservations:saved.reservations,favorites:saved.favorites};
    }
  }catch(e){ /* El navegador puede tener el almacenamiento deshabilitado. */ }
  return {version:1,products:initialProducts.map(p=>({...p})),reservations:[],favorites:[]};
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast('No fue posible guardar los cambios en este navegador.');}}
const findProduct = id => state.products.find(p=>p.id===id);
const discount = p => p.oldPrice>p.price?Math.round((1-p.price/p.oldPrice)*100):0;
const foodSvg = type => {
  const common = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" class="food-image" aria-hidden="true"';
  const art = {
    bread:`<ellipse cx="130" cy="157" rx="99" ry="12" fill="#8b6b43" opacity=".12"/><path d="M38 119Q25 85 57 65q28-21 59 0 26-19 57 4 35-12 51 19 10 22-2 43-22 17-94 17-75 0-90-29Z" fill="#c98947"/><path d="M44 110Q34 81 64 70q29-15 48 8 29-20 59-2 33-6 44 19" fill="none" stroke="#e7b879" stroke-width="15" stroke-linecap="round"/><path d="m78 78-13 27m60-32-12 31m57-28-9 28" stroke="#fff1d0" stroke-width="6" stroke-linecap="round"/>`,
    fruits:`<ellipse cx="128" cy="158" rx="95" ry="11" fill="#4d6243" opacity=".12"/><path d="M45 121q-12-19 7-47 15-19 32-13 18-7 33 10 19-20 42-9 26-12 46 11 16 20 9 51-30 31-85 28-56 0-84-31Z" fill="#d5a970"/><circle cx="89" cy="97" r="36" fill="#da7251"/><circle cx="145" cy="95" r="37" fill="#e6b84a"/><circle cx="185" cy="107" r="26" fill="#87a65b"/><path d="M84 66q8-19 18-17m36 13q5-14 17-17m29 37q0-12 9-19" stroke="#557840" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M95 62q15-17 27-7-12 15-27 7Zm53-4q-8-19-23-12 9 18 23 12Z" fill="#58824b"/>`,
    meals:`<ellipse cx="130" cy="155" rx="92" ry="11" fill="#7c5a3a" opacity=".13"/><ellipse cx="130" cy="105" rx="99" ry="52" fill="#e8e0ce"/><ellipse cx="130" cy="103" rx="87" ry="42" fill="#faf6e9"/><path d="M62 101q16-28 50-20 9 25-11 43-28 1-39-23Z" fill="#7d9856"/><path d="M119 78q42-15 72 13-10 37-50 37-34-19-22-50Z" fill="#dda75b"/><path d="M126 95q28-12 48 9" stroke="#f3ce84" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="98" cy="113" r="12" fill="#d16f4e"/><circle cx="109" cy="92" r="9" fill="#ecba55"/><path d="M69 99q9 4 16-4m9 25q12-7 17-2" stroke="#bed58b" stroke-width="5" fill="none"/>`,
    dairy:`<ellipse cx="130" cy="158" rx="92" ry="11" fill="#788e8e" opacity=".12"/><rect x="62" y="56" width="64" height="89" rx="11" fill="#fdfcf4" stroke="#bdd4d3" stroke-width="4"/><rect x="73" y="39" width="42" height="24" rx="6" fill="#b9d6d2"/><path d="M62 99h64v23H62Z" fill="#8abdb6"/><path d="M86 100c-7-10 6-18 14-10 6 7-5 18-14 10Z" fill="#f9f7eb"/><rect x="138" y="72" width="55" height="74" rx="12" fill="#f7f5e9" stroke="#c2d8d0" stroke-width="4"/><rect x="147" y="61" width="37" height="16" rx="5" fill="#90c3b9"/><rect x="138" y="114" width="55" height="16" fill="#8bb8b4"/>`,
    dessert:`<ellipse cx="130" cy="158" rx="101" ry="10" fill="#9b6b73" opacity=".13"/><path d="M48 129 104 57l98 69-15 17-139-1Z" fill="#d19a83"/><path d="m48 129 56-72 98 69-15 10-82-60-39 60Z" fill="#f2c8b5"/><path d="m72 115 33-43 76 57" fill="none" stroke="#fff4df" stroke-width="11"/><path d="M102 57q5-22 23-17 20 2 20 20" fill="#f5d5cf"/><circle cx="125" cy="46" r="15" fill="#a94f57"/><path d="M120 32q-3-12 7-16" stroke="#6c915a" stroke-width="5" fill="none"/>`
  };
  return `<svg ${common}>${art[type]||art.bread}</svg>`;
};
function productCard(p){
  const percent = discount(p), favorite = state.favorites.includes(p.id), [bg]=COLORS[p.type]||COLORS.bread;
  return `<article class="product-card"><div class="product-visual" style="background:${bg}"><span class="product-badge">${percent}% menos</span><button class="favorite-toggle ${favorite?'selected':''}" type="button" data-favorite="${esc(p.id)}" aria-label="${favorite?'Quitar de':'Agregar a'} favoritos" aria-pressed="${favorite}"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>${foodSvg(p.type)}</div><div class="product-body"><span class="product-category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><div class="merchant-line"><svg viewBox="0 0 24 24"><path d="M3 10h18l-2-6H5l-2 6ZM5 10v10h14V10M9 20v-6h6v6"/></svg><span>${esc(p.merchant)} · ${esc(p.zone)}</span></div><div class="product-price-row"><span class="product-price">${formatMoney(p.price)}</span><span class="old-price">${formatMoney(p.oldPrice)}</span></div><div class="product-bottom"><span class="units-left">${p.stock>0?`${p.stock} disponibles`:'Agotado'}</span><button class="reserve-button" data-reserve="${esc(p.id)}" ${p.stock<1?'disabled':''}>${p.stock>0?'Reservar':'Sin existencias'}</button></div></div></article>`;
}
function renderProducts(){
  const term = searchTerm.trim().toLocaleLowerCase('es-CO');
  let products = state.products.filter(p=>(activeCategory==='all'||p.category===activeCategory)&&(!term||`${p.name} ${p.merchant} ${p.zone} ${p.category}`.toLocaleLowerCase('es-CO').includes(term))&&(!favoritesOnly||state.favorites.includes(p.id)));
  if(sortBy==='price-asc')products.sort((a,b)=>a.price-b.price);
  if(sortBy==='discount-desc')products.sort((a,b)=>discount(b)-discount(a));
  if(sortBy==='name')products.sort((a,b)=>a.name.localeCompare(b.name,'es'));
  $('#productsGrid').innerHTML=products.map(productCard).join('');
  $('#emptyState').hidden=products.length!==0;
  $('#catalogResultCount').textContent=`${products.length} ${products.length===1?'producto encontrado':'productos encontrados'}`;
  $('#categorySelect').value=activeCategory;
  document.querySelectorAll('.category-pill').forEach(b=>b.classList.toggle('active',b.dataset.category===activeCategory));
  $('#favoritesButton').setAttribute('aria-pressed',String(favoritesOnly));
  $('#favoritesButton').style.background=favoritesOnly?'#e2efe0':'';
}
function renderCounters(){
  const available=state.products.filter(p=>p.stock>0);
  $('#heroProductCount').textContent=available.length;
  $('#heroMerchantCount').textContent=new Set(state.products.map(p=>p.merchant)).size;
  $('#heroCategoryCount').textContent=new Set(state.products.map(p=>p.category)).size;
  const count=state.reservations.length;
  $('#reservationCount').hidden=!count;
  $('#reservationCount').textContent=count;
}
function renderAll(){renderProducts();renderCounters();}
function toast(message){
  const region=$('#toastRegion');
  region.innerHTML=`<div class="toast">${esc(message)}</div>`;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>region.replaceChildren(),3800);
}
function openPanel(selector){
  closeDialogs(false);
  restoreFocus=document.activeElement;
  $('#overlay').hidden=false;
  $(selector).hidden=false;
  document.body.style.overflow='hidden';
  $(selector).querySelector('[data-close]').focus();
}
function closeDialogs(returnFocus=true){
  $('#overlay').hidden=true;
  $('#reservationsPanel').hidden=true;
  $('#merchantPanel').hidden=true;
  $('#modalLayer').hidden=true;
  document.body.style.overflow='';
  if(returnFocus&&restoreFocus?.focus)restoreFocus.focus();
}
function openModal(html){
  closeDialogs(false);
  restoreFocus=document.activeElement;
  $('#modalContent').innerHTML=html;
  $('#modalLayer').hidden=false;
  document.body.style.overflow='hidden';
  $('.modal-close').focus();
}
function openReservationModal(id){
  const p=findProduct(id);
  if(!p||p.stock<1){toast('Este producto ya no está disponible.');return;}
  activeModalProduct=id;requestedQty=1;
  const [bg]=COLORS[p.type]||COLORS.bread;
  openModal(`<div class="modal-visual" style="background:${bg}">${foodSvg(p.type)}</div><span class="product-category">${esc(p.category)}</span><h2 class="modal-title" id="modalTitle">${esc(p.name)}</h2><p class="modal-subtitle">${esc(p.description)}</p><div class="modal-meta"><strong>Comercio:</strong> ${esc(p.merchant)} · ${esc(p.zone)}</div><div class="modal-meta"><strong>Retiro sugerido:</strong> ${esc(p.pickup)}</div><div class="modal-meta"><strong>Presentación:</strong> ${esc(p.unit)}</div><div class="modal-prices"><span class="modal-price">${formatMoney(p.price)}</span><span class="modal-old-price">${formatMoney(p.oldPrice)}</span></div><div class="modal-fields"><div class="field-group"><label for="reserveQuantity">Cantidad</label><div class="quantity-stepper"><button type="button" data-qty="-1" aria-label="Disminuir cantidad">−</button><span id="qtyDisplay">1</span><button type="button" data-qty="1" aria-label="Aumentar cantidad">+</button></div><span class="field-hint">${p.stock} unidades disponibles</span></div><div class="field-group"><label for="buyerName">Nombre de quien reserva</label><input id="buyerName" type="text" maxlength="70" placeholder="Nombre y apellido" autocomplete="name" required /></div></div><div class="modal-total"><span>Total estimado</span><strong id="reserveTotal">${formatMoney(p.price)}</strong></div><button class="primary-button full-width" id="confirmReservation">Confirmar reserva</button><p class="field-hint">No se realizan pagos a través de la página. La disponibilidad debe confirmarse con el establecimiento.</p>`);
}
function updateQty(delta){
  const p=findProduct(activeModalProduct);
  if(!p)return;
  requestedQty=Math.max(1,Math.min(p.stock,requestedQty+delta));
  $('#qtyDisplay').textContent=requestedQty;
  $('#reserveTotal').textContent=formatMoney(p.price*requestedQty);
}
function confirmReservation(){
  const p=findProduct(activeModalProduct);
  const name=($('#buyerName')?.value||'').trim();
  if(name.length<3){$('#buyerName').focus();toast('Escribe el nombre de quien realiza la reserva.');return;}
  if(!p||p.stock<requestedQty){toast('La cantidad solicitada ya no está disponible.');return;}
  p.stock-=requestedQty;
  const reservation={id:`R-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`,productId:p.id,productName:p.name,merchant:p.merchant,zone:p.zone,quantity:requestedQty,total:p.price*requestedQty,buyer:name,pickup:p.pickup,created:new Date().toISOString(),type:p.type};
  state.reservations.unshift(reservation);
  saveState();renderAll();
  $('#modalContent').innerHTML=`<div class="success-panel"><div class="success-mark">✓</div><h2 id="modalTitle">Reserva registrada</h2><p>Guardamos tu selección, ${esc(name)}. Encontrarás los detalles en «Mis reservas».</p><p><strong>Código:</strong> ${esc(reservation.id)}<br/><strong>Producto:</strong> ${esc(p.name)}<br/><strong>Total:</strong> ${formatMoney(reservation.total)}</p><button class="primary-button full-width" id="viewReservationsAfter">Ver mis reservas</button></div>`;
  toast('La reserva se registró correctamente.');
}
function renderReservations(){
  if(!state.reservations.length){$('#reservationsList').innerHTML='<div class="panel-empty"><h3>Aún no tienes reservas</h3><p>Explora las ofertas y guarda aquí tus próximas selecciones.</p></div>';return;}
  $('#reservationsList').innerHTML=state.reservations.map(r=>`<article class="reservation-item"><div class="mini-visual" style="background:${(COLORS[r.type]||COLORS.bread)[0]}">${foodSvg(r.type)}</div><div><h3>${esc(r.productName)}</h3><p class="reservation-meta">${esc(r.merchant)} · ${esc(r.zone)}</p><p class="reservation-meta">${r.quantity} ${r.quantity===1?'unidad':'unidades'} · Retiro ${esc(r.pickup)}</p><div class="reservation-actions"><strong class="reservation-price">${formatMoney(r.total)}</strong><span class="status-chip">Registrada</span></div><button class="text-danger" data-cancel="${esc(r.id)}">Cancelar reserva</button></div></article>`).join('');
}
function cancelReservation(id){
  const index=state.reservations.findIndex(r=>r.id===id);
  if(index<0)return;
  const [r]=state.reservations.splice(index,1);
  const product=findProduct(r.productId);
  if(product)product.stock+=r.quantity;
  saveState();renderAll();renderReservations();toast('Reserva cancelada.');
}
function openReservations(){renderReservations();openPanel('#reservationsPanel');}
function renderMerchantPanel(){
  const products=state.products;
  const reservations=state.reservations;
  const totalReserved=reservations.reduce((n,r)=>n+r.quantity,0);
  $('#merchantSummary').innerHTML=`<div class="metric-card"><strong>${products.length}</strong><span>Publicaciones</span></div><div class="metric-card"><strong>${totalReserved}</strong><span>Unidades reservadas</span></div><div class="metric-card"><strong>${products.reduce((n,p)=>n+p.stock,0)}</strong><span>Unidades disponibles</span></div>`;
  $('#merchantProductList').innerHTML=products.map(p=>`<div class="merchant-product-row"><div class="mini-visual" style="background:${(COLORS[p.type]||COLORS.bread)[0]}">${foodSvg(p.type)}</div><div class="merchant-product-text"><strong>${esc(p.name)}</strong><span>${esc(p.merchant)} · ${formatMoney(p.price)}</span>${p.id.startsWith('custom-')?`<button class="remove-product" data-delete="${esc(p.id)}">Eliminar</button>`:''}</div><div class="stock-controls"><button data-stock="${esc(p.id)}" data-change="-1" aria-label="Disminuir existencias de ${esc(p.name)}" ${p.stock===0?'disabled':''}>−</button><span>${p.stock}</span><button data-stock="${esc(p.id)}" data-change="1" aria-label="Aumentar existencias de ${esc(p.name)}">+</button></div></div>`).join('');
}
function openMerchant(){renderMerchantPanel();openPanel('#merchantPanel');}
function changeStock(id,delta){
  const p=findProduct(id);if(!p)return;
  p.stock=Math.max(0,Math.min(999,p.stock+delta));
  saveState();renderAll();renderMerchantPanel();
}
function deleteProduct(id){
  const p=findProduct(id);if(!p||!id.startsWith('custom-'))return;
  if(state.reservations.some(r=>r.productId===id)){toast('No es posible eliminar un producto con reservas activas.');return;}
  if(!confirm(`¿Eliminar «${p.name}» del catálogo?`))return;
  state.products=state.products.filter(p=>p.id!==id);
  state.favorites=state.favorites.filter(f=>f!==id);
  saveState();renderAll();renderMerchantPanel();toast('Publicación eliminada.');
}
function openAddProduct(){
  openModal(`<span class="section-kicker">NUEVA PUBLICACIÓN</span><h2 class="modal-title" id="modalTitle">Publicar un alimento</h2><p class="modal-subtitle">Agrega los datos del producto para mostrarlo en el catálogo.</p><form id="productForm" class="modal-fields"><div class="field-group"><label for="newName">Nombre del producto</label><input id="newName" name="name" maxlength="75" required placeholder="Ej. Bolsa de pan del día" /></div><div class="field-group"><label for="newMerchant">Nombre del comercio</label><input id="newMerchant" name="merchant" maxlength="70" required placeholder="Ej. Panadería del barrio" /></div><div class="field-group"><label for="newZone">Zona o barrio</label><input id="newZone" name="zone" maxlength="50" required placeholder="Ej. Centro" /></div><div class="field-group"><label for="newCategory">Categoría</label><select id="newCategory" name="category"><option>Panadería</option><option>Frutas y verduras</option><option>Comidas preparadas</option><option>Lácteos</option><option>Repostería</option></select></div><div class="field-group"><label for="newDescription">Descripción</label><textarea id="newDescription" name="description" maxlength="220" placeholder="Describe el contenido y las características" required></textarea></div><div class="field-group"><label for="newPrice">Precio de oferta (COP)</label><input id="newPrice" name="price" type="number" min="1000" max="10000000" step="100" required placeholder="8000" /></div><div class="field-group"><label for="newOldPrice">Precio habitual (COP)</label><input id="newOldPrice" name="oldPrice" type="number" min="1000" max="10000000" step="100" required placeholder="15000" /></div><div class="field-group"><label for="newStock">Unidades disponibles</label><input id="newStock" name="stock" type="number" min="1" max="999" step="1" required placeholder="5" /></div><div class="field-group"><label for="newPickup">Horario de retiro</label><input id="newPickup" name="pickup" maxlength="70" required placeholder="Ej. 3:00 p. m. a 6:00 p. m." /></div><button class="primary-button full-width" type="submit">Publicar producto</button></form>`);
}
function handleAddProduct(form){
  const data=new FormData(form);
  const field=k=>String(data.get(k)||'').trim();
  const price=Number(field('price')),oldPrice=Number(field('oldPrice')),stock=Number(field('stock'));
  if(!Number.isFinite(price)||!Number.isFinite(oldPrice)||!Number.isInteger(stock)||price<1000||oldPrice<=price||stock<1||stock>999){toast('Revisa los precios y la cantidad. El precio habitual debe ser mayor que el de oferta.');return;}
  const category=field('category');
  const type=({'Panadería':'bread','Frutas y verduras':'fruits','Comidas preparadas':'meals','Lácteos':'dairy','Repostería':'dessert'})[category]||'bread';
  const p={id:`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:field('name'),merchant:field('merchant'),zone:field('zone'),category,price,oldPrice,stock,type,description:field('description'),pickup:field('pickup'),unit:'unidad'};
  if(!p.name||!p.merchant||!p.zone||!p.description||!p.pickup){toast('Completa todos los campos.');return;}
  state.products.unshift(p);saveState();renderAll();closeDialogs();toast('Producto publicado en el catálogo.');
  document.getElementById('explorar').scrollIntoView({behavior:'smooth'});
}
function updateFavorite(id){
  if(state.favorites.includes(id))state.favorites=state.favorites.filter(f=>f!==id);
  else state.favorites.push(id);
  saveState();renderProducts();
}
function resetFilters(){activeCategory='all';searchTerm='';sortBy='recommended';favoritesOnly=false;$('#searchInput').value='';$('#sortSelect').value='recommended';renderProducts();}
function initEvents(){
  $('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value;renderProducts();});
  $('#categorySelect').addEventListener('change',e=>{activeCategory=e.target.value;renderProducts();});
  $('#sortSelect').addEventListener('change',e=>{sortBy=e.target.value;renderProducts();});
  $('#categoryPills').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){activeCategory=b.dataset.category;renderProducts();}});
  $('#productsGrid').addEventListener('click',e=>{const favorite=e.target.closest('[data-favorite]');if(favorite){updateFavorite(favorite.dataset.favorite);return;}const reserve=e.target.closest('[data-reserve]');if(reserve)openReservationModal(reserve.dataset.reserve);});
  $('#favoritesButton').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;renderProducts();document.querySelector('#explorar').scrollIntoView({behavior:'smooth'});if(favoritesOnly&&!state.favorites.length)toast('Guarda los productos que te interesan para encontrarlos aquí.');});
  $('#resetFilters').addEventListener('click',resetFilters);
  $('#reservationsButton').addEventListener('click',openReservations);
  $('#mobileReservations').addEventListener('click',()=>{setMobileMenu(false);openReservations();});
  $('#openMerchantPanel').addEventListener('click',openMerchant);
  $('#openAddProduct').addEventListener('click',openAddProduct);
  $('#reservationsList').addEventListener('click',e=>{const b=e.target.closest('[data-cancel]');if(b)cancelReservation(b.dataset.cancel);});
  $('#merchantProductList').addEventListener('click',e=>{const b=e.target.closest('[data-stock]');if(b){changeStock(b.dataset.stock,Number(b.dataset.change));return;}const d=e.target.closest('[data-delete]');if(d)deleteProduct(d.dataset.delete);});
  $('#overlay').addEventListener('click',()=>closeDialogs());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialogs()));
  $('#modalLayer').addEventListener('click',e=>{
    if(e.target.closest('[data-modal-close]')){closeDialogs();return;}
    const qty=e.target.closest('[data-qty]');if(qty){updateQty(Number(qty.dataset.qty));return;}
    if(e.target.closest('#confirmReservation')){confirmReservation();return;}
    if(e.target.closest('#viewReservationsAfter')){openReservations();return;}
  });
  $('#modalLayer').addEventListener('submit',e=>{if(e.target.matches('#productForm')){e.preventDefault();handleAddProduct(e.target);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialogs();setMobileMenu(false);}});
  $('#menuButton').addEventListener('click',()=>setMobileMenu($('#mobileNav').hidden));
  $('#mobileNav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMobileMenu(false)));
}
function setMobileMenu(open){$('#mobileNav').hidden=!open;$('#menuButton').setAttribute('aria-expanded',String(open));}
function init(){
  $('#currentYear').textContent=new Date().getFullYear();
  initEvents();renderAll();
}
document.addEventListener('DOMContentLoaded',init);
