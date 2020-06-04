const TodoModel = require("../model/todo.model");

exports.create = async (req, res, next) => {
  try {
    const createdModel = await TodoModel.create(req.body);
    res.status(201).send(createdModel);
  } catch (err) {
    next(err);
  }
};
