var url = require('url');

exports.getMediaCrushID = function(url) {
  var mediaCrushRegex = /mediacru.sh(.*)\/([\w-]+)/;
  var matches = url.match(mediaCrushRegex);
  if(!matches)
    return null;
  return matches[matches.length - 1];
}
exports.getGiantBombID = function(url) {
  return url;
}
exports.getYoutubeID = require('get-youtube-id');

exports.parseURL = function(inputURL) {
  var parsed = url.parse(inputURL);
  var data = {};
  if(parsed.host == "youtube.com" || parsed.host == "www.youtube.com") {
    data.faucet = "youtube";
    data.contentId = exports.getYoutubeID(inputURL);
  }
  if(parsed.host == "mediacru.sh" || parsed.host == "www.mediacru.sh") {
    data.faucet = "mediacrush";
    data.contentId = exports.getMediaCrushID(inputURL); 
  }
  if(parsed.host == "v.giantbomb.com") {
    data.faucet = "giantbomb";
    data.contentId = inputURL;
  }

  return data;
}
