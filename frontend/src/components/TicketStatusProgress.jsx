import PropTypes from "prop-types";
import "./TicketStatusProgress.css";

const statuses = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

function TicketStatusProgress({ status }) {
  const currentIndex = statuses.findIndex((item) => item.value === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div
      className="ticket-status-progress"
      aria-label={`Ticket status: ${statuses[activeIndex].label}`}
    >
      {statuses.map((item, index) => (
        <div
          className={`ticket-status-step ${
            index < activeIndex ? "is-complete" : ""
          } ${index === activeIndex ? "is-current" : ""}`}
          key={item.value}
          aria-current={index === activeIndex ? "step" : undefined}
        >
          <span className="ticket-status-stop">{index + 1}</span>
          <span className="ticket-status-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

TicketStatusProgress.propTypes = {
  status: PropTypes.oneOf(["open", "in_progress", "resolved"]).isRequired,
};

export default TicketStatusProgress;
