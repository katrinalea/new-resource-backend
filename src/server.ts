import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

//-------------------------------------------------------------------Read .env file lines as though they were env vars.
dotenv.config();

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//-------------------------------------------------------------------Configure express routes
const app = express();

//-------------------------------------------------------------------add JSON body parser to each following route handler
app.use(express.json());

//-------------------------------------------------------------------add CORS support to each following route handler
app.use(cors());

//-------------------------------------------------------------------GET requests
//-------------------------------------------------------------------Default response
app.get("/", async (req, res) => {
  res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

//-------------------------------------------------------------------Get list of all resources
app.get("/resources", async (req, res) => {
  try {
    const query = "SELECT * FROM resources ORDER BY resource_id DESC";
    const response = await client.query(query);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Get all users
app.get("/users", async (req, res) => {
  try {
    const query = "SELECT user_name, faculty_status FROM users"
    const response = await client.query(query)
    res.status(200).send(response.rows)
  }
  catch (err) {
    console.error(err)
  }
})

//-------------------------------------------------------------------Get all likes for a specific post
app.get("/resources/:resourceID/likes", async (req, res) => {
  const resourceId = req.params.resourceID
  try {
    const query = "SELECT count (*) FROM likes GROUP BY is_liked WHERE resource_id = $1 AND is_liked IS NOT NULL"
    const values = [resourceId]
    const response = await client.query(query, values)
    res.status(200).send(response.rows)
  }
  catch (err) {
    console.error(err)
  }
})

//-------------------------------------------------------------------Get whether the signed in user liked the resource
app.get("/resources/:resourceID/likes/:userID", async (req, res) => {
  const { userID, resourceID } = req.params
  try {
    const query = "SELECT is_liked FROM likes GROUP BY is_liked WHERE resource_id = $1 AND user_id = $2"
    const values = [userID, resourceID]
    const response = await client.query(query, values)
    res.status(200).send(response.rows)
  }
  catch (err) {
    console.error(err)
  }
})

//-------------------------------------------------------------------POST REQUESTS
//-------------------------------------------------------------------Post resource to database
app.post("/resources", async (req, res) => {
  const resource = req.body;
  try {
    const query =
      "INSERT INTO resources (resource_url, author_name,resource_name  ,"
      +"resource_description ,tags, content_type, selene_week, usage_status,recommendation_reason, user_id) "
      +"VALUES ($1,$2,$3,$4,$5,$6,$7,$,8,$9,$10)";
    const values = [resource.resource_url, resource.author_name, resource.resource_name,
       resource.resource_description, resource.tags, resource.content_type, resource.selene_week, 
       resource.usage_status, resource.recommendation_reason, resource.user_id]
    await client.query(query, values)
    res.status(200).send("Resource post request successful")

  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Post comment on resource
app.post("/comments/:resourceID", async (req, res) => {
  const {user_id, resource_id, comment } = req.body; //user.id, resource.id and comment text
  
  try {
    const query =
      "INSERT INTO comments (resource_id, user_id, comment) VALUES ($1,$2,$3)";
    const values = [ resource_id, user_id, comment ]
    await client.query(query, values)
    res.status(200).send("Comment post request successful")

  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------PATCH REQUESTS 
//-------------------------------------------------------------------Edit the number of likes on a post]
app.patch("resources/:resourceID/likes", async (req, res) => {
  const { like, userId } = req.body
  const resourceId = req.params.resourceID
  try {
    const query = "UPDATE likes SET is_liked = $1 WHERE resource_id = $2 AND user_id = $3"
    const values = [like, resourceId, userId]
    await client.query(query, values)
    res.status(200).send("Like/Dislike sent")
  }
  catch (err) {
    console.error(err)
  }
})


connectToDBAndStartListening();

async function connectToDBAndStartListening() {
  console.log("Attempting to connect to db");
  await client.connect();
  console.log("Connected to db!");

  const port = getEnvVarOrFail("PORT");
  app.listen(port, () => {
    console.log(
      `Server started listening for HTTP requests on port ${port}.  Let's go!`
    );
  });
}
