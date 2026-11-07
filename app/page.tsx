'use client';

import Link from 'next/link';
import { useConfig } from '../context/ConfigContext';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { config } = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden ${config.tipoTipografia}`}>
      
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

      {/* 🔹 HEADER PUBLICO */}
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo Clinica" className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                M
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">{config.nombreClinica}</h1>
              <p className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider mt-0.5">SISTEMA ODONTOLÓGICO INTEGRAL</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/solicitar-turno" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-5 rounded-xl shadow-md transition-all hover:scale-105">
              Reservar Cita
            </Link>
            <Link href="/login" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors">
              Acceso Staff
            </Link>
          </div>
        </div>
      </header>

      {/* 🔹 HERO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-16 relative z-10 w-full flex-1">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Cuidamos tu sonrisa con la mejor tecnología
          </h2>
          <p className="text-base text-slate-600 font-medium leading-relaxed">
            Solicita tu cita de forma rápida, directa e inmediata desde nuestro canal público oficial.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/solicitar-turno" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2">
              Solicitar Turno Ahora →
            </Link>

            {config.telefonoWhatsApp && (
              <a 
                href={`https://wa.me/${config.telefonoWhatsApp.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                📱 Consultar por WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* 🔹 NUEVA SECCIÓN: EXPERIENCIA DE DIAGNÓSTICO Y ATENCIÓN AL PACIENTE */}
        <section className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Excelencia e Innovación Odontológica
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              ¿Cómo es tu Primera Consulta de Diagnóstico?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Diseñamos cada paso de tu visita para garantizar una experiencia cómoda, transparente y libre de estrés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl font-black">
                🩺
              </div>
              <h4 className="text-base font-black text-slate-900">1. Evaluación Integral</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Realizamos un examen clínico exhaustivo con apoyo de radiografía panorámica digital para diagnosticar el estado general de tu boca de forma objetiva y precisa.
              </p>
            </div>

            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-black">
                🤝
              </div>
              <h4 className="text-base font-black text-slate-900">2. Trato Humano y Humildad</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nuestro personal médico y administrativo está capacitado para escucharte activamente, resolver tus dudas sin modismos complejos y acompañarte en todo momento.
              </p>
            </div>

            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl font-black">
                📋
              </div>
              <h4 className="text-base font-black text-slate-900">3. Plan Personalizado</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Te entregamos un presupuesto claro y detallado antes de iniciar cualquier tratamiento, priorizando siempre tu salud, tu confort y tu presupuesto.
              </p>
            </div>
          </div>
        </section>
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

      <footer className="bg-white border-t py-6 text-center text-xs text-slate-400 relative z-10">
        {config.nombreClinica} — Sistema Integral de Agenda Odontológica
      </footer>
    </div>
  );
}