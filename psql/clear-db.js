const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config();

const client = new Client({});

(async () => {
  try {
    await client.connect();
    await client.query(
      "TRUNCATE albums, songs, users, authentications, playlists, playlist_songs, collaborations, playlist_song_activities;"
    );
  } catch (e) {
    console.log(e);
  } finally {
    await client.end();
  }
})();
