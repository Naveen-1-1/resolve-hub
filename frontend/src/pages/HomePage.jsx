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
    <main className="home-page">
      <header className="hero">
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
      </header>
      <section className="home-guide" aria-labelledby="how-to-use-heading">
        <Container>
          <header className="section-heading">
            <p className="eyebrow">One connected workflow</p>
            <h2 id="how-to-use-heading">How to use ResolveHub</h2>
            <p>
              Choose the path that matches your role and keep every support
              action in one place.
            </p>
          </header>
          <Row className="g-4">
            {roleSteps.map((step, index) => (
              <Col md={4} key={step.title}>
                <Card as="article" className="role-card h-100">
                  <Card.Body>
                    <span className="step-number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Card.Title as="h3">{step.title}</Card.Title>
                    <Card.Text>{step.text}</Card.Text>
                    <Link
                      className="btn btn-outline-primary"
                      to={
                        user
                          ? `/${user.role}`
                          : step.role === "customer"
                            ? "/register"
                            : "/login"
                      }
                    >
                      {step.action}
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
}

export default HomePage;
