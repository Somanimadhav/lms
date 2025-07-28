import { useEffect, useState } from "react";
import axios from "../axiosInstance";
import { useAuth } from "../context/AuthContext";
import "../style/Home.css";
import { useIssuedBooks } from "../context/IssuedBooksContext";
import SearchBar from "../components/SearchBar";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]); // New state
  const { issuedBooks, setIssuedBooks } = useIssuedBooks();

  const fetchBooks = async () => {
    try {
      const res = await axios.get("/books");
      setBooks(res.data.filter((book) => book && book._id));
    } catch (err) {
      alert("Failed to fetch books");
    }
  };

  const fetchIssuedBooks = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }
    try {
      const res = await axios.get(`/books/issued/${userId}`);
      setIssuedBooks(res.data.filter((book) => book && book._id));
    } catch (err) {
      alert("Failed to fetch issued books");
    }
  };

  const fetchRequestedBooks = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.get(`/books/requested/${userId}`);
      setRequestedBooks(res.data.filter((book) => book && book._id));
    } catch (err) {
      console.error("Failed to fetch requested books");
    }
  };

  const handleIssueRequest = async (bookId) => {
    const userId = localStorage.getItem("userId");

    try {
      const [issuedRes, requestedRes] = await Promise.all([
        axios.get(`/books/issued/${userId}`),
        axios.get(`/books/requested/${userId}`),
      ]);

      const freshIssued = issuedRes.data.filter((book) => book && book._id);
      const freshRequested = requestedRes.data.filter(
        (book) => book && book._id
      );

      const totalRequested = freshIssued.length + freshRequested.length;
      if (totalRequested > 5) {
        alert("You can't request more than 5 books.");
        return;
      }

      await axios.post(`/books/request/${bookId}`, { userId });
      alert("Request sent to admin for approval!");
      // Re-fetch issued and requested books to update state
      fetchIssuedBooks();
      fetchRequestedBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
    fetchRequestedBooks();
  }, [user]);

  return (
    <div className="home-bg">
      <h2 className="home-title">Available Books</h2>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="books-grid">
        {books
          .filter(
            (book) =>
              book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              book.author.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((book) => {
            if (!book || !book._id) return null;

            const isIssuedByUser = issuedBooks.some((b) => b._id === book._id);
            const isRequestedByUser = requestedBooks.some(
              (b) => b._id === book._id
            );

            const isOutOfStock = book.quantity === 0;
            const isIssuedOrRequested =
              isIssuedByUser || isRequestedByUser || isOutOfStock;

            return (
              <div
                key={book._id}
                className={`book-card${
                  isIssuedOrRequested ? " opacity-50" : ""
                }`}
              >
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>

                {book.description && (
                  <div className="book-description">{book.description}</div>
                )}

                <div className="book-actions">
                  {!isIssuedOrRequested && (
                    <button
                      onClick={() => handleIssueRequest(book._id)}
                      className="issue-btn"
                    >
                      Request Issue
                    </button>
                  )}
                  {isIssuedByUser ? (
                    <button className="return-btn" disabled>
                      Issued
                    </button>
                  ) : isRequestedByUser ? (
                    <button className="return-btn" disabled>
                      Pending Approval
                    </button>
                  ) : isOutOfStock ? (
                    <button className="return-btn" disabled>
                      Not Available
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
