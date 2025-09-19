'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Plus, Edit, Trash2, Mail, Phone, Percent, Calendar, AlertTriangle, X, UserPlus, Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { ProfessionalForm } from '@/components/ProfessionalForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useGlobalData } from '@/hooks/useGlobalData';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';

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
  const { professionals, loading, deleteProfessional, loadProfessionals } = useGlobalData();
  const { isAdmin, canAccessProfessionals } = usePermissions();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    professional: Professional | null;
  }>({ open: false, professional: null });
  const [error, setError] = useState<string>('');
  const [company, setCompany] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    loadCompany();
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && !canAccessProfessionals) {
      router.push('/app/dashboard');
    }
  }, [loading, canAccessProfessionals, router]);

  const loadCompany = async () => {
    try {
      const companyData = await apiClient.getCompany();
      setCompany(companyData);
    } catch (error) {
      console.error('Error loading company:', error);
    }
  };

  const generateRegistrationCode = async () => {
    if (!company?.id) return;
    
    try {
      setGeneratingCode(true);
      const updatedCompany = await apiClient.generateRegistrationCode(company.id);
      setCompany(updatedCompany);
      console.log('✅ Registration code generated:', updatedCompany.registrationCode);
    } catch (error) {
      console.error('Error generating registration code:', error);
      setError('Erro ao gerar código de registro. Tente novamente.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyRegistrationCode = async () => {
    if (company?.registrationCode) {
      try {
        await navigator.clipboard.writeText(company.registrationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying code:', error);
      }
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
      setError('');
      await deleteProfessional(professional.id);
      setDeleteDialog({ open: false, professional: null });
    } catch (error: any) {
      console.error('Error deleting professional:', error);
      setError(error.message || 'Erro ao deletar profissional');
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

  // Show access denied message for non-admin users
  if (!canAccessProfessionals) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
              <p className="text-gray-600 mb-6">
                Apenas administradores podem acessar a gestão de profissionais.
              </p>
              <Button 
                onClick={() => router.push('/app/dashboard')}
                className="w-full"
              >
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
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
        <div className="flex items-center gap-3">

          <Button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Professional
          </Button>
        </div>
      </div>

      {/* Company Registration Code */}
      {company && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Professionals
            </CardTitle>
            <CardDescription>
              Share this code with professionals to join your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company.registrationCode ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">Company Registration Code</div>
                    <div className="font-mono text-lg font-semibold text-gray-900">
                      {company.registrationCode}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={copyRegistrationCode}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    Professionals can use this code to register and join your company at{' '}
                    <a href="/auth/register" className="text-zinc-600 hover:text-zinc-500 underline">
                      www.servify.com.br/auth/register
                    </a>
                  </p>
                  {company?.registrationCodeExpiresAt && (
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Code expires in {Math.ceil((new Date(company.registrationCodeExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">No Registration Code</h3>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Your company doesn&apos;t have a registration code yet. Click the button below to generate one automatically.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRegistrationCode}
                  disabled={generatingCode}
                  className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${generatingCode ? 'animate-spin' : ''}`} />
                  {generatingCode ? 'Gerando...' : 'Gerar Código'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Erro:</span>
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-700 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

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
