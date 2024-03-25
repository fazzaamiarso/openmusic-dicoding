/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("albums", {
    cover: {
      type: "TEXT",
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("albums", ["cover"]);
};
