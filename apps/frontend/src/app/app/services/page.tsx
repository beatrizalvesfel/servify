'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Plus, Edit, Trash2, Clock, DollarSign, Tag } from 'lucide-react';
import { ServiceForm } from '@/components/ServiceForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    service: Service | null;
  }>({ open: false, service: null });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData: any) => {
    try {
      await apiClient.createService(serviceData);
      await loadServices();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleUpdateService = async (id: string, serviceData: any) => {
    try {
      await apiClient.updateService(id, serviceData);
      await loadServices();
      setEditingService(null);
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDeleteService = async (service: Service) => {
    try {
      await apiClient.deleteService(service.id);
      await loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const openDeleteDialog = (service: Service) => {
    setDeleteDialog({ open: true, service });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-2">Manage your service offerings</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <ServiceForm
            service={editingService}
            onSubmit={editingService ? 
              (data) => handleUpdateService(editingService.id, data) : 
              handleCreateService
            }
            onCancel={() => {
              setShowForm(false);
              setEditingService(null);
            }}
          />
        </div>
      )}

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first service to start managing appointments
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {service.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={service.isActive ? 'default' : 'secondary'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">{formatPrice(service.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{service.category}</span>
                  </div>
                  {service.appointments && service.appointments.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {service.appointments.length} appointment{service.appointments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingService(service);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(service)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, service: null })}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteDialog.service?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => deleteDialog.service && handleDeleteService(deleteDialog.service)}
      />
    </div>
  );
}
