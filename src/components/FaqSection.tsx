import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/products';

interface FaqSectionProps {
  themeMode?: 'dark' | 'light' | 'amoled';
}

export const FaqSection: React.FC<FaqSectionProps> = ({ themeMode = 'dark' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isLight = themeMode === 'light';

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="my-12 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
          isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#161814] border-white/20 text-gray-200'
        }`}>
          <HelpCircle className="w-3.5 h-3.5 text-lime-700 dark:text-[#D2E8A3]" />
          <span>RESOLVEMOS TUS DUDAS</span>
        </div>
        <h3 className={`font-display text-2xl sm:text-3xl font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
          PREGUNTAS FRECUENTES
        </h3>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  : 'glass-card border-white/10 text-white'
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base transition-colors ${
                  isLight ? 'text-slate-900 hover:text-lime-700' : 'text-white hover:text-[#D2E8A3]'
                }`}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                    isLight ? 'text-lime-700' : 'text-[#D2E8A3]'
                  } ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className={`px-4 pb-5 pt-0 text-xs sm:text-sm leading-relaxed border-t mt-1 ${
                  isLight ? 'text-slate-700 border-slate-200 font-medium' : 'text-gray-300 border-white/10'
                }`}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
