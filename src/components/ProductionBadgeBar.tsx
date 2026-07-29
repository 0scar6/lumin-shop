import React from 'react';
import { Tag, Clock, ShieldCheck, Truck, RefreshCw, CheckCircle } from 'lucide-react';

interface ProductionBadgeBarProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const ProductionBadgeBar: React.FC<ProductionBadgeBarProps> = ({ themeMode = 'dark' }) => {
  const isLight = themeMode === 'light';

  const steps = [
    {
      step: '01',
      title: 'Eliges y Configuras',
      desc: 'Seleccionas tu prenda o vaso, talla, corte, color o texto personal.',
      icon: Tag,
    },
    {
      step: '02',
      title: 'Producción 24-48h',
      desc: 'Estampamos con serigrafía/fijación térmica o sublimamos a 200°C con máxima fijación.',
      icon: Clock,
    },
    {
      step: '03',
      title: 'Despacho & Entrega',
      desc: 'Empacamos con cuidado y enviamos a la puerta de tu domicilio.',
      icon: Truck,
    },
  ];

  return (
    <section className="my-10 space-y-6">
      
      {/* Top Banner Statement */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest ${
          isLight ? 'bg-lime-100 border border-lime-300 text-lime-800' : 'bg-[#D2E8A3]/10 border border-[#D2E8A3]/20 text-[#D2E8A3]'
        }`}>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-lime-600 dark:text-[#D2E8A3]" />
          <span>MODELO SUSTENTABLE BAJO DEMANDA</span>
        </div>
        <h3 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
          ¿CÓMO FUNCIONA <span className={isLight ? 'text-lime-700' : 'text-[#D2E8A3]'}>LÚMIN SHOP</span>?
        </h3>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-700 font-medium' : 'text-gray-300'}`}>
          Cero sobre-stock, mayor frescura en estampados y acabados totalmente personalizados para ti.
        </p>
      </div>

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`p-6 rounded-2xl border relative overflow-hidden transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 shadow-sm hover:border-lime-600'
                  : 'bg-[#161814] border-white/10 text-white hover:border-[#D2E8A3]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-2xl font-black ${isLight ? 'text-lime-700' : 'text-[#D2E8A3]/80'}`}>
                  {item.step}
                </span>
                <div className={`p-3 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-slate-300 text-lime-800' : 'bg-[#0A0A0A] border-white/10 text-[#D2E8A3]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <h4 className={`font-bold text-base mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {item.title}
              </h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-gray-300'}`}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Trust guarantees bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-around gap-4 text-xs ${
        isLight ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'bg-[#161814] border-white/5 text-gray-300'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lime-600 dark:text-[#D2E8A3]" />
          <span>Fijación Térmica HD de Alta Durabilidad</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-lime-600 dark:text-[#D2E8A3]" />
          <span>Tiempo de fabricación: 24-48 hrs</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-lime-600 dark:text-[#D2E8A3]" />
          <span>Atención Directa por WhatsApp</span>
        </div>
      </div>

    </section>
  );
};
