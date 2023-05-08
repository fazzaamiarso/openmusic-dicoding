/* eslint-disable camelcase */
const mapSongDbToModel = ({
  id,
  title,
  performer,
  year,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  performer,
  year,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapSongDbToModel };
