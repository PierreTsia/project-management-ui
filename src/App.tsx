import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Tasks } from '@/pages/Tasks';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';
import LoginForm from '@/pages/auth/Login';
import SignUpForm from '@/pages/auth/SignUp';
import GoogleCallback from '@/pages/auth/GoogleCallback';
import AuthError from '@/pages/auth/AuthError';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/auth/error" element={<AuthError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
