import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth.js";
import "./RegisterPage.css";

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user && !isSubmitting) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const registeredUser = await register(
        form.name,
        form.email,
        form.password
      );
      navigate(`/${registeredUser.role}`, {
        state: {
          notice:
            "Customer account created successfully. Your customer dashboard is ready.",
        },
      });
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  return (
    <main>
      <Container className="register-page">
        <Card className="register-card">
          <Card.Body>
            <header className="auth-header">
              <p className="eyebrow">Get started</p>
              <h1>Create a customer account</h1>
              <p>Registration creates a customer role automatically.</p>
            </header>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="register-name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="register-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="register-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={updateField}
                  aria-describedby="register-password-help"
                  required
                />
                <Form.Text id="register-password-help">
                  Use at least 8 characters.
                </Form.Text>
              </Form.Group>
              <Button type="submit" className="w-100">
                Register
              </Button>
            </Form>
            <p className="mt-3 mb-0">
              Already registered? <Link to="/login">Log in</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}

export default RegisterPage;
