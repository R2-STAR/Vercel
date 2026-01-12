import { S3 } from "aws-sdk"; //lets you put things into bucket
import fs from "fs";

const s3 = new S3({ //created an object from aws SDK
    accessKeyId: "7ea9c3f8c7f0f26f0d21c5ce99d1ad6a", //random accessKeyId until card details added 
    secretAccessKey: "b4df203781dd711223ce931a2d7ca269cdbf81bb530de4548474584951b798be", //random secretAccessKey until card details added to cloudflare
    endpoint: "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com" //random endpoint
})

// fileName => output/12312/src/App.jsx
// filePath => /Users/ridhima/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName, //path in S3 where file is to stored
    }).promise(); //to promisify the function
    console.log(response);
} 