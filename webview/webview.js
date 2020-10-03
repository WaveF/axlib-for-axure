(function(){

    if (window.AXURE_WEBVIEW !== undefined) return;

    var HEAD = document.getElementsByTagName('head')[0] || document.documentElement;
    var totalExFiles, currentExFile = 0;

    main();

    function main() {
        // console.clear();
        $axure.load = loadExternal;
        $axure.jsonbin = window.jsonbin = jsonbin;
        $axure.getAxureElement = getAxureElement;
        $axure.getRepeaterData = getRepeaterData;
        $axure.gval = $axure.setGlobalVariable;

        var webviews = $('.ax-webview');
        $.each(webviews, (i, k) => {
            if (!$(k).attr(`axure_webview_inited`)) {

                var root = $(k).parents(`.panel_state`).parent();
                var html = root.children(`.panel_state`).find('.ax-html').find(`textarea`).val();
                var css = root.children(`.panel_state`).find('.ax-css').find(`textarea`).val();
                var js = root.children(`.panel_state`).find('.ax-javascript').find(`textarea`).val();
                var external = root.children(`.panel_state`).find('.ax-external').find(`select option`);
                
                totalExFiles = external.length;
                
                $(k).children().hide();
                
                var appendLocalToDOM = function() {
                    $(`head`).append('<style>' + css.replace(/ /gi, '') + '</style>');
                    $(k).append(html.replace(/ /gi, ''));
                    $(`body`).append('<script>' + js.replace(/ /gi, '') + '</script>');
                    $(k).attr(`axure_webview_inited`, `true`);
                };

                if (totalExFiles > 0) {
                    var syncFiles = [], asyncFiles = [];

                    external.each((m, n) => {
                        var fileURL = $(n).val();
                        var isSync = ($(n).attr('selected')==='selected');
                        if (isSync) {
                            syncFiles.push(fileURL);
                        } else {
                            asyncFiles.push(fileURL);
                        }
                    });

                    loadExternal({
                        urls: syncFiles,
                        sync: true,
                        done: function(){
                            if (currentExFile !== totalExFiles) return;
                            appendLocalToDOM();
                        }
                    });

                    loadExternal({
                        urls: asyncFiles,
                        sync: false,
                        done: function(){
                            if (currentExFile !== totalExFiles) return;
                            appendLocalToDOM();
                        }
                    });
                } else {
                    if (currentExFile !== totalExFiles) return;
                    appendLocalToDOM();
                }

                window.AXURE_WEBVIEW = { name: 'axure webview', version: '2.5' };
                // console.log(window.AXURE_WEBVIEW);

            }
        });
    }


    function loadExternal (config) {
        if (config.urls.length == 0) return;

        var files = config.urls,
            sync = config.sync,
            callback = config.done;
        
        if (!$.isArray(files)) {
            files = [files];
        }
    
        if (sync === undefined) {
            sync = true;
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

        function appendExternalToDOM(_file, _loadFunc) {
            var f;
            var fileType = getFileExt(_file);

            if (fileType === 'js') {
                f = document.createElement('script');
                f.setAttribute('type', 'text/javascript');
                f.onload = f.onreadystatechange = _loadFunc;
                f.setAttribute('src', _file);
            } else if (fileType === 'css') {
                f = document.createElement('link');
                f.setAttribute('type', 'text/css');
                f.setAttribute('rel', 'text/stylesheet');
                f.onload = f.onreadystatechange = _loadFunc;
                f.setAttribute('href', _file);
            }
            HEAD.appendChild(f);
        }
        
        if (sync === true) {
            
            // 同步蔽塞
            var last = files.length - 1;
            
            var recursiveLoad = function (i) {

                var syncLoaded = function () {
                    if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                        this.onload = this.onreadystatechange = null;
                        // this.parentNode.removeChild(this);

                        console.log(`【外部同步加载 ${currentExFile+1}/${totalExFiles}】\n${$(this).attr('src')}`);
                        currentExFile++;

                        if (i !== last) {
                            recursiveLoad(i + 1);
                        } else {
                            if (typeof(callback) === 'function') {
                                callback();
                            }
                        };
                    } else {
                        console.log('状态：加载失败');
                    }
                };
                appendExternalToDOM(files[i], syncLoaded);

            };

            recursiveLoad(0);
    
        } else {
            
            // 异步加载
            var loaded = 0;
            var asyncLoaded = function () {
                if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                    loaded++;
                    this.onload = this.onreadystatechange = null;
                    // this.parentNode.removeChild(this);
                    if (loaded === files.length && typeof(callback) === 'function') {
                        console.log(`【外部异步加载 ${currentExFile+1}/${totalExFiles}】\n${$(this).attr('src')}`);
                        currentExFile++;
                        callback();
                    }
                }
            };
    
            for (var i = 0; i < files.length; i++) {
                appendExternalToDOM(files[i], asyncLoaded);
            }
    
        }
    };

    function jsonbin (binID) {

        var self = this;
        var host = 'https://api.jsonbin.io';
        var binURL = `${host}/b/${binID}`;
        
        if(binID.length > 30) {
            var apikey = binID;
            create(data=>{
                console.log(data);
            }, apikey);
            return;
        } else if(!binID) {
            alert('需提供数据存储槽ID，请联系WaveF获取（QQ：298010937）');
            return;
        }
        
        this.id = binID;

        var setBinId = function(id) {
            this.id = id;
        }.bind(this);

        function update(usrData, callback) {
            $.ajax({
                url: binURL,
                data: JSON.stringify(usrData),
                type: 'PUT',
                // beforeSend: function (req) {
                //     req.setRequestHeader("secret-key", API_KEY);
                // },
                contentType:"application/json; charset=utf-8",
                dataType: 'json',
                success: callback
            });
        }

        function read(callback) {
            $.ajax({
                url: binURL + '/latest',
                // beforeSend: function (req) {
                //     req.setRequestHeader("secret-key", API_KEY);
                // },
                success: callback
            });
        };

        function create(callback, API_KEY) {
            $.ajax({
                url: `${host}/b`,
                data: JSON.stringify({jsonbin:'created'}),
                type: 'POST',
                beforeSend: function (req) {
                    req.setRequestHeader("secret-key", API_KEY);
                },
                contentType:"application/json; charset=utf-8",
                dataType: 'json',
                success: data=>{
                    callback(data);
                    
                }
            });
        }

        function del() {

        };

        function info() {
            return {
                host: host,
                id:   binID,
                url:  binURL
            }
        }

        return {
            create: create,
            update: update,
            read:   read,
            del:    del,
            info:   info
        };
    }

    function getAxureElement(name) {
        return $axure(`@${name}`).$();
    }

    function formatRepeaterData(rpData) {
        var fmValue = [];
        $.each(rpData, (n, m)=>{
            var fmItem = {};
            for(var k in m) {
                fmItem[k] = m[k].text;
            }
            fmValue.push(fmItem);
        });
        return fmValue;
    }

    function getRepeaterData(rpName, format) {
        var rid = getAxureElement(rpName).attr('id');
        var repeater = { data: null };

        $axure(function (obj) {
            return obj.type == 'repeater';
        }).each(function (obj, id) {
            // let pid = obj.parent.objects[0].scriptIds[0];
            if (id == rid) {
                repeater = obj;
            }
        });

        if (format) {
            return formatRepeaterData(repeater.data);
        } else {
            return repeater.data;
        }
    }

}());