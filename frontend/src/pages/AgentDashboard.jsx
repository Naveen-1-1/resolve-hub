import { useCallback, useEffect, useMemo, useState } from "react";
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
import ActionFeedback from "../components/ActionFeedback.jsx";
import NotificationList from "../components/NotificationList.jsx";
import TicketStatusProgress from "../components/TicketStatusProgress.jsx";
import { useAuth } from "../context/useAuth.js";
import { scrollToSection } from "../scrollToSection.js";
import "./AgentDashboard.css";

function AgentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const assignedToCurrentAgent = selected?.ticket.assignedAgentId === user._id;
  const sortedTickets = useMemo(() => {
    const statusOrder = { open: 0, in_progress: 1, resolved: 2 };
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...tickets].sort((first, second) => {
      if (sortBy === "status") {
        return statusOrder[first.status] - statusOrder[second.status];
      }
      if (sortBy === "priority") {
        return priorityOrder[first.priority] - priorityOrder[second.priority];
      }
      return new Date(second.updatedAt) - new Date(first.updatedAt);
    });
  }, [sortBy, tickets]);

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

  useEffect(() => {
    if (selected) scrollToSection("ticket-detail-heading");
  }, [selected]);

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    scrollToSection("queue-heading");
  };

  const updateSort = (value) => {
    setSortBy(value);
    scrollToSection("queue-heading");
  };

  const selectTicket = async (id) => {
    try {
      setSelected(await apiFetch(`/tickets/${id}`));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateTicket = async (path, body, successMessage) => {
    try {
      const data = await apiFetch(path, {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      });
      setMessage(successMessage);
      setError("");
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
        <ActionFeedback message={message} onClose={() => setMessage("")} />
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="mb-4">
          <NotificationList
            notifications={notifications}
            onChanged={loadNotifications}
            onTicketFocus={selectTicket}
          />
        </div>
        <Row className="g-2 mb-3">
          <Col sm={6}>
            <Form.Label htmlFor="ticket-status-filter">Status</Form.Label>
            <Form.Select
              id="ticket-status-filter"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
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
              onChange={(event) => updateFilter("priority", event.target.value)}
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Form.Select>
          </Col>
          <Col sm={6} md={4}>
            <Form.Label htmlFor="ticket-sort">Sort queue by</Form.Label>
            <Form.Select
              id="ticket-sort"
              value={sortBy}
              onChange={(event) => updateSort(event.target.value)}
            >
              <option value="updated">Recently updated</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="agent-grid">
          <section className="ticket-table" aria-labelledby="queue-heading">
            <h2 id="queue-heading" tabIndex="-1">
              Tickets
            </h2>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned agent</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <tr
                    className={
                      selected?.ticket._id === ticket._id ? "table-primary" : ""
                    }
                    id={`ticket-${ticket._id}`}
                    key={ticket._id}
                  >
                    <td>{ticket.subject}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.status.replace("_", " ")}</td>
                    <td>
                      {ticket.assignedAgent?.name ||
                        (ticket.assignedAgentId ? "Assigned" : "Unassigned")}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => selectTicket(ticket._id)}
                      >
                        Open ticket
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!sortedTickets.length && <p>No tickets match these filters.</p>}
          </section>

          <section aria-labelledby="ticket-detail-heading">
            <Card>
              <Card.Body>
                <h2 id="ticket-detail-heading" tabIndex="-1">
                  Ticket detail
                </h2>
                {!selected ? (
                  <p>Select a ticket from the queue.</p>
                ) : (
                  <>
                    <Badge>{selected.ticket.priority}</Badge>
                    <h3 className="mt-2">{selected.ticket.subject}</h3>
                    <p>{selected.ticket.description}</p>
                    <p className="mb-2">
                      <strong>Status:</strong>{" "}
                      {selected.ticket.status.replace("_", " ")}
                    </p>
                    <TicketStatusProgress status={selected.ticket.status} />
                    <p className="mb-2">
                      <strong>Assigned agent:</strong>{" "}
                      {selected.ticket.assignedAgent?.name ||
                        (selected.ticket.assignedAgentId
                          ? "Another support agent"
                          : "Unassigned")}
                    </p>
                    <hr />
                    <h4>Session context</h4>
                    <p>
                      <strong>Topic:</strong>{" "}
                      {selected.session?.topic || "Session unavailable"}
                      <br />
                      <strong>FAQ articles viewed:</strong>{" "}
                      {selected.session?.viewedFaqIds?.length || 0}
                      {selected.session?.startedAt && (
                        <>
                          <br />
                          <strong>Started:</strong>{" "}
                          {new Date(
                            selected.session.startedAt
                          ).toLocaleString()}
                        </>
                      )}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {!selected.ticket.assignedAgentId && (
                        <Button
                          onClick={() =>
                            updateTicket(
                              `/tickets/${selected.ticket._id}/assign`,
                              undefined,
                              "Ticket assigned to you."
                            )
                          }
                        >
                          Assign ticket to me
                        </Button>
                      )}
                      {assignedToCurrentAgent &&
                        selected.ticket.status === "open" && (
                          <Button
                            variant="warning"
                            onClick={() =>
                              updateTicket(
                                `/tickets/${selected.ticket._id}/status`,
                                { status: "in_progress" },
                                "Ticket marked in progress."
                              )
                            }
                          >
                            Mark in progress
                          </Button>
                        )}
                      {assignedToCurrentAgent &&
                        selected.ticket.status === "in_progress" && (
                          <Button
                            variant="success"
                            onClick={() =>
                              updateTicket(
                                `/tickets/${selected.ticket._id}/status`,
                                { status: "resolved" },
                                "Ticket marked resolved."
                              )
                            }
                          >
                            Mark resolved
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
      </Container>
    </main>
  );
}

export default AgentDashboard;
