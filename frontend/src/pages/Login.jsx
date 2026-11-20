import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import Logo from '../components/Logo.jsx';
import DisclaimerCard from '../components/DisclaimerCard.jsx';

export default function Login() {
  const { isAuthenticated, loading, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const target = location.state?.from || '/';

  const onSuccess = useCallback(() => navigate(target, { replace: true }), [navigate, target]);

  if (loading) return <LoadingScreen message="Checking your session…" />;
  if (isAuthenticated) return <Navigate to={target} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="card space-y-6 text-center">
          <div className="flex justify-center"><Logo size="lg" /></div>
          <p className="text-navy-700">
            AI-powered preliminary health assessments and medical report explanations – organised, private and easy to understand.
          </p>
          {sessionExpired && (
            <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Your session has expired. Please sign in again.</p>
          )}
          <GoogleLoginButton onSuccess={onSuccess} />
          <p className="flex items-start justify-center gap-2 text-left text-xs text-navy-500">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            We use your Google account only to sign you in. Patient information you enter is processed by an AI service to produce your assessment and is saved to your account only.
          </p>
        </div>
        <DisclaimerCard />
      </div>
    </div>
  );
}
