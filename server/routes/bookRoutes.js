const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const User = require("../models/User");
const IssuanceRequest = require("../models/IssuanceRequest");

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a book
router.post("/", async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a book
router.put("/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a book
router.delete("/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get issued books for a user
router.get("/issued/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("issuedBooks");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.issuedBooks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Issue a book
router.post("/issue/:bookId", async (req, res) => {
  const { userId } = req.body;
  const { bookId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.issuedBooks.includes(bookId)) {
      return res.status(400).json({ message: "Book already issued" });
    }

    if (user.issuedBooks.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 books can be issued" });
    }

    user.issuedBooks.push(bookId);
    await user.save();
    res
      .status(200)
      .json({ message: "Book issued", issuedBooks: user.issuedBooks });
  } catch (err) {
    res.status(500).json({ message: "Error issuing book", error: err.message });
  }
});

// Return a book
router.post("/return/:bookId", async (req, res) => {
  const { userId } = req.body;
  const { bookId } = req.params;

  try {
    const user = await User.findById(userId);
    const book = await Book.findById(bookId);
    if (!user || !book)
      return res.status(404).json({ message: "User or Book not found" });

    const before = user.issuedBooks.length;
    user.issuedBooks = user.issuedBooks.filter(
      (b) => (b._id ? b._id.toString() : b.toString()) !== bookId
    );
    if (user.issuedBooks.length === before) {
      return res.status(400).json({ message: "Book not issued to user" });
    }

    await user.save();
    book.quantity += 1;
    await book.save();

    // Archive accepted request
    await IssuanceRequest.updateMany(
      { userId, bookId, status: "accepted" },
      { $set: { status: "returned", archived: true } }
    );

    res.status(200).json({ message: "Book returned successfully" });
  } catch (err) {
    console.error("Return error:", err);
    res.status(500).json({ message: "Server error during return" });
  }
});

// Request to issue a book
router.post("/request/:bookId", async (req, res) => {
  const { userId } = req.body;
  const { bookId } = req.params;

  try {
    const existing = await IssuanceRequest.findOne({
      userId,
      bookId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Request already pending for this book." });
    }

    const request = await IssuanceRequest.create({ userId, bookId });
    res.status(201).json({ message: "Request created", request });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating request", error: err.message });
  }
});

// Admin - Get all pending requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await IssuanceRequest.find({
      status: "pending",
      archived: false,
    })
      .populate("userId", "username")
      .populate("bookId", "title author");
    res.json(requests);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching requests", error: err.message });
  }
});

// Admin - Accept a request
router.post("/requests/:requestId/accept", async (req, res) => {
  try {
    const request = await IssuanceRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const user = await User.findById(request.userId);
    const book = await Book.findById(request.bookId);
    if (!user || !book)
      return res.status(404).json({ message: "User or Book not found" });

    if (book.quantity <= 0) {
      return res.status(400).json({ message: "Book not available" });
    }

    request.status = "accepted";
    request.archived = true;
    await request.save();

    if (!user.issuedBooks.includes(request.bookId)) {
      user.issuedBooks.push(request.bookId);
      await user.save();

      book.quantity -= 1;
      await book.save();
    }

    res.json({ message: "Request accepted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error accepting request", error: err.message });
  }
});

// Admin - Reject a request
router.post("/requests/:requestId/reject", async (req, res) => {
  try {
    const request = await IssuanceRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    request.archived = true;
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error rejecting request", error: err.message });
  }
});

// Requested books by user
router.get("/requested/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const requests = await IssuanceRequest.find({
      userId,
      status: "pending",
      archived: false,
    }).populate("bookId");

    const books = requests.map((req) => req.bookId).filter(Boolean);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requested books" });
  }
});

// Issued book details from requests collection
router.get("/issued-details/:userId", async (req, res) => {
  try {
    const issued = await IssuanceRequest.find({
      userId: req.params.userId,
      status: "accepted",
    }).populate("bookId");

    const books = issued
      .filter((entry) => entry.bookId && entry.bookId._id)
      .map((entry) => entry.bookId);

    // Remove duplicates
    const seen = new Set();
    const uniqueBooks = books.filter((b) => {
      const id = b._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.json(uniqueBooks);
  } catch (err) {
    console.error("Error fetching issued books:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
