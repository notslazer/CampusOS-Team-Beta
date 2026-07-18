import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Role, StatCard, DashboardEvent } from '../types';

export function useCountUp(target: number, duration = 1200, start = true) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const startTs = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, start]);

  return value;
}

export function useScrollPosition() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = () => setMatches(m.matches);
    handler();
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

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

/**
 * useDashboardData Hook
 * 
 * Fetches role-specific dashboard data from the backend.
 * Automatically handles authentication and role-based API calls.
 * 
 * Usage:
 * ```tsx
 * const { data, isLoading, error, refetch } = useDashboardData();
 * ```
 * 
 * API Endpoints:
 * - Member: GET /api/dashboard/member
 * - Lead: GET /api/dashboard/lead
 * - Faculty: GET /api/dashboard/faculty
 */
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

