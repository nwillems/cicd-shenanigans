
var http = require('http')
  , https = require('https')
  , os = require('os')
  , url = require('url')
  , querystring = require('querystring')
  , process = require('process')
  ;

var repo = {}
var db = [];
db_push = function(elm){
    db.push(elm);

    if(db.length > 100){
        db.shift();
    }
}

function mkRequest(req_url, method, auth, body, cb){
    var req_opt = url.parse(req_url);
    // Auth info
    req_opt.auth = auth;
    // HTTP Method
    req_opt.method = method;
    // User-agent
    req_opt.headers = { "user-agent": "Homegrown CI" };

    request = https.request(req_opt, cb);

    request.write(body);
    request.end();

}

function handlePR(body){
    // AKA Set status to green
    var status_url = body.pull_request.statuses_url;

    req_body = {"state": "success", "description": "Built regularly", "context": "build & test"};
    req_body = JSON.stringify(req_body);
    mkRequest(status_url, "POST", args["gh-token"], req_body, function(res){
        console.log("Finished setting status", res.statusCode);
        res.on('data', (d) => process.stdout.write(d));
        res.on('end', () => console.log("===== End Of Request ====="));
    });
}

function handleTesting(){}

function handleDeploy(){}

function handleQuickDeploy(req, res){
    console.log("Executing Quick Deploy thingie");
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("All righty partner, this is gonna be a bumpy ride")
}

function routeHook(body){
    if ( body['http-header']['x-github-event'] == "pull_request" ){
        handlePR(body);
    }
}

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

            db.push(parsedBody);

            routeHook(parsedBody);
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
    } else if ( path == "/quickie") {
        return handleQuickDeploy(req, res);
    }
    return handleUI(req, res);
}
var args = {
    "gh-token": ""
}

try {
    var args = querystring.parse(process.argv[2]);
}catch(e){
    console.log("Malformed arguments, should be a querystring", e);
}

if( ! args["gh-token"] ){ console.log("github token is required, specify gh-token=..."); process.exit(1);}

var server = http.createServer(handler);

console.log("Running with args:", args);

server.listen(9001, function(){
    console.log("CI Server ready")
})
