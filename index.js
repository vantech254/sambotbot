 const { Client, MessageMedia, Buttons } = require("whatsapp-web.js");
 const qrcode = require("qrcode-terminal");

const req = require('request');

const client = new Client({ puppeteer: { headless: true, args: ["--no-sandbox"] }, clientId: 'example' });
client.initialize();

const repliedDms= [];
//Loading image
const offlineReplyImage = MessageMedia.fromFilePath('./images/profilepic/dp.jpg');


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
                if(hour == 00)
                {
                    repliedDms= [];
                }
        }
        
        if(msg.body == ".ping" || msg.body == ".pong" || msg.body == ".speed"  )
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
                        msg.reply("Download speed is: *"+downspeed+ "* Megabytes per second.");
                        
                    });
                }

        }
            
        const wiki_msg = msg.body.split(" ");
        console.log(wiki_msg[0]);
        if( wiki_msg[0] == ".wiki")
  
                {
                    let data1 = [];
                    var query_raw = msg.body.split(" ");
                    var query = query_raw[1];
                    console.log(query);
                    // var url_wiki = `https://en.wikipedia.org/w/api.php?action=opensearch&search="+${query}+"$format=json`;
                    var url_wiki = `https://en.wikipedia.org/w/api.php?action=opensearch&search="+${query}+"&limit=10&namespace=0&format=json`;
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
                            // console.log(wiki_data);
                        }
                    });
                }
            

        

        


        }
        
  
    }

    
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
