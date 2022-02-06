 const { Client, MessageMedia, Buttons } = require("whatsapp-web.js");
 const qrcode = require("qrcode-terminal");


const client = new Client({ puppeteer: { headless: false, args:["--no-sandbox"] }, clientId: 'example' });
client.initialize();

const repliedDms= [];
//Loading image
const offlineReplyImage = MessageMedia.fromFilePath('./images/profilepic/dp.jpg');


//Text and call button

let altbutton = new Buttons('Alternative Method', [{ id: 'text', body: 'SMS' },{ id: 'call', body: 'Call' }]);


client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
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
            if(element.includes(numberIdentifier)){
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
        
        
        
    }

    
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
