'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Calendar, List, Filter, Check, X } from 'lucide-react';

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

export default function AppointmentsPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    professionalId: '',
    serviceId: '',
    status: '',
  });
  const [showCancelled, setShowCancelled] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    appointmentId: string;
    clientName: string;
    action: 'confirm' | 'cancel';
  }>({
    open: false,
    appointmentId: '',
    clientName: '',
    action: 'confirm',
  });

  useEffect(() => {
    loadAppointments();
  }, [filters, showCancelled]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAppointments(filters);
      // Filter out cancelled appointments if showCancelled is false
      const filteredData = showCancelled 
        ? data 
        : data.filter((appointment: Appointment) => appointment.status !== 'CANCELLED');
      setAppointments(filteredData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (appointmentId: string, clientName: string, action: 'confirm' | 'cancel') => {
    setStatusDialog({
      open: true,
      appointmentId,
      clientName,
      action,
    });
  };

  const handleStatusUpdate = async () => {
    try {
      const newStatus = statusDialog.action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
      await apiClient.updateAppointmentStatus(statusDialog.appointmentId, newStatus);
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === statusDialog.appointmentId 
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );
      
      setStatusDialog({ open: false, appointmentId: '', clientName: '', action: 'confirm' });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Erro ao atualizar status do agendamento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-zinc-100 text-zinc-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your appointment schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <AppointmentCalendar />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional
                  </label>
                  <select
                    value={filters.professionalId}
                    onChange={(e) => setFilters(prev => ({ ...prev, professionalId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Professionals</option>
                    {/* Add professional options here */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <select
                    value={filters.serviceId}
                    onChange={(e) => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Services</option>
                    {/* Add service options here */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mostrar agendamentos cancelados
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {Object.values(filters).some(f => f) 
                    ? 'Try adjusting your filters to see more appointments'
                    : 'Schedule your first appointment to get started'
                  }
                </p>
                <Button onClick={() => setView('calendar')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.clientName}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Service:</strong> {appointment.service.name}</p>
                            <p><strong>Professional:</strong> {appointment.professional.name}</p>
                            <p><strong>Price:</strong> {formatPrice(appointment.service.price)}</p>
                          </div>
                          <div>
                            <p><strong>Date & Time:</strong> {formatDateTime(appointment.startTime)}</p>
                            <p><strong>Duration:</strong> {appointment.service.duration} minutes</p>
                            {appointment.clientPhone && (
                              <p><strong>Phone:</strong> {appointment.clientPhone}</p>
                            )}
                            {appointment.clientEmail && (
                              <p><strong>Email:</strong> {appointment.clientEmail}</p>
                            )}
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {appointment.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => openStatusDialog(appointment.id, appointment.clientName, 'confirm')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => openStatusDialog(appointment.id, appointment.clientName, 'cancel')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                        {appointment.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => openStatusDialog(appointment.id, appointment.clientName, 'cancel')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {appointment.status === 'CANCELLED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => openStatusDialog(appointment.id, appointment.clientName, 'confirm')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Reagendar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Update Confirmation Dialog */}
      <ConfirmDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog(prev => ({ ...prev, open }))}
        title={statusDialog.action === 'confirm' ? 'Confirmar Agendamento' : 'Cancelar Agendamento'}
        description={
          statusDialog.action === 'confirm'
            ? `Tem certeza que deseja confirmar o agendamento de ${statusDialog.clientName}?`
            : `Tem certeza que deseja cancelar o agendamento de ${statusDialog.clientName}? O horário ficará disponível novamente.`
        }
        confirmText={statusDialog.action === 'confirm' ? 'Confirmar' : 'Cancelar'}
        cancelText="Cancelar"
        variant={statusDialog.action === 'confirm' ? 'default' : 'destructive'}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}
