/**
 * Created by zhangbobell on 14-12-6.
 */
define('pageNumber', ['utils', 'initScreenList', 'jquery.simplePagination'], function(utils, list, pagination){

    function get(){
        return utils.xhr({
            url: "price/get_meta_item_count",
            data: {db: $('#db').val(), updatetime: $('#datetime-picker-input').val()}
        });
    }

    function setLink(totalPages, requestPage, pageSize){
        $('#pagination').pagination({
            items: totalPages,
            currentPage: (requestPage + 1),
            itemsOnPage: pageSize,
            prevText: '上一页',
            nextText: '下一页',
            hrefTextPrefix: '#',
            cssStyle: 'light-theme',
            selectOnClick: false,
            onPageClick: function(){
                $('#loading').css('display', 'block');
                list.condition.requestPage = this.currentPage

                $.when(list.get(), get()).then(function(listData, totalPages){
                    list.fillTable(listData[0]);
                    setLink(totalPages[0], list.condition.requestPage, list.condition.pageSize);
                    $('#loading').css('display', 'none');
                });
            }
        });
    }

    return {
        get: get,
        setLink: setLink
    };
});