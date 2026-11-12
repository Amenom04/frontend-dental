'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useConfig } from '@/context/ConfigContext';

interface DocumentoClinico {
  id: number;
  nombre: string;
  categoria: 'Pre-quirúrgicos' | 'Pantomografías / Radiografías' | 'Fotografías e Imágenes' | 'Informes y Consentimientos';
  fecha: string;
  tipo: string;
  url: string;
  tamanio: string;
}

interface RegistroOdontograma {
  id: number;
  pieza: number;
  cara: string;
  estado: string;
  fecha: string;
}

interface Evolucion {
  id: number;
  fecha: string;
  profesional: string;
  diagnostico: string;
  tratamiento: string;
  observaciones?: string;
}

type ColorEstado = 'ninguno' | 'caries' | 'obturado' | 'endodoncia' | 'corona' | 'ausente';

function FichaPacienteContent() {
  const { config } = useConfig();
  const searchParams = useSearchParams();
  const pacienteId = searchParams.get('id') || '1';

  const [mounted, setMounted] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<'odontograma' | 'documentos'>('odontograma');
  
  /* =========================================
     ESTADOS: DATOS Y EDICIÓN DEL PACIENTE
  ========================================= */
  const [editandoPaciente, setEditandoPaciente] = useState(false);
  const [paciente, setPaciente] = useState({
    id: pacienteId,
    nombre: 'Eduardo',
    apellido: 'Medran',
    dni: '12321664',
    telefono: '03515941281',
    email: 'semedran@gmail.com',
    obraSocial: 'Particular',
    alergias: 'Ninguna reportada',
    enfermedades: 'Sin particularidades',
    medicacion: 'Ninguna'
  });

  /* =========================================
     ESTADOS: EVOLUCIONES & REGISTRO DIRECTO
  ========================================= */
  const [evoluciones, setEvoluciones] = useState<Evolucion[]>([]);
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nuevoProfesional, setNuevoProfesional] = useState('Od. Principal');
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState('');
  const [nuevoTratamiento, setNuevoTratamiento] = useState('');
  const [nuevasObservaciones, setNuevasObservaciones] = useState('');
  const [guardandoEvolucion, setGuardandoEvolucion] = useState(false);

  /* =========================================
     ESTADOS: ESTUDIOS Y DOCUMENTOS
  ========================================= */
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');
  const [modalSubir, setModalSubir] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [catSubida, setCatSubida] = useState<DocumentoClinico['categoria']>('Pantomografías / Radiografías');
  const [archivoTemp, setArchivoTemp] = useState<File | null>(null);

  /* =========================================
     ESTADOS: VISOR DE IMÁGENES (ZOOM Y PANEO)
  ========================================= */
  const [imagenVisor, setImagenVisor] = useState<string | null>(null);
  const [escalaZoom, setEscalaZoom] = useState(1);
  const [posicionPaneo, setPosicionPaneo] = useState({ x: 0, y: 0 });
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [inicioArrastre, setInicioArrastre] = useState({ x: 0, y: 0 });

  /* =========================================
     ESTADOS: ODONTOGRAMA DE 5 CARAS
  ========================================= */
  const [tipoDentadura, setTipoDentadura] = useState<'adulta' | 'primaria' | 'mixta'>('adulta');
  const [herramientaActiva, setHerramientaActiva] = useState<ColorEstado>('caries');
  const [carasColoreadas, setCarasColoreadas] = useState<{ [key: string]: ColorEstado }>({});
  const [registrosDentales, setRegistrosDentales] = useState<RegistroOdontograma[]>([]);

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
    
    // Cargar Datos del Paciente desde LocalStorage o Backend
    const pacienteGuardado = localStorage.getItem(`medent_paciente_datos_${pacienteId}`);
    if (pacienteGuardado) {
      setPaciente(JSON.parse(pacienteGuardado));
    }

    const docsGuardados = localStorage.getItem(`medent_docs_paciente_${pacienteId}`);
    if (docsGuardados) setDocumentos(JSON.parse(docsGuardados));

    const odontoGuardado = localStorage.getItem(`medent_odonto_paciente_${pacienteId}`);
    if (odontoGuardado) {
      const data = JSON.parse(odontoGuardado);
      setCarasColoreadas(data.caras || {});
      setRegistrosDentales(data.registros || []);
    }

    const evolucionesGuardadas = localStorage.getItem(`medent_evoluciones_paciente_${pacienteId}`);
    if (evolucionesGuardadas) {
      setEvoluciones(JSON.parse(evolucionesGuardadas));
    }
  }, [pacienteId]);

  /* =========================================
     MÉTODOS: EDICIÓN DE FICHA DE PACIENTE
  ========================================= */
  const guardarEdicionPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`medent_paciente_datos_${pacienteId}`, JSON.stringify(paciente));
    setEditandoPaciente(false);
    alert('✅ Ficha del paciente actualizada con éxito.');
  };

  /* =========================================
     MÉTODOS: EVOLUCIONES MÉDICAS
  ========================================= */
  const handleAgregarEvolucion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDiagnostico.trim()) return alert('Por favor ingresa un diagnóstico.');

    setGuardandoEvolucion(true);

    const nuevaEv: Evolucion = {
      id: Date.now(),
      fecha: nuevaFecha,
      profesional: nuevoProfesional,
      diagnostico: nuevoDiagnostico,
      tratamiento: nuevoTratamiento,
      observaciones: nuevasObservaciones
    };

    const actualizadas = [nuevaEv, ...evoluciones];
    setEvoluciones(actualizadas);
    localStorage.setItem(`medent_evoluciones_paciente_${pacienteId}`, JSON.stringify(actualizadas));

    setNuevoDiagnostico('');
    setNuevoTratamiento('');
    setNuevasObservaciones('');
    setGuardandoEvolucion(false);
    alert('✅ Diagnóstico y evolución registrados en el expediente.');
  };

  /* =========================================
     MÉTODOS: ESTUDIOS Y DOCUMENTOS
  ========================================= */
  const abrirModalSubida = () => {
    if (categoriaSeleccionada !== 'Todas') setCatSubida(categoriaSeleccionada as DocumentoClinico['categoria']);
    else setCatSubida('Pantomografías / Radiografías');
    setModalSubir(true);
  };

  const guardarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreArchivo && !archivoTemp) return;

    const nuevoDoc: DocumentoClinico = {
      id: Date.now(),
      nombre: nombreArchivo || archivoTemp?.name || 'Documento',
      categoria: catSubida,
      fecha: new Date().toLocaleDateString('es-AR'),
      tipo: archivoTemp?.type || 'application/pdf',
      url: archivoTemp ? URL.createObjectURL(archivoTemp) : '#',
      tamanio: archivoTemp ? `${(archivoTemp.size / (1024 * 1024)).toFixed(1)} MB` : '0.5 MB'
    };

    const actualizados = [nuevoDoc, ...documentos];
    setDocumentos(actualizados);
    localStorage.setItem(`medent_docs_paciente_${pacienteId}`, JSON.stringify(actualizados));
    
    setCategoriaSeleccionada(catSubida); 
    setModalSubir(false);
    setNombreArchivo('');
    setArchivoTemp(null);
  };

  const eliminarDocumento = (id: number) => {
    if (confirm('¿Eliminar este documento clínico?')) {
      const filtrados = documentos.filter(d => d.id !== id);
      setDocumentos(filtrados);
      localStorage.setItem(`medent_docs_paciente_${pacienteId}`, JSON.stringify(filtrados));
    }
  };

  const categoriasLista = ['Todas', 'Pre-quirúrgicos', 'Pantomografías / Radiografías', 'Fotografías e Imágenes', 'Informes y Consentimientos'];
  const documentosFiltrados = categoriaSeleccionada === 'Todas' ? documentos : documentos.filter(d => d.categoria === categoriaSeleccionada);

  /* =========================================
     MÉTODOS: VISOR DE IMÁGENES
  ========================================= */
  const abrirVisor = (url: string) => {
    setImagenVisor(url);
    restablecerVisor();
  };

  const cerrarVisor = () => setImagenVisor(null);

  const restablecerVisor = () => {
    setEscalaZoom(1);
    setPosicionPaneo({ x: 0, y: 0 });
  };

  const manejarRuedaRaton = (e: React.WheelEvent) => {
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setEscalaZoom(prev => Math.min(Math.max(prev * factor, 0.5), 5));
  };

  const iniciarArrastreVisor = (e: React.MouseEvent | React.TouchEvent) => {
    setEstaArrastrando(true);
    const clienteX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clienteY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setInicioArrastre({
      x: clienteX - posicionPaneo.x,
      y: clienteY - posicionPaneo.y
    });
  };

  const duranteArrastreVisor = (e: React.MouseEvent | React.TouchEvent) => {
    if (!estaArrastrando) return;
    const clienteX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clienteY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosicionPaneo({
      x: clienteX - inicioArrastre.x,
      y: clienteY - inicioArrastre.y
    });
  };

  const detenerArrastreVisor = () => setEstaArrastrando(false);

  /* =========================================
     MÉTODOS: ODONTOGRAMA DE 5 CARAS
  ========================================= */
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

  const guardarOdontogramaLocal = (nuevasCaras: any, nuevosRegistros: any) => {
    localStorage.setItem(`medent_odonto_paciente_${pacienteId}`, JSON.stringify({
      caras: nuevasCaras,
      registros: nuevosRegistros
    }));
  };

  // 🔥 ACTIVACIÓN DIRECTA DE OBSERVACIONES AL HACER CLIC EN LAS CARAS
  const handleClicIzquierdo = (pieza: number, caraClave: string) => {
    const clave = `${pieza}-${caraClave}`;
    const nombreCaraEsp = NOMBRES_CARAS_ESPANOL[caraClave] || caraClave;
    const nuevasCaras = { ...carasColoreadas, [clave]: herramientaActiva };
    setCarasColoreadas(nuevasCaras);

    const estadoTexto = herramientaActiva.toUpperCase();
    const nuevoRegistro: RegistroOdontograma = {
      id: Date.now(), pieza, cara: nombreCaraEsp, estado: estadoTexto, fecha: new Date().toLocaleDateString('es-AR')
    };
    const nuevosRegistros = [nuevoRegistro, ...registrosDentales.filter(r => !(r.pieza === pieza && r.cara === nombreCaraEsp))];
    setRegistrosDentales(nuevosRegistros);
    guardarOdontogramaLocal(nuevasCaras, nuevosRegistros);

    // ⚡ SE ACTIVA EL CUADRO DE OBSERVACIONES / DIAGNÓSTICO DIRECTAMENTE
    setNuevoDiagnostico(`Pieza ${pieza} - Cara ${nombreCaraEsp}: Hallazgo de ${estadoTexto}`);
    setNuevoTratamiento(`Procedimiento sugerido para Pieza ${pieza}`);
    setNuevasObservaciones(`Marcación registrada desde el odontograma para la cara ${nombreCaraEsp}.`);
  };

  const handleClicDerecho = (e: React.MouseEvent, pieza: number, caraClave: string) => {
    e.preventDefault();
    const clave = `${pieza}-${caraClave}`;
    const nombreCaraEsp = NOMBRES_CARAS_ESPANOL[caraClave] || caraClave;
    const nuevasCaras = { ...carasColoreadas };
    delete nuevasCaras[clave];
    setCarasColoreadas(nuevasCaras);

    const nuevosRegistros = registrosDentales.filter(r => !(r.pieza === pieza && r.cara === nombreCaraEsp));
    setRegistrosDentales(nuevosRegistros);
    guardarOdontogramaLocal(nuevasCaras, nuevosRegistros);

    setNuevoDiagnostico(`Pieza ${pieza} - Cara ${nombreCaraEsp}: Limpieza de marcas`);
    setNuevasObservaciones(`Se removió el estado previo de la cara ${nombreCaraEsp} en Pieza ${pieza}.`);
  };

  const limpiarOdontograma = () => {
    if (confirm('¿Borrar todas las marcas del odontograma?')) {
      setCarasColoreadas({});
      setRegistrosDentales([]);
      guardarOdontogramaLocal({}, []);
    }
  };

  const DienteGeometriaSVG = ({ pieza }: { pieza: number }) => (
    <div className="flex flex-col items-center group cursor-pointer" onContextMenu={e => e.preventDefault()}>
      <span className="text-[11px] font-black text-slate-700 mb-1 select-none">{pieza}</span>
      <svg width="36" height="36" viewBox="0 0 100 100" className="border border-slate-400 bg-white rounded shadow-sm hover:scale-105 transition-transform">
        <polygon points="0,0 100,0 75,25 25,25" fill={getColorCara(`${pieza}-top`)} stroke="#475569" strokeWidth="3" onClick={() => handleClicIzquierdo(pieza, 'top')} onContextMenu={e => handleClicDerecho(e, pieza, 'top')} />
        <polygon points="100,0 100,100 75,75 75,25" fill={getColorCara(`${pieza}-right`)} stroke="#475569" strokeWidth="3" onClick={() => handleClicIzquierdo(pieza, 'right')} onContextMenu={e => handleClicDerecho(e, pieza, 'right')} />
        <polygon points="0,100 100,100 75,75 25,75" fill={getColorCara(`${pieza}-bottom`)} stroke="#475569" strokeWidth="3" onClick={() => handleClicIzquierdo(pieza, 'bottom')} onContextMenu={e => handleClicDerecho(e, pieza, 'bottom')} />
        <polygon points="0,0 25,25 25,75 0,100" fill={getColorCara(`${pieza}-left`)} stroke="#475569" strokeWidth="3" onClick={() => handleClicIzquierdo(pieza, 'left')} onContextMenu={e => handleClicDerecho(e, pieza, 'left')} />
        <rect x="25" y="25" width="50" height="50" fill={getColorCara(`${pieza}-center`)} stroke="#475569" strokeWidth="3" onClick={() => handleClicIzquierdo(pieza, 'center')} onContextMenu={e => handleClicDerecho(e, pieza, 'center')} />
      </svg>
    </div>
  );

  if (!mounted) return null;

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between ${config?.tipoTipografia || ''}`}>
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 0.8cm; }
          header, footer, .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; }
        }
      `}</style>

      {/* HEADER SUPERIOR */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex flex-col sm:flex-row justify-between items-center gap-3 no-print" style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight leading-none">{config?.nombreClinica || 'MeDent'}</h1>
          <p className="text-[10px] uppercase font-bold text-blue-100 tracking-widest mt-0.5">CLÍNICA ODONTOLÓGICA — EXPEDIENTE E HISTORIA CLÍNICA</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Link href="/pacientes" className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl border border-blue-400">Volver a Lista de Pacientes</Link>
          <Link href="/dashboard" className="bg-blue-800 hover:bg-blue-900 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl border border-blue-400">📊 Dashboard</Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: FICHA Y ANTECEDENTES EDITABLES */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FICHA TÉCNICA DEL PACIENTE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                📋 Ficha del Paciente
              </h3>
              <button
                type="button"
                onClick={() => setEditandoPaciente(!editandoPaciente)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] py-1 px-3 rounded-lg border border-blue-200 transition-colors"
              >
                {editandoPaciente ? '❌ Cancelar' : '✏️ Editar Ficha'}
              </button>
            </div>

            {editandoPaciente ? (
              <form onSubmit={guardarEdicionPaciente} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre</label>
                  <input type="text" value={paciente.nombre} onChange={e => setPaciente({ ...paciente, nombre: e.target.value })} required className="w-full font-bold border rounded-xl p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Apellido</label>
                  <input type="text" value={paciente.apellido} onChange={e => setPaciente({ ...paciente, apellido: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">DNI</label>
                  <input type="text" value={paciente.dni} onChange={e => setPaciente({ ...paciente, dni: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono / WhatsApp</label>
                  <input type="text" value={paciente.telefono} onChange={e => setPaciente({ ...paciente, telefono: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50 text-emerald-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Obra Social</label>
                  <input type="text" value={paciente.obraSocial} onChange={e => setPaciente({ ...paciente, obraSocial: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50" />
                </div>

                <div className="pt-2 border-t space-y-2">
                  <label className="block text-[10px] font-bold text-red-600 uppercase">⚠️ Alergias</label>
                  <input type="text" value={paciente.alergias} onChange={e => setPaciente({ ...paciente, alergias: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-red-50 text-red-900 border-red-200" />

                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Enfermedades Preexistentes</label>
                  <input type="text" value={paciente.enfermedades} onChange={e => setPaciente({ ...paciente, enfermedades: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50" />

                  <label className="block text-[10px] font-bold text-slate-600 uppercase">Medicación</label>
                  <input type="text" value={paciente.medicacion} onChange={e => setPaciente({ ...paciente, medicacion: e.target.value })} className="w-full font-bold border rounded-xl p-2 bg-slate-50" />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl shadow-sm mt-2">
                  💾 Guardar Cambios
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-md">
                    {paciente.nombre[0]}{paciente.apellido[0]}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-tight">{paciente.nombre} {paciente.apellido}</h2>
                    <p className="text-xs font-bold text-slate-500">DNI: {paciente.dni}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono / WhatsApp</span>
                  <span className="font-extrabold text-emerald-700">{paciente.telefono}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Obra Social / Prepaga</span>
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block">{paciente.obraSocial}</span>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-600 block">⚠️ Alergias Conocidas</span>
                    <span className="font-bold text-red-900 bg-red-50 px-2 py-1 rounded-lg border border-red-200 block mt-0.5">{paciente.alergias}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enfermedades Preexistentes</span>
                    <span className="font-bold text-slate-700">{paciente.enfermedades}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Medicación Habitual</span>
                    <span className="font-bold text-slate-700">{paciente.medicacion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: PESTAÑAS DENTALES Y EVOLUCIONES */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-2 no-print">
            <div className="flex gap-2">
              <button onClick={() => setPestanaActiva('odontograma')} className={`py-2.5 px-5 rounded-xl text-xs font-black transition-all ${pestanaActiva === 'odontograma' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>🦷 Odontograma Digital (5 Caras)</button>
              <button onClick={() => setPestanaActiva('documentos')} className={`py-2.5 px-5 rounded-xl text-xs font-black transition-all ${pestanaActiva === 'documentos' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>📁 Estudios y Documentos ({documentos.length})</button>
            </div>
            {pestanaActiva === 'odontograma' ? (
              <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all">🖨️ Imprimir Odontograma (A4)</button>
            ) : (
              <button onClick={abrirModalSubida} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all">+ Subir Archivo</button>
            )}
          </div>

          {/* VISTA 1: ODONTOGRAMA DE 5 CARAS */}
          {pestanaActiva === 'odontograma' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 no-print">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Dentadura:</span>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      <button onClick={() => setTipoDentadura('adulta')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'adulta' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Adulta</button>
                      <button onClick={() => setTipoDentadura('primaria')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'primaria' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Primaria</button>
                      <button onClick={() => setTipoDentadura('mixta')} className={`text-xs font-black px-3 py-1 rounded-lg ${tipoDentadura === 'mixta' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Mixta</button>
                    </div>
                  </div>
                  <button onClick={limpiarOdontograma} className="bg-red-50 text-red-600 border border-red-200 font-extrabold text-xs py-1.5 px-3 rounded-xl cursor-pointer">🗑️ Limpiar Todo</button>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-xs font-black">
                    <button onClick={() => setHerramientaActiva('caries')} className={`px-3 py-1.5 rounded-xl border cursor-pointer ${herramientaActiva === 'caries' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>🔴 Caries</button>
                    <button onClick={() => setHerramientaActiva('obturado')} className={`px-3 py-1.5 rounded-xl border cursor-pointer ${herramientaActiva === 'obturado' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>🔵 Obturado</button>
                    <button onClick={() => setHerramientaActiva('endodoncia')} className={`px-3 py-1.5 rounded-xl border cursor-pointer ${herramientaActiva === 'endodoncia' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>🟣 Endodoncia</button>
                    <button onClick={() => setHerramientaActiva('corona')} className={`px-3 py-1.5 rounded-xl border cursor-pointer ${herramientaActiva === 'corona' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>🟠 Corona</button>
                    <button onClick={() => setHerramientaActiva('ausente')} className={`px-3 py-1.5 rounded-xl border cursor-pointer ${herramientaActiva === 'ausente' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}>⚪ Ausente</button>
                  </div>
                </div>
              </div>

              {/* Grilla Dental */}
              <div className="overflow-x-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
                {(tipoDentadura === 'adulta' || tipoDentadura === 'mixta') && (
                  <div className="space-y-4">
                    <div className="space-y-1">
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
                    </div>
                  </div>
                )}
                {(tipoDentadura === 'primaria' || tipoDentadura === 'mixta') && (
                  <div className="space-y-4 pt-4 border-t mt-4">
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
            </div>
          )}

          {/* VISTA 2: ESTUDIOS Y DOCUMENTOS */}
          {pestanaActiva === 'documentos' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <div className="flex flex-wrap gap-2">
                  {categoriasLista.map(cat => {
                    const cant = cat === 'Todas' ? documentos.length : documentos.filter(d => d.categoria === cat).length;
                    return (
                      <button key={cat} onClick={() => setCategoriaSeleccionada(cat)} className={`py-2 px-4 rounded-xl text-xs font-black transition-all border ${categoriaSeleccionada === cat ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>📁 {cat} <span className="ml-1 opacity-75">({cant})</span></button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t pt-4">
                {documentosFiltrados.length === 0 ? (
                  <div onClick={abrirModalSubida} className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-2 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                    <span className="text-3xl block group-hover:scale-110 transition-transform">➕</span>
                    <p className="text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">No hay documentos. Haz clic aquí para subir en «{categoriaSeleccionada}»</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentosFiltrados.map(doc => (
                      <div key={doc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-3">
                        <div className="flex gap-3 items-start overflow-hidden">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-lg">{doc.tipo.includes('image') ? '🖼️' : '📄'}</div>
                          <div className="space-y-0.5 overflow-hidden">
                            <h5 className="text-xs font-black text-slate-900 truncate">{doc.nombre}</h5>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">{doc.categoria}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {doc.url !== '#' && doc.tipo.includes('image') ? (
                            <button onClick={() => abrirVisor(doc.url)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 text-xs font-bold shadow-sm transition-colors">👁️</button>
                          ) : (
                            doc.url !== '#' && <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 bg-white text-slate-700 rounded-lg border text-xs font-bold shadow-sm">👁️</a>
                          )}
                          <button onClick={() => eliminarDocumento(doc.id)} className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-xs font-bold shadow-sm transition-colors">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🔥 FORMULARIO Y REGISTRO DE EVOLUCIONES / OBSERVACIONES */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-blue-950 uppercase tracking-wider border-b pb-3">
              📝 REGISTRO Y OBSERVACIONES DE EVOLUCIÓN CÍNICA
            </h3>

            <form onSubmit={handleAgregarEvolucion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha de Atención</label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    required
                    className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Profesional a Cargo</label>
                  <input
                    type="text"
                    value={nuevoProfesional}
                    onChange={(e) => setNuevoProfesional(e.target.value)}
                    required
                    placeholder="Ej. Od. Juan Pérez"
                    className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Diagnóstico / Hallazgo *</label>
                <input
                  type="text"
                  value={nuevoDiagnostico}
                  onChange={(e) => setNuevoDiagnostico(e.target.value)}
                  required
                  placeholder="Se completa automáticamente al hacer clic en las caras del odontograma..."
                  className="w-full text-xs font-bold border rounded-xl p-2.5 bg-blue-50/50 border-blue-200 text-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tratamiento / Procedimiento Efectuado</label>
                <input
                  type="text"
                  value={nuevoTratamiento}
                  onChange={(e) => setNuevoTratamiento(e.target.value)}
                  placeholder="Ej. Obturación resina fotocurable, cavidad clase I"
                  className="w-full text-xs font-medium border rounded-xl p-2.5 bg-slate-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Observaciones / Indicaciones Post-atención</label>
                <textarea
                  rows={2}
                  value={nuevasObservaciones}
                  onChange={(e) => setNuevasObservaciones(e.target.value)}
                  placeholder="Escribe aquí las observaciones o indicaciones del paciente..."
                  className="w-full text-xs font-medium border rounded-xl p-2.5 bg-slate-50 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={guardandoEvolucion}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                style={{ backgroundColor: config?.colorPrimario || '#2563eb' }}
              >
                {guardandoEvolucion ? 'Guardando Evolución...' : '+ Agregar Registro a Historia Clínica'}
              </button>
            </form>
          </div>

          {/* HISTORIAL DE REGISTROS / EVOLUCIONES */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-3">
              📜 Historial de Evoluciones Registradas ({evoluciones.length})
            </h3>

            {evoluciones.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay registros previos de evoluciones clínicas.</p>
            ) : (
              <div className="space-y-4">
                {evoluciones.map((ev) => (
                  <div key={ev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-black text-blue-900">📅 {ev.fecha}</span>
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase">
                        {ev.profesional}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p><strong className="text-slate-800">Diagnóstico:</strong> {ev.diagnostico}</p>
                      {ev.tratamiento && <p><strong className="text-slate-800">Tratamiento:</strong> {ev.tratamiento}</p>}
                      {ev.observaciones && <p className="text-slate-500 italic"><strong className="text-slate-700">Obs:</strong> {ev.observaciones}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* VISOR DE IMÁGENES A PANTALLA COMPLETA */}
      {imagenVisor && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center no-print overflow-hidden select-none">
          <div className="absolute top-6 right-6 z-[110] flex gap-3">
            <button onClick={restablecerVisor} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-slate-700 transition-colors border border-slate-600">
              🔄 Restablecer
            </button>
            <button onClick={cerrarVisor} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-red-700 transition-colors">
              ❌ Cerrar Visor
            </button>
          </div>
          
          <div className="absolute bottom-6 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl text-slate-300 text-[11px] font-bold z-[110]">
            Rueda del ratón para Zoom ({Math.round(escalaZoom * 100)}%) • Clic y arrastrar para mover
          </div>

          <div 
            className={`w-full h-full flex items-center justify-center transition-colors ${estaArrastrando ? 'cursor-grabbing' : 'cursor-grab'}`}
            onWheel={manejarRuedaRaton}
            onMouseDown={iniciarArrastreVisor}
            onMouseMove={duranteArrastreVisor}
            onMouseUp={detenerArrastreVisor}
            onMouseLeave={detenerArrastreVisor}
            onTouchStart={iniciarArrastreVisor}
            onTouchMove={duranteArrastreVisor}
            onTouchEnd={detenerArrastreVisor}
          >
            <img 
              src={imagenVisor} 
              alt="Visor Detallado" 
              draggable={false}
              style={{
                transform: `translate(${posicionPaneo.x}px, ${posicionPaneo.y}px) scale(${escalaZoom})`,
                transition: estaArrastrando ? 'none' : 'transform 0.15s ease-out',
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain'
              }} 
            />
          </div>
        </div>
      )}

      {/* MODAL SUBIDA */}
      {modalSubir && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-3">Subir Estudio</h3>
            <form onSubmit={guardarDocumento} className="space-y-4">
              <input type="text" required value={nombreArchivo} onChange={e => setNombreArchivo(e.target.value)} placeholder="Nombre del estudio" className="w-full text-xs font-bold border rounded-xl p-3 bg-slate-50 outline-none" />
              <select value={catSubida} onChange={e => setCatSubida(e.target.value as any)} className="w-full text-xs font-bold border rounded-xl p-3 bg-slate-50 outline-none">
                <option value="Pre-quirúrgicos">Pre-quirúrgicos</option>
                <option value="Pantomografías / Radiografías">Pantomografías / Radiografías</option>
                <option value="Fotografías e Imágenes">Fotografías e Imágenes</option>
                <option value="Informes y Consentimientos">Informes y Consentimientos</option>
              </select>
              <input type="file" onChange={e => setArchivoTemp(e.target.files?.[0] || null)} className="w-full text-xs font-bold border rounded-xl p-2.5 bg-slate-50" />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setModalSubir(false)} className="text-xs font-bold text-slate-500 px-4 py-2.5 hover:bg-slate-100 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function FichaPacientePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-bold">Cargando expediente...</div>}>
      <FichaPacienteContent />
    </Suspense>
  );
}