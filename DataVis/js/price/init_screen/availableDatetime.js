/**
 * Created by zhangbobell on 14-12-5.
 */
define('availableDatetime', ['utils'], function(utils){

    function get(db){
        var data = {db: db};
        return utils.xhr({
            url: 'price/get_available_datetime',
            data: data
        });
    }

    return {
        get: get
    };
})