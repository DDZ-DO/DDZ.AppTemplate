import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import {
  ThemeProvider,
  AuthProvider,
  LoginPage,
  ProtectedRoute,
  DDZToastProvider,
  SettingsProvider,
  ConfirmProvider,
  useAuth,
} from '@ddz/shared-react'
import { SystemAppRoutes } from '@ddz/shared-admin'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { loginApi } from './lib/api'
import type { LoginResponse } from '@ddz/shared-react'

function LoginRoute() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
    return <Navigate to={from} replace />
  }

  return (
    <LoginPage
      appName="__AppName__"
      tagline="__AppTagline__"
      onLogin={loginApi}
      onSuccess={(response: LoginResponse) => login(response)}
    />
  )
}

function App() {
  return (
    <ThemeProvider config={{ storageKey: 'ddz___appname___theme' }}>
      <AuthProvider config={{ storageKeyPrefix: 'ddz', loginFn: loginApi }}>
        <BrowserRouter>
          <ConfirmProvider>
            <SettingsProvider>
              <DDZToastProvider />
              <Routes>
                <Route path="/login" element={<LoginRoute />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="system/*" element={<SystemAppRoutes />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SettingsProvider>
          </ConfirmProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
