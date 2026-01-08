/**
 * Entity Detail Page
 * @description Display comprehensive entity information
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { formatDate, getUrgencyLevel } from '../../utils/dateUtils';
import { clsx } from 'clsx';

interface Entity {
  id: string;
  name: string;
  legalName: string;
  entityType: string;
  jurisdiction: string;
  registrationNumber?: string;
  taxId?: string;
  status: 'active' | 'inactive' | 'pending' | 'dissolved';
  incorporationDate?: string;
  registeredAddress?: Address;
  businessAddress?: Address;
  directors?: Director[];
  compliance?: Compliance;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

interface Director {
  name: string;
  position: string;
  appointmentDate?: string;
  isActive: boolean;
}

interface Compliance {
  filingStatus: 'current' | 'overdue' | 'pending';
  lastAuditDate?: string;
  nextAuditDue?: string;
}

export const EntityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: entity, isLoading, error } = useQuery<Entity>({
    queryKey: ['entity', id],
    queryFn: async () => {
      const response = await api.get(`/entities/${id}?populate=true`);
      return response.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/entities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      navigate('/entities');
    },
  });

  if (isLoading) {
    return <EntityDetailSkeleton />;
  }

  if (error || !entity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entity Not Found</h2>
        <p className="text-gray-500 mt-2">The requested entity could not be found.</p>
        <Link to="/entities" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          ← Back to Entities
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{entity.name}</h1>
            <StatusBadge status={entity.status} />
          </div>
          <p className="text-gray-500 mt-1">{entity.legalName}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/entities/${id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => deleteMutation.mutate()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <dl className="space-y-3">
            <InfoRow label="Entity Type" value={entity.entityType} />
            <InfoRow label="Jurisdiction" value={entity.jurisdiction} />
            {entity.registrationNumber && (
              <InfoRow label="Registration #" value={entity.registrationNumber} />
            )}
            {entity.taxId && (
              <InfoRow label="Tax ID" value={entity.taxId} />
            )}
            {entity.incorporationDate && (
              <InfoRow label="Incorporated" value={formatDate(entity.incorporationDate)} />
            )}
          </dl>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Addresses</h2>
          {entity.registeredAddress && (
            <AddressBlock title="Registered Address" address={entity.registeredAddress} />
          )}
          {entity.businessAddress && (
            <AddressBlock title="Business Address" address={entity.businessAddress} />
          )}
        </div>

        {/* Compliance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Compliance</h2>
          {entity.compliance ? (
            <ComplianceInfo compliance={entity.compliance} />
          ) : (
            <p className="text-gray-500">No compliance information</p>
          )}
        </div>
      </div>

      {/* Directors */}
      {entity.directors && entity.directors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Directors</h2>
          <DirectorsList directors={entity.directors} />
        </div>
      )}
    </div>
  );
};

// Sub-components
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    dissolved: 'bg-red-100 text-red-800',
  };

  return (
    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', colors[status])}>
      {status}
    </span>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <dt className="text-gray-500">{label}</dt>
    <dd className="text-gray-900 font-medium capitalize">{value.replace('_', ' ')}</dd>
  </div>
);

const AddressBlock: React.FC<{ title: string; address: Address }> = ({ title, address }) => (
  <div className="mb-4 last:mb-0">
    <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
    <address className="text-gray-600 not-italic text-sm">
      {address.street && <div>{address.street}</div>}
      {address.city && <div>{address.city}{address.state && `, ${address.state}`}</div>}
      <div>{address.country} {address.postalCode}</div>
    </address>
  </div>
);

const ComplianceInfo: React.FC<{ compliance: Compliance }> = ({ compliance }) => {
  const urgency = compliance.nextAuditDue ? getUrgencyLevel(compliance.nextAuditDue) : 'normal';

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-500">Filing Status</span>
        <span className={clsx('font-medium', {
          'text-green-600': compliance.filingStatus === 'current',
          'text-red-600': compliance.filingStatus === 'overdue',
          'text-yellow-600': compliance.filingStatus === 'pending',
        })}>
          {compliance.filingStatus}
        </span>
      </div>
      {compliance.lastAuditDate && (
        <div className="flex justify-between">
          <span className="text-gray-500">Last Audit</span>
          <span className="text-gray-900">{formatDate(compliance.lastAuditDate)}</span>
        </div>
      )}
      {compliance.nextAuditDue && (
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Next Audit Due</span>
          <span className={clsx('font-medium', {
            'text-red-600': urgency === 'overdue',
            'text-orange-600': urgency === 'urgent',
            'text-yellow-600': urgency === 'soon',
            'text-gray-900': urgency === 'normal',
          })}>
            {formatDate(compliance.nextAuditDue)}
          </span>
        </div>
      )}
    </div>
  );
};

const DirectorsList: React.FC<{ directors: Director[] }> = ({ directors }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Appointed</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {directors.map((director, index) => (
          <tr key={index}>
            <td className="px-4 py-3 text-sm text-gray-900">{director.name}</td>
            <td className="px-4 py-3 text-sm text-gray-600">{director.position}</td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {director.appointmentDate ? formatDate(director.appointmentDate) : '-'}
            </td>
            <td className="px-4 py-3">
              <span className={clsx(
                'px-2 py-1 text-xs rounded-full',
                director.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              )}>
                {director.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EntityDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-12 bg-gray-200 rounded w-1/3 animate-pulse" />
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

export default EntityDetail;
