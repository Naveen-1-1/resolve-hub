import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth.js";
import "./AppNavbar.css";

const dashboardPaths = {
  customer: "/customer",
  agent: "/agent",
  admin: "/admin",
};

function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Navbar className="app-navbar" expand="md">
      <Container>
        <Navbar.Brand as={Link} to="/">
          ResolveHub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navigation" />
        <Navbar.Collapse id="main-navigation">
          <Nav className="ms-auto align-items-md-center gap-md-2">
            {user ? (
              <>
                <Nav.Link as={Link} to={dashboardPaths[user.role]}>
                  Dashboard
                </Nav.Link>
                <Navbar.Text>
                  {user.name} ({user.role})
                </Navbar.Text>
                <Button
                  size="sm"
                  variant="outline-light"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Log in
                </Nav.Link>
                <Button as={Link} to="/register" size="sm">
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
