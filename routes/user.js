const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();
const usersFilePath = path.join(__dirname, "../data/users.json");

// Получить всех пользователей
router.get("/get_users", authMiddleware, (req, res) => {
  try {
    const users = readJSONFile(usersFilePath);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get user info
router.get("/get_user/:id", authMiddleware, (req, res) => {
  try {
    const users = readJSONFile(usersFilePath);
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.fullname);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создание пользователя (доступно только для admin и HR)
router.post(
  "/create_user",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const { username, email, job_title, department, tel, password, role } =
      req.body;

    try {
      const users = readJSONFile(usersFilePath);
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        id: uuidv4(),
        username,
        fullname,
        email,
        job_title,
        department,
        tel,
        password: hashedPassword,
        role,
      };
      users.push(newUser);
      writeJSONFile(usersFilePath, users);
      res.status(201).json({ message: "User created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Обновление пользователя (доступно только для admin и HR)
router.put(
  "update_user/:username",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const {
      username,
      fullname,
      email,
      job_title,
      department,
      tel,
      password,
      role,
    } = req.body;

    try {
      const users = readJSONFile(usersFilePath);
      const userIndex = users.findIndex(
        (u) => u.username === req.params.username
      );
      if (userIndex === -1)
        return res.status(404).json({ message: "User not found" });

      if (password) {
        users[userIndex].password = bcrypt.hashSync(password, 10);
      }
      if (role) {
        users[userIndex].role = role;
      }
      if (username) {
        users[userIndex].username = username;
      }
      if (fullname) {
        users[userIndex].fullname = fullname;
      }
      if (email) {
        users[userIndex].email = email;
      }
      if (job_title) {
        users[userIndex].job_title = job_title;
      }
      if (department) {
        users[userIndex].department = department;
      }
      if (tel) {
        users[userIndex].tel = department;
      }
      writeJSONFile(usersFilePath, users);
      res.json({ message: "User updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Удаление пользователя (доступно только для admin и HR)
router.delete(
  "delete_user/:username",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    try {
      const users = readJSONFile(usersFilePath);
      const filteredUsers = users.filter(
        (u) => u.username !== req.params.username
      );
      writeJSONFile(usersFilePath, filteredUsers);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
