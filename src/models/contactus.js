const mongoose =  require("mongoose");
const validator = require("validator");

const contactusSchema = new mongoose.Schema({
    firstName:{
        type: String,
            required :true,
            lowercase:true,
            trim:true,
            minlength:2,
            maxlength:30 },
    lastName:{
        type: String,
        required :true,
        lowercase:true,
        trim:true,
        minlength:2,
        maxlength:30
    },
    email:{
            type:String,
            required:true,
            // unique:true,
            validate(value){
                if(!validator.isEmail(value)) {
                    throw new error("invalid email")
                }
            }
    },
    subject:{
        type: String,
        required :true,
        lowercase:true,
        trim:true,
        // minlength:2,
        // maxlength:60
    },

    message:{
        type: String,
        required :true,
        trim:true,
        // minlength:10,
        
    },

    Date: {
        type: Date,
        default: Date.now
    }
})



// define a model(create a collection)
const ContactForm = new mongoose.model("ContactForm" , contactusSchema);

module.exports = ContactForm;
