const bcrypt = require("bcryptjs");
const User = require("../models/User");
const createToken = require("../utils/createToken");

exports.register = async (req, res) => {
  const { fullName, username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName, // <-- include this
      username,
      password: hashedPassword,
      role: role || "student",
    });

    const token = createToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
