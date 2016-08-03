var http    = require('http');
var log4js  = require('log4js');

var ServiceDiscoveryHandler = function (consulUrl, consulPort) {
    this.consulUrl = consulUrl;
    this.consulPort = consulPort;
    this.logWriter = log4js.getLogger();
};


ServiceDiscoveryHandler.prototype.getServiceInfo = function (serviceName, urlDataExtracted, request, callback) {

    var requestClient = require('request');

    requestClient("http://" + this.consulUrl + ":" + this.consulPort + "/v1/catalog/service/"+ serviceName, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(checkBody(body), urlDataExtracted, request)
        }
    });

};


function checkBody(body) {
    var emptyOutput = JSON.parse("{}");
    if(body == "") return emptyOutput;
    else{
        try{
            return JSON.parse(body);
        } catch (ex){
            return emptyOutput;
        }
    }
}

module.exports = ServiceDiscoveryHandler;