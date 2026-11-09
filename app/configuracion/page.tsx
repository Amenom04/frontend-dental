'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useConfig } from '@/context/ConfigContext';

export default function ConfiguracionPage() {
  const {
    config,
    updateConfig,
    practicas,
    odontologos,
    agregarPractica,
    eliminarPractica,
    agregarOdontologo,
    eliminarOdontologo
  } = useConfig();

  // Campos Generales
  const [nombreClinica, setNombreClinica] = useState(config.nombreClinica || '');
  const [tipoTipografia, setTipoTipografia] = useState(config.tipoTipografia || 'font-sans');
  const [telefonoContacto, setTelefonoContacto] = useState(config.telefonoContacto || '');
  const [direccion, setDireccion] = useState(config.direccion || '');

  // Banner y WhatsApp
  const [bannerPromocional, setBannerPromocional] = useState(config.bannerPromocional || '');
  const [whatsappNumero, setWhatsappNumero] = useState(config.whatsappNumero || '');
  const [whatsappMensaje, setWhatsappMensaje] = useState(config.whatsappMensaje || '');

  // Logo y Colores
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '');
  const [logoTamano, setLogoTamano] = useState(config.logoTamano || 45);
  const [mostrarNombreJuntoALogo, setMostrarNombreJuntoALogo] = useState(config.mostrarNombreJuntoALogo ?? true);
  const [colorPrimario, setColorPrimario] = useState(config.colorPrimario || '#2563eb');
  const [colorFondo, setColorFondo] = useState(config.colorFondo || '#f8fafc');

  // Foto 1
  const [fondoFoto1Url, setFondoFoto1Url] = useState(config.fondoFoto1Url || '');
  const [foto1Tamano, setFoto1Tamano] = useState(config.foto1Tamano ?? 420);
  const [foto1PosY, setFoto1PosY] = useState(config.foto1PosY ?? 80);
  const [foto1PosX, setFoto1PosX] = useState(config.foto1PosX ?? 0);

  // Foto 2
  const [fondoFoto2Url, setFondoFoto2Url] = useState(config.fondoFoto2Url || '');
  const [foto2Tamano, setFoto2Tamano] = useState(config.foto2Tamano ?? 380);
  const [foto2PosY, setFoto2PosY] = useState(config.foto2PosY ?? 50);
  const [foto2PosX, setFoto2PosX] = useState(config.foto2PosX ?? 0);

  // Foto 3
  const [fondoFoto3Url, setFondoFoto3Url] = useState(config.fondoFoto3Url || '');
  const [foto3Tamano, setFoto3Tamano] = useState(config.foto3Tamano ?? 380);
  const [foto3PosY, setFoto3PosY] = useState(config.foto3PosY ?? 0);
  const [foto3PosX, setFoto3PosX] = useState(config.foto3PosX ?? 0);

  const [fondoOpacidad, setFondoOpacidad] = useState(config.fondoOpacidad ?? 0.15);
  const [mensajeExito, setMensajeExito] = useState(false);

  // Catálogos
  const [nuevaPractica, setNuevaPractica] = useState('');
  const [nombreOdontologo, setNombreOdontologo] = useState('');
  const [especialidadOdontologo, setEspecialidadOdontologo] = useState('');

  const handleSubirLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubirFondoFoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarTodo = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      nombreClinica,
      tipoTipografia,
      telefonoContacto,
      direccion,
      bannerPromocional,
      whatsappNumero,
      whatsappMensaje,
      logoUrl,
      logoTamano: Number(logoTamano),
      mostrarNombreJuntoALogo,
      colorPrimario,
      colorFondo,
      fondoFoto1Url,
      foto1Tamano: Number(foto1Tamano),
      foto1PosY: Number(foto1PosY),
      foto1PosX: Number(foto1PosX),
      fondoFoto2Url,
      foto2Tamano: Number(foto2Tamano),
      foto2PosY: Number(foto2PosY),
      foto2PosX: Number(foto2PosX),
      fondoFoto3Url,
      foto3Tamano: Number(foto3Tamano),
      foto3PosY: Number(foto3PosY),
      foto3PosX: Number(foto3PosX),
      fondoOpacidad: Number(fondoOpacidad)
    });

    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 3000);
  };

  const handleAgregarPractica = (e: React.FormEvent) => {
    e.preventDefault();
    agregarPractica(nuevaPractica);
    setNuevaPractica('');
  };

  const handleAgregarOdontologo = (e: React.FormEvent) => {
    e.preventDefault();
    agregarOdontologo({ nombre: nombreOdontologo, especialidad: especialidadOdontologo });
    setNombreOdontologo('');
    setEspecialidadOdontologo('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      {/* HEADER SUPERIOR */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black">MeDent — Panel de Configuración Global</h1>
          <p className="text-[10px] uppercase font-bold text-blue-100">
            Ajustes de Marca, Diseño, Posicionamiento de Imágenes, WhatsApp y Personal
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/turnos"
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400"
          >
            📅 Ir a Agenda Interna
          </Link>
          <Link
            href="/"
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-3 rounded-xl"
          >
            🏠 Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        <form onSubmit={handleGuardarTodo} className="space-y-6">
          
          {/* BARRA DE ACCIÓN GLOBAL */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center sticky top-2 z-30">
            <h2 className="text-sm font-black text-slate-900 uppercase">Configuración de Marca e Identidad</h2>
            <div className="flex items-center gap-3">
              {mensajeExito && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  ✓ ¡Cambios guardados con éxito!
                </span>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                💾 Guardar Todos los Cambios
              </button>
            </div>
          </div>

          {/* SECCIÓN 1: DATOS PRINCIPALES Y BANNER PROMOCIONAL */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="text-sm font-black text-blue-950 border-b pb-2 uppercase tracking-wide">
              🌐 1. Información General y Banner Destacado
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial de la Clínica</label>
                <input
                  type="text"
                  required
                  value={nombreClinica}
                  onChange={e => setNombreClinica(e.target.value)}
                  className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texto del Banner Promocional</label>
                <input
                  type="text"
                  value={bannerPromocional}
                  onChange={e => setBannerPromocional(e.target.value)}
                  placeholder="Ej. Hasta 12 cuotas sin interés en Ortodoncia e Implantes"
                  className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500 text-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Fijo / Dirección</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={telefonoContacto}
                    onChange={e => setTelefonoContacto(e.target.value)}
                    placeholder="Teléfono"
                    className="text-xs border rounded-xl p-2.5 bg-slate-50 outline-none"
                  />
                  <input
                    type="text"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    placeholder="Dirección"
                    className="text-xs border rounded-xl p-2.5 bg-slate-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipografía General</label>
                <select
                  value={tipoTipografia}
                  onChange={e => setTipoTipografia(e.target.value)}
                  className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 outline-none"
                >
                  <option value="font-sans">Moderna Standard (Sans-serif)</option>
                  <option value="font-serif">Clásica / Elegante (Serif)</option>
                  <option value="font-mono">Técnica (Monospace)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: CANAL WHATSAPP */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="text-sm font-black text-emerald-800 border-b pb-2 uppercase tracking-wide">
              📱 2. Configuración Directa de WhatsApp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de WhatsApp (Con código de país)</label>
                <input
                  type="text"
                  value={whatsappNumero}
                  onChange={e => setWhatsappNumero(e.target.value)}
                  placeholder="Ej. 5493511234567"
                  className="w-full text-xs font-bold border border-emerald-300 rounded-xl p-2.5 bg-emerald-50/30 outline-none text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mensaje Predefinido para el Paciente</label>
                <input
                  type="text"
                  value={whatsappMensaje}
                  onChange={e => setWhatsappMensaje(e.target.value)}
                  placeholder="Ej. Hola! Quisiera consultar sobre turnos disponibles."
                  className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none"
                />
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: LOGO Y FUSIÓN CON NOMBRE */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="text-sm font-black text-purple-950 border-b pb-2 uppercase tracking-wide">
              🖼️ 3. Logo Personalizado e Integración
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Subir Imagen del Logo (PNG / JPG / SVG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirLogo}
                  className="text-xs w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                />
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-[11px] text-red-600 font-bold underline cursor-pointer"
                  >
                    Quitar Logo Actual
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Tamaño del Logo: <span className="text-purple-700 font-extrabold">{logoTamano} px</span>
                </label>
                <input
                  type="range"
                  min="25"
                  max="120"
                  value={logoTamano}
                  onChange={e => setLogoTamano(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fusionNombre"
                    checked={mostrarNombreJuntoALogo}
                    onChange={e => setMostrarNombreJuntoALogo(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <label htmlFor="fusionNombre" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Fusionar logo mostrando el Nombre de la Clínica al lado
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col items-center justify-center min-h-[100px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Vista Previa de Identidad</span>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo Prev" style={{ height: `${logoTamano}px` }} className="object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                      MD
                    </div>
                  )}
                  {mostrarNombreJuntoALogo && (
                    <span className="font-black text-sm text-slate-900">{nombreClinica || 'Nombre de Clínica'}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: COLORES Y AJUSTE FINO DE POSICIÓN/TAMAÑO DE FOTOS */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
            <h3 className="text-sm font-black text-indigo-950 border-b pb-2 uppercase tracking-wide">
              🎨 4. Esquema de Colores y Ajuste de Fotos Decorativas
            </h3>

            {/* SELECCIÓN DE COLORES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Principal (Header / Botones)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={e => setColorPrimario(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorPrimario}
                    onChange={e => setColorPrimario(e.target.value)}
                    className="text-xs font-mono font-bold border rounded-xl p-2 bg-slate-50 uppercase w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Color Fondo General</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorFondo}
                    onChange={e => setColorFondo(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorFondo}
                    onChange={e => setColorFondo(e.target.value)}
                    className="text-xs font-mono font-bold border rounded-xl p-2 bg-slate-50 uppercase w-full"
                  />
                </div>
              </div>
            </div>

            {/* GESTIÓN AVANZADA DE POSICIÓN Y TAMAÑO DE LAS 3 FOTOS */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-black text-slate-800 uppercase">
                  Imágenes Decorativas (Ajuste de Tamaño y Desplazamiento)
                </label>
                <div className="flex items-center gap-2 w-1/3">
                  <span className="text-xs font-bold text-slate-600">Opacidad: {Math.round(fondoOpacidad * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={fondoOpacidad}
                    onChange={e => setFondoOpacidad(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CONTROLES FOTO 1 */}
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                  <p className="text-xs font-black text-indigo-900 border-b pb-1">📍 Foto 1: Superior (Hero)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSubirFondoFoto(e, setFondoFoto1Url)}
                    className="text-[11px] w-full file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-100 file:text-indigo-800 font-bold cursor-pointer"
                  />
                  {fondoFoto1Url && (
                    <div className="space-y-2 text-[11px] font-bold text-slate-700">
                      <div>
                        <span>Tamaño: {foto1Tamano}px</span>
                        <input type="range" min="200" max="800" value={foto1Tamano} onChange={e => setFoto1Tamano(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Bajar / Subir (Y): {foto1PosY}px</span>
                        <input type="range" min="0" max="300" value={foto1PosY} onChange={e => setFoto1PosY(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Desplazar Izq. (X): {foto1PosX}px</span>
                        <input type="range" min="-100" max="200" value={foto1PosX} onChange={e => setFoto1PosX(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <button type="button" onClick={() => setFondoFoto1Url('')} className="text-[10px] text-red-600 underline">Quitar Foto 1</button>
                    </div>
                  )}
                </div>

                {/* CONTROLES FOTO 2 */}
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                  <p className="text-xs font-black text-indigo-900 border-b pb-1">📍 Foto 2: Central (Servicios)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSubirFondoFoto(e, setFondoFoto2Url)}
                    className="text-[11px] w-full file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-100 file:text-indigo-800 font-bold cursor-pointer"
                  />
                  {fondoFoto2Url && (
                    <div className="space-y-2 text-[11px] font-bold text-slate-700">
                      <div>
                        <span>Tamaño: {foto2Tamano}px</span>
                        <input type="range" min="200" max="800" value={foto2Tamano} onChange={e => setFoto2Tamano(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Posición Vertical (%): {foto2PosY}%</span>
                        <input type="range" min="20" max="80" value={foto2PosY} onChange={e => setFoto2PosY(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Desplazar Der. (X): {foto2PosX}px</span>
                        <input type="range" min="-100" max="200" value={foto2PosX} onChange={e => setFoto2PosX(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <button type="button" onClick={() => setFondoFoto2Url('')} className="text-[10px] text-red-600 underline">Quitar Foto 2</button>
                    </div>
                  )}
                </div>

                {/* CONTROLES FOTO 3 */}
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                  <p className="text-xs font-black text-indigo-900 border-b pb-1">📍 Foto 3: Inferior (Footer)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleSubirFondoFoto(e, setFondoFoto3Url)}
                    className="text-[11px] w-full file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-indigo-100 file:text-indigo-800 font-bold cursor-pointer"
                  />
                  {fondoFoto3Url && (
                    <div className="space-y-2 text-[11px] font-bold text-slate-700">
                      <div>
                        <span>Tamaño: {foto3Tamano}px</span>
                        <input type="range" min="200" max="800" value={foto3Tamano} onChange={e => setFoto3Tamano(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Subir desde Abajo (Y): {foto3PosY}px</span>
                        <input type="range" min="0" max="200" value={foto3PosY} onChange={e => setFoto3PosY(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <div>
                        <span>Desplazar Izq. (X): {foto3PosX}px</span>
                        <input type="range" min="-100" max="200" value={foto3PosX} onChange={e => setFoto3PosX(Number(e.target.value))} className="w-full accent-indigo-600" />
                      </div>
                      <button type="button" onClick={() => setFondoFoto3Url('')} className="text-[10px] text-red-600 underline">Quitar Foto 3</button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

        </form>

        {/* SECCIÓN 5: CATÁLOGOS DE PRÁCTICAS Y ODONTÓLOGOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="text-sm font-black text-blue-950 border-b pb-2 uppercase tracking-wide">
              📋 Prácticas y Tratamientos
            </h3>
            
            <form onSubmit={handleAgregarPractica} className="flex gap-2">
              <input
                type="text"
                required
                value={nuevaPractica}
                onChange={e => setNuevaPractica(e.target.value)}
                placeholder="Ej. Blanqueamiento Dental"
                className="flex-1 text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 rounded-xl cursor-pointer"
              >
                + Agregar
              </button>
            </form>

            <div className="divide-y text-xs max-h-80 overflow-y-auto">
              {practicas.map(p => (
                <div key={p} className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-700">{p}</span>
                  <button
                    type="button"
                    onClick={() => eliminarPractica(p)}
                    className="text-red-600 hover:text-red-800 font-bold text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="text-sm font-black text-blue-950 border-b pb-2 uppercase tracking-wide">
              👨‍⚕️ Plantilla de Odontólogos
            </h3>

            <form onSubmit={handleAgregarOdontologo} className="space-y-2">
              <input
                type="text"
                required
                value={nombreOdontologo}
                onChange={e => setNombreOdontologo(e.target.value)}
                placeholder="Nombre (Ej. Od. Juan Pérez)"
                className="w-full text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={especialidadOdontologo}
                  onChange={e => setEspecialidadOdontologo(e.target.value)}
                  placeholder="Especialidad (Ej. Endodoncia)"
                  className="flex-1 text-xs border rounded-xl p-2.5 bg-slate-50 outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded-xl cursor-pointer"
                >
                  + Agregar
                </button>
              </div>
            </form>

            <div className="divide-y text-xs max-h-80 overflow-y-auto">
              {odontologos.map(o => (
                <div key={o.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-purple-950">{o.nombre}</p>
                    <p className="text-[10px] text-slate-500">{o.especialidad}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarOdontologo(o.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

{/* CAMPOS DE CREDENCIALES (NUEVO) */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-gray-100">
  <div>
    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
      👤 Usuario de Acceso
    </label>
    <input 
      type="text" 
      placeholder="Ej. smartinez" 
      className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
    />
  </div>
  <div>
    <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase tracking-wider">
      🔑 Contraseña Temporal
    </label>
    <input 
      type="password" 
      placeholder="••••••••" 
      className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
    />
  </div>
</div>