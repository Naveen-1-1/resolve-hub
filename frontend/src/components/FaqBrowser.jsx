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
import ActionFeedback from "./ActionFeedback.jsx";
import { scrollToSection } from "../scrollToSection.js";
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

function FaqBrowser({ activeSessionId, viewedFaqIds, onSessionChanged }) {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  useEffect(() => {
    if (selected) scrollToSection("faq-answer");
  }, [selected]);

  const changePage = (nextPage) => {
    setPage(nextPage);
    scrollToSection("faq-results");
  };

  const viewFaq = async (faq) => {
    setSelected(faq);
    if (!activeSessionId) return;
    try {
      await apiFetch(`/sessions/${activeSessionId}/view-faq`, {
        method: "PATCH",
        body: JSON.stringify({ faqId: faq._id }),
      });
      setMessage("FAQ saved to your active support session.");
      onSessionChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="faq-browser" aria-labelledby="faq-heading">
      <div className="section-heading">
        <div>
          <h2 id="faq-heading" tabIndex="-1">
            FAQ library
          </h2>
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
            aria-describedby="faq-category-help"
          >
            {categories.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All categories"}
              </option>
            ))}
          </Form.Select>
          <Form.Text id="faq-category-help">
            Groups FAQs by their main support topic.
          </Form.Text>
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
            aria-describedby="faq-tag-help"
          >
            {tags.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All tags"}
              </option>
            ))}
          </Form.Select>
          <Form.Text id="faq-tag-help">
            Describes keywords associated with an FAQ.
          </Form.Text>
        </Col>
      </Row>
      <ActionFeedback message={message} onClose={() => setMessage("")} />
      {error && <Alert variant="danger">{error}</Alert>}
      {selected && (
        <Alert
          id="faq-answer"
          tabIndex="-1"
          variant="info"
          dismissible
          onClose={() => setSelected(null)}
        >
          <h3 className="alert-heading">{selected.question}</h3>
          <p className="mb-0 faq-answer">{selected.answer}</p>
        </Alert>
      )}
      <div
        className="faq-grid"
        id="faq-results"
        role="region"
        aria-labelledby="faq-heading"
        tabIndex="-1"
      >
        {faqs.map((faq) => (
          <Card as="article" key={faq._id}>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <Badge bg="light" text="dark">
                  {faq.category}
                </Badge>
                {viewedFaqIds.includes(faq._id) && (
                  <Badge bg="success">Viewed in this session</Badge>
                )}
              </div>
              <Card.Title as="h3">{faq.title}</Card.Title>
              <Card.Text>{faq.question}</Card.Text>
              <Button
                aria-label={`View answer for ${faq.title}`}
                size="sm"
                onClick={() => viewFaq(faq)}
              >
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
            onClick={() => changePage(page - 1)}
          />
          <Pagination.Item active aria-current="page">
            {page} / {pages}
          </Pagination.Item>
          <Pagination.Next
            disabled={page === pages}
            onClick={() => changePage(page + 1)}
          />
        </Pagination>
      )}
    </section>
  );
}

FaqBrowser.propTypes = {
  activeSessionId: PropTypes.string,
  viewedFaqIds: PropTypes.arrayOf(PropTypes.string),
  onSessionChanged: PropTypes.func.isRequired,
};

FaqBrowser.defaultProps = {
  activeSessionId: null,
  viewedFaqIds: [],
};

export default FaqBrowser;
