import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";
import FaqManager from "../components/FaqManager.jsx";
import UserManager from "../components/UserManager.jsx";
import { apiFetch } from "../api.js";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/metrics")
      .then((data) => setMetrics(data.metrics))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const cards = metrics
    ? [
        ["Support sessions", metrics.sessionCount],
        ["Open tickets", metrics.ticketsByStatus.open],
        ["In-progress tickets", metrics.ticketsByStatus.in_progress],
        ["Resolved tickets", metrics.ticketsByStatus.resolved],
        ["Notifications sent", metrics.notificationCount],
        ["Average resolution", `${metrics.averageResolutionSeconds} seconds`],
      ]
    : [];

  return (
    <main className="admin-dashboard">
      <Container>
        <h1>Knowledge admin dashboard</h1>
        <p>Monitor support activity and maintain the FAQ library.</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-3 mb-4">
          {cards.map(([label, value]) => (
            <Col sm={6} lg={4} key={label}>
              <Card className="metric-card">
                <Card.Body>
                  <Card.Text>{label}</Card.Text>
                  <Card.Title>{value}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {!metrics && !error && <p>Loading metrics...</p>}
        <UserManager />
        <FaqManager />
      </Container>
    </main>
  );
}

export default AdminDashboard;
