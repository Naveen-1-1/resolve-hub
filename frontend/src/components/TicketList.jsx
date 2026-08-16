import PropTypes from "prop-types";
import { Badge, Table } from "react-bootstrap";
import TicketStatusProgress from "./TicketStatusProgress.jsx";
import "./TicketList.css";

function TicketList({ tickets }) {
  return (
    <section
      className="ticket-list"
      id="customer-tickets"
      aria-labelledby="tickets-heading"
      tabIndex="-1"
    >
      <h2 id="tickets-heading">My tickets</h2>
      {tickets.length ? (
        <Table responsive hover>
          <thead>
            <tr>
              <th scope="col">Subject</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr id={`ticket-${ticket._id}`} key={ticket._id} tabIndex="-1">
                <td>{ticket.subject}</td>
                <td>{ticket.priority}</td>
                <td>
                  <Badge
                    bg={ticket.status === "resolved" ? "success" : "primary"}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                  <TicketStatusProgress status={ticket.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No tickets yet.</p>
      )}
    </section>
  );
}

TicketList.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TicketList;
