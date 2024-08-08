const express = require("express");
const fs = require("fs");
const path = require("path");
const { readJSONFile } = require("../utils/fileUtils");
const { writeJSONFile } = require("../utils/fileUtils");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const employeesFilePath = path.join(__dirname, "../data/employees.json");

//
router.get("/get_all", authMiddleware, (req, res) => {
  try {
    const employees = readJSONFile(employeesFilePath);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/se", authMiddleware, (req, res) => {
  try {
    const employees = readJSONFile(employeesFilePath);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const { tr_title, department, division, floor, time } = req.body;
    // console.log(req.body);

    try {
      const employees = readJSONFile(employeesFilePath);
      const newEmployee = {
        id: uuidv4(),
        tr_title,
        department,
        division,
        floor,
        time,
      };
      employees.push(newEmployee);
      writeJSONFile(employeesFilePath, employees);
      res.status(201).json({ message: "Employee created" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.put(
  "/edit/:id",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    const { tr_title, department, division, floor, time } = req.body;
    // console.log(req.params.id);
    console.log(req.body);

    try {
      const employees = readJSONFile(employeesFilePath);
      const employeeIndex = employees.findIndex(
        (tr) => tr.id === req.params.id
      );

      if (employeeIndex === -1)
        return res.status(404).json({ message: "Employee not found" });

      if (tr_title) {
        employees[employeeIndex].tr_title = tr_title;
      }
      if (division) {
        employees[employeeIndex].division = division;
      }
      if (floor) {
        employees[employeeIndex].floor = floor;
      }
      if (time) {
        employees[employeeIndex].time = time;
      }
      if (department) {
        employees[employeeIndex].department = department;
      }
      writeJSONFile(employeesFilePath, employees);
      res.json({ message: "Employee updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin", "HR"),
  (req, res) => {
    try {
      const employees = readJSONFile(employeesFilePath);
      const filteredEmployee = employees.filter(
        (tr) => tr.id !== req.params.id
      );
      console.log(req.params.id);

      writeJSONFile(employeesFilePath, filteredEmployee);
      res.json({ message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
