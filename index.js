const { Client, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const http = require('http');
const fs = require('fs');
const axios = require('axios');
const request = require('request');
const colors = require('./lib/colors');
const {getBuffer} = require('./lib/functions');
const {ytaudio, ytvideo} = require("./lib/ytdl");
const yts = require("yt-search");




let filePath;
const port = process.env.PORT || 4000;


//Creating an HTTP server
http.createServer((req, res)=>{
    if(req.url == '/'){ 
        filePath = "./awake.html";
    }
    
    fs.readFile(filePath, (err, data)=>{
        if(err){
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return
        
        }
        res.writeHead(200);
        res.end(data);
    })
}).listen(port);




const client = new Client({ puppeteer: { headless: true, args:["--no-sandbox"] }, clientId: 'example' });
client.initialize();

const repliedDms= [];
//Loading image
const offlineReplyImage = MessageMedia.fromFilePath('./images/profilepic/sambot.png');


client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});

    console.log(colors.FgYellow,'==============Whatsapp Web QR RECEIVED==================');
});

client.on('authenticated', () => {
    console.log(colors.FgWhite, 'Sambot Auth successfull...');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error(colors.FgRed,'AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log(colors.FgGreen, '==================================SamBot Online=============================');
});


//Replying Dms.
client.on('message', async msg => {
    
    var chatIdentifier = msg.from.substring(msg.from.length-5);
    var  numberIdentifier = msg.from;
    let incoming_message = msg.body.toLowerCase();
    const command = incoming_message.split(" ");
    
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
        switch (command[0]) {
            case ".ping":
            case ".pong":
            case ".speed":
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
                break;
            case ".wiki":
                var arr_search = [];
                for(var i = 1; i< command.length; i++)
                {
                    arr_search.push(command[i]);
                }
                var query = arr_search.join( " ");

                let data1 = [];
                
                
                console.log(query);
                
                var url_wiki = `https://en.wikipedia.org/w/api.php?action=opensearch&search="+${query}+"&limit=10&format=json`;

                request(url_wiki, function(err,response,  body){
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
                break;
            case ".dict":
                var word = command[1];
                var dictionary_api_url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
                request(dictionary_api_url, function(err,response,  body){
                    if(err)
                    {
                        msg.reply("🆘 Internal Server Error!");
                    }else
                    {
                        
                        let parsed = JSON.parse(body);
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
                                
                                 let audio_file = await MessageMedia.fromUrl(audio_url, {unsafeMime: true});
                                 msg.reply(audio_file);
                            }
                            else{
                                msg.reply("Could not fetch audio!");
                            }  
                        }
                    }
                });
                break;
            case ".ytsearch":
                if(command.length == 1)
                {
                    msg.reply("[!] Enter a search term...\n e.g .ytsearch Obama");
                }
                else{
                    var arr_search = [];
                    for(var i = 1; i< command.length; i++)
                    {
                        arr_search.push(command[i]);
                    }
                    var query = arr_search.join( " ");
                    try {
                        var yt_result = await yts(query);
                      } catch {
                          msg.reply("[!] An Error occured Youtube search aborted...");
                      }
                    let results = yt_result.all;
                    var tbuff = await getBuffer(results[0].image);
                    var ytresult = "";
                    ytresult += "「 *SamBot 👾 YOUTUBE SEARCH* 」";
                    ytresult += "\n________________________\n\n";
                    yt_result.all.map((video) => {
                    ytresult += "*Title:* " + video.title + "\n";
                    ytresult += "*Link:* " + video.url + "\n";
                    ytresult += "*Duration:* " + video.timestamp + "\n";
                    ytresult +=
                        "*Upload:* " + video.ago + "\n________________________\n\n";
                    });
                    //let thumbail = MessageMedia.fromFilePath("./images/thumbnails/yt_thumb.jpg");
                    client.sendMessage(numberIdentifier,  ytresult );
                    
                }
                break;
            //Youtube to mp3
            case ".ytmp3":
            case ".audio":
                if (command.length === 0)
                {
                    msg.reply("[ ! ] You did not provide a song title....");
                }
                var arr_search = [];
                for(var i = 1; i< command.length; i++)
                {
                    arr_search.push(command[i]);
                }
                var query = arr_search.join( " ");
                let yt_search = await yts(query);
                var yt_result = yt_search.all;
                var yt_url = yt_result[0].url;
                try {
                    ytaudio(yt_url)
                    .then((res) => {
                        const { dl_link, thumb, title, filesizeF, filesize } = res;
                        axios.get(`https://tinyurl.com/api-create.php?url=${dl_link}`)
                        .then(async (a) => {
                            if (Number(filesize) >= 100000) return sendMediaURL(from, thumb, `*PLAY MUSIC*\n\n*Title* : ${title}\n*Ext* : MP3\n*Filesize* : ${filesizeF}\n*Link* : ${a.data}\n\n_For the duration of more than the limit is presented in the form of a link_`)
                            const captions = `🎧 *SamBot 👾 MUSIC*\n\n*Title* : ${title}\n*Ext* : MP3\n*Size* : ${filesizeF}\n*Link* : ${a.data}\n\n_Please wait for the media file to be sent it may take a few minutes_`
                            client.sendMediaURL(msg.from, thumb )
                            client.sendMediaURL(msg.from, dl_link).catch(() => {msg.reply("SamBot 👾: [!] Couldn't fetch Video...")});
                            }) 
                        }).catch(client.sendMessage(numberIdentifier ,"SamBot 👾: [ ! ] Couldn't fetch Video..."))
                    } catch (err) {
                        client.sendMessage(numberIdentifier,'[ ! ] Internal server error...');
                        }
                break; 
                case ".ytmp4":
                case ".video":
                    if (command.length === 0)
                    {
                       client.sendMessage(numberIdentifier,"[!] You did not provide a youtube link...");
                    }
    
                   
                    try {
                        msg.reply("SamBot 👾 Fetching video...");
                        ytvideo(command[1]).then((res) => {
                        const { dl_link, thumb, title, filesizeF, filesize } = res;
                        axios
                            .get(`https://tinyurl.com/api-create.php?url=${dl_link}`)
                            .then((a) => {
                            if (Number(filesize) >= 9999999)
                                return client.sendMediaURL(
                                numberIdentifier,
                                thumb
                            
                                );
                            const captionsYtmp4 = `*Your video Request*\n\n*Title* : ${title}\n*Ext* : MP4\n*Size* : ${filesizeF}\n\n_Please wait for the media file to be sent it may take a few minutes_`;
                            client.sendMediaURL(numberIdentifier, thumb, captionsYtmp4);
                            client.sendMediaURL(numberIdentifier, dl_link).catch(() => {client.sendMessage(numberIdentifier,"SamBot 👾: [!] Couldn't fetch Video...")});
                            });
                        }).catch(client.sendMessage(numberIdentifier,"SamBot 👾: [ ! ] Couldn't fetch Video..."));
                    } catch (err) {
                        client.sendMessage(numberIdentifier, "SamBot 👾: [ ! ] Couldn't fetch Video...");
                    }
                    break;   
                    
            case ".help":
                client.sendMessage(msg.from, offlineReplyImage, {caption: "*Hi there*👋🏿👋🏿👋🏿\n\n======*Help List*======\n1: .help =To see the SamBot 👾 Help list.\n2: .video Or .ytmp4 =To download youtube video through a link.\n3: .ytmp3 .audio = To search for songs a download them.\n4: .dict = To search any english word through the Bot's dictionary API.\n5: .speed Or .pong Or .ping = To check your internet download speed.\n 6: .wiki = To get Oficial wikipedia links to your search term. \n~SamBot 👾"});
                break;
            default:
                break;
        }
    }//Messages send to DM END
});

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
