import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading, EmptyState } from '../ui/States';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

// UI-level gating only. The Spring Boot API must authorise every request;
// these guards just keep people from landing on screens that cannot work.

export function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading block label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, ready, isAdmin } = useAuth();
  const location = useLocation();
  if (!ready) return <Loading block label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) {
    return (
      <div className="container section">
        <EmptyState
          title="This area is for the studio owner"
          action={
            <Button as={Link} to="/" variant="secondary">
              Back to the studio
            </Button>
          }
        >
          Your account does not have access to the dashboard.
        </EmptyState>
      </div>
    );
  }
  return <Outlet />;
}
