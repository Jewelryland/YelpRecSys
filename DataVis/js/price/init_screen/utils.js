/**
 * Created by zhangbobell on 14-12-5.
 */
define('utils', ['jquery'], function($){

    function xhr(o){
        return $.ajax({
            url: o.url,
            type:"post",
            async: true,
            dateType:"json",
            data: o.data
        });
    }

    return {
        xhr: xhr
    };
});
