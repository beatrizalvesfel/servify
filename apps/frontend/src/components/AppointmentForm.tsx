'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { apiClient } from '@/lib/api';

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
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    startTime: '',
    endTime: '',
    status: 'PENDING' as const,
    notes: '',
    serviceId: '',
    professionalId: '',
  });

  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServicesAndProfessionals();
  }, []);

  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || '',
        clientEmail: appointment.clientEmail || '',
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes || '',
        serviceId: appointment.service.id,
        professionalId: appointment.professional.id,
      });
    } else if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startTime: `${dateStr}T09:00:00`,
        endTime: `${dateStr}T10:00:00`,
      }));
    }
  }, [appointment, selectedDate]);

  useEffect(() => {
    if (professionalId) {
      setFormData(prev => ({ ...prev, professionalId }));
    }
    if (serviceId) {
      setFormData(prev => ({ ...prev, serviceId }));
    }
  }, [professionalId, serviceId]);

  const loadServicesAndProfessionals = async () => {
    try {
      const [servicesData, professionalsData] = await Promise.all([
        apiClient.getServices(),
        apiClient.getProfessionals(),
      ]);
      setServices(servicesData);
      setProfessionals(professionalsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!formData.professionalId || !formData.serviceId || !formData.startTime) return;
    
    try {
      setLoading(true);
      const date = formData.startTime.split('T')[0];
      const slots = await apiClient.getAvailableSlots(
        formData.professionalId,
        formData.serviceId,
        date
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableSlots();
  }, [formData.professionalId, formData.serviceId, formData.startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    setFormData(prev => ({
      ...prev,
      serviceId,
      endTime: service ? 
        new Date(new Date(prev.startTime).getTime() + service.duration * 60000).toISOString() :
        prev.endTime,
    }));
  };

  const handleSlotSelect = (slot: any) => {
    setFormData(prev => ({
      ...prev,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
            <div>
              <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-1">
                Professional *
              </label>
              <select
                id="professionalId"
                name="professionalId"
                value={formData.professionalId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Professional</option>
                {professionals.map(professional => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">
                Service *
              </label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Service</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="client@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Available Time Slots */}
          {availableSlots.length > 0 && !appointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className="p-2 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500"
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or special requests..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
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
