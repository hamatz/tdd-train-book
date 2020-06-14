const mongoose = require("mongoose");
const validate = require("mongoose-validator");

const titleValidator = [
    validate({
        validator: 'isLength',
        arguments: [1, 30],
        message: 'Title should be between 1 and 30 characters'
    })
]

const descValidator = [
    validate({
        validator: 'isLength',
        arguments: [0, 250],
        message: 'Description should be between 1 and 250 characters'
    })
]

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    validate: titleValidator,
  },
  description: {
    type: String,
    required: false,
    validate: descValidator,
  },
  status: {
    type: String,
    enum: ["OPEN", "IN_PROGRESS", "IN_REVIEW", "DONE"],
    required: true,
  },
});

const TodoModel = mongoose.model("Todo", TodoSchema);

module.exports = TodoModel;