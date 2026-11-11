'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';

export default function LandingPage() {
  const { config, practicas } = useConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const mensajeWA = encodeURIComponent(config.whatsappMensaje || 'Hola! Quisiera realizar una consulta.');
  const urlWhatsApp = `https://wa.me/${config.whatsappNumero || '5493511234567'}?text=${mensajeWA}`;

  // Rutas de imagenes con fallback a la carpeta public local
  const foto1 = config.fondoFoto1Url || '/foto 1.jpg';
  const foto2 = config.fondoFoto2Url || '/foto 2.jpg';
  const foto3 = config.fondoFoto3Url || '/foto 3.jpg';

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-hidden ${config.tipoTipografia || ''}`}
      style={{ backgroundColor: config.colorFondo || '#f8fafc' }}
    >
      {/* 🖼️ FOTO 1: SUPERIOR DERECHA (HERO) CON DESPLAZAMIENTO Y TAMAÑO DINÁMICO */}
      <div
        className="absolute pointer-events-none z-0 bg-no-repeat bg-contain bg-right-top transition-all"
        style={{
          backgroundImage: `url('${foto1}')`,
          opacity: config.fondoOpacidad ?? 0.15,
          width: `${config.foto1Tamano || 420}px`,
          height: `${config.foto1Tamano || 420}px`,
          top: `${config.foto1PosY ?? 80}px`,
          right: `${config.foto1PosX ?? 0}px`
        }}
      />

      {/* 🖼️ FOTO 2: CENTRAL IZQUIERDA (SERVICIOS) */}
      <div
        className="absolute pointer-events-none z-0 bg-no-repeat bg-contain bg-left-center transition-all -translate-y-1/2"
        style={{
          backgroundImage: `url('${foto2}')`,
          opacity: config.fondoOpacidad ?? 0.15,
          width: `${config.foto2Tamano || 380}px`,
          height: `${config.foto2Tamano || 380}px`,
          top: `${config.foto2PosY ?? 50}%`,
          left: `${config.foto2PosX ?? 0}px`
        }}
      />

      {/* 🖼️ FOTO 3: INFERIOR DERECHA (FOOTER) */}
      <div
        className="absolute pointer-events-none z-0 bg-no-repeat bg-contain bg-right-bottom transition-all"
        style={{
          backgroundImage: `url('${foto3}')`,
          opacity: config.fondoOpacidad ?? 0.15,
          width: `${config.foto3Tamano || 380}px`,
          height: `${config.foto3Tamano || 380}px`,
          bottom: `${config.foto3PosY ?? 0}px`,
          right: `${config.foto3PosX ?? 0}px`
        }}
      />

      {/* BANNER PROMOCIONAL SUPERIOR */}
      {config.bannerPromocional && (
        <div
          className="text-white text-xs font-black py-2.5 px-4 text-center tracking-wide shadow-inner z-20"
          style={{ backgroundColor: config.colorPrimario || '#2563eb' }}
        >
          {config.bannerPromocional}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt="Logo Clínica"
                style={{ height: `${config.logoTamano || 45}px` }}
                className="object-contain"
              />
            ) : (
              <svg width="42" height="42" viewBox="0 0 100 100" className="fill-none flex-shrink-0">
                <path
                  d="M 50,22 C 38,12 20,15 20,38 C 20,60 25,70 38,90 C 42,80 38,60 48,50 L 52,68 L 68,42"
                  stroke={config.colorPrimario || '#2563eb'}
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 50,22 C 62,12 80,15 80,38 C 80,60 75,70 62,90 L 56,76"
                  stroke="#1e293b"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {config.mostrarNombreJuntoALogo && (
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-tight">
                  {config.nombreClinica || 'MeDent Clínica Odontológica'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Atención Odontológica Integral
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/solicitar-turno"
              className="text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: config.colorPrimario || '#2563eb' }}
            >
              📅 Reservar Cita en Línea
            </Link>

            <Link
              href="/login"
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              🔐 Acceso Staff
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DE LA LANDING PAGE */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 space-y-16 z-10 flex-1 relative">
        
        {/* HERO */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <span
            className="text-xs font-black px-4 py-1.5 rounded-full border shadow-sm inline-block uppercase tracking-wider"
            style={{
              color: config.colorPrimario || '#2563eb',
              backgroundColor: '#ffffff',
              borderColor: config.colorPrimario || '#2563eb'
            }}
          >
            Tu Salud Dental en Manos Expertas
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Cuidamos tu sonrisa con la mejor tecnología
          </h1>

          <p className="text-base text-slate-600 font-medium leading-relaxed">
            Solicita tu cita de forma rápida, directa e inmediata desde nuestro canal público oficial.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/solicitar-turno"
              className="text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: config.colorPrimario || '#2563eb' }}
            >
              Solicitar Turno Ahora →
            </Link>

            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              📱 Consultar por WhatsApp
            </a>
          </div>
        </section>

        {/* SECCIÓN DE 3 TARJETAS INFORMATIVAS */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Tratamientos */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-2xl" style={{ backgroundColor: config.colorPrimario || '#2563eb' }}>
                🦷
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">Tratamientos Integrales</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ofrecemos soluciones para cada necesidad: desde controles de rutina y limpiezas, hasta ortodoncia y cirugías complejas. Todo realizado con insumos de alta calidad.
              </p>
            </div>

            {/* Tarjeta 2: Trato con el paciente */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-2xl" style={{ backgroundColor: config.colorPrimario || '#2563eb' }}>
                🤝
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">Atención Cálida y Humana</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sabemos que ir al odontólogo puede generar nervios. Te escuchamos, explicamos cada paso de tu tratamiento sin tecnicismos y respetamos tus tiempos.
              </p>
            </div>

            {/* Tarjeta 3: Estándar Web (Tecnología y Seguimiento) */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-2xl" style={{ backgroundColor: config.colorPrimario || '#2563eb' }}>
                ⭐
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">Tecnología y Seguimiento</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Contamos con equipamiento moderno para diagnósticos precisos. Además, te acompañamos después de tu visita con recomendaciones para tu cuidado continuo.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      {config.whatsappNumero && (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
          title="Consultar por WhatsApp"
        >
          <span className="text-2xl">📱</span>
        </a>
      )}

      {/* FOOTER */}
      <footer className="bg-white/90 backdrop-blur-sm border-t py-8 text-center text-xs text-slate-500 space-y-2 z-10 relative">
        <p className="font-bold text-slate-800">
          {config.nombreClinica || 'MeDent Clínica Odontológica'} — {config.direccion || 'Atención Presencial'}
        </p>
        <p>Contacto Directo: {config.telefonoContacto || '03511234567'}</p>
        <p className="text-[10px] text-slate-400">© 2026 Sistema Integral SaaS Odontológico</p>
      </footer>
    </div>
  );
}