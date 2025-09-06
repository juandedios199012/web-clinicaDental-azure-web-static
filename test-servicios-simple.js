// Test simple para verificar el mapeo de especialidades
const serviciosFromAPI = [
  {
    "id": "5cd64cfa-6f7d-422d-8e35-c7c221a0cc4a",
    "type": "service",
    "nombre": "Limpieza profunda",
    "duracion": 60,
    "precio": 150,
    "activo": true
  },
  {
    "id": "6675161a-7eb8-4837-bfa0-54c13d0e4677",
    "type": "service", 
    "nombre": "brakers transparente",
    "duracion": 30,
    "precio": 1000,
    "activo": true
  }
];

// Función de mapeo (copiada exactamente de api.ts)
const mapearEspecialidad = (nombreServicio) => {
  const servicioLower = nombreServicio.toLowerCase();
  
  if (servicioLower.includes('limpieza') || servicioLower.includes('profilaxis')) {
    return 'Higiene Dental';
  } else if (servicioLower.includes('extracción') || servicioLower.includes('cirugía')) {
    return 'Cirugía Oral';
  } else if (servicioLower.includes('endodoncia') || servicioLower.includes('conducto')) {
    return 'Endodoncia';
  } else if (servicioLower.includes('blanqueamiento') || servicioLower.includes('estética')) {
    return 'Estética Dental';
  } else if (servicioLower.includes('ortodoncia') || servicioLower.includes('brackets') || servicioLower.includes('brakers')) {
    return 'Ortodoncia';
  } else if (servicioLower.includes('implante') || servicioLower.includes('prótesis')) {
    return 'Implantología';
  } else if (servicioLower.includes('periodoncia') || servicioLower.includes('encías')) {
    return 'Periodoncia';
  } else {
    return 'Odontología General';
  }
};

// Simular el proceso que hace serviciosApi.getAll()
console.log('=== SIMULANDO serviciosApi.getAll() ===');
const serviciosConEspecialidad = serviciosFromAPI.map((servicio) => {
  const especialidad = mapearEspecialidad(servicio.nombre);
  console.log(`🎯 "${servicio.nombre}" → "${especialidad}"`);
  return {
    ...servicio,
    especialidad
  };
});

console.log('\n=== SERVICIOS CON ESPECIALIDAD ===');
console.log(JSON.stringify(serviciosConEspecialidad, null, 2));

// Simular lo que hace ReportesPage
console.log('\n=== SIMULANDO ReportesPage especialidades ===');
const especialidades = [...new Set(serviciosConEspecialidad.map(s => s.especialidad).filter(Boolean))];
console.log('Especialidades únicas:', especialidades);

// Simular las opciones del dropdown
console.log('\n=== OPCIONES DEL DROPDOWN ===');
const dropdownOptions = [
  { value: '', label: 'Todos los servicios' },
  ...especialidades.map(especialidad => ({ value: especialidad, label: especialidad }))
];

dropdownOptions.forEach(option => {
  console.log(`- ${option.value || 'EMPTY'}: "${option.label}"`);
});

console.log(`\n✅ Total de opciones: ${dropdownOptions.length}`);
console.log(`✅ Especialidades encontradas: ${especialidades.length}`);
