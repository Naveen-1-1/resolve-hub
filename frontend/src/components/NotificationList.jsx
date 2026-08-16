import { useState } from "react";
import PropTypes from "prop-types";
import { Badge, Button, ListGroup, Pagination } from "react-bootstrap";
import { apiFetch } from "../api.js";
import ActionFeedback from "./ActionFeedback.jsx";
import "./NotificationList.css";

function NotificationList({ notifications, onChanged, onTicketFocus }) {
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(Math.ceil(notifications.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const visibleNotifications = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const markAllRead = async () => {
    try {
      setError("");
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  };

  const markRead = async (id) => {
    try {
      setError("");
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  };

  const focusTicket = (event, ticketId) => {
    if (!onTicketFocus) return;
    event.preventDefault();
    onTicketFocus(ticketId);
  };

  return (
    <section
      className="notification-list"
      aria-labelledby="notifications-heading"
    >
      <div className="d-flex justify-content-between align-items-start">
        <h2 id="notifications-heading">Notifications</h2>
        <Button
          size="sm"
          variant="outline-primary"
          onClick={markAllRead}
          disabled={!notifications.some((item) => !item.isRead)}
        >
          Mark all read
        </Button>
      </div>
      <ActionFeedback
        message={error}
        onClose={() => setError("")}
        variant="danger"
      />
      <ListGroup variant="flush">
        {visibleNotifications.map((notification) => (
          <ListGroup.Item
            key={notification._id}
            className="d-flex justify-content-between gap-2"
          >
            <div>
              <div>
                {!notification.isRead && (
                  <Badge bg="primary" className="me-2">
                    New
                  </Badge>
                )}
                {notification.message}
              </div>
              {(notification.ticketId || notification.createdAt) && (
                <small className="d-block text-muted mt-1">
                  {notification.ticketId && (
                    <>
                      Ticket ID: {notification.ticketId}
                      {notification.ticket?.subject &&
                        ` · ${notification.ticket.subject}`}
                      {notification.ticket?.sessionTopic &&
                        ` · Session: ${notification.ticket.sessionTopic}`}
                    </>
                  )}
                  {notification.createdAt &&
                    ` · ${new Date(notification.createdAt).toLocaleString()}`}
                </small>
              )}
              {notification.ticketId &&
                (onTicketFocus ? (
                  <Button
                    className="p-0 mt-1"
                    href={`#ticket-${notification.ticketId}`}
                    onClick={(event) =>
                      focusTicket(event, notification.ticketId)
                    }
                    variant="link"
                  >
                    View ticket
                  </Button>
                ) : (
                  <a
                    className="d-inline-block mt-1"
                    href={`#ticket-${notification.ticketId}`}
                  >
                    View ticket
                  </a>
                ))}
            </div>
            {!notification.isRead && (
              <Button
                aria-label={`Mark notification as read: ${notification.message}`}
                size="sm"
                variant="link"
                onClick={() => markRead(notification._id)}
              >
                Mark read
              </Button>
            )}
          </ListGroup.Item>
        ))}
        {!notifications.length && (
          <ListGroup.Item>No notifications yet.</ListGroup.Item>
        )}
      </ListGroup>
      {notifications.length > pageSize && (
        <Pagination
          aria-label="Notification pages"
          className="justify-content-center mt-3 mb-0"
        >
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          />
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Pagination.Item
                active={pageNumber === currentPage}
                aria-current={pageNumber === currentPage ? "page" : undefined}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </Pagination.Item>
            )
          )}
          <Pagination.Next
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          />
        </Pagination>
      )}
    </section>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      isRead: PropTypes.bool.isRequired,
      ticketId: PropTypes.string,
      createdAt: PropTypes.string,
      ticket: PropTypes.shape({
        subject: PropTypes.string,
        sessionTopic: PropTypes.string,
      }),
    })
  ).isRequired,
  onChanged: PropTypes.func.isRequired,
  onTicketFocus: PropTypes.func,
};

export default NotificationList;
