import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Container, Modal } from "react-bootstrap";
import { useLocation } from "react-router";
import FaqBrowser from "../components/FaqBrowser.jsx";
import NotificationList from "../components/NotificationList.jsx";
import SessionPanel from "../components/SessionPanel.jsx";
import TicketList from "../components/TicketList.jsx";
import { apiFetch } from "../api.js";
import { scrollToSection } from "../scrollToSection.js";
import "./CustomerDashboard.css";

async function fetchDashboard() {
  const [sessionData, ticketData, notificationData] = await Promise.all([
    apiFetch("/sessions"),
    apiFetch("/tickets"),
    apiFetch("/notifications"),
  ]);
  return {
    sessions: sessionData.sessions,
    tickets: ticketData.tickets,
    notifications: notificationData.notifications,
  };
}

function CustomerDashboard() {
  const location = useLocation();
  const [registrationNotice, setRegistrationNotice] = useState(
    location.state?.notice || ""
  );
  const [sessions, setSessions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const applyDashboard = useCallback((data) => {
    setSessions(data.sessions);
    setTickets(data.tickets);
    setNotifications(data.notifications);
    setError("");
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      applyDashboard(await fetchDashboard());
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [applyDashboard]);

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((data) => {
        if (active) applyDashboard(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [applyDashboard]);

  const activeSession = sessions.find((session) => session.status === "active");
  const focusTicket = (ticketId) => scrollToSection(`ticket-${ticketId}`);

  return (
    <main className="dashboard-page">
      <Container>
        <h1>Customer dashboard</h1>
        <p>
          Start a session, review FAQs, then resolve it or request agent help.
        </p>
        <Modal
          centered
          onHide={() => setRegistrationNotice("")}
          show={Boolean(registrationNotice)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Account created</Modal.Title>
          </Modal.Header>
          <Modal.Body>{registrationNotice}</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setRegistrationNotice("")}>Continue</Button>
          </Modal.Footer>
        </Modal>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="customer-grid">
          <NotificationList
            notifications={notifications}
            onChanged={loadDashboard}
            onTicketFocus={focusTicket}
          />
          <SessionPanel sessions={sessions} onChanged={loadDashboard} />
          <TicketList tickets={tickets} />
          <FaqBrowser
            activeSessionId={activeSession?._id}
            viewedFaqIds={activeSession?.viewedFaqIds || []}
            onSessionChanged={loadDashboard}
          />
        </div>
      </Container>
    </main>
  );
}

export default CustomerDashboard;
