/**
 * 
 * AxLib v1.2.0
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/
(function () {

    var axhost = '';
    var resCount = 0;

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
                host   : axhost,
                db     : database,
                loadRes: loadRes,
                loadJS : loadJS,
                loadCSS: loadCSS,
                random : random
            };
        })($, $axure);
    }

    function loader() {
        var entry, debug, timestamp = '';

        $('script').each(function (i, k) {
            var src = $(k).attr('src') || '';
            src = src.toLowerCase();

            if (src.indexOf('axlib.js') != -1) {
                axhost = src.split('axlib.js')[0];
                entry  = $(k).attr('data-main');
                debug  = $(k).is("[debug]");
            }
        });

        if (!entry) return;
        if (entry.indexOf('.js') == -1) {
            entry += '.js';
        }
        if (debug) {
            timestamp = '?' + new Date().getTime();
        }

        if (entry.indexOf('http') == -1 || entry.indexOf('//') == -1) {
            entry = host + entry;
        }

        console.log({
            host:  axhost,
            entry: entry,
            debug: debug,
            timestamp: timestamp
        });

        loadJS(entry + timestamp);
    }

    function loadRes(urls, callback) {
        var count = 0;

        var recursiveCallback = function() {
            console.log('[loadRes] ' + urls[count] + ' loaded.');
            if (++count < urls.length) {
                var file = urls[count];
                if (file.indexOf('.js') != -1) {
                    loadJS(file, recursiveCallback);
                }
    
                if (file.indexOf('.css') != -1) {
                    loadCSS(file, recursiveCallback);
                }
            } else {
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

    function lorem(length, options, breakText) {
        // modify with https://github.com/webzhao/lorem-cn

        var WORDS = "的一是在不了有一和人这中大为上个国一以要时来用们生到作地於出一就分对成会可主发年动一同工也能下一过子说产种一面而方后多定行学法所民得经十三之进著等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心明看原又麼利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较长将组见计别手角期根论运农指几九区强放决西被乾做必战先回则任取据处队南给色光门即保治北造百规热领七海地口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住满县局照参红细引听该铁价首底液德调随苏尔讲配推显谈神艺呢席含企望批营项防举球英氧势告李台落木破亚师围注远字材排供河态另施减树溶怎止案言士均武固叶鱼波视仅费紧爱左章早朝续轻服试食充兵源护司足某练差致板田降黑犯负击范继兴似余坚曲输修的故城夫够送笑船占右财职觉汉画功巴跟虽杂飞检吸助升阳互初创抗考投策古径换未跑留钢曾端责站简述钱副尽帝射草冲承独令限阿宣环双请超微让控州良轴找否纪益依优顶础载倒房突坐粉敌略客袁冷胜绝析块剂测丝协重念陈仍罗盐友洋苦夜移频逐靠混母短皮终聚汽村云哪既距卫停烈央察迅行境若印洲刻括孔甚室待核校散侵吧甲游久菜味旧模湖货预毫普稳乙植息扩银语挥酒守拿序纸医缺雨吗针刘啊急唱训愿审附获茶鲜粮斤孩脱硫肥善龙演父渐欢械掌歌沙著刚攻谓盾讨晚粒乱燃矛乎宁鲁贵钟煤读班伯香介句丰培握兰担弦蛋沉假穿执答乐谁顺烟缩征脸喜松脚困异免背星福买染井概慢怕磁倍祖皇促静补评翻尼衣宽扬棉希伤操垂秋宜氢套笔督振架亮末宪庆编牛触映雷销诗座居抓裂胞呼景威绿晶厚盟衡孙延胶还屋乡临陆顾掉呀灯岁措束耐剧玉赵跳哥季课凯胡额款绍卷齐伟蒸殖永宗苗川岩弱零杨奏沿露杆探滑镇饭浓航怀赶",
            PUNCTUATIONS = "，，，，。！？",
            ENDPUNCTUATIONS = "。。。。。！？",
            vocabSize = WORDS.length,
            puncSize = PUNCTUATIONS.length,
            endPuncSize = ENDPUNCTUATIONS.length,
            minlengthToNextPunc = 10,
            maxlengthToNextPunc = 50,
            minlengthToBreakAfterPunc = 5,
            minlengthToNextBreak = 40,
            maxlengthToNextBreak = 200;

        var options = options || {},
            usePunc = typeof options.usePunc === 'undefined' ? true : options.usePunc,
            str = [],
            breakOption = breakText,
            length = parseInt(length) || 200,
            i = 0,
            chosen,
            puncCounter = 0,
            breakCounter = 0,
            lengthToNextPunc = Math.floor(Math.random() * (maxlengthToNextPunc - minlengthToNextPunc)) + minlengthToNextPunc,
            lengthToNextBreak = Math.floor(Math.random() * (maxlengthToNextBreak - minlengthToNextBreak)) + minlengthToNextBreak;

        while (i < length) {
            chosen = Math.floor(Math.random() * vocabSize);
            puncAfterBreak = lengthToNextPunc % lengthToNextBreak;

            if (usePunc && puncCounter == lengthToNextPunc && minlengthToNextPunc < (length - i)) {
                if (str.slice(-1) != '\n') {
                    str.push(PUNCTUATIONS.charAt(Math.floor(Math.random() * puncSize)));
                }
                lengthToNextPunc = Math.floor(Math.random() * (maxlengthToNextPunc - minlengthToNextPunc)) + minlengthToNextPunc;
                puncCounter = 0;
            } else {
                str.push(WORDS.charAt(chosen));
            }

            if (usePunc && breakOption && breakCounter == lengthToNextBreak && lengthToNextBreak < (length - i)) {
                if (str.slice(-1) == '。' || str.slice(-1) == '，' || str.slice(-1) == '！' || str.slice(-1) == '？') {
                    str = str.slice(0, str.length - 1);
                }
                str.push(ENDPUNCTUATIONS.charAt(Math.floor(Math.random() * endPuncSize)));
                str.push('\n');
                breakCounter = 0;
                lengthToNextBreak = Math.floor(Math.random() * (maxlengthToNextBreak - minlengthToNextBreak)) + minlengthToNextBreak;
            }
            
            if (!usePunc && breakOption && breakCounter == lengthToNextBreak && lengthToNextBreak < (length - i)) {
                str.push('\n');
                lengthToNextBreak = Math.floor(Math.random() * (maxlengthToNextBreak - minlengthToNextBreak)) + minlengthToNextBreak;
                breakCounter = 0;
            }
            
            puncCounter++;
            breakCounter++;
            i++;
        }
        
        if (usePunc) {
            str.push(ENDPUNCTUATIONS.charAt(Math.floor(Math.random() * endPuncSize)));
        }

        return str.join('');
    }

}());