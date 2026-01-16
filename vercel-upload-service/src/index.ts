import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./utils.js";
import { getAllFiles } from "./file.js";
import path from "path";
import { uploadFile } from "./aws.js";
import { createClient } from "redis";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

//backend endpoint when hit by user, will handle the repo URL received
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); // asd12
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`)); // to copy the repo url given by the user to output folder

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => { //file is the local path here
        await uploadFile(file.slice(__dirname.length + 1), file); //extracts the filename out of file path
    })

    await new Promise((resolve) => setTimeout(resolve, 5000))
    publisher.lPush("build-queue", id); // to push the id of file uploaded into the left side of build queue
    // INSERT => SQL
    // .create => 
    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id
    })

}); 

app.get("/status", async (req, res) => { //to get the current status
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);

