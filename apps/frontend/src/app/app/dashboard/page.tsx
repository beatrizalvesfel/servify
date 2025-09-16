'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
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

export default function DashboardPage() {
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

      const totalRevenue = appointments
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + apt.service.price, 0);

      const appointmentStats = appointments.reduce((acc, apt) => {
        acc[`${apt.status.toLowerCase()}Appointments`] = (acc[`${apt.status.toLowerCase()}Appointments`] || 0) + 1;
        return acc;
      }, {} as any);

      setStats({
        totalAppointments: appointments.length,
        totalServices: services.length,
        totalProfessionals: professionals.length,
        totalRevenue,
        pendingAppointments: appointmentStats.pendingappointments || 0,
        confirmedAppointments: appointmentStats.confirmedappointments || 0,
        completedAppointments: appointmentStats.completedappointments || 0,
        cancelledAppointments: appointmentStats.cancelledappointments || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Calendar className="h-6 w-6 text-zinc-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Tag className="h-6 w-6 text-zinc-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Users className="h-6 w-6 text-zinc-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Professionals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProfessionals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Confirmed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-zinc-600">{stats.completedAppointments}</p>
              </div>
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-800">
                Completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</p>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Cancelled
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments
            </CardTitle>
            <CardDescription>
              Manage your appointment schedule and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/app/appointments">
                <Button className="w-full flex items-center justify-between">
                  View Appointments
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/appointments">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule New
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Services
            </CardTitle>
            <CardDescription>
              Manage your service offerings and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/app/services">
                <Button className="w-full flex items-center justify-between">
                  View Services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/services">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professionals
            </CardTitle>
            <CardDescription>
              Manage your team of service professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/app/professionals">
                <Button className="w-full flex items-center justify-between">
                  View Professionals
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/professionals">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Professional
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
