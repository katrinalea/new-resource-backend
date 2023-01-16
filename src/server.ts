import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (req, res) => {
  res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

app.get("/resources", async (req, res) => {
  try {
    const query = "SELECT * FROM resources ORDER BY resource_id DESC";
    const response = await client.query(query);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

app.post("/resources", async (req, res) => {
  const resource = req.body;
  try {
    const query =
      "INSERT INTO resources (resource_url, author_name,resource_name  ,resource_description ,tags, content_type, selene_week, usage_status,recommendation_reason, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$,8,$9,$10)";
    const values = [resource.resource_url, resource.author_name, resource.resource_name, resource.resource_description, resource.tags, resource.content_type, resource.selene_week, resource.usage_status,resource.recommendation_reason, resource.user_id]
    await client.query(query, values)
    res.status(200).send("Resource post request successful")
  
    } catch (err) {
    console.error(err);
  }
});

app.get("/users", async(req,res)=>{
  try{
    const query = "SELECT user_name, faculty_status FROM users"
    const response = await client.query(query)
    res.status(200).send(response.rows)
  }
  catch(err){
    console.error(err)
  }
})

app.patch("resources/:resourceID/likes", async (req, res)=>{
  const {like, userId} = req.body
  const resourceId = req.params.resourceID
  try{
    const query = "UPDATE likes SET is_liked = $1 WHERE resource_id = $2 AND user_id = $3"
    const values = [like, resourceId, userId]
    await client.query(query, values)
    res.status(200).send("Like/Dislike sent")
  }
  catch(err){
    console.error(err)
  }
})

app.get("/resources/:resourceID/likes", async (req, res)=>{
  const resourceId = req.params.resourceID
  try{
    const query = "SELECT count (*) FROM likes GROUP BY is_liked WHERE resource_id = $1 AND is_liked IS NOT NULL"
    const values = [resourceId]
    const response = await client.query(query, values)
    res.status(200).send(response.rows)
  }
  catch(err){
    console.error(err)
  }
})

// get whether the signed in user liked the resource
app.get("/resources/:resourceID/likes/:userID", async (req, res)=>{
  const {userID, resourceID} = req.params
  try{
    const query = "SELECT is_liked FROM likes GROUP BY is_liked WHERE resource_id = $1 AND user_id = $2"
    const values = [userID, resourceID]
    const response = await client.query(query, values)
    res.status(200).send(response.rows)
  }
  catch(err){
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
