const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).send("Access denied. No token provided.");
        }

        // Use environment variable for the secret key
        const verifyUser = jwt.verify(token, "mynameischetanbelwalfromamrapaliinstitute");
        
        // Find user by ID
        const user = await Register.findOne({ _id: verifyUser._id });
        if (!user) {
            return res.status(401).send("User not found.");
        }

        // Attach user and token to the request
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send(`Authentication error: ${error.message}`);
    }
}

module.exports = auth;
