import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Pagination,
  Row,
} from "react-bootstrap";
import { apiFetch } from "../api.js";
import "./FaqBrowser.css";

const categories = [
  "",
  "Account",
  "Billing",
  "Technical",
  "Security",
  "Orders",
  "Policies",
];
const tags = [
  "",
  "login",
  "password",
  "refund",
  "invoice",
  "setup",
  "outage",
  "privacy",
  "shipping",
  "access",
  "policy",
  "troubleshooting",
  "account",
];

function FaqBrowser({ activeSessionId, onSessionChanged }) {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    let active = true;
    apiFetch(`/faqs?${params}`)
      .then((data) => {
        if (!active) return;
        setFaqs(data.items);
        setPages(data.pages);
        setError("");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [category, page, search, tag]);

  const viewFaq = async (faq) => {
    setSelected(faq);
    if (!activeSessionId) return;
    try {
      await apiFetch(`/sessions/${activeSessionId}/view-faq`, {
        method: "PATCH",
        body: JSON.stringify({ faqId: faq._id }),
      });
      onSessionChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="faq-browser" aria-labelledby="faq-heading">
      <div className="section-heading">
        <div>
          <h2 id="faq-heading">FAQ library</h2>
          <p>Search common support questions by title or category.</p>
        </div>
        {!activeSessionId && (
          <Badge bg="secondary">Start a session to track views</Badge>
        )}
      </div>
      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Label htmlFor="faq-search">Search titles</Form.Label>
          <Form.Control
            id="faq-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Enter a keyword"
          />
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="faq-category">Category</Form.Label>
          <Form.Select
            id="faq-category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            {categories.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All categories"}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="faq-tag">Tag</Form.Label>
          <Form.Select
            id="faq-tag"
            value={tag}
            onChange={(event) => {
              setTag(event.target.value);
              setPage(1);
            }}
          >
            {tags.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All tags"}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {error && <Alert variant="danger">{error}</Alert>}
      {selected && (
        <Alert variant="info" dismissible onClose={() => setSelected(null)}>
          <Alert.Heading>{selected.question}</Alert.Heading>
          <p className="mb-0 faq-answer">{selected.answer}</p>
        </Alert>
      )}
      <div className="faq-grid">
        {faqs.map((faq) => (
          <Card key={faq._id}>
            <Card.Body>
              <Badge className="mb-2" bg="light" text="dark">
                {faq.category}
              </Badge>
              <Card.Title>{faq.title}</Card.Title>
              <Card.Text>{faq.question}</Card.Text>
              <Button size="sm" onClick={() => viewFaq(faq)}>
                View answer
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
      {!faqs.length && !error && <p>No FAQs match these filters.</p>}
      {pages > 1 && (
        <Pagination className="mt-3">
          <Pagination.Prev
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          />
          <Pagination.Item active>
            {page} / {pages}
          </Pagination.Item>
          <Pagination.Next
            disabled={page === pages}
            onClick={() => setPage((current) => current + 1)}
          />
        </Pagination>
      )}
    </section>
  );
}

FaqBrowser.propTypes = {
  activeSessionId: PropTypes.string,
  onSessionChanged: PropTypes.func.isRequired,
};

FaqBrowser.defaultProps = {
  activeSessionId: null,
};

export default FaqBrowser;
