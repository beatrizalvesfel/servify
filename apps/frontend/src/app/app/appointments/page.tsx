'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Calendar, List, Filter, Check, X, Clock } from 'lucide-react';
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

export default function AppointmentsPage() {
  const { professionals, services } = useGlobalData();
  const { isAdmin, professionalId } = usePermissions();
  const [view, setView] = useState<'calendar' | 'list' | 'timeline'>('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    professionalId: '',
    serviceId: '',
    status: '',
  });
  const [showCancelled, setShowCancelled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      // Create filters object for API call
      const apiFilters = { ...filters };
      
      // For professionals, only show their own appointments
      if (!isAdmin && professionalId) {
        apiFilters.professionalId = professionalId;
        console.log('🔍 Professional filter applied:', professionalId);
        console.log('🔍 isAdmin:', isAdmin);
        console.log('🔍 professionalId from usePermissions:', professionalId);
        console.log('🔍 apiFilters before API call:', apiFilters);
      } else if (isAdmin) {
        console.log('🔍 Admin - showing all appointments');
        console.log('🔍 isAdmin:', isAdmin);
        console.log('🔍 apiFilters before API call:', apiFilters);
      } else {
        console.log('🔍 No professional filter - isAdmin:', isAdmin, 'professionalId:', professionalId);
        console.log('🔍 apiFilters before API call:', apiFilters);
      }
      
      // Clean up 'all' values
      if (apiFilters.professionalId === 'all') {
        apiFilters.professionalId = '';
      }
      if (apiFilters.serviceId === 'all') {
        apiFilters.serviceId = '';
      }
      if (apiFilters.status === 'all') {
        apiFilters.status = '';
      }
      
      console.log('🔍 Loading appointments with filters:', apiFilters);
      const data = await apiClient.getAppointments(apiFilters);
      console.log('📅 Received appointments:', data.length);
      console.log('📅 All appointments data:', data);
      
      // Apply frontend filter for cancelled appointments if needed
      const filteredData = showCancelled 
        ? data 
        : data.filter((appointment: Appointment) => appointment.status !== 'CANCELLED');
      
      console.log('✅ Final filtered appointments:', filteredData.length);
      console.log('✅ Final appointments data:', filteredData);
      setAppointments(filteredData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, showCancelled, isAdmin, professionalId]);

  // Initialize filters based on user role
  useEffect(() => {
    if (!isAdmin && professionalId) {
      setFilters(prev => ({
        ...prev,
        professionalId: professionalId
      }));
    }
  }, [isAdmin, professionalId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Filter appointments for timeline view
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    console.log('🔍 getAppointmentsForDate - Looking for date:', dateStr);
    console.log('🔍 getAppointmentsForDate - Total appointments:', appointments.length);
    console.log('🔍 getAppointmentsForDate - All appointments:', appointments);
    
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime).toISOString().split('T')[0];
      console.log('🔍 Comparing dates:', appointmentDate, '===', dateStr, '?', appointmentDate === dateStr);
      console.log('🔍 Appointment details:', {
        id: appointment.id,
        clientName: appointment.clientName,
        startTime: appointment.startTime,
        appointmentDate,
        targetDate: dateStr
      });
      return appointmentDate === dateStr;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    console.log('🔍 getAppointmentsForDate - Filtered appointments:', filtered.length);
    console.log('🔍 getAppointmentsForDate - Filtered appointments data:', filtered);
    return filtered;
  };

  // Get appointments for selected date or today
  const timelineAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : getAppointmentsForDate(new Date());

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
            <Button
              variant={view === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('timeline')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Timeline
            </Button>
          </div>
      </div>

      {view === 'calendar' ? (
        <AppointmentCalendar />
      ) : view === 'timeline' ? (
        <div className="space-y-6">
          {/* Date Selector for Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Timeline
              </CardTitle>
              <CardDescription>
                View appointments for a specific day in timeline format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {timelineAppointments.length} appointment{timelineAppointments.length !== 1 ? 's' : ''} scheduled
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline View */}
          {timelineAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments scheduled</h3>
                <p className="text-gray-600 text-center mb-4">
                  {selectedDate ? 
                    `No appointments found for ${selectedDate.toLocaleDateString()}` :
                    'No appointments found for today'
                  }
                </p>
                <Button onClick={() => setView('calendar')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm">
              {/* Timeline Header */}
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedDate ? selectedDate.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Today'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Timeline view of all scheduled appointments
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {timelineAppointments.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      appointment{timelineAppointments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Container */}
              <div className="relative">
                {/* Professional Columns (Admin) or Single Column (Professional) */}
                <div>
                  {isAdmin && professionals.length > 1 ? (
                    // Multi-professional view
                    <div className="flex">
                      {professionals.map((professional, profIndex) => {
                        const professionalAppointments = timelineAppointments.filter(
                          apt => apt.professional.id === professional.id
                        );
                        
                        return (
                          <div key={professional.id} className="flex-1 border-r border-gray-200 last:border-r-0">
                            {/* Professional Header */}
                            <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-800 truncate px-2">
                                {professional.name}
                              </span>
                            </div>
                            
                            {/* Professional Timeline */}
                            <div className="relative" style={{ height: '600px' }}>
                              {/* Hour Lines */}
                              {Array.from({ length: 24 }, (_, i) => (
                                <div 
                                  key={i} 
                                  className="absolute w-full border-b border-gray-100"
                                  style={{ top: `${(i / 24) * 100}%` }}
                                />
                              ))}
                              
                              {/* Appointments for this professional */}
                              {professionalAppointments.map((appointment) => {
                                const startTime = new Date(appointment.startTime);
                                const endTime = new Date(appointment.endTime);
                                
                                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                                const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                                const duration = endHour - startHour;
                                
                                const top = (startHour / 24) * 100;
                                const height = (duration / 24) * 100;
                                
                                const getBarColor = (status: string) => {
                                  switch (status) {
                                    case 'PENDING': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-600';
                                    case 'CONFIRMED': return 'bg-gradient-to-r from-green-400 to-green-500 border-green-600';
                                    case 'COMPLETED': return 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-600';
                                    case 'CANCELLED': return 'bg-gradient-to-r from-red-400 to-red-500 border-red-600';
                                    default: return 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-600';
                                  }
                                };

                                return (
                                  <div
                                    key={appointment.id}
                                    className={`absolute left-2 right-2 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer group ${getBarColor(appointment.status)}`}
                                    style={{
                                      top: `${top}%`,
                                      height: `${Math.max(height, 4)}%`,
                                    }}
                                  >
                                    {/* Appointment Content */}
                                    <div className="p-3 h-full flex flex-col justify-center text-white relative">
                                      {/* Main Info */}
                                      <div className="text-center mb-2">
                                        <div className="font-bold text-sm leading-tight text-white drop-shadow-lg">
                                          {appointment.clientName}
                                        </div>
                                        <div className="text-xs text-white drop-shadow-lg opacity-90">
                                          {appointment.service.name}
                                        </div>
                                      </div>
                                      
                                      {/* Time Line - Below the appointment */}
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="text-xs font-bold bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                                          {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-white">-</div>
                                        <div className="text-xs font-bold bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                                          {endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      </div>
                                      
                                      {/* Status Badge */}
                                      <div className="mt-2 text-center">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-25 text-white">
                                          {appointment.status === 'PENDING' && 'Pendente'}
                                          {appointment.status === 'CONFIRMED' && 'Confirmado'}
                                          {appointment.status === 'COMPLETED' && 'Concluído'}
                                          {appointment.status === 'CANCELLED' && 'Cancelado'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="flex gap-2">
                                        {appointment.status === 'PENDING' && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openStatusDialog(appointment.id, appointment.clientName, 'confirm');
                                              }}
                                            >
                                              <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openStatusDialog(appointment.id, appointment.clientName, 'cancel');
                                              }}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                        {appointment.status === 'CONFIRMED' && (
                                          <Button
                                            size="sm"
                                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openStatusDialog(appointment.id, appointment.clientName, 'cancel');
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
                                        {appointment.status === 'CANCELLED' && (
                                          <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openStatusDialog(appointment.id, appointment.clientName, 'confirm');
                                            }}
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Single professional view
                    <div className="relative" style={{ height: '600px' }}>
                      {/* Hour Lines */}
                      {Array.from({ length: 24 }, (_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full border-b border-gray-100"
                          style={{ top: `${(i / 24) * 100}%` }}
                        />
                      ))}
                      
                      {/* Appointments */}
                      {timelineAppointments.map((appointment) => {
                        const startTime = new Date(appointment.startTime);
                        const endTime = new Date(appointment.endTime);
                        
                        const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                        const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                        const duration = endHour - startHour;
                        
                        const top = (startHour / 24) * 100;
                        const height = (duration / 24) * 100;
                        
                        const getBarColor = (status: string) => {
                          switch (status) {
                            case 'PENDING': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-600';
                            case 'CONFIRMED': return 'bg-gradient-to-r from-green-400 to-green-500 border-green-600';
                            case 'COMPLETED': return 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-600';
                            case 'CANCELLED': return 'bg-gradient-to-r from-red-400 to-red-500 border-red-600';
                            default: return 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-600';
                          }
                        };

                        return (
                          <div
                            key={appointment.id}
                            className={`absolute left-4 right-4 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer group ${getBarColor(appointment.status)}`}
                            style={{
                              top: `${top}%`,
                              height: `${Math.max(height, 4)}%`,
                            }}
                          >
                            {/* Appointment Content */}
                            <div className="p-3 h-full flex flex-col justify-center text-white relative">
                              {/* Main Info */}
                              <div className="text-center mb-2">
                                <div className="font-bold text-sm leading-tight text-white drop-shadow-lg">
                                  {appointment.clientName}
                                </div>
                                <div className="text-xs text-white drop-shadow-lg opacity-90">
                                  {appointment.service.name}
                                </div>
                              </div>
                              
                              {/* Time Line - Below the appointment */}
                              <div className="flex items-center justify-center gap-2">
                                <div className="text-xs font-bold bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                                  {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-xs text-white">-</div>
                                <div className="text-xs font-bold bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                                  {endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="mt-2 text-center">
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-white bg-opacity-25 text-white">
                                  {appointment.status === 'PENDING' && 'Pendente'}
                                  {appointment.status === 'CONFIRMED' && 'Confirmado'}
                                  {appointment.status === 'COMPLETED' && 'Concluído'}
                                  {appointment.status === 'CANCELLED' && 'Cancelado'}
                                </span>
                              </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                {appointment.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openStatusDialog(appointment.id, appointment.clientName, 'confirm');
                                      }}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openStatusDialog(appointment.id, appointment.clientName, 'cancel');
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                {appointment.status === 'CONFIRMED' && (
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStatusDialog(appointment.id, appointment.clientName, 'cancel');
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                                {appointment.status === 'CANCELLED' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openStatusDialog(appointment.id, appointment.clientName, 'confirm');
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="p-6 border-t bg-gray-50">
                <div className="space-y-4">
                  {/* Status Legend */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Status dos Agendamentos</h4>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded border border-yellow-600"></div>
                        <span className="font-medium">Pendente</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded border border-green-600"></div>
                        <span className="font-medium">Confirmado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded border border-blue-600"></div>
                        <span className="font-medium">Concluído</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded border border-red-600"></div>
                        <span className="font-medium">Cancelado</span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Legend (only for admin) */}
                  {isAdmin && professionals.length > 1 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Profissionais</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {professionals.map((professional, index) => (
                          <div key={professional.id} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ 
                                backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)` 
                              }}
                            ></div>
                            <span className="font-medium">{professional.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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
                <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional
                      </label>
                      <Select
                        value={filters.professionalId || "all"}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, professionalId: value === "all" ? "" : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Professionals" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Professionals</SelectItem>
                          {professionals.map((professional) => (
                            <SelectItem key={professional.id} value={professional.id}>
                              {professional.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service
                    </label>
                    <Select
                      value={filters.serviceId || "all"}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, serviceId: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Select
                      value={filters.status || "all"}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ professionalId: '', serviceId: '', status: '' });
                      setShowCancelled(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpar Filtros
                  </Button>
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
