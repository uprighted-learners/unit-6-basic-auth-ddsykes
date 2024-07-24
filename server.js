const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//mongodb connection
mongoose.connect("mongodb://localhost:27017/users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connect to MongoDB");
});

//Creating the user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

//Creatinng the Routes

app.post("/signup", async (req, res) => {
  const saltRounds = parseInt(process.env.SALT);
  bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
    if (err) return res.status(500).send("Error encrypting the password");
    const newUser = new User({
      username: req.body.username,
      password: hash,
    });
    try {
      await newUser.save();
      res.redirect("/");
    } catch (error) {
      res.status(500).send("Error saving the user");
    }
  });
});
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(403).send("Access Denied");
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err || !result) return res.status(403).send("Access denied");
      res.redirect(`/dashboard/${user.username}`);
    });
  } catch (error) {
    res.status(500).send("Error logging in");
  }
});
app.get("/dashboard/:username", (req, res) => {
  res.send(`Welcome to your dashboard, ${req.params.username}`);
});
app.listen(port, () => {
  console.log(`Server is running on the http://localhost:${port}`);
});
