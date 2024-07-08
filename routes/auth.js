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
      email: req.body.email
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
    res.status(201).send({ message: "User successfully registered.", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // check that username exists
    if (req.session.user_id)
    {
      throw { status: 409, message: "User already logged in" };
    } 
    const users = await DButils.execQuery("SELECT user_name FROM Users");
    if (!users.find((x) => x.user_name === req.body.username))
      throw { status: 401, message: "Invalid input, username or password is invalid." };

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
  try 
  {
    if (req.session.user_id)
    {
      req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
      res.send({ success: true, message: "logout succeeded" });
    } else {
      throw { status: 409, message: "You are not logged in." };
    } 
  } catch (error) {
    next(error);
  }


});

module.exports = router;