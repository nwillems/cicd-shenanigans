
var http = require('http')
  , https = require('https')
  , os = require('os')
  , url = require('url')
  , querystring = require('querystring')
  , process = require('process')
  , child_process = require('child_process')
  ;

var repo = {}
var db = [];
db_push = function(elm){
    db.push(elm);

    if(db.length > 100){
        db.shift();
    }
}

function exec(script, env, cb){
    if (!cb) { cb = env; env = {}; }

    var penv = Object.assign({}, process.env, env);

    return child_process.exec(
        script, 
        {"env": penv, "shell": "/bin/bash"}, //opts
        cb
    );
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
        res.on('end', () => console.log("\n===== End Of Request ====="));
    });
}

function handleTesting(body){
    // Probably do something about the input from github
    exec("./slow_test.sh", {}, function(err, stdout, stderr){
        console.log("Finished running slow_test.sh. OUTPUT: ", stdout, "stderr:", stderr);
    });
}

function handleDeploy(body){
    // Run the script that merges to production
    exec("./deploy.sh", {}, function(err, stdout, stderr){
        console.log("Finished deploying to prod-like envs. Celebrate");
    });
}

function handleQuickDeploy(req, res){
    console.log("Executing Quick Deploy thingie");
    exec("./quick_test.sh", { "GITHUB_CREDENTIALS":args['gh-token'] }, 
    function(err, stdout, stderr){
        console.log("Finished running quick_test.sh. OUTPUT: ", stdout, "stderr", stderr);
    });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("All righty partner, this is gonna be a bumpy ride")
}

function routeHook(body){
    if ( body['http-header']['x-github-event'] == "pull_request" &&
         (body.action == "opened" || body.action == "synchronize") ){
        handlePR(body);
    } else if ( body['http-header']['x-github-event'] == "push") {
        // Consider switch case
        if ( body.ref == "refs/heads/testing" ) {
            handleTesting(body)
        } else if ( body.ref == "refs/head/master" ) {
            handleDeploy(body)
        }
    }
}

function handleHook(req, res){
    if(req.method != "POST") {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("400 BAD REQUEST\n");
        return ;
    }

    var rawBody = [];
    req.on('data', function(chunk){
        rawBody.push(chunk);
    }).on('end', function(){
        var body = Buffer.concat(rawBody).toString();
        try {
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
    "gh-token": "",
    "port": 9001,
}

try {
    var args = Object.assign(args, querystring.parse(process.argv[2]));
}catch(e){
    console.log("Malformed arguments, should be a querystring", e);
}

if( ! args["gh-token"] ){ 
    console.log("github token is required, specify gh-token=..."); 
    process.exit(1);
}
if( typeof args["port"] !== "string" ){
    console.log("No port specified, using default: ", args["port"])
} else {
    args["port"] = parseInt(args["port"], 10)
}

var server = http.createServer(handler);

console.log("Running with args:", args);

server.listen(args["port"], function(){
    console.log("CI Server ready")
})
