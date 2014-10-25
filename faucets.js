var urlLib = require('url');
var request = require('request');
var path = require('path');
var og = require('open-graph');

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

exports.getRTID = function(url, callback) {
  og(url, function(err, data) {
    if(err) {
      log("Error parsing RT opengraph, %o", err);
      callback(null);
      return;
    }
    var video = data.video;
    if(!video) {
      log("RT opengraph has no video");
      // probably html5 video via jwplayer, so try that
      request(url, function(error, response, body) {
        var jwPlayerEvilRegex = /file: "(.*720p.mp4)"/;
        var jwPlayerUrlMatches = body.match(jwPlayerEvilRegex);
        if(jwPlayerUrlMatches.length > 0) {
          var mediaUrl = jwPlayerUrlMatches[jwPlayerUrlMatches.length - 1];
          callback({faucet: "html5video", contentId: mediaUrl});
        }
        else
          callback(null);
      });
      return;
    }
    var blipParsed = urlLib.parse(video.secure_url);
    var blipFramePath = "https://" + blipParsed.host + blipParsed.pathname + ".html";
    log("Requesting iframe from blip: %s", blipFramePath);
    request(blipFramePath, function(error, response, body) {
      if(error) {
        log("Error trying to request blip embed frame: %o", error);
        callback(null);
        return;
      }
      if(response.statusCode == 404) {
        log("404d on blip embed request");
        callback(null);
        return;
      }
      var blipEvilRegex = /bliphd720 : "(.*)"/
      var blipVideoSourceMatches = body.match(blipEvilRegex);
      var mediaUrl = blipVideoSourceMatches[blipVideoSourceMatches.length - 1];
      mediaUrl = "https://blip.tv/file/get/" + mediaUrl + "?showplayer=20140904174336";
      callback({faucet: "html5video", contentId: mediaUrl});
    });
    callback(null);
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
  else if(parsed.host == "roosterteeth.com" || parsed.host == "www.roosterteeth.com") {
    log("Detected RT");
    exports.getRTID(inputURL, callback);
  }
  else {
    log("Could not detect a faucet by URL, attempting HEAD to get content type")
    exports.attemptToDetectContentTypeByHEAD(parsed, callback);
  }
}
