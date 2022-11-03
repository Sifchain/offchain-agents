const { arrayToMap } = require("./arrayToMap");

test("integer array to map", () => {
  expect(arrayToMap([1, 2, 3])).toEqual({ 1: 1, 2: 2, 3: 3 });
});

test("object array to map", () => {
  expect(
    arrayToMap([{ id: 12 }, { id: 24 }, { id: 48 }], ({ id }) => id)
  ).toEqual({
    12: { id: 12 },
    24: { id: 24 },
    48: { id: 48 },
  });
});

test("object array to map with extra fields", () => {
  expect(
    arrayToMap(
      [
        { id: 12, field1: "field1 value", field2: "field2 value" },
        { id: 24, field3: "field3 value", field4: "field4 value" },
        { id: 48, field5: "field5 value", field5: "field5 value" },
      ],
      ({ id }) => id
    )
  ).toEqual({
    12: { id: 12, field1: "field1 value", field2: "field2 value" },
    24: { id: 24, field3: "field3 value", field4: "field4 value" },
    48: { id: 48, field5: "field5 value", field5: "field5 value" },
  });
});
