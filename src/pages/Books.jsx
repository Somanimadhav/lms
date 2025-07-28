import { useEffect, useState } from "react";
import axios from "../axiosInstance";
import "../style/Home.css"; 

const Books = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchBooks = async () => {
    const res = await axios.get("/books");
    setBooks(res.data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/books/${editId}`, formData);
    } else {
      await axios.post("/books", formData);
    }
    setFormData({ title: "", author: "", description: "" });
    setEditId(null);
    fetchBooks();
  };

  const handleEdit = (book) => {
    setFormData(book);
    setEditId(book._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`/books/${id}`);
    fetchBooks();
  };

  return (
    <div className="home-bg">
      <h2 className="home-title">{editId ? "Update Book" : "Add Book"}</h2>
      <form onSubmit={handleSubmit} className="book-form">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Book Title"
          required
        />
        <input
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Author"
        />
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Description"
        />
        <button
          type="submit"
          className="issue-btn"
          style={{ alignItems: "center" }}
        >
          {editId ? "Update Book" : "Add Book"}
        </button>
      </form>

      <h3 className="home-title">Books List</h3>

      <div className="books-grid">
        {books.map((book) => (
          <div key={book._id} className="book-card">
            <div className="book-title">{book.title || "Untitled"}</div>
            <div className="book-author">{book.author || "Unknown Author"}</div>
            <div
              className="book-description"
              style={{
                fontSize: "0.9rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {book.description || "No description"}
            </div>
            <div className="book-actions">
              <button onClick={() => handleEdit(book)} className="return-btn">
                Edit
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="return-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
