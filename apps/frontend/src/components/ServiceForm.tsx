'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useGlobalData } from '@/hooks/useGlobalData';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  professionalId?: string;
  professional?: {
    id: string;
    name: string;
  };
}

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const { isAdmin, professionalId } = usePermissions();
  const { professionals } = useGlobalData();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: '',
    isActive: true,
    professionalId: isAdmin ? 'general' : (professionalId || 'general'),
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive,
        professionalId: service.professionalId || 'general',
      });
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: '',
        isActive: true,
        professionalId: isAdmin ? 'general' : (professionalId || ''),
      });
    }
  }, [service, isAdmin, professionalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For professionals, ensure they can only create services for themselves
    const finalProfessionalId = isAdmin 
      ? (formData.professionalId === 'general' || formData.professionalId === '' ? null : formData.professionalId)
      : professionalId; // Professionals can only create services for themselves
    
    // Prepare submit data
    const submitData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      isActive: formData.isActive,
      professionalId: finalProfessionalId,
    };
    
    console.log('🔧 ServiceForm submitData:', submitData);
    console.log('🔧 finalProfessionalId:', finalProfessionalId);
    console.log('🔧 isAdmin:', isAdmin);
    console.log('🔧 professionalId:', professionalId);
    
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
            <CardDescription>
              {service ? 'Update service information' : 'Create a new service offering'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="e.g., Haircut, Massage, Consultation"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="e.g., Beauty, Wellness, Medical"
              />
            </div>
          </div>

          {/* Professional selection - different for admins vs professionals */}
          {isAdmin ? (
            <div>
              <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700 mb-1">
                Professional (Optional)
              </label>
              <Select
                value={formData.professionalId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, professionalId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a professional (leave empty for general service)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Service (All Professionals)</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to create a general service available to all professionals
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Owner
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                This service will be created for you
              </div>
              <p className="text-xs text-gray-500 mt-1">
                As a professional, you can only create services for yourself
              </p>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
              placeholder="Describe what this service includes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
            />
            <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Service is active and available for booking
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {service ? 'Update Service' : 'Create Service'}
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
