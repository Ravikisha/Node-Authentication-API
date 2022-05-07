// create a express server
const express = require("express");
const app = express();
const port = process.env.PORT | 3000;
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
// const cors = require('cors');
const bcrypt  = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config()

const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.json({
    info: "this is / link",
  });
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Register a user
app.post("/register", async (req, res) => {
    try{
        const {first_name, last_name, email, password} = req.body;

        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
          }
      
          // check if user already exist
          // Validate if user exist in our database
          const oldUser = await prisma.user.findUnique({ 
              where: {
                    email: email
              }
           });
      
          if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
          }
      
          //Encrypt user password
          encryptedPassword = await bcrypt.hash(password, 10);

          const user = await prisma.user.create({
              data: {
                  email: email.toLowerCase(),
                  first_name,
                  last_name,
                  password: encryptedPassword
              }
          })
          const token = jwt.sign(
            {user_id: user._id, email},
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "2h",
            }
          );
          user.token = token;

          res.status(201).json(user);
    }catch(e){
        console.log(e)
    }
});

// app.post("/add", async (req, res) => {
//     const { name, email, password } = req.body;
//     const user = await prisma.user.create({
//         data: {
//             name,
//             email,
//             password,
//         },
//     });
//     res.json(user);
// })

//app listen on port 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
