// var http = require('http-proxy');
var http = require('http');

var log4js                  = require('log4js');
var ServiceDiscoveryObject  = require('./classes/ServiceDiscoveryHandler');


var logWriter = log4js.getLogger();
var serviceDiscovery = new ServiceDiscoveryObject(process.argv[2], process.argv[3]);

function transpileUrl(url) {
    var urlArrary = url.split('/');
    return {
        serviceName : urlArrary[1],
        servicePath : url.replace("/" + urlArrary[1], "")
    };
}

http.createServer(function (req, theResponse) {
    var body = "";
    if(req.method === "POST" || req.method === "PUT"){
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            test();
        })
    }else{
        test();
    }

    function test () {
        var urlDataExtracted = transpileUrl(req.url);
        if(body !== "") {
            req.prototype.body = body;
        }
        serviceDiscovery.getServiceInfo(urlDataExtracted.serviceName, urlDataExtracted.servicePath, req,
            function (data, urlDataExtracted, request) {
                logWriter.info("Extracted URL for service discovery");
                var extraHttp = require('http');
                var options = {
                    host: data[0].ServiceAddress,
                    path: urlDataExtracted,
                    port: data[0].ServicePort,
                    headers : request.headers,
                    method : request.method
                };

                var proxyClient = extraHttp.request(options, function (res) {
                    theResponse.writeHead(res.statusCode, res.headers);
                    var body = "";
                    res.on("data", function (chunk) {
                        body += chunk
                    });

                    res.on('end', function () {
                        theResponse.end(body)
                    })
                });

                if(request.method === "POST" || request.method === "PUT"){
                    proxyClient.write(request.body);
                }

                proxyClient.end();


            });
    }
}).listen(8080);
