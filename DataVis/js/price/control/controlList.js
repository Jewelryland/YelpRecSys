/**
 * Created by zhangbobell on 14-12-7.
 */
define('controlList', ['jquery', 'utils', 'mrjsontable'], function($, utils, mrjsontable){

    var condition = {
        db: $('#db').val(),
        updatetime: null,
        sellernick: null
    }

    var data;

    function get() {
        condition.db = $('#db').val();
        return utils.xhr({
            url: 'price/get_upset_price_seller',
            data: condition
        });
    }

    function setData(d) {
        data = JSON.parse(d);
    }

    function getData() {
        return data;
    }

    function selectRow(idx) {
        $("#upset-price-seller tbody tr:eq("+ idx +")").addClass('tr-selected');
    }

    function fillTable(d){
        var data = JSON.parse(d);
        $("#upset-price-seller").html('');

        $("#upset-price-seller").mrjsontable({
            tableClass: "table table-bordered table-hover",
            pageSize: 10,
            columns: [
                {
                    heading: "更新日期",
                    data: "updatetime",
                    type: "datetime"
                },
                {
                    heading: "用户昵称",
                    data: "sellernick",
                    type: "string",
                    sortable: true
                },
                {
                    heading: "乱价商品数量",
                    data: "ljNum",
                    type: "int",
                    sortable: true
                },
                {
                    heading: "总商品数量",
                    data: "totalNum",
                    type: "int",
                    sortable: true
                },
                {
                    heading: "品牌乱价率",
                    data: "ljRate",
                    type: "float",
                    sortable: true
                },
                {
                    heading: "是否已沟通",
                    data: "status",
                    type: "int",
                    sortable: true
                },
                {
                    heading: "最后沟通时间",
                    data: "logTime",
                    type: "datetime",
                    sortable: true
                }
            ],
            data: data
        });
    }

    return {
        condition: condition,
        get: get,
        selectRow: selectRow,
        getData: getData,
        setData: setData,
        fillTable: fillTable
    };
});