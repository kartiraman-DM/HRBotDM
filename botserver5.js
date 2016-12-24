//var builder = require('botbuilder');  
//var https = require('https');  
//var connector = new builder.ConsoleConnector().listen();  
//var bot = new builder.UniversalBot(connector);  
//-----------------

var restify = require('restify');
var builder = require('botbuilder');
var https = require('https'); 

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: "4de90482-9dda-40c2-b92d-1ea0b11565d2", //process.env.MICROSOFT_APP_ID,
    appPassword: "YfgGnvfS0Apt5dyfK1gAEid" //process.env.MICROSOFT_APP_PASSWORD
});

//var connector = new builder.ConsoleConnector().listen();  
var bot = new builder.UniversalBot(connector); 

server.post('/api/messages', connector.listen());

//------------------------

var arr = [];  
  
function getBooksData(key) {  
    https.get("https://www.googleapis.com/books/v1/volumes?q=" + key + "&maxResults=5", function(res) {  
        var d = '';  
        var i;  
        arr = [];  
        res.on('data', function(chunk) {  
            d += chunk;  
        });  
        res.on('end', function() {  
            var e = JSON.parse(d);  
            for (i = 0; i < e.items.length; i++) {  
                console.log(i + 1 + ":" + e.items[i].volumeInfo.title);  
                arr.push({  
                    "description": e.items[i].volumeInfo.description,  
                    "title": e.items[i].volumeInfo.title,  
                    "saleability": e.items[i].saleInfo.saleability,  
                    "price": e.items[i].saleInfo.listPrice  
                });  
            }  
        });  
    });  
}  
var intents = new builder.IntentDialog();  
bot.dialog('/', intents);  
intents.matches(/^Hi/i,   
    function(session) {  
        builder.Prompts.text(session, 'Hey, I am a HRBot. Welcome to DigitalMeridian!...');  
    }       
);  
intents.matches(/^leave status/i, [  
    function(session) {  
        builder.Prompts.choice(session, "Do you want me to show detailed status?", "1|2");  
    }, 
    function(session, results) {  
        session.send('You was taking leave already 5 days, so now you having 2 sick leave, 4 planned leave only - %s.', results.response);        
    },      
    function(session, results) {  
        var book = arr[results.response.entity - 1];  
        if (book.saleability == 'FOR_SALE') {  
            session.send('Title:' + book.title + " Price:" + book.price.amount + " " + book.price.currencyCode);  
        } else {  
            session.send('Title:' + book.title + " Price: NOT FOR SALE");  
        }  
        session.send('Description:' + book.description);  
    }  
]);  
intents.onDefault(builder.DialogAction.send('Hi there! How can I help you today?')); 
