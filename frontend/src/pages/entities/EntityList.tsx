/**
 * Entity List Page
 * @description Display and filter list of entities
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { EntityCard } from '../../components/EntityCard';
import { SearchInput } from '../../components/SearchInput';
import { FilterDropdown } from '../../components/FilterDropdown';
import { Pagination } from '../../components/Pagination';
import { clsx } from 'clsx';

interface EntityFilters {
  search: string;
  entityType: string;
  jurisdiction: string;
  status: string;
}

const ENTITY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'trust', label: 'Trust' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'dissolved', label: 'Dissolved' },
];

export const EntityList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<EntityFilters>({
    search: searchParams.get('search') || '',
    entityType: searchParams.get('entityType') || '',
    jurisdiction: searchParams.get('jurisdiction') || '',
    status: searchParams.get('status') || '',
  });

  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading, error } = useQuery({
    queryKey: ['entities', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('name', filters.search);
      if (filters.entityType) params.set('entityType', filters.entityType);
      if (filters.jurisdiction) params.set('jurisdiction', filters.jurisdiction);
      if (filters.status) params.set('status', filters.status);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await api.get(`/entities?${params}`);
      return response.data;
    },
  });

  const handleFilterChange = (key: keyof EntityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load entities</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Entities</h1>
        <Link
          to="/entities/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Entity
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            placeholder="Search entities..."
          />
          <FilterDropdown
            options={ENTITY_TYPES}
            value={filters.entityType}
            onChange={(value) => handleFilterChange('entityType', value)}
          />
          <input
            type="text"
            placeholder="Jurisdiction"
            value={filters.jurisdiction}
            onChange={(e) => handleFilterChange('jurisdiction', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <FilterDropdown
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
        </div>
      </div>

      {/* Entity Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((entity: any) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>

          {data?.data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No entities found</p>
            </div>
          )}

          {data?.pagination && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EntityList;
