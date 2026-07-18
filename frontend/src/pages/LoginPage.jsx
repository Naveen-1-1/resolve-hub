import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth.js";
import "./LoginPage.css";

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const loggedInUser = await login(email, password);
      navigate(`/${loggedInUser.role}`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <Container className="auth-page">
      <Card className="auth-card">
        <Card.Body>
          <h1>Log in</h1>
          <p>Use your account to continue to your role dashboard.</p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" className="w-100">
              Log in
            </Button>
          </Form>
          <p className="mt-3 mb-0">
            Need a customer account? <Link to="/register">Register</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
