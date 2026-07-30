import { CartItem, UserProfileData } from '../types';

export function generateOrderImage(
  cart: CartItem[],
  userProfile: UserProfileData,
  deliveryType: string,
  total: number,
  getUnitPrice: (item: CartItem) => number
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const W = 800;
    const padding = 40;
    const lineHeight = 28;
    const itemHeight = 80;

    // Calculate height
    let y = 0;
    y += 80; // header
    y += 40; // divider
    y += 35; // client info title
    y += lineHeight * (userProfile.name ? 1 : 0);
    y += lineHeight * (userProfile.phone ? 1 : 0);
    y += lineHeight * (userProfile.address ? 1 : 0);
    y += 35; // divider
    y += 35; // order title
    y += cart.length * itemHeight;
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

    // Items
    cart.forEach((item, index) => {
      const unitPrice = getUnitPrice(item);
      const itemTotal = unitPrice * item.quantity;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`${index + 1}. ${item.product.name}`, padding, y);
      y += 22;

      ctx.fillStyle = '#999';
      ctx.font = '13px Arial';
      let details = `Cant: ${item.quantity}`;
      if (item.selectedSize) details += ` | Talla: ${item.selectedSize}`;
      if (item.selectedCupType) details += ` | Tipo: ${item.selectedCupType}`;
      if (item.selectedFinish) details += ` | Acabado: ${item.selectedFinish}`;
      ctx.fillText(details, padding + 10, y);
      y += 20;

      ctx.fillStyle = '#D2E8A3';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(`S/ ${itemTotal.toFixed(2)}`, padding + 10, y);
      y += 30;
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

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}
