import { CartItem, UserProfileData } from '../types';

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateOrderImage(
  cart: CartItem[],
  userProfile: UserProfileData,
  deliveryType: string,
  total: number,
  getUnitPrice: (item: CartItem) => number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const W = 800;
  const padding = 40;
  const lineHeight = 28;
  const imgSize = 64;

  // Preload all product images
  const images = await Promise.all(
    cart.map(item => loadImage(item.product.image))
  );

  // Calculate total height
  let y = 0;
  y += 80; // header
  y += 40; // divider
  y += 35; // client title
  if (userProfile.name) y += lineHeight;
  if (userProfile.phone) y += lineHeight;
  if (userProfile.address) y += lineHeight;
  y += lineHeight; // delivery
  y += 35; // divider
  y += 35; // order title
  y += cart.length * (imgSize + 24); // items with images
  y += 20;
  y += 40; // divider
  y += 50; // total
  y += 60; // footer
  y += padding * 2;

  canvas.width = W;
  canvas.height = y;

  // Background
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, W, y);

  // Header
  ctx.fillStyle = '#D2E8A3';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('LUMIN SHOP', padding, padding + 28);
  ctx.fillStyle = '#888';
  ctx.font = '14px Arial';
  ctx.fillText('Pedido por WhatsApp', padding, padding + 50);

  y = padding + 80;

  // Divider
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(W - padding, y);
  ctx.stroke();
  y += 25;

  // Client info
  ctx.fillStyle = '#D2E8A3';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('DATOS DEL CLIENTE', padding, y);
  y += 30;

  ctx.fillStyle = '#ccc';
  ctx.font = '14px Arial';
  if (userProfile.name) { ctx.fillText(`Nombre: ${userProfile.name}`, padding, y); y += lineHeight; }
  if (userProfile.phone) { ctx.fillText(`Teléfono: ${userProfile.phone}`, padding, y); y += lineHeight; }
  if (userProfile.address) { ctx.fillText(`Dirección: ${userProfile.address}`, padding, y); y += lineHeight; }
  ctx.fillText(`Modalidad: ${deliveryType === 'envio' ? 'Envío a Domicilio' : 'Recojo en Tienda'}`, padding, y);
  y += lineHeight;

  // Divider
  y += 10;
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(W - padding, y);
  ctx.stroke();
  y += 25;

  // Order title
  ctx.fillStyle = '#D2E8A3';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('DETALLE DEL PEDIDO', padding, y);
  y += 35;

  // Items with images
  cart.forEach((item, index) => {
    const unitPrice = getUnitPrice(item);
    const itemTotal = unitPrice * item.quantity;
    const img = images[index];

    // Draw product image
    if (img) {
      const radius = 8;
      const ix = padding;
      const iy = y;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ix + radius, iy);
      ctx.lineTo(ix + imgSize - radius, iy);
      ctx.quadraticCurveTo(ix + imgSize, iy, ix + imgSize, iy + radius);
      ctx.lineTo(ix + imgSize, iy + imgSize - radius);
      ctx.quadraticCurveTo(ix + imgSize, iy + imgSize, ix + imgSize - radius, iy + imgSize);
      ctx.lineTo(ix + radius, iy + imgSize);
      ctx.quadraticCurveTo(ix, iy + imgSize, ix, iy + imgSize - radius);
      ctx.lineTo(ix, iy + radius);
      ctx.quadraticCurveTo(ix, iy, ix + radius, iy);
      ctx.closePath();
      ctx.clip();
      // Cover-fit the image
      const imgAspect = img.width / img.height;
      const boxAspect = 1;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgAspect > boxAspect) { sw = img.height; sx = (img.width - sw) / 2; }
      else { sh = img.width; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, ix, iy, imgSize, imgSize);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1a1d1a';
      ctx.beginPath();
      ctx.roundRect(padding, y, imgSize, imgSize, 8);
      ctx.fill();
      ctx.fillStyle = '#555';
      ctx.font = '11px Arial';
      ctx.fillText('IMG', padding + 22, y + 38);
    }

    // Text to the right of image
    const textX = padding + imgSize + 16;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${index + 1}. ${item.product.name}`, textX, y + 18);

    ctx.fillStyle = '#999';
    ctx.font = '12px Arial';
    let details = `Cant: ${item.quantity}`;
    if (item.selectedSize) details += ` | Talla: ${item.selectedSize}`;
    if (item.selectedCupType) details += ` | Tipo: ${item.selectedCupType}`;
    if (item.selectedFinish) details += ` | Acabado: ${item.selectedFinish}`;
    ctx.fillText(details, textX, y + 38);

    ctx.fillStyle = '#D2E8A3';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(`S/ ${itemTotal.toFixed(2)}`, textX, y + 58);

    y += imgSize + 20;
  });

  // Divider
  y += 5;
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(padding, y);
  ctx.lineTo(W - padding, y);
  ctx.stroke();
  y += 30;

  // Total
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`TOTAL: S/ ${total.toFixed(2)}`, padding, y);
  y += 40;

  // Footer
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.fillText('Generado desde lumin-shop.vercel.app', padding, y);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}
