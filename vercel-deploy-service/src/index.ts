
import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws.js";
import { buildProject } from "./utils.js";
const subscriber = createClient();
subscriber.connect(); //connects to localserver:

const publisher = createClient();
publisher.connect();

async function main() {
    while(1) { //pops values from build queue
        const res = await subscriber.brPop('build-queue', 0);
        
        if (!res) continue;
        const id = res.element;
        
        await downloadS3Folder(`output/${id}`) //download files of particular ID from S3 queue
        await buildProject(id); // build it 
        copyFinalDist(id);
        publisher.hSet("status", id, "deployed") //deployer sets the status in redis DB
    }
}
main();