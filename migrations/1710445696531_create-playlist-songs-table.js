/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    song_id: {
      type: "TEXT",
      notNull: true,
      references: "songs",
      onDelete: "CASCADE",
    },
    playlist_id: {
      type: "TEXT",
      notNull: true,
      references: "playlists",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
