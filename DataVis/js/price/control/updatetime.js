/**
 * Created by zhangbobell on 14-12-7.
 */
define('updatetime', ['utils'], function(utils){

    function get(){
        return utils.xhr({
            url: 'price/get_latest_crawl_time',
            data: {db: $('#db').val()}
        });
    }

    return {
        get: get
    };

});