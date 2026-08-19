import React, { memo } from 'react';
import { ShoppingCart } from 'lucide-react';

export interface PedidoRow { id: string; usuario_id: string; cliente_nombre: string; cliente_telefono: string; cliente_direccion: string; productos: any; total: number; estado: string; created_at: string; }

export const AdminOrders = memo(({ orders, handleOrderStatus }: { orders: PedidoRow[]; handleOrderStatus: (id: string, status: string) => void }) => {
  const statusColors: Record<string, string> = {
    pendiente: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    produccion: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    enviado: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    entregado: 'bg-green-500/15 text-green-400 border-green-500/30',
  };
  const statusLabels: Record<string, string> = {
    pendiente: 'Pendiente', produccion: 'En Producción', enviado: 'Enviado', entregado: 'Entregado',
  };

  return (
    <div className="p-5 sm:p-8 space-y-4 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-[#D2E8A3]/10 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-[#D2E8A3]" /></div>
        <div>
          <h3 className="text-sm font-extrabold uppercase text-white">{orders.length} Pedidos</h3>
          <p className="text-[9px] text-gray-500">Gestiona los estados de entrega</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D2E8A3]/5 border border-[#D2E8A3]/10 flex items-center justify-center"><ShoppingCart className="w-10 h-10 text-[#D2E8A3]/30" /></div>
          <div>
            <p className="text-sm text-gray-400 font-bold">No hay pedidos aún</p>
            <p className="text-[10px] text-gray-600 mt-1">Los pedidos de WhatsApp aparecerán aquí</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-[#111311] hover:bg-[#161814] transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-gray-600">#{order.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.estado] || 'bg-white/10 text-gray-400 border-white/10'}`}>
                      {statusLabels[order.estado] || order.estado}
                    </span>
                  </div>
                  <p className="text-xs text-white font-bold">{order.cliente_nombre || 'Sin nombre'}</p>
                  <p className="text-[11px] text-gray-400">{order.cliente_telefono || ''} {order.cliente_direccion ? `— ${order.cliente_direccion}` : ''}</p>
                  <p className="text-[10px] text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleString('es-PE') : ''}</p>
                </div>
                <div className="text-right space-y-2 flex-shrink-0">
                  <p className="text-base font-black text-[#D2E8A3]">S/ {order.total?.toFixed(2)}</p>
                  <select value={order.estado || 'pendiente'} onChange={e => handleOrderStatus(order.id, e.target.value)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-xl border bg-[#161814] text-gray-300 border-white/10 focus:outline-none focus:border-[#D2E8A3]/50 transition-all cursor-pointer">
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="produccion">🔨 Producción</option>
                    <option value="enviado">📦 Enviado</option>
                    <option value="entregado">✅ Entregado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
AdminOrders.displayName = 'AdminOrders';
