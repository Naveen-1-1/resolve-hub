import { useState } from "react";
import PropTypes from "prop-types";
import { Accordion, Alert, Badge, Button, Card, Form } from "react-bootstrap";
import { apiFetch } from "../api.js";
import "./SessionPanel.css";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function SessionPanel({ sessions, onChanged }) {
  const activeSession = sessions.find((session) => session.status === "active");
  const [topic, setTopic] = useState("");
  const [ticket, setTicket] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });
  const [error, setError] = useState("");

  const runAction = async (path, options) => {
    try {
      await apiFetch(path, options);
      setError("");
      await onChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const startSession = async (event) => {
    event.preventDefault();
    await runAction("/sessions", {
      method: "POST",
      body: JSON.stringify({ topic }),
    });
    setTopic("");
  };

  const escalate = async (event) => {
    event.preventDefault();
    await runAction(`/sessions/${activeSession._id}/escalate`, {
      method: "POST",
      body: JSON.stringify(ticket),
    });
    setTicket({ subject: "", description: "", priority: "medium" });
  };

  return (
    <section className="session-panel" aria-labelledby="session-heading">
      <h2 id="session-heading">Support session</h2>
      <p>Start a session before reading FAQs so your activity is recorded.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      {!activeSession ? (
        <Form onSubmit={startSession} className="mb-4">
          <Form.Label htmlFor="session-topic">
            What do you need help with?
          </Form.Label>
          <div className="d-flex gap-2">
            <Form.Control
              id="session-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
              maxLength={120}
            />
            <Button type="submit">Start</Button>
          </div>
        </Form>
      ) : (
        <Card className="mb-4">
          <Card.Body>
            <Badge bg="success">Active</Badge>
            <Card.Title className="mt-2">{activeSession.topic}</Card.Title>
            <Card.Text>
              {activeSession.viewedFaqIds.length} FAQ article(s) viewed
            </Card.Text>
            <Button
              variant="outline-success"
              onClick={() =>
                runAction(`/sessions/${activeSession._id}/resolve`, {
                  method: "PATCH",
                })
              }
            >
              Mark resolved
            </Button>
          </Card.Body>
        </Card>
      )}

      {activeSession && (
        <Form onSubmit={escalate} className="escalation-form">
          <h3>Still need help?</h3>
          <Form.Group className="mb-2" controlId="ticket-subject">
            <Form.Label>Ticket subject</Form.Label>
            <Form.Control
              value={ticket.subject}
              onChange={(event) =>
                setTicket({ ...ticket, subject: event.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-2" controlId="ticket-description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={ticket.description}
              onChange={(event) =>
                setTicket({ ...ticket, description: event.target.value })
              }
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="ticket-priority">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={ticket.priority}
              onChange={(event) =>
                setTicket({ ...ticket, priority: event.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="warning">
            Escalate to ticket
          </Button>
        </Form>
      )}

      <h3 className="mt-4">Session history and activity</h3>
      {!sessions.length ? (
        <p>No sessions yet.</p>
      ) : (
        <Accordion>
          {sessions.map((session, index) => (
            <Accordion.Item eventKey={String(index)} key={session._id}>
              <Accordion.Header>
                <span>
                  {session.topic} — {session.status} ·{" "}
                  {formatDate(session.startedAt)}
                </span>
              </Accordion.Header>
              <Accordion.Body>
                <h4>FAQ articles viewed</h4>
                {session.viewedFaqs?.length ? (
                  <ul>
                    {session.viewedFaqs.map((faq) => (
                      <li key={faq._id}>
                        <strong>{faq.title}</strong> — {faq.question}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No FAQ articles were viewed.</p>
                )}
                {session.ticket && (
                  <>
                    <h4>Escalated ticket</h4>
                    <dl className="ticket-metadata">
                      <dt>Subject</dt>
                      <dd>{session.ticket.subject}</dd>
                      <dt>Description</dt>
                      <dd>{session.ticket.description}</dd>
                      <dt>Priority and status</dt>
                      <dd>
                        {session.ticket.priority} ·{" "}
                        {session.ticket.status.replace("_", " ")}
                      </dd>
                    </dl>
                  </>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </section>
  );
}

SessionPanel.propTypes = {
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      topic: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      startedAt: PropTypes.string.isRequired,
      viewedFaqIds: PropTypes.arrayOf(PropTypes.string).isRequired,
      viewedFaqs: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          question: PropTypes.string.isRequired,
        })
      ),
      ticket: PropTypes.shape({
        subject: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      }),
    })
  ).isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default SessionPanel;
