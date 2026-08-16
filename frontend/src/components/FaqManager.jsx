import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Pagination, Table } from "react-bootstrap";
import { apiFetch } from "../api.js";
import ActionFeedback from "./ActionFeedback.jsx";
import { scrollToSection } from "../scrollToSection.js";
import "./FaqManager.css";

const emptyForm = {
  title: "",
  question: "",
  answer: "",
  category: "Account",
  tags: "",
};

function FaqManager() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageVariant, setMessageVariant] = useState("success");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFaqs = useCallback(async (query = "", nextPage = 1) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    params.set("page", String(nextPage));
    const data = await apiFetch(`/faqs?${params}`);
    return data;
  }, []);

  const loadFaqs = useCallback(
    async (query = "", nextPage = 1) => {
      const data = await fetchFaqs(query, nextPage);
      setFaqs(data.items);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    },
    [fetchFaqs]
  );

  useEffect(() => {
    let active = true;
    fetchFaqs()
      .then((data) => {
        if (!active) return;
        setFaqs(data.items);
        setPage(data.page);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((error) => {
        if (active) {
          setMessageVariant("danger");
          setMessage(error.message);
        }
      });
    return () => {
      active = false;
    };
  }, [fetchFaqs]);

  const saveFaq = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      await apiFetch(editingId ? `/faqs/${editingId}` : "/faqs", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setForm(emptyForm);
      setEditingId(null);
      setMessageVariant("success");
      setMessage(editingId ? "FAQ updated." : "FAQ created.");
      await loadFaqs(search, page);
      scrollToSection("faq-list");
    } catch (error) {
      setMessageVariant("danger");
      setMessage(error.message);
    }
  };

  const editFaq = (faq) => {
    setEditingId(faq._id);
    setForm({
      title: faq.title,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags.join(", "),
    });
    scrollToSection("faq-editor");
  };

  const deleteFaq = (faq) => {
    setDeleteTarget(faq);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/faqs/${deleteTarget._id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setMessageVariant("success");
      setMessage("FAQ deleted.");
      await loadFaqs(search, page);
      scrollToSection("faq-list");
    } catch (error) {
      setMessageVariant("danger");
      setMessage(error.message);
    }
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const searchFaqs = async (event) => {
    event.preventDefault();
    try {
      await loadFaqs(search, 1);
      setMessage("");
      scrollToSection("faq-list");
    } catch (error) {
      setMessageVariant("danger");
      setMessage(error.message);
    }
  };

  const changePage = async (nextPage) => {
    try {
      await loadFaqs(search, nextPage);
      scrollToSection("faq-list");
    } catch (error) {
      setMessageVariant("danger");
      setMessage(error.message);
    }
  };

  return (
    <section className="faq-manager" aria-labelledby="manage-faq-heading">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <h2 id="manage-faq-heading" tabIndex="-1">
            Manage FAQs
          </h2>
          <p className="text-muted mb-0">
            {total} FAQ{total === 1 ? "" : "s"} available
          </p>
        </div>
        {editingId && (
          <Button
            variant="outline-secondary"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              scrollToSection("faq-editor");
            }}
          >
            New FAQ
          </Button>
        )}
      </div>
      <ActionFeedback
        message={message}
        onClose={() => setMessage("")}
        variant={messageVariant}
      />
      <Form onSubmit={searchFaqs} className="faq-search mb-3">
        <Form.Label htmlFor="manage-faq-search">
          Find an FAQ to edit or delete
        </Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            id="manage-faq-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search FAQ titles"
          />
          <Button type="submit" variant="outline-primary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setSearch("");
                loadFaqs("", 1)
                  .then(() => scrollToSection("faq-list"))
                  .catch((error) => {
                    setMessageVariant("danger");
                    setMessage(error.message);
                  });
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Form>
      <Form
        id="faq-editor"
        onSubmit={saveFaq}
        className="faq-editor"
        aria-labelledby="faq-editor-heading"
        tabIndex="-1"
      >
        <h3 id="faq-editor-heading">{editingId ? "Edit FAQ" : "Create FAQ"}</h3>
        <p className="text-muted">
          {editingId
            ? "Update the selected FAQ, then save your changes."
            : "Create a new FAQ for the knowledge base."}
        </p>
        <Form.Group className="mb-2" controlId="faq-title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            name="title"
            value={form.title}
            onChange={updateField}
            required
            maxLength={120}
            aria-describedby="faq-title-help"
          />
          <Form.Text id="faq-title-help">
            {form.title.length}/120 characters
          </Form.Text>
        </Form.Group>
        <Form.Group className="mb-2" controlId="faq-question">
          <Form.Label>Question</Form.Label>
          <Form.Control
            name="question"
            value={form.question}
            onChange={updateField}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="faq-answer">
          <Form.Label>Answer</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="answer"
            value={form.answer}
            onChange={updateField}
            required
          />
        </Form.Group>
        <div className="faq-editor-row">
          <Form.Group controlId="faq-category">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={form.category}
              onChange={updateField}
            >
              {[
                "Account",
                "Billing",
                "Technical",
                "Security",
                "Orders",
                "Policies",
              ].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="faq-tags">
            <Form.Label>Tags (comma separated)</Form.Label>
            <Form.Control
              name="tags"
              value={form.tags}
              onChange={updateField}
              required
            />
          </Form.Group>
        </div>
        <div className="d-flex gap-2 mt-3">
          <Button type="submit">
            {editingId ? "Update FAQ" : "Create FAQ"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline-danger"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Form>

      <Table id="faq-list" responsive hover className="mt-4" tabIndex="-1">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Category</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq._id}>
              <td>{faq.title}</td>
              <td>{faq.category}</td>
              <td className="d-flex gap-2">
                <Button
                  aria-label={`Edit FAQ: ${faq.title}`}
                  size="sm"
                  variant="outline-primary"
                  onClick={() => editFaq(faq)}
                >
                  Edit
                </Button>
                <Button
                  aria-label={`Delete FAQ: ${faq.title}`}
                  size="sm"
                  variant="outline-danger"
                  onClick={() => deleteFaq(faq)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {!faqs.length && (
            <tr>
              <td className="text-center text-muted" colSpan={3}>
                {search.trim()
                  ? `No FAQs match "${search.trim()}".`
                  : "No FAQs available yet."}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {pages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination aria-label="FAQ pages">
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
        </div>
      )}
      <Modal
        centered
        onHide={() => setDeleteTarget(null)}
        show={Boolean(deleteTarget)}
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2">Delete FAQ?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently remove <strong>{deleteTarget?.title}</strong>.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-danger"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete FAQ
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default FaqManager;
