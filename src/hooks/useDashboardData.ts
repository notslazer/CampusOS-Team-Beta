import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Role, StatCard, DashboardEvent } from '../types';

export interface DashboardData {
  stats: StatCard[];
  recentEvents: DashboardEvent[];
  announcements?: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
  memberStats?: {
    registeredEvents: number;
    achievements: number;
    badges: number;
  };
  leadStats?: {
    totalMembers: number;
    upcomingEvents: number;
    pendingApprovals: number;
    clubActivity: number;
  };
  facultyStats?: {
    totalClubs: number;
    totalEvents: number;
    totalMembers: number;
    pendingApprovals: number;
  };
}

interface UseDashboardDataOptions {
  skip?: boolean;
  refetchInterval?: number;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.skip || authLoading || !user) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const role = user.role as Role;
        const endpoint = `/api/dashboard/${role}`;

        const response = await api.get<DashboardData>(endpoint);
        setData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(new Error(errorMessage));
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchDashboardData();

    // Refetch interval if specified
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (options.refetchInterval && options.refetchInterval > 0) {
      intervalId = setInterval(fetchDashboardData, options.refetchInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, authLoading, options.skip, options.refetchInterval]);

  /**
   * Manual refetch function
   */
  const refetch = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const role = user.role as Role;
      const endpoint = `/api/dashboard/${role}`;

      const response = await api.get<DashboardData>(endpoint);
      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(new Error(errorMessage));
      console.error('Dashboard data refetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
