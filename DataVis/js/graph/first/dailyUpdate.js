/**
 * Created by zhangbobell on 14-12-11.
 */
define('dailyUpdate', ['jquery', 'utils', 'moment'], function($, utils, moment){

    function getClose() {
        var saikufile = 'report_dingdan_zc';
        return utils.xhr({
            url: 'graph/get_data_daily_last',
            data: {
                saikufile: saikufile,
                columns: ['订单关闭率', '订单退款率']
            }
        });
    }

    function getLost() {
        var saikufile = 'report_lost_shop';
        return utils.xhr({
            url: 'graph/get_data_daily_last',
            data: {
                saikufile: saikufile,
                columns: ['流失商家数']
            }
        });
    }

    function getUpset() {
        var saikufile = 'report_dayly_luanjia_lv';

        return utils.xhr({
            url: 'graph/get_data_daily_last',
            data: {
                saikufile: saikufile,
                columns: ['追灿招募乱价率', '非追灿招募乱价率']
            }
        });
    }

    function getUpset0() {
        var saikufile = 'report_dayly_luanjia';

        return utils.xhr({
            url: 'graph/get_data_daily_last',
            data: {
                saikufile: saikufile,
                columns: ['乱价商品数量', '平均乱价幅度', '渠道乱价率']
            }
        });
    }

    function convertData(d) {
        var data = JSON.parse(d);

        if (data['flag'] == 0) {
            return data;
        } else {
            $.each(data['res'], function(idx, ele){
                ele.parent = '渠道健康度';
                ele.curTag = moment(ele.curTag).format('YYYY-MM-DD');
                ele.prevTag = moment(ele.prevTag).format('YYYY-MM-DD');
            });
        }

        return data;
    }

    return {
        getClose: getClose,
        getLost: getLost,
        getUpset: getUpset,
        getUpset0: getUpset0,
        convertData: convertData
    };
});