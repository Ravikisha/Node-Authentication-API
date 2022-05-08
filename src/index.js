// imports:
const express = require("express");
const app = express();
const port = process.env.PORT | 3000;
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
// const cors = require('cors');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtgenerator = require("../utils/token");
const validation = require("../middleware/validate");
const authorization = require("../middleware/auth");
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.json({
    info: "this is main link",
  });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Register a user
app.post("/register", validation, async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        first_name,
        last_name,
        password: hashedPassword,
      },
    });
    // res.json(user);

    //genrate the token
    const token = jwtgenerator(user.id);
    res.json({ token: token });
  } catch (e) {
    console.log(e);
  }
});

//login route
app.post("/login", validation, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Password is incorrect");
    }
    const token = jwtgenerator(user.id);
    res.json({ token: token });
  } catch (e) {
    console.log(e);
  }
});

//verify status
app.get("/is-verify", authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//protected route
app.get("/dashboard", authorization, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user },
      include: { tasks: true },
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

//add tasks
app.post("/addtask", authorization, async (req, res) => {
  try {
    const { name, desc } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user },
    });
    const task = await prisma.task.create({
      data: {
        name,
        description: desc,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    res.json(task);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//update tasks
app.post("/updatetask", authorization, async (req, res) => {
  try {
    const { id, name, desc } = req.body;
    // const user = await prisma.user.findUnique({
    //   where: { id: req.user },
    // });
    //update task of user
    const update = await prisma.user.update({
      where: { id: req.user },
      data: {
        tasks: {
          update: {
            where: { id: id },
            data: {
              name,
              description: desc,
            },
          },
        },
      },
    });

    res.json(update);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

//app listen on port 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
