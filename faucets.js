var urlLib = require('url');
var request = require('request');
var path = require('path');
var log = require('debug')("faucets");

exports.getMediaCrushID = function(url) {
  var mediaCrushRegex = /mediacru.sh(.*)\/([\w-]+)/;
  var matches = url.match(mediaCrushRegex);
  if(!matches)
    return null;
  return matches[matches.length - 1];
}
exports.getYoutubeID = require('get-youtube-id');
exports.getAnimeFreakID = function(url, callback) {
  var animeFreakEvilRegex = /(coz|loadParts)\(["'](.+)["'],(.+)\)/;
  log("Requesting animefreak data with url %s", url);
  request(url, function(error, response, body) {
    if(error || response.statusCode == 404) {
      log("error loading animefreak page: %o", error);
      callback(null);
      return;
    }
    var matches = body.match(animeFreakEvilRegex);
    if(!matches || matches.length < 2) { // not the standard coz() thing
      callback(null);
    }
    var escapedURL = matches[matches.length - 2];
    log("Got animefreak body, with escapedURL %s", escapedURL);
    var data = {}
    data.faucet = "html5video";
    data.contentId = decodeURIComponent(escapedURL);
    if(data.contentId.indexOf("iframe") != -1) {
      // further parsing and requesting required... ew
      var frameSrcMatches = data.contentId.match(/src\=["'](.+)["']/);
      var iframeSrc = frameSrcMatches[frameSrcMatches.length - 1];
      request(iframeSrc, function(error, response, body) {
        if(error || response.statusCode == 404) {
          log("error loading secondary animefreak page: %o", error);
          callback(null);
          return;
        }
        var animeFreakEvil2Regex = /movie["'] value=["'](.+)file=(.+)["']/
        var flashMovieMatches = body.match(animeFreakEvil2Regex);
        log(flashMovieMatches);
        data.contentId = decodeURIComponent(flashMovieMatches[flashMovieMatches.length - 1]);
        data.contentId = data.contentId.replace(/\+/g, "%20"); // wtf, animefreak?
        log("Decoded escapedURL after secondary request: %s", data.contentId);
        callback(data);
      });
    }
    else {
      data.contentId = data.contentId.replace(/\+/g, "%20"); // wtf, animefreak?
      log("Decoded escapedURL: %s", data.contentId);
      callback(data);
    }
  });
}

exports.attemptToDetectContentTypeByHEAD = function(parsed, callback) {
  request.head(parsed.href, function(error, response, body) {
    if(error) {
      log("Got error from attempt to identify via HEAD: %o", error);
      log("Couldn't identify a contentType for url, no faucet assigned");
      callback(null);
      return;
    }
    log("Got HEAD response: %o", response.headers);
    var type = response.headers["content-type"];
    switch(type) {
      case "video/mp4":
      case "video/webm":
      case "video/ogg":
      case "application/ogg":
        log("Identified HTML5 Video content type of %s", type);
        callback({faucet: "html5video", contentId: parsed.href});
        break;
      case "audio/mpeg":
      case "audio/webm":
      case "audio/ogg":
      case "audio/wave":
      case "audio/wav":
      case "audio/x-wav":
      case "audio/x-pn-wav":
        log("Identified HTML5 Audio content type of %s", type);
        callback({faucet: "html5audio", contentId: parsed.href});
        break;
      default:
        log("Got a contentType with no faucet assigned to it, returning null (%s)", type);
        callback(null);
    }
  });
}

exports.parseURL = function(inputURL, callback) {
  var parsed = urlLib.parse(inputURL);
  var data = {};
  log("Detecting faucet for inputURL", inputURL);
  if(parsed.host == "youtube.com" || parsed.host == "www.youtube.com" || parsed.host == "youtu.be") {
    data.faucet = "youtube";
    log("Detected youtube");
    data.contentId = exports.getYoutubeID(inputURL);
    callback(data);
  }
  else if((parsed.host == "mediacru.sh" || parsed.host == "www.mediacru.sh") && path.extname(parsed.path) == '') {
    var mediaCrushURL = "https://mediacru.sh/"
    log("Detected mediacrush");
    mediaCrushURL += exports.getMediaCrushID(inputURL) + ".ogg";
    var mediaParsed = urlLib.parse(mediaCrushURL);
    exports.attemptToDetectContentTypeByHEAD(mediaParsed, callback);
  }
  else if(parsed.host == "animefreak.tv" || parsed.host == "www.animefreak.tv") {
    log("Detected animefreak");
    exports.getAnimeFreakID(inputURL, callback);
  }
  else {
    log("Could not detect a faucet by URL, attempting HEAD to get content type")
    exports.attemptToDetectContentTypeByHEAD(parsed, callback);
  }
}
