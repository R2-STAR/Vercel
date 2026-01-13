import { S3 } from "aws-sdk"; //  downloads all the files from S3 queue to local machine.
import fs from "fs";
import path from "path";

const s3 = new S3({
    accessKeyId: "7ea9c3f8c7f0f26f0d21c5ce99d1ad6a",
    secretAccessKey: "b4df203781dd711223ce931a2d7ca269cdbf81bb530de4548474584951b798be",
    endpoint: "https://e21220f4758c0870ba9c388712d42ef2.r2.cloudflarestorage.com"
})

// output/asdasd
export async function downloadS3Folder(prefix: string) { //argument is path from where file will be pulled and then into S3
    const allFiles = await s3.listObjectsV2({ //gets the content each file
        Bucket: "vercel",
        Prefix: prefix
    }).promise();
    
    // 
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key); //where I want to store the output
            const outputFile = fs.createWriteStream(finalOutputPath); //to stream data from AWS and put that in object
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){ // to make sure the file you're copyint to, actually exists
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: "vercel",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined)); //waits for an array of all the promises
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/dist`); //gets the path where the final files(HTML/CSS) are
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => { //upload these built files over to S3
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file); //now S3 has React files as well as the built ones(HTML, CSS)
    })
}

const getAllFiles = (folderPath: string) => { //given a folder path, gives an array of all the files inside
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => { // argumensts are the final file name on S3 and the local file path of what you're trying to upload
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}