/**
 * Created by zhangbobell on 14-12-10.
 */
require.config({
    baseUrl: 'public/js/graph/first',
    paths:{
        'jquery': '../../../third-party/jquery/jquery.min',
        'bootstrap': '../../../third-party/bootstrap/js/bootstrap.min',
        'moment': '../../../third-party/momentjs/moment.min',
        'moment_cn': '../../../third-party/momentjs/locales/zh-cn',
        'd3': '../../../third-party/d3/d3.min',

        'utils': '../../price/init_screen/utils',
        'loading': '../../price/control/loading',
        'tree': 'tree',
        'weeklyUpdate': 'weeklyUpdate',
        'dailyUpdate': 'dailyUpdate',
        'monthlyUpdate': 'monthlyUpdate',
        'operateCache': 'operateCache'
    },
    shim : {
        'bootstrap': {
            'deps' :['jquery']
        }
    }
});

require(['jquery', 'd3',  'tree', 'weeklyUpdate', 'loading', 'dailyUpdate', 'monthlyUpdate', 'operateCache'], function($, d3, tree, weeklyUpdate, loading, dailyUpdate, monthlyUpdate, operateCache){


    $(function(){

        var sales;
        var health;

        $.when(operateCache.getCache({'id': 1}), operateCache.getCache({'id': 2})).then(function(d1, d2){
            sales = JSON.parse(d1[0]);
            health = JSON.parse(d2[0]);

            if (sales && health) {

                loading.begin('正在绘图...');

                tree.draw('#container1', sales);
                tree.draw('#container2', health);

                loading.end();

            } else {
                loading.begin('正在请求数据...');

                $.when(drawSales(), drawHealth())
                    .then(function(){
                        loading.end();
                    });

            }
        });


        // 画销售额
        function drawSales() {

            var dtd = $.Deferred();

            function draw() {
                $.when(weeklyUpdate.getSales(), weeklyUpdate.getSellers(), monthlyUpdate.getZero())
                    .then(function(sales, sellers, zero){

                        var sales = weeklyUpdate.convertSales(sales[0]);
                        var sellers = weeklyUpdate.convertSellers(sellers[0]);
                        var zero = monthlyUpdate.convertZero(zero[0]);

                        var data = [{
                            name: '销售额（周）',
                            curTag: '本周',
                            curValue: null,
                            prevTag: '上周',
                            prevValue: null,
                            parent: 'null',
                            isNormal: true
                        },{
                            name: '0 销量商家',
                            curTag: '本周',
                            curValue: null,
                            prevTag: '上周',
                            prevValue: null,
                            parent: '销售额（周）',
                            isNormal: true
                        }];

                        if (sales['flag'] == 0) {
                            $('#info').append('<div>').text(sales['err'] + '，无法获取销售额，请刷新重试！');
                            $('#info').css('display', 'block');
                        } else {
                            $.each(sales['res'], function(idx, ele){
                                ele.isNormal = true;
                                data.push(ele);
                            });
                        }

                        if (sellers['flag'] == 0) {
                            $('#info').append('<div>').text(sellers['err'] + '，无法获取商家数目，请刷新重试！');
                            $('#info').css('display', 'block');
                        } else {
                            $.each(sellers['res'], function(idx, ele){
                                ele.isNormal = true;
                                data.push(ele);
                            });
                        }

                        if (zero['flag'] == 0) {
                            $('#info').append('<div>').text(zero['err'] + '，无法获取 0 销量商家，请刷新重试！');
                            $('#info').css('display', 'block');
                        } else {
                            $.each(zero['res'], function(idx, ele){
                                ele.isNormal = true;
                                data.push(ele);
                            });
                        }

                        if (sales['flag'] && sellers['flag'] && zero['flag']) {
                            $.when(operateCache.setCache({'data': data, 'id': 1})).then(function(d){
                                var data = JSON.parse(d);

                                var str;
                                str = data ? 'Success': 'failed';

                                alert(str);
                            });
                        }

                        tree.draw('#container1', data);

                        return dtd.resolve();
                    });
            }

            draw();

            return dtd.promise();
        }

        function drawHealth() {
            var dtd = $.Deferred();

            function draw() {
                $.when(dailyUpdate.getClose(), dailyUpdate.getLost(), dailyUpdate.getUpset0()).then(function(close, lost, upset0){
                    var close = dailyUpdate.convertData(close[0]);
                    var lost = dailyUpdate.convertData(lost[0]);
//                    var upset = dailyUpdate.convertData(upset[0]);
                    var upset0 = dailyUpdate.convertData(upset0[0]);

                    var data = [{
                        name: '渠道健康度',
                        curTag: '',
                        curValue: null,
                        prevTag: '',
                        prevValue: null,
                        parent: 'null',
                        isNormal: true
                    }];

                    // isNormal 是绝对值越大越好

                    if (close['flag'] == 0) {
                        $('#info').append('<div>').text(close['err'] + '，无法获取订单关闭比率，请刷新重试！');
                        $('#info').css('display', 'block');
                    } else {
                        $.each(close['res'], function(idx, ele){
                            ele.isNormal = false;
                            data.push(ele);
                        });
                    }

                    if (lost['flag'] == 0) {
                        $('#info').append('<div>').text(lost['err'] + '，无法获取流失商家数，请刷新重试！');
                        $('#info').css('display', 'block');
                    } else {
                        $.each(lost['res'], function(idx, ele){
                            ele.isNormal = false;
                            data.push(ele);
                        });
                    }


//                    $.each(upset['res'], function(idx, ele){
//                        ele.isNormal = false;
//                        data.push(ele);
//                    });

                    if (upset0['flag'] == 0) {
                        $('#info').append('<div>').text(upset0['err'] + '，无法获取乱价情况，请刷新重试！');
                        $('#info').css('display', 'block');
                    } else {
                        $.each(upset0['res'], function(idx, ele){
                            ele.isNormal = false;
                            data.push(ele);
                        });
                    }

                    if (close['flag'] && lost['flag'] && upset0['flag']) {
//                        $.jStorage.set('healthData', data, {TTL: 24*3600*1000});
                        $.when(operateCache.setCache({'data': data, 'id': 2})).then(function(d){
                            var data = JSON.parse(d);

                            var str;
                            str = data ? 'Success': 'failed';

                            alert(str);
                        });
                    }
                    tree.draw('#container2', data);

                    return dtd.resolve();
                });
            }

            draw();

            return dtd.promise();
        }


    });

});