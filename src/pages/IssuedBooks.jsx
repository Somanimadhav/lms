import { useEffect, useState } from "react";
import axios from "../axiosInstance";
import "../style/Home.css";
import { useIssuedBooks } from "../context/IssuedBooksContext";

const IssuedBooks = () => {
  const { issuedBooks, setIssuedBooks } = useIssuedBooks();
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null); 

  const fetchIssuedBooks = async () => {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setIssuedBooks([]);
      setLoading(false);
      alert("User ID not found. Please log in again.");
      return;
    }
    try {
      const res = await axios.get(`/books/issued-details/${userId}`);
      const cleaned = res.data.filter(
        (book) => book && typeof book === "object" && book._id && book.title
      );
      setIssuedBooks(cleaned);
    } catch (err) {
      console.error("Issued books error:", err);
      alert("Failed to fetch issued books");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (bookId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }
    setReturning(bookId);
    try {
      await axios.post(`/books/return/${bookId}`, { userId });
      alert("Book returned successfully!");
      await fetchIssuedBooks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Return failed");
    } finally {
      setReturning(null);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  return (
    <div className="home-bg">
      <h2 className="home-title">Your Issued Books</h2>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>
      ) : issuedBooks.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          No books issued.
        </div>
      ) : (
        <div className="books-grid">
          {issuedBooks
            .filter((book) => book && book._id && book.title)
            .map((book) => (
              <div key={book._id} className="book-card">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author}</div>
                <button
                  className="return-btn"
                  onClick={() => handleReturn(book._id)}
                  disabled={returning === book._id}
                >
                  {returning === book._id ? "Returning..." : "Return"}
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default IssuedBooks;
