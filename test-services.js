// Test script para verificar el mapeo de especialidades
import axios from 'axios';

const API_BASE_URL = 'https://clinicadentalfunctions-aeezbtb0gva9fhbn.canadacentral-01.azurewebsites.net/api';

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

async function testServicesMapping() {
  try {
    console.log('🔄 Obteniendo servicios desde la API...');
    const response = await axios.get(`${API_BASE_URL}/services`, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const servicios = response.data;
    console.log('📦 Servicios recibidos:', servicios.length);
    
    const serviciosConEspecialidad = servicios.map((servicio) => {
      const especialidad = mapearEspecialidad(servicio.nombre);
      console.log(`🎯 "${servicio.nombre}" → "${especialidad}"`);
      return {
        ...servicio,
        especialidad
      };
    });
    
    const especialidades = [...new Set(serviciosConEspecialidad.map(s => s.especialidad))];
    console.log('\n✅ Especialidades únicas encontradas:');
    especialidades.forEach(e => console.log(`- ${e}`));
    
    console.log('\n📋 Dropdown options que deberían aparecer:');
    console.log('- Todos los servicios');
    especialidades.forEach(e => console.log(`- ${e}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testServicesMapping();
