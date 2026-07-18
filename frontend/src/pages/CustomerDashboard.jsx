import { useCallback, useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";
import FaqBrowser from "../components/FaqBrowser.jsx";
import NotificationList from "../components/NotificationList.jsx";
import SessionPanel from "../components/SessionPanel.jsx";
import TicketList from "../components/TicketList.jsx";
import { apiFetch } from "../api.js";
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

  return (
    <main className="dashboard-page">
      <Container>
        <h1>Customer dashboard</h1>
        <p>
          Start a session, review FAQs, then resolve it or request agent help.
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="customer-grid">
          <SessionPanel sessions={sessions} onChanged={loadDashboard} />
          <FaqBrowser
            activeSessionId={activeSession?._id}
            onSessionChanged={loadDashboard}
          />
          <TicketList tickets={tickets} />
          <NotificationList
            notifications={notifications}
            onChanged={loadDashboard}
          />
        </div>
      </Container>
    </main>
  );
}

export default CustomerDashboard;
