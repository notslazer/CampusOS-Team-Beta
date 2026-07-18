# CampusOS Architecture Documentation

## Overview

This document details the new architectural components implemented for the CampusOS full-stack MERN application, including role-based access control (RBAC), dashboard integration, event management, and error handling.

---

## 1. Role-Based Access Control (RBAC)

### ProtectedRoute Component

**Location:** `src/routes/ProtectedRoute.tsx`

The `ProtectedRoute` component enforces role-based access control and prevents unauthorized access to protected resources.

#### Features:
- Authentication status checking
- Role validation against allowed roles
- Loading state handling during auth initialization
- Flexible redirect options (403 Forbidden page or fallback dashboard)

#### Usage Examples:

```tsx
import { ProtectedRoute } from './routes/ProtectedRoute';

// Basic protection - only authenticated users
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />

// Role-specific protection
<Route path="/lead" element={
  <ProtectedRoute allowedRoles={['lead']}>
    <LeadDashboard />
  </ProtectedRoute>
} />

// Multiple allowed roles
<Route path="/members" element={
  <ProtectedRoute allowedRoles={['lead', 'faculty']}>
    <MembersPage />
  </ProtectedRoute>
} />

// With custom 403 behavior
<Route path="/admin" element={
  <ProtectedRoute 
    allowedRoles={['faculty']} 
    showForbidden={true}
  >
    <AdminPanel />
  </ProtectedRoute>
} />
```

#### Props:
- `children`: React component to render if authorized
- `allowedRoles?`: Array of role types allowed ('member', 'lead', 'faculty')
- `showForbidden?`: Show 403 page (default: true) or redirect to dashboard (false)

---

## 2. Dashboard API Integration

### useDashboardData Hook

**Location:** `src/hooks/index.ts` and `src/hooks/useDashboardData.ts`

Custom hook for fetching role-specific dashboard data from the backend with automatic error handling and refetch capability.

#### Features:
- Automatic role detection from auth context
- Configurable refetch intervals
- Manual refetch function
- Comprehensive error handling
- TypeScript support

#### API Endpoints:
- `GET /api/dashboard/member` - Member dashboard data
- `GET /api/dashboard/lead` - Lead dashboard data
- `GET /api/dashboard/faculty` - Faculty dashboard data

#### Usage Examples:

```tsx
import { useDashboardData } from '../hooks';
import { SkeletonDashboard, PageLoader } from '../components/ui/Feedback';

function MemberDashboard() {
  const { data, isLoading, error, refetch } = useDashboardData();

  // Loading state
  if (isLoading) {
    return <SkeletonDashboard />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <p>Failed to load dashboard: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  // Success state
  return (
    <div>
      {/* Render dashboard with data */}
      <div className="grid grid-cols-4 gap-4">
        {data?.stats.map(stat => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>
      
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}
```

#### With Options:

```tsx
// Auto-refetch every 30 seconds
const { data, isLoading } = useDashboardData({ 
  refetchInterval: 30000 
});

// Skip fetching initially
const { data, isLoading, refetch } = useDashboardData({ 
  skip: true 
});

// Later, manually fetch when needed
useEffect(() => {
  refetch();
}, [triggerCondition]);
```

#### Returned Object:
```typescript
{
  data: DashboardData | null,      // Role-specific dashboard data
  isLoading: boolean,               // Loading state
  error: Error | null,              // Error if any
  refetch: () => Promise<void>      // Manual refetch function
}
```

---

## 3. Event Management Service

### eventsService with Zod Validation

**Location:** `src/services/eventsService.ts`

Service for handling all event-related operations with built-in Zod schema validation.

#### Features:
- TypeScript type safety
- Zod schema validation
- Comprehensive error handling
- Full CRUD operations
- Member registration handling

#### Schema Validation:

```tsx
import { eventCreationSchema, type EventCreationPayload } from '../services/eventsService';

// The schema enforces:
// - title: 3-100 characters
// - description: 10-2000 characters  
// - date: Future date only
// - location: 2-200 characters (optional)
// - category: Enum of specific types (optional)
// - capacity: 1-10000 (optional)
// - posterUrl: Valid URL (optional)
// - tags: Max 10 tags (optional)
```

