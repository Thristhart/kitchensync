const riot = require('riot');

require('./tags/kitchen.tag');

riot.mount('kitchen');

riot.route.start(true);