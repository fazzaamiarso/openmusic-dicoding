/* eslint-disable camelcase */

exports.shorthands = { id: { type: "VARCHAR(50)", primaryKey: true } };

exports.up = (pgm) => {
  pgm.createTable("albums", {
    id: "id",
    name: {
      type: "TEXT",
      notNull: true,
    },
    year: {
      type: "integer",
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("albums");
};
