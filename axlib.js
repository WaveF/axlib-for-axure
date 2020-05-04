/**
 * 
 * AxLib v1.1.0
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/
(function () {

    var check_axure_loaded = setInterval(function () {
        if (window.$ && window.$axure) {
            clearInterval(check_axure_loaded);
            main();
        }
    }, 100);

    function main() {
        loader();
        
        window.axlib = window.AXLIB = (function ($, $axure) {
            return {
                db: database,
                loadJS: loadJS,
                loadCSS: loadCSS
            };
        })($, $axure);
    }

    function loader() {
        var host = '',  timestamp = '', entry, debug;

        $('script').each(function (i, k) {
            var src = $(k).attr('src') || '';
            src = src.toLowerCase();

            if (src.indexOf('axlib.js') != -1) {
                host  = src.split('axlib.js')[0];
                entry = $(k).attr('data-main');
                debug = $(k).is("[debug]");
            }
        });

        if (!entry) return;
        if (entry.indexOf('.js')==-1) { entry += '.js'; }
        if (debug) { timestamp = '?' + new Date().getTime(); }

        if (entry.indexOf('http') == -1 || entry.indexOf('//') == -1) {
            entry = host + entry;
        }

        console.log({
            host: host,
            entry: entry,
            debug: debug,
            timestamp: timestamp
        });

        loadJS(entry + timestamp);
    }

    function loadJS(url, cb) {
        var s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', url);
        document.querySelector('head').appendChild(s);
        s.onload = cb;
    };

    function loadCSS(url, cb) {
        var s = document.createElement('link');
        s.setAttribute('type', 'text/css');
        s.setAttribute('rel', 'Stylesheet');
        s.setAttribute('href', url);
        document.querySelector('head').appendChild(s);
        s.onload = cb;
    };

    function database() {
        var url = '';
        return {
            init: function (url) {
                var self = this;
                self.url = 'https://jsonbox.io/' + url;
                self.load(null, data=>{
                    if (data.length > 0) return;
                    self.save('axure database created');
                });
            },
            save: function (dataString, callback) {
                var self = this;
                $.ajax({
                    url: self.url,
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
            },
            load: function (gval, callback) {
                var self = this;
                $.ajax({
                    url: self.url,
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
            }
        }
    }

}());