'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Calendar, 
  Users, 
  Tag, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  totalAppointments: number;
  totalServices: number;
  totalProfessionals: number;
  totalRevenue: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
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

export default function DashboardPage() {
  const router = useRouter();
  const { isAdmin, professionalId } = usePermissions();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalServices: 0,
    totalProfessionals: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Dashboard - isAdmin:', isAdmin);
      console.log('🔍 Dashboard - professionalId:', professionalId);
      
      const [appointments, services, professionals] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getServices(),
        apiClient.getProfessionals(),
      ]);

      // Ensure we have arrays
      const safeAppointments = Array.isArray(appointments) ? appointments : [];
      const safeServices = Array.isArray(services) ? services : [];
      const safeProfessionals = Array.isArray(professionals) ? professionals : [];

      console.log('🔍 Dashboard - Raw appointments:', safeAppointments);
      console.log('🔍 Dashboard - Raw services:', safeServices);
      console.log('🔍 Dashboard - Raw professionals:', safeProfessionals);

      // Calculate revenue based on user type
      let totalRevenue = 0;
      const completedAppointments = safeAppointments.filter(apt => apt.status === 'COMPLETED');
      
      if (isAdmin) {
        // Admin sees total revenue minus commissions
        totalRevenue = completedAppointments.reduce((sum, apt) => {
          const servicePrice = Number(apt.service?.price || 0);
          const professionalCommission = Number(apt.professional?.commission || 0);
          const commissionAmount = (servicePrice * professionalCommission) / 100;
          return sum + (servicePrice - commissionAmount);
        }, 0);
      } else {
        // Professional sees only their commission earnings
        const professionalAppointments = completedAppointments.filter(apt => 
          apt.professional?.id === professionalId
        );
        totalRevenue = professionalAppointments.reduce((sum, apt) => {
          const servicePrice = Number(apt.service?.price || 0);
          const professionalCommission = Number(apt.professional?.commission || 0);
          const commissionAmount = (servicePrice * professionalCommission) / 100;
          return sum + commissionAmount;
        }, 0);
      }

      // Filter appointments based on user permissions
      const filteredAppointments = isAdmin 
        ? safeAppointments 
        : safeAppointments.filter(apt => apt.professional?.id === professionalId);

      console.log('🔍 Dashboard - Filtered appointments:', filteredAppointments);
      console.log('🔍 Dashboard - professionalId for filtering:', professionalId);

      // Count appointments by status - using filtered appointments
      const pendingAppointments = filteredAppointments.filter(apt => apt.status === 'PENDING').length;
      const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'CONFIRMED').length;
      const completedAppointmentsCount = filteredAppointments.filter(apt => apt.status === 'COMPLETED').length;
      const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'CANCELLED').length;

      // Get recent appointments (last 10, sorted by start time) - filtered by permissions
      const sortedAppointments = filteredAppointments
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10);

      // Filter services and professionals based on user permissions
      const filteredServices = isAdmin 
        ? safeServices 
        : safeServices.filter(service => !service.professionalId || service.professionalId === professionalId);
      
      const filteredProfessionals = isAdmin 
        ? safeProfessionals 
        : safeProfessionals.filter(prof => prof.id === professionalId);

      const finalStats = {
        totalAppointments: filteredAppointments.length,
        totalServices: filteredServices.length,
        totalProfessionals: filteredProfessionals.length,
        totalRevenue,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments: completedAppointmentsCount,
        cancelledAppointments,
      };
      
      console.log('📊 Dashboard data loaded:', finalStats);
      console.log('📊 Raw appointments:', safeAppointments);
      setStats(finalStats);
      setRecentAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, professionalId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Completo', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? 'Overview of your business' : 'Overview of your professional activity'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-zinc-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Agendamentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">
                    {isAdmin ? 'Receita Líquida' : 'Comissões Ganhas'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">
                    {isAdmin ? 'Total de Serviços' : 'Meus Serviços'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total de Profissionais</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProfessionals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appointment Status Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status dos Agendamentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Confirmados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmedAppointments}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendamentos
            </CardTitle>
            <CardDescription>
              Gerencie sua agenda e reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 flex flex-col ">
              <Link href="/app/appointments">
                <Button className="w-full flex items-center justify-between">
                  Ver Agendamentos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/appointments">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Agendar Novo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Serviços
            </CardTitle>
            <CardDescription>
              Gerencie seus serviços e preços
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 flex flex-col">
              <Link href="/app/services">
                <Button className="w-full flex items-center justify-between">
                  Ver Serviços
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/services">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Serviço
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profissionais
              </CardTitle>
              <CardDescription>
                Gerencie sua equipe de profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 flex flex-col">
                <Link href="/app/professionals">
                  <Button className="w-full flex items-center justify-between">
                    Ver Profissionais
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app/professionals">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Profissional
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
