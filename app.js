const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET API

app.get("/movies/", async (request, response) => {
  const dbQuery = `
      SELECT
      movie_name
      FROM
      movie INNER JOIN
      director
      ON movie.director_id=director.director_id;`;
  const dbArray = await db.all(dbQuery);
  let data = [];
  for (let object of dbArray) {
    const dataObject = {
      movieName: object.movie_name,
    };
    data.push(dataObject);
  }
  response.send(data);
  //   const dbQuery = `
  // SELECT
  // *
  // FROM
  // movie;`;
  //   const array = await db.all(dbQuery);
  //   response.send(array);
});

//POST API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `
  INSERT INTO movie
  (director_Id,movie_name,lead_actor)
  VALUES
  (${directorId},'${movieName}','${leadActor}');`;
  await db.run(dbQuery);
  response.send(`Movie Successfully Added`);
});

//GET MOVIE API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id=${movieId};`;
  const dbArray = await db.get(dbQuery);
  const dbObject = {
    movieId: dbArray.movie_id,
    directorId: dbArray.director_id,
    movieName: dbArray.movie_name,
    leadActor: dbArray.lead_actor,
  };
  response.send(dbObject);
});

//PUT API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `
    UPDATE movie
    SET 
     director_id=${directorId},
     movie_name='${movieName}',
     lead_actor='${leadActor}';`;
  await db.run(dbQuery);
  response.send("Movie Details Updated");
});

// DELETE API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `
    DELETE
    FROM
    movie
    WHERE
    movie_id=${movieId};`;
  await db.run(dbQuery);
  response.send("Movie Removed");
});

//GET DIRECTOR API

app.get("/directors/", async (request, response) => {
  const dbQuery = `
    SELECT
     director_id,
     director_name
    FROM 
    director;`;
  const dbArray = await db.all(dbQuery);
  let data = [];
  for (let object of dbArray) {
    const dataObject = {
      directorId: object.director_id,
      directorName: object.director_name,
    };
    data.push(dataObject);
  }
  response.send(data);
});

//GET AUTHOR API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery = `
    SELECT
     movie_name
    FROM 
    movie
    WHERE 
    director_id=${directorId};`;
  const dbArray = await db.all(dbQuery);
  let data = [];
  for (let object of dbArray) {
    const dataObject = {
      movieName: object.movie_name,
    };
    data.push(dataObject);
  }
  response.send(data);
});

module.exports = app;
