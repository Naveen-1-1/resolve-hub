import PropTypes from "prop-types";
import { Alert, Button, Modal } from "react-bootstrap";

function ActionFeedback({ message, variant = "success", onClose }) {
  if (!message) return null;

  if (variant === "danger") {
    return (
      <Alert className="action-feedback" variant={variant} role="alert">
        {message}
      </Alert>
    );
  }

  return (
    <Modal centered onHide={onClose} show>
      <Modal.Header closeButton>
        <Modal.Title>Success</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Continue</Button>
      </Modal.Footer>
    </Modal>
  );
}

ActionFeedback.propTypes = {
  message: PropTypes.string,
  variant: PropTypes.string,
  onClose: PropTypes.func,
};

ActionFeedback.defaultProps = {
  message: "",
  variant: "success",
  onClose: undefined,
};

export default ActionFeedback;
