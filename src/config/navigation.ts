import { Calendar, Users, Stethoscope, Clock, UserPlus, BarChart3 } from 'lucide-react';

// Navegación principal
export const navigation = [
  { name: 'Inicio', href: '/', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: UserPlus },
  { name: 'Doctores', href: '/doctores', icon: Users },
  { name: 'Servicios', href: '/servicios', icon: Stethoscope },
  { name: 'Citas', href: '/citas', icon: Clock },
  { name: 'Agendar Cita', href: '/agendar', icon: Calendar },
  { name: 'Reportes', href: '/reportes', icon: BarChart3 },
];
