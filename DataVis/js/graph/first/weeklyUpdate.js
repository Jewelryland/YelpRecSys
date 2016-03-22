/**
 * Created by zhangbobell on 14-12-10.
 */
define('weeklyUpdate', ['jquery', 'utils'], function($, utils){

    function getSales() {
        var skFile = 'report_weekly_level_num';

        return utils.xhr({
            url: 'graph/get_data_weekly_last',
            data: {saikufile: skFile, columns: ['无评级销售额', '银卡销售额', '金卡销售额', '白金卡销售额', '钻石卡销售额', '金钻石卡销售额']}
        });
    }

    function getSellers() {
        var skFile = 'report_weekly_level_new';

        return utils.xhr({
            url: 'graph/get_data_weekly_last',
            data: {saikufile: skFile, columns: ['无评级数量', '银卡数量', '金卡数量', '白金卡数量', '钻石卡数量', '金钻石卡数量']}
        });
    }

    function convertSales(d) {
        var data = JSON.parse(d);

        if (data['flag'] == 0) {
            return data;
        } else {
            $.each(data['res'], function(idx, ele){
                ele.parent = '销售额（周）';
            });
        }

        return data;
    }

    function convertSellers(d) {
        var data = JSON.parse(d);

        if (data['flag'] == 0) {
            return data;
        } else {
            $.each(data['res'], function(idx, ele){
                ele.parent = ele.name.substr(0, ele.name.length - 2) + '销售额';
            });
        }

        return data;
    }

    return {
        getSales: getSales,
        getSellers: getSellers,
        convertSales: convertSales,
        convertSellers: convertSellers
    };

});