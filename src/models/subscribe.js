const mongoose =  require("mongoose");
const validator = require("validator");

const subsSchema = new mongoose.Schema({
    email:{
            type:String,
            required:[true, 'what is your email'],
            unique:true,
           
            validate(value){
                if(!validator.isEmail(value)) {

                    throw new error("invalid email")
                    
                }
            }
    },
    Date: {
        type: Date,
        default: Date.now
    }
})





// define a model(create a collection)
const Subscribe = new mongoose.model("Subscribe" , subsSchema);

module.exports = Subscribe;
