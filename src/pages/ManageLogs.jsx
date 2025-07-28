import { useEffect, useState } from "react";
import axios from "../axiosInstance";
import "../style/ManageLogs.css"; 

const ManageLogs = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios
      .get("/books/requests")
      .then((res) => setRequests(res.data))
      .catch(() => alert("Failed to fetch requests"));
  }, []);

  const handleAccept = async (id) => {
    await axios.post(`/books/requests/${id}/accept`);
    setRequests(requests.filter((r) => r._id !== id));
  };

  const handleReject = async (id) => {
    await axios.post(`/books/requests/${id}/reject`);
    setRequests(requests.filter((r) => r._id !== id));
  };

  return (
    <div className="manage-container">
      <h2 className="manage-title">Issuance Requests</h2>
      {requests.map((req) =>
        req.bookId && req.userId ? (
          <div key={req._id} className="request-card">
            <div className="request-text">
              <b>{req.userId.username}</b> requested <b>{req.bookId.title}</b>{" "}
              by {req.bookId.author}
            </div>
            <div>
              <button
                onClick={() => handleAccept(req._id)}
                className="action-btn accept-btn"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req._id)}
                className="action-btn reject-btn"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null 
      )}
    </div>
  );
};

export default ManageLogs;
