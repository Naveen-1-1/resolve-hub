import PropTypes from "prop-types";
import { Badge, Table } from "react-bootstrap";
import "./TicketList.css";

function TicketList({ tickets }) {
  return (
    <section className="ticket-list" aria-labelledby="tickets-heading">
      <h2 id="tickets-heading">My tickets</h2>
      {tickets.length ? (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>{ticket.subject}</td>
                <td>{ticket.priority}</td>
                <td>
                  <Badge
                    bg={ticket.status === "resolved" ? "success" : "primary"}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
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
