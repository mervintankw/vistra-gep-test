/**
 * Entity Card Component
 * @description Displays entity information in a card format
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { formatDate } from '../utils/dateUtils';

interface Entity {
  id: string;
  name: string;
  legalName: string;
  entityType: string;
  jurisdiction: string;
  status: 'active' | 'inactive' | 'pending' | 'dissolved';
  incorporationDate?: string;
  compliance?: {
    filingStatus: 'current' | 'overdue' | 'pending';
    nextAuditDue?: string;
  };
}

interface EntityCardProps {
  entity: Entity;
  showCompliance?: boolean;
  onSelect?: (entity: Entity) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  dissolved: 'bg-red-100 text-red-800',
};

const complianceColors = {
  current: 'text-green-600',
  overdue: 'text-red-600',
  pending: 'text-yellow-600',
};

export const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  showCompliance = true,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect?.(entity);
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
        onSelect && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link
            to={`/entities/${entity.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {entity.name}
          </Link>
          <p className="text-sm text-gray-500">{entity.legalName}</p>
        </div>
        <span
          className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColors[entity.status]
          )}
        >
          {entity.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Type:</span>
          <span className="ml-2 text-gray-900 capitalize">
            {entity.entityType.replace('_', ' ')}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Jurisdiction:</span>
          <span className="ml-2 text-gray-900">{entity.jurisdiction}</span>
        </div>
        {entity.incorporationDate && (
          <div>
            <span className="text-gray-500">Incorporated:</span>
            <span className="ml-2 text-gray-900">
              {formatDate(entity.incorporationDate)}
            </span>
          </div>
        )}
      </div>

      {showCompliance && entity.compliance && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Filing Status:</span>
            <span
              className={clsx(
                'font-medium',
                complianceColors[entity.compliance.filingStatus]
              )}
            >
              {entity.compliance.filingStatus}
            </span>
          </div>
          {entity.compliance.nextAuditDue && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Next Audit:</span>
              <span className="text-gray-900">
                {formatDate(entity.compliance.nextAuditDue)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntityCard;
