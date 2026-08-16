import PropTypes from "prop-types";
import { Container } from "react-bootstrap";
import { Navigate } from "react-router";
import { useAuth } from "../context/useAuth.js";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="loading-page">
        <Container className="py-5 text-center">
          <p role="status">Loading...</p>
        </Container>
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

ProtectedRoute.defaultProps = {
  roles: null,
};

export default ProtectedRoute;
