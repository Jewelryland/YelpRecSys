/**
 * Created by zhangbobell on 14-12-6.
 */
define('initScreenList', ['utils', 'mrjsontable.nosort', 'bootstrapGrowl'], function(utils, mrjsontable, bootstrapGrowl){
    var condition = {
        db: $('#db').val(),
        updatetime: $('#datetime-picker-input').val(),
        pageSize: 50,
        requestPage: 0, // 请求页面
        orderBy: null,
        isAsc: null
    };

    function get(){
        // 赋给 updatetime 新的值
        condition.db = $('#db').val();
        condition.updatetime = $('#datetime-picker-input').val();
        return utils.xhr({
            url: 'price/get_init_screen_product',
            data: condition
        });
    }

    function setTableAsc(){
        var $orderBy = $('a[data-o="'+ (condition.orderBy) +'"]');
        $orderBy.removeClass("s-A s-D");
        if (condition.isAsc == true) {
            $orderBy.addClass('s-A');
        } else if (condition.isAsc == false) {
            $orderBy.addClass('s-D');
        }
    }

    function fillTable(d){
        var data = JSON.parse(d);

        $("#init-sreen-product").html('');
        $("#init-sreen-product").mrjsontable({
            tableClass: "table table-bordered table-hover",
            pageSize: condition.pageSize,
            editable: true,
            dg_id: "DG-show-record",
            updateCallback: _tableUpdateCallback,
            columns: [
                {
                    heading: "更新日期",
                    data: "updatetime",
                    type: "datetime",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "卖家昵称",
                    data: "sellernick",
                    type: "string",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "商品地址",
                    data: "url",
                    type: "string",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "货号",
                    data: "itemnum",
                    type: "string",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "30天销量",
                    data: "recent_sold_quantity",
                    type: "int",
                    sortable: true,
                    dg_visible: false,
                    dg_editable: true
                },
                {
                    heading: "PC 端价格",
                    data: "price",
                    type: "float",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "移动端价格",
                    data: "price_wap",
                    type: "float",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "是否已确认",
                    data: "is_reviewed_item",
                    type: "string",
                    sortable: true,
                    dg_visible: false,
                    dg_editable: false
                }
            ],
            data: data
        });
    }

    function _tableUpdateCallback(){
        var record = {
            db: condition.db,
            sellernick: $('#dg-sellernick').val(),
            itemid: $($('#dg-url').val()).text(),
            itemnum: $('#dg-itemnum').val(),
            is_reviewed_item: 1
        };

        utils.xhr({
            url: 'price/set_checked_record',
            data: record
        }).then(function(){
            get().then(function(d){
                fillTable(d);
                d ? toastr.success('修改成功！') : toastr.error('修改失败！');
                $('#DG-show-record').modal('hide');
            })
        })
    }

    return {
        condition: condition,
        get: get,
        fillTable: fillTable,
        setTableAsc: setTableAsc
    };

})