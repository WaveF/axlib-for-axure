/**
 * 
 * AxLib v1.3.2
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/
(function () {

    var axhost = '';

    main();

    function main() {
        window.waitFor = waitFor;
        waitFor(['$', '$axure'], axureInited);
    }

    function axureInited() {
        loader();
        window.axlib = window.AXLIB = {
            getHost    : getHost,
            db         : database,
            loadRes    : loadRes,
            loadJS     : loadJS,
            loadCSS    : loadCSS,
            addCssRules: addCssRules,
            random     : random,
            waitFor    : waitFor
        };
    }

    function loader() {
        var mainJS, mainFN, debug, timestamp = '';

        $('script').each(function (i, k) {
            var src = $(k).attr('src') || '';
            src = src.toLowerCase();

            if (src.indexOf('axlib.js') != -1) {
                axhost = src.split('axlib.js')[0];
                mainJS = $(k).attr('data-main');
                mainFN = $(k).attr('data-entry');
                debug  = $(k).is("[debug]");
            }
        });

        if (!mainJS) return;
        if (mainJS.indexOf('.js') == -1) {
            mainJS += '.js';
        }
        if (debug) {
            timestamp = '?' + new Date().getTime();
        }

        if (mainJS.indexOf('http') == -1 || mainJS.indexOf('//') == -1) {
            mainJS = axhost + mainJS;
        }

        trace({
            host:  axhost,
            mainJS: mainJS,
            debug: debug,
            timestamp: timestamp
        });

        loadJS(mainJS + timestamp);
        if (typeof window['mainFN']) { mainFN(); }
    }

    function loadRes(urls, callback) {
        var count = 0;

        var recursiveCallback = function() {
            if (++count < urls.length) {
                var file = urls[count];
                if (file.indexOf('.js') != -1) {
                    loadJS(file, recursiveCallback);
                }
    
                if (file.indexOf('.css') != -1) {
                    loadCSS(file, recursiveCallback);
                }
            } else {
                console.groupCollapsed('%c[axlib.loadRes]', 'color:#06f; font-weight:bold;');
                console.table(urls);
                console.groupEnd();
                callback();
            }
        }

        if (urls[0].indexOf('.js') != -1) {
            loadJS(urls[0], recursiveCallback);
        }

        if (urls[0].indexOf('.css') != -1) {
            loadCSS(urls[0], recursiveCallback);
        }
    }

    function loadJS(url, callback) {
        var js = createJsElement(url);
        document.querySelector('head').appendChild(js);
        js.onload = callback;
    };

    function loadCSS(url, callback) {
        var css = createCssElement(url);
        document.querySelector('head').appendChild(css);
        css.onload = callback;
    };

    function createJsElement(url) {
        var s = document.createElement('script');
            s.setAttribute('type', 'text/javascript');
            s.setAttribute('src', url);
        return s;
    }

    function createCssElement(url) {
        var s = document.createElement('link');
            s.setAttribute('type', 'text/css');
            s.setAttribute('rel', 'Stylesheet');
            s.setAttribute('href', url);
        return s;
    }

    function database(id, host) {
        host = host || 'https://jsonbox.io/';

        var url = host + id;

        // init db and auto insert first record
        load(null, data => {
            if (data.length > 0) return;
            save('axure database created');
        });

        function save(dataString, callback) {
            $.ajax({
                url: url,
                data: JSON.stringify({
                    'data': dataString
                }),
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (data) {
                    console.log('save', data);

                    if (typeof callback == 'function') {
                        callback(data);
                    }
                },
                error: function (data) {
                    console.log('save error', data);
                }
            });
        }

        function load(gval, callback) {
            $.ajax({
                url: url,
                success: function (data) {
                    console.log('load', data);

                    if (gval) {
                        var lastData = data[0];
                        $axure.setGlobalVariable(gval, lastData.data);
                    }

                    if (typeof callback == 'function') {
                        callback(data);
                    }
                },
                error: function (data) {
                    console.log('load error', data);
                }
            });
        };

        return {
            save: save,
            load: load,
            random: random
        }
    }

    function random(type) {
        type = type.toLowerCase();

        if (type == 'int') {
            var min = arguments[1];
            var max = arguments[2];
            var diff = Math.abs(max - min);
            return parseInt(Math.random() * diff) + min;
        }

        if (type == 'float') {
            var min = arguments[1];
            var max = arguments[2];
            var diff = Math.abs(max - min);
            return Math.random() * diff + min;
        }

        if (type == 'sign') {
            return Math.random() > .5 ? 1 : -1;
        }

        if (type == 'lorem') {
            var length = arguments[1];
            var usePunc = arguments[2];

            return lorem(length, {usePunc: usePunc});
        }

        if (type == 'captcha') {
            var length = arguments[1];
            return Math.random().toString(36).slice(2, length+2).toUpperCase();
        }
    }

    function addCssRules(rules) {
        var style = $(`<style>${rules}</style>`);
        $('html > head').append(style);
    }

    function waitFor(objs, callback) {
        objs = (typeof objs == 'string')?[objs]:objs;
        
        var check_prepared = setInterval(()=>{
            var exists = true;
            for (var i=0; i<objs.length; i++) {
                var obj = objs[i];
                
                if (window[obj] == undefined) {
                    exists = false;
                }
            }
            if (exists) {
                clearInterval(check_prepared);
                callback();
            }
        }, 100);
    }

    function getHost() {
        return axhost;
    }

    function trace(args) {
        console.group('%c[axlib]', 'color:#06f; font-weight:bold;');
        if (!arguments[1]) {
            console.log(arguments[0]);
        } else {
            console.log(arguments[0], arguments[1]);
        }
        console.groupEnd()
    }

}());