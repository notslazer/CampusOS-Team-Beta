import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sz = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <Loader2 className={cn('animate-spin text-navy', sz[size], className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-beige" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-navy" />
        </div>
        <p className="text-sm font-medium text-ink-soft">Loading…</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer-bg rounded-lg', className)} />;
}

/**
 * SkeletonCard: Generic card skeleton placeholder
 */
export function SkeletonCard() {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  );
}

/**
 * SkeletonStatCard: Skeleton for stat cards
 */
export function SkeletonStatCard() {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}

/**
 * SkeletonTable: Skeleton for table rows
 */
export function SkeletonTableRow() {
  return (
    <tr className="border-b border-beige">
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-16" />
      </td>
    </tr>
  );
}

/**
 * SkeletonDashboard: Full dashboard loading skeleton with multiple sections
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-surface p-5">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Skeleton */}
        <div className="space-y-4">
          <div className="card-surface p-5">
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 space-y-3">
              {Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonEventCard: Skeleton for event cards
 */
export function SkeletonEventCard() {
  return (
    <div className="card-surface overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-1 h-3 w-5/6" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonList: Skeleton for a list of items
 */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array(count).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

