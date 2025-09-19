'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { usePermissions } from './usePermissions'

interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  commission: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appointments?: any[];
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appointments?: any[];
}

interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
    category: string;
  };
  professional: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export function useGlobalData() {
  const { isAdmin, professionalId } = usePermissions()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const loadProfessionals = useCallback(async () => {
    // Only load professionals if user is admin
    if (!isAdmin) {
      setProfessionals([])
      return
    }
    
    try {
      const data = await apiClient.getProfessionals()
      setProfessionals(data)
    } catch (error) {
      console.error('Error loading professionals:', error)
      setProfessionals([])
    }
  }, [isAdmin])

  const loadServices = useCallback(async () => {
    try {
      const data = await apiClient.getServices()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    }
  }, [])

  const loadAppointments = useCallback(async (filters?: any) => {
    try {
      const data = await apiClient.getAppointments(filters)
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      // Only load professionals if user is admin
      const promises = [loadServices(), loadAppointments()]
      if (isAdmin) {
        promises.push(loadProfessionals())
      }
      
      await Promise.all(promises)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadProfessionals, loadServices, loadAppointments, isAdmin])

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      await apiClient.deleteAppointment(appointmentId)
      // Refresh all data to update appointment counts
      await refreshAll()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }, [refreshAll])

  const deleteProfessional = useCallback(async (professionalId: string) => {
    try {
      await apiClient.deleteProfessional(professionalId)
      await loadProfessionals()
    } catch (error) {
      console.error('Error deleting professional:', error)
      throw error
    }
  }, [loadProfessionals])

  const deleteService = useCallback(async (serviceId: string) => {
    try {
      await apiClient.deleteService(serviceId)
      await loadServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      throw error
    }
  }, [loadServices])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return {
    professionals,
    services,
    appointments,
    loading,
    loadProfessionals,
    loadServices,
    loadAppointments,
    refreshAll,
    deleteAppointment,
    deleteProfessional,
    deleteService,
  }
}
