import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col justify-between">
      
      {/* Header Corporativo */}
      <header className="bg-white border-b py-4 px-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-black text-blue-600 leading-none">MeDent</h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">
            Clínica Odontológica
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/turnos/solicitar" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors">
            🗓️ Pedir Turno Online
          </Link>
          <Link href="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors">
            🔐 Acceso Staff
          </Link>
        </div>
      </header>

      {/* Hero Principal */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
        <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Atención Odontológica Integral
        </span>

        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Cuidamos tu sonrisa con la mejor tecnología médica
        </h2>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto font-medium">
          Agenda tu consulta online en segundos. Contamos con especialistas en ortodoncia, endodoncia, implantes y estética dental.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link href="/turnos/solicitar" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 px-8 rounded-2xl shadow-md transition-all">
            🗓️ Agendar Turno Online
          </Link>
          <a 
            href="https://wa.me/5493510000000?text=Hola%20MeDent!%20Quisiera%20consultar%20por%20un%20turno"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black text-sm py-3.5 px-8 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-xs text-gray-400 font-medium">
        © 2026 MeDent — Clínica Odontológica. Todos los derechos reservados.
      </footer>
    </div>
  );
}