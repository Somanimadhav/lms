import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Books from "./pages/Books";
import IssuedBooks from "./pages/IssuedBooks";
import ManageLogs from "./pages/ManageLogs";
import { IssuedBooksProvider } from "./context/IssuedBooksContext";
import "./style/Navbar.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <IssuedBooksProvider>
      {" "}
      <div>
        {!hideNavbar && (
          <nav className="navbar">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/issued-books" className="nav-link">
              Issued Books
            </Link>
            {role === "admin" && (
              <>
                <Link to="/admin/books" className="nav-link">
                  Manage Books
                </Link>
                <Link to="/admin/logs" className="nav-link">
                  Issuance Logs
                </Link>
              </>
            )}
            {!userId ? (
              <Link to="/login" className="nav-link">
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{ border: "none" }}
              >
                Logout
              </button>
            )}
          </nav>
        )}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute adminOnly={true}>
                <Books />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issued-books"
            element={
              <ProtectedRoute>
                <IssuedBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageLogs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </IssuedBooksProvider>
  );
}

export default App;
