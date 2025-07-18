import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { Tasks } from '@/pages/Tasks';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';
import { Sandbox } from '@/pages/Sandbox';
import { NotFound } from '@/pages/NotFound';
import LoginForm from '@/pages/auth/Login';
import SignUpForm from '@/pages/auth/SignUp';
import GoogleCallback from '@/pages/auth/GoogleCallback';
import AuthError from '@/pages/auth/AuthError';
import CheckEmail from '@/pages/auth/CheckEmail';
import EmailConfirmation from '@/pages/auth/EmailConfirmation';
import ConfirmEmailSuccess from '@/pages/auth/ConfirmEmailSuccess';
import ConfirmEmailError from '@/pages/auth/ConfirmEmailError';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import TaskDetailsPage from '@/pages/TaskDetailsPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route
                path="projects/:id/:taskId"
                element={<TaskDetailsPage />}
              />
              <Route path="tasks" element={<Tasks />} />
              <Route path="team" element={<Team />} />
              <Route path="sandbox" element={<Sandbox />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="/auth/check-email" element={<CheckEmail />} />
          <Route path="/confirm-email" element={<EmailConfirmation />} />
          <Route
            path="/confirm-email-success"
            element={<ConfirmEmailSuccess />}
          />
          <Route path="/confirm-email-error" element={<ConfirmEmailError />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
