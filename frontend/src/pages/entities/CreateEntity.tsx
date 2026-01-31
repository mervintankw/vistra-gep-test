/**
 * Create Entity Page
 * @description Form for creating new entities
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../utils/api';
import { FormInput } from '../../components/FormInput';
import { FormSelect } from '../../components/FormSelect';

const entitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  legalName: z.string().min(1, 'Legal name is required').max(300),
  entityType: z.enum(['corporation', 'llc', 'partnership', 'sole_proprietorship', 'trust', 'other']),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  incorporationDate: z.string().optional(),
  registeredAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().optional(),
  }).optional(),
});

type EntityFormData = z.infer<typeof entitySchema>;

const ENTITY_TYPES = [
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' },
];

const JURISDICTIONS = [
  'Singapore',
  'Hong Kong',
  'United Kingdom',
  'United States - Delaware',
  'United States - Nevada',
  'British Virgin Islands',
  'Cayman Islands',
  'Netherlands',
  'Luxembourg',
  'Ireland',
];

export const CreateEntity: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      entityType: 'corporation',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EntityFormData) => {
      const response = await api.post('/entities', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      navigate(`/entities/${data.id}`);
    },
  });

  const onSubmit = (data: EntityFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Entity</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <FormInput
              label="Entity Name"
              {...register('name')}
              error={errors.name?.message}
              required
            />
            <FormInput
              label="Legal Name"
              {...register('legalName')}
              error={errors.legalName?.message}
              required
            />
            <FormSelect
              label="Entity Type"
              {...register('entityType')}
              options={ENTITY_TYPES}
              error={errors.entityType?.message}
              required
            />
            <FormSelect
              label="Jurisdiction"
              {...register('jurisdiction')}
              options={JURISDICTIONS.map(j => ({ value: j, label: j }))}
              error={errors.jurisdiction?.message}
              required
            />
            <FormInput
              label="Registration Number"
              {...register('registrationNumber')}
              error={errors.registrationNumber?.message}
            />
            <FormInput
              label="Tax ID"
              {...register('taxId')}
              error={errors.taxId?.message}
            />
            <FormInput
              label="Incorporation Date"
              type="date"
              {...register('incorporationDate')}
              error={errors.incorporationDate?.message}
            />
          </div>
        </div>

        {/* Registered Address */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Registered Address</h2>
          <div className="space-y-4">
            <FormInput
              label="Street"
              {...register('registeredAddress.street')}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="City"
                {...register('registeredAddress.city')}
              />
              <FormInput
                label="State/Province"
                {...register('registeredAddress.state')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Country"
                {...register('registeredAddress.country')}
                error={errors.registeredAddress?.country?.message}
                required
              />
              <FormInput
                label="Postal Code"
                {...register('registeredAddress.postalCode')}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/entities')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Entity'}
          </button>
        </div>

        {createMutation.isError && (
          <div className="text-red-600 text-sm">
            Failed to create entity. Please try again.
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateEntity;
