const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require('express');
const path = require('path');
const app = express();

const req = require('request');

const client = new Client({ puppeteer: { headless: true, args:["--no-sandbox"] }, clientId: 'example' });
client.initialize();

const repliedDms= [];
//Loading image
const offlineReplyImage = MessageMedia.fromFilePath('./images/profilepic/dp.jpg');

//Statis Middleware
app.use(express.static(path.join(__dirname, 'public')));
//View engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('Index');
});

app.listen(80, function(error){
    if(error)throw error
    console.log("Server is running...");
})

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});

    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('SamBot Online');
});


//Replying Dms.
client.on('message', async msg => {
    
    var chatIdentifier = msg.from.substring(msg.from.length-5);
    var  numberIdentifier = msg.from;
    const command = msg.body.split(" ");
    
    // Messages send to my DM
    if(chatIdentifier == "@c.us" )
    
    
    {
        const alreadyreplied = repliedDms.find(element =>{
            if(element.includes(numberIdentifier))
            {
               return true;
            }
            
        });
        if(alreadyreplied !== undefined)
        {
            console.log("User is in the list!");
            console.log(repliedDms);
        }
        if(alreadyreplied == undefined)
        {
                repliedDms.push(...repliedDms, msg.from);
                console.log("User added to the list!");
                console.log(repliedDms);
                
                client.sendMessage(msg.from, offlineReplyImage, {caption: "*Hi there*👋🏿👋🏿👋🏿\n\nI am *SamBot*, you are getting this message because he is offline or currently busy.🤓\nHe will text you back soon!\n\n~SamBot 👾"});
                
                var date = new Date();
                var hour = date.getHours();
                if(hour == 12)
                {
                    repliedDms= [];
                }
        }




        // Speed Test Module START
        if(command[0] == ".ping" || command[0] == ".pong" || command[0] == ".speed"  )
        {
            const  NetworkSpeed = require('network-speed');  // ES5
            const testNetworkSpeed = new NetworkSpeed();
            getNetworkDownloadSpeed();
            


            async function getNetworkDownloadSpeed() {
                const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000';
                const fileSizeInBytes = 500000;
                const speed = await testNetworkSpeed.checkDownloadSpeed(baseUrl, fileSizeInBytes);
                Promise.all([speed]).then(values=>{
                    let downspeed = values[0].mbps;
                    msg.reply("Your Internet speed is: *"+downspeed+ "* Megabytes per second.");
                });
            }
        }// Speed Test Module END
        
            
        // Wikipedia search module Start
        if( command[0] == ".wiki")
            { 
                let arr_search = [];
                for(var i = 1; i< command.length; i++)
                {
                    arr_search.push(command[i]);
                }
                const query = arr_search.join( " ");

                let data1 = [];
                
                
                console.log(query);
                
                var url_wiki = `https://en.wikipedia.org/w/api.php?action=opensearch&search="+${query}+"&limit=10&format=json`;

                req(url_wiki, function(err,response,  body){
                    if(err)
                    {
                        msg.reply("Internal server error!");
                    }
                    else{
                        const content = JSON.parse(body);
                        for(var i = 0;i < content[1].length; i++ )
                        { 
                            let data = `\nResult ${i+1}:  ${content[1][i]}: \n ${content[2][i]}\n *Follow link:* ${content[3][i]}\n\n`;
                            
                            data1.push(data);
                            
                        }
                        let wiki_data = data1.join();
                        msg.reply("*🐶Available matches🐶*\n\n"+wiki_data);
                        
                    }
                });
            }
        }// Wikipedia search module END

        //Dictionary Module START
        if(command[0] === ".dict")
        {
            var word = command[1];
            var dictionary_api_url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
            req(dictionary_api_url, function(err,response,  body){
                if(err)
                {
                    msg.reply("🆘 Internal Server Error!");
                }else
                {
                    
                    const parsed = JSON.parse(body);
                    let phonetic = "";
                    let audio_url = "";
                    if(parsed instanceof Array)
                    {
                        
                        if(typeof parsed[0].phonetic !== "undefined")
                        {
                            phonetic = parsed[0].phonetic;
                        }
                        if(parsed[0].phonetics.length > 0)
                        {
                            let audio_url_chunk = parsed[0].phonetics[0].audio;
                            audio_url = "https:"+audio_url_chunk;
                            if(typeof audio_url_chunk !== "undefined")
                            {
                                
                            sendAudio();
                            }else{
                                msg.reply("No voice note available...");
                            }
                        }
                        
                        let array_res =[];
                        for(var i=0; i<parsed[0].meanings.length; i++)
                        {
                            var partOfSpeech = "*"+parsed[0].meanings[i].partOfSpeech.toUpperCase()+"*: ";
                            var definition = parsed[0].meanings[i].definitions[0].definition;
                            array_res.push([partOfSpeech, definition])
                        }
                        for(var i = 0; i<array_res.length; i++)
                        {
                            array_res[i].join(" ");
                            
                            console.log(array_res[i]);
                        }
                        let sentence = "";
                        for(var i = 0; i<array_res.length; i++)
                        {
                            sentence +=array_res[i]+"\n";
                        }
                        msg.reply("*SamBot 👾 Dictionary*\n\n"+"*PHONETIC:* "+phonetic+"\n"+sentence);
                        
                    }else{
                        msg.reply("No Definitions Found.\nTry again later.");
                    }
                    async function sendAudio()
                    {
                        if(typeof audio_url !== "undefined")
                        {
                            
                             const audio_file = await MessageMedia.fromUrl(audio_url, {unsafeMime: true});
                             msg.reply(audio_file);
                        }
                        else{
                            msg.reply("Could not fetch audio!");
                        }
                        
                    }
                   
                }
            
            });
        }

        //Dictionary Module END


   

        
    }//Messages send to DM END
 
);

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if(ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});
