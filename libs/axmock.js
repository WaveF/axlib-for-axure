/**
 * 
 * AxMock v0.1.2
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/
(function () {

    window.check_axure_loaded = setInterval(function () {
        if (window.$axure && window.$) {
            if (!window.Mock) {
                loadJS('https://cdn.bootcdn.net/ajax/libs/Mock.js/1.0.0/mock-min.js', ()=>{
                    loadJS('https://cdn.bootcdn.net/ajax/libs/typed.js/2.0.11/typed.min.js', ()=>{
                        setTimeout(main, 300);
                    });
                });
            }
            clearInterval(check_axure_loaded);
        }
    }, 100);

    function main() {
        let axTextEls = $axure('*').$().find('span');
        axTextEls.each((i, k) => {
            mockText( $(k), '((日期))', Mock.mock('@datetime("yyyy年MM月dd日")') );
            mockText( $(k), '((时间))', Mock.mock('@datetime("HH:mm:ss")') );
            mockText( $(k), '((日期时间))', Mock.mock('@datetime("yyyy年MM月dd日 HH:mm:ss")') );
            
            mockText( $(k), '((数字))', Mock.mock({ "num|1-999": 1 }).num );
            mockText( $(k), '((数字#1))', Mock.mock({ "num|1-9": 1 }).num );
            mockText( $(k), '((数字#2))', Mock.mock({ "num|10-99": 10 }).num );
            mockText( $(k), '((数字#3))', Mock.mock({ "num|100-999": 100 }).num );
            mockText( $(k), '((数字#4))', Mock.mock({ "num|1000-9999": 1000 }).num );
            mockText( $(k), '((数字#5))', Mock.mock({ "num|10000-99999": 10000 }).num );
            mockText( $(k), '((数字#中))', Mock.mock('@cword("零一二三四五六七八九十")') );
            
            mockText( $(k), '((字母))', Mock.mock('@string("upper", 1, 10)') );
            mockText( $(k), '((字母#1))', Mock.mock('@string("upper", 1, 1)') );
            mockText( $(k), '((字母#2))', Mock.mock('@string("upper", 2, 2)') );
            mockText( $(k), '((字母#3))', Mock.mock('@string("upper", 3, 3)') );
            mockText( $(k), '((字母#4))', Mock.mock('@string("upper", 4, 4)') );
            mockText( $(k), '((字母#5))', Mock.mock('@string("upper", 5, 5)') );

            mockText( $(k), '((验证码))', Math.random().toString(36).slice(2,6).toUpperCase() );
            mockText( $(k), '((验证码#4))', Math.random().toString(36).slice(2,6).toUpperCase() );
            mockText( $(k), '((验证码#5))', Math.random().toString(36).slice(2,7).toUpperCase() );
            mockText( $(k), '((验证码#6))', Math.random().toString(36).slice(2,8).toUpperCase() );

            mockText( $(k), '((姓名))', Mock.mock('@cname()') );
            mockText( $(k), '((姓氏))', Mock.mock('@cfirst()') );
            mockText( $(k), '((名字))', Mock.mock('@clast()') );
            mockText( $(k), '((性别))', Math.random()>.5?'男':'女');
            mockText( $(k), '((年龄))', Mock.mock({ "num|18-50": 18 }).num + '岁' );
            mockText( $(k), '((电邮))', Mock.mock('@email()') );

            mockText( $(k), '((省份))', Mock.mock('@province()') );
            mockText( $(k), '((城市))', Mock.mock('@city()') );
            mockText( $(k), '((省市))', Mock.mock('@city(true)') );
            mockText( $(k), '((市区))', Mock.mock('@county(true)') );

            mockColor( $(k), Mock.mock('@color()') );
            
            mockText( $(k), '((标题))', Mock.mock('@ctitle()') );
            mockText( $(k), '((单句))', (Mock.mock('@csentence()')).split('。').join('') );
            mockText( $(k), '((段落))', Mock.mock('@cparagraph()') );
        });
    }

    function mockText(target, marker, mocked) {
        if ($(target).hasClass('mock-text')) return;

        var currentText = $(target).text();
        // console.log(getLength(marker));
        
        if (currentText.indexOf(marker) > -1) {
            let textRoot = $(target).parents('.text').parent();
            let textId = textRoot.attr('id');
            var newText = currentText.split(marker).join(mocked);
            // $(target).text(newText);


            $(target).attr('id', `mock-text-${textId}`).addClass('mock-text');
            
            console.log($(target));
            let typed = new Typed(`#mock-text-${textId}`, {
                strings: [currentText, newText],
                typeSpeed: 30
            });

            $('.typed-cursor').hide();
        }
    }

    function mockColor(target, color) {
        var marker = '((颜色))';
        var currentText = $(target).text();
        if (currentText.indexOf(marker)==-1) return;

        var root = $(target).parents('.text').parent();
        root.css('background', color).find('img').hide();
        $(target).text(currentText.split(marker).join(color));
    }

    function getLength(str) {
        var len = str.split('#')[1];
        if (len) {
            len = len.split('))').join('');
            len = parseInt(len);
            if (!isNaN(len)) {
                return len;
            }
        }
        return null;
    }

    function loadJS(url, cb) {
        var s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute('src', url);
        document.querySelector('head').appendChild(s);
        s.onload = cb
    };

}());