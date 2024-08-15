const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// defining a schema
const employeeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        min: 6
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

// middleware used for generating authentication token
employeeSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id }, "mynameischetanbelwalfromamrapaliinstitute");
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        throw new Error(`Error generating authentication token: ${error.message}`);
    }
}

// Middleware to hash password
employeeSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 10);
    }
    next();
});

// define a model (create a collection)
const Register = mongoose.model("Register", employeeSchema);

module.exports = Register;