#### Create Event Example:

```tsx
import { eventsService, type EventCreationPayload } from '../services/eventsService';
import { useToast } from '../context/ToastContext';

function CreateEventForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: EventCreationPayload) => {
    try {
      setIsLoading(true);
      
      // Validation happens automatically via Zod
      const event = await eventsService.createEvent({
        title: 'React Workshop',
        description: 'Learn advanced React patterns and hooks',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Room 101',
        category: 'tech',
        capacity: 50,
        posterUrl: 'https://example.com/poster.jpg',
        tags: ['react', 'workshop']
      });

      toast({
        title: 'Success',
        description: 'Event created successfully',
        variant: 'success'
      });

      return event;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create event';
      
      toast({
        title: 'Error',
        description: message,
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Form component
  );
}
```

#### Full API Reference:

```typescript
// Create event
await eventsService.createEvent(payload: EventCreationPayload): Promise<EventResponse>

// Update event
await eventsService.updateEvent(eventId: string, payload: Partial<EventCreationPayload>): Promise<EventResponse>

// Delete event
await eventsService.deleteEvent(eventId: string): Promise<void>

// Get single event
await eventsService.getEvent(eventId: string): Promise<EventResponse>

// Get all events with filters
await eventsService.getEvents(filters?: {
  category?: string;
  clubId?: string;
  skip?: number;
  limit?: number;
}): Promise<EventResponse[]>

// Register for event (Member)
await eventsService.registerForEvent(eventId: string): Promise<EventResponse>

// Unregister from event (Member)
await eventsService.unregisterFromEvent(eventId: string): Promise<void>
```

---

## 4. Error Boundary

### ErrorBoundary Component

**Location:** `src/components/ErrorBoundary.tsx`

Global error boundary to catch React component errors and display a user-friendly error page.

#### Features:
- Catches render errors
- Displays error details in development
- User-friendly error UI
- Recovery actions (Try Again, Go Home)

#### Usage:

The ErrorBoundary is already wrapping the entire app in `src/App.tsx`:

```tsx
<ErrorBoundary>
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        {/* Routes */}
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
</ErrorBoundary>
```

#### Custom Usage:

```tsx
import { ErrorBoundary } from '../components/ErrorBoundary';

function Dashboard() {
  return (
    <ErrorBoundary>
      <div className="p-6">
        {/* Dashboard content */}
      </div>
    </ErrorBoundary>
  );
}
```

---

## 5. Loading Skeletons

### Skeleton Components

**Location:** `src/components/ui/Feedback.tsx`

Comprehensive collection of skeleton loaders to prevent white-screen flashes during data loading.

#### Available Skeletons:

```tsx
import { 
  Skeleton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTableRow,
  SkeletonDashboard,
  SkeletonEventCard,
  SkeletonList,
  PageLoader,
  Spinner
} from '../components/ui/Feedback';

// Generic skeleton - customize with className
<Skeleton className="h-10 w-32" />

// Card skeleton
<SkeletonCard />

// Stat card skeleton
<SkeletonStatCard />

// Table row skeleton
<SkeletonTableRow />

// Full dashboard layout
<SkeletonDashboard />

// Event card skeleton
<SkeletonEventCard />

// List of items
<SkeletonList count={5} />

// Page-wide loader
<PageLoader />

// Spinner icon
<Spinner size="md" />
```

#### Usage Pattern:

```tsx
function MemberDashboard() {
  const { data, isLoading, error } = useDashboardData();

  // Show skeleton during loading
  if (isLoading) {
    return <SkeletonDashboard />;
  }

  // Show error
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // Show actual content
  return (
    <div className="space-y-6">
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 6. 403 Forbidden Page

### ForbiddenPage Component

**Location:** `src/pages/ForbiddenPage.tsx`

User-friendly 403 error page displayed when unauthorized users try to access protected resources.

#### Features:
- Role-aware redirect to dashboard
- Back navigation
- Clear explanation of access restriction

#### Usage:

Automatically shown by ProtectedRoute when `showForbidden={true}` and user lacks required role:

```tsx
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['faculty']} showForbidden={true}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Accessing as non-faculty user → ForbiddenPage shown
```

Manual access:

```tsx
import ForbiddenPage from '../pages/ForbiddenPage';

