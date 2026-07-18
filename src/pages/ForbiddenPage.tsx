import { Lock, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPaths: Record<string, string> = {
    member: '/app/member',
    lead: '/app/lead',
    faculty: '/app/faculty',
  };

  const userRole = user?.role || 'member';
  const dashboardPath = dashboardPaths[userRole];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-beige to-sand p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-orange-100 p-4">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-4xl font-bold text-ink">Access Denied</h1>

        {/* Description */}
        <p className="mt-2 text-ink-soft">
          You don't have permission to access this resource. Your current role is{' '}
          <span className="font-semibold capitalize text-navy">{userRole}</span>.
        </p>

        {/* Help Text */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            If you believe you should have access to this page, please contact your administrator or club lead.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={() => navigate(dashboardPath)}
            className="flex-1"
            variant="primary"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button
            onClick={() => navigate(-1)}
            className="flex-1"
            variant="secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
