/**
 * Created by zhangbobell on 14-10-30.
 */
require.config({
    baseUrl: 'public/js/price/control',
    paths:{
        'jquery': '../../../third-party/jquery/jquery.min',
        'bootstrap': '../../../third-party/bootstrap/js/bootstrap.min',
        'mrjsontable': '../../../third-party/mrjsontable/js/mrjsontable',
        'bootstrapGrowl': '../../../third-party/bootstrap-growl/jquery.bootstrap-growl',
        'jStorage': '../../../third-party/jStorage/jstorage.min',

        'utils': '../init_screen/utils',
        'controlList': 'controlList',
        'priceLog': 'priceLog',
        'updatetime': 'updatetime',
        'upsetProduct': 'upsetProduct',
        'loading': 'loading'
    },
    shim : {
        'bootstrap': {
            'deps' :['jquery']
        },
        'jStorage': {
            deps: ['jquery'],
            exports: 'jQuery.fn.jStorage'
        },
        'mrjsontable': {
            deps: ['jquery'],
            exports: 'jQuery.fn.mrjsontable'
        },
        'bootstrapGrowl': {
            deps: ['jquery', 'bootstrap'],
            exports: 'jQuery.fn.bootstrapGrowl'
        }
    }
});

require(['jquery', 'utils', 'controlList', 'priceLog', 'updatetime', 'upsetProduct', 'bootstrapGrowl', 'loading'], function($, utils, list, priceLog, updatetime, upsetProduct, bootstrapGrowl, loading){
    $(function() {

        control();

        function control() {

            loading.begin('正在获取最新爬取时间...')
            updatetime.get()
                .then(function(latestDate){
                    list.condition.updatetime = latestDate;

                    loading.setText('正在获取最新乱价名单...');
                    list.get()
                        .then(function(listData){
                            list.setData(listData);
                            list.condition.sellernick = list.getData()[0].sellernick;
                            list.fillTable(listData);
                            list.selectRow(0);

                            loading.setText('正在获取'+ list.condition.sellernick + '的乱价情况...');

                            $.when(priceLog.get(), upsetProduct.get())
                                .then(function(logData, productData){
                                    priceLog.fillTable(logData[0]);
                                    upsetProduct.fillTable(productData[0]);

                                    loading.end();
                                });
                        });
                });
        }

        $('#db').on('change', function(){
            control();
        })

        $("#upset-price-seller tbody tr").live('click', function(){
            var selectedIdx = $(this).attr('data-i');
            var data =  list.getData();

            list.condition.sellernick = data[selectedIdx].sellernick;

            $('tr', $(this).parent()).removeClass('tr-selected');
            $(this).addClass('tr-selected');

            $.when(priceLog.get(), upsetProduct.get())
                .then(function(logData, productData){
                    priceLog.fillTable(logData[0]);
                    upsetProduct.fillTable(productData[0]);
                });
        });

        $('#submit').on('click', function(){
            var upsetResult = {
                db: list.condition.db,
                sellernick:list.condition.sellernick,
                status: $('input[name="upset-result"]:checked').val(),
                msg: $('#remark').val()
            };

            utils.xhr({
                url: 'price/set_upset_price_result',
                data: upsetResult
            }).then(function(d){
                if (d == 1) {
                    toastr.success('标记成功。');
                    //$.bootstrapGrowl('标记成功。', {type: 'success'});
                } else {
                    toastr.success('标记出错。');
                    //$.bootstrapGrowl('标记出错。', {type: 'danger'});
                }

                $('#remark').val('');// 清空


                list.get()
                    .then(function(listData){
                        list.setData(listData);
                        list.condition.sellernick = list.getData()[0].sellernick;
                        list.fillTable(listData);
                        list.selectRow(0);

                        $.when(priceLog.get(), upsetProduct.get())
                            .then(function(logData, productData){
                                priceLog.fillTable(logData[0]);
                                upsetProduct.fillTable(productData[0]);

                                loading.end();
                            });
                    });
            });
        });
    })
});

/*$(function() {
    var data;
    var selectedIdx = 0;
    var condition = {
        db: $('#db').val(),
        updatetime: null,
        latestTime: null,
        sellernick: null
    };

    getLatestCrawlTime();

    $('#db').on('change', function(){
        condition.db = $(this).val();

        getLatestCrawlTime();
        initView();
    })

    // 初始化界面
    function initView(){
        getUpsetPriceSeller(condition);

        if (data.length === 0) {
            condition.sellernick = null;
        } else {
            condition.sellernick = data[selectedIdx].sellernick;
        }
        $("#upset-price-seller tbody tr:eq("+ selectedIdx +")").addClass('tr-selected');
        getUpsetPriceProduct(condition);
        getUpsetHistory(condition);
        getUnreviewedCount(condition);
    }

    // 获取所有乱价用户的列表
    function getUpsetPriceSeller (condition){
        if (condition.updatetime === condition.latestTime) {
            getLatestUpsetPriceSeller(condition);
        }
    }


    // 单击某行后获取指定用户的乱价商品列表
    $("#upset-price-seller tbody tr").live('click', function(){
        selectedIdx = $(this).attr('data-i');
        condition.sellernick = data[selectedIdx].sellernick;

        $('tr', $(this).parent()).removeClass('tr-selected');
        $(this).addClass('tr-selected');

        getUpsetPriceProduct(condition);
        getUpsetHistory(condition);
    });

    // 获取未确认产品个数
    function getUnreviewedCount(condition) {
        $.ajax({
            url:"price/get_unreviewed_count",
            type:"post",
            async:false,
            dateType:"json",
            data:condition
        }).done(function(d){
            if (d != 0) {
                $('#unreviewed-count').html('<p class="text-warning">当前列表有'+ d + '个产品没有人工确认，请到初次筛选栏进行确认！</p>')
            }
        });
    }

    // 提交按钮的写入事件
    $('#submit').on('click', function(){
        var upsetResult = {
            db: condition.db,
            sellernick:condition.sellernick,
            status: $('input[name="upset-result"]:checked').val(),
            msg: $('#remark').val()
        };

        $.ajax({
            url:"price/set_upset_price_result",
            type:"post",
            async:false,
            dateType:"json",
            data: upsetResult,
            success: function(d){
                console.log(d);
                if (d == 1) {
                    $.bootstrapGrowl('标记成功。', {type: 'success'});
                } else {
                    $.bootstrapGrowl('标记出错。', {type: 'danger'});
                }


                $('#remark').val('');// 清空
                initView(); // 重新初始化界面上所有元素
            }
        });

    });

    function getUpsetHistory(condition) {
        $.ajax({
            url:"price/get_upset_history",
            type:"post",
            async:false,
            dateType:"json",
            data:condition
        }).done(function(d){
            var data = JSON.parse(d);

            _displayUpsetHistory(data)
        });
    }

    function _displayUpsetHistory(d) {

    }
})*/
