var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    exec=require("child_process").exec,
    port = process.argv[2] || 8080;

http.createServer(function(request, response) {

    var pathurl = url.parse(request.url);
    var uri = pathurl.pathname,
        dir = uri.split('/',4), // [1] for real server
        filename = path.join(process.cwd(), uri);
    
    console.log(pathurl);
    console.log(dir);

    var contentTypesByExtension = {
        '.html': "text/html",
        '.css':  "text/css",
        '.js':   "text/javascript",
        '.json': "application/json",
        '.ico': "image/x-icon"
    };

    path.exists(filename, function(exist) {
        if(!exist || fs.statSync(filename).isDirectory()) {
            fs.readFile('404.html', "binary", function(err, file404) {
                if (err) {
                    response.writeHead(404, {"Content-Type": "text/plain"});
                    response.end("404 page is not found");
                    return;
                }
                response.writeHead(404, {"Content-Type": "text/html"});
                response.end(file404, "binary");
                console.log("404 " + filename);
            });
            return;
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {        
                response.writeHead(500, {"Content-Type": "text/plain"});
                response.write(err + "\n");
                response.end();
                return;
            }

            var headers = {};
            var contentType = contentTypesByExtension[path.extname(filename)];
            if (contentType) 
                headers["Content-Type"] = contentType;
            //console.log(contentType);
            response.writeHead(200, headers);
            response.write(file, "binary");
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");