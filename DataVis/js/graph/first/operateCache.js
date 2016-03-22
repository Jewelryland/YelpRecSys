/**
 * Created by Zhao on 15-3-15.
 */
define('operateCache', ['jquery', 'utils'], function($, utils){


    function setCache(o) {
        return utils.xhr({
            url: 'graph/write_first_data',
            data: o
        });
    }

    function getCache(o)
    {
        return utils.xhr({
            url: 'graph/get_fisrt_data',
            data: o
        });
    }


    return {
        setCache: setCache,
        getCache: getCache
    };
});