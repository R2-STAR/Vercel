import { exec, spawn } from "child_process"; //from child_process module
import path from "path";

//this process starts another process i.e, child process
export function buildProject(id: string) { //function to build(convert React to HTML/CSS)
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`) //execute this child process on terminal 

        child.stdout?.on('data', function(data) { //to see the logs if its working or not
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) { //once the child process executed, control reaches here
           resolve("") // promises resolved
        });

    })
}