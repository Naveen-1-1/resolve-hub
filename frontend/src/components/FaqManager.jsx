import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { apiFetch } from "../api.js";
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

  const loadFaqs = useCallback(async (query = "") => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    const data = await apiFetch(`/faqs?${params}`);
    setFaqs(data.items);
  }, []);

  useEffect(() => {
    let active = true;
    apiFetch("/faqs")
      .then((data) => {
        if (active) setFaqs(data.items);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

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
      setMessage(editingId ? "FAQ updated." : "FAQ created.");
      await loadFaqs(search);
    } catch (error) {
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
  };

  const deleteFaq = async (faq) => {
    if (!window.confirm(`Delete "${faq.title}"?`)) return;
    try {
      await apiFetch(`/faqs/${faq._id}`, { method: "DELETE" });
      setMessage("FAQ deleted.");
      await loadFaqs(search);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const searchFaqs = async (event) => {
    event.preventDefault();
    try {
      await loadFaqs(search);
      setMessage(
        search.trim() ? `Showing matches for "${search.trim()}".` : ""
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="faq-manager" aria-labelledby="manage-faq-heading">
      <h2 id="manage-faq-heading">Manage FAQs</h2>
      {message && <Alert variant="info">{message}</Alert>}
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
              variant="outline-secondary"
              onClick={() => {
                setSearch("");
                loadFaqs("").catch((error) => setMessage(error.message));
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Form>
      <Form onSubmit={saveFaq} className="faq-editor">
        <Form.Group className="mb-2" controlId="faq-title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            name="title"
            value={form.title}
            onChange={updateField}
            required
          />
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
              variant="outline-secondary"
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

      <Table responsive hover className="mt-4">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((faq) => (
            <tr key={faq._id}>
              <td>{faq.title}</td>
              <td>{faq.category}</td>
              <td className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => editFaq(faq)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => deleteFaq(faq)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}

export default FaqManager;
