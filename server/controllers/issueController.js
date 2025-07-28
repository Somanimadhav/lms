const IssuanceRequest = require("../models/IssuanceRequest");

const getIssuedBooks = async (req, res) => {
  const { userId } = req.params;

  try {
    const issued = await IssuanceRequest.find({
      userId,
      status: "accepted", // Only accepted ones are considered issued
    }).populate("bookId");

    const books = issued.map((entry) => entry.bookId);
    res.json(books);
  } catch (err) {
    console.error("Error fetching issued books:", err);
    res.status(500).json({ message: "Server error" });
  }
};
