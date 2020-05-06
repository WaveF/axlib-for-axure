(function(){

    main();

    function main() {
        // loadRes
        axlib.loadRes([
            'https://cdn.bootcss.com/weui/1.1.3/style/weui.min.css',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/css/jquery-weui.min.css',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/jquery-weui.min.js',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/swiper.min.js',
            'https://cdn.bootcss.com/jquery-weui/1.2.1/js/city-picker.min.js'
        ], ()=>{
            console.log('done');
        });
    }

}());