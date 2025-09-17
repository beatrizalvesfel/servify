'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [appointments, services, professionals] = await Promise.all([
        apiClient.getAppointments(),
        apiClient.getServices(),
        apiClient.getProfessionals(),
      ]);

      // Ensure we have arrays
      const safeAppointments = Array.isArray(appointments) ? appointments : [];
      const safeServices = Array.isArray(services) ? services : [];
      const safeProfessionals = Array.isArray(professionals) ? professionals : [];

      // Calculate total revenue from COMPLETED appointments only
      const totalRevenue = safeAppointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + Number(apt.service?.price || 0), 0);

      // Count appointments by status - using direct filter approach
      const pendingAppointments = safeAppointments.filter(apt => apt.status === 'PENDING').length;
      const confirmedAppointments = safeAppointments.filter(apt => apt.status === 'CONFIRMED').length;
      const completedAppointments = safeAppointments.filter(apt => apt.status === 'COMPLETED').length;
      const cancelledAppointments = safeAppointments.filter(apt => apt.status === 'CANCELLED').length;

      // Get recent appointments (last 10, sorted by start time)
      const sortedAppointments = safeAppointments
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10);

      const finalStats = {
        totalAppointments: safeAppointments.length,
        totalServices: safeServices.length,
        totalProfessionals: safeProfessionals.length,
        totalRevenue,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
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
  };

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
            <p className="text-gray-600 mt-2">Overview of your business</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-sm font-medium text-green-600">Receita Total</p>
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
                  <p className="text-sm font-medium text-blue-600">Total de Serviços</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}
