import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";
import { Events, GatewayIntentBits } from 'discord.js';
import { Client as DiscordClient } from 'discord.js';
import { EmbedBuilder, WebhookClient } from 'discord.js'

//-------------------------------------------------------------------Read .env file lines as though they were env vars.
dotenv.config();

const webhookClient = new WebhookClient({ id: process.env.DISCORD_ID!, token: process.env.DISCORD_TOKEN! });

// //-------------------------------------------------------------------Create a new client instance
// const discordClient = new DiscordClient({ intents: [GatewayIntentBits.Guilds] });

// //-------------------------------------------------------------------When the client is ready, run this code (only once)
// //-------------------------------------------------------------------We use 'c' for the event parameter to keep it separate from the already defined 'client'
// discordClient.once(Events.ClientReady, c => {
// 	console.log(`Ready! Logged in as ${c.user.tag}`);
// });

// //-------------------------------------------------------------------Log in to Discord with your client's token
// discordClient.login(process.env.DISCORD_TOKEN);


export const url = "https://new-resource.netlify.app"

// export const url =
//   process.env.NODE_ENV === "production"
//     ? "https://new-resource.netlify.app/"
//     : "http://localhost:4000";


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
    const query = "SELECT * FROM users";
    const response = await client.query(query);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Get all likes for a specific post
