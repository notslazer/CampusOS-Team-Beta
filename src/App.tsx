import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastViewport } from './components/ui/Toast';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import ForgotPassword from "./pages/auth/ForgotPassword";
import SignupPage from "./pages/auth/SignupPage";
// Pages
import Landing from './pages/Landing';
import LoginPage from './pages/auth/LoginPage';


// Dashboards
import Dashboard from './pages/dashboard/Dashboard';
import {
  MemberDashboard,
  LeadDashboard,
  FacultyDashboard,
} from './pages/dashboard/Dashboard';

// Shared Pages
import EventsPage from './pages/dashboard/EventsPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import BlogsPage from './pages/dashboard/BlogsPage';
import GalleryPage from './pages/dashboard/GalleryPage';
import LeaderboardPage from './pages/dashboard/LeaderboardPage';
import AnnouncementsPage from './pages/dashboard/AnnouncementsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';

// Planner
import CampusPlanner from './pages/planner/CampusPlanner';

// Polls
import PollsPage from './pages/polls/PollsPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>

          <Routes>

            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route
  path="/login"
  element={<LoginPage role="member" />}
/>

            <Route
              path="/login/member"
              element={<LoginPage role="member" />}
            />

            <Route
              path="/login/lead"
              element={<LoginPage role="lead" />}
            />

            <Route
              path="/login/faculty"
              element={<LoginPage role="faculty" />}
            />

            <Route
    path="/signup"
    element={<SignupPage />}
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

            {/* Legacy Redirects */}

            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/app/member" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lead/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/app/lead" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/app/faculty" replace />
                </ProtectedRoute>
              }
            />

            {/* Protected App */}

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >

              <Route index element={<Dashboard />} />

              <Route
                path="dashboard"
                element={<Dashboard />}
              />

              {/* Dashboards */}

              <Route
                path="member"
                element={<MemberDashboard />}
              />

              <Route
                path="lead"
                element={<LeadDashboard />}
              />

              <Route
                path="faculty"
                element={<FacultyDashboard />}
              />

              {/* Shared Pages */}

              <Route
                path="events"
                element={<EventsPage />}
              />

              <Route
                path="planner"
                element={<CampusPlanner />}
              />

              {/* NEW POLLS PAGE */}

              <Route
                path="polls"
                element={<PollsPage />}
              />

              <Route
                path="projects"
                element={<ProjectsPage />}
              />

              <Route
                path="blogs"
                element={<BlogsPage />}
              />

              <Route
                path="gallery"
                element={<GalleryPage />}
              />

              <Route
                path="leaderboard"
                element={<LeaderboardPage />}
              />

              <Route
                path="announcements"
                element={<AnnouncementsPage />}
              />

              <Route
                path="profile"
                element={<ProfilePage />}
              />

              <Route
                path="settings"
                element={<SettingsPage />}
              />

              {/* Faculty */}

              <Route
                path="approvals"
                element={<AnnouncementsPage />}
              />

              <Route
                path="analytics"
                element={<AnnouncementsPage />}
              />

              <Route
                path="reports"
                element={<AnnouncementsPage />}
              />

              <Route
                path="clubs"
                element={<AnnouncementsPage />}
              />

              <Route
                path="members"
                element={<AnnouncementsPage />}
              />

            </Route>

            {/* Catch All */}

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>

          <ToastViewport />

        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

