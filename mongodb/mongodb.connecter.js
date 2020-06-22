const mongoose = require("mongoose");
const debug = require("debug")("tdd-train:mongodb-connecter");

const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://tdd-train-admin:"
       + process.env.MONGO_ATLAS_PW + 
       "@cluster0-ejkue.gcp.mongodb.net/test?retryWrites=true&w=majority",
      { useUnifiedTopology: true,  useNewUrlParser: true  } 
    );
  } catch (err) {
    debug("Error connectiong to mongodb");
    debug(err);
  }
};

module.exports = { connect };
