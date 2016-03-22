/**
 * Created by zhangbobell on 14-12-7.
 */
define('loading', ['jquery'], function($){

    function begin(text) {
        setText(text);
        $('#loading').css('display', 'block');
    }

    function end() {
        $('#loading').css('display', 'none');
    }

    function setText(text) {
        $('#loading span').text(text ? text : '正在加载...');
    }

    return {
        begin: begin,
        end: end,
        setText: setText
    };
})