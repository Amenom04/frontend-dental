'use client';

import Link from 'next/link';
import { useConfig } from '../context/ConfigContext';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitamos errores de hidratación en Vercel
  if (!mounted) return null;

  return (
    // Aplicamos dinámicamente la tipografía desde el contexto a toda la página
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden ${config.tipoTipografia}`}>
      
      {/* 🖼️ IMAGEN 1: HERO SUPERIOR DERECHA */}
      {config.imagenFondoHeroUrl && (
        <div 
          className="absolute z-0 pointer-events-none transition-all duration-300"
          style={{
            top: `${config.imagenHeroTop}%`,
            right: `${config.imagenHeroRight}%`,
            width: `${config.imagenHeroScale}px`,
            height: `${config.imagenHeroScale}px`,
            opacity: config.imagenHeroOpacidad / 100
          }}
        >
          <img 
            src={config.imagenFondoHeroUrl} 
            alt="Hero Background" 
            className="w-full h-full object-cover rounded-3xl shadow-xl"
          />
        </div>
      )}

      {/* 🖼️ IMAGEN 2: SECCIÓN DIAGNÓSTICO / EXPERIENCIA (CENTRO IZQUIERDA) */}
      {config.imagenFondoServiciosUrl && (
        <div 
          className="absolute z-0 pointer-events-none transition-all duration-300"
          style={{
            top: `${config.imagenServiciosTop}%`,
            left: `${config.imagenServiciosLeft}%`,
            width: `${config.imagenServiciosScale}px`,
            height: `${config.imagenServiciosScale}px`,
            opacity: config.imagenServiciosOpacidad / 100
          }}
        >
          <img 
            src={config.imagenFondoServiciosUrl} 
            alt="Experiencia Background" 
            className="w-full h-full object-cover rounded-3xl shadow-xl"
          />
        </div>
      )}

      {/* 🖼️ IMAGEN 3: FOOTER INFERIOR DERECHA */}
      {config.imagenFondoFooterUrl && (
        <div 
          className="absolute z-0 pointer-events-none transition-all duration-300"
          style={{
            bottom: `${config.imagenFooterBottom}%`,
            right: `${config.imagenFooterRight}%`,
            width: `${config.imagenFooterScale}px`,
            height: `${config.imagenFooterScale}px`,
            opacity: config.imagenFooterOpacidad / 100
          }}
        >
          <img 
            src={config.imagenFondoFooterUrl} 
            alt="Footer Background" 
            className="w-full h-full object-cover rounded-3xl shadow-xl"
          />
        </div>
      )}

      {/* 📣 BANNER DE PROMOCIONES Y CUOTAS */}
      {config.mostrarBannerCuotas && config.textoBannerCuotas && (
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white text-center py-2.5 px-4 text-xs font-black tracking-wide shadow-inner relative z-20">
          <span>{config.textoBannerCuotas}</span>
        </div>
      )}

      {/* HEADER ALINEADO A LA CONFIGURACIÓN */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo Clínica" className="h-8 object-contain" />
          ) : (
            <span className="text-3xl">🦷</span>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-blue-900 leading-tight">
              {config.nombreClinica || 'MeDent Clínica Odontológica'}
            </h1>
            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">
              Sistema Odontológico Integral
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/solicitar-turno" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2 px-5 rounded-full transition-colors shadow-sm">
            Reservar Cita
          </Link>
          <Link href="/login" className="text-slate-500 hover:text-blue-600 font-bold text-sm bg-slate-50 hover:bg-blue-50 border border-slate-200 py-2 px-5 rounded-full transition-colors">
            Acceso Staff
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10">
        
        {/* Contenedor de textos con fondo translúcido para asegurar legibilidad si hay fotos detrás */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl inline-block mb-10 shadow-sm border border-white/50">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 max-w-3xl leading-tight mb-4">
            Cuidamos tu sonrisa con la <br className="hidden md:block"/> mejor tecnología
          </h2>
          <p className="text-slate-700 max-w-2xl text-sm md:text-base font-bold mx-auto">
            Solicita tu cita de forma rápida, directa e inmediata desde nuestro canal público oficial.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <Link href="/solicitar-turno" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-base py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            Solicitar Turno Ahora →
          </Link>

          {/* Botón secundario directo a WhatsApp si está configurado */}
          {config.telefonoWhatsApp && (
            <a 
              href={`https://wa.me/${config.telefonoWhatsApp.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              📱 Consultar por WhatsApp
            </a>
          )}
        </div>

        {/* SECCIÓN DE TARJETAS (CARDS) */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-3xl p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200 relative z-10">
          <div className="mb-12">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
              Excelencia e Innovación Odontológica
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-6">
              ¿Cómo es tu Primera Consulta de Diagnóstico?
            </h3>
            <p className="text-slate-500 text-sm mt-3 font-medium">
              Diseñamos cada paso de tu visita para garantizar una experiencia cómoda, transparente y libre de estrés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Tarjeta 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm border border-blue-200">
                🩺
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2">1. Evaluación Integral</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Realizamos un examen clínico exhaustivo con apoyo de radiografía panorámica digital para diagnosticar el estado general de tu boca de forma objetiva y precisa.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm border border-amber-200">
                🤝
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2">2. Trato Humano y Humildad</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Nuestro personal médico y administrativo está capacitado para escucharte activamente, resolver tus dudas sin modismos complejos y acompañarte en todo momento.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-rose-200 transition-colors">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm border border-rose-200">
                📋
              </div>
              <h4 className="text-base font-black text-slate-900 mb-2">3. Plan Personalizado</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Te entregamos un presupuesto claro y detallado antes de iniciar cualquier tratamiento, priorizando siempre tu salud, tu confort y tu presupuesto.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 🔹 BOTÓN FLOTANTE DE WHATSAPP */}
      {config.telefonoWhatsApp && (
        <a 
          href={`https://wa.me/${config.telefonoWhatsApp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
          title="Contactar por WhatsApp"
        >
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
          </svg>
        </a>
      )}

      <footer className="bg-white/90 backdrop-blur-md py-6 border-t border-slate-200 text-center text-[10px] text-slate-400 relative z-10">
        {config.nombreClinica || 'MeDent'} — Sistema Integral de Agenda Odontológica
      </footer>
    </div>
  );
}