app.get("/resources/:resourceID/likes", async (req, res) => {
  const resourceID = req.params.resourceID;
  try {
    const query =
      "SELECT count (*) FROM likes WHERE resource_id = $1 AND is_liked IS NOT NULL GROUP BY is_liked";
    const values = [resourceID];
    const response = await client.query(query, values);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Get whether the signed in user liked the resource //NEEDS WORK!!!
app.get("/resources/:resourceID/likes/:userID", async (req, res) => {
  const { userID, resourceID } = req.params;
  try {
    const query =
      "SELECT is_liked FROM likes WHERE resource_id = $1 AND user_id = $2";
    const values = [resourceID, userID];
    const response = await client.query(query, values);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Get all comments on a post
app.get("/resources/:resourceID/comments", async (req, res) => {
  const { resourceID } = req.params;
  try {
    const query = "SELECT * FROM comments WHERE resource_id = $1";
    const values = [resourceID];
    const response = await client.query(query, values);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------Get todo items for a user
app.get("/to-do-list/:userID", async (req, res) => {
  const { userID } = req.params;
  try {
    const query =
      "SELECT * FROM to_do_list join resources on to_do_list.resource_id = resources.resource_id and to_do_list.user_id = $1";
    const values = [userID];
    const response = await client.query(query, values);
    res.status(200).send(response.rows);
  } catch (err) {
    console.error(err);
  }
});

//-------------------------------------------------------------------POST REQUESTS
//-------------------------------------------------------------------Post resource to database
app.post("/resources", async (req, res) => {
  const resource = req.body;
  // const tagsArray = `ARRAY[${resource.tags}]`
  try {
    const query =
      "INSERT INTO resources (resource_url, author_name, resource_name, " +
      "resource_description, tags, content_type, selene_week, usage_status, recommendation_reason, user_id) " +
      "VALUES ($1,$2,$3,$4, ARRAY[$5],$6,$7,$8,$9,$10)";
    const values = [
      resource.resource_url,
      resource.author_name,
      resource.resource_name,
      resource.resource_description,
      // tagsArray,
      resource.tags,
      resource.content_type,
      resource.selene_week,
      resource.usage_status,
      resource.recommendation_reason,
      resource.user_id,
    ];

    // const discordInfo = {
    //   content: `A new resource has been added to the server: ${resource.resource_name}!`,
    //   embeds: [
    //     {
    //       "title": `${resource.resource_name}!`,
    //       "color": 15258703,
    //       "thumbnail": {
    //         "url": `${url}/resources/${resource.resource_id}`,
    //       },
    //       "fields": [
    //         {
    //           "name": `${resource.resource_name}`,
    //           "value": `${resource.resource_description}`,
    //           "inline": true
    //         }
    //       ]
    //     }
    //   ]

    // }

    const embed = new EmbedBuilder()
    .setTitle(`${resource.resource_name}!`)
    .setDescription(`${resource.resource_description}`)
    .setColor(0x00FFFF);
  
  webhookClient.send({
    content: `A new resource has been added to the server: ${resource.resource_name}!`,
    username: `${resource.author_name}`,
    avatarURL: 'https://i.imgur.com/AfFp7pu.png',
    embeds: [embed],
  });

    await client.query(query, values);
    res.status(200).send("Resource post request successful");
  }
  catch (err) {
    console.error(err);
  }
});

  /*
  
  working post post request
  
  INSERT INTO resources (resource_url, author_name, resource_name, resource_description,
                         tags, content_type, selene_week, usage_status,recommendation_reason, user_id)
                         VALUES ('https://cosmos.video/v/5oz4-sw4s-bzux/academy-campus', 'Cosmos', 'Cosmos',
         'Cosmos', ARRAY['React', 'Typescript'], 'interactive', 1, 'Used this resource and loved it!', 'Cosmos', 5)
  */

  /*
      For example:
      {
          "resource_url": "https://cosmos.video/v/5oz4-sw4s-bzux/academy-campus",
          "author_name": "Cosmos",
          "resource_name": "Cosmos",
          "resource_description": "Cosmos",
          "tags": ["React", "Typescript", "Javascript", "Front-end", "Back-end", "CSS", "HTML", "SQL"],
          "content_type": "interactive",
          "selene_week": 1,
          "usage_status": "Used this resource and loved it!",
          "recommendation_reason": "Cosmos",
          "user_id": 5
      }
  */

  //-------------------------------------------------------------------Post comment on resource
  app.post("/comments/:resourceID", async (req, res) => {
    const { user_id, resource_id, comment } = req.body; //user.id, resource.id and comment text

    try {
      const query =
        "INSERT INTO comments (resource_id, user_id, comment) VALUES ($1,$2,$3)";
      const values = [resource_id, user_id, comment];
      await client.query(query, values);
      res.status(200).send("Comment post request successful");
    } catch (err) {
      console.error(err);
    }
  });

  //-------------------------------------------------------------------Add a todo item
  app.post("/to-do-list", async (req, res) => {
    const { user_id, resource_id } = req.body;
    try {
      const query =
        "INSERT INTO to_do_list (resource_id, user_id) VALUES ($1,$2)";
      const values = [resource_id, user_id];
      await client.query(query, values);
      res.status(200).send("Todo list post request successful");
    } catch (err) {
      console.error(err);
    }
  });

  //-------------------------------------------------------------------Edit the number of likes on a post]

  app.post("/resources/:resourceID/likes", async (req, res) => {
    const { like, userId } = req.body;
    const resourceId = req.params.resourceID;
    try {
      const query =
        "INSERT INTO likes (is_liked, resource_id, user_id) VALUES ($1, $2, $3) ON CONFLICT(user_id, resource_id) DO UPDATE SET is_liked = $1";
      const values = [like, resourceId, userId];
      await client.query(query, values);
      res.status(200).send("Like/Dislike sent");
    } catch (err) {
      console.error(err);
    }
  });
  // working
  //UPDATE likes SET is_liked = true WHERE resource_id = 3 AND user_id = 6

  //-------------------------------------------------------------------DELETE REQUESTS
  //-------------------------------------------------------------------Delete a todo item
  app.delete("/to-do-list/:listID", async (req, res) => {
    const { listID } = req.params;
    try {
      const query = "DELETE from to_do_list WHERE to_do_item_id = $1"; //DELETE FROM table_name WHERE condition;
      const values = [listID];
      await client.query(query, values);
      res.status(200).send("Deleted todo item");
    } catch (err) {
      console.error(err);
    }
  });

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
