import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router";
import ActionFeedback from "../components/ActionFeedback.jsx";
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
    } catch {
      setError("We couldn't sign you in. Check your email and password.");
    }
  };

  return (
    <main>
      <Container className="auth-page">
        <Card className="auth-card">
          <Card.Body>
            <header className="auth-header">
              <p className="eyebrow">Welcome back</p>
              <h1>Log in</h1>
              <p>Use your account to continue to your role dashboard.</p>
            </header>
            <p className="mb-3">
              Existing user? Log in below. New customer?{" "}
              <Link to="/register">Create an account</Link>.
            </p>
            <ActionFeedback message={error} variant="danger" />
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="login-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="login-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100">
                Log in
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}

export default LoginPage;
