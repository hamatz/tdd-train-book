const TodoController = require("../../controllers/todo.controller");
const TodoModel = require("../../model/todo.model");
const httpMocks = require("node-mocks-http");
const newTodo = require("../mock-data/new-todo.json");

TodoModel.create = jest.fn();

let req, res, next;
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = jest.fn();
});

describe("TodoController.create", () => {
  beforeEach(() => {
    req.body = newTodo;
  });

  it("should Call TodoModel.create", () => {
    TodoController.create(req, res, next);
    expect(TodoModel.create).toBeCalledWith(newTodo);
  });
  it("should return 201 response code", async () => {
    await TodoController.create(req, res, next);
    expect(res.statusCode).toBe(201);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should return json body in response", async () => {
    TodoModel.create.mockReturnValue(newTodo);
    await TodoController.create(req, res, next);
    expect(res._getData()).toStrictEqual(newTodo);
  });
  it("shoul handle model validation errors", async () => {
    const errorMessage = { message: "Status property missing" };
    const rejectedPromise = Promise.reject(errorMessage);
    TodoModel.create.mockReturnValue(rejectedPromise);
    await TodoController.create(req, res, next);
    expect(next).toBeCalledWith(errorMessage);
  });
});

