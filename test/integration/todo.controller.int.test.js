const request = require("supertest");
const app = require("../../app");

const newTodo = require("../mock-data/new-todo.json");

const endpointUrl = "/todo/";

describe(endpointUrl, () => {
  it("POST " + endpointUrl, async () => {
    const response = await request(app).post(endpointUrl).send(newTodo);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newTodo.title);
    expect(response.body.description).toBe(newTodo.description);
    expect(response.body.status).toBe(newTodo.status);
  });
});