'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const { register } = useAuth();
  const [userType, setUserType] = useState<'company' | 'professional'>('company');
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    companyName: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    companyCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate required fields based on user type
    if (userType === 'company') {
      if (!formData.companyName.trim()) {
        setError('Company name is required');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('First name and last name are required');
        setLoading(false);
        return;
      }
      if (!formData.companyCode.trim()) {
        setError('Company code is required');
        setLoading(false);
        return;
      }
    }

    const result = await register({
      userType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
      email: formData.email,
      password: formData.password,
      companyCode: formData.companyCode,
    });
    
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-zinc-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-zinc-600 hover:text-zinc-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Create your account to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('company')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      userType === 'company'
                        ? 'border-zinc-500 bg-zinc-50 text-zinc-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Company Owner</div>
                    <div className="text-sm text-gray-600">Create your business</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('professional')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      userType === 'professional'
                        ? 'border-zinc-500 bg-zinc-50 text-zinc-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">Professional</div>
                    <div className="text-sm text-gray-600">Join a company</div>
                  </button>
                </div>
              </div>

              {/* Company Name (for company registration) */}
              {userType === 'company' && (
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                    placeholder="My Company"
                  />
                </div>
              )}

              {/* First Name and Last Name (for professional registration) */}
              {userType === 'professional' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              {/* Company Code (for professional registration) */}
              {userType === 'professional' && (
                <div>
                  <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                    Company Code
                  </label>
                  <input
                    id="companyCode"
                    name="companyCode"
                    type="text"
                    required
                    value={formData.companyCode}
                    onChange={handleChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                    placeholder="Enter company code"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ask your company administrator for the registration code
                  </p>
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  required
                />
                <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the{' '}
                  <Link href="/terms" className="text-zinc-600 hover:text-zinc-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-zinc-600 hover:text-zinc-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
