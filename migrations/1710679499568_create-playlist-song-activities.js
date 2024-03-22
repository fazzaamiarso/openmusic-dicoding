/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "TEXT",
      notNull: true,
      references: "playlists",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "TEXT",
      notNull: true,
    },
    song_id: {
      type: "TEXT",
      notNull: true,
      onDelete: "CASCADE",
    },
    action: {
      type: "VARCHAR(30)",
      notNull: true,
    },
    time: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
