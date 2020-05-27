const hello = require('../sample');

describe('hello function', () => {
    it('concatinate hello and strings', () => {
        const actual = hello("World");
        const expected = "Hello World";

        expect(actual).toBe(expected)
    })
})