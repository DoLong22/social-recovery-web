import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ImprovedGuardianSetup } from './pages/ImprovedGuardianSetup';
import { SessionMonitoring } from './pages/SessionMonitoring';
import { GuardianDashboard } from './pages/GuardianDashboard';
import { Sessions } from './pages/Sessions';
import { GuardianInvite } from './pages/GuardianInvite';
import { RecoveryInitiation } from './pages/RecoveryInitiation';
import { RecoveryProgress } from './pages/RecoveryProgress';
import { RecoveryAuthentication } from './pages/RecoveryAuthentication';
import { RecoveryDecryption } from './pages/RecoveryDecryption';
import { RecoveryApproval } from './pages/RecoveryApproval';
import { Profile } from './pages/Profile';
import { ToastInitializer } from './components/ToastInitializer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SmartRedirect } from './components/SmartRedirect';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <ToastInitializer />
              <Router>
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/guardian/invite/:token" element={<GuardianInvite />} />
              <Route path="/recovery/approve" element={<RecoveryApproval />} />
              
              {/* Private routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SmartRedirect />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/setup"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ImprovedGuardianSetup />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/session-monitoring"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SessionMonitoring />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/guardian-dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <GuardianDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Sessions />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </PrivateRoute>
                }
              />
              
              {/* Recovery routes */}
              <Route
                path="/recovery/start"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RecoveryInitiation />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/recovery/progress/:sessionId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RecoveryProgress />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/recovery/authenticate/:sessionId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RecoveryAuthentication />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/recovery/decrypt/:sessionId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RecoveryDecryption />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;