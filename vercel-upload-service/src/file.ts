//an array of paths of all the files that can be uploaded by sdk to S3
import fs from "fs"; //file system library 
import path from "path";

//Fxn getAllFiles gets me all the files inside the output folder
export const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    //readdirSync lets you read contents(files) of current directory
    //for loop checks if a file is a directory and reads the content of files within it
    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath)) //same fxn called recursively
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}