/**
 * Dashboard Page
 * @description Main dashboard with entity overview and stats
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { StatCard } from '../components/StatCard';
import { EntityCard } from '../components/EntityCard';
import { ComplianceAlerts } from '../components/ComplianceAlerts';
import { RecentActivity } from '../components/RecentActivity';

interface DashboardStats {
  totalEntities: number;
  activeEntities: number;
  pendingEntities: number;
  complianceAlerts: number;
}

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });

  const { data: recentEntities, isLoading: entitiesLoading } = useQuery({
    queryKey: ['recent-entities'],
    queryFn: async () => {
      const response = await api.get('/entities?limit=5&sort=-createdAt');
      return response.data.data;
    },
  });

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/entities/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Entity
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Entities"
          value={stats?.totalEntities || 0}
          icon="building"
          color="blue"
        />
        <StatCard
          title="Active"
          value={stats?.activeEntities || 0}
          icon="check-circle"
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingEntities || 0}
          icon="clock"
          color="yellow"
        />
        <StatCard
          title="Compliance Alerts"
          value={stats?.complianceAlerts || 0}
          icon="exclamation"
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Entities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Entities
            </h2>
            <Link
              to="/entities"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>

          {entitiesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntities?.map((entity: any) => (
                <EntityCard key={entity.id} entity={entity} showCompliance={false} />
              ))}
            </div>
          )}
        </div>

        {/* Compliance Alerts Sidebar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Compliance Alerts
          </h2>
          <ComplianceAlerts limit={5} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <RecentActivity />
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
    <div className="grid grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

export default Dashboard;
