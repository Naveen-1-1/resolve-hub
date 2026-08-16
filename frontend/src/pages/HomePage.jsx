import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useAuth } from "../context/useAuth.js";
import "./HomePage.css";

const roleSteps = [
  {
    title: "Customers",
    text: "Start a support session, browse FAQs, and escalate unresolved questions.",
    role: "customer",
    action: "Create a customer account",
  },
  {
    title: "Support agents",
    text: "Review the ticket queue, accept tickets, and update their status.",
    role: "agent",
    action: "Log in to the agent dashboard",
  },
  {
    title: "Knowledge admins",
    text: "Maintain the FAQ library and review simple support metrics.",
    role: "admin",
    action: "Log in to the admin dashboard",
  },
];

function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="hero">
        <Container>
          <p className="eyebrow">Customer support, organized</p>
          <h1>Find answers and resolve support requests in one place.</h1>
          <p className="hero-copy">
            ResolveHub tracks FAQ research, escalations, ticket progress, and
            notifications for customers and support teams.
          </p>
          <Button as={Link} to={user ? `/${user.role}` : "/register"}>
            {user ? "Open dashboard" : "Get started"}
          </Button>
        </Container>
      </section>
      <Container className="py-5">
        <h2>How to use ResolveHub</h2>
        <Row className="g-3 mt-1">
          {roleSteps.map((step, index) => (
            <Col md={4} key={step.title}>
              <Card
                as={Link}
                className="h-100 text-decoration-none"
                to={
                  user
                    ? `/${user.role}`
                    : step.role === "customer"
                      ? "/register"
                      : "/login"
                }
              >
                <Card.Body>
                  <span className="step-number">{index + 1}</span>
                  <Card.Title>{step.title}</Card.Title>
                  <Card.Text>{step.text}</Card.Text>
                  <span className="btn btn-outline-primary">{step.action}</span>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </main>
  );
}

export default HomePage;
