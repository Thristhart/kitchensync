exports.getMediaCrushID = function(url) {
  var mediaCrushRegex = /mediacru.sh(.*)\/([\w-]+)/;
  var matches = url.match(mediaCrushRegex);
  if(!matches)
    return null;
  return matches[matches.length - 1];
}
exports.getYoutubeID = require('get-youtube-id');
