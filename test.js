const fs = require("fs");
const { MessageMedia } = require("whatsapp-web.js");
const path = "./database/Netfiles/Safaricom/";
fs.readdir(path, (err, files)=>{
    if(err)
    {
        console.log("Cannot read directory..");
    }else{
        files.forEach(file => {
            let file_path = path+file;
            let freenet = new MessageMedia.fromFilePath(file_path);
            console.log(freenet);
        });
    }
    
})