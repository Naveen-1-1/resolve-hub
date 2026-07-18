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

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const registeredUser = await register(
        form.name,
        form.email,
        form.password
      );
      navigate(`/${registeredUser.role}`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  return (
    <Container className="register-page">
      <Card className="register-card">
        <Card.Body>
          <h1>Create a customer account</h1>
          <p>Registration creates a customer role automatically.</p>
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
                required
              />
              <Form.Text>Use at least 8 characters.</Form.Text>
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
  );
}

export default RegisterPage;
