require("dotenv").config();
const express = require("express");
const app = express();

const connectToDb = require("./db/conn");

const path = require("path");
const validator = require("validator");
const Register = require("./models/register");
const Subscribe = require("./models/subscribe");
const ContactForm = require("./models/contactus");
const BookingForm = require("./models/booking");
const auth = require("./middleware/auth");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Swal = require("sweetalert");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

// setting path variables
const staticPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// using code in json format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// using static files
app.use(express.static(staticPath));

// using template engine files
app.set("view engine", "hbs");
app.set("views", viewsPath);

// using partials file
hbs.registerPartials(partialsPath);

//register routers
var ourBookings = BookingForm.find({});
var ourSubs = Subscribe.find({});
var ourRegisteres = Register.find({});
var ourContacts = ContactForm.find({});

// routers
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register", {});
});

app.get("/login", (req, res) => {
  res.render("register", {});
});

app.get("/home", auth, (req, res) => {
  res.render("home", {});
});

app.get("/aboutUs", auth, (req, res) => {
  res.render("aboutUs");
});

app.get("/blog", auth, (req, res) => {
  res.render("blog");
});

app.get("/tours", auth, (req, res) => {
  res.render("tours", {});
});

app.get("/contactUs", auth, (req, res) => {
  res.render("contactUs", {});
});

app.get("/booking", auth, (req, res) => {
  res.render("booking");
});

app.get("/indexAdmin", auth, (req, res) => {
  res.render("indexAdmin");
});

app.get("/fetchbookings", auth, (req, res) => {
  ourBookings.exec(function (err, data) {
    if (err) throw err;
    res.render("fetchbookings", { title: "Our Bookings", records: data });
  });
});

app.get("/fetchsubs", (req, res) => {
  ourSubs.exec(function (err, data) {
    if (err) throw err;
    res.render("fetchsubs", { title: "Our Subscribers", records: data });
  });
});

app.get("/fetchregister", auth, (req, res) => {
  ourRegisteres.exec(function (err, data) {
    if (err) throw err;
    res.render("fetchregister", { title: "Our Registration", records: data });
  });
});

app.get("/fetchcontact", auth, (req, res) => {
  ourContacts.exec(function (err, data) {
    if (err) throw err;
    res.render("fetchcontact", { title: "Our ContactUS", records: data });
  });
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.render("register", {
      active: true,
      type: "success",
      heading: "Completed",
      message: "LogOut successfully",
    });
    console.log("User logout successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/subscribe", auth, async (req, res) => {
  try {
    const subscribeData = new Subscribe(req.body);
    await subscribeData.save();
    res.status(201).render("home", {
      active: true,
      type: "success",
      heading: "Completed",
      message: "Subscribed successfully",
    });
    console.log("Subscribed successfully");
  } catch (error) {
    res.status(404).render("404");
    console.log(error);
  }
});

app.post("/contactus", auth, async (req, res) => {
  try {
    const contactFormData = new ContactForm(req.body);
    await contactFormData.save();
    res.status(201).render("contactUs", {
      active: true,
      type: "success",
      heading: "Submitted",
      message: "Your message has been sent successfully",
    });
    console.log("Contact us form submitted successfully");
  } catch (error) {
    res.status(404).render("404");
    console.log(error);
  }
});

app.post("/bookingform", auth, async (req, res) => {
  try {
    const bookingFormData = new BookingForm(req.body);
    await bookingFormData.save();
    res.status(201).render("tours", {
      active: true,
      type: "success",
      heading: "Submitted",
      message:
        "Reservation done successfully. You will receive a callback from us",
    });
    console.log("Booking form submitted successfully");
  } catch (error) {
    res.status(404).render("404");
    console.log(error);
  }
});

app.post("/register", async (req, res) => {
    try {
        const { userId, email, password, confirmPassword } = req.body;

        if (!userId || !email || !password || !confirmPassword) {
            return res.status(400).render("register", {
                active: true,
                type: "danger",
                heading: "Missing Fields",
                message: "Please fill all the fields.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render("register", {
                active: true,
                type: "warning",
                heading: "Passwords Mismatch",
                message: "Passwords do not match.",
            });
        }

        const user = await Register.findOne({ email });
        if (user) {
            return res.status(400).render("register", {
                active: true,
                type: "danger",
                heading: "Email Used",
                message: "Email already exists.",
            });
        }

        const newUser = new Register({
            userId,
            email,
            password,
            confirmPassword
        });

        const token = await newUser.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000000),
            httpOnly: true,
        });

        await newUser.save();
        res.status(201).render("register", {
            active: true,
            type: "success",
            heading: "Registration Successful",
            message: "You have registered successfully.",
        });
    } catch (error) {
        res.status(500).render("register", {
            active: true,
            type: "danger",
            heading: "Registration Error",
            message: `Error: ${error.message}`,
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ensure email and password are provided
        if (!email || !password) {
            return res.status(400).render("register", {
                active: true,
                type: "danger",
                heading: "Missing Fields",
                message: "Please provide both email and password.",
            });
        }

        // Find the user by email
        const userEmail = await Register.findOne({ email: email });

        // Check if userEmail is found
        if (!userEmail) {
            return res.status(400).render("register", {
                active: true,
                type: "danger",
                heading: "User Not Found",
                message: "No user found with this email.",
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, userEmail.password);

        // Check if password matches
        if (!isMatch) {
            return res.status(400).render("register", {
                active: true,
                type: "danger",
                heading: "Invalid Credentials",
                message: "Invalid password.",
            });
        }

        // Generate authentication token
        const token = await userEmail.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000000),
            httpOnly: true,
        });

        // Redirect based on email
        if (email === "admin@admin.com") {
            res.status(200).render("indexAdmin", {
                active: true,
                type: "success",
                heading: "Admin",
                message: "Logged in successfully",
            });
        } else {
            res.status(200).render("home", {
                active: true,
                type: "success",
                heading: "",
                message: "Logged in successfully",
            });
        }
    } catch (error) {
        res.status(500).render("register", {
            active: true,
            type: "danger",
            heading: "Login Error",
            message: `Error: ${error.message}`,
        });
    }
});


app.get("*", (req, res) => {
  res.status(404).render("404");
  console.log("Error 404");
});

connectToDb().then(() => {
  app.listen(port, () => {
    console.log(`server is running at port ${port}`);
  });
});
