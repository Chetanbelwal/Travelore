const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;

const connectToDb = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,  // This option fixes the `ensureIndex` deprecation
    });
    console.log("Connection Success to DB");
  } catch (error) {
    console.log(error);
    console.error("Connection failed to DB");
    process.exit(1); // Exit with an error code
  }
};

module.exports = connectToDb;
