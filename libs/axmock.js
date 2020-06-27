/**
 * 
 * AxMock v0.1.7
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/
(function () {

    window.check_axure_loaded = setInterval(function () {
        if (window.$axure && window.$) {
            if (!window.Mock) {
                loadJS('https://cdn.jsdelivr.net/npm/mockjs@1.0.0/dist/mock.min.js', ()=>{
                    loadJS('https://cdn.jsdelivr.net/npm/typed.js@2.0.11/lib/typed.min.js', ()=>{
                        setTimeout(main, 300);
                    });
                });
            }
            clearInterval(check_axure_loaded);
        }
    }, 100);

    function main() {
        // console.clear();
        
        let css = [
            '.typed-cursor { display:none; }'
        ].join('');
        $('head').append('<style>' + css + '</style>');

        let axTextEls = $axure('*').$().find('span');
        axTextEls.each((i, k) => {
            let currentText = $(k).text();
            let updateText = currentText;

            let textRoot = $(k).parents('.text').parent();
            let textId = textRoot.attr('id');
            let mockId = `ax${i}_mock-text_${textId}`;
            $(k).attr('id', mockId).addClass('mock-text');

            updateText = mockText( updateText, '((日期))', Mock.mock('@datetime("yyyy年MM月dd日")') );
            updateText = mockText( updateText, '((时间))', Mock.mock('@datetime("HH:mm:ss")') );
            updateText = mockText( updateText, '((日期时间))', Mock.mock('@datetime("yyyy年MM月dd日 HH:mm:ss")') );
            updateText = mockText( updateText, '((数字))', Mock.mock({ "num|1-999": 1 }).num );
            updateText = mockText( updateText, '((数字#1))', Mock.mock({ "num|1-9": 1 }).num );
            updateText = mockText( updateText, '((数字#2))', Mock.mock({ "num|10-99": 10 }).num );
            updateText = mockText( updateText, '((数字#3))', Mock.mock({ "num|100-999": 100 }).num );
            updateText = mockText( updateText, '((数字#4))', Mock.mock({ "num|1000-9999": 1000 }).num );
            updateText = mockText( updateText, '((数字#5))', Mock.mock({ "num|10000-99999": 10000 }).num );
            updateText = mockText( updateText, '((数字#中))', Mock.mock('@cword("零一二三四五六七八九十")') );
            updateText = mockText( updateText, '((字母))', Mock.mock('@string("upper", 1, 10)') );
            updateText = mockText( updateText, '((字母#1))', Mock.mock('@string("upper", 1, 1)') );
            updateText = mockText( updateText, '((字母#2))', Mock.mock('@string("upper", 2, 2)') );
            updateText = mockText( updateText, '((字母#3))', Mock.mock('@string("upper", 3, 3)') );
            updateText = mockText( updateText, '((字母#4))', Mock.mock('@string("upper", 4, 4)') );
            updateText = mockText( updateText, '((字母#5))', Mock.mock('@string("upper", 5, 5)') );
            updateText = mockText( updateText, '((验证码))', Math.random().toString(36).slice(2,6).toUpperCase() );
            updateText = mockText( updateText, '((验证码#4))', Math.random().toString(36).slice(2,6).toUpperCase() );
            updateText = mockText( updateText, '((验证码#5))', Math.random().toString(36).slice(2,7).toUpperCase() );
            updateText = mockText( updateText, '((验证码#6))', Math.random().toString(36).slice(2,8).toUpperCase() );
            updateText = mockText( updateText, '((姓名))', Mock.mock('@cname()') );
            updateText = mockText( updateText, '((姓氏))', Mock.mock('@cfirst()') );
            updateText = mockText( updateText, '((名字))', Mock.mock('@clast()') );
            updateText = mockText( updateText, '((性别))', Math.random()>.5?'男':'女');
            updateText = mockText( updateText, '((年龄))', Mock.mock({ "num|18-50": 18 }).num + '岁' );
            updateText = mockText( updateText, '((电邮))', Mock.mock('@email()') );
            updateText = mockText( updateText, '((省份))', Mock.mock('@province()') );
            updateText = mockText( updateText, '((城市))', Mock.mock('@city()') );
            updateText = mockText( updateText, '((省市))', Mock.mock('@city(true)') );
            updateText = mockText( updateText, '((市区))', Mock.mock('@county(true)') );
            updateText = mockText( updateText, '((标题))', Mock.mock('@ctitle()') );
            updateText = mockText( updateText, '((单句))', (Mock.mock('@csentence()')).split('。').join('') );
            updateText = mockText( updateText, '((段落))', Mock.mock('@cparagraph()') );
            updateText = mockText( updateText, '((单字#1))', Mock.mock('@cword(1)') );
            updateText = mockText( updateText, '((单字#2))', Mock.mock('@cword(2)') );
            updateText = mockText( updateText, '((单字#3))', Mock.mock('@cword(3)') );
            updateText = mockText( updateText, '((单字#4))', Mock.mock('@cword(4)') );
            updateText = mockText( updateText, '((单字#5))', Mock.mock('@cword(5)') );
            updateText = mockText( updateText, '((单字#6))', Mock.mock('@cword(6)') );
            updateText = mockText( updateText, '((单字#7))', Mock.mock('@cword(7)') );
            updateText = mockText( updateText, '((单字#8))', Mock.mock('@cword(8)') );
            updateText = mockText( updateText, '((单字#9))', Mock.mock('@cword(9)') );
            updateText = mockColor($(k), updateText);

            // $(k).text(currentText);
            new Typed(`#${mockId}`, {
                strings: [currentText, updateText || '&nbsp;'],
                typeSpeed: 30
            });
            
            $('.typed-cursor').text('');
        });

    }

    function mockText(oldText, marker, mocked) {
        if (oldText.indexOf(marker) > -1) {
            var newText = oldText.split(marker).join(mocked);
            return newText;
        }
        return oldText;
    }

    function mockColor(target, oldText) {
        let marker = '((颜色))';
        let color = Mock.mock('@color()');
        if (oldText.indexOf(marker)>-1) {
            let newText = oldText.split(marker).join(color)
            let root = $(target).parents('.text').parent();
            root.css('background', color).find('img').hide();
            return newText;
        } else {
            return oldText;
        }
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