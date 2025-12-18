import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // ✅ Edit UI state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  async function load() {
    setError("");
    const res = await fetch(`${API}/api/feedback`);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!comment.trim()) return setError("Please write a comment.");

    const res = await fetch(`${API}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(rating), comment }),
    });

    if (!res.ok) return setError("Failed to submit feedback.");

    setComment("");
    setRating(5);
    load();
  }

  async function remove(id) {
    await fetch(`${API}/api/feedback/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  }

  // ✅ Start editing a row
  function startEdit(item) {
    setEditingId(item.id);
    setEditRating(item.rating);
    setEditComment(item.comment);
    setError("");
  }

  // ✅ Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  }

  // ✅ Save edits (PUT)
  async function saveEdit(id) {
    setError("");

    if (!editComment.trim()) return setError("Comment is required.");

    const res = await fetch(`${API}/api/feedback/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(editRating), comment: editComment }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error || "Failed to update feedback.");
    }

    cancelEdit();
    load();
  }

  // ✅ Simple responsive-ish container padding
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16, fontFamily: "Arial" }}>
      <h1>Student Feedback Dashboard</h1>

      <h2>Student: Submit Feedback</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          Rating (1–5):
          <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ marginLeft: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label>
          Comment:
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        </label>

        <button type="submit" style={{ padding: "10px 14px", cursor: "pointer" }}>
          Submit
        </button>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h2>Instructor: View Feedback</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={load} style={{ padding: "10px 14px", cursor: "pointer" }}>
          Refresh
        </button>
        {editingId !== null && (
          <small style={{ opacity: 0.8 }}>Editing feedback #{editingId}</small>
        )}
      </div>

      <ul style={{ paddingLeft: 18 }}>
        {items.map((x) => (
          <li key={x.id} style={{ margin: "12px 0" }}>
            {editingId === x.id ? (
              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  Rating:
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                    style={{ marginLeft: 8 }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Comment:
                  <textarea
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => saveEdit(x.id)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => remove(x.id)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <b>{x.rating}/5</b> — {x.comment}
                <br />
                <small>{new Date(x.created_at).toLocaleString()}</small>
                <br />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                  <button
                    onClick={() => startEdit(x)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(x.id)}
                    style={{ padding: "10px 14px", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
