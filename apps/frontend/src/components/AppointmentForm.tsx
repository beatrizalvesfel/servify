'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useGlobalData } from '@/hooks/useGlobalData';
import { usePermissions } from '@/hooks/usePermissions';

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

interface AppointmentFormProps {
  appointment?: Appointment | null;
  selectedDate?: Date | null;
  professionalId?: string;
  serviceId?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AppointmentForm({ 
  appointment, 
  selectedDate, 
  professionalId, 
  serviceId, 
  onSubmit, 
  onCancel 
}: AppointmentFormProps) {
  const { services, professionals } = useGlobalData();
  const { isAdmin, professionalId: userProfessionalId } = usePermissions();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    startTime: '',
    endTime: '',
    notes: '',
    serviceId: '',
    professionalId: '',
  });

  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize form data based on user permissions
    if (!isAdmin && userProfessionalId) {
      setFormData(prev => ({ ...prev, professionalId: userProfessionalId }));
    }
  }, [isAdmin, userProfessionalId]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || '',
        clientEmail: appointment.clientEmail || '',
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        notes: appointment.notes || '',
        serviceId: appointment.service.id,
        professionalId: appointment.professional.id,
      });
    } else {
      // Reset form data for new appointment
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        startTime: '',
        endTime: '',
        notes: '',
        serviceId: '',
        professionalId: '',
      });
    }
  }, [appointment]);

  useEffect(() => {
    if (professionalId) {
      setFormData(prev => ({ ...prev, professionalId }));
    }
    if (serviceId) {
      setFormData(prev => ({ ...prev, serviceId }));
    }
  }, [professionalId, serviceId]);


  const loadAvailableSlots = useCallback(async () => {
    if (!formData.professionalId || !formData.serviceId || !selectedDate) return;
    
    try {
      setLoading(true);
      const date = selectedDate.toISOString().split('T')[0];
      const slots = await apiClient.getAvailableSlots(
        formData.professionalId,
        formData.serviceId,
        date
      );
      
      // Handle both old format (array) and new format (object)
      if (Array.isArray(slots)) {
        setAvailableSlots(slots);
        setOccupiedSlots([]);
        setAllSlots(slots);
      } else {
        setAvailableSlots((slots as any).available || []);
        setOccupiedSlots((slots as any).occupied || []);
        setAllSlots((slots as any).all || []);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoading(false);
    }
  }, [formData.professionalId, formData.serviceId, selectedDate]);

  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a time slot is selected for new appointments
    if (!appointment && (!formData.startTime || !formData.endTime)) {
      alert('Please select a time slot');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value;
    const service = services.find(s => s.id === serviceId);
    
    setFormData(prev => {
      // Only calculate endTime if we have both startTime and duration
      let endTime = prev.endTime;
      if (service && service.duration && prev.startTime) {
        try {
          const startDate = new Date(prev.startTime);
          if (!isNaN(startDate.getTime())) {
            const endDate = new Date(startDate.getTime() + service.duration * 60000);
            endTime = endDate.toISOString();
          }
        } catch (error) {
          console.error('Error calculating end time:', error);
        }
      }
      
      return {
        ...prev,
        serviceId,
        endTime,
      };
    });
  };

  const handleSlotSelect = (slot: any) => {
    if (!selectedDate) return;
    
    // Combine selected date with slot time
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const slotTime = slot.startTime.split('T')[1];
    const slotEndTime = slot.endTime.split('T')[1];
    
    setFormData(prev => ({
      ...prev,
      startTime: `${selectedDateStr}T${slotTime}`,
      endTime: `${selectedDateStr}T${slotEndTime}`,
    }));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</CardTitle>
            <CardDescription>
              {appointment ? 'Update appointment details' : 'Schedule a new appointment'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isAdmin ? (
              <div>
                <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional *
                </label>
                <Select
                  value={formData.professionalId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, professionalId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Professional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map(professional => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                  {professionals.find(p => p.id === userProfessionalId)?.name || 'You'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  As a professional, appointments will be created for you
                </p>
              </div>
            )}

            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => {
                  const selectedService = services.find(s => s.id === value);
                  if (selectedService) {
                    setFormData(prev => {
                      // Only calculate endTime if we have both startTime and duration
                      let endTime = prev.endTime;
                      if (selectedService.duration && prev.startTime) {
                        try {
                          const startDate = new Date(prev.startTime);
                          if (!isNaN(startDate.getTime())) {
                            const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
                            endTime = endDate.toISOString();
                          }
                        } catch (error) {
                          console.error('Error calculating end time:', error);
                        }
                      }
                      
                      return { 
                        ...prev, 
                        serviceId: value,
                        endTime
                      };
                    });
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="Client's full name"
              />
            </div>

            <div>
              <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Client Email
            </label>
            <input
              type="email"
              id="clientEmail"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              placeholder="client@example.com"
            />
          </div>

          {/* Selected Date Display */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Selecionada
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}

          {/* Time Slots */}
          {selectedDate && formData.professionalId && formData.serviceId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horários Disponíveis
              </label>
              {loading ? (
                <div className="text-center py-4 text-gray-500">Carregando horários...</div>
              ) : allSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {allSlots.map((slot, index) => {
                    const isSelected = formData.startTime && formData.startTime.includes(slot.startTime.split('T')[1]);
                    const isAvailable = slot.isAvailable;
                    const conflictType = slot.conflictType;
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => isAvailable && handleSlotSelect(slot)}
                        disabled={!isAvailable}
                        className={`p-2 text-xs border rounded gap-1 flex items-center justify-center transition-colors ${
                          !isAvailable
                            ? conflictType === 'occupied'
                              ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed'
                              : 'bg-orange-50 text-orange-400 border-orange-200 cursor-not-allowed'
                            : isSelected 
                              ? 'bg-zinc-800 text-white border-zinc-800' 
                              : 'border-zinc-300 hover:bg-zinc-50 hover:border-zinc-800'
                        }`}
                        title={!isAvailable ? (conflictType === 'occupied' ? 'Este horário já está ocupado' : 'Este horário não está disponível para este serviço') : ''}
                      >
                        {!isAvailable && (
                          <span className={`text-xs ${conflictType === 'occupied' ? 'text-red-500' : 'text-orange-500'}`}>
                            {conflictType === 'occupied' ? '●' : '⚠'}
                          </span>
                        )}
                        {formatTime(slot.startTime)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum horário disponível para esta data
                </div>
              )}
              
              {/* Legend */}
              {allSlots.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-zinc-800 rounded"></div>
                    <span>Selecionado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                      <span className="text-red-500 text-xs">●</span>
                    </div>
                    <span>Ocupado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
                      <span className="text-orange-500 text-xs">⚠</span>
                    </div>
                    <span>Conflito de duração</span>
                  </div>
                </div>
              )}
            </div>
          )}


          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              placeholder="Additional notes or special requests..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-zinc-800 text-white hover:bg-zinc-900"  disabled={loading}>
              {loading ? 'Loading...' : (appointment ? 'Update Appointment' : 'Create Appointment')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
