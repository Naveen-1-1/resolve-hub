import { useEffect, useState } from "react";
import { Alert, Card, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import FaqManager from "../components/FaqManager.jsx";
import UserManager from "../components/UserManager.jsx";
import { apiFetch } from "../api.js";
import { scrollToSection } from "../scrollToSection.js";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("metrics");

  useEffect(() => {
    apiFetch("/metrics")
      .then((data) => setMetrics(data.metrics))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const activityCards = metrics
    ? [
        ["Support sessions", metrics.sessionCount],
        ["Open tickets", metrics.ticketsByStatus.open],
        ["In-progress tickets", metrics.ticketsByStatus.in_progress],
        ["Resolved tickets", metrics.ticketsByStatus.resolved],
        ["Notifications sent", metrics.notificationCount],
      ]
    : [];
  const performanceCards = metrics
    ? [["Average resolution", `${metrics.averageResolutionSeconds} seconds`]]
    : [];

  const renderMetricCards = (cards) => (
    <Row className="g-3 mb-4">
      {cards.map(([label, value]) => (
        <Col sm={6} lg={4} key={label}>
          <Card className="metric-card h-100">
            <Card.Body>
              <Card.Text>{label}</Card.Text>
              <Card.Title as="h3">{value}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <main className="admin-dashboard">
      <Container>
        <header className="page-header">
          <p className="eyebrow">Knowledge operations</p>
          <h1>Knowledge admin dashboard</h1>
          <p>Monitor support activity and maintain the FAQ library.</p>
        </header>
        {error && <Alert variant="danger">{error}</Alert>}
        <Card className="admin-master-card">
          <Card.Body id="admin-tab-content" className="p-0" tabIndex="-1">
            <Tabs
              activeKey={activeTab}
              fill
              onSelect={(selectedTab) => {
                setActiveTab(selectedTab);
                scrollToSection("admin-tab-content");
              }}
              variant="tabs"
            >
              <Tab eventKey="metrics" title="Metrics">
                <div className="p-3">
                  <h2>Activity metrics</h2>
                  {renderMetricCards(activityCards)}
                  <h2>Performance metrics</h2>
                  {renderMetricCards(performanceCards)}
                  {!metrics && !error && <p>Loading metrics...</p>}
                </div>
              </Tab>
              <Tab eventKey="faq" title="FAQ Management">
                <div className="p-3">
                  <FaqManager />
                </div>
              </Tab>
              <Tab eventKey="users" title="User Management">
                <div className="p-3">
                  <UserManager />
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
}

export default AdminDashboard;
