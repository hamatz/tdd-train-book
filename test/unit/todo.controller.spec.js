const TodoController = require("../../controllers/todo.controller");

describe("TodoController.create", () => {
  it("should have a create function", () => {
    expect(typeof TodoController.create).toBe("function");
  });
});