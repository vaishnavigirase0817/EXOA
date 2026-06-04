import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationPage } from './pages/NavigationPage';
import { HomePage } from './pages/HomePage';
import { UserDashboard } from './pages/UserDashboard';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';

/**
 * EXOA — Indoor Emergency Navigation Application
 *
 * Routes:
 * - /              → Landing page dashboard selector
 * - /scan          → Scanning instructions (original home)
 * - /nav?node=X    → Navigation view with route rendering
 * - /dashboard     → Live user emergency evacuation dashboard
 * - /admin         → Emergency operations control panel
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<HomePage />} />
        <Route path="/nav" element={<NavigationPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
