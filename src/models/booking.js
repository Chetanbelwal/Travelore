const mongoose =  require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema({
    name:{
        type: String,
        required :true,
        lowercase:true,
        trim:true,
        minlength:2,
        maxlength:30 },
    
    email:{
            type:String,
            required:true,
            validate(value){
                if(!validator.isEmail(value)) {
                    throw new error("invalid email")
                }
            }
    },
    contact:{
        type: Number,
        required :true,
        minlength:10
        
        },
    age:{
        type: Number,
        required :true,
        validate(value){
            if(value<0) {
                throw new error("age cannot be 0")
            }
        }
    },
    package:{
        type: String,
        required:true
    },
    checkIn:{
        type: Date,
        required :true
    },
    checkOut:{
        type: Date,
        required :true
    
    },
    rooms:{
        type: Number,
        required :true
    },
    adults:{
        type: Number,
        required :true,
        validate(value){
            if(value<0) {
                throw new alert("invalid value cannot be negative")
            }
        }
    },
    children:{
        type: Number,
        required :true,
        validate(value){
            if(value<0) {
                throw new alert("invalid value cannot be negative")
            }
        }
    },
    
    Date: {
        type: Date,
        default: Date.now
    }
})



// define a model(create a collection)
const BookingForm = new mongoose.model("BookingForm" , bookingSchema);

module.exports = BookingForm;
