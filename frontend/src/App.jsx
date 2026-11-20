import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewAssessment from './pages/NewAssessment.jsx';
import AssessmentResult from './pages/AssessmentResult.jsx';
import AssessmentHistory from './pages/AssessmentHistory.jsx';
import AssessmentDetails from './pages/AssessmentDetails.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="assessments" element={<AssessmentHistory />} />
          <Route path="assessments/new" element={<NewAssessment />} />
          <Route path="assessments/:id" element={<AssessmentDetails />} />
          <Route path="assessments/:id/result" element={<AssessmentResult />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
