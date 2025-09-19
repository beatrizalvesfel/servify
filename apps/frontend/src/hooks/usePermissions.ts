'use client';

import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';
  const isProfessional = user?.role === 'USER';
  const canAccessProfessionals = isAdmin;
  const canCreateServices = true; // Both admin and professionals can create services
  const canViewAllAppointments = isAdmin;
  const canViewAllServices = isAdmin;

  return {
    isAdmin,
    isProfessional,
    canAccessProfessionals,
    canCreateServices,
    canViewAllAppointments,
    canViewAllServices,
    userRole: user?.role,
    professionalId: user?.professionalId,
  };
}

