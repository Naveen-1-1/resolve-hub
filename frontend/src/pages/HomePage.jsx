import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router";
import { useAuth } from "../context/useAuth.js";
import "./HomePage.css";

const roleSteps = [
  {
    title: "Customers",
    text: "Start a support session, browse FAQs, and escalate unresolved questions.",
  },
  {
    title: "Support agents",
    text: "Review the ticket queue, accept tickets, and update their status.",
  },
  {
    title: "Knowledge admins",
    text: "Maintain the FAQ library and review simple support metrics.",
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
              <Card className="h-100">
                <Card.Body>
                  <span className="step-number">{index + 1}</span>
                  <Card.Title>{step.title}</Card.Title>
                  <Card.Text>{step.text}</Card.Text>
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
