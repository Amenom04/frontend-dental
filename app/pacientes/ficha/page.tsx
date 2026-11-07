'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Paciente {
  id: number;
  nombre: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  obra_social?: string;
}

interface RegistroOdontograma {
  id: number;
  pieza: number;
  cara: string;
  estado: string;
  observaciones: string;
  fecha: string;
}

interface DocumentoClinico {
  id: number;
  nombre: string;
  categoria: string;
  fecha: string;
  url: string;
}

type ColorEstado = 'ninguno' | 'caries' | 'obturado' | 'endodoncia' | 'corona' | 'ausente';

function ContenidoFichaPaciente() {
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('id');

  const [mounted, setMounted] = useState(false);
  const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<'odontograma' | 'estudios'>('odontograma');

  // Dentadura y Diagnósticos
  const [tipoDentadura, setTipoDentadura] = useState<'adulta' | 'primaria' | 'mixta'>('adulta');
  const [herramientaActiva, setHerramientaActiva] = useState<ColorEstado>('caries');
  const [carasColoreadas, setCarasColoreadas] = useState<{ [key: string]: ColorEstado }>({});
  const [registrosDentales, setRegistrosDentales] = useState<RegistroOdontograma[]>([]);

  // Documentos
  const [filtroEstudio, setFiltroEstudio] = useState('Todas');
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Piezas Dentales FDI
  const adultaSupCuad1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const adultaSupCuad2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const adultaInfCuad4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const adultaInfCuad3 = [31, 32, 33, 34, 35, 36, 37, 38];

  const primariaSupCuad5 = [55, 54, 53, 52, 51];
  const primariaSupCuad6 = [61, 62, 63, 64, 65];
  const primariaInfCuad8 = [85, 84, 83, 82, 81];
  const primariaInfCuad7 = [71, 72, 73, 74, 75];

  const NOMBRES_CARAS_ESPANOL: { [key: string]: string } = {
    top: 'Vestibular / Palatina',
    bottom: 'Lingual / Vestibular',
    left: 'Mesial',
    right: 'Distal',
    center: 'Oclusal / Incisal'
  };

  useEffect(() => {
    setMounted(true);
    if (pacienteId) {
      fetch(`http://localhost:4000/api/pacientes/${pacienteId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setPacienteActivo(data);
          else {
            setPacienteActivo({
              id: Number(pacienteId),
              nombre: 'Eduardo',
              apellido: 'Medran',
              dni: '12321654',
              telefono: '03515941281',
              email: 'semedran@gmail.com',
              obra_social: 'Particular'
            });
          }
        })
        .catch(() => {
          setPacienteActivo({
            id: Number(pacienteId),
            nombre: 'Eduardo',
            apellido: 'Medran',
            dni: '12321654',
            telefono: '03515941281',
            email: 'semedran@gmail.com',
            obra_social: 'Particular'
          });
        });
    }
  }, [pacienteId]);

  const getColorCara = (clave: string) => {
    const estado = carasColoreadas[clave] || 'ninguno';
    switch (estado) {
      case 'caries': return '#e11d48';
      case 'obturado': return '#2563eb';
      case 'endodoncia': return '#9333ea';
      case 'corona': return '#d97706';
      case 'ausente': return '#6b7280';
      default: return '#ffffff';
    }
  };

  // CLIC IZQUIERDO: MARCAR SECTOR SIN REPETIR REGISTROS DUPLICADOS EN EL HISTORIAL
  const handleClicIzquierdo = (pieza: number, caraClave: string) => {
    const clave = `${pieza}-${caraClave}`;
    const nombreCaraEsp = NOMBRES_CARAS_ESPANOL[caraClave] || caraClave;

    setCarasColoreadas(prev => ({
      ...prev,
      [clave]: herramientaActiva
    }));

    const nuevoRegistro: RegistroOdontograma = {
      id: Date.now(),
      pieza,
      cara: nombreCaraEsp,
      estado: herramientaActiva.toUpperCase(),
      observaciones: `Marcado sector ${nombreCaraEsp} en diente #${pieza}`,
      fecha: new Date().toLocaleDateString('es-AR')
    };

    // Eliminamos cualquier registro previo para la misma pieza y cara antes de añadir el nuevo
    setRegistrosDentales(prev => [
      nuevoRegistro,
      ...prev.filter(r => !(r.pieza === pieza && r.cara === nombreCaraEsp))
    ]);
  };

  // CLIC DERECHO: DESMARCAR SECTOR (BORRAR)
  const handleClicDerecho = (e: React.MouseEvent, pieza: number, caraClave: string) => {
    e.preventDefault();
    const clave = `${pieza}-${caraClave}`;
    const nombreCaraEsp = NOMBRES_CARAS_ESPANOL[caraClave] || caraClave;

    setCarasColoreadas(prev => {
      const nuevoMapa = { ...prev };
      delete nuevoMapa[clave];
      return nuevoMapa;
    });

    setRegistrosDentales(prev => prev.filter(r => !(r.pieza === pieza && r.cara === nombreCaraEsp)));
  };

  const limpiarOdontogramaCompleto = () => {
    if (confirm('¿Deseas borrar todas las marcas del odontograma actual?')) {
      setCarasColoreadas({});
      setRegistrosDentales([]);
    }
  };

  const handleSubirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const nuevoDoc: DocumentoClinico = {
        id: Date.now(),
        nombre: file.name,
        categoria: filtroEstudio === 'Todas' ? 'Placas / Periapicales' : filtroEstudio,
        fecha: new Date().toLocaleDateString('es-AR'),
        url: URL.createObjectURL(file)
      };
      setDocumentos([nuevoDoc, ...documentos]);
      alert(`✅ Archivo "${file.name}" cargado exitosamente.`);
    }
  };

  if (!mounted) return null;

  const getIniciales = (nombre: string, apellido?: string) => {
    const n = (nombre || '')[0] || 'P';
    const a = (apellido || '')[0] || '';
    return `${n}${a}`.toUpperCase();
  };

  const DienteGeometriaSVG = ({ pieza }: { pieza: number }) => (
    <div className="flex flex-col items-center group cursor-pointer" onContextMenu={e => e.preventDefault()}>
      <span className="text-[11px] font-black text-gray-700 mb-1 group-hover:text-blue-600 select-none">
        {pieza}
      </span>
      <svg width="36" height="36" viewBox="0 0 100 100" className="border border-gray-400 bg-white rounded shadow-sm hover:scale-105 transition-transform">
        <polygon 
          points="0,0 100,0 75,25 25,25" 
          fill={getColorCara(`${pieza}-top`)} 
          stroke="#475569" 
          strokeWidth="3" 
          onClick={() => handleClicIzquierdo(pieza, 'top')}
          onContextMenu={e => handleClicDerecho(e, pieza, 'top')}
        />
        <polygon 
          points="100,0 100,100 75,75 75,25" 
          fill={getColorCara(`${pieza}-right`)} 
          stroke="#475569" 
          strokeWidth="3" 
          onClick={() => handleClicIzquierdo(pieza, 'right')}
          onContextMenu={e => handleClicDerecho(e, pieza, 'right')}
        />
        <polygon 
          points="0,100 100,100 75,75 25,75" 
          fill={getColorCara(`${pieza}-bottom`)} 
          stroke="#475569" 
          strokeWidth="3" 
          onClick={() => handleClicIzquierdo(pieza, 'bottom')}
          onContextMenu={e => handleClicDerecho(e, pieza, 'bottom')}
        />
        <polygon 
          points="0,0 25,25 25,75 0,100" 
          fill={getColorCara(`${pieza}-left`)} 
          stroke="#475569" 
          strokeWidth="3" 
          onClick={() => handleClicIzquierdo(pieza, 'left')}
          onContextMenu={e => handleClicDerecho(e, pieza, 'left')}
        />
        <rect 
          x="25" 
          y="25" 
          width="50" 
          height="50" 
          fill={getColorCara(`${pieza}-center`)} 
          stroke="#475569" 
          strokeWidth="3" 
          onClick={() => handleClicIzquierdo(pieza, 'center')}
          onContextMenu={e => handleClicDerecho(e, pieza, 'center')}
        />
      </svg>
    </div>
  );

  const docsFiltrados = documentos.filter(d => filtroEstudio === 'Todas' || d.categoria === filtroEstudio);

  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 flex flex-col justify-between">
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 0.8cm; }
          header, footer, .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; border: none !important; width: 100% !important; }
        }
      `}</style>

      <input type="file" ref={fileInputRef} onChange={handleSubirArchivo} className="hidden" accept="image/*,.pdf" />

      {/* HEADER SUPERIOR */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center no-print">
        <Link href="/" className="flex flex-col hover:opacity-90">
          <h1 className="text-xl font-black">MeDent</h1>
          <p className="text-[10px] uppercase font-bold text-blue-100">CLÍNICA ODONTOLÓGICA — ODONTOGRAMA DE 5 SECTORES</p>
        </Link>
        <div className="flex gap-2">
          <Link href="/pacientes" className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400">
            👥 Volver a Lista de Pacientes
          </Link>
          <Link href="/dashboard" className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400">
            📊 Dashboard
          </Link>
          <Link href="/turnos" className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl border border-blue-400">
            🗓️ Ir a la Agenda
          </Link>
          <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm">
            🚪 Cerrar Sesión
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* COLUMNA IZQUIERDA: DATOS DEL PACIENTE SELECCIONADO */}
        <div className="lg:col-span-3 space-y-4">
          {pacienteActivo && (
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center space-x-3 border-b pb-3">
                <div className="w-12 h-12 bg-blue-200 text-blue-900 font-black rounded-2xl flex items-center justify-center text-lg shadow-inner">
                  {getIniciales(pacienteActivo.nombre, pacienteActivo.apellido)}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    {pacienteActivo.nombre} {pacienteActivo.apellido}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-bold">DNI: {pacienteActivo.dni || 'Sin DNI'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Teléfono</span>
                  <p className="font-bold text-gray-900">{pacienteActivo.telefono || 'Sin datos'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Email</span>
                  <p className="font-medium text-gray-700 truncate">{pacienteActivo.email || 'Sin datos'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Obra Social / Prepaga</span>
                  <p className="font-bold text-gray-900">{pacienteActivo.obra_social || 'Particular'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ODONTOGRAMA Y ESTUDIOS */}
        <div className="lg:col-span-9 bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6 print-area">
          <div className="border-b flex justify-between items-center pb-3 no-print">
            <div className="flex space-x-6 text-sm font-bold text-gray-500">
              <button
                onClick={() => setPestanaActiva('odontograma')}
                className={`pb-1 transition-all cursor-pointer flex items-center gap-1.5 ${
                  pestanaActiva === 'odontograma' ? 'border-b-2 border-blue-600 text-blue-900 font-black' : 'hover:text-gray-800'
                }`}
              >
                <span>🦷</span> Odontograma Digital (5 Caras)
              </button>
              <button
                onClick={() => setPestanaActiva('estudios')}
                className={`pb-1 transition-all cursor-pointer flex items-center gap-1.5 ${
                  pestanaActiva === 'estudios' ? 'border-b-2 border-blue-600 text-blue-900 font-black' : 'hover:text-gray-800'
                }`}
              >
                <span>📁</span> Estudios y Documentos ({documentos.length})
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🖨️</span> Imprimir Odontograma (A4)
            </button>
          </div>

          {pestanaActiva === 'odontograma' && (
            <div className="space-y-5">
              <div className="flex flex-col space-y-3 bg-slate-50 p-4 rounded-2xl border border-gray-200 no-print">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Dentadura:</span>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      <button onClick={() => setTipoDentadura('adulta')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'adulta' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}>Adulta</button>
                      <button onClick={() => setTipoDentadura('primaria')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'primaria' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}>Primaria</button>
                      <button onClick={() => setTipoDentadura('mixta')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'mixta' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'}`}>Mixta</button>
                    </div>
                  </div>
                  <button onClick={limpiarOdontogramaCompleto} className="bg-red-50 text-red-600 border border-red-200 font-extrabold text-xs py-1.5 px-3 rounded-xl cursor-pointer">🗑️ Limpiar Todo</button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase block mb-1.5">
                      Selecciona Estado a Aplicar:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-black">
                      <button onClick={() => setHerramientaActiva('caries')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${herramientaActiva === 'caries' ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>🔴 Caries</button>
                      <button onClick={() => setHerramientaActiva('obturado')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${herramientaActiva === 'obturado' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>🔵 Obturado</button>
                      <button onClick={() => setHerramientaActiva('endodoncia')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${herramientaActiva === 'endodoncia' ? 'bg-purple-600 text-white ring-2 ring-purple-400' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>🟣 Endodoncia</button>
                      <button onClick={() => setHerramientaActiva('corona')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${herramientaActiva === 'corona' ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>🟠 Corona</button>
                      <button onClick={() => setHerramientaActiva('ausente')} className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${herramientaActiva === 'ausente' ? 'bg-gray-700 text-white ring-2 ring-gray-400' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>⚪ Ausente</button>
                    </div>
                  </div>

                  {/* INDICADOR OPTIMIZADO: MÁS COMPACTO Y EN SU PROPIA LÍNEA */}
                  <div className="inline-block bg-blue-50 border border-blue-200 text-blue-900 text-[10px] px-2.5 py-1 rounded-lg font-bold">
                    💡 <b>Clic Izq:</b> Aplicar color | <b>Clic Der:</b> Borrar sector
                  </div>
                </div>
              </div>

              {/* GRILLA DENTARIA */}
              <div className="space-y-4 overflow-x-auto p-4 bg-white rounded-2xl border border-gray-200 shadow-inner">
                {(tipoDentadura === 'adulta' || tipoDentadura === 'mixta') && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center">MAXILAR SUPERIOR</span>
                      <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                        <div className="flex gap-1">{adultaSupCuad1.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                        <div className="w-0.5 h-10 bg-slate-400 mx-1" />
                        <div className="flex gap-1">{adultaSupCuad2.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                      </div>
                    </div>
                    <div className="w-full border-t border-slate-300 my-1" />
                    <div className="space-y-1">
                      <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                        <div className="flex gap-1">{adultaInfCuad4.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                        <div className="w-0.5 h-10 bg-slate-400 mx-1" />
                        <div className="flex gap-1">{adultaInfCuad3.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block text-center pt-1">MAXILAR INFERIOR</span>
                    </div>
                  </div>
                )}

                {(tipoDentadura === 'primaria' || tipoDentadura === 'mixta') && (
                  <div className="space-y-4 pt-4 border-t">
                    <span className="text-xs font-black text-purple-900 block text-center uppercase">Dentición Temporal / Decidua</span>
                    <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                      <div className="flex gap-1">{primariaSupCuad5.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                      <div className="w-0.5 h-10 bg-purple-400 mx-1" />
                      <div className="flex gap-1">{primariaSupCuad6.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                    </div>
                    <div className="flex justify-center items-center gap-1 sm:gap-1.5">
                      <div className="flex gap-1">{primariaInfCuad8.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                      <div className="w-0.5 h-10 bg-purple-400 mx-1" />
                      <div className="flex gap-1">{primariaInfCuad7.map(p => <DienteGeometriaSVG key={p} pieza={p} />)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* HISTORIAL */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="text-xs font-black text-gray-700 uppercase">HISTORIAL ODONTOLÓGICO DE CARAS COLOREADAS</h4>
                {registrosDentales.length === 0 ? (
                  <div className="text-center py-5 text-xs text-gray-400 bg-slate-50 rounded-2xl border border-dashed">
                    Haz clic izquierdo en cualquier sector dental para colorear. Usa clic derecho sobre una cara para desmarcar.
                  </div>
                ) : (
                  <div className="divide-y text-xs border rounded-2xl overflow-hidden bg-white max-h-44 overflow-y-auto">
                    {registrosDentales.map(r => (
                      <div key={r.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50">
                        <div>
                          <span className="font-black text-blue-900">Pieza #{r.pieza} (Cara {r.cara}):</span>{' '}
                          <span className="font-bold text-gray-800">{r.estado}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-slate-100 px-2 py-1 rounded-lg">{r.fecha}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {pestanaActiva === 'estudios' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-sm font-black text-gray-900">Estudios y Documentos Clínicos</h3>
                <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer">+ Subir Archivo</button>
              </div>

              {docsFiltrados.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center space-y-3 cursor-pointer">
                  <div className="text-2xl">➕</div>
                  <h4 className="text-xs font-black text-gray-700">No hay documentos cargados en la carpeta «{filtroEstudio}»</h4>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {docsFiltrados.map(doc => (
                    <div key={doc.id} className="bg-slate-50 border p-4 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-blue-950 truncate">{doc.nombre}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white no-print">
        MeDent SaaS Odontológico — Ficha Odontológica Individual
      </footer>
    </div>
  );
}

export default function FichaPacienteSeleccionadoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-xs font-bold text-blue-600 animate-pulse">
        Cargando Ficha del Paciente...
      </div>
    }>
      <ContenidoFichaPaciente />
    </Suspense>
  );
}