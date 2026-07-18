import PropTypes from "prop-types";
import { Badge, Button, ListGroup } from "react-bootstrap";
import { apiFetch } from "../api.js";
import "./NotificationList.css";

function NotificationList({ notifications, onChanged }) {
  const markAllRead = async () => {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
    await onChanged();
  };

  const markRead = async (id) => {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    await onChanged();
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
      <ListGroup variant="flush">
        {notifications.map((notification) => (
          <ListGroup.Item
            key={notification._id}
            className="d-flex justify-content-between gap-2"
          >
            <span>
              {!notification.isRead && (
                <Badge bg="primary" className="me-2">
                  New
                </Badge>
              )}
              {notification.message}
            </span>
            {!notification.isRead && (
              <Button
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
    </section>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      isRead: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onChanged: PropTypes.func.isRequired,
};

export default NotificationList;
