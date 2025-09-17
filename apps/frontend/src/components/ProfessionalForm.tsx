'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  commission: number;
  isActive: boolean;
}

interface ProfessionalFormProps {
  professional?: Professional | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProfessionalForm({ professional, onSubmit, onCancel }: ProfessionalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission: 0,
  });

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        email: professional.email || '',
        phone: professional.phone || '',
        commission: professional.commission,
      });
    }
  }, [professional]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty fields for updates
    const submitData = professional ? 
      Object.fromEntries(
        Object.entries(formData).filter(([key, value]) => {
          if (key === 'commission') return true; // Always include commission
          return value !== '' && value !== null && value !== undefined;
        })
      ) : formData;
    
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? e.target.checked : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{professional ? 'Edit Professional' : 'Add New Professional'}</CardTitle>
            <CardDescription>
              {professional ? 'Update professional information' : 'Add a new team member'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for login credentials
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="commission" className="block text-sm font-medium text-gray-700 mb-1">
              Commission Percentage *
            </label>
            <input
              type="number"
              id="commission"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Commission percentage (0-100) for this professional
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {professional ? 'Update Professional' : 'Create Professional'}
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
