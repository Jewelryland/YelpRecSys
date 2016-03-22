/**
 * Created by zhangbobell on 14-11-6.
 */

require.config({
    baseUrl: 'public/js/price/init_screen',
    paths:{
        'jquery': '../../../third-party/jquery/jquery.min',
        'bootstrap': '../../../third-party/bootstrap/js/bootstrap.min',
        'moment': '../../../third-party/momentjs/moment.min',
        'moment_cn': '../../../third-party/momentjs/locales/zh-cn',
        'jquery.simplePagination': '../../../third-party/jquery.simplePagination/jquery.simplePagination',
        'mrjsontable.nosort': '../../../third-party/mrjsontable/js/mrjsontable.nosort',
        'bootstrap-datetimepicker': '../../../third-party/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min',
        'bootstrapGrowl': '../../../third-party/bootstrap-growl/jquery.bootstrap-growl',

        'utils': 'utils',
        'availableDatetime': 'availableDatetime',
        'datetimepicker': 'datetimepicker',
        'initScreenList': 'initScreenList',
        'pageNumber': 'pageNumber',
        'loading': '../control/loading'
    },
    shim : {
        'bootstrap': {
            'deps' :['jquery']
        },
        'jquery.simplePagination': {
            deps: ['jquery'],
            exports: 'jQuery.fn.pagination'
        },
        'mrjsontable.nosort': {
            deps: ['jquery'],
            exports: 'jQuery.fn.mrjsontable'
        },
        'bootstrap-datetimepicker': {
            deps: ['jquery', 'bootstrap'],
            exports: 'jQuery.fn.datetimepicker'
        },
        'jquery.bootstrap-growl': {
            deps: ['jquery', 'bootstrap'],
            exports: 'jQuery.fn.bootstrapGrowl'
        }
    }
});

require(['jquery', 'availableDatetime', 'datetimepicker', 'initScreenList', 'pageNumber', 'utils', 'loading'], function($, availableDatetime, datetimepicker, list, pageNumber, utils, loading){
    $(function(){

        init_list();

        $('#db').on('change', function(){
            init_list();
        })

        // 单击排序事件
        $('.s-init').live('click', function(){
            if (list.condition.isAsc === null) {
                list.condition.isAsc = true;
            } else {
                list.condition.isAsc = !list.condition.isAsc;
            }

            list.condition.orderBy = $(this).attr('data-o');

            loading.begin('正在获取该页数据...');
            $.when(list.get(), pageNumber.get()).then(function(listData, totalPages){
                list.fillTable(listData[0]);
                pageNumber.setLink(totalPages[0], list.condition.requestPage, list.condition.pageSize);
                list.setTableAsc();

                loading.end();
            });
        })

        // 刷新数据按钮
        $('#refresh-crawl').on('click', function(){
            loading.begin('正在刷新数据...');

            utils.xhr({
                url: 'price/refresh_meta_item',
                data: {db: $('#db').val()}
            }).then(function(d){
                init_list();
                toastr.success('刷新爬取数据成功！')
            });
        });

        // 所有动作的启动函数
        function init_list() {

            loading.begin('正在获取可用的日期...');
            availableDatetime.get($('#db').val())
                .then(function(d){

                    loading.setText('正在设置日历...');
                    $.when(datetimepicker.set(d)).then(function(){

                        loading.setText('正在获取该页数据...');
                        $.when(list.get(), pageNumber.get()).then(function(listData, totalPages){
                            list.fillTable(listData[0]);
                            pageNumber.setLink(totalPages[0], list.condition.requestPage, list.condition.pageSize);
                            list.setTableAsc();

                            loading.end();
                        });
                    })
                });
        }

    });
})