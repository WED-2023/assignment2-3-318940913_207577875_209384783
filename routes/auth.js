var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
    };

    if (
      !user_details.username ||
      !user_details.firstname ||
      !user_details.lastname ||
      !user_details.country ||
      !user_details.password ||
      !user_details.email
    ) {
      throw { status: 400, message: "All fields are required." };
    }

    // Validate username
    if (!/^[a-zA-Z]{3,8}$/.test(user_details.username)) {
      throw {
        status: 400,
        message:
          "Username length should be between 3-8 characters long and only contain alphabetic characters.",
      };
    }

    // Validate first name
    if (!/^[a-zA-Z]+$/.test(user_details.firstname)) {
      throw {
        status: 400,
        message: "First name must only contain alphabetic characters.",
      };
    }

    // Validate last name
    if (!/^[a-zA-Z]+$/.test(user_details.lastname)) {
      throw {
        status: 400,
        message: "Last name must only contain alphabetic characters.",
      };
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(user_details.email)) {
      throw {
        status: 400,
        message: "Email must be valid.",
      };
    }

    // Validate country
    if (!user_details.country) {
      throw { status: 400, message: "Country is required." };
    }

    // Validate password
    if (
      user_details.password.length < 5 ||
      user_details.password.length > 10 ||
      !/\d/.test(user_details.password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(user_details.password)
    ) {
      throw {
        status: 400,
        message:
          "Password must be between 5-10 characters long and contain at least one number and one special character.",
      };
    }

    let users = [];
    users = await DButils.execQuery("SELECT user_name from Users");

    if (users.find((x) => x.user_name === user_details.username))
      throw { status: 409, message: "Username already exists." };

    // add the new username
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO Users (user_name, first_name, last_name, country, password, email) VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );
    res
      .status(201)
      .send({ message: "User successfully registered.", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password)
      throw { status: 400, message: "All fields are required." };
    // check that username exists
    if (req.session.user_id)
      throw { status: 409, message: "User already logged in" };
    const users = await DButils.execQuery("SELECT user_name FROM Users");
    if (!users.find((x) => x.user_name === req.body.username))
      throw {
        status: 401,
        message: "Invalid input, username or password is invalid.",
      };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM Users WHERE user_name = '${req.body.username}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res, next) {
  try {
    if (req.session.user_id) {
      req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
      res.send({ success: true, message: "Logout succeeded." });
    } else {
      throw { status: 409, message: "You are not logged in." };
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
