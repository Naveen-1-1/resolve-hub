import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { apiFetch } from "../api.js";
import NotificationList from "../components/NotificationList.jsx";
import { useAuth } from "../context/useAuth.js";
import "./AgentDashboard.css";

function AgentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const assignedToCurrentAgent = selected?.ticket.assignedAgentId === user._id;

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    const data = await apiFetch(`/tickets?${params}`);
    return data.tickets;
  }, [filters]);

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await fetchTickets());
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [fetchTickets]);

  const fetchNotifications = useCallback(async () => {
    const data = await apiFetch("/notifications");
    return data.notifications;
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifications(await fetchNotifications());
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    let active = true;
    fetchTickets()
      .then((nextTickets) => {
        if (active) {
          setTickets(nextTickets);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [fetchTickets]);

  useEffect(() => {
    let active = true;
    fetchNotifications()
      .then((nextNotifications) => {
        if (active) setNotifications(nextNotifications);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [fetchNotifications]);

  const selectTicket = async (id) => {
    try {
      setSelected(await apiFetch(`/tickets/${id}`));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateTicket = async (path, body) => {
    try {
      const data = await apiFetch(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      });
      await Promise.all([loadTickets(), loadNotifications()]);
      await selectTicket(data.ticket._id);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="agent-dashboard">
      <Container>
        <h1>Agent ticket queue</h1>
        <p>
          Filter requests, assign a ticket to yourself, and move it through the
          support steps.
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="g-2 mb-3">
          <Col sm={6}>
            <Form.Label htmlFor="ticket-status-filter">Status</Form.Label>
            <Form.Select
              id="ticket-status-filter"
              value={filters.status}
              onChange={(event) =>
                setFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </Form.Select>
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="ticket-priority-filter">Priority</Form.Label>
            <Form.Select
              id="ticket-priority-filter"
              value={filters.priority}
              onChange={(event) =>
                setFilters({ ...filters, priority: event.target.value })
              }
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="agent-grid">
          <section className="ticket-table" aria-labelledby="queue-heading">
            <h2 id="queue-heading">Tickets</h2>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.subject}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.status.replace("_", " ")}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => selectTicket(ticket._id)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!tickets.length && <p>No tickets match these filters.</p>}
          </section>

          <section aria-labelledby="ticket-detail-heading">
            <Card>
              <Card.Body>
                <h2 id="ticket-detail-heading">Ticket detail</h2>
                {!selected ? (
                  <p>Select a ticket from the queue.</p>
                ) : (
                  <>
                    <Badge>{selected.ticket.priority}</Badge>
                    <h3 className="mt-2">{selected.ticket.subject}</h3>
                    <p>{selected.ticket.description}</p>
                    <hr />
                    <h4>Session context</h4>
                    <p>
                      {selected.session?.topic || "Session unavailable"} ·{" "}
                      {selected.session?.viewedFaqIds?.length || 0} FAQ views
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {!selected.ticket.assignedAgentId && (
                        <Button
                          onClick={() =>
                            updateTicket(
                              `/tickets/${selected.ticket._id}/assign`
                            )
                          }
                        >
                          Assign to me
                        </Button>
                      )}
                      {assignedToCurrentAgent &&
                        selected.ticket.status === "open" && (
                          <Button
                            variant="warning"
                            onClick={() =>
                              updateTicket(
                                `/tickets/${selected.ticket._id}/status`,
                                { status: "in_progress" }
                              )
                            }
                          >
                            Start progress
                          </Button>
                        )}
                      {assignedToCurrentAgent &&
                        selected.ticket.status === "in_progress" && (
                          <Button
                            variant="success"
                            onClick={() =>
                              updateTicket(
                                `/tickets/${selected.ticket._id}/status`,
                                { status: "resolved" }
                              )
                            }
                          >
                            Resolve
                          </Button>
                        )}
                    </div>
                    {selected.ticket.assignedAgentId &&
                      !assignedToCurrentAgent && (
                        <p className="mt-3 mb-0 text-muted">
                          This ticket is assigned to another agent.
                        </p>
                      )}
                  </>
                )}
              </Card.Body>
            </Card>
          </section>
        </div>
        <div className="mt-4">
          <NotificationList
            notifications={notifications}
            onChanged={loadNotifications}
          />
        </div>
      </Container>
    </main>
  );
}

export default AgentDashboard;
