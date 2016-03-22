/**
 * Created by zhangbobell on 14-12-7.
 */
define('upsetProduct', ['jquery', 'utils', 'mrjsontable', 'controlList'], function($, utils, mrjsontable, list){

    function get() {
        return utils.xhr({
            url: 'price/get_upset_price_product',
            data: list.condition
        });
    }

    function fillTable(d) {
        var data = JSON.parse(d);
        $("#upset-price-product").html('');

        $("#upset-price-product").mrjsontable({
            tableClass: "table table-bordered table-hover",
            pageSize: 5,
            columns: [
                {
                    heading: "用户昵称",
                    data: "sellernick",
                    type: "string",
                    sortable: true
                },
                {
                    heading: "商品地址",
                    data: "url",
                    type: "string"
                },
                {
                    heading: "货号",
                    data: "itemnum",
                    type: "string",
                    sortable: true
                },
                {
                    heading: "PC 端价格",
                    data: "price",
                    type: "float",
                    sortable: true
                },
                {
                    heading: "PC 端最低价",
                    data: "min_price",
                    type: "float",
                    sortable: true
                },
                {
                    heading: "移动端价格",
                    data: "price_wap",
                    type: "float",
                    sortable: true
                },
                {
                    heading: "移动端端最低价",
                    data: "min_price_wap",
                    type: "float",
                    sortable: true
                },
                {
                    heading: "是否已确认",
                    data: "is_reviewed_item",
                    type: "string",
                    sortable: true
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