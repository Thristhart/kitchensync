"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    var riot = require('riot');

    var sync = require('./tags/sync.tag');

    riot.mount('*');
  }, { "./tags/sync.tag": 3, "riot": 2 }], 2: [function (require, module, exports) {
    /* Riot v2.3.17, @license MIT */

    ;(function (window, undefined) {
      'use strict';

      var riot = { version: 'v2.3.17', settings: {} },

      // be aware, internal usage
      // ATTENTION: prefix the global dynamic variables with `__`

      // counter to give a unique id to all the Tag instances
      __uid = 0,

      // tags instances cache
      __virtualDom = [],

      // tags implementation cache
      __tagImpl = {},


      /**
       * Const
       */
      GLOBAL_MIXIN = '__global_mixin',


      // riot specific prefixes
      RIOT_PREFIX = 'riot-',
          RIOT_TAG = RIOT_PREFIX + 'tag',
          RIOT_TAG_IS = 'data-is',


      // for typeof == '' comparisons
      T_STRING = 'string',
          T_OBJECT = 'object',
          T_UNDEF = 'undefined',
          T_BOOL = 'boolean',
          T_FUNCTION = 'function',

      // special native tags that cannot be treated like the others
      SPECIAL_TAGS_REGEX = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
          RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],


      // version# for IE 8-11, 0 for others
      IE_VERSION = (window && window.document || {}).documentMode | 0;
      /* istanbul ignore next */
      riot.observable = function (el) {

        /**
         * Extend the original object or create a new empty one
         * @type { Object }
         */

        el = el || {};

        /**
         * Private variables and methods
         */
        var callbacks = {},
            slice = Array.prototype.slice,
            onEachEvent = function onEachEvent(e, fn) {
          e.replace(/\S+/g, fn);
        };

        // extend the object adding the observable methods
        Object.defineProperties(el, {
          /**
           * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
           * @param  { String } events - events ids
           * @param  { Function } fn - callback function
           * @returns { Object } el
           */
          on: {
            value: function value(events, fn) {
              if (typeof fn != 'function') return el;

              onEachEvent(events, function (name, pos) {
                (callbacks[name] = callbacks[name] || []).push(fn);
                fn.typed = pos > 0;
              });

              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Removes the given space separated list of `events` listeners
           * @param   { String } events - events ids
           * @param   { Function } fn - callback function
           * @returns { Object } el
           */
          off: {
            value: function value(events, fn) {
              if (events == '*' && !fn) callbacks = {};else {
                onEachEvent(events, function (name) {
                  if (fn) {
                    var arr = callbacks[name];
                    for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                      if (cb == fn) arr.splice(i--, 1);
                    }
                  } else delete callbacks[name];
                });
              }
              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Listen to the given space separated list of `events` and execute the `callback` at most once
           * @param   { String } events - events ids
           * @param   { Function } fn - callback function
           * @returns { Object } el
           */
          one: {
            value: function value(events, fn) {
              function on() {
                el.off(events, on);
                fn.apply(el, arguments);
              }
              return el.on(events, on);
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Execute all callback functions that listen to the given space separated list of `events`
           * @param   { String } events - events ids
           * @returns { Object } el
           */
          trigger: {
            value: function value(events) {

              // getting the arguments
              var arglen = arguments.length - 1,
                  args = new Array(arglen),
                  fns;

              for (var i = 0; i < arglen; i++) {
                args[i] = arguments[i + 1]; // skip first argument
              }

              onEachEvent(events, function (name) {

                fns = slice.call(callbacks[name] || [], 0);

                for (var i = 0, fn; fn = fns[i]; ++i) {
                  if (fn.busy) return;
                  fn.busy = 1;
                  fn.apply(el, fn.typed ? [name].concat(args) : args);
                  if (fns[i] !== fn) {
                    i--;
                  }
                  fn.busy = 0;
                }

                if (callbacks['*'] && name != '*') el.trigger.apply(el, ['*', name].concat(args));
              });

              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          }
        });

        return el;
      }
      /* istanbul ignore next */
      ;(function (riot) {

        /**
         * Simple client-side router
         * @module riot-route
         */

        var RE_ORIGIN = /^.+?\/+[^\/]+/,
            EVENT_LISTENER = 'EventListener',
            REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
            ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
            HAS_ATTRIBUTE = 'hasAttribute',
            REPLACE = 'replace',
            POPSTATE = 'popstate',
            HASHCHANGE = 'hashchange',
            TRIGGER = 'trigger',
            MAX_EMIT_STACK_LEVEL = 3,
            win = typeof window != 'undefined' && window,
            doc = typeof document != 'undefined' && document,
            hist = win && history,
            loc = win && (hist.location || win.location),
            // see html5-history-api
        prot = Router.prototype,
            // to minify more
        clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
            started = false,
            central = riot.observable(),
            routeFound = false,
            debouncedEmit,
            base,
            current,
            parser,
            secondParser,
            emitStack = [],
            emitStackLevel = 0;

        /**
         * Default parser. You can replace it via router.parser method.
         * @param {string} path - current path (normalized)
         * @returns {array} array
         */
        function DEFAULT_PARSER(path) {
          return path.split(/[/?#]/);
        }

        /**
         * Default parser (second). You can replace it via router.parser method.
         * @param {string} path - current path (normalized)
         * @param {string} filter - filter string (normalized)
         * @returns {array} array
         */
        function DEFAULT_SECOND_PARSER(path, filter) {
          var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
              args = path.match(re);

          if (args) return args.slice(1);
        }

        /**
         * Simple/cheap debounce implementation
         * @param   {function} fn - callback
         * @param   {number} delay - delay in seconds
         * @returns {function} debounced function
         */
        function debounce(fn, delay) {
          var t;
          return function () {
            clearTimeout(t);
            t = setTimeout(fn, delay);
          };
        }

        /**
         * Set the window listeners to trigger the routes
         * @param {boolean} autoExec - see route.start
         */
        function start(autoExec) {
          debouncedEmit = debounce(emit, 1);
          win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit);
          win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
          doc[ADD_EVENT_LISTENER](clickEvent, click);
          if (autoExec) emit(true);
        }

        /**
         * Router class
         */
        function Router() {
          this.$ = [];
          riot.observable(this); // make it observable
          central.on('stop', this.s.bind(this));
          central.on('emit', this.e.bind(this));
        }

        function normalize(path) {
          return path[REPLACE](/^\/|\/$/, '');
        }

        function isString(str) {
          return typeof str == 'string';
        }

        /**
         * Get the part after domain name
         * @param {string} href - fullpath
         * @returns {string} path from root
         */
        function getPathFromRoot(href) {
          return (href || loc.href || '')[REPLACE](RE_ORIGIN, '');
        }

        /**
         * Get the part after base
         * @param {string} href - fullpath
         * @returns {string} path from base
         */
        function getPathFromBase(href) {
          return base[0] == '#' ? (href || loc.href || '').split(base)[1] || '' : getPathFromRoot(href)[REPLACE](base, '');
        }

        function emit(force) {
          // the stack is needed for redirections
          var isRoot = emitStackLevel == 0;
          if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return;

          emitStackLevel++;
          emitStack.push(function () {
            var path = getPathFromBase();
            if (force || path != current) {
              central[TRIGGER]('emit', path);
              current = path;
            }
          });
          if (isRoot) {
            while (emitStack.length) {
              emitStack[0]();
              emitStack.shift();
            }
            emitStackLevel = 0;
          }
        }

        function click(e) {
          if (e.which != 1 // not left click
           || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
           || e.defaultPrevented // or default prevented
          ) return;

          var el = e.target;
          while (el && el.nodeName != 'A') {
            el = el.parentNode;
          }if (!el || el.nodeName != 'A' // not A tag
           || el[HAS_ATTRIBUTE]('download') // has download attr
           || !el[HAS_ATTRIBUTE]('href') // has no href attr
           || el.target && el.target != '_self' // another window or frame
           || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
          ) return;

          if (el.href != loc.href) {
            if (el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
             || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
             || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
            ) return;
          }

          e.preventDefault();
        }

        /**
         * Go to the path
         * @param {string} path - destination path
         * @param {string} title - page title
         * @param {boolean} shouldReplace - use replaceState or pushState
         * @returns {boolean} - route not found flag
         */
        function go(path, title, shouldReplace) {
          if (hist) {
            // if a browser
            path = base + normalize(path);
            title = title || doc.title;
            // browsers ignores the second parameter `title`
            shouldReplace ? hist.replaceState(null, title, path) : hist.pushState(null, title, path);
            // so we need to set it manually
            doc.title = title;
            routeFound = false;
            emit();
            return routeFound;
          }

          // Server-side usage: directly execute handlers for the path
          return central[TRIGGER]('emit', getPathFromBase(path));
        }

        /**
         * Go to path or set action
         * a single string:                go there
         * two strings:                    go there with setting a title
         * two strings and boolean:        replace history with setting a title
         * a single function:              set an action on the default route
         * a string/RegExp and a function: set an action on the route
         * @param {(string|function)} first - path / action / filter
         * @param {(string|RegExp|function)} second - title / action
         * @param {boolean} third - replace flag
         */
        prot.m = function (first, second, third) {
          if (isString(first) && (!second || isString(second))) go(first, second, third || false);else if (second) this.r(first, second);else this.r('@', first);
        };

        /**
         * Stop routing
         */
        prot.s = function () {
          this.off('*');
          this.$ = [];
        };

        /**
         * Emit
         * @param {string} path - path
         */
        prot.e = function (path) {
          this.$.concat('@').some(function (filter) {
            var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter));
            if (typeof args != 'undefined') {
              this[TRIGGER].apply(null, [filter].concat(args));
              return routeFound = true; // exit from loop
            }
          }, this);
        };

        /**
         * Register route
         * @param {string} filter - filter for matching to url
         * @param {function} action - action to register
         */
        prot.r = function (filter, action) {
          if (filter != '@') {
            filter = '/' + normalize(filter);
            this.$.push(filter);
          }
          this.on(filter, action);
        };

        var mainRouter = new Router();
        var route = mainRouter.m.bind(mainRouter);

        /**
         * Create a sub router
         * @returns {function} the method of a new Router object
         */
        route.create = function () {
          var newSubRouter = new Router();
          // stop only this sub-router
          newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter);
          // return sub-router's main method
          return newSubRouter.m.bind(newSubRouter);
        };

        /**
         * Set the base of url
         * @param {(str|RegExp)} arg - a new base or '#' or '#!'
         */
        route.base = function (arg) {
          base = arg || '#';
          current = getPathFromBase(); // recalculate current path
        };

        /** Exec routing right now **/
        route.exec = function () {
          emit(true);
        };

        /**
         * Replace the default router to yours
         * @param {function} fn - your parser function
         * @param {function} fn2 - your secondParser function
         */
        route.parser = function (fn, fn2) {
          if (!fn && !fn2) {
            // reset parser for testing...
            parser = DEFAULT_PARSER;
            secondParser = DEFAULT_SECOND_PARSER;
          }
          if (fn) parser = fn;
          if (fn2) secondParser = fn2;
        };

        /**
         * Helper function to get url query as an object
         * @returns {object} parsed query
         */
        route.query = function () {
          var q = {};
          var href = loc.href || current;
          href[REPLACE](/[?&](.+?)=([^&]*)/g, function (_, k, v) {
            q[k] = v;
          });
          return q;
        };

        /** Stop routing **/
        route.stop = function () {
          if (started) {
            if (win) {
              win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit);
              win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
              doc[REMOVE_EVENT_LISTENER](clickEvent, click);
            }
            central[TRIGGER]('stop');
            started = false;
          }
        };

        /**
         * Start routing
         * @param {boolean} autoExec - automatically exec after starting if true
         */
        route.start = function (autoExec) {
          if (!started) {
            if (win) {
              if (document.readyState == 'complete') start(autoExec);
              // the timeout is needed to solve
              // a weird safari bug https://github.com/riot/route/issues/33
              else win[ADD_EVENT_LISTENER]('load', function () {
                  setTimeout(function () {
                    start(autoExec);
                  }, 1);
                });
            }
            started = true;
          }
        };

        /** Prepare the router **/
        route.base();
        route.parser();

        riot.route = route;
      })(riot);
      /* istanbul ignore next */

      /**
       * The riot template engine
       * @version v2.3.21
       */

      /**
       * riot.util.brackets
       *
       * - `brackets    ` - Returns a string or regex based on its parameter
       * - `brackets.set` - Change the current riot brackets
       *
       * @module
       */

      var brackets = function (UNDEF) {

        var REGLOB = 'g',
            R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
            R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,
            S_QBLOCKS = R_STRINGS.source + '|' + /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' + /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,
            FINDBRACES = {
          '(': RegExp('([()])|' + S_QBLOCKS, REGLOB),
          '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
          '{': RegExp('([{}])|' + S_QBLOCKS, REGLOB)
        },
            DEFAULT = '{ }';

        var _pairs = ['{', '}', '{', '}', /{[^}]*}/, /\\([{}])/g, /\\({)|{/g, RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB), DEFAULT, /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/, /(^|[^\\]){=[\S\s]*?}/];

        var cachedBrackets = UNDEF,
            _regex,
            _cache = [],
            _settings;

        function _loopback(re) {
          return re;
        }

        function _rewrite(re, bp) {
          if (!bp) bp = _cache;
          return new RegExp(re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : '');
        }

        function _create(pair) {
          if (pair === DEFAULT) return _pairs;

          var arr = pair.split(' ');

          if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
            throw new Error('Unsupported brackets "' + pair + '"');
          }
          arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '));

          arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
          arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
          arr[6] = _rewrite(_pairs[6], arr);
          arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB);
          arr[8] = pair;
          return arr;
        }

        function _brackets(reOrIdx) {
          return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx];
        }

        _brackets.split = function split(str, tmpl, _bp) {
          // istanbul ignore next: _bp is for the compiler
          if (!_bp) _bp = _cache;

          var parts = [],
              match,
              isexpr,
              start,
              pos,
              re = _bp[6];

          isexpr = start = re.lastIndex = 0;

          while (match = re.exec(str)) {

            pos = match.index;

            if (isexpr) {

              if (match[2]) {
                re.lastIndex = skipBraces(str, match[2], re.lastIndex);
                continue;
              }
              if (!match[3]) continue;
            }

            if (!match[1]) {
              unescapeStr(str.slice(start, pos));
              start = re.lastIndex;
              re = _bp[6 + (isexpr ^= 1)];
              re.lastIndex = start;
            }
          }

          if (str && start < str.length) {
            unescapeStr(str.slice(start));
          }

          return parts;

          function unescapeStr(s) {
            if (tmpl || isexpr) parts.push(s && s.replace(_bp[5], '$1'));else parts.push(s);
          }

          function skipBraces(s, ch, ix) {
            var match,
                recch = FINDBRACES[ch];

            recch.lastIndex = ix;
            ix = 1;
            while (match = recch.exec(s)) {
              if (match[1] && !(match[1] === ch ? ++ix : --ix)) break;
            }
            return ix ? s.length : recch.lastIndex;
          }
        };

        _brackets.hasExpr = function hasExpr(str) {
          return _cache[4].test(str);
        };

        _brackets.loopKeys = function loopKeys(expr) {
          var m = expr.match(_cache[9]);
          return m ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] } : { val: expr.trim() };
        };

        _brackets.hasRaw = function (src) {
          return _cache[10].test(src);
        };

        _brackets.array = function array(pair) {
          return pair ? _create(pair) : _cache;
        };

        function _reset(pair) {
          if ((pair || (pair = DEFAULT)) !== _cache[8]) {
            _cache = _create(pair);
            _regex = pair === DEFAULT ? _loopback : _rewrite;
            _cache[9] = _regex(_pairs[9]);
            _cache[10] = _regex(_pairs[10]);
          }
          cachedBrackets = pair;
        }

        function _setSettings(o) {
          var b;
          o = o || {};
          b = o.brackets;
          Object.defineProperty(o, 'brackets', {
            set: _reset,
            get: function get() {
              return cachedBrackets;
            },
            enumerable: true
          });
          _settings = o;
          _reset(b);
        }

        Object.defineProperty(_brackets, 'settings', {
          set: _setSettings,
          get: function get() {
            return _settings;
          }
        });

        /* istanbul ignore next: in the browser riot is always in the scope */
        _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
        _brackets.set = _reset;

        _brackets.R_STRINGS = R_STRINGS;
        _brackets.R_MLCOMMS = R_MLCOMMS;
        _brackets.S_QBLOCKS = S_QBLOCKS;

        return _brackets;
      }();

      /**
       * @module tmpl
       *
       * tmpl          - Root function, returns the template value, render with data
       * tmpl.hasExpr  - Test the existence of a expression inside a string
       * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
       */

      var tmpl = function () {

        var _cache = {};

        function _tmpl(str, data) {
          if (!str) return str;

          return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr);
        }

        _tmpl.haveRaw = brackets.hasRaw;

        _tmpl.hasExpr = brackets.hasExpr;

        _tmpl.loopKeys = brackets.loopKeys;

        _tmpl.errorHandler = null;

        function _logErr(err, ctx) {

          if (_tmpl.errorHandler) {

            err.riotData = {
              tagName: ctx && ctx.root && ctx.root.tagName,
              _riot_id: ctx && ctx._riot_id //eslint-disable-line camelcase
            };
            _tmpl.errorHandler(err);
          }
        }

        function _create(str) {

          var expr = _getTmpl(str);
          if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr;

          return new Function('E', expr + ';');
        }

        var RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
            RE_QBMARK = /\x01(\d+)~/g;

        function _getTmpl(str) {
          var qstr = [],
              expr,
              parts = brackets.split(str.replace(/\u2057/g, '"'), 1);

          if (parts.length > 2 || parts[0]) {
            var i,
                j,
                list = [];

            for (i = j = 0; i < parts.length; ++i) {

              expr = parts[i];

              if (expr && (expr = i & 1 ? _parseExpr(expr, 1, qstr) : '"' + expr.replace(/\\/g, '\\\\').replace(/\r\n?|\n/g, '\\n').replace(/"/g, '\\"') + '"')) list[j++] = expr;
            }

            expr = j < 2 ? list[0] : '[' + list.join(',') + '].join("")';
          } else {

            expr = _parseExpr(parts[1], 0, qstr);
          }

          if (qstr[0]) expr = expr.replace(RE_QBMARK, function (_, pos) {
            return qstr[pos].replace(/\r/g, '\\r').replace(/\n/g, '\\n');
          });

          return expr;
        }

        var RE_BREND = {
          '(': /[()]/g,
          '[': /[[\]]/g,
          '{': /[{}]/g
        },
            CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/;

        function _parseExpr(expr, asText, qstr) {

          if (expr[0] === '=') expr = expr.slice(1);

          expr = expr.replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s;
          }).replace(/\s+/g, ' ').trim().replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

          if (expr) {
            var list = [],
                cnt = 0,
                match;

            while (expr && (match = expr.match(CS_IDENT)) && !match.index) {
              var key,
                  jsb,
                  re = /,|([[{(])|$/g;

              expr = RegExp.rightContext;
              key = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

              while (jsb = (match = re.exec(expr))[1]) {
                skipBraces(jsb, re);
              }jsb = expr.slice(0, match.index);
              expr = RegExp.rightContext;

              list[cnt++] = _wrapExpr(jsb, 1, key);
            }

            expr = !cnt ? _wrapExpr(expr, asText) : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
          }
          return expr;

          function skipBraces(ch, re) {
            var mm,
                lv = 1,
                ir = RE_BREND[ch];

            ir.lastIndex = re.lastIndex;
            while (mm = ir.exec(expr)) {
              if (mm[0] === ch) ++lv;else if (! --lv) break;
            }
            re.lastIndex = lv ? expr.length : ir.lastIndex;
          }
        }

        // istanbul ignore next: not both
        var JS_CONTEXT = '"in this?this:' + ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== 'object' ? 'global' : 'window') + ').',
            JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
            JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

        function _wrapExpr(expr, asText, key) {
          var tb;

          expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
            if (mvar) {
              pos = tb ? 0 : pos + match.length;

              if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
                match = p + '("' + mvar + JS_CONTEXT + mvar;
                if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '[';
              } else if (pos) {
                tb = !JS_NOPROPS.test(s.slice(pos));
              }
            }
            return match;
          });

          if (tb) {
            expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
          }

          if (key) {

            expr = (tb ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')') + '?"' + key + '":""';
          } else if (asText) {

            expr = 'function(v){' + (tb ? expr.replace('return ', 'v=') : 'v=(' + expr + ')') + ';return v||v===0?v:""}.call(this)';
          }

          return expr;
        }

        // istanbul ignore next: compatibility fix for beta versions
        _tmpl.parse = function (s) {
          return s;
        };

        _tmpl.version = brackets.version = 'v2.3.21';

        return _tmpl;
      }();

      /*
        lib/browser/tag/mkdom.js
      
        Includes hacks needed for the Internet Explorer version 9 and below
        See: http://kangax.github.io/compat-table/es5/#ie8
             http://codeplanet.io/dropping-ie8/
      */
      var mkdom = function _mkdom() {
        var reHasYield = /<yield\b/i,
            reYieldAll = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig,
            reYieldSrc = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig,
            reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
        var rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
            tblTags = IE_VERSION && IE_VERSION < 10 ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;

        /**
         * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
         * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
         *
         * @param   {string} templ  - The template coming from the custom tag definition
         * @param   {string} [html] - HTML content that comes from the DOM element where you
         *           will mount the tag, mostly the original tag in the page
         * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
         */
        function _mkdom(templ, html) {
          var match = templ && templ.match(/^\s*<([-\w]+)/),
              tagName = match && match[1].toLowerCase(),
              el = mkEl('div');

          // replace all the yield tags with the tag inner html
          templ = replaceYield(templ, html);

          /* istanbul ignore next */
          if (tblTags.test(tagName)) el = specialTags(el, templ, tagName);else el.innerHTML = templ;

          el.stub = true;

          return el;
        }

        /*
          Creates the root element for table or select child elements:
          tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
        */
        function specialTags(el, templ, tagName) {
          var select = tagName[0] === 'o',
              parent = select ? 'select>' : 'table>';

          // trim() is important here, this ensures we don't have artifacts,
          // so we can check if we have only one element inside the parent
          el.innerHTML = '<' + parent + templ.trim() + '</' + parent;
          parent = el.firstChild;

          // returns the immediate parent if tr/th/td/col is the only element, if not
          // returns the whole tree, as this can include additional elements
          if (select) {
            parent.selectedIndex = -1; // for IE9, compatible w/current riot behavior
          } else {
              // avoids insertion of cointainer inside container (ex: tbody inside tbody)
              var tname = rootEls[tagName];
              if (tname && parent.childElementCount === 1) parent = $(tname, parent);
            }
          return parent;
        }

        /*
          Replace the yield tag from any tag template with the innerHTML of the
          original tag in the page
        */
        function replaceYield(templ, html) {
          // do nothing if no yield
          if (!reHasYield.test(templ)) return templ;

          // be careful with #1343 - string on the source having `$1`
          var src = {};

          html = html && html.replace(reYieldSrc, function (_, ref, text) {
            src[ref] = src[ref] || text; // preserve first definition
            return '';
          }).trim();

          return templ.replace(reYieldDest, function (_, ref, def) {
            // yield with from - to attrs
            return src[ref] || def || '';
          }).replace(reYieldAll, function (_, def) {
            // yield without any "from"
            return html || def || '';
          });
        }

        return _mkdom;
      }();

      /**
       * Convert the item looped into an object used to extend the child tag properties
       * @param   { Object } expr - object containing the keys used to extend the children tags
       * @param   { * } key - value to assign to the new object returned
       * @param   { * } val - value containing the position of the item in the array
       * @returns { Object } - new object containing the values of the original item
       *
       * The variables 'key' and 'val' are arbitrary.
       * They depend on the collection type looped (Array, Object)
       * and on the expression used on the each tag
       *
       */
      function mkitem(expr, key, val) {
        var item = {};
        item[expr.key] = key;
        if (expr.pos) item[expr.pos] = val;
        return item;
      }

      /**
       * Unmount the redundant tags
       * @param   { Array } items - array containing the current items to loop
       * @param   { Array } tags - array containing all the children tags
       */
      function unmountRedundant(items, tags) {

        var i = tags.length,
            j = items.length,
            t;

        while (i > j) {
          t = tags[--i];
          tags.splice(i, 1);
          t.unmount();
        }
      }

      /**
       * Move the nested custom tags in non custom loop tags
       * @param   { Object } child - non custom loop tag
       * @param   { Number } i - current position of the loop tag
       */
      function moveNestedTags(child, i) {
        Object.keys(child.tags).forEach(function (tagName) {
          var tag = child.tags[tagName];
          if (isArray(tag)) each(tag, function (t) {
            moveChildTag(t, tagName, i);
          });else moveChildTag(tag, tagName, i);
        });
      }

      /**
       * Adds the elements for a virtual tag
       * @param { Tag } tag - the tag whose root's children will be inserted or appended
       * @param { Node } src - the node that will do the inserting or appending
       * @param { Tag } target - only if inserting, insert before this tag's first child
       */
      function addVirtual(tag, src, target) {
        var el = tag._root,
            sib;
        tag._virts = [];
        while (el) {
          sib = el.nextSibling;
          if (target) src.insertBefore(el, target._root);else src.appendChild(el);

          tag._virts.push(el); // hold for unmounting
          el = sib;
        }
      }

      /**
       * Move virtual tag and all child nodes
       * @param { Tag } tag - first child reference used to start move
       * @param { Node } src  - the node that will do the inserting
       * @param { Tag } target - insert before this tag's first child
       * @param { Number } len - how many child nodes to move
       */
      function moveVirtual(tag, src, target, len) {
        var el = tag._root,
            sib,
            i = 0;
        for (; i < len; i++) {
          sib = el.nextSibling;
          src.insertBefore(el, target._root);
          el = sib;
        }
      }

      /**
       * Manage tags having the 'each'
       * @param   { Object } dom - DOM node we need to loop
       * @param   { Tag } parent - parent tag instance where the dom node is contained
       * @param   { String } expr - string contained in the 'each' attribute
       */
      function _each(dom, parent, expr) {

        // remove the each property from the original tag
        remAttr(dom, 'each');

        var mustReorder = _typeof(getAttr(dom, 'no-reorder')) !== T_STRING || remAttr(dom, 'no-reorder'),
            tagName = getTagName(dom),
            impl = __tagImpl[tagName] || { tmpl: dom.outerHTML },
            useRoot = SPECIAL_TAGS_REGEX.test(tagName),
            root = dom.parentNode,
            ref = document.createTextNode(''),
            child = getTag(dom),
            isOption = tagName.toLowerCase() === 'option',
            // the option tags must be treated differently
        tags = [],
            oldItems = [],
            hasKeys,
            isVirtual = dom.tagName == 'VIRTUAL';

        // parse the each expression
        expr = tmpl.loopKeys(expr);

        // insert a marked where the loop tags will be injected
        root.insertBefore(ref, dom);

        // clean template code
        parent.one('before-mount', function () {

          // remove the original DOM node
          dom.parentNode.removeChild(dom);
          if (root.stub) root = parent.root;
        }).on('update', function () {
          // get the new items collection
          var items = tmpl(expr.val, parent),

          // create a fragment to hold the new DOM nodes to inject in the parent tag
          frag = document.createDocumentFragment();

          // object loop. any changes cause full redraw
          if (!isArray(items)) {
            hasKeys = items || false;
            items = hasKeys ? Object.keys(items).map(function (key) {
              return mkitem(expr, key, items[key]);
            }) : [];
          }

          // loop all the new items
          var i = 0,
              itemsLength = items.length;

          for (; i < itemsLength; i++) {
            // reorder only if the items are objects
            var item = items[i],
                _mustReorder = mustReorder && item instanceof Object && !hasKeys,
                oldPos = oldItems.indexOf(item),
                pos = ~oldPos && _mustReorder ? oldPos : i,

            // does a tag exist in this position?
            tag = tags[pos];

            item = !hasKeys && expr.key ? mkitem(expr, item, i) : item;

            // new tag
            if (!_mustReorder && !tag // with no-reorder we just update the old tags
             || _mustReorder && ! ~oldPos || !tag // by default we always try to reorder the DOM elements
            ) {

                tag = new Tag(impl, {
                  parent: parent,
                  isLoop: true,
                  hasImpl: !!__tagImpl[tagName],
                  root: useRoot ? root : dom.cloneNode(),
                  item: item
                }, dom.innerHTML);

                tag.mount();

                if (isVirtual) tag._root = tag.root.firstChild; // save reference for further moves or inserts
                // this tag must be appended
                if (i == tags.length || !tags[i]) {
                  // fix 1581
                  if (isVirtual) addVirtual(tag, frag);else frag.appendChild(tag.root);
                }
                // this tag must be insert
                else {
                    if (isVirtual) addVirtual(tag, root, tags[i]);else root.insertBefore(tag.root, tags[i].root); // #1374 some browsers reset selected here
                    oldItems.splice(i, 0, item);
                  }

                tags.splice(i, 0, tag);
                pos = i; // handled here so no move
              } else tag.update(item, true);

            // reorder the tag if it's not located in its previous position
            if (pos !== i && _mustReorder && tags[i] // fix 1581 unable to reproduce it in a test!
            ) {
                // update the DOM
                if (isVirtual) moveVirtual(tag, root, tags[i], dom.childNodes.length);else root.insertBefore(tag.root, tags[i].root);
                // update the position attribute if it exists
                if (expr.pos) tag[expr.pos] = i;
                // move the old tag instance
                tags.splice(i, 0, tags.splice(pos, 1)[0]);
                // move the old item
                oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
                // if the loop tags are not custom
                // we need to move all their custom tags into the right position
                if (!child && tag.tags) moveNestedTags(tag, i);
              }

            // cache the original item to use it in the events bound to this node
            // and its children
            tag._item = item;
            // cache the real parent tag internally
            defineProperty(tag, '_parent', parent);
          }

          // remove the redundant tags
          unmountRedundant(items, tags);

          // insert the new nodes
          if (isOption) {
            root.appendChild(frag);

            // #1374 <select> <option selected={true}> </select>
            if (root.length) {
              var si,
                  op = root.options;

              root.selectedIndex = si = -1;
              for (i = 0; i < op.length; i++) {
                if (op[i].selected = op[i].__selected) {
                  if (si < 0) root.selectedIndex = si = i;
                }
              }
            }
          } else root.insertBefore(frag, ref);

          // set the 'tags' property of the parent tag
          // if child is 'undefined' it means that we don't need to set this property
          // for example:
          // we don't need store the `myTag.tags['div']` property if we are looping a div tag
          // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
          if (child) parent.tags[tagName] = tags;

          // clone the items array
          oldItems = items.slice();
        });
      }
      /**
       * Object that will be used to inject and manage the css of every tag instance
       */
      var styleManager = function (_riot) {

        if (!window) return { // skip injection on the server
          add: function add() {},
          inject: function inject() {}
        };

        var styleNode = function () {
          // create a new style element with the correct type
          var newNode = mkEl('style');
          setAttr(newNode, 'type', 'text/css');

          // replace any user node or insert the new one into the head
          var userNode = $('style[type=riot]');
          if (userNode) {
            if (userNode.id) newNode.id = userNode.id;
            userNode.parentNode.replaceChild(newNode, userNode);
          } else document.getElementsByTagName('head')[0].appendChild(newNode);

          return newNode;
        }();

        // Create cache and shortcut to the correct property
        var cssTextProp = styleNode.styleSheet,
            stylesToInject = '';

        // Expose the style node in a non-modificable property
        Object.defineProperty(_riot, 'styleNode', {
          value: styleNode,
          writable: true
        });

        /**
         * Public api
         */
        return {
          /**
           * Save a tag style to be later injected into DOM
           * @param   { String } css [description]
           */
          add: function add(css) {
            stylesToInject += css;
          },
          /**
           * Inject all previously saved tag styles into DOM
           * innerHTML seems slow: http://jsperf.com/riot-insert-style
           */
          inject: function inject() {
            if (stylesToInject) {
              if (cssTextProp) cssTextProp.cssText += stylesToInject;else styleNode.innerHTML += stylesToInject;
              stylesToInject = '';
            }
          }
        };
      }(riot);

      function parseNamedElements(root, tag, childTags, forceParsingNamed) {

        walk(root, function (dom) {
          if (dom.nodeType == 1) {
            dom.isLoop = dom.isLoop || dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each') ? 1 : 0;

            // custom child tag
            if (childTags) {
              var child = getTag(dom);

              if (child && !dom.isLoop) childTags.push(initChildTag(child, { root: dom, parent: tag }, dom.innerHTML, tag));
            }

            if (!dom.isLoop || forceParsingNamed) setNamed(dom, tag, []);
          }
        });
      }

      function parseExpressions(root, tag, expressions) {

        function addExpr(dom, val, extra) {
          if (tmpl.hasExpr(val)) {
            expressions.push(extend({ dom: dom, expr: val }, extra));
          }
        }

        walk(root, function (dom) {
          var type = dom.nodeType,
              attr;

          // text node
          if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue);
          if (type != 1) return;

          /* element */

          // loop
          attr = getAttr(dom, 'each');

          if (attr) {
            _each(dom, tag, attr);return false;
          }

          // attribute expressions
          each(dom.attributes, function (attr) {
            var name = attr.name,
                bool = name.split('__')[1];

            addExpr(dom, attr.value, { attr: bool || name, bool: bool });
            if (bool) {
              remAttr(dom, name);return false;
            }
          });

          // skip custom tags
          if (getTag(dom)) return false;
        });
      }
      function Tag(impl, conf, innerHTML) {

        var self = riot.observable(this),
            opts = inherit(conf.opts) || {},
            parent = conf.parent,
            isLoop = conf.isLoop,
            hasImpl = conf.hasImpl,
            item = cleanUpData(conf.item),
            expressions = [],
            childTags = [],
            root = conf.root,
            tagName = root.tagName.toLowerCase(),
            attr = {},
            implAttr = {},
            propsInSyncWithParent = [],
            dom;

        // only call unmount if we have a valid __tagImpl (has name property)
        if (impl.name && root._tag) root._tag.unmount(true);

        // not yet mounted
        this.isMounted = false;
        root.isLoop = isLoop;

        // keep a reference to the tag just created
        // so we will be able to mount this tag multiple times
        root._tag = this;

        // create a unique id to this tag
        // it could be handy to use it also to improve the virtual dom rendering speed
        defineProperty(this, '_riot_id', ++__uid); // base 1 allows test !t._riot_id

        extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item);

        // grab attributes
        each(root.attributes, function (el) {
          var val = el.value;
          // remember attributes with expressions only
          if (tmpl.hasExpr(val)) attr[el.name] = val;
        });

        dom = mkdom(impl.tmpl, innerHTML);

        // options
        function updateOpts() {
          var ctx = hasImpl && isLoop ? self : parent || self;

          // update opts from current DOM attributes
          each(root.attributes, function (el) {
            var val = el.value;
            opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val;
          });
          // recover those with expressions
          each(Object.keys(attr), function (name) {
            opts[toCamel(name)] = tmpl(attr[name], ctx);
          });
        }

        function normalizeData(data) {
          for (var key in item) {
            if (_typeof(self[key]) !== T_UNDEF && isWritable(self, key)) self[key] = data[key];
          }
        }

        function inheritFromParent() {
          if (!self.parent || !isLoop) return;
          each(Object.keys(self.parent), function (k) {
            // some properties must be always in sync with the parent tag
            var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k);
            if (_typeof(self[k]) === T_UNDEF || mustSync) {
              // track the property to keep in sync
              // so we can keep it updated
              if (!mustSync) propsInSyncWithParent.push(k);
              self[k] = self.parent[k];
            }
          });
        }

        /**
         * Update the tag expressions and options
         * @param   { * }  data - data we want to use to extend the tag properties
         * @param   { Boolean } isInherited - is this update coming from a parent tag?
         * @returns { self }
         */
        defineProperty(this, 'update', function (data, isInherited) {

          // make sure the data passed will not override
          // the component core methods
          data = cleanUpData(data);
          // inherit properties from the parent
          inheritFromParent();
          // normalize the tag properties in case an item object was initially passed
          if (data && isObject(item)) {
            normalizeData(data);
            item = data;
          }
          extend(self, data);
          updateOpts();
          self.trigger('update', data);
          update(expressions, self);

          // the updated event will be triggered
          // once the DOM will be ready and all the re-flows are completed
          // this is useful if you want to get the "real" root properties
          // 4 ex: root.offsetWidth ...
          if (isInherited && self.parent)
            // closes #1599
            self.parent.one('updated', function () {
              self.trigger('updated');
            });else rAF(function () {
            self.trigger('updated');
          });

          return this;
        });

        defineProperty(this, 'mixin', function () {
          each(arguments, function (mix) {
            var instance;

            mix = (typeof mix === "undefined" ? "undefined" : _typeof(mix)) === T_STRING ? riot.mixin(mix) : mix;

            // check if the mixin is a function
            if (isFunction(mix)) {
              // create the new mixin instance
              instance = new mix();
              // save the prototype to loop it afterwards
              mix = mix.prototype;
            } else instance = mix;

            // loop the keys in the function prototype or the all object keys
            each(Object.getOwnPropertyNames(mix), function (key) {
              // bind methods to self
              if (key != 'init') self[key] = isFunction(instance[key]) ? instance[key].bind(self) : instance[key];
            });

            // init method will be called automatically
            if (instance.init) instance.init.bind(self)();
          });
          return this;
        });

        defineProperty(this, 'mount', function () {

          updateOpts();

          // add global mixin
          var globalMixin = riot.mixin(GLOBAL_MIXIN);
          if (globalMixin) self.mixin(globalMixin);

          // initialiation
          if (impl.fn) impl.fn.call(self, opts);

          // parse layout after init. fn may calculate args for nested custom tags
          parseExpressions(dom, self, expressions);

          // mount the child tags
          toggle(true);

          // update the root adding custom attributes coming from the compiler
          // it fixes also #1087
          if (impl.attrs) walkAttributes(impl.attrs, function (k, v) {
            setAttr(root, k, v);
          });
          if (impl.attrs || hasImpl) parseExpressions(self.root, self, expressions);

          if (!self.parent || isLoop) self.update(item);

          // internal use only, fixes #403
          self.trigger('before-mount');

          if (isLoop && !hasImpl) {
            // update the root attribute for the looped elements
            root = dom.firstChild;
          } else {
            while (dom.firstChild) {
              root.appendChild(dom.firstChild);
            }if (root.stub) root = parent.root;
          }

          defineProperty(self, 'root', root);

          // parse the named dom nodes in the looped child
          // adding them to the parent as well
          if (isLoop) parseNamedElements(self.root, self.parent, null, true);

          // if it's not a child tag we can trigger its mount event
          if (!self.parent || self.parent.isMounted) {
            self.isMounted = true;
            self.trigger('mount');
          }
          // otherwise we need to wait that the parent event gets triggered
          else self.parent.one('mount', function () {
              // avoid to trigger the `mount` event for the tags
              // not visible included in an if statement
              if (!isInStub(self.root)) {
                self.parent.isMounted = self.isMounted = true;
                self.trigger('mount');
              }
            });
        });

        defineProperty(this, 'unmount', function (keepRootTag) {
          var el = root,
              p = el.parentNode,
              ptag,
              tagIndex = __virtualDom.indexOf(self);

          self.trigger('before-unmount');

          // remove this tag instance from the global virtualDom variable
          if (~tagIndex) __virtualDom.splice(tagIndex, 1);

          if (this._virts) {
            each(this._virts, function (v) {
              if (v.parentNode) v.parentNode.removeChild(v);
            });
          }

          if (p) {

            if (parent) {
              ptag = getImmediateCustomParentTag(parent);
              // remove this tag from the parent tags object
              // if there are multiple nested tags with same name..
              // remove this element form the array
              if (isArray(ptag.tags[tagName])) each(ptag.tags[tagName], function (tag, i) {
                if (tag._riot_id == self._riot_id) ptag.tags[tagName].splice(i, 1);
              });else
                // otherwise just delete the tag instance
                ptag.tags[tagName] = undefined;
            } else while (el.firstChild) {
              el.removeChild(el.firstChild);
            }if (!keepRootTag) p.removeChild(el);else
              // the riot-tag attribute isn't needed anymore, remove it
              remAttr(p, 'riot-tag');
          }

          self.trigger('unmount');
          toggle();
          self.off('*');
          self.isMounted = false;
          delete root._tag;
        });

        // proxy function to bind updates
        // dispatched from a parent tag
        function onChildUpdate(data) {
          self.update(data, true);
        }

        function toggle(isMount) {

          // mount/unmount children
          each(childTags, function (child) {
            child[isMount ? 'mount' : 'unmount']();
          });

          // listen/unlisten parent (events flow one way from parent to children)
          if (!parent) return;
          var evt = isMount ? 'on' : 'off';

          // the loop tags will be always in sync with the parent automatically
          if (isLoop) parent[evt]('unmount', self.unmount);else {
            parent[evt]('update', onChildUpdate)[evt]('unmount', self.unmount);
          }
        }

        // named elements available for fn
        parseNamedElements(dom, this, childTags);
      }
      /**
       * Attach an event to a DOM node
       * @param { String } name - event name
       * @param { Function } handler - event callback
       * @param { Object } dom - dom node
       * @param { Tag } tag - tag instance
       */
      function setEventHandler(name, handler, dom, tag) {

        dom[name] = function (e) {

          var ptag = tag._parent,
              item = tag._item,
              el;

          if (!item) while (ptag && !item) {
            item = ptag._item;
            ptag = ptag._parent;
          }

          // cross browser event fix
          e = e || window.event;

          // override the event properties
          if (isWritable(e, 'currentTarget')) e.currentTarget = dom;
          if (isWritable(e, 'target')) e.target = e.srcElement;
          if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode;

          e.item = item;

          // prevent default behaviour (by default)
          if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
          }

          if (!e.preventUpdate) {
            el = item ? getImmediateCustomParentTag(ptag) : tag;
            el.update();
          }
        };
      }

      /**
       * Insert a DOM node replacing another one (used by if- attribute)
       * @param   { Object } root - parent node
       * @param   { Object } node - node replaced
       * @param   { Object } before - node added
       */
      function insertTo(root, node, before) {
        if (!root) return;
        root.insertBefore(before, node);
        root.removeChild(node);
      }

      /**
       * Update the expressions in a Tag instance
       * @param   { Array } expressions - expression that must be re evaluated
       * @param   { Tag } tag - tag instance
       */
      function update(expressions, tag) {

        each(expressions, function (expr, i) {

          var dom = expr.dom,
              attrName = expr.attr,
              value = tmpl(expr.expr, tag),
              parent = expr.dom.parentNode;

          if (expr.bool) {
            value = !!value;
            if (attrName === 'selected') dom.__selected = value; // #1374
          } else if (value == null) value = '';

          // #1638: regression of #1612, update the dom only if the value of the
          // expression was changed
          if (expr.value === value) {
            return;
          }
          expr.value = value;

          // textarea and text nodes has no attribute name
          if (!attrName) {
            // about #815 w/o replace: the browser converts the value to a string,
            // the comparison by "==" does too, but not in the server
            value += '';
            // test for parent avoids error with invalid assignment to nodeValue
            if (parent) {
              if (parent.tagName === 'TEXTAREA') {
                parent.value = value; // #1113
                if (!IE_VERSION) dom.nodeValue = value; // #1625 IE throws here, nodeValue
              } // will be available on 'updated'
              else dom.nodeValue = value;
            }
            return;
          }

          // ~~#1612: look for changes in dom.value when updating the value~~
          if (attrName === 'value') {
            dom.value = value;
            return;
          }

          // remove original attribute
          remAttr(dom, attrName);

          // event handler
          if (isFunction(value)) {
            setEventHandler(attrName, value, dom, tag);

            // if- conditional
          } else if (attrName == 'if') {
              var stub = expr.stub,
                  add = function add() {
                insertTo(stub.parentNode, stub, dom);
              },
                  remove = function remove() {
                insertTo(dom.parentNode, dom, stub);
              };

              // add to DOM
              if (value) {
                if (stub) {
                  add();
                  dom.inStub = false;
                  // avoid to trigger the mount event if the tags is not visible yet
                  // maybe we can optimize this avoiding to mount the tag at all
                  if (!isInStub(dom)) {
                    walk(dom, function (el) {
                      if (el._tag && !el._tag.isMounted) el._tag.isMounted = !!el._tag.trigger('mount');
                    });
                  }
                }
                // remove from DOM
              } else {
                  stub = expr.stub = stub || document.createTextNode('');
                  // if the parentNode is defined we can easily replace the tag
                  if (dom.parentNode) remove();
                  // otherwise we need to wait the updated event
                  else (tag.parent || tag).one('updated', remove);

                  dom.inStub = true;
                }
              // show / hide
            } else if (attrName === 'show') {
                dom.style.display = value ? '' : 'none';
              } else if (attrName === 'hide') {
                dom.style.display = value ? 'none' : '';
              } else if (expr.bool) {
                dom[attrName] = value;
                if (value) setAttr(dom, attrName, attrName);
              } else if (value === 0 || value && (typeof value === "undefined" ? "undefined" : _typeof(value)) !== T_OBJECT) {
                // <img src="{ expr }">
                if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
                  attrName = attrName.slice(RIOT_PREFIX.length);
                }
                setAttr(dom, attrName, value);
              }
        });
      }
      /**
       * Specialized function for looping an array-like collection with `each={}`
       * @param   { Array } els - collection of items
       * @param   {Function} fn - callback function
       * @returns { Array } the array looped
       */
      function each(els, fn) {
        var len = els ? els.length : 0;

        for (var i = 0, el; i < len; i++) {
          el = els[i];
          // return false -> current item was removed by fn during the loop
          if (el != null && fn(el, i) === false) i--;
        }
        return els;
      }

      /**
       * Detect if the argument passed is a function
       * @param   { * } v - whatever you want to pass to this function
       * @returns { Boolean } -
       */
      function isFunction(v) {
        return (typeof v === "undefined" ? "undefined" : _typeof(v)) === T_FUNCTION || false; // avoid IE problems
      }

      /**
       * Detect if the argument passed is an object, exclude null.
       * NOTE: Use isObject(x) && !isArray(x) to excludes arrays.
       * @param   { * } v - whatever you want to pass to this function
       * @returns { Boolean } -
       */
      function isObject(v) {
        return v && (typeof v === "undefined" ? "undefined" : _typeof(v)) === T_OBJECT; // typeof null is 'object'
      }

      /**
       * Remove any DOM attribute from a node
       * @param   { Object } dom - DOM node we want to update
       * @param   { String } name - name of the property we want to remove
       */
      function remAttr(dom, name) {
        dom.removeAttribute(name);
      }

      /**
       * Convert a string containing dashes to camel case
       * @param   { String } string - input string
       * @returns { String } my-string -> myString
       */
      function toCamel(string) {
        return string.replace(/-(\w)/g, function (_, c) {
          return c.toUpperCase();
        });
      }

      /**
       * Get the value of any DOM attribute on a node
       * @param   { Object } dom - DOM node we want to parse
       * @param   { String } name - name of the attribute we want to get
       * @returns { String | undefined } name of the node attribute whether it exists
       */
      function getAttr(dom, name) {
        return dom.getAttribute(name);
      }

      /**
       * Set any DOM attribute
       * @param { Object } dom - DOM node we want to update
       * @param { String } name - name of the property we want to set
       * @param { String } val - value of the property we want to set
       */
      function setAttr(dom, name, val) {
        dom.setAttribute(name, val);
      }

      /**
       * Detect the tag implementation by a DOM node
       * @param   { Object } dom - DOM node we need to parse to get its tag implementation
       * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
       */
      function getTag(dom) {
        return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG_IS) || getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()];
      }
      /**
       * Add a child tag to its parent into the `tags` object
       * @param   { Object } tag - child tag instance
       * @param   { String } tagName - key where the new tag will be stored
       * @param   { Object } parent - tag instance where the new child tag will be included
       */
      function addChildTag(tag, tagName, parent) {
        var cachedTag = parent.tags[tagName];

        // if there are multiple children tags having the same name
        if (cachedTag) {
          // if the parent tags property is not yet an array
          // create it adding the first cached tag
          if (!isArray(cachedTag))
            // don't add the same tag twice
            if (cachedTag !== tag) parent.tags[tagName] = [cachedTag];
          // add the new nested tag to the array
          if (!contains(parent.tags[tagName], tag)) parent.tags[tagName].push(tag);
        } else {
          parent.tags[tagName] = tag;
        }
      }

      /**
       * Move the position of a custom tag in its parent tag
       * @param   { Object } tag - child tag instance
       * @param   { String } tagName - key where the tag was stored
       * @param   { Number } newPos - index where the new tag will be stored
       */
      function moveChildTag(tag, tagName, newPos) {
        var parent = tag.parent,
            tags;
        // no parent no move
        if (!parent) return;

        tags = parent.tags[tagName];

        if (isArray(tags)) tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0]);else addChildTag(tag, tagName, parent);
      }

      /**
       * Create a new child tag including it correctly into its parent
       * @param   { Object } child - child tag implementation
       * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
       * @param   { String } innerHTML - inner html of the child node
       * @param   { Object } parent - instance of the parent tag including the child custom tag
       * @returns { Object } instance of the new child tag just created
       */
      function initChildTag(child, opts, innerHTML, parent) {
        var tag = new Tag(child, opts, innerHTML),
            tagName = getTagName(opts.root),
            ptag = getImmediateCustomParentTag(parent);
        // fix for the parent attribute in the looped elements
        tag.parent = ptag;
        // store the real parent tag
        // in some cases this could be different from the custom parent tag
        // for example in nested loops
        tag._parent = parent;

        // add this tag to the custom parent tag
        addChildTag(tag, tagName, ptag);
        // and also to the real parent tag
        if (ptag !== parent) addChildTag(tag, tagName, parent);
        // empty the child node once we got its template
        // to avoid that its children get compiled multiple times
        opts.root.innerHTML = '';

        return tag;
      }

      /**
       * Loop backward all the parents tree to detect the first custom parent tag
       * @param   { Object } tag - a Tag instance
       * @returns { Object } the instance of the first custom parent tag found
       */
      function getImmediateCustomParentTag(tag) {
        var ptag = tag;
        while (!getTag(ptag.root)) {
          if (!ptag.parent) break;
          ptag = ptag.parent;
        }
        return ptag;
      }

      /**
       * Helper function to set an immutable property
       * @param   { Object } el - object where the new property will be set
       * @param   { String } key - object key where the new property will be stored
       * @param   { * } value - value of the new property
      * @param   { Object } options - set the propery overriding the default options
       * @returns { Object } - the initial object
       */
      function defineProperty(el, key, value, options) {
        Object.defineProperty(el, key, extend({
          value: value,
          enumerable: false,
          writable: false,
          configurable: false
        }, options));
        return el;
      }

      /**
       * Get the tag name of any DOM node
       * @param   { Object } dom - DOM node we want to parse
       * @returns { String } name to identify this dom node in riot
       */
      function getTagName(dom) {
        var child = getTag(dom),
            namedTag = getAttr(dom, 'name'),
            tagName = namedTag && !tmpl.hasExpr(namedTag) ? namedTag : child ? child.name : dom.tagName.toLowerCase();

        return tagName;
      }

      /**
       * Extend any object with other properties
       * @param   { Object } src - source object
       * @returns { Object } the resulting extended object
       *
       * var obj = { foo: 'baz' }
       * extend(obj, {bar: 'bar', foo: 'bar'})
       * console.log(obj) => {bar: 'bar', foo: 'bar'}
       *
       */
      function extend(src) {
        var obj,
            args = arguments;
        for (var i = 1; i < args.length; ++i) {
          if (obj = args[i]) {
            for (var key in obj) {
              // check if this property of the source object could be overridden
              if (isWritable(src, key)) src[key] = obj[key];
            }
          }
        }
        return src;
      }

      /**
       * Check whether an array contains an item
       * @param   { Array } arr - target array
       * @param   { * } item - item to test
       * @returns { Boolean } Does 'arr' contain 'item'?
       */
      function contains(arr, item) {
        return ~arr.indexOf(item);
      }

      /**
       * Check whether an object is a kind of array
       * @param   { * } a - anything
       * @returns {Boolean} is 'a' an array?
       */
      function isArray(a) {
        return Array.isArray(a) || a instanceof Array;
      }

      /**
       * Detect whether a property of an object could be overridden
       * @param   { Object }  obj - source object
       * @param   { String }  key - object property
       * @returns { Boolean } is this property writable?
       */
      function isWritable(obj, key) {
        var props = Object.getOwnPropertyDescriptor(obj, key);
        return _typeof(obj[key]) === T_UNDEF || props && props.writable;
      }

      /**
       * With this function we avoid that the internal Tag methods get overridden
       * @param   { Object } data - options we want to use to extend the tag instance
       * @returns { Object } clean object without containing the riot internal reserved words
       */
      function cleanUpData(data) {
        if (!(data instanceof Tag) && !(data && _typeof(data.trigger) == T_FUNCTION)) return data;

        var o = {};
        for (var key in data) {
          if (!contains(RESERVED_WORDS_BLACKLIST, key)) o[key] = data[key];
        }
        return o;
      }

      /**
       * Walk down recursively all the children tags starting dom node
       * @param   { Object }   dom - starting node where we will start the recursion
       * @param   { Function } fn - callback to transform the child node just found
       */
      function walk(dom, fn) {
        if (dom) {
          // stop the recursion
          if (fn(dom) === false) return;else {
            dom = dom.firstChild;

            while (dom) {
              walk(dom, fn);
              dom = dom.nextSibling;
            }
          }
        }
      }

      /**
       * Minimize risk: only zero or one _space_ between attr & value
       * @param   { String }   html - html string we want to parse
       * @param   { Function } fn - callback function to apply on any attribute found
       */
      function walkAttributes(html, fn) {
        var m,
            re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;

        while (m = re.exec(html)) {
          fn(m[1].toLowerCase(), m[2] || m[3] || m[4]);
        }
      }

      /**
       * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
       * @param   { Object }  dom - DOM node we want to parse
       * @returns { Boolean } -
       */
      function isInStub(dom) {
        while (dom) {
          if (dom.inStub) return true;
          dom = dom.parentNode;
        }
        return false;
      }

      /**
       * Create a generic DOM node
       * @param   { String } name - name of the DOM node we want to create
       * @returns { Object } DOM node just created
       */
      function mkEl(name) {
        return document.createElement(name);
      }

      /**
       * Shorter and fast way to select multiple nodes in the DOM
       * @param   { String } selector - DOM selector
       * @param   { Object } ctx - DOM node where the targets of our search will is located
       * @returns { Object } dom nodes found
       */
      function $$(selector, ctx) {
        return (ctx || document).querySelectorAll(selector);
      }

      /**
       * Shorter and fast way to select a single node in the DOM
       * @param   { String } selector - unique dom selector
       * @param   { Object } ctx - DOM node where the target of our search will is located
       * @returns { Object } dom node found
       */
      function $(selector, ctx) {
        return (ctx || document).querySelector(selector);
      }

      /**
       * Simple object prototypal inheritance
       * @param   { Object } parent - parent object
       * @returns { Object } child instance
       */
      function inherit(parent) {
        function Child() {}
        Child.prototype = parent;
        return new Child();
      }

      /**
       * Get the name property needed to identify a DOM node in riot
       * @param   { Object } dom - DOM node we need to parse
       * @returns { String | undefined } give us back a string to identify this dom node
       */
      function getNamedKey(dom) {
        return getAttr(dom, 'id') || getAttr(dom, 'name');
      }

      /**
       * Set the named properties of a tag element
       * @param { Object } dom - DOM node we need to parse
       * @param { Object } parent - tag instance where the named dom element will be eventually added
       * @param { Array } keys - list of all the tag instance properties
       */
      function setNamed(dom, parent, keys) {
        // get the key value we want to add to the tag instance
        var key = getNamedKey(dom),
            isArr,

        // add the node detected to a tag instance using the named property
        add = function add(value) {
          // avoid to override the tag properties already set
          if (contains(keys, key)) return;
          // check whether this value is an array
          isArr = isArray(value);
          // if the key was never set
          if (!value)
            // set it once on the tag instance
            parent[key] = dom;
            // if it was an array and not yet set
          else if (!isArr || isArr && !contains(value, dom)) {
              // add the dom node into the array
              if (isArr) value.push(dom);else parent[key] = [value, dom];
            }
        };

        // skip the elements with no named properties
        if (!key) return;

        // check whether this key has been already evaluated
        if (tmpl.hasExpr(key))
          // wait the first updated event only once
          parent.one('mount', function () {
            key = getNamedKey(dom);
            add(parent[key]);
          });else add(parent[key]);
      }

      /**
       * Faster String startsWith alternative
       * @param   { String } src - source string
       * @param   { String } str - test string
       * @returns { Boolean } -
       */
      function startsWith(src, str) {
        return src.slice(0, str.length) === str;
      }

      /**
       * requestAnimationFrame function
       * Adapted from https://gist.github.com/paulirish/1579671, license MIT
       */
      var rAF = function (w) {
        var raf = w.requestAnimationFrame || w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame;

        if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {
          // buggy iOS6
          var lastTime = 0;

          raf = function raf(cb) {
            var nowtime = Date.now(),
                timeout = Math.max(16 - (nowtime - lastTime), 0);
            setTimeout(function () {
              cb(lastTime = nowtime + timeout);
            }, timeout);
          };
        }
        return raf;
      }(window || {});

      /**
       * Mount a tag creating new Tag instance
       * @param   { Object } root - dom node where the tag will be mounted
       * @param   { String } tagName - name of the riot tag we want to mount
       * @param   { Object } opts - options to pass to the Tag instance
       * @returns { Tag } a new Tag instance
       */
      function mountTo(root, tagName, opts) {
        var tag = __tagImpl[tagName],

        // cache the inner HTML to fix #855
        innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;

        // clear the inner html
        root.innerHTML = '';

        if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML);

        if (tag && tag.mount) {
          tag.mount();
          // add this tag to the virtualDom variable
          if (!contains(__virtualDom, tag)) __virtualDom.push(tag);
        }

        return tag;
      }
      /**
       * Riot public api
       */

      // share methods for other riot parts, e.g. compiler
      riot.util = { brackets: brackets, tmpl: tmpl };

      /**
       * Create a mixin that could be globally shared across all the tags
       */
      riot.mixin = function () {
        var mixins = {};

        /**
         * Create/Return a mixin by its name
         * @param   { String } name - mixin name (global mixin if missing)
         * @param   { Object } mixin - mixin logic
         * @returns { Object } the mixin logic
         */
        return function (name, mixin) {
          if (isObject(name)) {
            mixin = name;
            mixins[GLOBAL_MIXIN] = extend(mixins[GLOBAL_MIXIN] || {}, mixin);
            return;
          }

          if (!mixin) return mixins[name];
          mixins[name] = mixin;
        };
      }();

      /**
       * Create a new riot tag implementation
       * @param   { String }   name - name/id of the new riot tag
       * @param   { String }   html - tag template
       * @param   { String }   css - custom tag css
       * @param   { String }   attrs - root tag attributes
       * @param   { Function } fn - user function
       * @returns { String } name/id of the tag just created
       */
      riot.tag = function (name, html, css, attrs, fn) {
        if (isFunction(attrs)) {
          fn = attrs;
          if (/^[\w\-]+\s?=/.test(css)) {
            attrs = css;
            css = '';
          } else attrs = '';
        }
        if (css) {
          if (isFunction(css)) fn = css;else styleManager.add(css);
        }
        name = name.toLowerCase();
        __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn };
        return name;
      };

      /**
       * Create a new riot tag implementation (for use by the compiler)
       * @param   { String }   name - name/id of the new riot tag
       * @param   { String }   html - tag template
       * @param   { String }   css - custom tag css
       * @param   { String }   attrs - root tag attributes
       * @param   { Function } fn - user function
       * @returns { String } name/id of the tag just created
       */
      riot.tag2 = function (name, html, css, attrs, fn) {
        if (css) styleManager.add(css);
        //if (bpair) riot.settings.brackets = bpair
        __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn };
        return name;
      };

      /**
       * Mount a tag using a specific tag implementation
       * @param   { String } selector - tag DOM selector
       * @param   { String } tagName - tag implementation name
       * @param   { Object } opts - tag logic
       * @returns { Array } new tags instances
       */
      riot.mount = function (selector, tagName, opts) {

        var els,
            allTags,
            tags = [];

        // helper functions

        function addRiotTags(arr) {
          var list = '';
          each(arr, function (e) {
            if (!/[^-\w]/.test(e)) {
              e = e.trim().toLowerCase();
              list += ',[' + RIOT_TAG_IS + '="' + e + '"],[' + RIOT_TAG + '="' + e + '"]';
            }
          });
          return list;
        }

        function selectAllTags() {
          var keys = Object.keys(__tagImpl);
          return keys + addRiotTags(keys);
        }

        function pushTags(root) {
          if (root.tagName) {
            var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG);

            // have tagName? force riot-tag to be the same
            if (tagName && riotTag !== tagName) {
              riotTag = tagName;
              setAttr(root, RIOT_TAG_IS, tagName);
            }
            var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);

            if (tag) tags.push(tag);
          } else if (root.length) {
            each(root, pushTags); // assume nodeList
          }
        }

        // ----- mount code -----

        // inject styles into DOM
        styleManager.inject();

        if (isObject(tagName)) {
          opts = tagName;
          tagName = 0;
        }

        // crawl the DOM to find the tag
        if ((typeof selector === "undefined" ? "undefined" : _typeof(selector)) === T_STRING) {
          if (selector === '*')
            // select all the tags registered
            // and also the tags found with the riot-tag attribute set
            selector = allTags = selectAllTags();else
            // or just the ones named like the selector
            selector += addRiotTags(selector.split(/, */));

          // make sure to pass always a selector
          // to the querySelectorAll function
          els = selector ? $$(selector) : [];
        } else
          // probably you have passed already a tag or a NodeList
          els = selector;

        // select all the registered and mount them inside their root elements
        if (tagName === '*') {
          // get all custom tags
          tagName = allTags || selectAllTags();
          // if the root els it's just a single tag
          if (els.tagName) els = $$(tagName, els);else {
            // select all the children for all the different root elements
            var nodeList = [];
            each(els, function (_el) {
              nodeList.push($$(tagName, _el));
            });
            els = nodeList;
          }
          // get rid of the tagName
          tagName = 0;
        }

        pushTags(els);

        return tags;
      };

      /**
       * Update all the tags instances created
       * @returns { Array } all the tags instances
       */
      riot.update = function () {
        return each(__virtualDom, function (tag) {
          tag.update();
        });
      };

      /**
       * Export the Tag constructor
       */
      riot.Tag = Tag;
      // support CommonJS, AMD & browser
      /* istanbul ignore next */
      if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === T_OBJECT) module.exports = riot;else if ((typeof define === "undefined" ? "undefined" : _typeof(define)) === T_FUNCTION && _typeof(define.amd) !== T_UNDEF) define(function () {
        return riot;
      });else window.riot = riot;
    })(typeof window != 'undefined' ? window : void 0);
  }, {}], 3: [function (require, module, exports) {
    var riot = require('riot');
    module.exports = riot.tag2('sync', '<yield></yield>', '', '', function (opts) {});
  }, { "riot": 2 }] }, {}, [1]);
