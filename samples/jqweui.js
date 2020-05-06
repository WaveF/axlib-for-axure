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

            // $('head').append(`<style></style>`);
            axlib.addCssRules(`.weui-picker-modal{background:#f7f7f8;}`);

            $axure('@picker').$().find('input').picker({
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

        });
    }

}());