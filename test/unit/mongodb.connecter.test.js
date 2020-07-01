const mongodbConnecter = require("../../mongodb/mongodb.connecter");
const mongoose = require("mongoose");
const debugModule = require("debug")("tdd-train:mongodb-connecter");

mongoose.connect = jest.fn(() => Promise.reject("error"));
debugModule.debug = jest.fn();

describe("mongoDB related", () => {
  it("should handle db connection errors", async () => {
    await mongodbConnecter.connect().catch((e) => {
      expect(debugModule.debug).toHaveBeenCalledWith(e);
    });
  });
});
