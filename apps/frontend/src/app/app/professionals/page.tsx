'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Plus, Edit, Trash2, Mail, Phone, Percent, Calendar } from 'lucide-react';
import { ProfessionalForm } from '@/components/ProfessionalForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    professional: Professional | null;
  }>({ open: false, professional: null });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfessional = async (professionalData: any) => {
    try {
      await apiClient.createProfessional(professionalData);
      await loadProfessionals();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating professional:', error);
    }
  };

  const handleUpdateProfessional = async (id: string, professionalData: any) => {
    try {
      await apiClient.updateProfessional(id, professionalData);
      await loadProfessionals();
      setEditingProfessional(null);
    } catch (error) {
      console.error('Error updating professional:', error);
    }
  };

  const handleDeleteProfessional = async (professional: Professional) => {
    try {
      await apiClient.deleteProfessional(professional.id);
      await loadProfessionals();
    } catch (error) {
      console.error('Error deleting professional:', error);
    }
  };

  const openDeleteDialog = (professional: Professional) => {
    setDeleteDialog({ open: true, professional });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading professionals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professionals</h1>
          <p className="text-gray-600 mt-2">Manage your team of service professionals</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Professional
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <ProfessionalForm
            professional={editingProfessional}
            onSubmit={editingProfessional ? 
              (data) => handleUpdateProfessional(editingProfessional.id, data) : 
              handleCreateProfessional
            }
            onCancel={() => {
              setShowForm(false);
              setEditingProfessional(null);
            }}
          />
        </div>
      )}

      {professionals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No professionals yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Add professionals to your team to start managing appointments
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Professional
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{professional.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Professional team member
                    </CardDescription>
                  </div>
                  <Badge variant={professional.isActive ? 'default' : 'secondary'}>
                    {professional.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 flex flex-col">
                  {professional.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{professional.email}</span>
                    </div>
                  )}
                  {professional.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{professional.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Percent className="h-4 w-4" />
                    <span>{professional.commission}% commission</span>
                  </div>
                  {professional.appointments && professional.appointments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{professional.appointments.length} appointment{professional.appointments.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProfessional(professional);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(professional)}
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
        onOpenChange={(open) => setDeleteDialog({ open, professional: null })}
        title="Delete Professional"
        description={`Are you sure you want to delete "${deleteDialog.professional?.name}"? This action cannot be undone and will remove all associated appointments.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => deleteDialog.professional && handleDeleteProfessional(deleteDialog.professional)}
      />
    </div>
  );
}
