import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { apiFetch } from "../api.js";
import "./UserManager.css";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "customer",
};

function UserManager() {
  const [user, setUser] = useState(emptyUser);
  const [message, setMessage] = useState(null);

  const updateField = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      const data = await apiFetch("/auth/users", {
        method: "POST",
        body: JSON.stringify(user),
      });
      setUser(emptyUser);
      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    }
  };

  return (
    <section className="user-manager" aria-labelledby="user-manager-heading">
      <h2 id="user-manager-heading">Register a user</h2>
      <p>Create customer, support-agent, or admin accounts.</p>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Form onSubmit={createUser} className="user-manager-form">
        <Form.Group controlId="new-user-name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            name="name"
            value={user.name}
            onChange={updateField}
            required
          />
        </Form.Group>
        <Form.Group controlId="new-user-email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            type="email"
            value={user.email}
            onChange={updateField}
            required
          />
        </Form.Group>
        <Form.Group controlId="new-user-password">
          <Form.Label>Temporary password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            minLength={8}
            value={user.password}
            onChange={updateField}
            required
          />
        </Form.Group>
        <Form.Group controlId="new-user-role">
          <Form.Label>Role</Form.Label>
          <Form.Select name="role" value={user.role} onChange={updateField}>
            <option value="customer">Customer</option>
            <option value="agent">Support agent</option>
            <option value="admin">Knowledge admin</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit">Create user</Button>
      </Form>
    </section>
  );
}

export default UserManager;
