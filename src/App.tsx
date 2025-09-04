import { Routes, Route } from 'react-router-dom';
import { Calendar, Users, Stethoscope, Clock } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DoctoresPage from './pages/DoctoresPage';
import ServiciosPage from './pages/ServiciosPage';
import CitasPage from './pages/CitasPage';
import AgendarCitaPage from './pages/AgendarCitaPage';

// Navegación principal
export const navigation = [
  { name: 'Inicio', href: '/', icon: Calendar },
  { name: 'Doctores', href: '/doctores', icon: Users },
  { name: 'Servicios', href: '/servicios', icon: Stethoscope },
  { name: 'Citas', href: '/citas', icon: Clock },
  { name: 'Agendar Cita', href: '/agendar', icon: Calendar },
];

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex h-screen pt-16">
        <Sidebar navigation={navigation} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctores" element={<DoctoresPage />} />
              <Route path="/servicios" element={<ServiciosPage />} />
              <Route path="/citas" element={<CitasPage />} />
              <Route path="/agendar" element={<AgendarCitaPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
