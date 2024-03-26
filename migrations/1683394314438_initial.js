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

  pgm.createTable(
    "songs",
    {
      id: "id",
      title: {
        type: "TEXT",
        notNull: true,
      },
      year: {
        type: "integer",
        notNull: true,
      },
      genre: {
        type: "TEXT",
        notNull: true,
      },
      performer: {
        type: "TEXT",
        notNull: true,
      },
      duration: {
        type: "integer",
      },
      album_id: {
        type: "VARCHAR(50)",
      },
    },
    {
      constraints: {
        foreignKeys: [
          {
            references: "albums(id)",
            columns: "album_id",
          },
        ],
      },
    }
  );
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
  pgm.dropTable("albums");
};
