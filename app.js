const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  let list = [];
  for (let player of playersArray) {
    let ob = {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
    list.push(ob);
  }
  response.send(list);
});
// get a specific player
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayersQuery = `SELECT * FROM player_details where player_id=${playerId};`;
  const player = await db.get(getPlayersQuery);
  const resOb = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
  response.send(resOb);
});
//update specific player

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `UPDATE player_details
     SET 
     
     player_name='${playerName}'
     
     WHERE player_id=${playerId};
     `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//get match Details
app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetailsQuery = `SELECT * FROM match_details where match_id=${matchId};`;
  const mDetails = await db.get(getMatchDetailsQuery);
  const resOb = {
    matchId: mDetails.match_id,
    match: mDetails.match,
    year: mDetails.year,
  };
  response.send(resOb);
});

//get all the matches that a player has played

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesOfPlayer = `SELECT * FROM match_details NATURAL JOIN
     player_match_score 
     WHERE
      player_match_score.player_id=${playerId}`;
  const matches = await db.all(getMatchesOfPlayer);

  let list = [];
  for (let eachOb of matches) {
    let ob = {
      matchId: eachOb.match_id,
      match: eachOb.match,
      year: eachOb.year,
    };
    list.push(ob);
  }
  response.send(list);
});
//get  a list of players of a specific match API
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersOfMatch = `SELECT * FROM player_details NATURAL JOIN
     player_match_score 
     WHERE
      player_match_score.match_id=${matchId}`;
  const players = await db.all(getPlayersOfMatch);
  console.log(players);

  let list = [];
  for (let eachOb of players) {
    let ob = {
      playerId: eachOb.player_id,
      playerName: eachOb.player_name,
    };
    list.push(ob);
  }
  response.send(list);
});

//get statistics of a specific player based on plyerId

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatsOfPlayer = `SELECT 
   player_match_score.player_id as playerId,
   player_details.player_name as playerName,
  sum( player_match_score.score) as totalScore,
   sum(player_match_score.fours) as totalFours,
   sum( player_match_score.sixes) as totalSixes
    FROM player_details NATURAL JOIN
     player_match_score 
     WHERE
      player_match_score.player_id=${playerId}
       
       group by 
       player_match_score.player_id
      `;

  const st = await db.all(getStatsOfPlayer);
  for (let o of st) {
    object = o;
  }

  response.send(object);
});
module.exports = app;
