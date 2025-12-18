import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const res = await fetch(`${API}/api/feedback`);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

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
    load();
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Student Feedback Dashboard</h1>

      <h2>Student: Submit Feedback</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          Rating (1–5):
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label>
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </label>

        <button type="submit">Submit</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>

      <hr style={{ margin: "30px 0" }} />

      <h2>Instructor: View Feedback</h2>
      <button onClick={load}>Refresh</button>

      <ul style={{ paddingLeft: 18 }}>
        {items.map((x) => (
          <li key={x.id} style={{ margin: "12px 0" }}>
            <b>{x.rating}/5</b> — {x.comment}
            <br />
            <small>{new Date(x.created_at).toLocaleString()}</small>
            <br />
            <button onClick={() => remove(x.id)} style={{ marginTop: 6 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
