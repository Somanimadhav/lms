// scripts/cleanIssuedBooks.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); 
const Book = require(path.join(__dirname, "../models/Book"));
const User = require("../models/User");

dotenv.config({ path: "../../.env" });

async function cleanIssuedBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    for (const user of users) {
      const validBookIds = await Book.find({
        _id: { $in: user.issuedBooks },
      }).distinct("_id");

      if (validBookIds.length !== user.issuedBooks.length) {
        user.issuedBooks = validBookIds;
        await user.save();
        console.log(`Cleaned books for user ${user.username}`);
      }
    }

    console.log("Finished cleaning issued books");
    process.exit(0);
  } catch (err) {
    console.error("Error cleaning issued books:", err);
    process.exit(1);
  }
}

cleanIssuedBooks();
