export default async function Home() {
  // Conexión con tu API backend
  const res = await fetch('https://api-dental-obx9.onrender.com/api/treatments', { cache: 'no-store' });
  const treatments = await res.json();

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">
          Clínica Odontológica Modelo
        </h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {treatments.map((treatment: any, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-2">{treatment.name}</h2>
              <div className="text-gray-600 space-y-1">
                <p>⏱️ {treatment.duration_minutes} minutos</p>
                <p className="font-medium text-green-600 text-lg">
                  ${treatment.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}