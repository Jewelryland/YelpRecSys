/**
 * Created by zhangbobell on 14-12-7.
 */
define('priceLog', ['jquery', 'utils', 'mrjsontable', 'controlList'], function($, utils, mrjsontable, list){

    function get() {
        return utils.xhr({
            url: 'price/get_upset_history',
            data: list.condition
        });
    }

    function fillTable(d) {
        var data = JSON.parse(d);

        $("#upset-history").html('');

        $("#upset-history").mrjsontable({
            tableClass: "table table-bordered",
            pageSize: 5,
            columns: [
                {
                    heading: "更新日期",
                    data: "updatetime",
                    type: "datetime"
                },
                {
                    heading: "管理员",
                    data: "account",
                    type: "string",
                    sortable: true
                },
                {
                    heading: "状态",
                    data: "status",
                    type: "int",
                    sortable: true
                },
                {
                    heading: "备注",
                    data: "msg",
                    type: "string"
                }
            ],
            data: data
        });
    }

    return {
        get: get,
        fillTable: fillTable
    };
});