//# sourceMappingURL=data:application/json;base64,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RTlCLENBQUssR0FBTCxHQUFXLEdBQVg7OztBQTM5RThCLFVBODlFeEIsUUFBTyx5REFBUCxLQUFtQixRQUFuQixFQUNGLE9BQU8sT0FBUCxHQUFpQixJQUFqQixDQURGLEtBRUssSUFBSSxRQUFPLHVEQUFQLEtBQWtCLFVBQWxCLElBQWdDLFFBQU8sT0FBTyxHQUFQLENBQVAsS0FBc0IsT0FBdEIsRUFDdkMsT0FBTyxZQUFXO0FBQUUsZUFBTyxJQUFQLENBQUY7T0FBWCxDQUFQLENBREcsS0FHSCxPQUFPLElBQVAsR0FBYyxJQUFkLENBSEc7S0FoK0VMLENBQUQsQ0FxK0VFLE9BQU8sTUFBUCxJQUFpQixXQUFqQixHQUErQixNQUEvQixHQUF3QyxLQUFLLENBQUwsQ0FyK0UxQyxDQUhvRTtHQUFoQyxFQTArRW5DLEVBMStFa0MsQ0FBRixFQTArRTVCLEdBQUUsQ0FBQyxVQUFTLE9BQVQsRUFBaUIsTUFBakIsRUFBd0IsT0FBeEIsRUFBZ0M7QUFDekMsUUFBSSxPQUFPLFFBQVEsTUFBUixDQUFQLENBRHFDO0FBRXpDLFdBQU8sT0FBUCxHQUFpQixLQUFLLElBQUwsQ0FBVSxNQUFWLEVBQWtCLGlCQUFsQixFQUFxQyxFQUFyQyxFQUF5QyxFQUF6QyxFQUE2QyxVQUFTLElBQVQsRUFBZSxFQUFmLENBQTlELENBRnlDO0dBQWhDLEVBS1AsRUFBQyxRQUFPLENBQVAsRUFMSyxDQUFGLEVBai9FTixFQXMvRWUsRUF0L0VmLEVBcy9Fa0IsQ0FBQyxDQUFELENBdC9FbEIiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuY29uc3QgcmlvdCA9IHJlcXVpcmUoJ3Jpb3QnKTtcblxuY29uc3Qgc3luYyA9IHJlcXVpcmUoJy4vdGFncy9zeW5jLnRhZycpO1xuXG5yaW90Lm1vdW50KCcqJyk7XG5cbn0se1wiLi90YWdzL3N5bmMudGFnXCI6MyxcInJpb3RcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKiBSaW90IHYyLjMuMTcsIEBsaWNlbnNlIE1JVCAqL1xuXG47KGZ1bmN0aW9uKHdpbmRvdywgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcbnZhciByaW90ID0geyB2ZXJzaW9uOiAndjIuMy4xNycsIHNldHRpbmdzOiB7fSB9LFxuICAvLyBiZSBhd2FyZSwgaW50ZXJuYWwgdXNhZ2VcbiAgLy8gQVRURU5USU9OOiBwcmVmaXggdGhlIGdsb2JhbCBkeW5hbWljIHZhcmlhYmxlcyB3aXRoIGBfX2BcblxuICAvLyBjb3VudGVyIHRvIGdpdmUgYSB1bmlxdWUgaWQgdG8gYWxsIHRoZSBUYWcgaW5zdGFuY2VzXG4gIF9fdWlkID0gMCxcbiAgLy8gdGFncyBpbnN0YW5jZXMgY2FjaGVcbiAgX192aXJ0dWFsRG9tID0gW10sXG4gIC8vIHRhZ3MgaW1wbGVtZW50YXRpb24gY2FjaGVcbiAgX190YWdJbXBsID0ge30sXG5cbiAgLyoqXG4gICAqIENvbnN0XG4gICAqL1xuICBHTE9CQUxfTUlYSU4gPSAnX19nbG9iYWxfbWl4aW4nLFxuXG4gIC8vIHJpb3Qgc3BlY2lmaWMgcHJlZml4ZXNcbiAgUklPVF9QUkVGSVggPSAncmlvdC0nLFxuICBSSU9UX1RBRyA9IFJJT1RfUFJFRklYICsgJ3RhZycsXG4gIFJJT1RfVEFHX0lTID0gJ2RhdGEtaXMnLFxuXG4gIC8vIGZvciB0eXBlb2YgPT0gJycgY29tcGFyaXNvbnNcbiAgVF9TVFJJTkcgPSAnc3RyaW5nJyxcbiAgVF9PQkpFQ1QgPSAnb2JqZWN0JyxcbiAgVF9VTkRFRiAgPSAndW5kZWZpbmVkJyxcbiAgVF9CT09MICAgPSAnYm9vbGVhbicsXG4gIFRfRlVOQ1RJT04gPSAnZnVuY3Rpb24nLFxuICAvLyBzcGVjaWFsIG5hdGl2ZSB0YWdzIHRoYXQgY2Fubm90IGJlIHRyZWF0ZWQgbGlrZSB0aGUgb3RoZXJzXG4gIFNQRUNJQUxfVEFHU19SRUdFWCA9IC9eKD86dCg/OmJvZHl8aGVhZHxmb290fFtyaGRdKXxjYXB0aW9ufGNvbCg/Omdyb3VwKT98b3B0KD86aW9ufGdyb3VwKSkkLyxcbiAgUkVTRVJWRURfV09SRFNfQkxBQ0tMSVNUID0gWydfaXRlbScsICdfaWQnLCAnX3BhcmVudCcsICd1cGRhdGUnLCAncm9vdCcsICdtb3VudCcsICd1bm1vdW50JywgJ21peGluJywgJ2lzTW91bnRlZCcsICdpc0xvb3AnLCAndGFncycsICdwYXJlbnQnLCAnb3B0cycsICd0cmlnZ2VyJywgJ29uJywgJ29mZicsICdvbmUnXSxcblxuICAvLyB2ZXJzaW9uIyBmb3IgSUUgOC0xMSwgMCBmb3Igb3RoZXJzXG4gIElFX1ZFUlNJT04gPSAod2luZG93ICYmIHdpbmRvdy5kb2N1bWVudCB8fCB7fSkuZG9jdW1lbnRNb2RlIHwgMFxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnJpb3Qub2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKGVsKSB7XG5cbiAgLyoqXG4gICAqIEV4dGVuZCB0aGUgb3JpZ2luYWwgb2JqZWN0IG9yIGNyZWF0ZSBhIG5ldyBlbXB0eSBvbmVcbiAgICogQHR5cGUgeyBPYmplY3QgfVxuICAgKi9cblxuICBlbCA9IGVsIHx8IHt9XG5cbiAgLyoqXG4gICAqIFByaXZhdGUgdmFyaWFibGVzIGFuZCBtZXRob2RzXG4gICAqL1xuICB2YXIgY2FsbGJhY2tzID0ge30sXG4gICAgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgb25FYWNoRXZlbnQgPSBmdW5jdGlvbihlLCBmbikgeyBlLnJlcGxhY2UoL1xcUysvZywgZm4pIH1cblxuICAvLyBleHRlbmQgdGhlIG9iamVjdCBhZGRpbmcgdGhlIG9ic2VydmFibGUgbWV0aG9kc1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlbCwge1xuICAgIC8qKlxuICAgICAqIExpc3RlbiB0byB0aGUgZ2l2ZW4gc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgYGV2ZW50c2AgYW5kIGV4ZWN1dGUgdGhlIGBjYWxsYmFja2AgZWFjaCB0aW1lIGFuIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICAgKiBAcGFyYW0gIHsgU3RyaW5nIH0gZXZlbnRzIC0gZXZlbnRzIGlkc1xuICAgICAqIEBwYXJhbSAgeyBGdW5jdGlvbiB9IGZuIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7IE9iamVjdCB9IGVsXG4gICAgICovXG4gICAgb246IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbihldmVudHMsIGZuKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZm4gIT0gJ2Z1bmN0aW9uJykgIHJldHVybiBlbFxuXG4gICAgICAgIG9uRWFjaEV2ZW50KGV2ZW50cywgZnVuY3Rpb24obmFtZSwgcG9zKSB7XG4gICAgICAgICAgKGNhbGxiYWNrc1tuYW1lXSA9IGNhbGxiYWNrc1tuYW1lXSB8fCBbXSkucHVzaChmbilcbiAgICAgICAgICBmbi50eXBlZCA9IHBvcyA+IDBcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZWxcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgYGV2ZW50c2AgbGlzdGVuZXJzXG4gICAgICogQHBhcmFtICAgeyBTdHJpbmcgfSBldmVudHMgLSBldmVudHMgaWRzXG4gICAgICogQHBhcmFtICAgeyBGdW5jdGlvbiB9IGZuIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7IE9iamVjdCB9IGVsXG4gICAgICovXG4gICAgb2ZmOiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24oZXZlbnRzLCBmbikge1xuICAgICAgICBpZiAoZXZlbnRzID09ICcqJyAmJiAhZm4pIGNhbGxiYWNrcyA9IHt9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG9uRWFjaEV2ZW50KGV2ZW50cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgIHZhciBhcnIgPSBjYWxsYmFja3NbbmFtZV1cbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGNiOyBjYiA9IGFyciAmJiBhcnJbaV07ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChjYiA9PSBmbikgYXJyLnNwbGljZShpLS0sIDEpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBkZWxldGUgY2FsbGJhY2tzW25hbWVdXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTGlzdGVuIHRvIHRoZSBnaXZlbiBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBgZXZlbnRzYCBhbmQgZXhlY3V0ZSB0aGUgYGNhbGxiYWNrYCBhdCBtb3N0IG9uY2VcbiAgICAgKiBAcGFyYW0gICB7IFN0cmluZyB9IGV2ZW50cyAtIGV2ZW50cyBpZHNcbiAgICAgKiBAcGFyYW0gICB7IEZ1bmN0aW9uIH0gZm4gLSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZWxcbiAgICAgKi9cbiAgICBvbmU6IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbihldmVudHMsIGZuKSB7XG4gICAgICAgIGZ1bmN0aW9uIG9uKCkge1xuICAgICAgICAgIGVsLm9mZihldmVudHMsIG9uKVxuICAgICAgICAgIGZuLmFwcGx5KGVsLCBhcmd1bWVudHMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsLm9uKGV2ZW50cywgb24pXG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYWxsIGNhbGxiYWNrIGZ1bmN0aW9ucyB0aGF0IGxpc3RlbiB0byB0aGUgZ2l2ZW4gc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgYGV2ZW50c2BcbiAgICAgKiBAcGFyYW0gICB7IFN0cmluZyB9IGV2ZW50cyAtIGV2ZW50cyBpZHNcbiAgICAgKiBAcmV0dXJucyB7IE9iamVjdCB9IGVsXG4gICAgICovXG4gICAgdHJpZ2dlcjoge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uKGV2ZW50cykge1xuXG4gICAgICAgIC8vIGdldHRpbmcgdGhlIGFyZ3VtZW50c1xuICAgICAgICB2YXIgYXJnbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDEsXG4gICAgICAgICAgYXJncyA9IG5ldyBBcnJheShhcmdsZW4pLFxuICAgICAgICAgIGZuc1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJnbGVuOyBpKyspIHtcbiAgICAgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXSAvLyBza2lwIGZpcnN0IGFyZ3VtZW50XG4gICAgICAgIH1cblxuICAgICAgICBvbkVhY2hFdmVudChldmVudHMsIGZ1bmN0aW9uKG5hbWUpIHtcblxuICAgICAgICAgIGZucyA9IHNsaWNlLmNhbGwoY2FsbGJhY2tzW25hbWVdIHx8IFtdLCAwKVxuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGZuOyBmbiA9IGZuc1tpXTsgKytpKSB7XG4gICAgICAgICAgICBpZiAoZm4uYnVzeSkgcmV0dXJuXG4gICAgICAgICAgICBmbi5idXN5ID0gMVxuICAgICAgICAgICAgZm4uYXBwbHkoZWwsIGZuLnR5cGVkID8gW25hbWVdLmNvbmNhdChhcmdzKSA6IGFyZ3MpXG4gICAgICAgICAgICBpZiAoZm5zW2ldICE9PSBmbikgeyBpLS0gfVxuICAgICAgICAgICAgZm4uYnVzeSA9IDBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2FsbGJhY2tzWycqJ10gJiYgbmFtZSAhPSAnKicpXG4gICAgICAgICAgICBlbC50cmlnZ2VyLmFwcGx5KGVsLCBbJyonLCBuYW1lXS5jb25jYXQoYXJncykpXG5cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gZWxcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGVsXG5cbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG47KGZ1bmN0aW9uKHJpb3QpIHtcblxuLyoqXG4gKiBTaW1wbGUgY2xpZW50LXNpZGUgcm91dGVyXG4gKiBAbW9kdWxlIHJpb3Qtcm91dGVcbiAqL1xuXG5cbnZhciBSRV9PUklHSU4gPSAvXi4rP1xcLytbXlxcL10rLyxcbiAgRVZFTlRfTElTVEVORVIgPSAnRXZlbnRMaXN0ZW5lcicsXG4gIFJFTU9WRV9FVkVOVF9MSVNURU5FUiA9ICdyZW1vdmUnICsgRVZFTlRfTElTVEVORVIsXG4gIEFERF9FVkVOVF9MSVNURU5FUiA9ICdhZGQnICsgRVZFTlRfTElTVEVORVIsXG4gIEhBU19BVFRSSUJVVEUgPSAnaGFzQXR0cmlidXRlJyxcbiAgUkVQTEFDRSA9ICdyZXBsYWNlJyxcbiAgUE9QU1RBVEUgPSAncG9wc3RhdGUnLFxuICBIQVNIQ0hBTkdFID0gJ2hhc2hjaGFuZ2UnLFxuICBUUklHR0VSID0gJ3RyaWdnZXInLFxuICBNQVhfRU1JVF9TVEFDS19MRVZFTCA9IDMsXG4gIHdpbiA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LFxuICBkb2MgPSB0eXBlb2YgZG9jdW1lbnQgIT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQsXG4gIGhpc3QgPSB3aW4gJiYgaGlzdG9yeSxcbiAgbG9jID0gd2luICYmIChoaXN0LmxvY2F0aW9uIHx8IHdpbi5sb2NhdGlvbiksIC8vIHNlZSBodG1sNS1oaXN0b3J5LWFwaVxuICBwcm90ID0gUm91dGVyLnByb3RvdHlwZSwgLy8gdG8gbWluaWZ5IG1vcmVcbiAgY2xpY2tFdmVudCA9IGRvYyAmJiBkb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcbiAgc3RhcnRlZCA9IGZhbHNlLFxuICBjZW50cmFsID0gcmlvdC5vYnNlcnZhYmxlKCksXG4gIHJvdXRlRm91bmQgPSBmYWxzZSxcbiAgZGVib3VuY2VkRW1pdCxcbiAgYmFzZSwgY3VycmVudCwgcGFyc2VyLCBzZWNvbmRQYXJzZXIsIGVtaXRTdGFjayA9IFtdLCBlbWl0U3RhY2tMZXZlbCA9IDBcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlci4gWW91IGNhbiByZXBsYWNlIGl0IHZpYSByb3V0ZXIucGFyc2VyIG1ldGhvZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gY3VycmVudCBwYXRoIChub3JtYWxpemVkKVxuICogQHJldHVybnMge2FycmF5fSBhcnJheVxuICovXG5mdW5jdGlvbiBERUZBVUxUX1BBUlNFUihwYXRoKSB7XG4gIHJldHVybiBwYXRoLnNwbGl0KC9bLz8jXS8pXG59XG5cbi8qKlxuICogRGVmYXVsdCBwYXJzZXIgKHNlY29uZCkuIFlvdSBjYW4gcmVwbGFjZSBpdCB2aWEgcm91dGVyLnBhcnNlciBtZXRob2QuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIGN1cnJlbnQgcGF0aCAobm9ybWFsaXplZClcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWx0ZXIgLSBmaWx0ZXIgc3RyaW5nIChub3JtYWxpemVkKVxuICogQHJldHVybnMge2FycmF5fSBhcnJheVxuICovXG5mdW5jdGlvbiBERUZBVUxUX1NFQ09ORF9QQVJTRVIocGF0aCwgZmlsdGVyKSB7XG4gIHZhciByZSA9IG5ldyBSZWdFeHAoJ14nICsgZmlsdGVyW1JFUExBQ0VdKC9cXCovZywgJyhbXi8/I10rPyknKVtSRVBMQUNFXSgvXFwuXFwuLywgJy4qJykgKyAnJCcpLFxuICAgIGFyZ3MgPSBwYXRoLm1hdGNoKHJlKVxuXG4gIGlmIChhcmdzKSByZXR1cm4gYXJncy5zbGljZSgxKVxufVxuXG4vKipcbiAqIFNpbXBsZS9jaGVhcCBkZWJvdW5jZSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtICAge2Z1bmN0aW9ufSBmbiAtIGNhbGxiYWNrXG4gKiBAcGFyYW0gICB7bnVtYmVyfSBkZWxheSAtIGRlbGF5IGluIHNlY29uZHNcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn0gZGVib3VuY2VkIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZuLCBkZWxheSkge1xuICB2YXIgdFxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0KVxuICAgIHQgPSBzZXRUaW1lb3V0KGZuLCBkZWxheSlcbiAgfVxufVxuXG4vKipcbiAqIFNldCB0aGUgd2luZG93IGxpc3RlbmVycyB0byB0cmlnZ2VyIHRoZSByb3V0ZXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b0V4ZWMgLSBzZWUgcm91dGUuc3RhcnRcbiAqL1xuZnVuY3Rpb24gc3RhcnQoYXV0b0V4ZWMpIHtcbiAgZGVib3VuY2VkRW1pdCA9IGRlYm91bmNlKGVtaXQsIDEpXG4gIHdpbltBRERfRVZFTlRfTElTVEVORVJdKFBPUFNUQVRFLCBkZWJvdW5jZWRFbWl0KVxuICB3aW5bQUREX0VWRU5UX0xJU1RFTkVSXShIQVNIQ0hBTkdFLCBkZWJvdW5jZWRFbWl0KVxuICBkb2NbQUREX0VWRU5UX0xJU1RFTkVSXShjbGlja0V2ZW50LCBjbGljaylcbiAgaWYgKGF1dG9FeGVjKSBlbWl0KHRydWUpXG59XG5cbi8qKlxuICogUm91dGVyIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIFJvdXRlcigpIHtcbiAgdGhpcy4kID0gW11cbiAgcmlvdC5vYnNlcnZhYmxlKHRoaXMpIC8vIG1ha2UgaXQgb2JzZXJ2YWJsZVxuICBjZW50cmFsLm9uKCdzdG9wJywgdGhpcy5zLmJpbmQodGhpcykpXG4gIGNlbnRyYWwub24oJ2VtaXQnLCB0aGlzLmUuYmluZCh0aGlzKSlcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGhbUkVQTEFDRV0oL15cXC98XFwvJC8sICcnKVxufVxuXG5mdW5jdGlvbiBpc1N0cmluZyhzdHIpIHtcbiAgcmV0dXJuIHR5cGVvZiBzdHIgPT0gJ3N0cmluZydcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHBhcnQgYWZ0ZXIgZG9tYWluIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmIC0gZnVsbHBhdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGggZnJvbSByb290XG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhGcm9tUm9vdChocmVmKSB7XG4gIHJldHVybiAoaHJlZiB8fCBsb2MuaHJlZiB8fCAnJylbUkVQTEFDRV0oUkVfT1JJR0lOLCAnJylcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHBhcnQgYWZ0ZXIgYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWYgLSBmdWxscGF0aFxuICogQHJldHVybnMge3N0cmluZ30gcGF0aCBmcm9tIGJhc2VcbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aEZyb21CYXNlKGhyZWYpIHtcbiAgcmV0dXJuIGJhc2VbMF0gPT0gJyMnXG4gICAgPyAoaHJlZiB8fCBsb2MuaHJlZiB8fCAnJykuc3BsaXQoYmFzZSlbMV0gfHwgJydcbiAgICA6IGdldFBhdGhGcm9tUm9vdChocmVmKVtSRVBMQUNFXShiYXNlLCAnJylcbn1cblxuZnVuY3Rpb24gZW1pdChmb3JjZSkge1xuICAvLyB0aGUgc3RhY2sgaXMgbmVlZGVkIGZvciByZWRpcmVjdGlvbnNcbiAgdmFyIGlzUm9vdCA9IGVtaXRTdGFja0xldmVsID09IDBcbiAgaWYgKE1BWF9FTUlUX1NUQUNLX0xFVkVMIDw9IGVtaXRTdGFja0xldmVsKSByZXR1cm5cblxuICBlbWl0U3RhY2tMZXZlbCsrXG4gIGVtaXRTdGFjay5wdXNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXRoID0gZ2V0UGF0aEZyb21CYXNlKClcbiAgICBpZiAoZm9yY2UgfHwgcGF0aCAhPSBjdXJyZW50KSB7XG4gICAgICBjZW50cmFsW1RSSUdHRVJdKCdlbWl0JywgcGF0aClcbiAgICAgIGN1cnJlbnQgPSBwYXRoXG4gICAgfVxuICB9KVxuICBpZiAoaXNSb290KSB7XG4gICAgd2hpbGUgKGVtaXRTdGFjay5sZW5ndGgpIHtcbiAgICAgIGVtaXRTdGFja1swXSgpXG4gICAgICBlbWl0U3RhY2suc2hpZnQoKVxuICAgIH1cbiAgICBlbWl0U3RhY2tMZXZlbCA9IDBcbiAgfVxufVxuXG5mdW5jdGlvbiBjbGljayhlKSB7XG4gIGlmIChcbiAgICBlLndoaWNoICE9IDEgLy8gbm90IGxlZnQgY2xpY2tcbiAgICB8fCBlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkgLy8gb3IgbWV0YSBrZXlzXG4gICAgfHwgZS5kZWZhdWx0UHJldmVudGVkIC8vIG9yIGRlZmF1bHQgcHJldmVudGVkXG4gICkgcmV0dXJuXG5cbiAgdmFyIGVsID0gZS50YXJnZXRcbiAgd2hpbGUgKGVsICYmIGVsLm5vZGVOYW1lICE9ICdBJykgZWwgPSBlbC5wYXJlbnROb2RlXG4gIGlmIChcbiAgICAhZWwgfHwgZWwubm9kZU5hbWUgIT0gJ0EnIC8vIG5vdCBBIHRhZ1xuICAgIHx8IGVsW0hBU19BVFRSSUJVVEVdKCdkb3dubG9hZCcpIC8vIGhhcyBkb3dubG9hZCBhdHRyXG4gICAgfHwgIWVsW0hBU19BVFRSSUJVVEVdKCdocmVmJykgLy8gaGFzIG5vIGhyZWYgYXR0clxuICAgIHx8IGVsLnRhcmdldCAmJiBlbC50YXJnZXQgIT0gJ19zZWxmJyAvLyBhbm90aGVyIHdpbmRvdyBvciBmcmFtZVxuICAgIHx8IGVsLmhyZWYuaW5kZXhPZihsb2MuaHJlZi5tYXRjaChSRV9PUklHSU4pWzBdKSA9PSAtMSAvLyBjcm9zcyBvcmlnaW5cbiAgKSByZXR1cm5cblxuICBpZiAoZWwuaHJlZiAhPSBsb2MuaHJlZikge1xuICAgIGlmIChcbiAgICAgIGVsLmhyZWYuc3BsaXQoJyMnKVswXSA9PSBsb2MuaHJlZi5zcGxpdCgnIycpWzBdIC8vIGludGVybmFsIGp1bXBcbiAgICAgIHx8IGJhc2UgIT0gJyMnICYmIGdldFBhdGhGcm9tUm9vdChlbC5ocmVmKS5pbmRleE9mKGJhc2UpICE9PSAwIC8vIG91dHNpZGUgb2YgYmFzZVxuICAgICAgfHwgIWdvKGdldFBhdGhGcm9tQmFzZShlbC5ocmVmKSwgZWwudGl0bGUgfHwgZG9jLnRpdGxlKSAvLyByb3V0ZSBub3QgZm91bmRcbiAgICApIHJldHVyblxuICB9XG5cbiAgZS5wcmV2ZW50RGVmYXVsdCgpXG59XG5cbi8qKlxuICogR28gdG8gdGhlIHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gZGVzdGluYXRpb24gcGF0aFxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIC0gcGFnZSB0aXRsZVxuICogQHBhcmFtIHtib29sZWFufSBzaG91bGRSZXBsYWNlIC0gdXNlIHJlcGxhY2VTdGF0ZSBvciBwdXNoU3RhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIHJvdXRlIG5vdCBmb3VuZCBmbGFnXG4gKi9cbmZ1bmN0aW9uIGdvKHBhdGgsIHRpdGxlLCBzaG91bGRSZXBsYWNlKSB7XG4gIGlmIChoaXN0KSB7IC8vIGlmIGEgYnJvd3NlclxuICAgIHBhdGggPSBiYXNlICsgbm9ybWFsaXplKHBhdGgpXG4gICAgdGl0bGUgPSB0aXRsZSB8fCBkb2MudGl0bGVcbiAgICAvLyBicm93c2VycyBpZ25vcmVzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIGB0aXRsZWBcbiAgICBzaG91bGRSZXBsYWNlXG4gICAgICA/IGhpc3QucmVwbGFjZVN0YXRlKG51bGwsIHRpdGxlLCBwYXRoKVxuICAgICAgOiBoaXN0LnB1c2hTdGF0ZShudWxsLCB0aXRsZSwgcGF0aClcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIHNldCBpdCBtYW51YWxseVxuICAgIGRvYy50aXRsZSA9IHRpdGxlXG4gICAgcm91dGVGb3VuZCA9IGZhbHNlXG4gICAgZW1pdCgpXG4gICAgcmV0dXJuIHJvdXRlRm91bmRcbiAgfVxuXG4gIC8vIFNlcnZlci1zaWRlIHVzYWdlOiBkaXJlY3RseSBleGVjdXRlIGhhbmRsZXJzIGZvciB0aGUgcGF0aFxuICByZXR1cm4gY2VudHJhbFtUUklHR0VSXSgnZW1pdCcsIGdldFBhdGhGcm9tQmFzZShwYXRoKSlcbn1cblxuLyoqXG4gKiBHbyB0byBwYXRoIG9yIHNldCBhY3Rpb25cbiAqIGEgc2luZ2xlIHN0cmluZzogICAgICAgICAgICAgICAgZ28gdGhlcmVcbiAqIHR3byBzdHJpbmdzOiAgICAgICAgICAgICAgICAgICAgZ28gdGhlcmUgd2l0aCBzZXR0aW5nIGEgdGl0bGVcbiAqIHR3byBzdHJpbmdzIGFuZCBib29sZWFuOiAgICAgICAgcmVwbGFjZSBoaXN0b3J5IHdpdGggc2V0dGluZyBhIHRpdGxlXG4gKiBhIHNpbmdsZSBmdW5jdGlvbjogICAgICAgICAgICAgIHNldCBhbiBhY3Rpb24gb24gdGhlIGRlZmF1bHQgcm91dGVcbiAqIGEgc3RyaW5nL1JlZ0V4cCBhbmQgYSBmdW5jdGlvbjogc2V0IGFuIGFjdGlvbiBvbiB0aGUgcm91dGVcbiAqIEBwYXJhbSB7KHN0cmluZ3xmdW5jdGlvbil9IGZpcnN0IC0gcGF0aCAvIGFjdGlvbiAvIGZpbHRlclxuICogQHBhcmFtIHsoc3RyaW5nfFJlZ0V4cHxmdW5jdGlvbil9IHNlY29uZCAtIHRpdGxlIC8gYWN0aW9uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHRoaXJkIC0gcmVwbGFjZSBmbGFnXG4gKi9cbnByb3QubSA9IGZ1bmN0aW9uKGZpcnN0LCBzZWNvbmQsIHRoaXJkKSB7XG4gIGlmIChpc1N0cmluZyhmaXJzdCkgJiYgKCFzZWNvbmQgfHwgaXNTdHJpbmcoc2Vjb25kKSkpIGdvKGZpcnN0LCBzZWNvbmQsIHRoaXJkIHx8IGZhbHNlKVxuICBlbHNlIGlmIChzZWNvbmQpIHRoaXMucihmaXJzdCwgc2Vjb25kKVxuICBlbHNlIHRoaXMucignQCcsIGZpcnN0KVxufVxuXG4vKipcbiAqIFN0b3Agcm91dGluZ1xuICovXG5wcm90LnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vZmYoJyonKVxuICB0aGlzLiQgPSBbXVxufVxuXG4vKipcbiAqIEVtaXRcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gcGF0aFxuICovXG5wcm90LmUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHRoaXMuJC5jb25jYXQoJ0AnKS5zb21lKGZ1bmN0aW9uKGZpbHRlcikge1xuICAgIHZhciBhcmdzID0gKGZpbHRlciA9PSAnQCcgPyBwYXJzZXIgOiBzZWNvbmRQYXJzZXIpKG5vcm1hbGl6ZShwYXRoKSwgbm9ybWFsaXplKGZpbHRlcikpXG4gICAgaWYgKHR5cGVvZiBhcmdzICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzW1RSSUdHRVJdLmFwcGx5KG51bGwsIFtmaWx0ZXJdLmNvbmNhdChhcmdzKSlcbiAgICAgIHJldHVybiByb3V0ZUZvdW5kID0gdHJ1ZSAvLyBleGl0IGZyb20gbG9vcFxuICAgIH1cbiAgfSwgdGhpcylcbn1cblxuLyoqXG4gKiBSZWdpc3RlciByb3V0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbHRlciAtIGZpbHRlciBmb3IgbWF0Y2hpbmcgdG8gdXJsXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBhY3Rpb24gLSBhY3Rpb24gdG8gcmVnaXN0ZXJcbiAqL1xucHJvdC5yID0gZnVuY3Rpb24oZmlsdGVyLCBhY3Rpb24pIHtcbiAgaWYgKGZpbHRlciAhPSAnQCcpIHtcbiAgICBmaWx0ZXIgPSAnLycgKyBub3JtYWxpemUoZmlsdGVyKVxuICAgIHRoaXMuJC5wdXNoKGZpbHRlcilcbiAgfVxuICB0aGlzLm9uKGZpbHRlciwgYWN0aW9uKVxufVxuXG52YXIgbWFpblJvdXRlciA9IG5ldyBSb3V0ZXIoKVxudmFyIHJvdXRlID0gbWFpblJvdXRlci5tLmJpbmQobWFpblJvdXRlcilcblxuLyoqXG4gKiBDcmVhdGUgYSBzdWIgcm91dGVyXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IHRoZSBtZXRob2Qgb2YgYSBuZXcgUm91dGVyIG9iamVjdFxuICovXG5yb3V0ZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5ld1N1YlJvdXRlciA9IG5ldyBSb3V0ZXIoKVxuICAvLyBzdG9wIG9ubHkgdGhpcyBzdWItcm91dGVyXG4gIG5ld1N1YlJvdXRlci5tLnN0b3AgPSBuZXdTdWJSb3V0ZXIucy5iaW5kKG5ld1N1YlJvdXRlcilcbiAgLy8gcmV0dXJuIHN1Yi1yb3V0ZXIncyBtYWluIG1ldGhvZFxuICByZXR1cm4gbmV3U3ViUm91dGVyLm0uYmluZChuZXdTdWJSb3V0ZXIpXG59XG5cbi8qKlxuICogU2V0IHRoZSBiYXNlIG9mIHVybFxuICogQHBhcmFtIHsoc3RyfFJlZ0V4cCl9IGFyZyAtIGEgbmV3IGJhc2Ugb3IgJyMnIG9yICcjISdcbiAqL1xucm91dGUuYmFzZSA9IGZ1bmN0aW9uKGFyZykge1xuICBiYXNlID0gYXJnIHx8ICcjJ1xuICBjdXJyZW50ID0gZ2V0UGF0aEZyb21CYXNlKCkgLy8gcmVjYWxjdWxhdGUgY3VycmVudCBwYXRoXG59XG5cbi8qKiBFeGVjIHJvdXRpbmcgcmlnaHQgbm93ICoqL1xucm91dGUuZXhlYyA9IGZ1bmN0aW9uKCkge1xuICBlbWl0KHRydWUpXG59XG5cbi8qKlxuICogUmVwbGFjZSB0aGUgZGVmYXVsdCByb3V0ZXIgdG8geW91cnNcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0geW91ciBwYXJzZXIgZnVuY3Rpb25cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuMiAtIHlvdXIgc2Vjb25kUGFyc2VyIGZ1bmN0aW9uXG4gKi9cbnJvdXRlLnBhcnNlciA9IGZ1bmN0aW9uKGZuLCBmbjIpIHtcbiAgaWYgKCFmbiAmJiAhZm4yKSB7XG4gICAgLy8gcmVzZXQgcGFyc2VyIGZvciB0ZXN0aW5nLi4uXG4gICAgcGFyc2VyID0gREVGQVVMVF9QQVJTRVJcbiAgICBzZWNvbmRQYXJzZXIgPSBERUZBVUxUX1NFQ09ORF9QQVJTRVJcbiAgfVxuICBpZiAoZm4pIHBhcnNlciA9IGZuXG4gIGlmIChmbjIpIHNlY29uZFBhcnNlciA9IGZuMlxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBnZXQgdXJsIHF1ZXJ5IGFzIGFuIG9iamVjdFxuICogQHJldHVybnMge29iamVjdH0gcGFyc2VkIHF1ZXJ5XG4gKi9cbnJvdXRlLnF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBxID0ge31cbiAgdmFyIGhyZWYgPSBsb2MuaHJlZiB8fCBjdXJyZW50XG4gIGhyZWZbUkVQTEFDRV0oL1s/Jl0oLis/KT0oW14mXSopL2csIGZ1bmN0aW9uKF8sIGssIHYpIHsgcVtrXSA9IHYgfSlcbiAgcmV0dXJuIHFcbn1cblxuLyoqIFN0b3Agcm91dGluZyAqKi9cbnJvdXRlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChzdGFydGVkKSB7XG4gICAgaWYgKHdpbikge1xuICAgICAgd2luW1JFTU9WRV9FVkVOVF9MSVNURU5FUl0oUE9QU1RBVEUsIGRlYm91bmNlZEVtaXQpXG4gICAgICB3aW5bUkVNT1ZFX0VWRU5UX0xJU1RFTkVSXShIQVNIQ0hBTkdFLCBkZWJvdW5jZWRFbWl0KVxuICAgICAgZG9jW1JFTU9WRV9FVkVOVF9MSVNURU5FUl0oY2xpY2tFdmVudCwgY2xpY2spXG4gICAgfVxuICAgIGNlbnRyYWxbVFJJR0dFUl0oJ3N0b3AnKVxuICAgIHN0YXJ0ZWQgPSBmYWxzZVxuICB9XG59XG5cbi8qKlxuICogU3RhcnQgcm91dGluZ1xuICogQHBhcmFtIHtib29sZWFufSBhdXRvRXhlYyAtIGF1dG9tYXRpY2FsbHkgZXhlYyBhZnRlciBzdGFydGluZyBpZiB0cnVlXG4gKi9cbnJvdXRlLnN0YXJ0ID0gZnVuY3Rpb24gKGF1dG9FeGVjKSB7XG4gIGlmICghc3RhcnRlZCkge1xuICAgIGlmICh3aW4pIHtcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpIHN0YXJ0KGF1dG9FeGVjKVxuICAgICAgLy8gdGhlIHRpbWVvdXQgaXMgbmVlZGVkIHRvIHNvbHZlXG4gICAgICAvLyBhIHdlaXJkIHNhZmFyaSBidWcgaHR0cHM6Ly9naXRodWIuY29tL3Jpb3Qvcm91dGUvaXNzdWVzLzMzXG4gICAgICBlbHNlIHdpbltBRERfRVZFTlRfTElTVEVORVJdKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHN0YXJ0KGF1dG9FeGVjKSB9LCAxKVxuICAgICAgfSlcbiAgICB9XG4gICAgc3RhcnRlZCA9IHRydWVcbiAgfVxufVxuXG4vKiogUHJlcGFyZSB0aGUgcm91dGVyICoqL1xucm91dGUuYmFzZSgpXG5yb3V0ZS5wYXJzZXIoKVxuXG5yaW90LnJvdXRlID0gcm91dGVcbn0pKHJpb3QpXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuXG4vKipcbiAqIFRoZSByaW90IHRlbXBsYXRlIGVuZ2luZVxuICogQHZlcnNpb24gdjIuMy4yMVxuICovXG5cbi8qKlxuICogcmlvdC51dGlsLmJyYWNrZXRzXG4gKlxuICogLSBgYnJhY2tldHMgICAgYCAtIFJldHVybnMgYSBzdHJpbmcgb3IgcmVnZXggYmFzZWQgb24gaXRzIHBhcmFtZXRlclxuICogLSBgYnJhY2tldHMuc2V0YCAtIENoYW5nZSB0aGUgY3VycmVudCByaW90IGJyYWNrZXRzXG4gKlxuICogQG1vZHVsZVxuICovXG5cbnZhciBicmFja2V0cyA9IChmdW5jdGlvbiAoVU5ERUYpIHtcblxuICB2YXJcbiAgICBSRUdMT0IgPSAnZycsXG5cbiAgICBSX01MQ09NTVMgPSAvXFwvXFwqW14qXSpcXCorKD86W14qXFwvXVteKl0qXFwqKykqXFwvL2csXG5cbiAgICBSX1NUUklOR1MgPSAvXCJbXlwiXFxcXF0qKD86XFxcXFtcXFNcXHNdW15cIlxcXFxdKikqXCJ8J1teJ1xcXFxdKig/OlxcXFxbXFxTXFxzXVteJ1xcXFxdKikqJy9nLFxuXG4gICAgU19RQkxPQ0tTID0gUl9TVFJJTkdTLnNvdXJjZSArICd8JyArXG4gICAgICAvKD86XFxicmV0dXJuXFxzK3woPzpbJFxcd1xcKVxcXV18XFwrXFwrfC0tKVxccyooXFwvKSg/IVsqXFwvXSkpLy5zb3VyY2UgKyAnfCcgK1xuICAgICAgL1xcLyg/PVteKlxcL10pW15bXFwvXFxcXF0qKD86KD86XFxbKD86XFxcXC58W15cXF1cXFxcXSopKlxcXXxcXFxcLilbXltcXC9cXFxcXSopKj8oXFwvKVtnaW1dKi8uc291cmNlLFxuXG4gICAgRklOREJSQUNFUyA9IHtcbiAgICAgICcoJzogUmVnRXhwKCcoWygpXSl8JyAgICsgU19RQkxPQ0tTLCBSRUdMT0IpLFxuICAgICAgJ1snOiBSZWdFeHAoJyhbW1xcXFxdXSl8JyArIFNfUUJMT0NLUywgUkVHTE9CKSxcbiAgICAgICd7JzogUmVnRXhwKCcoW3t9XSl8JyAgICsgU19RQkxPQ0tTLCBSRUdMT0IpXG4gICAgfSxcblxuICAgIERFRkFVTFQgPSAneyB9J1xuXG4gIHZhciBfcGFpcnMgPSBbXG4gICAgJ3snLCAnfScsXG4gICAgJ3snLCAnfScsXG4gICAgL3tbXn1dKn0vLFxuICAgIC9cXFxcKFt7fV0pL2csXG4gICAgL1xcXFwoeyl8ey9nLFxuICAgIFJlZ0V4cCgnXFxcXFxcXFwofSl8KFtbKHtdKXwofSl8JyArIFNfUUJMT0NLUywgUkVHTE9CKSxcbiAgICBERUZBVUxULFxuICAgIC9eXFxzKntcXF4/XFxzKihbJFxcd10rKSg/OlxccyosXFxzKihcXFMrKSk/XFxzK2luXFxzKyhcXFMuKilcXHMqfS8sXG4gICAgLyhefFteXFxcXF0pez1bXFxTXFxzXSo/fS9cbiAgXVxuXG4gIHZhclxuICAgIGNhY2hlZEJyYWNrZXRzID0gVU5ERUYsXG4gICAgX3JlZ2V4LFxuICAgIF9jYWNoZSA9IFtdLFxuICAgIF9zZXR0aW5nc1xuXG4gIGZ1bmN0aW9uIF9sb29wYmFjayAocmUpIHsgcmV0dXJuIHJlIH1cblxuICBmdW5jdGlvbiBfcmV3cml0ZSAocmUsIGJwKSB7XG4gICAgaWYgKCFicCkgYnAgPSBfY2FjaGVcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChcbiAgICAgIHJlLnNvdXJjZS5yZXBsYWNlKC97L2csIGJwWzJdKS5yZXBsYWNlKC99L2csIGJwWzNdKSwgcmUuZ2xvYmFsID8gUkVHTE9CIDogJydcbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBfY3JlYXRlIChwYWlyKSB7XG4gICAgaWYgKHBhaXIgPT09IERFRkFVTFQpIHJldHVybiBfcGFpcnNcblxuICAgIHZhciBhcnIgPSBwYWlyLnNwbGl0KCcgJylcblxuICAgIGlmIChhcnIubGVuZ3RoICE9PSAyIHx8IC9bXFx4MDAtXFx4MUY8PmEtekEtWjAtOSdcIiw7XFxcXF0vLnRlc3QocGFpcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYnJhY2tldHMgXCInICsgcGFpciArICdcIicpXG4gICAgfVxuICAgIGFyciA9IGFyci5jb25jYXQocGFpci5yZXBsYWNlKC8oPz1bW1xcXSgpKis/Ll4kfF0pL2csICdcXFxcJykuc3BsaXQoJyAnKSlcblxuICAgIGFycls0XSA9IF9yZXdyaXRlKGFyclsxXS5sZW5ndGggPiAxID8gL3tbXFxTXFxzXSo/fS8gOiBfcGFpcnNbNF0sIGFycilcbiAgICBhcnJbNV0gPSBfcmV3cml0ZShwYWlyLmxlbmd0aCA+IDMgPyAvXFxcXCh7fH0pL2cgOiBfcGFpcnNbNV0sIGFycilcbiAgICBhcnJbNl0gPSBfcmV3cml0ZShfcGFpcnNbNl0sIGFycilcbiAgICBhcnJbN10gPSBSZWdFeHAoJ1xcXFxcXFxcKCcgKyBhcnJbM10gKyAnKXwoW1soe10pfCgnICsgYXJyWzNdICsgJyl8JyArIFNfUUJMT0NLUywgUkVHTE9CKVxuICAgIGFycls4XSA9IHBhaXJcbiAgICByZXR1cm4gYXJyXG4gIH1cblxuICBmdW5jdGlvbiBfYnJhY2tldHMgKHJlT3JJZHgpIHtcbiAgICByZXR1cm4gcmVPcklkeCBpbnN0YW5jZW9mIFJlZ0V4cCA/IF9yZWdleChyZU9ySWR4KSA6IF9jYWNoZVtyZU9ySWR4XVxuICB9XG5cbiAgX2JyYWNrZXRzLnNwbGl0ID0gZnVuY3Rpb24gc3BsaXQgKHN0ciwgdG1wbCwgX2JwKSB7XG4gICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHQ6IF9icCBpcyBmb3IgdGhlIGNvbXBpbGVyXG4gICAgaWYgKCFfYnApIF9icCA9IF9jYWNoZVxuXG4gICAgdmFyXG4gICAgICBwYXJ0cyA9IFtdLFxuICAgICAgbWF0Y2gsXG4gICAgICBpc2V4cHIsXG4gICAgICBzdGFydCxcbiAgICAgIHBvcyxcbiAgICAgIHJlID0gX2JwWzZdXG5cbiAgICBpc2V4cHIgPSBzdGFydCA9IHJlLmxhc3RJbmRleCA9IDBcblxuICAgIHdoaWxlIChtYXRjaCA9IHJlLmV4ZWMoc3RyKSkge1xuXG4gICAgICBwb3MgPSBtYXRjaC5pbmRleFxuXG4gICAgICBpZiAoaXNleHByKSB7XG5cbiAgICAgICAgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgICAgcmUubGFzdEluZGV4ID0gc2tpcEJyYWNlcyhzdHIsIG1hdGNoWzJdLCByZS5sYXN0SW5kZXgpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1hdGNoWzNdKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmICghbWF0Y2hbMV0pIHtcbiAgICAgICAgdW5lc2NhcGVTdHIoc3RyLnNsaWNlKHN0YXJ0LCBwb3MpKVxuICAgICAgICBzdGFydCA9IHJlLmxhc3RJbmRleFxuICAgICAgICByZSA9IF9icFs2ICsgKGlzZXhwciBePSAxKV1cbiAgICAgICAgcmUubGFzdEluZGV4ID0gc3RhcnRcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RyICYmIHN0YXJ0IDwgc3RyLmxlbmd0aCkge1xuICAgICAgdW5lc2NhcGVTdHIoc3RyLnNsaWNlKHN0YXJ0KSlcbiAgICB9XG5cbiAgICByZXR1cm4gcGFydHNcblxuICAgIGZ1bmN0aW9uIHVuZXNjYXBlU3RyIChzKSB7XG4gICAgICBpZiAodG1wbCB8fCBpc2V4cHIpXG4gICAgICAgIHBhcnRzLnB1c2gocyAmJiBzLnJlcGxhY2UoX2JwWzVdLCAnJDEnKSlcbiAgICAgIGVsc2VcbiAgICAgICAgcGFydHMucHVzaChzKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNraXBCcmFjZXMgKHMsIGNoLCBpeCkge1xuICAgICAgdmFyXG4gICAgICAgIG1hdGNoLFxuICAgICAgICByZWNjaCA9IEZJTkRCUkFDRVNbY2hdXG5cbiAgICAgIHJlY2NoLmxhc3RJbmRleCA9IGl4XG4gICAgICBpeCA9IDFcbiAgICAgIHdoaWxlIChtYXRjaCA9IHJlY2NoLmV4ZWMocykpIHtcbiAgICAgICAgaWYgKG1hdGNoWzFdICYmXG4gICAgICAgICAgIShtYXRjaFsxXSA9PT0gY2ggPyArK2l4IDogLS1peCkpIGJyZWFrXG4gICAgICB9XG4gICAgICByZXR1cm4gaXggPyBzLmxlbmd0aCA6IHJlY2NoLmxhc3RJbmRleFxuICAgIH1cbiAgfVxuXG4gIF9icmFja2V0cy5oYXNFeHByID0gZnVuY3Rpb24gaGFzRXhwciAoc3RyKSB7XG4gICAgcmV0dXJuIF9jYWNoZVs0XS50ZXN0KHN0cilcbiAgfVxuXG4gIF9icmFja2V0cy5sb29wS2V5cyA9IGZ1bmN0aW9uIGxvb3BLZXlzIChleHByKSB7XG4gICAgdmFyIG0gPSBleHByLm1hdGNoKF9jYWNoZVs5XSlcbiAgICByZXR1cm4gbVxuICAgICAgPyB7IGtleTogbVsxXSwgcG9zOiBtWzJdLCB2YWw6IF9jYWNoZVswXSArIG1bM10udHJpbSgpICsgX2NhY2hlWzFdIH1cbiAgICAgIDogeyB2YWw6IGV4cHIudHJpbSgpIH1cbiAgfVxuXG4gIF9icmFja2V0cy5oYXNSYXcgPSBmdW5jdGlvbiAoc3JjKSB7XG4gICAgcmV0dXJuIF9jYWNoZVsxMF0udGVzdChzcmMpXG4gIH1cblxuICBfYnJhY2tldHMuYXJyYXkgPSBmdW5jdGlvbiBhcnJheSAocGFpcikge1xuICAgIHJldHVybiBwYWlyID8gX2NyZWF0ZShwYWlyKSA6IF9jYWNoZVxuICB9XG5cbiAgZnVuY3Rpb24gX3Jlc2V0IChwYWlyKSB7XG4gICAgaWYgKChwYWlyIHx8IChwYWlyID0gREVGQVVMVCkpICE9PSBfY2FjaGVbOF0pIHtcbiAgICAgIF9jYWNoZSA9IF9jcmVhdGUocGFpcilcbiAgICAgIF9yZWdleCA9IHBhaXIgPT09IERFRkFVTFQgPyBfbG9vcGJhY2sgOiBfcmV3cml0ZVxuICAgICAgX2NhY2hlWzldID0gX3JlZ2V4KF9wYWlyc1s5XSlcbiAgICAgIF9jYWNoZVsxMF0gPSBfcmVnZXgoX3BhaXJzWzEwXSlcbiAgICB9XG4gICAgY2FjaGVkQnJhY2tldHMgPSBwYWlyXG4gIH1cblxuICBmdW5jdGlvbiBfc2V0U2V0dGluZ3MgKG8pIHtcbiAgICB2YXIgYlxuICAgIG8gPSBvIHx8IHt9XG4gICAgYiA9IG8uYnJhY2tldHNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ2JyYWNrZXRzJywge1xuICAgICAgc2V0OiBfcmVzZXQsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhY2hlZEJyYWNrZXRzIH0sXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICBfc2V0dGluZ3MgPSBvXG4gICAgX3Jlc2V0KGIpXG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2JyYWNrZXRzLCAnc2V0dGluZ3MnLCB7XG4gICAgc2V0OiBfc2V0U2V0dGluZ3MsXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBfc2V0dGluZ3MgfVxuICB9KVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBpbiB0aGUgYnJvd3NlciByaW90IGlzIGFsd2F5cyBpbiB0aGUgc2NvcGUgKi9cbiAgX2JyYWNrZXRzLnNldHRpbmdzID0gdHlwZW9mIHJpb3QgIT09ICd1bmRlZmluZWQnICYmIHJpb3Quc2V0dGluZ3MgfHwge31cbiAgX2JyYWNrZXRzLnNldCA9IF9yZXNldFxuXG4gIF9icmFja2V0cy5SX1NUUklOR1MgPSBSX1NUUklOR1NcbiAgX2JyYWNrZXRzLlJfTUxDT01NUyA9IFJfTUxDT01NU1xuICBfYnJhY2tldHMuU19RQkxPQ0tTID0gU19RQkxPQ0tTXG5cbiAgcmV0dXJuIF9icmFja2V0c1xuXG59KSgpXG5cbi8qKlxuICogQG1vZHVsZSB0bXBsXG4gKlxuICogdG1wbCAgICAgICAgICAtIFJvb3QgZnVuY3Rpb24sIHJldHVybnMgdGhlIHRlbXBsYXRlIHZhbHVlLCByZW5kZXIgd2l0aCBkYXRhXG4gKiB0bXBsLmhhc0V4cHIgIC0gVGVzdCB0aGUgZXhpc3RlbmNlIG9mIGEgZXhwcmVzc2lvbiBpbnNpZGUgYSBzdHJpbmdcbiAqIHRtcGwubG9vcEtleXMgLSBHZXQgdGhlIGtleXMgZm9yIGFuICdlYWNoJyBsb29wICh1c2VkIGJ5IGBfZWFjaGApXG4gKi9cblxudmFyIHRtcGwgPSAoZnVuY3Rpb24gKCkge1xuXG4gIHZhciBfY2FjaGUgPSB7fVxuXG4gIGZ1bmN0aW9uIF90bXBsIChzdHIsIGRhdGEpIHtcbiAgICBpZiAoIXN0cikgcmV0dXJuIHN0clxuXG4gICAgcmV0dXJuIChfY2FjaGVbc3RyXSB8fCAoX2NhY2hlW3N0cl0gPSBfY3JlYXRlKHN0cikpKS5jYWxsKGRhdGEsIF9sb2dFcnIpXG4gIH1cblxuICBfdG1wbC5oYXZlUmF3ID0gYnJhY2tldHMuaGFzUmF3XG5cbiAgX3RtcGwuaGFzRXhwciA9IGJyYWNrZXRzLmhhc0V4cHJcblxuICBfdG1wbC5sb29wS2V5cyA9IGJyYWNrZXRzLmxvb3BLZXlzXG5cbiAgX3RtcGwuZXJyb3JIYW5kbGVyID0gbnVsbFxuXG4gIGZ1bmN0aW9uIF9sb2dFcnIgKGVyciwgY3R4KSB7XG5cbiAgICBpZiAoX3RtcGwuZXJyb3JIYW5kbGVyKSB7XG5cbiAgICAgIGVyci5yaW90RGF0YSA9IHtcbiAgICAgICAgdGFnTmFtZTogY3R4ICYmIGN0eC5yb290ICYmIGN0eC5yb290LnRhZ05hbWUsXG4gICAgICAgIF9yaW90X2lkOiBjdHggJiYgY3R4Ll9yaW90X2lkICAvL2VzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICB9XG4gICAgICBfdG1wbC5lcnJvckhhbmRsZXIoZXJyKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9jcmVhdGUgKHN0cikge1xuXG4gICAgdmFyIGV4cHIgPSBfZ2V0VG1wbChzdHIpXG4gICAgaWYgKGV4cHIuc2xpY2UoMCwgMTEpICE9PSAndHJ5e3JldHVybiAnKSBleHByID0gJ3JldHVybiAnICsgZXhwclxuXG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbignRScsIGV4cHIgKyAnOycpXG4gIH1cblxuICB2YXJcbiAgICBSRV9RQkxPQ0sgPSBSZWdFeHAoYnJhY2tldHMuU19RQkxPQ0tTLCAnZycpLFxuICAgIFJFX1FCTUFSSyA9IC9cXHgwMShcXGQrKX4vZ1xuXG4gIGZ1bmN0aW9uIF9nZXRUbXBsIChzdHIpIHtcbiAgICB2YXJcbiAgICAgIHFzdHIgPSBbXSxcbiAgICAgIGV4cHIsXG4gICAgICBwYXJ0cyA9IGJyYWNrZXRzLnNwbGl0KHN0ci5yZXBsYWNlKC9cXHUyMDU3L2csICdcIicpLCAxKVxuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIgfHwgcGFydHNbMF0pIHtcbiAgICAgIHZhciBpLCBqLCBsaXN0ID0gW11cblxuICAgICAgZm9yIChpID0gaiA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7ICsraSkge1xuXG4gICAgICAgIGV4cHIgPSBwYXJ0c1tpXVxuXG4gICAgICAgIGlmIChleHByICYmIChleHByID0gaSAmIDEgP1xuXG4gICAgICAgICAgICAgIF9wYXJzZUV4cHIoZXhwciwgMSwgcXN0cikgOlxuXG4gICAgICAgICAgICAgICdcIicgKyBleHByXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxyXFxuP3xcXG4vZywgJ1xcXFxuJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICtcbiAgICAgICAgICAgICAgJ1wiJ1xuXG4gICAgICAgICAgKSkgbGlzdFtqKytdID0gZXhwclxuXG4gICAgICB9XG5cbiAgICAgIGV4cHIgPSBqIDwgMiA/IGxpc3RbMF0gOlxuICAgICAgICAgICAgICdbJyArIGxpc3Quam9pbignLCcpICsgJ10uam9pbihcIlwiKSdcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIGV4cHIgPSBfcGFyc2VFeHByKHBhcnRzWzFdLCAwLCBxc3RyKVxuICAgIH1cblxuICAgIGlmIChxc3RyWzBdKVxuICAgICAgZXhwciA9IGV4cHIucmVwbGFjZShSRV9RQk1BUkssIGZ1bmN0aW9uIChfLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIHFzdHJbcG9zXVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcbiAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgICB9KVxuXG4gICAgcmV0dXJuIGV4cHJcbiAgfVxuXG4gIHZhclxuICAgIFJFX0JSRU5EID0ge1xuICAgICAgJygnOiAvWygpXS9nLFxuICAgICAgJ1snOiAvW1tcXF1dL2csXG4gICAgICAneyc6IC9be31dL2dcbiAgICB9LFxuICAgIENTX0lERU5UID0gL14oPzooLT9bX0EtWmEtelxceEEwLVxceEZGXVstXFx3XFx4QTAtXFx4RkZdKil8XFx4MDEoXFxkKyl+KTovXG5cbiAgZnVuY3Rpb24gX3BhcnNlRXhwciAoZXhwciwgYXNUZXh0LCBxc3RyKSB7XG5cbiAgICBpZiAoZXhwclswXSA9PT0gJz0nKSBleHByID0gZXhwci5zbGljZSgxKVxuXG4gICAgZXhwciA9IGV4cHJcbiAgICAgICAgICAucmVwbGFjZShSRV9RQkxPQ0ssIGZ1bmN0aW9uIChzLCBkaXYpIHtcbiAgICAgICAgICAgIHJldHVybiBzLmxlbmd0aCA+IDIgJiYgIWRpdiA/ICdcXHgwMScgKyAocXN0ci5wdXNoKHMpIC0gMSkgKyAnficgOiBzXG4gICAgICAgICAgfSlcbiAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXCA/KFtbXFwoe30sP1xcLjpdKVxcID8vZywgJyQxJylcblxuICAgIGlmIChleHByKSB7XG4gICAgICB2YXJcbiAgICAgICAgbGlzdCA9IFtdLFxuICAgICAgICBjbnQgPSAwLFxuICAgICAgICBtYXRjaFxuXG4gICAgICB3aGlsZSAoZXhwciAmJlxuICAgICAgICAgICAgKG1hdGNoID0gZXhwci5tYXRjaChDU19JREVOVCkpICYmXG4gICAgICAgICAgICAhbWF0Y2guaW5kZXhcbiAgICAgICAgKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBqc2IsXG4gICAgICAgICAgcmUgPSAvLHwoW1t7KF0pfCQvZ1xuXG4gICAgICAgIGV4cHIgPSBSZWdFeHAucmlnaHRDb250ZXh0XG4gICAgICAgIGtleSAgPSBtYXRjaFsyXSA/IHFzdHJbbWF0Y2hbMl1dLnNsaWNlKDEsIC0xKS50cmltKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpIDogbWF0Y2hbMV1cblxuICAgICAgICB3aGlsZSAoanNiID0gKG1hdGNoID0gcmUuZXhlYyhleHByKSlbMV0pIHNraXBCcmFjZXMoanNiLCByZSlcblxuICAgICAgICBqc2IgID0gZXhwci5zbGljZSgwLCBtYXRjaC5pbmRleClcbiAgICAgICAgZXhwciA9IFJlZ0V4cC5yaWdodENvbnRleHRcblxuICAgICAgICBsaXN0W2NudCsrXSA9IF93cmFwRXhwcihqc2IsIDEsIGtleSlcbiAgICAgIH1cblxuICAgICAgZXhwciA9ICFjbnQgPyBfd3JhcEV4cHIoZXhwciwgYXNUZXh0KSA6XG4gICAgICAgICAgY250ID4gMSA/ICdbJyArIGxpc3Quam9pbignLCcpICsgJ10uam9pbihcIiBcIikudHJpbSgpJyA6IGxpc3RbMF1cbiAgICB9XG4gICAgcmV0dXJuIGV4cHJcblxuICAgIGZ1bmN0aW9uIHNraXBCcmFjZXMgKGNoLCByZSkge1xuICAgICAgdmFyXG4gICAgICAgIG1tLFxuICAgICAgICBsdiA9IDEsXG4gICAgICAgIGlyID0gUkVfQlJFTkRbY2hdXG5cbiAgICAgIGlyLmxhc3RJbmRleCA9IHJlLmxhc3RJbmRleFxuICAgICAgd2hpbGUgKG1tID0gaXIuZXhlYyhleHByKSkge1xuICAgICAgICBpZiAobW1bMF0gPT09IGNoKSArK2x2XG4gICAgICAgIGVsc2UgaWYgKCEtLWx2KSBicmVha1xuICAgICAgfVxuICAgICAgcmUubGFzdEluZGV4ID0gbHYgPyBleHByLmxlbmd0aCA6IGlyLmxhc3RJbmRleFxuICAgIH1cbiAgfVxuXG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBub3QgYm90aFxuICB2YXJcbiAgICBKU19DT05URVhUID0gJ1wiaW4gdGhpcz90aGlzOicgKyAodHlwZW9mIHdpbmRvdyAhPT0gJ29iamVjdCcgPyAnZ2xvYmFsJyA6ICd3aW5kb3cnKSArICcpLicsXG4gICAgSlNfVkFSTkFNRSA9IC9bLHtdWyRcXHddKzp8KF4gKnxbXiRcXHdcXC5dKSg/ISg/OnR5cGVvZnx0cnVlfGZhbHNlfG51bGx8dW5kZWZpbmVkfGlufGluc3RhbmNlb2Z8aXMoPzpGaW5pdGV8TmFOKXx2b2lkfE5hTnxuZXd8RGF0ZXxSZWdFeHB8TWF0aCkoPyFbJFxcd10pKShbJF9BLVphLXpdWyRcXHddKikvZyxcbiAgICBKU19OT1BST1BTID0gL14oPz0oXFwuWyRcXHddKykpXFwxKD86W14uWyhdfCQpL1xuXG4gIGZ1bmN0aW9uIF93cmFwRXhwciAoZXhwciwgYXNUZXh0LCBrZXkpIHtcbiAgICB2YXIgdGJcblxuICAgIGV4cHIgPSBleHByLnJlcGxhY2UoSlNfVkFSTkFNRSwgZnVuY3Rpb24gKG1hdGNoLCBwLCBtdmFyLCBwb3MsIHMpIHtcbiAgICAgIGlmIChtdmFyKSB7XG4gICAgICAgIHBvcyA9IHRiID8gMCA6IHBvcyArIG1hdGNoLmxlbmd0aFxuXG4gICAgICAgIGlmIChtdmFyICE9PSAndGhpcycgJiYgbXZhciAhPT0gJ2dsb2JhbCcgJiYgbXZhciAhPT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICBtYXRjaCA9IHAgKyAnKFwiJyArIG12YXIgKyBKU19DT05URVhUICsgbXZhclxuICAgICAgICAgIGlmIChwb3MpIHRiID0gKHMgPSBzW3Bvc10pID09PSAnLicgfHwgcyA9PT0gJygnIHx8IHMgPT09ICdbJ1xuICAgICAgICB9IGVsc2UgaWYgKHBvcykge1xuICAgICAgICAgIHRiID0gIUpTX05PUFJPUFMudGVzdChzLnNsaWNlKHBvcykpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaFxuICAgIH0pXG5cbiAgICBpZiAodGIpIHtcbiAgICAgIGV4cHIgPSAndHJ5e3JldHVybiAnICsgZXhwciArICd9Y2F0Y2goZSl7RShlLHRoaXMpfSdcbiAgICB9XG5cbiAgICBpZiAoa2V5KSB7XG5cbiAgICAgIGV4cHIgPSAodGIgP1xuICAgICAgICAgICdmdW5jdGlvbigpeycgKyBleHByICsgJ30uY2FsbCh0aGlzKScgOiAnKCcgKyBleHByICsgJyknXG4gICAgICAgICkgKyAnP1wiJyArIGtleSArICdcIjpcIlwiJ1xuXG4gICAgfSBlbHNlIGlmIChhc1RleHQpIHtcblxuICAgICAgZXhwciA9ICdmdW5jdGlvbih2KXsnICsgKHRiID9cbiAgICAgICAgICBleHByLnJlcGxhY2UoJ3JldHVybiAnLCAndj0nKSA6ICd2PSgnICsgZXhwciArICcpJ1xuICAgICAgICApICsgJztyZXR1cm4gdnx8dj09PTA/djpcIlwifS5jYWxsKHRoaXMpJ1xuICAgIH1cblxuICAgIHJldHVybiBleHByXG4gIH1cblxuICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogY29tcGF0aWJpbGl0eSBmaXggZm9yIGJldGEgdmVyc2lvbnNcbiAgX3RtcGwucGFyc2UgPSBmdW5jdGlvbiAocykgeyByZXR1cm4gcyB9XG5cbiAgX3RtcGwudmVyc2lvbiA9IGJyYWNrZXRzLnZlcnNpb24gPSAndjIuMy4yMSdcblxuICByZXR1cm4gX3RtcGxcblxufSkoKVxuXG4vKlxuICBsaWIvYnJvd3Nlci90YWcvbWtkb20uanNcblxuICBJbmNsdWRlcyBoYWNrcyBuZWVkZWQgZm9yIHRoZSBJbnRlcm5ldCBFeHBsb3JlciB2ZXJzaW9uIDkgYW5kIGJlbG93XG4gIFNlZTogaHR0cDovL2thbmdheC5naXRodWIuaW8vY29tcGF0LXRhYmxlL2VzNS8jaWU4XG4gICAgICAgaHR0cDovL2NvZGVwbGFuZXQuaW8vZHJvcHBpbmctaWU4L1xuKi9cbnZhciBta2RvbSA9IChmdW5jdGlvbiBfbWtkb20oKSB7XG4gIHZhclxuICAgIHJlSGFzWWllbGQgID0gLzx5aWVsZFxcYi9pLFxuICAgIHJlWWllbGRBbGwgID0gLzx5aWVsZFxccyooPzpcXC8+fD4oW1xcU1xcc10qPyk8XFwveWllbGRcXHMqPikvaWcsXG4gICAgcmVZaWVsZFNyYyAgPSAvPHlpZWxkXFxzK3RvPVsnXCJdKFteJ1wiPl0qKVsnXCJdXFxzKj4oW1xcU1xcc10qPyk8XFwveWllbGRcXHMqPi9pZyxcbiAgICByZVlpZWxkRGVzdCA9IC88eWllbGRcXHMrZnJvbT1bJ1wiXT8oWy1cXHddKylbJ1wiXT9cXHMqKD86XFwvPnw+KFtcXFNcXHNdKj8pPFxcL3lpZWxkXFxzKj4pL2lnXG4gIHZhclxuICAgIHJvb3RFbHMgPSB7IHRyOiAndGJvZHknLCB0aDogJ3RyJywgdGQ6ICd0cicsIGNvbDogJ2NvbGdyb3VwJyB9LFxuICAgIHRibFRhZ3MgPSBJRV9WRVJTSU9OICYmIElFX1ZFUlNJT04gPCAxMFxuICAgICAgPyBTUEVDSUFMX1RBR1NfUkVHRVggOiAvXig/OnQoPzpib2R5fGhlYWR8Zm9vdHxbcmhkXSl8Y2FwdGlvbnxjb2woPzpncm91cCk/KSQvXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBET00gZWxlbWVudCB0byB3cmFwIHRoZSBnaXZlbiBjb250ZW50LiBOb3JtYWxseSBhbiBgRElWYCwgYnV0IGNhbiBiZVxuICAgKiBhbHNvIGEgYFRBQkxFYCwgYFNFTEVDVGAsIGBUQk9EWWAsIGBUUmAsIG9yIGBDT0xHUk9VUGAgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtICAge3N0cmluZ30gdGVtcGwgIC0gVGhlIHRlbXBsYXRlIGNvbWluZyBmcm9tIHRoZSBjdXN0b20gdGFnIGRlZmluaXRpb25cbiAgICogQHBhcmFtICAge3N0cmluZ30gW2h0bWxdIC0gSFRNTCBjb250ZW50IHRoYXQgY29tZXMgZnJvbSB0aGUgRE9NIGVsZW1lbnQgd2hlcmUgeW91XG4gICAqICAgICAgICAgICB3aWxsIG1vdW50IHRoZSB0YWcsIG1vc3RseSB0aGUgb3JpZ2luYWwgdGFnIGluIHRoZSBwYWdlXG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gRE9NIGVsZW1lbnQgd2l0aCBfdGVtcGxfIG1lcmdlZCB0aHJvdWdoIGBZSUVMRGAgd2l0aCB0aGUgX2h0bWxfLlxuICAgKi9cbiAgZnVuY3Rpb24gX21rZG9tKHRlbXBsLCBodG1sKSB7XG4gICAgdmFyXG4gICAgICBtYXRjaCAgID0gdGVtcGwgJiYgdGVtcGwubWF0Y2goL15cXHMqPChbLVxcd10rKS8pLFxuICAgICAgdGFnTmFtZSA9IG1hdGNoICYmIG1hdGNoWzFdLnRvTG93ZXJDYXNlKCksXG4gICAgICBlbCA9IG1rRWwoJ2RpdicpXG5cbiAgICAvLyByZXBsYWNlIGFsbCB0aGUgeWllbGQgdGFncyB3aXRoIHRoZSB0YWcgaW5uZXIgaHRtbFxuICAgIHRlbXBsID0gcmVwbGFjZVlpZWxkKHRlbXBsLCBodG1sKVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAodGJsVGFncy50ZXN0KHRhZ05hbWUpKVxuICAgICAgZWwgPSBzcGVjaWFsVGFncyhlbCwgdGVtcGwsIHRhZ05hbWUpXG4gICAgZWxzZVxuICAgICAgZWwuaW5uZXJIVE1MID0gdGVtcGxcblxuICAgIGVsLnN0dWIgPSB0cnVlXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8qXG4gICAgQ3JlYXRlcyB0aGUgcm9vdCBlbGVtZW50IGZvciB0YWJsZSBvciBzZWxlY3QgY2hpbGQgZWxlbWVudHM6XG4gICAgdHIvdGgvdGQvdGhlYWQvdGZvb3QvdGJvZHkvY2FwdGlvbi9jb2wvY29sZ3JvdXAvb3B0aW9uL29wdGdyb3VwXG4gICovXG4gIGZ1bmN0aW9uIHNwZWNpYWxUYWdzKGVsLCB0ZW1wbCwgdGFnTmFtZSkge1xuICAgIHZhclxuICAgICAgc2VsZWN0ID0gdGFnTmFtZVswXSA9PT0gJ28nLFxuICAgICAgcGFyZW50ID0gc2VsZWN0ID8gJ3NlbGVjdD4nIDogJ3RhYmxlPidcblxuICAgIC8vIHRyaW0oKSBpcyBpbXBvcnRhbnQgaGVyZSwgdGhpcyBlbnN1cmVzIHdlIGRvbid0IGhhdmUgYXJ0aWZhY3RzLFxuICAgIC8vIHNvIHdlIGNhbiBjaGVjayBpZiB3ZSBoYXZlIG9ubHkgb25lIGVsZW1lbnQgaW5zaWRlIHRoZSBwYXJlbnRcbiAgICBlbC5pbm5lckhUTUwgPSAnPCcgKyBwYXJlbnQgKyB0ZW1wbC50cmltKCkgKyAnPC8nICsgcGFyZW50XG4gICAgcGFyZW50ID0gZWwuZmlyc3RDaGlsZFxuXG4gICAgLy8gcmV0dXJucyB0aGUgaW1tZWRpYXRlIHBhcmVudCBpZiB0ci90aC90ZC9jb2wgaXMgdGhlIG9ubHkgZWxlbWVudCwgaWYgbm90XG4gICAgLy8gcmV0dXJucyB0aGUgd2hvbGUgdHJlZSwgYXMgdGhpcyBjYW4gaW5jbHVkZSBhZGRpdGlvbmFsIGVsZW1lbnRzXG4gICAgaWYgKHNlbGVjdCkge1xuICAgICAgcGFyZW50LnNlbGVjdGVkSW5kZXggPSAtMSAgLy8gZm9yIElFOSwgY29tcGF0aWJsZSB3L2N1cnJlbnQgcmlvdCBiZWhhdmlvclxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdm9pZHMgaW5zZXJ0aW9uIG9mIGNvaW50YWluZXIgaW5zaWRlIGNvbnRhaW5lciAoZXg6IHRib2R5IGluc2lkZSB0Ym9keSlcbiAgICAgIHZhciB0bmFtZSA9IHJvb3RFbHNbdGFnTmFtZV1cbiAgICAgIGlmICh0bmFtZSAmJiBwYXJlbnQuY2hpbGRFbGVtZW50Q291bnQgPT09IDEpIHBhcmVudCA9ICQodG5hbWUsIHBhcmVudClcbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudFxuICB9XG5cbiAgLypcbiAgICBSZXBsYWNlIHRoZSB5aWVsZCB0YWcgZnJvbSBhbnkgdGFnIHRlbXBsYXRlIHdpdGggdGhlIGlubmVySFRNTCBvZiB0aGVcbiAgICBvcmlnaW5hbCB0YWcgaW4gdGhlIHBhZ2VcbiAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVlpZWxkKHRlbXBsLCBodG1sKSB7XG4gICAgLy8gZG8gbm90aGluZyBpZiBubyB5aWVsZFxuICAgIGlmICghcmVIYXNZaWVsZC50ZXN0KHRlbXBsKSkgcmV0dXJuIHRlbXBsXG5cbiAgICAvLyBiZSBjYXJlZnVsIHdpdGggIzEzNDMgLSBzdHJpbmcgb24gdGhlIHNvdXJjZSBoYXZpbmcgYCQxYFxuICAgIHZhciBzcmMgPSB7fVxuXG4gICAgaHRtbCA9IGh0bWwgJiYgaHRtbC5yZXBsYWNlKHJlWWllbGRTcmMsIGZ1bmN0aW9uIChfLCByZWYsIHRleHQpIHtcbiAgICAgIHNyY1tyZWZdID0gc3JjW3JlZl0gfHwgdGV4dCAgIC8vIHByZXNlcnZlIGZpcnN0IGRlZmluaXRpb25cbiAgICAgIHJldHVybiAnJ1xuICAgIH0pLnRyaW0oKVxuXG4gICAgcmV0dXJuIHRlbXBsXG4gICAgICAucmVwbGFjZShyZVlpZWxkRGVzdCwgZnVuY3Rpb24gKF8sIHJlZiwgZGVmKSB7ICAvLyB5aWVsZCB3aXRoIGZyb20gLSB0byBhdHRyc1xuICAgICAgICByZXR1cm4gc3JjW3JlZl0gfHwgZGVmIHx8ICcnXG4gICAgICB9KVxuICAgICAgLnJlcGxhY2UocmVZaWVsZEFsbCwgZnVuY3Rpb24gKF8sIGRlZikgeyAgICAgICAgLy8geWllbGQgd2l0aG91dCBhbnkgXCJmcm9tXCJcbiAgICAgICAgcmV0dXJuIGh0bWwgfHwgZGVmIHx8ICcnXG4gICAgICB9KVxuICB9XG5cbiAgcmV0dXJuIF9ta2RvbVxuXG59KSgpXG5cbi8qKlxuICogQ29udmVydCB0aGUgaXRlbSBsb29wZWQgaW50byBhbiBvYmplY3QgdXNlZCB0byBleHRlbmQgdGhlIGNoaWxkIHRhZyBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGV4cHIgLSBvYmplY3QgY29udGFpbmluZyB0aGUga2V5cyB1c2VkIHRvIGV4dGVuZCB0aGUgY2hpbGRyZW4gdGFnc1xuICogQHBhcmFtICAgeyAqIH0ga2V5IC0gdmFsdWUgdG8gYXNzaWduIHRvIHRoZSBuZXcgb2JqZWN0IHJldHVybmVkXG4gKiBAcGFyYW0gICB7ICogfSB2YWwgLSB2YWx1ZSBjb250YWluaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSBpbiB0aGUgYXJyYXlcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gLSBuZXcgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHZhbHVlcyBvZiB0aGUgb3JpZ2luYWwgaXRlbVxuICpcbiAqIFRoZSB2YXJpYWJsZXMgJ2tleScgYW5kICd2YWwnIGFyZSBhcmJpdHJhcnkuXG4gKiBUaGV5IGRlcGVuZCBvbiB0aGUgY29sbGVjdGlvbiB0eXBlIGxvb3BlZCAoQXJyYXksIE9iamVjdClcbiAqIGFuZCBvbiB0aGUgZXhwcmVzc2lvbiB1c2VkIG9uIHRoZSBlYWNoIHRhZ1xuICpcbiAqL1xuZnVuY3Rpb24gbWtpdGVtKGV4cHIsIGtleSwgdmFsKSB7XG4gIHZhciBpdGVtID0ge31cbiAgaXRlbVtleHByLmtleV0gPSBrZXlcbiAgaWYgKGV4cHIucG9zKSBpdGVtW2V4cHIucG9zXSA9IHZhbFxuICByZXR1cm4gaXRlbVxufVxuXG4vKipcbiAqIFVubW91bnQgdGhlIHJlZHVuZGFudCB0YWdzXG4gKiBAcGFyYW0gICB7IEFycmF5IH0gaXRlbXMgLSBhcnJheSBjb250YWluaW5nIHRoZSBjdXJyZW50IGl0ZW1zIHRvIGxvb3BcbiAqIEBwYXJhbSAgIHsgQXJyYXkgfSB0YWdzIC0gYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGNoaWxkcmVuIHRhZ3NcbiAqL1xuZnVuY3Rpb24gdW5tb3VudFJlZHVuZGFudChpdGVtcywgdGFncykge1xuXG4gIHZhciBpID0gdGFncy5sZW5ndGgsXG4gICAgaiA9IGl0ZW1zLmxlbmd0aCxcbiAgICB0XG5cbiAgd2hpbGUgKGkgPiBqKSB7XG4gICAgdCA9IHRhZ3NbLS1pXVxuICAgIHRhZ3Muc3BsaWNlKGksIDEpXG4gICAgdC51bm1vdW50KClcbiAgfVxufVxuXG4vKipcbiAqIE1vdmUgdGhlIG5lc3RlZCBjdXN0b20gdGFncyBpbiBub24gY3VzdG9tIGxvb3AgdGFnc1xuICogQHBhcmFtICAgeyBPYmplY3QgfSBjaGlsZCAtIG5vbiBjdXN0b20gbG9vcCB0YWdcbiAqIEBwYXJhbSAgIHsgTnVtYmVyIH0gaSAtIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGxvb3AgdGFnXG4gKi9cbmZ1bmN0aW9uIG1vdmVOZXN0ZWRUYWdzKGNoaWxkLCBpKSB7XG4gIE9iamVjdC5rZXlzKGNoaWxkLnRhZ3MpLmZvckVhY2goZnVuY3Rpb24odGFnTmFtZSkge1xuICAgIHZhciB0YWcgPSBjaGlsZC50YWdzW3RhZ05hbWVdXG4gICAgaWYgKGlzQXJyYXkodGFnKSlcbiAgICAgIGVhY2godGFnLCBmdW5jdGlvbiAodCkge1xuICAgICAgICBtb3ZlQ2hpbGRUYWcodCwgdGFnTmFtZSwgaSlcbiAgICAgIH0pXG4gICAgZWxzZVxuICAgICAgbW92ZUNoaWxkVGFnKHRhZywgdGFnTmFtZSwgaSlcbiAgfSlcbn1cblxuLyoqXG4gKiBBZGRzIHRoZSBlbGVtZW50cyBmb3IgYSB2aXJ0dWFsIHRhZ1xuICogQHBhcmFtIHsgVGFnIH0gdGFnIC0gdGhlIHRhZyB3aG9zZSByb290J3MgY2hpbGRyZW4gd2lsbCBiZSBpbnNlcnRlZCBvciBhcHBlbmRlZFxuICogQHBhcmFtIHsgTm9kZSB9IHNyYyAtIHRoZSBub2RlIHRoYXQgd2lsbCBkbyB0aGUgaW5zZXJ0aW5nIG9yIGFwcGVuZGluZ1xuICogQHBhcmFtIHsgVGFnIH0gdGFyZ2V0IC0gb25seSBpZiBpbnNlcnRpbmcsIGluc2VydCBiZWZvcmUgdGhpcyB0YWcncyBmaXJzdCBjaGlsZFxuICovXG5mdW5jdGlvbiBhZGRWaXJ0dWFsKHRhZywgc3JjLCB0YXJnZXQpIHtcbiAgdmFyIGVsID0gdGFnLl9yb290LCBzaWJcbiAgdGFnLl92aXJ0cyA9IFtdXG4gIHdoaWxlIChlbCkge1xuICAgIHNpYiA9IGVsLm5leHRTaWJsaW5nXG4gICAgaWYgKHRhcmdldClcbiAgICAgIHNyYy5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5fcm9vdClcbiAgICBlbHNlXG4gICAgICBzcmMuYXBwZW5kQ2hpbGQoZWwpXG5cbiAgICB0YWcuX3ZpcnRzLnB1c2goZWwpIC8vIGhvbGQgZm9yIHVubW91bnRpbmdcbiAgICBlbCA9IHNpYlxuICB9XG59XG5cbi8qKlxuICogTW92ZSB2aXJ0dWFsIHRhZyBhbmQgYWxsIGNoaWxkIG5vZGVzXG4gKiBAcGFyYW0geyBUYWcgfSB0YWcgLSBmaXJzdCBjaGlsZCByZWZlcmVuY2UgdXNlZCB0byBzdGFydCBtb3ZlXG4gKiBAcGFyYW0geyBOb2RlIH0gc3JjICAtIHRoZSBub2RlIHRoYXQgd2lsbCBkbyB0aGUgaW5zZXJ0aW5nXG4gKiBAcGFyYW0geyBUYWcgfSB0YXJnZXQgLSBpbnNlcnQgYmVmb3JlIHRoaXMgdGFnJ3MgZmlyc3QgY2hpbGRcbiAqIEBwYXJhbSB7IE51bWJlciB9IGxlbiAtIGhvdyBtYW55IGNoaWxkIG5vZGVzIHRvIG1vdmVcbiAqL1xuZnVuY3Rpb24gbW92ZVZpcnR1YWwodGFnLCBzcmMsIHRhcmdldCwgbGVuKSB7XG4gIHZhciBlbCA9IHRhZy5fcm9vdCwgc2liLCBpID0gMFxuICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgc2liID0gZWwubmV4dFNpYmxpbmdcbiAgICBzcmMuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuX3Jvb3QpXG4gICAgZWwgPSBzaWJcbiAgfVxufVxuXG5cbi8qKlxuICogTWFuYWdlIHRhZ3MgaGF2aW5nIHRoZSAnZWFjaCdcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gZG9tIC0gRE9NIG5vZGUgd2UgbmVlZCB0byBsb29wXG4gKiBAcGFyYW0gICB7IFRhZyB9IHBhcmVudCAtIHBhcmVudCB0YWcgaW5zdGFuY2Ugd2hlcmUgdGhlIGRvbSBub2RlIGlzIGNvbnRhaW5lZFxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBleHByIC0gc3RyaW5nIGNvbnRhaW5lZCBpbiB0aGUgJ2VhY2gnIGF0dHJpYnV0ZVxuICovXG5mdW5jdGlvbiBfZWFjaChkb20sIHBhcmVudCwgZXhwcikge1xuXG4gIC8vIHJlbW92ZSB0aGUgZWFjaCBwcm9wZXJ0eSBmcm9tIHRoZSBvcmlnaW5hbCB0YWdcbiAgcmVtQXR0cihkb20sICdlYWNoJylcblxuICB2YXIgbXVzdFJlb3JkZXIgPSB0eXBlb2YgZ2V0QXR0cihkb20sICduby1yZW9yZGVyJykgIT09IFRfU1RSSU5HIHx8IHJlbUF0dHIoZG9tLCAnbm8tcmVvcmRlcicpLFxuICAgIHRhZ05hbWUgPSBnZXRUYWdOYW1lKGRvbSksXG4gICAgaW1wbCA9IF9fdGFnSW1wbFt0YWdOYW1lXSB8fCB7IHRtcGw6IGRvbS5vdXRlckhUTUwgfSxcbiAgICB1c2VSb290ID0gU1BFQ0lBTF9UQUdTX1JFR0VYLnRlc3QodGFnTmFtZSksXG4gICAgcm9vdCA9IGRvbS5wYXJlbnROb2RlLFxuICAgIHJlZiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSxcbiAgICBjaGlsZCA9IGdldFRhZyhkb20pLFxuICAgIGlzT3B0aW9uID0gdGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnb3B0aW9uJywgLy8gdGhlIG9wdGlvbiB0YWdzIG11c3QgYmUgdHJlYXRlZCBkaWZmZXJlbnRseVxuICAgIHRhZ3MgPSBbXSxcbiAgICBvbGRJdGVtcyA9IFtdLFxuICAgIGhhc0tleXMsXG4gICAgaXNWaXJ0dWFsID0gZG9tLnRhZ05hbWUgPT0gJ1ZJUlRVQUwnXG5cbiAgLy8gcGFyc2UgdGhlIGVhY2ggZXhwcmVzc2lvblxuICBleHByID0gdG1wbC5sb29wS2V5cyhleHByKVxuXG4gIC8vIGluc2VydCBhIG1hcmtlZCB3aGVyZSB0aGUgbG9vcCB0YWdzIHdpbGwgYmUgaW5qZWN0ZWRcbiAgcm9vdC5pbnNlcnRCZWZvcmUocmVmLCBkb20pXG5cbiAgLy8gY2xlYW4gdGVtcGxhdGUgY29kZVxuICBwYXJlbnQub25lKCdiZWZvcmUtbW91bnQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyByZW1vdmUgdGhlIG9yaWdpbmFsIERPTSBub2RlXG4gICAgZG9tLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tKVxuICAgIGlmIChyb290LnN0dWIpIHJvb3QgPSBwYXJlbnQucm9vdFxuXG4gIH0pLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZ2V0IHRoZSBuZXcgaXRlbXMgY29sbGVjdGlvblxuICAgIHZhciBpdGVtcyA9IHRtcGwoZXhwci52YWwsIHBhcmVudCksXG4gICAgICAvLyBjcmVhdGUgYSBmcmFnbWVudCB0byBob2xkIHRoZSBuZXcgRE9NIG5vZGVzIHRvIGluamVjdCBpbiB0aGUgcGFyZW50IHRhZ1xuICAgICAgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXG4gICAgLy8gb2JqZWN0IGxvb3AuIGFueSBjaGFuZ2VzIGNhdXNlIGZ1bGwgcmVkcmF3XG4gICAgaWYgKCFpc0FycmF5KGl0ZW1zKSkge1xuICAgICAgaGFzS2V5cyA9IGl0ZW1zIHx8IGZhbHNlXG4gICAgICBpdGVtcyA9IGhhc0tleXMgP1xuICAgICAgICBPYmplY3Qua2V5cyhpdGVtcykubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICByZXR1cm4gbWtpdGVtKGV4cHIsIGtleSwgaXRlbXNba2V5XSlcbiAgICAgICAgfSkgOiBbXVxuICAgIH1cblxuICAgIC8vIGxvb3AgYWxsIHRoZSBuZXcgaXRlbXNcbiAgICB2YXIgaSA9IDAsXG4gICAgICBpdGVtc0xlbmd0aCA9IGl0ZW1zLmxlbmd0aFxuXG4gICAgZm9yICg7IGkgPCBpdGVtc0xlbmd0aDsgaSsrKSB7XG4gICAgICAvLyByZW9yZGVyIG9ubHkgaWYgdGhlIGl0ZW1zIGFyZSBvYmplY3RzXG4gICAgICB2YXJcbiAgICAgICAgaXRlbSA9IGl0ZW1zW2ldLFxuICAgICAgICBfbXVzdFJlb3JkZXIgPSBtdXN0UmVvcmRlciAmJiBpdGVtIGluc3RhbmNlb2YgT2JqZWN0ICYmICFoYXNLZXlzLFxuICAgICAgICBvbGRQb3MgPSBvbGRJdGVtcy5pbmRleE9mKGl0ZW0pLFxuICAgICAgICBwb3MgPSB+b2xkUG9zICYmIF9tdXN0UmVvcmRlciA/IG9sZFBvcyA6IGksXG4gICAgICAgIC8vIGRvZXMgYSB0YWcgZXhpc3QgaW4gdGhpcyBwb3NpdGlvbj9cbiAgICAgICAgdGFnID0gdGFnc1twb3NdXG5cbiAgICAgIGl0ZW0gPSAhaGFzS2V5cyAmJiBleHByLmtleSA/IG1raXRlbShleHByLCBpdGVtLCBpKSA6IGl0ZW1cblxuICAgICAgLy8gbmV3IHRhZ1xuICAgICAgaWYgKFxuICAgICAgICAhX211c3RSZW9yZGVyICYmICF0YWcgLy8gd2l0aCBuby1yZW9yZGVyIHdlIGp1c3QgdXBkYXRlIHRoZSBvbGQgdGFnc1xuICAgICAgICB8fFxuICAgICAgICBfbXVzdFJlb3JkZXIgJiYgIX5vbGRQb3MgfHwgIXRhZyAvLyBieSBkZWZhdWx0IHdlIGFsd2F5cyB0cnkgdG8gcmVvcmRlciB0aGUgRE9NIGVsZW1lbnRzXG4gICAgICApIHtcblxuICAgICAgICB0YWcgPSBuZXcgVGFnKGltcGwsIHtcbiAgICAgICAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICAgICAgICBpc0xvb3A6IHRydWUsXG4gICAgICAgICAgaGFzSW1wbDogISFfX3RhZ0ltcGxbdGFnTmFtZV0sXG4gICAgICAgICAgcm9vdDogdXNlUm9vdCA/IHJvb3QgOiBkb20uY2xvbmVOb2RlKCksXG4gICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICB9LCBkb20uaW5uZXJIVE1MKVxuXG4gICAgICAgIHRhZy5tb3VudCgpXG5cbiAgICAgICAgaWYgKGlzVmlydHVhbCkgdGFnLl9yb290ID0gdGFnLnJvb3QuZmlyc3RDaGlsZCAvLyBzYXZlIHJlZmVyZW5jZSBmb3IgZnVydGhlciBtb3ZlcyBvciBpbnNlcnRzXG4gICAgICAgIC8vIHRoaXMgdGFnIG11c3QgYmUgYXBwZW5kZWRcbiAgICAgICAgaWYgKGkgPT0gdGFncy5sZW5ndGggfHwgIXRhZ3NbaV0pIHsgLy8gZml4IDE1ODFcbiAgICAgICAgICBpZiAoaXNWaXJ0dWFsKVxuICAgICAgICAgICAgYWRkVmlydHVhbCh0YWcsIGZyYWcpXG4gICAgICAgICAgZWxzZSBmcmFnLmFwcGVuZENoaWxkKHRhZy5yb290KVxuICAgICAgICB9XG4gICAgICAgIC8vIHRoaXMgdGFnIG11c3QgYmUgaW5zZXJ0XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChpc1ZpcnR1YWwpXG4gICAgICAgICAgICBhZGRWaXJ0dWFsKHRhZywgcm9vdCwgdGFnc1tpXSlcbiAgICAgICAgICBlbHNlIHJvb3QuaW5zZXJ0QmVmb3JlKHRhZy5yb290LCB0YWdzW2ldLnJvb3QpIC8vICMxMzc0IHNvbWUgYnJvd3NlcnMgcmVzZXQgc2VsZWN0ZWQgaGVyZVxuICAgICAgICAgIG9sZEl0ZW1zLnNwbGljZShpLCAwLCBpdGVtKVxuICAgICAgICB9XG5cbiAgICAgICAgdGFncy5zcGxpY2UoaSwgMCwgdGFnKVxuICAgICAgICBwb3MgPSBpIC8vIGhhbmRsZWQgaGVyZSBzbyBubyBtb3ZlXG4gICAgICB9IGVsc2UgdGFnLnVwZGF0ZShpdGVtLCB0cnVlKVxuXG4gICAgICAvLyByZW9yZGVyIHRoZSB0YWcgaWYgaXQncyBub3QgbG9jYXRlZCBpbiBpdHMgcHJldmlvdXMgcG9zaXRpb25cbiAgICAgIGlmIChcbiAgICAgICAgcG9zICE9PSBpICYmIF9tdXN0UmVvcmRlciAmJlxuICAgICAgICB0YWdzW2ldIC8vIGZpeCAxNTgxIHVuYWJsZSB0byByZXByb2R1Y2UgaXQgaW4gYSB0ZXN0IVxuICAgICAgKSB7XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgRE9NXG4gICAgICAgIGlmIChpc1ZpcnR1YWwpXG4gICAgICAgICAgbW92ZVZpcnR1YWwodGFnLCByb290LCB0YWdzW2ldLCBkb20uY2hpbGROb2Rlcy5sZW5ndGgpXG4gICAgICAgIGVsc2Ugcm9vdC5pbnNlcnRCZWZvcmUodGFnLnJvb3QsIHRhZ3NbaV0ucm9vdClcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBwb3NpdGlvbiBhdHRyaWJ1dGUgaWYgaXQgZXhpc3RzXG4gICAgICAgIGlmIChleHByLnBvcylcbiAgICAgICAgICB0YWdbZXhwci5wb3NdID0gaVxuICAgICAgICAvLyBtb3ZlIHRoZSBvbGQgdGFnIGluc3RhbmNlXG4gICAgICAgIHRhZ3Muc3BsaWNlKGksIDAsIHRhZ3Muc3BsaWNlKHBvcywgMSlbMF0pXG4gICAgICAgIC8vIG1vdmUgdGhlIG9sZCBpdGVtXG4gICAgICAgIG9sZEl0ZW1zLnNwbGljZShpLCAwLCBvbGRJdGVtcy5zcGxpY2UocG9zLCAxKVswXSlcbiAgICAgICAgLy8gaWYgdGhlIGxvb3AgdGFncyBhcmUgbm90IGN1c3RvbVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIG1vdmUgYWxsIHRoZWlyIGN1c3RvbSB0YWdzIGludG8gdGhlIHJpZ2h0IHBvc2l0aW9uXG4gICAgICAgIGlmICghY2hpbGQgJiYgdGFnLnRhZ3MpIG1vdmVOZXN0ZWRUYWdzKHRhZywgaSlcbiAgICAgIH1cblxuICAgICAgLy8gY2FjaGUgdGhlIG9yaWdpbmFsIGl0ZW0gdG8gdXNlIGl0IGluIHRoZSBldmVudHMgYm91bmQgdG8gdGhpcyBub2RlXG4gICAgICAvLyBhbmQgaXRzIGNoaWxkcmVuXG4gICAgICB0YWcuX2l0ZW0gPSBpdGVtXG4gICAgICAvLyBjYWNoZSB0aGUgcmVhbCBwYXJlbnQgdGFnIGludGVybmFsbHlcbiAgICAgIGRlZmluZVByb3BlcnR5KHRhZywgJ19wYXJlbnQnLCBwYXJlbnQpXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIHRoZSByZWR1bmRhbnQgdGFnc1xuICAgIHVubW91bnRSZWR1bmRhbnQoaXRlbXMsIHRhZ3MpXG5cbiAgICAvLyBpbnNlcnQgdGhlIG5ldyBub2Rlc1xuICAgIGlmIChpc09wdGlvbikge1xuICAgICAgcm9vdC5hcHBlbmRDaGlsZChmcmFnKVxuXG4gICAgICAvLyAjMTM3NCA8c2VsZWN0PiA8b3B0aW9uIHNlbGVjdGVkPXt0cnVlfT4gPC9zZWxlY3Q+XG4gICAgICBpZiAocm9vdC5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHNpLCBvcCA9IHJvb3Qub3B0aW9uc1xuXG4gICAgICAgIHJvb3Quc2VsZWN0ZWRJbmRleCA9IHNpID0gLTFcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG9wLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG9wW2ldLnNlbGVjdGVkID0gb3BbaV0uX19zZWxlY3RlZCkge1xuICAgICAgICAgICAgaWYgKHNpIDwgMCkgcm9vdC5zZWxlY3RlZEluZGV4ID0gc2kgPSBpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Ugcm9vdC5pbnNlcnRCZWZvcmUoZnJhZywgcmVmKVxuXG4gICAgLy8gc2V0IHRoZSAndGFncycgcHJvcGVydHkgb2YgdGhlIHBhcmVudCB0YWdcbiAgICAvLyBpZiBjaGlsZCBpcyAndW5kZWZpbmVkJyBpdCBtZWFucyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gc2V0IHRoaXMgcHJvcGVydHlcbiAgICAvLyBmb3IgZXhhbXBsZTpcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHN0b3JlIHRoZSBgbXlUYWcudGFnc1snZGl2J11gIHByb3BlcnR5IGlmIHdlIGFyZSBsb29waW5nIGEgZGl2IHRhZ1xuICAgIC8vIGJ1dCB3ZSBuZWVkIHRvIHRyYWNrIHRoZSBgbXlUYWcudGFnc1snY2hpbGQnXWAgcHJvcGVydHkgbG9vcGluZyBhIGN1c3RvbSBjaGlsZCBub2RlIG5hbWVkIGBjaGlsZGBcbiAgICBpZiAoY2hpbGQpIHBhcmVudC50YWdzW3RhZ05hbWVdID0gdGFnc1xuXG4gICAgLy8gY2xvbmUgdGhlIGl0ZW1zIGFycmF5XG4gICAgb2xkSXRlbXMgPSBpdGVtcy5zbGljZSgpXG5cbiAgfSlcblxufVxuLyoqXG4gKiBPYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaW5qZWN0IGFuZCBtYW5hZ2UgdGhlIGNzcyBvZiBldmVyeSB0YWcgaW5zdGFuY2VcbiAqL1xudmFyIHN0eWxlTWFuYWdlciA9IChmdW5jdGlvbihfcmlvdCkge1xuXG4gIGlmICghd2luZG93KSByZXR1cm4geyAvLyBza2lwIGluamVjdGlvbiBvbiB0aGUgc2VydmVyXG4gICAgYWRkOiBmdW5jdGlvbiAoKSB7fSxcbiAgICBpbmplY3Q6IGZ1bmN0aW9uICgpIHt9XG4gIH1cblxuICB2YXIgc3R5bGVOb2RlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjcmVhdGUgYSBuZXcgc3R5bGUgZWxlbWVudCB3aXRoIHRoZSBjb3JyZWN0IHR5cGVcbiAgICB2YXIgbmV3Tm9kZSA9IG1rRWwoJ3N0eWxlJylcbiAgICBzZXRBdHRyKG5ld05vZGUsICd0eXBlJywgJ3RleHQvY3NzJylcblxuICAgIC8vIHJlcGxhY2UgYW55IHVzZXIgbm9kZSBvciBpbnNlcnQgdGhlIG5ldyBvbmUgaW50byB0aGUgaGVhZFxuICAgIHZhciB1c2VyTm9kZSA9ICQoJ3N0eWxlW3R5cGU9cmlvdF0nKVxuICAgIGlmICh1c2VyTm9kZSkge1xuICAgICAgaWYgKHVzZXJOb2RlLmlkKSBuZXdOb2RlLmlkID0gdXNlck5vZGUuaWRcbiAgICAgIHVzZXJOb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIHVzZXJOb2RlKVxuICAgIH1cbiAgICBlbHNlIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobmV3Tm9kZSlcblxuICAgIHJldHVybiBuZXdOb2RlXG4gIH0pKClcblxuICAvLyBDcmVhdGUgY2FjaGUgYW5kIHNob3J0Y3V0IHRvIHRoZSBjb3JyZWN0IHByb3BlcnR5XG4gIHZhciBjc3NUZXh0UHJvcCA9IHN0eWxlTm9kZS5zdHlsZVNoZWV0LFxuICAgIHN0eWxlc1RvSW5qZWN0ID0gJydcblxuICAvLyBFeHBvc2UgdGhlIHN0eWxlIG5vZGUgaW4gYSBub24tbW9kaWZpY2FibGUgcHJvcGVydHlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9yaW90LCAnc3R5bGVOb2RlJywge1xuICAgIHZhbHVlOiBzdHlsZU5vZGUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSlcblxuICAvKipcbiAgICogUHVibGljIGFwaVxuICAgKi9cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBTYXZlIGEgdGFnIHN0eWxlIHRvIGJlIGxhdGVyIGluamVjdGVkIGludG8gRE9NXG4gICAgICogQHBhcmFtICAgeyBTdHJpbmcgfSBjc3MgW2Rlc2NyaXB0aW9uXVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24oY3NzKSB7XG4gICAgICBzdHlsZXNUb0luamVjdCArPSBjc3NcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEluamVjdCBhbGwgcHJldmlvdXNseSBzYXZlZCB0YWcgc3R5bGVzIGludG8gRE9NXG4gICAgICogaW5uZXJIVE1MIHNlZW1zIHNsb3c6IGh0dHA6Ly9qc3BlcmYuY29tL3Jpb3QtaW5zZXJ0LXN0eWxlXG4gICAgICovXG4gICAgaW5qZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzdHlsZXNUb0luamVjdCkge1xuICAgICAgICBpZiAoY3NzVGV4dFByb3ApIGNzc1RleHRQcm9wLmNzc1RleHQgKz0gc3R5bGVzVG9JbmplY3RcbiAgICAgICAgZWxzZSBzdHlsZU5vZGUuaW5uZXJIVE1MICs9IHN0eWxlc1RvSW5qZWN0XG4gICAgICAgIHN0eWxlc1RvSW5qZWN0ID0gJydcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufSkocmlvdClcblxuXG5mdW5jdGlvbiBwYXJzZU5hbWVkRWxlbWVudHMocm9vdCwgdGFnLCBjaGlsZFRhZ3MsIGZvcmNlUGFyc2luZ05hbWVkKSB7XG5cbiAgd2Fsayhyb290LCBmdW5jdGlvbihkb20pIHtcbiAgICBpZiAoZG9tLm5vZGVUeXBlID09IDEpIHtcbiAgICAgIGRvbS5pc0xvb3AgPSBkb20uaXNMb29wIHx8XG4gICAgICAgICAgICAgICAgICAoZG9tLnBhcmVudE5vZGUgJiYgZG9tLnBhcmVudE5vZGUuaXNMb29wIHx8IGdldEF0dHIoZG9tLCAnZWFjaCcpKVxuICAgICAgICAgICAgICAgICAgICA/IDEgOiAwXG5cbiAgICAgIC8vIGN1c3RvbSBjaGlsZCB0YWdcbiAgICAgIGlmIChjaGlsZFRhZ3MpIHtcbiAgICAgICAgdmFyIGNoaWxkID0gZ2V0VGFnKGRvbSlcblxuICAgICAgICBpZiAoY2hpbGQgJiYgIWRvbS5pc0xvb3ApXG4gICAgICAgICAgY2hpbGRUYWdzLnB1c2goaW5pdENoaWxkVGFnKGNoaWxkLCB7cm9vdDogZG9tLCBwYXJlbnQ6IHRhZ30sIGRvbS5pbm5lckhUTUwsIHRhZykpXG4gICAgICB9XG5cbiAgICAgIGlmICghZG9tLmlzTG9vcCB8fCBmb3JjZVBhcnNpbmdOYW1lZClcbiAgICAgICAgc2V0TmFtZWQoZG9tLCB0YWcsIFtdKVxuICAgIH1cblxuICB9KVxuXG59XG5cbmZ1bmN0aW9uIHBhcnNlRXhwcmVzc2lvbnMocm9vdCwgdGFnLCBleHByZXNzaW9ucykge1xuXG4gIGZ1bmN0aW9uIGFkZEV4cHIoZG9tLCB2YWwsIGV4dHJhKSB7XG4gICAgaWYgKHRtcGwuaGFzRXhwcih2YWwpKSB7XG4gICAgICBleHByZXNzaW9ucy5wdXNoKGV4dGVuZCh7IGRvbTogZG9tLCBleHByOiB2YWwgfSwgZXh0cmEpKVxuICAgIH1cbiAgfVxuXG4gIHdhbGsocm9vdCwgZnVuY3Rpb24oZG9tKSB7XG4gICAgdmFyIHR5cGUgPSBkb20ubm9kZVR5cGUsXG4gICAgICBhdHRyXG5cbiAgICAvLyB0ZXh0IG5vZGVcbiAgICBpZiAodHlwZSA9PSAzICYmIGRvbS5wYXJlbnROb2RlLnRhZ05hbWUgIT0gJ1NUWUxFJykgYWRkRXhwcihkb20sIGRvbS5ub2RlVmFsdWUpXG4gICAgaWYgKHR5cGUgIT0gMSkgcmV0dXJuXG5cbiAgICAvKiBlbGVtZW50ICovXG5cbiAgICAvLyBsb29wXG4gICAgYXR0ciA9IGdldEF0dHIoZG9tLCAnZWFjaCcpXG5cbiAgICBpZiAoYXR0cikgeyBfZWFjaChkb20sIHRhZywgYXR0cik7IHJldHVybiBmYWxzZSB9XG5cbiAgICAvLyBhdHRyaWJ1dGUgZXhwcmVzc2lvbnNcbiAgICBlYWNoKGRvbS5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKSB7XG4gICAgICB2YXIgbmFtZSA9IGF0dHIubmFtZSxcbiAgICAgICAgYm9vbCA9IG5hbWUuc3BsaXQoJ19fJylbMV1cblxuICAgICAgYWRkRXhwcihkb20sIGF0dHIudmFsdWUsIHsgYXR0cjogYm9vbCB8fCBuYW1lLCBib29sOiBib29sIH0pXG4gICAgICBpZiAoYm9vbCkgeyByZW1BdHRyKGRvbSwgbmFtZSk7IHJldHVybiBmYWxzZSB9XG5cbiAgICB9KVxuXG4gICAgLy8gc2tpcCBjdXN0b20gdGFnc1xuICAgIGlmIChnZXRUYWcoZG9tKSkgcmV0dXJuIGZhbHNlXG5cbiAgfSlcblxufVxuZnVuY3Rpb24gVGFnKGltcGwsIGNvbmYsIGlubmVySFRNTCkge1xuXG4gIHZhciBzZWxmID0gcmlvdC5vYnNlcnZhYmxlKHRoaXMpLFxuICAgIG9wdHMgPSBpbmhlcml0KGNvbmYub3B0cykgfHwge30sXG4gICAgcGFyZW50ID0gY29uZi5wYXJlbnQsXG4gICAgaXNMb29wID0gY29uZi5pc0xvb3AsXG4gICAgaGFzSW1wbCA9IGNvbmYuaGFzSW1wbCxcbiAgICBpdGVtID0gY2xlYW5VcERhdGEoY29uZi5pdGVtKSxcbiAgICBleHByZXNzaW9ucyA9IFtdLFxuICAgIGNoaWxkVGFncyA9IFtdLFxuICAgIHJvb3QgPSBjb25mLnJvb3QsXG4gICAgdGFnTmFtZSA9IHJvb3QudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgIGF0dHIgPSB7fSxcbiAgICBpbXBsQXR0ciA9IHt9LFxuICAgIHByb3BzSW5TeW5jV2l0aFBhcmVudCA9IFtdLFxuICAgIGRvbVxuXG4gIC8vIG9ubHkgY2FsbCB1bm1vdW50IGlmIHdlIGhhdmUgYSB2YWxpZCBfX3RhZ0ltcGwgKGhhcyBuYW1lIHByb3BlcnR5KVxuICBpZiAoaW1wbC5uYW1lICYmIHJvb3QuX3RhZykgcm9vdC5fdGFnLnVubW91bnQodHJ1ZSlcblxuICAvLyBub3QgeWV0IG1vdW50ZWRcbiAgdGhpcy5pc01vdW50ZWQgPSBmYWxzZVxuICByb290LmlzTG9vcCA9IGlzTG9vcFxuXG4gIC8vIGtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIHRhZyBqdXN0IGNyZWF0ZWRcbiAgLy8gc28gd2Ugd2lsbCBiZSBhYmxlIHRvIG1vdW50IHRoaXMgdGFnIG11bHRpcGxlIHRpbWVzXG4gIHJvb3QuX3RhZyA9IHRoaXNcblxuICAvLyBjcmVhdGUgYSB1bmlxdWUgaWQgdG8gdGhpcyB0YWdcbiAgLy8gaXQgY291bGQgYmUgaGFuZHkgdG8gdXNlIGl0IGFsc28gdG8gaW1wcm92ZSB0aGUgdmlydHVhbCBkb20gcmVuZGVyaW5nIHNwZWVkXG4gIGRlZmluZVByb3BlcnR5KHRoaXMsICdfcmlvdF9pZCcsICsrX191aWQpIC8vIGJhc2UgMSBhbGxvd3MgdGVzdCAhdC5fcmlvdF9pZFxuXG4gIGV4dGVuZCh0aGlzLCB7IHBhcmVudDogcGFyZW50LCByb290OiByb290LCBvcHRzOiBvcHRzLCB0YWdzOiB7fSB9LCBpdGVtKVxuXG4gIC8vIGdyYWIgYXR0cmlidXRlc1xuICBlYWNoKHJvb3QuYXR0cmlidXRlcywgZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgdmFsID0gZWwudmFsdWVcbiAgICAvLyByZW1lbWJlciBhdHRyaWJ1dGVzIHdpdGggZXhwcmVzc2lvbnMgb25seVxuICAgIGlmICh0bXBsLmhhc0V4cHIodmFsKSkgYXR0cltlbC5uYW1lXSA9IHZhbFxuICB9KVxuXG4gIGRvbSA9IG1rZG9tKGltcGwudG1wbCwgaW5uZXJIVE1MKVxuXG4gIC8vIG9wdGlvbnNcbiAgZnVuY3Rpb24gdXBkYXRlT3B0cygpIHtcbiAgICB2YXIgY3R4ID0gaGFzSW1wbCAmJiBpc0xvb3AgPyBzZWxmIDogcGFyZW50IHx8IHNlbGZcblxuICAgIC8vIHVwZGF0ZSBvcHRzIGZyb20gY3VycmVudCBET00gYXR0cmlidXRlc1xuICAgIGVhY2gocm9vdC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihlbCkge1xuICAgICAgdmFyIHZhbCA9IGVsLnZhbHVlXG4gICAgICBvcHRzW3RvQ2FtZWwoZWwubmFtZSldID0gdG1wbC5oYXNFeHByKHZhbCkgPyB0bXBsKHZhbCwgY3R4KSA6IHZhbFxuICAgIH0pXG4gICAgLy8gcmVjb3ZlciB0aG9zZSB3aXRoIGV4cHJlc3Npb25zXG4gICAgZWFjaChPYmplY3Qua2V5cyhhdHRyKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgb3B0c1t0b0NhbWVsKG5hbWUpXSA9IHRtcGwoYXR0cltuYW1lXSwgY3R4KVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVEYXRhKGRhdGEpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gaXRlbSkge1xuICAgICAgaWYgKHR5cGVvZiBzZWxmW2tleV0gIT09IFRfVU5ERUYgJiYgaXNXcml0YWJsZShzZWxmLCBrZXkpKVxuICAgICAgICBzZWxmW2tleV0gPSBkYXRhW2tleV1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbmhlcml0RnJvbVBhcmVudCAoKSB7XG4gICAgaWYgKCFzZWxmLnBhcmVudCB8fCAhaXNMb29wKSByZXR1cm5cbiAgICBlYWNoKE9iamVjdC5rZXlzKHNlbGYucGFyZW50KSwgZnVuY3Rpb24oaykge1xuICAgICAgLy8gc29tZSBwcm9wZXJ0aWVzIG11c3QgYmUgYWx3YXlzIGluIHN5bmMgd2l0aCB0aGUgcGFyZW50IHRhZ1xuICAgICAgdmFyIG11c3RTeW5jID0gIWNvbnRhaW5zKFJFU0VSVkVEX1dPUkRTX0JMQUNLTElTVCwgaykgJiYgY29udGFpbnMocHJvcHNJblN5bmNXaXRoUGFyZW50LCBrKVxuICAgICAgaWYgKHR5cGVvZiBzZWxmW2tdID09PSBUX1VOREVGIHx8IG11c3RTeW5jKSB7XG4gICAgICAgIC8vIHRyYWNrIHRoZSBwcm9wZXJ0eSB0byBrZWVwIGluIHN5bmNcbiAgICAgICAgLy8gc28gd2UgY2FuIGtlZXAgaXQgdXBkYXRlZFxuICAgICAgICBpZiAoIW11c3RTeW5jKSBwcm9wc0luU3luY1dpdGhQYXJlbnQucHVzaChrKVxuICAgICAgICBzZWxmW2tdID0gc2VsZi5wYXJlbnRba11cbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgdGFnIGV4cHJlc3Npb25zIGFuZCBvcHRpb25zXG4gICAqIEBwYXJhbSAgIHsgKiB9ICBkYXRhIC0gZGF0YSB3ZSB3YW50IHRvIHVzZSB0byBleHRlbmQgdGhlIHRhZyBwcm9wZXJ0aWVzXG4gICAqIEBwYXJhbSAgIHsgQm9vbGVhbiB9IGlzSW5oZXJpdGVkIC0gaXMgdGhpcyB1cGRhdGUgY29taW5nIGZyb20gYSBwYXJlbnQgdGFnP1xuICAgKiBAcmV0dXJucyB7IHNlbGYgfVxuICAgKi9cbiAgZGVmaW5lUHJvcGVydHkodGhpcywgJ3VwZGF0ZScsIGZ1bmN0aW9uKGRhdGEsIGlzSW5oZXJpdGVkKSB7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhlIGRhdGEgcGFzc2VkIHdpbGwgbm90IG92ZXJyaWRlXG4gICAgLy8gdGhlIGNvbXBvbmVudCBjb3JlIG1ldGhvZHNcbiAgICBkYXRhID0gY2xlYW5VcERhdGEoZGF0YSlcbiAgICAvLyBpbmhlcml0IHByb3BlcnRpZXMgZnJvbSB0aGUgcGFyZW50XG4gICAgaW5oZXJpdEZyb21QYXJlbnQoKVxuICAgIC8vIG5vcm1hbGl6ZSB0aGUgdGFnIHByb3BlcnRpZXMgaW4gY2FzZSBhbiBpdGVtIG9iamVjdCB3YXMgaW5pdGlhbGx5IHBhc3NlZFxuICAgIGlmIChkYXRhICYmIGlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICBub3JtYWxpemVEYXRhKGRhdGEpXG4gICAgICBpdGVtID0gZGF0YVxuICAgIH1cbiAgICBleHRlbmQoc2VsZiwgZGF0YSlcbiAgICB1cGRhdGVPcHRzKClcbiAgICBzZWxmLnRyaWdnZXIoJ3VwZGF0ZScsIGRhdGEpXG4gICAgdXBkYXRlKGV4cHJlc3Npb25zLCBzZWxmKVxuXG4gICAgLy8gdGhlIHVwZGF0ZWQgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWRcbiAgICAvLyBvbmNlIHRoZSBET00gd2lsbCBiZSByZWFkeSBhbmQgYWxsIHRoZSByZS1mbG93cyBhcmUgY29tcGxldGVkXG4gICAgLy8gdGhpcyBpcyB1c2VmdWwgaWYgeW91IHdhbnQgdG8gZ2V0IHRoZSBcInJlYWxcIiByb290IHByb3BlcnRpZXNcbiAgICAvLyA0IGV4OiByb290Lm9mZnNldFdpZHRoIC4uLlxuICAgIGlmIChpc0luaGVyaXRlZCAmJiBzZWxmLnBhcmVudClcbiAgICAgIC8vIGNsb3NlcyAjMTU5OVxuICAgICAgc2VsZi5wYXJlbnQub25lKCd1cGRhdGVkJywgZnVuY3Rpb24oKSB7IHNlbGYudHJpZ2dlcigndXBkYXRlZCcpIH0pXG4gICAgZWxzZSByQUYoZnVuY3Rpb24oKSB7IHNlbGYudHJpZ2dlcigndXBkYXRlZCcpIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9KVxuXG4gIGRlZmluZVByb3BlcnR5KHRoaXMsICdtaXhpbicsIGZ1bmN0aW9uKCkge1xuICAgIGVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihtaXgpIHtcbiAgICAgIHZhciBpbnN0YW5jZVxuXG4gICAgICBtaXggPSB0eXBlb2YgbWl4ID09PSBUX1NUUklORyA/IHJpb3QubWl4aW4obWl4KSA6IG1peFxuXG4gICAgICAvLyBjaGVjayBpZiB0aGUgbWl4aW4gaXMgYSBmdW5jdGlvblxuICAgICAgaWYgKGlzRnVuY3Rpb24obWl4KSkge1xuICAgICAgICAvLyBjcmVhdGUgdGhlIG5ldyBtaXhpbiBpbnN0YW5jZVxuICAgICAgICBpbnN0YW5jZSA9IG5ldyBtaXgoKVxuICAgICAgICAvLyBzYXZlIHRoZSBwcm90b3R5cGUgdG8gbG9vcCBpdCBhZnRlcndhcmRzXG4gICAgICAgIG1peCA9IG1peC5wcm90b3R5cGVcbiAgICAgIH0gZWxzZSBpbnN0YW5jZSA9IG1peFxuXG4gICAgICAvLyBsb29wIHRoZSBrZXlzIGluIHRoZSBmdW5jdGlvbiBwcm90b3R5cGUgb3IgdGhlIGFsbCBvYmplY3Qga2V5c1xuICAgICAgZWFjaChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhtaXgpLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgLy8gYmluZCBtZXRob2RzIHRvIHNlbGZcbiAgICAgICAgaWYgKGtleSAhPSAnaW5pdCcpXG4gICAgICAgICAgc2VsZltrZXldID0gaXNGdW5jdGlvbihpbnN0YW5jZVtrZXldKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldLmJpbmQoc2VsZikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XVxuICAgICAgfSlcblxuICAgICAgLy8gaW5pdCBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgYXV0b21hdGljYWxseVxuICAgICAgaWYgKGluc3RhbmNlLmluaXQpIGluc3RhbmNlLmluaXQuYmluZChzZWxmKSgpXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9KVxuXG4gIGRlZmluZVByb3BlcnR5KHRoaXMsICdtb3VudCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgdXBkYXRlT3B0cygpXG5cbiAgICAvLyBhZGQgZ2xvYmFsIG1peGluXG4gICAgdmFyIGdsb2JhbE1peGluID0gcmlvdC5taXhpbihHTE9CQUxfTUlYSU4pXG4gICAgaWYgKGdsb2JhbE1peGluKSBzZWxmLm1peGluKGdsb2JhbE1peGluKVxuXG4gICAgLy8gaW5pdGlhbGlhdGlvblxuICAgIGlmIChpbXBsLmZuKSBpbXBsLmZuLmNhbGwoc2VsZiwgb3B0cylcblxuICAgIC8vIHBhcnNlIGxheW91dCBhZnRlciBpbml0LiBmbiBtYXkgY2FsY3VsYXRlIGFyZ3MgZm9yIG5lc3RlZCBjdXN0b20gdGFnc1xuICAgIHBhcnNlRXhwcmVzc2lvbnMoZG9tLCBzZWxmLCBleHByZXNzaW9ucylcblxuICAgIC8vIG1vdW50IHRoZSBjaGlsZCB0YWdzXG4gICAgdG9nZ2xlKHRydWUpXG5cbiAgICAvLyB1cGRhdGUgdGhlIHJvb3QgYWRkaW5nIGN1c3RvbSBhdHRyaWJ1dGVzIGNvbWluZyBmcm9tIHRoZSBjb21waWxlclxuICAgIC8vIGl0IGZpeGVzIGFsc28gIzEwODdcbiAgICBpZiAoaW1wbC5hdHRycylcbiAgICAgIHdhbGtBdHRyaWJ1dGVzKGltcGwuYXR0cnMsIGZ1bmN0aW9uIChrLCB2KSB7IHNldEF0dHIocm9vdCwgaywgdikgfSlcbiAgICBpZiAoaW1wbC5hdHRycyB8fCBoYXNJbXBsKVxuICAgICAgcGFyc2VFeHByZXNzaW9ucyhzZWxmLnJvb3QsIHNlbGYsIGV4cHJlc3Npb25zKVxuXG4gICAgaWYgKCFzZWxmLnBhcmVudCB8fCBpc0xvb3ApIHNlbGYudXBkYXRlKGl0ZW0pXG5cbiAgICAvLyBpbnRlcm5hbCB1c2Ugb25seSwgZml4ZXMgIzQwM1xuICAgIHNlbGYudHJpZ2dlcignYmVmb3JlLW1vdW50JylcblxuICAgIGlmIChpc0xvb3AgJiYgIWhhc0ltcGwpIHtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcm9vdCBhdHRyaWJ1dGUgZm9yIHRoZSBsb29wZWQgZWxlbWVudHNcbiAgICAgIHJvb3QgPSBkb20uZmlyc3RDaGlsZFxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIHJvb3QuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpXG4gICAgICBpZiAocm9vdC5zdHViKSByb290ID0gcGFyZW50LnJvb3RcbiAgICB9XG5cbiAgICBkZWZpbmVQcm9wZXJ0eShzZWxmLCAncm9vdCcsIHJvb3QpXG5cbiAgICAvLyBwYXJzZSB0aGUgbmFtZWQgZG9tIG5vZGVzIGluIHRoZSBsb29wZWQgY2hpbGRcbiAgICAvLyBhZGRpbmcgdGhlbSB0byB0aGUgcGFyZW50IGFzIHdlbGxcbiAgICBpZiAoaXNMb29wKVxuICAgICAgcGFyc2VOYW1lZEVsZW1lbnRzKHNlbGYucm9vdCwgc2VsZi5wYXJlbnQsIG51bGwsIHRydWUpXG5cbiAgICAvLyBpZiBpdCdzIG5vdCBhIGNoaWxkIHRhZyB3ZSBjYW4gdHJpZ2dlciBpdHMgbW91bnQgZXZlbnRcbiAgICBpZiAoIXNlbGYucGFyZW50IHx8IHNlbGYucGFyZW50LmlzTW91bnRlZCkge1xuICAgICAgc2VsZi5pc01vdW50ZWQgPSB0cnVlXG4gICAgICBzZWxmLnRyaWdnZXIoJ21vdW50JylcbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlIHdlIG5lZWQgdG8gd2FpdCB0aGF0IHRoZSBwYXJlbnQgZXZlbnQgZ2V0cyB0cmlnZ2VyZWRcbiAgICBlbHNlIHNlbGYucGFyZW50Lm9uZSgnbW91bnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGF2b2lkIHRvIHRyaWdnZXIgdGhlIGBtb3VudGAgZXZlbnQgZm9yIHRoZSB0YWdzXG4gICAgICAvLyBub3QgdmlzaWJsZSBpbmNsdWRlZCBpbiBhbiBpZiBzdGF0ZW1lbnRcbiAgICAgIGlmICghaXNJblN0dWIoc2VsZi5yb290KSkge1xuICAgICAgICBzZWxmLnBhcmVudC5pc01vdW50ZWQgPSBzZWxmLmlzTW91bnRlZCA9IHRydWVcbiAgICAgICAgc2VsZi50cmlnZ2VyKCdtb3VudCcpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuXG4gIGRlZmluZVByb3BlcnR5KHRoaXMsICd1bm1vdW50JywgZnVuY3Rpb24oa2VlcFJvb3RUYWcpIHtcbiAgICB2YXIgZWwgPSByb290LFxuICAgICAgcCA9IGVsLnBhcmVudE5vZGUsXG4gICAgICBwdGFnLFxuICAgICAgdGFnSW5kZXggPSBfX3ZpcnR1YWxEb20uaW5kZXhPZihzZWxmKVxuXG4gICAgc2VsZi50cmlnZ2VyKCdiZWZvcmUtdW5tb3VudCcpXG5cbiAgICAvLyByZW1vdmUgdGhpcyB0YWcgaW5zdGFuY2UgZnJvbSB0aGUgZ2xvYmFsIHZpcnR1YWxEb20gdmFyaWFibGVcbiAgICBpZiAofnRhZ0luZGV4KVxuICAgICAgX192aXJ0dWFsRG9tLnNwbGljZSh0YWdJbmRleCwgMSlcblxuICAgIGlmICh0aGlzLl92aXJ0cykge1xuICAgICAgZWFjaCh0aGlzLl92aXJ0cywgZnVuY3Rpb24odikge1xuICAgICAgICBpZiAodi5wYXJlbnROb2RlKSB2LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodilcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHApIHtcblxuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBwdGFnID0gZ2V0SW1tZWRpYXRlQ3VzdG9tUGFyZW50VGFnKHBhcmVudClcbiAgICAgICAgLy8gcmVtb3ZlIHRoaXMgdGFnIGZyb20gdGhlIHBhcmVudCB0YWdzIG9iamVjdFxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbmVzdGVkIHRhZ3Mgd2l0aCBzYW1lIG5hbWUuLlxuICAgICAgICAvLyByZW1vdmUgdGhpcyBlbGVtZW50IGZvcm0gdGhlIGFycmF5XG4gICAgICAgIGlmIChpc0FycmF5KHB0YWcudGFnc1t0YWdOYW1lXSkpXG4gICAgICAgICAgZWFjaChwdGFnLnRhZ3NbdGFnTmFtZV0sIGZ1bmN0aW9uKHRhZywgaSkge1xuICAgICAgICAgICAgaWYgKHRhZy5fcmlvdF9pZCA9PSBzZWxmLl9yaW90X2lkKVxuICAgICAgICAgICAgICBwdGFnLnRhZ3NbdGFnTmFtZV0uc3BsaWNlKGksIDEpXG4gICAgICAgICAgfSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIC8vIG90aGVyd2lzZSBqdXN0IGRlbGV0ZSB0aGUgdGFnIGluc3RhbmNlXG4gICAgICAgICAgcHRhZy50YWdzW3RhZ05hbWVdID0gdW5kZWZpbmVkXG4gICAgICB9XG5cbiAgICAgIGVsc2VcbiAgICAgICAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIGVsLnJlbW92ZUNoaWxkKGVsLmZpcnN0Q2hpbGQpXG5cbiAgICAgIGlmICgha2VlcFJvb3RUYWcpXG4gICAgICAgIHAucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICBlbHNlXG4gICAgICAgIC8vIHRoZSByaW90LXRhZyBhdHRyaWJ1dGUgaXNuJ3QgbmVlZGVkIGFueW1vcmUsIHJlbW92ZSBpdFxuICAgICAgICByZW1BdHRyKHAsICdyaW90LXRhZycpXG4gICAgfVxuXG5cbiAgICBzZWxmLnRyaWdnZXIoJ3VubW91bnQnKVxuICAgIHRvZ2dsZSgpXG4gICAgc2VsZi5vZmYoJyonKVxuICAgIHNlbGYuaXNNb3VudGVkID0gZmFsc2VcbiAgICBkZWxldGUgcm9vdC5fdGFnXG5cbiAgfSlcblxuICAvLyBwcm94eSBmdW5jdGlvbiB0byBiaW5kIHVwZGF0ZXNcbiAgLy8gZGlzcGF0Y2hlZCBmcm9tIGEgcGFyZW50IHRhZ1xuICBmdW5jdGlvbiBvbkNoaWxkVXBkYXRlKGRhdGEpIHsgc2VsZi51cGRhdGUoZGF0YSwgdHJ1ZSkgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZShpc01vdW50KSB7XG5cbiAgICAvLyBtb3VudC91bm1vdW50IGNoaWxkcmVuXG4gICAgZWFjaChjaGlsZFRhZ3MsIGZ1bmN0aW9uKGNoaWxkKSB7IGNoaWxkW2lzTW91bnQgPyAnbW91bnQnIDogJ3VubW91bnQnXSgpIH0pXG5cbiAgICAvLyBsaXN0ZW4vdW5saXN0ZW4gcGFyZW50IChldmVudHMgZmxvdyBvbmUgd2F5IGZyb20gcGFyZW50IHRvIGNoaWxkcmVuKVxuICAgIGlmICghcGFyZW50KSByZXR1cm5cbiAgICB2YXIgZXZ0ID0gaXNNb3VudCA/ICdvbicgOiAnb2ZmJ1xuXG4gICAgLy8gdGhlIGxvb3AgdGFncyB3aWxsIGJlIGFsd2F5cyBpbiBzeW5jIHdpdGggdGhlIHBhcmVudCBhdXRvbWF0aWNhbGx5XG4gICAgaWYgKGlzTG9vcClcbiAgICAgIHBhcmVudFtldnRdKCd1bm1vdW50Jywgc2VsZi51bm1vdW50KVxuICAgIGVsc2Uge1xuICAgICAgcGFyZW50W2V2dF0oJ3VwZGF0ZScsIG9uQ2hpbGRVcGRhdGUpW2V2dF0oJ3VubW91bnQnLCBzZWxmLnVubW91bnQpXG4gICAgfVxuICB9XG5cblxuICAvLyBuYW1lZCBlbGVtZW50cyBhdmFpbGFibGUgZm9yIGZuXG4gIHBhcnNlTmFtZWRFbGVtZW50cyhkb20sIHRoaXMsIGNoaWxkVGFncylcblxufVxuLyoqXG4gKiBBdHRhY2ggYW4gZXZlbnQgdG8gYSBET00gbm9kZVxuICogQHBhcmFtIHsgU3RyaW5nIH0gbmFtZSAtIGV2ZW50IG5hbWVcbiAqIEBwYXJhbSB7IEZ1bmN0aW9uIH0gaGFuZGxlciAtIGV2ZW50IGNhbGxiYWNrXG4gKiBAcGFyYW0geyBPYmplY3QgfSBkb20gLSBkb20gbm9kZVxuICogQHBhcmFtIHsgVGFnIH0gdGFnIC0gdGFnIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIHNldEV2ZW50SGFuZGxlcihuYW1lLCBoYW5kbGVyLCBkb20sIHRhZykge1xuXG4gIGRvbVtuYW1lXSA9IGZ1bmN0aW9uKGUpIHtcblxuICAgIHZhciBwdGFnID0gdGFnLl9wYXJlbnQsXG4gICAgICBpdGVtID0gdGFnLl9pdGVtLFxuICAgICAgZWxcblxuICAgIGlmICghaXRlbSlcbiAgICAgIHdoaWxlIChwdGFnICYmICFpdGVtKSB7XG4gICAgICAgIGl0ZW0gPSBwdGFnLl9pdGVtXG4gICAgICAgIHB0YWcgPSBwdGFnLl9wYXJlbnRcbiAgICAgIH1cblxuICAgIC8vIGNyb3NzIGJyb3dzZXIgZXZlbnQgZml4XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG5cbiAgICAvLyBvdmVycmlkZSB0aGUgZXZlbnQgcHJvcGVydGllc1xuICAgIGlmIChpc1dyaXRhYmxlKGUsICdjdXJyZW50VGFyZ2V0JykpIGUuY3VycmVudFRhcmdldCA9IGRvbVxuICAgIGlmIChpc1dyaXRhYmxlKGUsICd0YXJnZXQnKSkgZS50YXJnZXQgPSBlLnNyY0VsZW1lbnRcbiAgICBpZiAoaXNXcml0YWJsZShlLCAnd2hpY2gnKSkgZS53aGljaCA9IGUuY2hhckNvZGUgfHwgZS5rZXlDb2RlXG5cbiAgICBlLml0ZW0gPSBpdGVtXG5cbiAgICAvLyBwcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3VyIChieSBkZWZhdWx0KVxuICAgIGlmIChoYW5kbGVyLmNhbGwodGFnLCBlKSAhPT0gdHJ1ZSAmJiAhL3JhZGlvfGNoZWNrLy50ZXN0KGRvbS50eXBlKSkge1xuICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCFlLnByZXZlbnRVcGRhdGUpIHtcbiAgICAgIGVsID0gaXRlbSA/IGdldEltbWVkaWF0ZUN1c3RvbVBhcmVudFRhZyhwdGFnKSA6IHRhZ1xuICAgICAgZWwudXBkYXRlKClcbiAgICB9XG5cbiAgfVxuXG59XG5cblxuLyoqXG4gKiBJbnNlcnQgYSBET00gbm9kZSByZXBsYWNpbmcgYW5vdGhlciBvbmUgKHVzZWQgYnkgaWYtIGF0dHJpYnV0ZSlcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gcm9vdCAtIHBhcmVudCBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IG5vZGUgLSBub2RlIHJlcGxhY2VkXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGJlZm9yZSAtIG5vZGUgYWRkZWRcbiAqL1xuZnVuY3Rpb24gaW5zZXJ0VG8ocm9vdCwgbm9kZSwgYmVmb3JlKSB7XG4gIGlmICghcm9vdCkgcmV0dXJuXG4gIHJvb3QuaW5zZXJ0QmVmb3JlKGJlZm9yZSwgbm9kZSlcbiAgcm9vdC5yZW1vdmVDaGlsZChub2RlKVxufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZXhwcmVzc2lvbnMgaW4gYSBUYWcgaW5zdGFuY2VcbiAqIEBwYXJhbSAgIHsgQXJyYXkgfSBleHByZXNzaW9ucyAtIGV4cHJlc3Npb24gdGhhdCBtdXN0IGJlIHJlIGV2YWx1YXRlZFxuICogQHBhcmFtICAgeyBUYWcgfSB0YWcgLSB0YWcgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gdXBkYXRlKGV4cHJlc3Npb25zLCB0YWcpIHtcblxuICBlYWNoKGV4cHJlc3Npb25zLCBmdW5jdGlvbihleHByLCBpKSB7XG5cbiAgICB2YXIgZG9tID0gZXhwci5kb20sXG4gICAgICBhdHRyTmFtZSA9IGV4cHIuYXR0cixcbiAgICAgIHZhbHVlID0gdG1wbChleHByLmV4cHIsIHRhZyksXG4gICAgICBwYXJlbnQgPSBleHByLmRvbS5wYXJlbnROb2RlXG5cbiAgICBpZiAoZXhwci5ib29sKSB7XG4gICAgICB2YWx1ZSA9ICEhdmFsdWVcbiAgICAgIGlmIChhdHRyTmFtZSA9PT0gJ3NlbGVjdGVkJykgZG9tLl9fc2VsZWN0ZWQgPSB2YWx1ZSAgIC8vICMxMzc0XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICB2YWx1ZSA9ICcnXG5cbiAgICAvLyAjMTYzODogcmVncmVzc2lvbiBvZiAjMTYxMiwgdXBkYXRlIHRoZSBkb20gb25seSBpZiB0aGUgdmFsdWUgb2YgdGhlXG4gICAgLy8gZXhwcmVzc2lvbiB3YXMgY2hhbmdlZFxuICAgIGlmIChleHByLnZhbHVlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGV4cHIudmFsdWUgPSB2YWx1ZVxuXG4gICAgLy8gdGV4dGFyZWEgYW5kIHRleHQgbm9kZXMgaGFzIG5vIGF0dHJpYnV0ZSBuYW1lXG4gICAgaWYgKCFhdHRyTmFtZSkge1xuICAgICAgLy8gYWJvdXQgIzgxNSB3L28gcmVwbGFjZTogdGhlIGJyb3dzZXIgY29udmVydHMgdGhlIHZhbHVlIHRvIGEgc3RyaW5nLFxuICAgICAgLy8gdGhlIGNvbXBhcmlzb24gYnkgXCI9PVwiIGRvZXMgdG9vLCBidXQgbm90IGluIHRoZSBzZXJ2ZXJcbiAgICAgIHZhbHVlICs9ICcnXG4gICAgICAvLyB0ZXN0IGZvciBwYXJlbnQgYXZvaWRzIGVycm9yIHdpdGggaW52YWxpZCBhc3NpZ25tZW50IHRvIG5vZGVWYWx1ZVxuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICBwYXJlbnQudmFsdWUgPSB2YWx1ZSAgICAgICAgICAgICAgICAgICAgLy8gIzExMTNcbiAgICAgICAgICBpZiAoIUlFX1ZFUlNJT04pIGRvbS5ub2RlVmFsdWUgPSB2YWx1ZSAgLy8gIzE2MjUgSUUgdGhyb3dzIGhlcmUsIG5vZGVWYWx1ZVxuICAgICAgICB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aWxsIGJlIGF2YWlsYWJsZSBvbiAndXBkYXRlZCdcbiAgICAgICAgZWxzZSBkb20ubm9kZVZhbHVlID0gdmFsdWVcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIH5+IzE2MTI6IGxvb2sgZm9yIGNoYW5nZXMgaW4gZG9tLnZhbHVlIHdoZW4gdXBkYXRpbmcgdGhlIHZhbHVlfn5cbiAgICBpZiAoYXR0ck5hbWUgPT09ICd2YWx1ZScpIHtcbiAgICAgIGRvbS52YWx1ZSA9IHZhbHVlXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyByZW1vdmUgb3JpZ2luYWwgYXR0cmlidXRlXG4gICAgcmVtQXR0cihkb20sIGF0dHJOYW1lKVxuXG4gICAgLy8gZXZlbnQgaGFuZGxlclxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgc2V0RXZlbnRIYW5kbGVyKGF0dHJOYW1lLCB2YWx1ZSwgZG9tLCB0YWcpXG5cbiAgICAvLyBpZi0gY29uZGl0aW9uYWxcbiAgICB9IGVsc2UgaWYgKGF0dHJOYW1lID09ICdpZicpIHtcbiAgICAgIHZhciBzdHViID0gZXhwci5zdHViLFxuICAgICAgICBhZGQgPSBmdW5jdGlvbigpIHsgaW5zZXJ0VG8oc3R1Yi5wYXJlbnROb2RlLCBzdHViLCBkb20pIH0sXG4gICAgICAgIHJlbW92ZSA9IGZ1bmN0aW9uKCkgeyBpbnNlcnRUbyhkb20ucGFyZW50Tm9kZSwgZG9tLCBzdHViKSB9XG5cbiAgICAgIC8vIGFkZCB0byBET01cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBpZiAoc3R1Yikge1xuICAgICAgICAgIGFkZCgpXG4gICAgICAgICAgZG9tLmluU3R1YiA9IGZhbHNlXG4gICAgICAgICAgLy8gYXZvaWQgdG8gdHJpZ2dlciB0aGUgbW91bnQgZXZlbnQgaWYgdGhlIHRhZ3MgaXMgbm90IHZpc2libGUgeWV0XG4gICAgICAgICAgLy8gbWF5YmUgd2UgY2FuIG9wdGltaXplIHRoaXMgYXZvaWRpbmcgdG8gbW91bnQgdGhlIHRhZyBhdCBhbGxcbiAgICAgICAgICBpZiAoIWlzSW5TdHViKGRvbSkpIHtcbiAgICAgICAgICAgIHdhbGsoZG9tLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICBpZiAoZWwuX3RhZyAmJiAhZWwuX3RhZy5pc01vdW50ZWQpXG4gICAgICAgICAgICAgICAgZWwuX3RhZy5pc01vdW50ZWQgPSAhIWVsLl90YWcudHJpZ2dlcignbW91bnQnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmcm9tIERPTVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R1YiA9IGV4cHIuc3R1YiA9IHN0dWIgfHwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpXG4gICAgICAgIC8vIGlmIHRoZSBwYXJlbnROb2RlIGlzIGRlZmluZWQgd2UgY2FuIGVhc2lseSByZXBsYWNlIHRoZSB0YWdcbiAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKVxuICAgICAgICAgIHJlbW92ZSgpXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSBuZWVkIHRvIHdhaXQgdGhlIHVwZGF0ZWQgZXZlbnRcbiAgICAgICAgZWxzZSAodGFnLnBhcmVudCB8fCB0YWcpLm9uZSgndXBkYXRlZCcsIHJlbW92ZSlcblxuICAgICAgICBkb20uaW5TdHViID0gdHJ1ZVxuICAgICAgfVxuICAgIC8vIHNob3cgLyBoaWRlXG4gICAgfSBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3Nob3cnKSB7XG4gICAgICBkb20uc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSdcblxuICAgIH0gZWxzZSBpZiAoYXR0ck5hbWUgPT09ICdoaWRlJykge1xuICAgICAgZG9tLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZSA/ICdub25lJyA6ICcnXG5cbiAgICB9IGVsc2UgaWYgKGV4cHIuYm9vbCkge1xuICAgICAgZG9tW2F0dHJOYW1lXSA9IHZhbHVlXG4gICAgICBpZiAodmFsdWUpIHNldEF0dHIoZG9tLCBhdHRyTmFtZSwgYXR0ck5hbWUpXG5cbiAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlICYmIHR5cGVvZiB2YWx1ZSAhPT0gVF9PQkpFQ1QpIHtcbiAgICAgIC8vIDxpbWcgc3JjPVwieyBleHByIH1cIj5cbiAgICAgIGlmIChzdGFydHNXaXRoKGF0dHJOYW1lLCBSSU9UX1BSRUZJWCkgJiYgYXR0ck5hbWUgIT0gUklPVF9UQUcpIHtcbiAgICAgICAgYXR0ck5hbWUgPSBhdHRyTmFtZS5zbGljZShSSU9UX1BSRUZJWC5sZW5ndGgpXG4gICAgICB9XG4gICAgICBzZXRBdHRyKGRvbSwgYXR0ck5hbWUsIHZhbHVlKVxuICAgIH1cblxuICB9KVxuXG59XG4vKipcbiAqIFNwZWNpYWxpemVkIGZ1bmN0aW9uIGZvciBsb29waW5nIGFuIGFycmF5LWxpa2UgY29sbGVjdGlvbiB3aXRoIGBlYWNoPXt9YFxuICogQHBhcmFtICAgeyBBcnJheSB9IGVscyAtIGNvbGxlY3Rpb24gb2YgaXRlbXNcbiAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gZm4gLSBjYWxsYmFjayBmdW5jdGlvblxuICogQHJldHVybnMgeyBBcnJheSB9IHRoZSBhcnJheSBsb29wZWRcbiAqL1xuZnVuY3Rpb24gZWFjaChlbHMsIGZuKSB7XG4gIHZhciBsZW4gPSBlbHMgPyBlbHMubGVuZ3RoIDogMFxuXG4gIGZvciAodmFyIGkgPSAwLCBlbDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWwgPSBlbHNbaV1cbiAgICAvLyByZXR1cm4gZmFsc2UgLT4gY3VycmVudCBpdGVtIHdhcyByZW1vdmVkIGJ5IGZuIGR1cmluZyB0aGUgbG9vcFxuICAgIGlmIChlbCAhPSBudWxsICYmIGZuKGVsLCBpKSA9PT0gZmFsc2UpIGktLVxuICB9XG4gIHJldHVybiBlbHNcbn1cblxuLyoqXG4gKiBEZXRlY3QgaWYgdGhlIGFyZ3VtZW50IHBhc3NlZCBpcyBhIGZ1bmN0aW9uXG4gKiBAcGFyYW0gICB7ICogfSB2IC0gd2hhdGV2ZXIgeW91IHdhbnQgdG8gcGFzcyB0byB0aGlzIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7IEJvb2xlYW4gfSAtXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odikge1xuICByZXR1cm4gdHlwZW9mIHYgPT09IFRfRlVOQ1RJT04gfHwgZmFsc2UgICAvLyBhdm9pZCBJRSBwcm9ibGVtc1xufVxuXG4vKipcbiAqIERldGVjdCBpZiB0aGUgYXJndW1lbnQgcGFzc2VkIGlzIGFuIG9iamVjdCwgZXhjbHVkZSBudWxsLlxuICogTk9URTogVXNlIGlzT2JqZWN0KHgpICYmICFpc0FycmF5KHgpIHRvIGV4Y2x1ZGVzIGFycmF5cy5cbiAqIEBwYXJhbSAgIHsgKiB9IHYgLSB3aGF0ZXZlciB5b3Ugd2FudCB0byBwYXNzIHRvIHRoaXMgZnVuY3Rpb25cbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IC1cbiAqL1xuZnVuY3Rpb24gaXNPYmplY3Qodikge1xuICByZXR1cm4gdiAmJiB0eXBlb2YgdiA9PT0gVF9PQkpFQ1QgICAgICAgICAvLyB0eXBlb2YgbnVsbCBpcyAnb2JqZWN0J1xufVxuXG4vKipcbiAqIFJlbW92ZSBhbnkgRE9NIGF0dHJpYnV0ZSBmcm9tIGEgbm9kZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSB3YW50IHRvIHVwZGF0ZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBuYW1lIC0gbmFtZSBvZiB0aGUgcHJvcGVydHkgd2Ugd2FudCB0byByZW1vdmVcbiAqL1xuZnVuY3Rpb24gcmVtQXR0cihkb20sIG5hbWUpIHtcbiAgZG9tLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJpbmcgY29udGFpbmluZyBkYXNoZXMgdG8gY2FtZWwgY2FzZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBzdHJpbmcgLSBpbnB1dCBzdHJpbmdcbiAqIEByZXR1cm5zIHsgU3RyaW5nIH0gbXktc3RyaW5nIC0+IG15U3RyaW5nXG4gKi9cbmZ1bmN0aW9uIHRvQ2FtZWwoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvLShcXHcpL2csIGZ1bmN0aW9uKF8sIGMpIHtcbiAgICByZXR1cm4gYy50b1VwcGVyQ2FzZSgpXG4gIH0pXG59XG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZSBvZiBhbnkgRE9NIGF0dHJpYnV0ZSBvbiBhIG5vZGVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gZG9tIC0gRE9NIG5vZGUgd2Ugd2FudCB0byBwYXJzZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBuYW1lIC0gbmFtZSBvZiB0aGUgYXR0cmlidXRlIHdlIHdhbnQgdG8gZ2V0XG4gKiBAcmV0dXJucyB7IFN0cmluZyB8IHVuZGVmaW5lZCB9IG5hbWUgb2YgdGhlIG5vZGUgYXR0cmlidXRlIHdoZXRoZXIgaXQgZXhpc3RzXG4gKi9cbmZ1bmN0aW9uIGdldEF0dHIoZG9tLCBuYW1lKSB7XG4gIHJldHVybiBkb20uZ2V0QXR0cmlidXRlKG5hbWUpXG59XG5cbi8qKlxuICogU2V0IGFueSBET00gYXR0cmlidXRlXG4gKiBAcGFyYW0geyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSB3YW50IHRvIHVwZGF0ZVxuICogQHBhcmFtIHsgU3RyaW5nIH0gbmFtZSAtIG5hbWUgb2YgdGhlIHByb3BlcnR5IHdlIHdhbnQgdG8gc2V0XG4gKiBAcGFyYW0geyBTdHJpbmcgfSB2YWwgLSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgd2Ugd2FudCB0byBzZXRcbiAqL1xuZnVuY3Rpb24gc2V0QXR0cihkb20sIG5hbWUsIHZhbCkge1xuICBkb20uc2V0QXR0cmlidXRlKG5hbWUsIHZhbClcbn1cblxuLyoqXG4gKiBEZXRlY3QgdGhlIHRhZyBpbXBsZW1lbnRhdGlvbiBieSBhIERPTSBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIG5lZWQgdG8gcGFyc2UgdG8gZ2V0IGl0cyB0YWcgaW1wbGVtZW50YXRpb25cbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gaXQgcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgaW1wbGVtZW50YXRpb24gb2YgYSBjdXN0b20gdGFnICh0ZW1wbGF0ZSBhbmQgYm9vdCBmdW5jdGlvbilcbiAqL1xuZnVuY3Rpb24gZ2V0VGFnKGRvbSkge1xuICByZXR1cm4gZG9tLnRhZ05hbWUgJiYgX190YWdJbXBsW2dldEF0dHIoZG9tLCBSSU9UX1RBR19JUykgfHxcbiAgICBnZXRBdHRyKGRvbSwgUklPVF9UQUcpIHx8IGRvbS50YWdOYW1lLnRvTG93ZXJDYXNlKCldXG59XG4vKipcbiAqIEFkZCBhIGNoaWxkIHRhZyB0byBpdHMgcGFyZW50IGludG8gdGhlIGB0YWdzYCBvYmplY3RcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gdGFnIC0gY2hpbGQgdGFnIGluc3RhbmNlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHRhZ05hbWUgLSBrZXkgd2hlcmUgdGhlIG5ldyB0YWcgd2lsbCBiZSBzdG9yZWRcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gcGFyZW50IC0gdGFnIGluc3RhbmNlIHdoZXJlIHRoZSBuZXcgY2hpbGQgdGFnIHdpbGwgYmUgaW5jbHVkZWRcbiAqL1xuZnVuY3Rpb24gYWRkQ2hpbGRUYWcodGFnLCB0YWdOYW1lLCBwYXJlbnQpIHtcbiAgdmFyIGNhY2hlZFRhZyA9IHBhcmVudC50YWdzW3RhZ05hbWVdXG5cbiAgLy8gaWYgdGhlcmUgYXJlIG11bHRpcGxlIGNoaWxkcmVuIHRhZ3MgaGF2aW5nIHRoZSBzYW1lIG5hbWVcbiAgaWYgKGNhY2hlZFRhZykge1xuICAgIC8vIGlmIHRoZSBwYXJlbnQgdGFncyBwcm9wZXJ0eSBpcyBub3QgeWV0IGFuIGFycmF5XG4gICAgLy8gY3JlYXRlIGl0IGFkZGluZyB0aGUgZmlyc3QgY2FjaGVkIHRhZ1xuICAgIGlmICghaXNBcnJheShjYWNoZWRUYWcpKVxuICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBzYW1lIHRhZyB0d2ljZVxuICAgICAgaWYgKGNhY2hlZFRhZyAhPT0gdGFnKVxuICAgICAgICBwYXJlbnQudGFnc1t0YWdOYW1lXSA9IFtjYWNoZWRUYWddXG4gICAgLy8gYWRkIHRoZSBuZXcgbmVzdGVkIHRhZyB0byB0aGUgYXJyYXlcbiAgICBpZiAoIWNvbnRhaW5zKHBhcmVudC50YWdzW3RhZ05hbWVdLCB0YWcpKVxuICAgICAgcGFyZW50LnRhZ3NbdGFnTmFtZV0ucHVzaCh0YWcpXG4gIH0gZWxzZSB7XG4gICAgcGFyZW50LnRhZ3NbdGFnTmFtZV0gPSB0YWdcbiAgfVxufVxuXG4vKipcbiAqIE1vdmUgdGhlIHBvc2l0aW9uIG9mIGEgY3VzdG9tIHRhZyBpbiBpdHMgcGFyZW50IHRhZ1xuICogQHBhcmFtICAgeyBPYmplY3QgfSB0YWcgLSBjaGlsZCB0YWcgaW5zdGFuY2VcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gdGFnTmFtZSAtIGtleSB3aGVyZSB0aGUgdGFnIHdhcyBzdG9yZWRcbiAqIEBwYXJhbSAgIHsgTnVtYmVyIH0gbmV3UG9zIC0gaW5kZXggd2hlcmUgdGhlIG5ldyB0YWcgd2lsbCBiZSBzdG9yZWRcbiAqL1xuZnVuY3Rpb24gbW92ZUNoaWxkVGFnKHRhZywgdGFnTmFtZSwgbmV3UG9zKSB7XG4gIHZhciBwYXJlbnQgPSB0YWcucGFyZW50LFxuICAgIHRhZ3NcbiAgLy8gbm8gcGFyZW50IG5vIG1vdmVcbiAgaWYgKCFwYXJlbnQpIHJldHVyblxuXG4gIHRhZ3MgPSBwYXJlbnQudGFnc1t0YWdOYW1lXVxuXG4gIGlmIChpc0FycmF5KHRhZ3MpKVxuICAgIHRhZ3Muc3BsaWNlKG5ld1BvcywgMCwgdGFncy5zcGxpY2UodGFncy5pbmRleE9mKHRhZyksIDEpWzBdKVxuICBlbHNlIGFkZENoaWxkVGFnKHRhZywgdGFnTmFtZSwgcGFyZW50KVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjaGlsZCB0YWcgaW5jbHVkaW5nIGl0IGNvcnJlY3RseSBpbnRvIGl0cyBwYXJlbnRcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY2hpbGQgLSBjaGlsZCB0YWcgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gb3B0cyAtIHRhZyBvcHRpb25zIGNvbnRhaW5pbmcgdGhlIERPTSBub2RlIHdoZXJlIHRoZSB0YWcgd2lsbCBiZSBtb3VudGVkXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IGlubmVySFRNTCAtIGlubmVyIGh0bWwgb2YgdGhlIGNoaWxkIG5vZGVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gcGFyZW50IC0gaW5zdGFuY2Ugb2YgdGhlIHBhcmVudCB0YWcgaW5jbHVkaW5nIHRoZSBjaGlsZCBjdXN0b20gdGFnXG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IGluc3RhbmNlIG9mIHRoZSBuZXcgY2hpbGQgdGFnIGp1c3QgY3JlYXRlZFxuICovXG5mdW5jdGlvbiBpbml0Q2hpbGRUYWcoY2hpbGQsIG9wdHMsIGlubmVySFRNTCwgcGFyZW50KSB7XG4gIHZhciB0YWcgPSBuZXcgVGFnKGNoaWxkLCBvcHRzLCBpbm5lckhUTUwpLFxuICAgIHRhZ05hbWUgPSBnZXRUYWdOYW1lKG9wdHMucm9vdCksXG4gICAgcHRhZyA9IGdldEltbWVkaWF0ZUN1c3RvbVBhcmVudFRhZyhwYXJlbnQpXG4gIC8vIGZpeCBmb3IgdGhlIHBhcmVudCBhdHRyaWJ1dGUgaW4gdGhlIGxvb3BlZCBlbGVtZW50c1xuICB0YWcucGFyZW50ID0gcHRhZ1xuICAvLyBzdG9yZSB0aGUgcmVhbCBwYXJlbnQgdGFnXG4gIC8vIGluIHNvbWUgY2FzZXMgdGhpcyBjb3VsZCBiZSBkaWZmZXJlbnQgZnJvbSB0aGUgY3VzdG9tIHBhcmVudCB0YWdcbiAgLy8gZm9yIGV4YW1wbGUgaW4gbmVzdGVkIGxvb3BzXG4gIHRhZy5fcGFyZW50ID0gcGFyZW50XG5cbiAgLy8gYWRkIHRoaXMgdGFnIHRvIHRoZSBjdXN0b20gcGFyZW50IHRhZ1xuICBhZGRDaGlsZFRhZyh0YWcsIHRhZ05hbWUsIHB0YWcpXG4gIC8vIGFuZCBhbHNvIHRvIHRoZSByZWFsIHBhcmVudCB0YWdcbiAgaWYgKHB0YWcgIT09IHBhcmVudClcbiAgICBhZGRDaGlsZFRhZyh0YWcsIHRhZ05hbWUsIHBhcmVudClcbiAgLy8gZW1wdHkgdGhlIGNoaWxkIG5vZGUgb25jZSB3ZSBnb3QgaXRzIHRlbXBsYXRlXG4gIC8vIHRvIGF2b2lkIHRoYXQgaXRzIGNoaWxkcmVuIGdldCBjb21waWxlZCBtdWx0aXBsZSB0aW1lc1xuICBvcHRzLnJvb3QuaW5uZXJIVE1MID0gJydcblxuICByZXR1cm4gdGFnXG59XG5cbi8qKlxuICogTG9vcCBiYWNrd2FyZCBhbGwgdGhlIHBhcmVudHMgdHJlZSB0byBkZXRlY3QgdGhlIGZpcnN0IGN1c3RvbSBwYXJlbnQgdGFnXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHRhZyAtIGEgVGFnIGluc3RhbmNlXG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IHRoZSBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgY3VzdG9tIHBhcmVudCB0YWcgZm91bmRcbiAqL1xuZnVuY3Rpb24gZ2V0SW1tZWRpYXRlQ3VzdG9tUGFyZW50VGFnKHRhZykge1xuICB2YXIgcHRhZyA9IHRhZ1xuICB3aGlsZSAoIWdldFRhZyhwdGFnLnJvb3QpKSB7XG4gICAgaWYgKCFwdGFnLnBhcmVudCkgYnJlYWtcbiAgICBwdGFnID0gcHRhZy5wYXJlbnRcbiAgfVxuICByZXR1cm4gcHRhZ1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzZXQgYW4gaW1tdXRhYmxlIHByb3BlcnR5XG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGVsIC0gb2JqZWN0IHdoZXJlIHRoZSBuZXcgcHJvcGVydHkgd2lsbCBiZSBzZXRcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0ga2V5IC0gb2JqZWN0IGtleSB3aGVyZSB0aGUgbmV3IHByb3BlcnR5IHdpbGwgYmUgc3RvcmVkXG4gKiBAcGFyYW0gICB7ICogfSB2YWx1ZSAtIHZhbHVlIG9mIHRoZSBuZXcgcHJvcGVydHlcbiogQHBhcmFtICAgeyBPYmplY3QgfSBvcHRpb25zIC0gc2V0IHRoZSBwcm9wZXJ5IG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgb3B0aW9uc1xuICogQHJldHVybnMgeyBPYmplY3QgfSAtIHRoZSBpbml0aWFsIG9iamVjdFxuICovXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShlbCwga2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsIGtleSwgZXh0ZW5kKHtcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgd3JpdGFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgfSwgb3B0aW9ucykpXG4gIHJldHVybiBlbFxufVxuXG4vKipcbiAqIEdldCB0aGUgdGFnIG5hbWUgb2YgYW55IERPTSBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIHdhbnQgdG8gcGFyc2VcbiAqIEByZXR1cm5zIHsgU3RyaW5nIH0gbmFtZSB0byBpZGVudGlmeSB0aGlzIGRvbSBub2RlIGluIHJpb3RcbiAqL1xuZnVuY3Rpb24gZ2V0VGFnTmFtZShkb20pIHtcbiAgdmFyIGNoaWxkID0gZ2V0VGFnKGRvbSksXG4gICAgbmFtZWRUYWcgPSBnZXRBdHRyKGRvbSwgJ25hbWUnKSxcbiAgICB0YWdOYW1lID0gbmFtZWRUYWcgJiYgIXRtcGwuaGFzRXhwcihuYW1lZFRhZykgP1xuICAgICAgICAgICAgICAgIG5hbWVkVGFnIDpcbiAgICAgICAgICAgICAgY2hpbGQgPyBjaGlsZC5uYW1lIDogZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKVxuXG4gIHJldHVybiB0YWdOYW1lXG59XG5cbi8qKlxuICogRXh0ZW5kIGFueSBvYmplY3Qgd2l0aCBvdGhlciBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHNyYyAtIHNvdXJjZSBvYmplY3RcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gdGhlIHJlc3VsdGluZyBleHRlbmRlZCBvYmplY3RcbiAqXG4gKiB2YXIgb2JqID0geyBmb286ICdiYXonIH1cbiAqIGV4dGVuZChvYmosIHtiYXI6ICdiYXInLCBmb286ICdiYXInfSlcbiAqIGNvbnNvbGUubG9nKG9iaikgPT4ge2JhcjogJ2JhcicsIGZvbzogJ2Jhcid9XG4gKlxuICovXG5mdW5jdGlvbiBleHRlbmQoc3JjKSB7XG4gIHZhciBvYmosIGFyZ3MgPSBhcmd1bWVudHNcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG9iaiA9IGFyZ3NbaV0pIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhpcyBwcm9wZXJ0eSBvZiB0aGUgc291cmNlIG9iamVjdCBjb3VsZCBiZSBvdmVycmlkZGVuXG4gICAgICAgIGlmIChpc1dyaXRhYmxlKHNyYywga2V5KSlcbiAgICAgICAgICBzcmNba2V5XSA9IG9ialtrZXldXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzcmNcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGFycmF5IGNvbnRhaW5zIGFuIGl0ZW1cbiAqIEBwYXJhbSAgIHsgQXJyYXkgfSBhcnIgLSB0YXJnZXQgYXJyYXlcbiAqIEBwYXJhbSAgIHsgKiB9IGl0ZW0gLSBpdGVtIHRvIHRlc3RcbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IERvZXMgJ2FycicgY29udGFpbiAnaXRlbSc/XG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zKGFyciwgaXRlbSkge1xuICByZXR1cm4gfmFyci5pbmRleE9mKGl0ZW0pXG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBvYmplY3QgaXMgYSBraW5kIG9mIGFycmF5XG4gKiBAcGFyYW0gICB7ICogfSBhIC0gYW55dGhpbmdcbiAqIEByZXR1cm5zIHtCb29sZWFufSBpcyAnYScgYW4gYXJyYXk/XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkoYSkgeyByZXR1cm4gQXJyYXkuaXNBcnJheShhKSB8fCBhIGluc3RhbmNlb2YgQXJyYXkgfVxuXG4vKipcbiAqIERldGVjdCB3aGV0aGVyIGEgcHJvcGVydHkgb2YgYW4gb2JqZWN0IGNvdWxkIGJlIG92ZXJyaWRkZW5cbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gIG9iaiAtIHNvdXJjZSBvYmplY3RcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gIGtleSAtIG9iamVjdCBwcm9wZXJ0eVxuICogQHJldHVybnMgeyBCb29sZWFuIH0gaXMgdGhpcyBwcm9wZXJ0eSB3cml0YWJsZT9cbiAqL1xuZnVuY3Rpb24gaXNXcml0YWJsZShvYmosIGtleSkge1xuICB2YXIgcHJvcHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5KVxuICByZXR1cm4gdHlwZW9mIG9ialtrZXldID09PSBUX1VOREVGIHx8IHByb3BzICYmIHByb3BzLndyaXRhYmxlXG59XG5cblxuLyoqXG4gKiBXaXRoIHRoaXMgZnVuY3Rpb24gd2UgYXZvaWQgdGhhdCB0aGUgaW50ZXJuYWwgVGFnIG1ldGhvZHMgZ2V0IG92ZXJyaWRkZW5cbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gZGF0YSAtIG9wdGlvbnMgd2Ugd2FudCB0byB1c2UgdG8gZXh0ZW5kIHRoZSB0YWcgaW5zdGFuY2VcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gY2xlYW4gb2JqZWN0IHdpdGhvdXQgY29udGFpbmluZyB0aGUgcmlvdCBpbnRlcm5hbCByZXNlcnZlZCB3b3Jkc1xuICovXG5mdW5jdGlvbiBjbGVhblVwRGF0YShkYXRhKSB7XG4gIGlmICghKGRhdGEgaW5zdGFuY2VvZiBUYWcpICYmICEoZGF0YSAmJiB0eXBlb2YgZGF0YS50cmlnZ2VyID09IFRfRlVOQ1RJT04pKVxuICAgIHJldHVybiBkYXRhXG5cbiAgdmFyIG8gPSB7fVxuICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgIGlmICghY29udGFpbnMoUkVTRVJWRURfV09SRFNfQkxBQ0tMSVNULCBrZXkpKVxuICAgICAgb1trZXldID0gZGF0YVtrZXldXG4gIH1cbiAgcmV0dXJuIG9cbn1cblxuLyoqXG4gKiBXYWxrIGRvd24gcmVjdXJzaXZlbHkgYWxsIHRoZSBjaGlsZHJlbiB0YWdzIHN0YXJ0aW5nIGRvbSBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9ICAgZG9tIC0gc3RhcnRpbmcgbm9kZSB3aGVyZSB3ZSB3aWxsIHN0YXJ0IHRoZSByZWN1cnNpb25cbiAqIEBwYXJhbSAgIHsgRnVuY3Rpb24gfSBmbiAtIGNhbGxiYWNrIHRvIHRyYW5zZm9ybSB0aGUgY2hpbGQgbm9kZSBqdXN0IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIHdhbGsoZG9tLCBmbikge1xuICBpZiAoZG9tKSB7XG4gICAgLy8gc3RvcCB0aGUgcmVjdXJzaW9uXG4gICAgaWYgKGZuKGRvbSkgPT09IGZhbHNlKSByZXR1cm5cbiAgICBlbHNlIHtcbiAgICAgIGRvbSA9IGRvbS5maXJzdENoaWxkXG5cbiAgICAgIHdoaWxlIChkb20pIHtcbiAgICAgICAgd2Fsayhkb20sIGZuKVxuICAgICAgICBkb20gPSBkb20ubmV4dFNpYmxpbmdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBNaW5pbWl6ZSByaXNrOiBvbmx5IHplcm8gb3Igb25lIF9zcGFjZV8gYmV0d2VlbiBhdHRyICYgdmFsdWVcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBodG1sIC0gaHRtbCBzdHJpbmcgd2Ugd2FudCB0byBwYXJzZVxuICogQHBhcmFtICAgeyBGdW5jdGlvbiB9IGZuIC0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gYXBwbHkgb24gYW55IGF0dHJpYnV0ZSBmb3VuZFxuICovXG5mdW5jdGlvbiB3YWxrQXR0cmlidXRlcyhodG1sLCBmbikge1xuICB2YXIgbSxcbiAgICByZSA9IC8oWy1cXHddKykgPz0gPyg/OlwiKFteXCJdKil8JyhbXiddKil8KHtbXn1dKn0pKS9nXG5cbiAgd2hpbGUgKG0gPSByZS5leGVjKGh0bWwpKSB7XG4gICAgZm4obVsxXS50b0xvd2VyQ2FzZSgpLCBtWzJdIHx8IG1bM10gfHwgbVs0XSlcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBET00gbm9kZSBpcyBpbiBzdHViIG1vZGUsIHVzZWZ1bCBmb3IgdGhlIHJpb3QgJ2lmJyBkaXJlY3RpdmVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gIGRvbSAtIERPTSBub2RlIHdlIHdhbnQgdG8gcGFyc2VcbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IC1cbiAqL1xuZnVuY3Rpb24gaXNJblN0dWIoZG9tKSB7XG4gIHdoaWxlIChkb20pIHtcbiAgICBpZiAoZG9tLmluU3R1YikgcmV0dXJuIHRydWVcbiAgICBkb20gPSBkb20ucGFyZW50Tm9kZVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIGdlbmVyaWMgRE9NIG5vZGVcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gbmFtZSAtIG5hbWUgb2YgdGhlIERPTSBub2RlIHdlIHdhbnQgdG8gY3JlYXRlXG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IERPTSBub2RlIGp1c3QgY3JlYXRlZFxuICovXG5mdW5jdGlvbiBta0VsKG5hbWUpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbn1cblxuLyoqXG4gKiBTaG9ydGVyIGFuZCBmYXN0IHdheSB0byBzZWxlY3QgbXVsdGlwbGUgbm9kZXMgaW4gdGhlIERPTVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBzZWxlY3RvciAtIERPTSBzZWxlY3RvclxuICogQHBhcmFtICAgeyBPYmplY3QgfSBjdHggLSBET00gbm9kZSB3aGVyZSB0aGUgdGFyZ2V0cyBvZiBvdXIgc2VhcmNoIHdpbGwgaXMgbG9jYXRlZFxuICogQHJldHVybnMgeyBPYmplY3QgfSBkb20gbm9kZXMgZm91bmRcbiAqL1xuZnVuY3Rpb24gJCQoc2VsZWN0b3IsIGN0eCkge1xuICByZXR1cm4gKGN0eCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcilcbn1cblxuLyoqXG4gKiBTaG9ydGVyIGFuZCBmYXN0IHdheSB0byBzZWxlY3QgYSBzaW5nbGUgbm9kZSBpbiB0aGUgRE9NXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHNlbGVjdG9yIC0gdW5pcXVlIGRvbSBzZWxlY3RvclxuICogQHBhcmFtICAgeyBPYmplY3QgfSBjdHggLSBET00gbm9kZSB3aGVyZSB0aGUgdGFyZ2V0IG9mIG91ciBzZWFyY2ggd2lsbCBpcyBsb2NhdGVkXG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IGRvbSBub2RlIGZvdW5kXG4gKi9cbmZ1bmN0aW9uICQoc2VsZWN0b3IsIGN0eCkge1xuICByZXR1cm4gKGN0eCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvcihzZWxlY3Rvcilcbn1cblxuLyoqXG4gKiBTaW1wbGUgb2JqZWN0IHByb3RvdHlwYWwgaW5oZXJpdGFuY2VcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gcGFyZW50IC0gcGFyZW50IG9iamVjdFxuICogQHJldHVybnMgeyBPYmplY3QgfSBjaGlsZCBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBpbmhlcml0KHBhcmVudCkge1xuICBmdW5jdGlvbiBDaGlsZCgpIHt9XG4gIENoaWxkLnByb3RvdHlwZSA9IHBhcmVudFxuICByZXR1cm4gbmV3IENoaWxkKClcbn1cblxuLyoqXG4gKiBHZXQgdGhlIG5hbWUgcHJvcGVydHkgbmVlZGVkIHRvIGlkZW50aWZ5IGEgRE9NIG5vZGUgaW4gcmlvdFxuICogQHBhcmFtICAgeyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSBuZWVkIHRvIHBhcnNlXG4gKiBAcmV0dXJucyB7IFN0cmluZyB8IHVuZGVmaW5lZCB9IGdpdmUgdXMgYmFjayBhIHN0cmluZyB0byBpZGVudGlmeSB0aGlzIGRvbSBub2RlXG4gKi9cbmZ1bmN0aW9uIGdldE5hbWVkS2V5KGRvbSkge1xuICByZXR1cm4gZ2V0QXR0cihkb20sICdpZCcpIHx8IGdldEF0dHIoZG9tLCAnbmFtZScpXG59XG5cbi8qKlxuICogU2V0IHRoZSBuYW1lZCBwcm9wZXJ0aWVzIG9mIGEgdGFnIGVsZW1lbnRcbiAqIEBwYXJhbSB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIG5lZWQgdG8gcGFyc2VcbiAqIEBwYXJhbSB7IE9iamVjdCB9IHBhcmVudCAtIHRhZyBpbnN0YW5jZSB3aGVyZSB0aGUgbmFtZWQgZG9tIGVsZW1lbnQgd2lsbCBiZSBldmVudHVhbGx5IGFkZGVkXG4gKiBAcGFyYW0geyBBcnJheSB9IGtleXMgLSBsaXN0IG9mIGFsbCB0aGUgdGFnIGluc3RhbmNlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gc2V0TmFtZWQoZG9tLCBwYXJlbnQsIGtleXMpIHtcbiAgLy8gZ2V0IHRoZSBrZXkgdmFsdWUgd2Ugd2FudCB0byBhZGQgdG8gdGhlIHRhZyBpbnN0YW5jZVxuICB2YXIga2V5ID0gZ2V0TmFtZWRLZXkoZG9tKSxcbiAgICBpc0FycixcbiAgICAvLyBhZGQgdGhlIG5vZGUgZGV0ZWN0ZWQgdG8gYSB0YWcgaW5zdGFuY2UgdXNpbmcgdGhlIG5hbWVkIHByb3BlcnR5XG4gICAgYWRkID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIC8vIGF2b2lkIHRvIG92ZXJyaWRlIHRoZSB0YWcgcHJvcGVydGllcyBhbHJlYWR5IHNldFxuICAgICAgaWYgKGNvbnRhaW5zKGtleXMsIGtleSkpIHJldHVyblxuICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGlzIHZhbHVlIGlzIGFuIGFycmF5XG4gICAgICBpc0FyciA9IGlzQXJyYXkodmFsdWUpXG4gICAgICAvLyBpZiB0aGUga2V5IHdhcyBuZXZlciBzZXRcbiAgICAgIGlmICghdmFsdWUpXG4gICAgICAgIC8vIHNldCBpdCBvbmNlIG9uIHRoZSB0YWcgaW5zdGFuY2VcbiAgICAgICAgcGFyZW50W2tleV0gPSBkb21cbiAgICAgIC8vIGlmIGl0IHdhcyBhbiBhcnJheSBhbmQgbm90IHlldCBzZXRcbiAgICAgIGVsc2UgaWYgKCFpc0FyciB8fCBpc0FyciAmJiAhY29udGFpbnModmFsdWUsIGRvbSkpIHtcbiAgICAgICAgLy8gYWRkIHRoZSBkb20gbm9kZSBpbnRvIHRoZSBhcnJheVxuICAgICAgICBpZiAoaXNBcnIpXG4gICAgICAgICAgdmFsdWUucHVzaChkb20pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYXJlbnRba2V5XSA9IFt2YWx1ZSwgZG9tXVxuICAgICAgfVxuICAgIH1cblxuICAvLyBza2lwIHRoZSBlbGVtZW50cyB3aXRoIG5vIG5hbWVkIHByb3BlcnRpZXNcbiAgaWYgKCFrZXkpIHJldHVyblxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgdGhpcyBrZXkgaGFzIGJlZW4gYWxyZWFkeSBldmFsdWF0ZWRcbiAgaWYgKHRtcGwuaGFzRXhwcihrZXkpKVxuICAgIC8vIHdhaXQgdGhlIGZpcnN0IHVwZGF0ZWQgZXZlbnQgb25seSBvbmNlXG4gICAgcGFyZW50Lm9uZSgnbW91bnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGtleSA9IGdldE5hbWVkS2V5KGRvbSlcbiAgICAgIGFkZChwYXJlbnRba2V5XSlcbiAgICB9KVxuICBlbHNlXG4gICAgYWRkKHBhcmVudFtrZXldKVxuXG59XG5cbi8qKlxuICogRmFzdGVyIFN0cmluZyBzdGFydHNXaXRoIGFsdGVybmF0aXZlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHNyYyAtIHNvdXJjZSBzdHJpbmdcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gc3RyIC0gdGVzdCBzdHJpbmdcbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IC1cbiAqL1xuZnVuY3Rpb24gc3RhcnRzV2l0aChzcmMsIHN0cikge1xuICByZXR1cm4gc3JjLnNsaWNlKDAsIHN0ci5sZW5ndGgpID09PSBzdHJcbn1cblxuLyoqXG4gKiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZnVuY3Rpb25cbiAqIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvMTU3OTY3MSwgbGljZW5zZSBNSVRcbiAqL1xudmFyIHJBRiA9IChmdW5jdGlvbiAodykge1xuICB2YXIgcmFmID0gdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICAgIHcubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHcud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG5cbiAgaWYgKCFyYWYgfHwgL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHcubmF2aWdhdG9yLnVzZXJBZ2VudCkpIHsgIC8vIGJ1Z2d5IGlPUzZcbiAgICB2YXIgbGFzdFRpbWUgPSAwXG5cbiAgICByYWYgPSBmdW5jdGlvbiAoY2IpIHtcbiAgICAgIHZhciBub3d0aW1lID0gRGF0ZS5ub3coKSwgdGltZW91dCA9IE1hdGgubWF4KDE2IC0gKG5vd3RpbWUgLSBsYXN0VGltZSksIDApXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2IobGFzdFRpbWUgPSBub3d0aW1lICsgdGltZW91dCkgfSwgdGltZW91dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJhZlxuXG59KSh3aW5kb3cgfHwge30pXG5cbi8qKlxuICogTW91bnQgYSB0YWcgY3JlYXRpbmcgbmV3IFRhZyBpbnN0YW5jZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSByb290IC0gZG9tIG5vZGUgd2hlcmUgdGhlIHRhZyB3aWxsIGJlIG1vdW50ZWRcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gdGFnTmFtZSAtIG5hbWUgb2YgdGhlIHJpb3QgdGFnIHdlIHdhbnQgdG8gbW91bnRcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gb3B0cyAtIG9wdGlvbnMgdG8gcGFzcyB0byB0aGUgVGFnIGluc3RhbmNlXG4gKiBAcmV0dXJucyB7IFRhZyB9IGEgbmV3IFRhZyBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBtb3VudFRvKHJvb3QsIHRhZ05hbWUsIG9wdHMpIHtcbiAgdmFyIHRhZyA9IF9fdGFnSW1wbFt0YWdOYW1lXSxcbiAgICAvLyBjYWNoZSB0aGUgaW5uZXIgSFRNTCB0byBmaXggIzg1NVxuICAgIGlubmVySFRNTCA9IHJvb3QuX2lubmVySFRNTCA9IHJvb3QuX2lubmVySFRNTCB8fCByb290LmlubmVySFRNTFxuXG4gIC8vIGNsZWFyIHRoZSBpbm5lciBodG1sXG4gIHJvb3QuaW5uZXJIVE1MID0gJydcblxuICBpZiAodGFnICYmIHJvb3QpIHRhZyA9IG5ldyBUYWcodGFnLCB7IHJvb3Q6IHJvb3QsIG9wdHM6IG9wdHMgfSwgaW5uZXJIVE1MKVxuXG4gIGlmICh0YWcgJiYgdGFnLm1vdW50KSB7XG4gICAgdGFnLm1vdW50KClcbiAgICAvLyBhZGQgdGhpcyB0YWcgdG8gdGhlIHZpcnR1YWxEb20gdmFyaWFibGVcbiAgICBpZiAoIWNvbnRhaW5zKF9fdmlydHVhbERvbSwgdGFnKSkgX192aXJ0dWFsRG9tLnB1c2godGFnKVxuICB9XG5cbiAgcmV0dXJuIHRhZ1xufVxuLyoqXG4gKiBSaW90IHB1YmxpYyBhcGlcbiAqL1xuXG4vLyBzaGFyZSBtZXRob2RzIGZvciBvdGhlciByaW90IHBhcnRzLCBlLmcuIGNvbXBpbGVyXG5yaW90LnV0aWwgPSB7IGJyYWNrZXRzOiBicmFja2V0cywgdG1wbDogdG1wbCB9XG5cbi8qKlxuICogQ3JlYXRlIGEgbWl4aW4gdGhhdCBjb3VsZCBiZSBnbG9iYWxseSBzaGFyZWQgYWNyb3NzIGFsbCB0aGUgdGFnc1xuICovXG5yaW90Lm1peGluID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbWl4aW5zID0ge31cblxuICAvKipcbiAgICogQ3JlYXRlL1JldHVybiBhIG1peGluIGJ5IGl0cyBuYW1lXG4gICAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gbmFtZSAtIG1peGluIG5hbWUgKGdsb2JhbCBtaXhpbiBpZiBtaXNzaW5nKVxuICAgKiBAcGFyYW0gICB7IE9iamVjdCB9IG1peGluIC0gbWl4aW4gbG9naWNcbiAgICogQHJldHVybnMgeyBPYmplY3QgfSB0aGUgbWl4aW4gbG9naWNcbiAgICovXG4gIHJldHVybiBmdW5jdGlvbihuYW1lLCBtaXhpbikge1xuICAgIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgICAgbWl4aW4gPSBuYW1lXG4gICAgICBtaXhpbnNbR0xPQkFMX01JWElOXSA9IGV4dGVuZChtaXhpbnNbR0xPQkFMX01JWElOXSB8fCB7fSwgbWl4aW4pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIW1peGluKSByZXR1cm4gbWl4aW5zW25hbWVdXG4gICAgbWl4aW5zW25hbWVdID0gbWl4aW5cbiAgfVxuXG59KSgpXG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHJpb3QgdGFnIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgbmFtZSAtIG5hbWUvaWQgb2YgdGhlIG5ldyByaW90IHRhZ1xuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIGh0bWwgLSB0YWcgdGVtcGxhdGVcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBjc3MgLSBjdXN0b20gdGFnIGNzc1xuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIGF0dHJzIC0gcm9vdCB0YWcgYXR0cmlidXRlc1xuICogQHBhcmFtICAgeyBGdW5jdGlvbiB9IGZuIC0gdXNlciBmdW5jdGlvblxuICogQHJldHVybnMgeyBTdHJpbmcgfSBuYW1lL2lkIG9mIHRoZSB0YWcganVzdCBjcmVhdGVkXG4gKi9cbnJpb3QudGFnID0gZnVuY3Rpb24obmFtZSwgaHRtbCwgY3NzLCBhdHRycywgZm4pIHtcbiAgaWYgKGlzRnVuY3Rpb24oYXR0cnMpKSB7XG4gICAgZm4gPSBhdHRyc1xuICAgIGlmICgvXltcXHdcXC1dK1xccz89Ly50ZXN0KGNzcykpIHtcbiAgICAgIGF0dHJzID0gY3NzXG4gICAgICBjc3MgPSAnJ1xuICAgIH0gZWxzZSBhdHRycyA9ICcnXG4gIH1cbiAgaWYgKGNzcykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNzcykpIGZuID0gY3NzXG4gICAgZWxzZSBzdHlsZU1hbmFnZXIuYWRkKGNzcylcbiAgfVxuICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIF9fdGFnSW1wbFtuYW1lXSA9IHsgbmFtZTogbmFtZSwgdG1wbDogaHRtbCwgYXR0cnM6IGF0dHJzLCBmbjogZm4gfVxuICByZXR1cm4gbmFtZVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyByaW90IHRhZyBpbXBsZW1lbnRhdGlvbiAoZm9yIHVzZSBieSB0aGUgY29tcGlsZXIpXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgbmFtZSAtIG5hbWUvaWQgb2YgdGhlIG5ldyByaW90IHRhZ1xuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIGh0bWwgLSB0YWcgdGVtcGxhdGVcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBjc3MgLSBjdXN0b20gdGFnIGNzc1xuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIGF0dHJzIC0gcm9vdCB0YWcgYXR0cmlidXRlc1xuICogQHBhcmFtICAgeyBGdW5jdGlvbiB9IGZuIC0gdXNlciBmdW5jdGlvblxuICogQHJldHVybnMgeyBTdHJpbmcgfSBuYW1lL2lkIG9mIHRoZSB0YWcganVzdCBjcmVhdGVkXG4gKi9cbnJpb3QudGFnMiA9IGZ1bmN0aW9uKG5hbWUsIGh0bWwsIGNzcywgYXR0cnMsIGZuKSB7XG4gIGlmIChjc3MpIHN0eWxlTWFuYWdlci5hZGQoY3NzKVxuICAvL2lmIChicGFpcikgcmlvdC5zZXR0aW5ncy5icmFja2V0cyA9IGJwYWlyXG4gIF9fdGFnSW1wbFtuYW1lXSA9IHsgbmFtZTogbmFtZSwgdG1wbDogaHRtbCwgYXR0cnM6IGF0dHJzLCBmbjogZm4gfVxuICByZXR1cm4gbmFtZVxufVxuXG4vKipcbiAqIE1vdW50IGEgdGFnIHVzaW5nIGEgc3BlY2lmaWMgdGFnIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHNlbGVjdG9yIC0gdGFnIERPTSBzZWxlY3RvclxuICogQHBhcmFtICAgeyBTdHJpbmcgfSB0YWdOYW1lIC0gdGFnIGltcGxlbWVudGF0aW9uIG5hbWVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gb3B0cyAtIHRhZyBsb2dpY1xuICogQHJldHVybnMgeyBBcnJheSB9IG5ldyB0YWdzIGluc3RhbmNlc1xuICovXG5yaW90Lm1vdW50ID0gZnVuY3Rpb24oc2VsZWN0b3IsIHRhZ05hbWUsIG9wdHMpIHtcblxuICB2YXIgZWxzLFxuICAgIGFsbFRhZ3MsXG4gICAgdGFncyA9IFtdXG5cbiAgLy8gaGVscGVyIGZ1bmN0aW9uc1xuXG4gIGZ1bmN0aW9uIGFkZFJpb3RUYWdzKGFycikge1xuICAgIHZhciBsaXN0ID0gJydcbiAgICBlYWNoKGFyciwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICghL1teLVxcd10vLnRlc3QoZSkpIHtcbiAgICAgICAgZSA9IGUudHJpbSgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbGlzdCArPSAnLFsnICsgUklPVF9UQUdfSVMgKyAnPVwiJyArIGUgKyAnXCJdLFsnICsgUklPVF9UQUcgKyAnPVwiJyArIGUgKyAnXCJdJ1xuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGxpc3RcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbGVjdEFsbFRhZ3MoKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhfX3RhZ0ltcGwpXG4gICAgcmV0dXJuIGtleXMgKyBhZGRSaW90VGFncyhrZXlzKVxuICB9XG5cbiAgZnVuY3Rpb24gcHVzaFRhZ3Mocm9vdCkge1xuICAgIGlmIChyb290LnRhZ05hbWUpIHtcbiAgICAgIHZhciByaW90VGFnID0gZ2V0QXR0cihyb290LCBSSU9UX1RBR19JUykgfHwgZ2V0QXR0cihyb290LCBSSU9UX1RBRylcblxuICAgICAgLy8gaGF2ZSB0YWdOYW1lPyBmb3JjZSByaW90LXRhZyB0byBiZSB0aGUgc2FtZVxuICAgICAgaWYgKHRhZ05hbWUgJiYgcmlvdFRhZyAhPT0gdGFnTmFtZSkge1xuICAgICAgICByaW90VGFnID0gdGFnTmFtZVxuICAgICAgICBzZXRBdHRyKHJvb3QsIFJJT1RfVEFHX0lTLCB0YWdOYW1lKVxuICAgICAgfVxuICAgICAgdmFyIHRhZyA9IG1vdW50VG8ocm9vdCwgcmlvdFRhZyB8fCByb290LnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgb3B0cylcblxuICAgICAgaWYgKHRhZykgdGFncy5wdXNoKHRhZylcbiAgICB9IGVsc2UgaWYgKHJvb3QubGVuZ3RoKSB7XG4gICAgICBlYWNoKHJvb3QsIHB1c2hUYWdzKSAgIC8vIGFzc3VtZSBub2RlTGlzdFxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tIG1vdW50IGNvZGUgLS0tLS1cblxuICAvLyBpbmplY3Qgc3R5bGVzIGludG8gRE9NXG4gIHN0eWxlTWFuYWdlci5pbmplY3QoKVxuXG4gIGlmIChpc09iamVjdCh0YWdOYW1lKSkge1xuICAgIG9wdHMgPSB0YWdOYW1lXG4gICAgdGFnTmFtZSA9IDBcbiAgfVxuXG4gIC8vIGNyYXdsIHRoZSBET00gdG8gZmluZCB0aGUgdGFnXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09IFRfU1RSSU5HKSB7XG4gICAgaWYgKHNlbGVjdG9yID09PSAnKicpXG4gICAgICAvLyBzZWxlY3QgYWxsIHRoZSB0YWdzIHJlZ2lzdGVyZWRcbiAgICAgIC8vIGFuZCBhbHNvIHRoZSB0YWdzIGZvdW5kIHdpdGggdGhlIHJpb3QtdGFnIGF0dHJpYnV0ZSBzZXRcbiAgICAgIHNlbGVjdG9yID0gYWxsVGFncyA9IHNlbGVjdEFsbFRhZ3MoKVxuICAgIGVsc2VcbiAgICAgIC8vIG9yIGp1c3QgdGhlIG9uZXMgbmFtZWQgbGlrZSB0aGUgc2VsZWN0b3JcbiAgICAgIHNlbGVjdG9yICs9IGFkZFJpb3RUYWdzKHNlbGVjdG9yLnNwbGl0KC8sICovKSlcblxuICAgIC8vIG1ha2Ugc3VyZSB0byBwYXNzIGFsd2F5cyBhIHNlbGVjdG9yXG4gICAgLy8gdG8gdGhlIHF1ZXJ5U2VsZWN0b3JBbGwgZnVuY3Rpb25cbiAgICBlbHMgPSBzZWxlY3RvciA/ICQkKHNlbGVjdG9yKSA6IFtdXG4gIH1cbiAgZWxzZVxuICAgIC8vIHByb2JhYmx5IHlvdSBoYXZlIHBhc3NlZCBhbHJlYWR5IGEgdGFnIG9yIGEgTm9kZUxpc3RcbiAgICBlbHMgPSBzZWxlY3RvclxuXG4gIC8vIHNlbGVjdCBhbGwgdGhlIHJlZ2lzdGVyZWQgYW5kIG1vdW50IHRoZW0gaW5zaWRlIHRoZWlyIHJvb3QgZWxlbWVudHNcbiAgaWYgKHRhZ05hbWUgPT09ICcqJykge1xuICAgIC8vIGdldCBhbGwgY3VzdG9tIHRhZ3NcbiAgICB0YWdOYW1lID0gYWxsVGFncyB8fCBzZWxlY3RBbGxUYWdzKClcbiAgICAvLyBpZiB0aGUgcm9vdCBlbHMgaXQncyBqdXN0IGEgc2luZ2xlIHRhZ1xuICAgIGlmIChlbHMudGFnTmFtZSlcbiAgICAgIGVscyA9ICQkKHRhZ05hbWUsIGVscylcbiAgICBlbHNlIHtcbiAgICAgIC8vIHNlbGVjdCBhbGwgdGhlIGNoaWxkcmVuIGZvciBhbGwgdGhlIGRpZmZlcmVudCByb290IGVsZW1lbnRzXG4gICAgICB2YXIgbm9kZUxpc3QgPSBbXVxuICAgICAgZWFjaChlbHMsIGZ1bmN0aW9uIChfZWwpIHtcbiAgICAgICAgbm9kZUxpc3QucHVzaCgkJCh0YWdOYW1lLCBfZWwpKVxuICAgICAgfSlcbiAgICAgIGVscyA9IG5vZGVMaXN0XG4gICAgfVxuICAgIC8vIGdldCByaWQgb2YgdGhlIHRhZ05hbWVcbiAgICB0YWdOYW1lID0gMFxuICB9XG5cbiAgcHVzaFRhZ3MoZWxzKVxuXG4gIHJldHVybiB0YWdzXG59XG5cbi8qKlxuICogVXBkYXRlIGFsbCB0aGUgdGFncyBpbnN0YW5jZXMgY3JlYXRlZFxuICogQHJldHVybnMgeyBBcnJheSB9IGFsbCB0aGUgdGFncyBpbnN0YW5jZXNcbiAqL1xucmlvdC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGVhY2goX192aXJ0dWFsRG9tLCBmdW5jdGlvbih0YWcpIHtcbiAgICB0YWcudXBkYXRlKClcbiAgfSlcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIFRhZyBjb25zdHJ1Y3RvclxuICovXG5yaW90LlRhZyA9IFRhZ1xuICAvLyBzdXBwb3J0IENvbW1vbkpTLCBBTUQgJiBicm93c2VyXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gVF9PQkpFQ1QpXG4gICAgbW9kdWxlLmV4cG9ydHMgPSByaW90XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFRfRlVOQ1RJT04gJiYgdHlwZW9mIGRlZmluZS5hbWQgIT09IFRfVU5ERUYpXG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gcmlvdCB9KVxuICBlbHNlXG4gICAgd2luZG93LnJpb3QgPSByaW90XG5cbn0pKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB2b2lkIDApO1xuXG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ3N5bmMnLCAnPHlpZWxkPjwveWllbGQ+JywgJycsICcnLCBmdW5jdGlvbihvcHRzKSB7XG59KTtcblxufSx7XCJyaW90XCI6Mn1dfSx7fSxbMV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
