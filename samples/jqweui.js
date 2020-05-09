(function () {

    main();

    function main() {
        // loadRes
        axlib.loadRes([
            'https://cdn.bootcss.com/weui/1.1.3/style/weui.min.css',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/css/jquery-weui.min.css',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/jquery-weui.min.js',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/swiper.min.js',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/city-picker.min.js'
        ], () => {

            axlib.addCssRules(`.weui-picker-modal{background:#f7f7f8;}`);

            /*$axure('@picker1').$().find('input').val('').attr('placeholder', '请选择您的称呼').picker({
                title: "请选择您的称呼",
                cols: [{
                        textAlign: 'center',
                        values: ['赵', '钱', '孙', '李', '周', '吴', '郑', '王']
                        //如果你希望显示文案和实际值不同，可以在这里加一个displayValues: [.....]
                    },
                    {
                        textAlign: 'center',
                        values: ['杰伦', '磊', '明', '小鹏', '燕姿', '菲菲', 'Baby']
                    },
                    {
                        textAlign: 'center',
                        values: ['先生', '小姐']
                    }
                ]
            });

            $axure('@picker2').$().find('input').val('').attr('placeholder', '请选择居住地址').cityPicker({
                title: "请选择居住地址"
            });

            $axure('@picker3').$().find('input').val('').attr('placeholder', '请选择您的手机').picker({
                title: "请选择您的手机",
                cols: [{
                    textAlign: 'center',
                    values: ['iPhone 4', 'iPhone 4S', 'iPhone 5', 'iPhone 5S', 'iPhone 6', 'iPhone 6 Plus', 'iPad 2', 'iPad Retina', 'iPad Air', 'iPad mini', 'iPad mini 2', 'iPad mini 3']
                }]
            });

            $axure('@btnNotice').$().click(() => {
                $.notification({
                    title: "Baby",
                    text: "I miss you",
                    media: "<img src='https://minicg.com/wavef.png'>",
                    data: "123",
                    onClick: function (data) {
                        $.alert("Click" + data);
                    },
                    onClose: function (data) {
                        $.toast("自动关闭", "cancel");
                    }
                });
            });

            $axure('@btnTooltip').$().click(() => {
                $.toptip('顶部提示', 'success');
            });*/

            window.JQWEUI = window.jqweui = {
                picker: picker
            };
        });
    }

    /**
     * Turn axure element into JqWeUI Picker
     * 
     * @param {String} name - axure element which manual named
     * @param {Object} options
     * @param {String} options.type - 'single', 'multiple', 'city', 'data', 'datetime', default is 'single'
     * @param {String} options.title - title for popup picker
     * @param {Array}  options.items - an array contains picker items
     * @param {String} options.placeholder - placeholder for input element
     */
    function picker(name, options) {
        var target = $axure(`@${name}`).$().find('input');
        var {type, title, items, placeholder} = options;

        type = type.toLowerCase() || 'single';
        title = title || '请选择';
        placeholder = placeholder || title || '';

        if (placeholder) {
            target.val('').attr('placeholder', placeholder);
        }

        if (type == 'single') {
            target.picker({
                title: title,
                cols: [{ textAlign: 'center', values: items }]
            });
        }

        if (type == 'multiple') {
            var multiItems = [];
            for (let i in items) {
                multiItems.push({
                    textAlign: 'center',
                    values: items[i]
                });
            }
            target.picker({
                title: title,
                cols: multiItems
            });
        }

        if (type == 'city') {
            target.cityPicker({
                title: title
            });
        }

        if (type == 'date') {
            target.calendar();
        }

        if (type == 'datetime') {
            target.datetimePicker();
        }
    }

}());