'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Mail } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';

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

interface AppointmentCalendarProps {
  professionalId?: string;
  serviceId?: string;
}

export function AppointmentCalendar({ professionalId, serviceId }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, professionalId, serviceId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const filters: any = {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0],
      };
      
      if (professionalId) filters.professionalId = professionalId;
      if (serviceId) filters.serviceId = serviceId;
      
      const data = await apiClient.getAppointments(filters);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      await apiClient.createAppointment(appointmentData);
      await loadAppointments();
      setShowForm(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateAppointment = async (id: string, appointmentData: any) => {
    try {
      await apiClient.updateAppointment(id, appointmentData);
      await loadAppointments();
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await apiClient.deleteAppointment(id);
      await loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.updateAppointmentStatus(id, status);
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.startTime.startsWith(dateStr)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24 border-r border-b last:border-r-0" />;
              }
              
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={date.toISOString()}
                  className={`h-24 border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map(appointment => (
                      <div
                        key={appointment.id}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(appointment.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAppointment(appointment);
                          setShowForm(true);
                        }}
                      >
                        {formatTime(appointment.startTime)} - {appointment.clientName}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AppointmentForm
              appointment={editingAppointment}
              selectedDate={selectedDate}
              professionalId={professionalId}
              serviceId={serviceId}
              onSubmit={editingAppointment ? 
                (data) => handleUpdateAppointment(editingAppointment.id, data) : 
                handleCreateAppointment
              }
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
                setSelectedDate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