<ForbiddenPage />
```

---

## Integration Example: Complete Dashboard Setup

```tsx
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useDashboardData } from './hooks';
import { SkeletonDashboard, PageLoader } from './components/ui/Feedback';

function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error.message}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data?.stats.map(stat => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Recent Events */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.recentEvents.map(event => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Route configuration
<Route path="/app/member" element={
  <ProtectedRoute allowedRoles={['member', 'lead', 'faculty']}>
    <DashboardPage />
  </ProtectedRoute>
} />
```

---

## Backend Implementation Guide

### Expected API Response Format

```typescript
// GET /api/dashboard/member
{
  stats: [
    { id: '1', label: 'Events', value: 5, suffix: '', icon: 'calendar' },
    { id: '2', label: 'Badges', value: 3, delta: 1, icon: 'award' }
  ],
  recentEvents: [
    { 
      id: '1', 
      title: 'React Workshop', 
      time: '2024-08-01T10:00:00Z', 
      location: 'Room 101', 
      category: 'tech', 
      attendees: 45 
    }
  ],
  memberStats: {
    registeredEvents: 5,
    achievements: 12,
    badges: 3
  }
}

// GET /api/dashboard/lead
{
  stats: [
    { id: '1', label: 'Members', value: 125, icon: 'users' },
    { id: '2', label: 'Events', value: 8, delta: 2, icon: 'calendar' }
  ],
  recentEvents: [...],
  leadStats: {
    totalMembers: 125,
    upcomingEvents: 8,
    pendingApprovals: 3,
    clubActivity: 92
  }
}

// GET /api/dashboard/faculty
{
  stats: [...],
  recentEvents: [...],
  facultyStats: {
    totalClubs: 45,
    totalEvents: 156,
    totalMembers: 3500,
    pendingApprovals: 12
  }
}
```

### Event Creation Endpoint

```typescript
// POST /api/events
Request Body (validated with Zod schema):
{
  title: string,              // Required: 3-100 chars
  description: string,        // Required: 10-2000 chars
  date: string,               // Required: ISO date, future only
  location?: string,          // Optional: 2-200 chars
  category?: string,          // Optional: enum
  capacity?: number,          // Optional: 1-10000
  posterUrl?: string,         // Optional: valid URL
  tags?: string[]             // Optional: max 10
}

Response:
{
  id: string,
  title: string,
  description: string,
  date: string,
  location?: string,
  category?: string,
  capacity?: number,
  attendees: number,
  posterUrl?: string,
  tags?: string[],
  createdBy: string,
  createdAt: string,
  updatedAt: string
}
```

---

## Testing Checklist

- [x] ProtectedRoute redirects unauthenticated users to login
- [x] ProtectedRoute blocks unauthorized roles
- [x] ProtectedRoute shows 403 page when appropriate
- [x] useDashboardData fetches role-specific data
- [x] useDashboardData handles errors gracefully
- [x] eventsService validates input with Zod
- [x] eventsService handles CRUD operations
- [x] ErrorBoundary catches render errors
- [x] Loading skeletons prevent white-screen flash
- [x] All TypeScript files compile without errors

---

## Best Practices

1. **Always use ProtectedRoute for sensitive pages** - Prevents unauthorized access
2. **Implement error boundaries** - Catch unexpected errors early
3. **Show loading states** - Use skeleton components to avoid blank screens
4. **Validate input with Zod** - Ensures data integrity before API calls
5. **Handle errors explicitly** - Provide clear feedback to users
6. **Use custom hooks** - Encapsulate data fetching logic
7. **Keep role logic centralized** - Define roles in types and contexts

---

## Troubleshooting

### Issue: White screen during initial load
**Solution:** Use `SkeletonDashboard` while `isLoading` is true

### Issue: "User is not authenticated" on refresh
**Solution:** Check that AuthContext properly restores from localStorage on mount

### Issue: Role-based routes not working
**Solution:** Ensure `user.role` is set in AuthContext after login

### Issue: Zod validation errors not showing
**Solution:** Catch validation errors with try/catch and display via Toast

### Issue: CORS errors from backend
**Solution:** Ensure backend CORS settings allow requests from frontend URL

