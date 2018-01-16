
var http = require('http')
  , os = require('os')
  , url = require('url')
  ;

var repo = {}
var db = [];
db_push = function(elm){
    db.push(elm);

    if(db.length > 100){
        db.shift();
    }
}

function handlePR(){}

function handleTesting(){}

function handleDeploy(){}

function handleQuickDeploy(){}

function handleHook(req, res){
    if(req.method == "POST") {
    var rawBody = [];
    req.on('data', function(chunk){
        rawBody.push(chunk);
    }).on('end', function(){
        var body = Buffer.concat(rawBody).toString();
        try {
            console.log("Received: {}", body);
            
            var parsedBody = JSON.parse(body);
            repo = parsedBody.repository;
            parsedBody.repository = undefined;
            parsedBody['http-header'] = req.headers;

            db.push(parsedBody)
        }catch(e){
            console.log("Oooops, server made boo boo in hook handling");
            console.log(e);
        }

        res.writeHead(201, { 'Content-Type': 'text/plain' });

        res.end("201 CREATED\n");
    });
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });

        res.end("400 BAD REQUEST\n");

    }
}

function handleUI(req,res){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var template = (e) => "<pre>"+e+"</pre><hr />"

    var formattedDb = db.map((e) => template(JSON.stringify(e, undefined, 2)))
    output = formattedDb.join("\n")

    res.end("<html><body>Thank you, come again\n"+output);
}

function handler(req, res){
    var path = url.parse(req.url).pathname;
    if ( path == "/hook") { 
        return handleHook(req, res);
    }
    return handleUI(req, res);
}

var server = http.createServer(handler);

server.listen(9001, function(){
    console.log("CI Server ready")
})
