(function () {

    //--------------------------------------------------------------------------

    var $ax;

    //--------------------------------------------------------------------------

    main();

    function main() {

        console.clear();

        if (window.SLOT) return;
        window.SLOT = {
            version: '0.4.3',
            author: 'WaveF',
            contact: 'QQ:298010937'
        };

        $axure.internal(function (ax) {
            $ax = ax;
        });

        loadExJs([
            'https://minicg.com/libs/notify.min.js',
            'https://cdn.jsdelivr.net/npm/crypto-js@4.0.0/crypto-js.js',
            'https://cdn.jsdelivr.net/npm/sweetalert2@10.3.5/dist/sweetalert2.all.min.js'
        ], inited, false);
        
    }

    function inited() {
        customizeCSS();
        
        var slots = $('div[class*="ax-slot-bid"]');

        slots.each((i, k) => {
            var dp = $(k).parents('.panel_state').parent();
            var rp = dp.parents('div[data-label="AX-SLOT"]').get(0);
            var showNotify = $(k).siblings('div[class*="ax-slot-notify"]').find('.text').find('span').html();
            var showIcon = $(k).siblings('div[class*="ax-slot-icon"]').find('.text').find('span').html();
            var autoLoad = $(k).siblings('div[class*="ax-slot-auto-load"]').find('.text').find('span').html();
            var encryptKey = $(k).siblings('div[class*="ax-slot-encrypt-key"]').find('.text').find('span').html();
            var noEncrypt = $(k).siblings('div[class*="ax-slot-no-encrypt"]').find('.text').find('span').html();
            var bid = $(k).find('.text').find('span').html();
            
            rp.jsonbin = new jsonbin(bid);
            $(rp).css('overflow', 'hidden');

            if (encryptKey === undefined) {
                encryptKey = '';
            }

            rp.settings = {
                bid: bid,
                encryptKey: encryptKey,
                showNotify: isEnabled(showNotify),
                showIcon:   isEnabled(showIcon),
                autoLoad:   isEnabled(autoLoad),
                noEncrypt:  isEnabled(noEncrypt)
            };

            console.log('Settings:', rp.settings);

            if (!rp.settings.showIcon) {
                $(rp).hide();
            }
            if (rp.settings.autoLoad) {
                onRead(rp);
            }

            
            if (!hasBinId(bid)) {
                Swal.fire({
                    title: 'Bin id is empty',
                    text: "Do you want to create a new bin?",
                    // icon: 'question',
                    showCancelButton: true,
                    reverseButtons: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                }).then((result) => {
                    if (result.isConfirmed) {
                        onCreate(rp);
                    }
                });
            }

            $(rp).on('CmdChanged', onCmdChanged);
        });
    }

    function hasBinId(id) {
        if (!id || id == '' || id == 'Please enter jsonbin record id') {
            notify('Please provide correct jsonbin record id', 'error', true);
            notify('axslot won\'t work for now', 'error', true);
            return false;
        } else {
            return true;
        }
    }

    function isEnabled(val) {
        if (val == '是' || val == '1' || val == 'true' || val == 'True' || val == 'TRUE' || val == 'yes' || val == 'Yes' || val == 'YES') {
            return true;
        } else {
            return false;
        }
    }

    function onUpdate(rp) {
        if (!hasBinId(rp.settings.bid)) return;

        // 从中继器获取监视元件的名称与值
        var newData = formatRepeaterData(getRepeaterDataById(rp.id));

        // 针对 label、input、textarea 来构建 json 数据
        newData.map(n => {
            var target = $(`div[data-label="${n.watch}"]`);
            if (target.find('span').length > 0) {
                n.value = target.find('span').html();
            } else if (target.find('input').length > 0) {
                n.value = target.find('input').val();
            } else if (target.find('textarea').length > 0) {
                n.value = target.find('textarea').val();
            }
            return n;
        });
        console.log('Before Upload - get component values:', newData);

        // 先读取云端旧数据
        rp.jsonbin.read(oldData => {

            // 判断数据是否被加密
            if (oldData.encrypted) {
                if (rp.settings.encryptKey !== '') {
                    // 有加密，有密钥，直接解密
                    try {
                        oldData = decrypt(oldData.encrypted, rp.settings.encryptKey);
                    } catch (err) {
                        console.log('Secret key does not match.', err.message);
                        notify('Secret key does not match.', 'warn', rp.settings.showNotify);
                    }
                    console.log('Decrypt:', oldData);
                } else {
                    // 有加密，无密钥，提示失败
                    notify('Data had been encrypted, please provide secret key.', 'error', rp.settings.showNotify);
                    return;
                }
            }
            console.log('Before Upload - Get data from cloud:', oldData);

            // 以下是已解密或无加密的流程
            // 用旧补全新数据里的空数据
            $.each(newData, (i, k) => {
                if (k.value == undefined) {
                    if (oldData[i] && oldData[i].value) {
                        k.value = oldData[i].value;
                    }
                }
            });
            console.log('Before Upload - Fill empty value with old data:', oldData);

            // 补全后重新对数据进行加密
            if (!rp.settings.noEncrypt && rp.settings.encryptKey !== '') {
                newData = encrypt(newData, rp.settings.encryptKey);
                newData = {
                    encrypted: newData
                };
                console.log('Before Upload - Encrypt data:', newData);
            }

            // 上传新数据
            rp.jsonbin.update(newData, result => {
                notify('Data saved to cloud.', 'success', rp.settings.showNotify);
                console.log('After Upload - Final data:', result.data);

                // 重置指令集
                resetPanel($(rp).find('div[data-label="COMMANDS"]'));
            });
        });
    }

    function onRead(rp) {
        if (!hasBinId(rp.settings.bid)) return;

        rp.jsonbin.read(oldData => {

            // 数据已被加密
            if (oldData.encrypted) {
                console.log('Read Directly - Before encrypt:', oldData);
                if (rp.settings.encryptKey !== '') {
                    // 有加密，有密钥，直接解密
                    try {
                        oldData = decrypt(oldData.encrypted, rp.settings.encryptKey);
                    } catch (err) {
                        console.log('Secret does not match.', err.message);
                        notify('Secret does not match.', 'warn', rp.settings.showNotify);
                    }
                    console.log('Read Directly - After Decrypt:', oldData);
                } else {
                    // 有加密，无密钥，提示失败
                    notify('Data had been encrypted, please provide secret key.', 'error', rp.settings.showNotify);
                    return;
                }
            }

            notify('Data loaded from cloud.', 'success', rp.settings.showNotify);
            console.log('Read Directly - Final Data:', oldData);

            // 重置指令集
            resetPanel($(rp).find('div[data-label="COMMANDS"]'));

            // 向监视对象写入数据
            $.each(oldData, (i, k) => {
                var target = $(`div[data-label="${k.watch}"]`);
                var targetId = target.attr('id');
                var axTarget = $axure(`#${targetId}`);

                if (target.find('span').length > 0) {
                    // 文本标签
                    // axTarget.text(k.value);
                    target.find('.text').html(`<p><span>${k.value}</span></p>`);
                    target.find('.text').css({
                        'display': 'block',
                        'visibility': 'visible'
                    });
                } else if (target.find('input').length > 0) {
                    // 输入框
                    // axTarget.value(k.value);
                    target.find('input').val(k.value);
                } else if (target.find('textarea').length > 0) {
                    // 文本域
                    // axTarget.value(k.value);
                    target.find('textarea').val(k.value);
                }
            });

        });
    }

    function onCreate(rp) {

        Swal.fire({
            title: 'Create public bin',
            text: 'Paste your secret-key below:',
            input: 'text',
            footer: 'Login to&nbsp;<a href="https://jsonbin.io" target="_blank">jsonbin.io</a>&nbsp;then click&nbsp;<a href="https://jsonbin.io/api-keys" target="_blank">here</a>&nbsp;to get secret-key, watch&nbsp;<a href="https://www.youtube.com/watch?v=Hnfe6ZVOGzQ" target="_blank">video tutorial</a>',
            inputAttributes: {
                autocapitalize: 'off'
            },
            confirmButtonText: 'Create',
            reverseButtons: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: (prompt) => {},
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            console.log(result);
            if (result.isConfirmed) {
                // rp.jsonbin.create(data => {
                createBin(data => {

                    Swal.fire({
                        title: 'Your new bin-id is:',
                        text: data.id
                    });

                }, result.value, false);
            }

            // 重置指令集
            resetPanel($(rp).find('div[data-label="COMMANDS"]'));
        });
    }

    function onDelete(rp) {
        if (!hasBinId(rp.settings.bid)) return;

        Swal.fire({
            title: `Delete bin `,
            html: `Current bin id:&nbsp;<span style="font-family:monospace;color:#F20;font-weight:bold;font-size:14px;">${rp.settings.bid}</span>,<br>please provide your secret-key below:`,
            input: 'text',
            footer: 'Find your secret-key &nbsp;<a href="https://jsonbin.io/api-keys" target="_blank">here</a>&nbsp;',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showConfirmButton: true,
            confirmButtonText: 'Delete',
            reverseButtons: true,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: (prompt) => {},
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                rp.jsonbin.del(data => {

                    Swal.fire({
                        title: 'Bin has been deleted.',
                        text: data.id
                    });

                }, result.value);
            }

            // 重置指令集
            resetPanel($(rp).find('div[data-label="COMMANDS"]'));
        });

    }

    function notify(msg, type, show) {
        if (show) {
            $.notify(msg, type);
        }
    }

    function encrypt(obj, key) {
        return CryptoJS.AES.encrypt(JSON.stringify(obj), key).toString();
    }

    function decrypt(code, key) {
        var bytes = CryptoJS.AES.decrypt(code, key);
        var json = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(json);
    }

    function resetPanel(dPanel) {
        $axure(`#${dPanel.attr('id')}`).SetPanelState(1, {}, false);
    }

    function getActiveState(dPanel) {
        var states = dPanel.children('.panel_state');
        var actived;
        $.each(states, (i, k) => {
            if ($(k).css('display') != 'none') {
                actived = $(k);
            }
        });

        return {
            el: actived,
            id: actived.attr('id'),
            name: actived.data('label'),
            index: parseInt(actived.attr('id').split('_')[1].replace('state', ''))
        };
    }

    function onCmdChanged(e, cmd) {
        if (cmd.toLowerCase() === 'update') {
            onUpdate(e.currentTarget);
        } else if (cmd.toLowerCase() == 'read') {
            onRead(e.currentTarget);
        } else if (cmd.toLowerCase() == 'create') {
            onCreate(e.currentTarget);
        } else if (cmd.toLowerCase() == 'delete') {
            onDelete(e.currentTarget);
        }
    }

    function jsonbin(binID) {

        var self = this;
        var host = 'https://api.jsonbin.io';
        var binURL = `${host}/b/${binID}`;

        console.log(`%cVisit ${host} generate your own record id for free.`, 'background:#cbe7fe;');

        if (binID.length > 30) {
            var apikey = binID;
            create(data => {
                console.log(data);
            }, apikey);
            return;
        } else if (!binID) {
            notify('Need to provide jsonbin record id.', true);
            return;
        }

        this.id = binID;

        var setBinId = function (id) {
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
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: callback,
                error: function (err) {
                    console.log('AxSlot Error: Update', err);
                    notify('AxSlot: error, more detail in browser\'s console.', 'error', true);
                }
            });
        }

        function read(callback) {
            $.ajax({
                url: binURL + '/latest',
                // beforeSend: function (req) {
                //     req.setRequestHeader("secret-key", API_KEY);
                // },
                success: callback,
                error: function (err) {
                    console.log('AxSlot Error: Read', err);
                    notify('AxSlot: error, more detail in browser\'s console.', 'error', true);
                }
            });
        }

        function create(callback, secret_key, isPrivate) {
            createBin(callback, secret_key, isPrivate);
        }

        function del(callback, secret_key) {
            $.ajax({
                url: binURL,
                type: 'DELETE',
                beforeSend: function (req) {
                    req.setRequestHeader("secret-key", secret_key);
                },
                success: data => {
                    callback(data);

                },
                error: function (err) {
                    console.log('AxSlot Error: Delete', err);
                    notify('AxSlot: error, more detail in browser\'s console.', 'error', true);
                }
            });
        }

        function info() {
            return {
                host: host,
                id: binID,
                url: binURL
            }
        }

        return {
            create: create,
            update: update,
            read: read,
            del: del,
            info: info
        };
    }

    function createBin(callback, secret_key, isPrivate) {
        if (isPrivate === undefined) {
            isPrivate = false;
        }

        $.ajax({
            url: 'https://api.jsonbin.io/b',
            data: JSON.stringify({
                jsonbin: 'created'
            }),
            type: 'POST',
            beforeSend: function (req) {
                req.setRequestHeader("secret-key", secret_key);
                req.setRequestHeader("private", isPrivate);
            },
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: data => {
                callback(data);

            },
            error: function (err) {
                console.log('AxSlot Error: Create', err);
                notify('AxSlot: error, more detail in browser\'s console.', 'error', true);
            }
        });
    }

    function formatRepeaterData(_rpData, _dir) {
        var fmValue = [];

        _dir = _dir || 1;
        if (_dir === 1) {
            _rpData = _rpData;
        } else if (_dir == 2) {
            _rpData = reorderRepeaterData(_rpData);
        }

        $.each(_rpData, (n, m) => {
            var fmItem = {};
            for (var k in m) {
                fmItem[k] = m[k].text;
            }
            fmValue.push(fmItem);
        });
        return fmValue;
    }

    function reorderRepeaterData(_rpData) {
        var _newData = {};
        var _firstData = _rpData[0];

        for (var _n in _firstData) {
            _newData[_n] = [];
            $(_rpData).each((i, k) => {
                _newData[_n].push(k[_n]);
            });
        }
        return _newData;
    }

    function getRepeaterById(repeaterId) {
        var repeater;
        $axure(function (obj) {
            return obj.type == 'repeater';
        }).each(function (obj, id) {
            if (id == repeaterId) {
                repeater = obj;
            }
        });
        return repeater;
    }

    function getRepeaterDataById(repeaterId) {
        var ids = $ax.repeater.getAllItemIds(repeaterId);
        var columns = getRepeaterById(repeaterId).dataProps;
        rows = [];
        for (var i = 0, il = ids.length; i < il; i++) {
            var row = {};
            for (var j = 0, jl = columns.length; j < jl; j++) {
                var name = columns[j].toLowerCase();
                var id = ids[i];
                if ((typeof (id) == 'string') && (id.indexOf('-') != -1))
                    id = $ax.repeater.getItemIdFromElementId(id);
                var value = $ax.repeater.getData({}, repeaterId, ids[i], name, 'data');
                if (typeof (value) == 'object') {
                    value = $ax.deepCopy(value);
                    if (value.type === undefined)
                        value.type = 'text';
                    row[name] = value;
                } else {
                    row[name] = {
                        type: 'text',
                        text: value
                    };
                }
            }
            rows.push(row);
        }
        return rows;
    }

    function loadExJs(files, callback, sync) {

        var HEAD = document.getElementsByTagName('head')[0] || document.documentElement;

        if (!$.isArray(files)) {
            files = [files];
        }
        if (sync === undefined) {
            sync = true;
        }

        if (sync) {

            // 整体同步加载
            var s = [];
            var last = files.length - 1;

            //递归
            var recursiveLoad = function (i) {
                var fileUrl = files[i];

                s[i] = document.createElement('script');
                s[i].setAttribute('type', 'text/javascript');

                // 单个异步
                s[i].onload = s[i].onreadystatechange = function () {
                    if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                        this.onload = this.onreadystatechange = null;
                        this.parentNode.removeChild(this);
                        if (i !== last) {
                            recursiveLoad(i + 1);
                        } else if (typeof (callback) === 'function') {
                            callback();
                        };
                    }
                }

                // 单个同步
                s[i].setAttribute('src', fileUrl);

                HEAD.appendChild(s[i]);
            };
            recursiveLoad(0);

        } else {

            // 整体异步加载
            var s = [];
            var loaded = 0;
            for (var i = 0; i < files.length; i++) {
                var fileUrl = files[i];

                s[i] = document.createElement('script');
                s[i].setAttribute('type', 'text/javascript');

                // 单个异步
                s[i].onload = s[i].onreadystatechange = function () {
                    if (! /*@cc_on!@*/ 0 || this.readyState === 'loaded' || this.readyState === 'complete') {
                        loaded++;
                        this.onload = this.onreadystatechange = null;
                        // this.parentNode.removeChild(this);

                        if (loaded === files.length && typeof (callback) === 'function') {
                            callback();
                        }
                    }
                };

                // 单个同步
                s[i].setAttribute('src', fileUrl);

                HEAD.appendChild(s[i]);
            }
        }

    }

    function getFileExt (url) {
        var f = url.split('/').pop();

        if (f.indexOf('?')) {
            f = f.split('?')[0];
        }

        var ext = f.split('.');
        ext = ext[ext.length - 1];
        return ext;
    }

    function customizeCSS() {
        // sweetalert2
        $('head').append(`<link href="https://cdn.jsdelivr.net/npm/@sweetalert2/themes@4.0.0/bootstrap-4/bootstrap-4.min.css" type="text/css" rel="stylesheet">`);
        $('head').append(`<style>.swal2-title{font-size: 1.2rem;}.swal2-content{color:#aaa;font-size:.9em;}.swal2-styled.swal2-confirm,.swal2-styled.swal2-cancel{padding:.7rem 1.2rem;font-size:.85rem;}.swal2-footer{padding:1rem 1rem .5rem 1rem;}.swal2-actions{margin:1em auto 0;}.swal2-header{padding-top:.5em;}.swal2-footer{text-decoration:none;font-size:12px;color:#999;}.swal2-footer a{color:#06c;}<style>`);

        // notify.js
        $('head').append(`<style>.notifyjs-bootstrap-base{font-size:13px;}</style>`);

        // axslot icon animation
        $('head').append(`<style>.ax-slot-icon-blink{animation:blink .02s infinite;animation-direction:alternate;}@keyframes blink{0%{opacity:0;}100%{opacity:100;}}div[data-label="ghost"]{pointer-events:none}</style>`);
    }

}());