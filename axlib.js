/**
 * 
 * AxLib v1.3.3
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
        window.axlib = window.AXLIB = {};
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

        // console.log({
        //     name: 'axlib',
        //     version: '1.3.3'
        // });
    }

    function load(config) {
        var files = config.urls,
            sync = config.sync,
            callback = config.onComplete;
    
        var HEAD = document.getElementsByTagName('head')[0] || document.documentElement;
        var s = [];
        
        if (!$.isArray(files)) {
            files = [files];
        }
    
        if (sync === undefined) {
            sync = true;
        }
    
        if (sync === true) {
    
            // 同步蔽塞
            var last = files.length - 1;
            var recursiveLoad = function (i) {

                var fileType = getFileExt(files[i]);
                var syncLoaded = function () {
                    if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                        this.onload = this.onreadystatechange = null;
                        this.parentNode.removeChild(this);
                        if (i !== last) {
                            recursiveLoad(i + 1);
                        } else if (typeof (callback) === 'function') {
                            callback();
                        };
                    }
                };
    
                if (fileType === 'js') {
                    s[i] = document.createElement('script');
                    s[i].setAttribute('type', 'text/javascript');
                    s[i].onload = s[i].onreadystatechange = syncLoaded;
                    s[i].setAttribute('src', files[i]);
                } else if (fileType === 'css') {
                    s[i] = document.createElement('link');
                    s[i].setAttribute('type', 'text/css');
                    s[i].setAttribute('rel', 'text/stylesheet');
                    s[i].onload = s[i].onreadystatechange = syncLoaded;
                    s[i].setAttribute('href', files[i]);
                }
                
                HEAD.appendChild(s[i]);
            };
            recursiveLoad(0);
    
        } else {
    
            // 异步加载
            var loaded = 0;
            var asyncLoaded = function () {
                if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                    loaded++;
                    this.onload = this.onreadystatechange = null;
                    this.parentNode.removeChild(this);
                    if (loaded === files.length && typeof (callback) === 'function') callback();
                }
            };
    
            for (var i = 0; i < files.length; i++) {
                
                var fileType = getFileExt(files[i]);
    
                if (fileType === 'js') {
                    s[i] = document.createElement('script');
                    s[i].setAttribute('type', 'text/javascript');
                    s[i].onload = s[i].onreadystatechange = asyncLoaded;
                    s[i].setAttribute('src', files[i]);
                } else if (fileType === 'css') {
                    s[i] = document.createElement('link');
                    s[i].setAttribute('type', 'text/css');
                    s[i].setAttribute('rel', 'text/stylesheet');
                    s[i].onload = s[i].onreadystatechange = asyncLoaded;
                    s[i].setAttribute('href', files[i]);
                }
    
                HEAD.appendChild(s[i]);
            }
    
        }
    };

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

        var save = function(dataString, callback) {
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

        var load = function(gval, callback) {
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

        // init db and auto insert first record
        load(null, data => {
            if (data.length > 0) return;
            save('axure database created');
        });

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
        objs = (typeof objs === 'string')?[objs]:objs;
        
        var _checkReady_ = setInterval(()=>{
            var exists = true;
            for (var i=0; i<objs.length; i++) {
                var obj = objs[i];
                
                if (window[obj] === undefined) {
                    console.log(0000, window[obj]);
                    exists = false;
                }
            }
            if (exists) {
                clearInterval(_checkReady_);
                callback();
            }
        }, 100);
    }

    function getFileExt(url) {
        var f = url.split('/').pop();

        if (f.indexOf('?')) {
            f = f.split('?')[0];
        }

        var ext = f.split('.');
        ext = ext[ext.length - 1];
        return ext;
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