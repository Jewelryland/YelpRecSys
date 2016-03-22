$(function(){

    $('#container4-1').drawLineChart_stream({
        title: '类目销量', // 主标题
        subtitle: '', // 副标题
        xLabel: '月份', // x 轴标题
        yLabel: '销量', // y 轴标题
        columns: ['unname-unname','unname上衣','儿童套装','女式上衣','女式内裤','女式内衣套装','女式秋裤','女式背心','女式马甲',
            '女式t恤','女式休闲裤','女式打底裤','女式短衫','女式长衫','女式上衣','女式中裤','女式家居服套装','女式睡裙','女式短裤',
            '女式长裤','女式袜子','情侣内衣','情侣家居服','男士unname','男士上衣','男士内裤','男士内衣套装','男士秋裤','男士背心',
            '男士马甲','男士T恤','男士上衣','男士中裤','男士家居服套装','男士短裤','男士长裤','男士袜子']
    }, {
        url: 'graph/sk_stream_leaf', // ajax 请求地址
        saikufile: 'report_month_order_category_num', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });



//    $('#container4-3').drawbubbleChart({
//        title: '商家铺货商品数量趋势', // 主标题
//        subtitle: '', // 副标题
//        xLabel: '增长系数', // x 轴标题
//        yLabel: '铺货商品数量'
//    }, {
//        url: 'graph/sk_stream_bubble', // ajax 请求地址
//        saikufile: 'report_recently_sellernick_up_num' // ajax 请求的 saiku 文件
//    });
//
//    $('#container4-4').drawbubbleChart({
//        title: '货号铺货数量趋势', // 主标题
//        subtitle: '', // 副标题
//        xLabel: '增长系数', // x 轴标题
//        yLabel: '铺货数量'
//    }, {
//        url: 'graph/sk_stream_bubble', // ajax 请求地址
//        saikufile: 'report_recently_itemnum_up_num' // ajax 请求的 saiku 文件
//    });
//
//    $('#container4-5').drawbubbleChart({
//        title: '货号销量趋势', // 主标题
//        subtitle: '', // 副标题
//        xLabel: '增长系数', // x 轴标题
//        yLabel: '商品销量'
//    }, {
//        url: 'graph/sk_stream_bubble', // ajax 请求地址
//        saikufile: 'report_recently_itemnum_sales_num' // ajax 请求的 saiku 文件
//    });



    $('#container4-7').drawLineChart_stream({
        title: '合作商家销售额', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '商家销售额'
    }, {
        url: 'graph/sk_stream_leaf', // ajax 请求地址
        saikufile: 'report_monthly_sellernick_sales_fee_2', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container4-8').drawLineChart_stream({
        title: '类目铺货量', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '铺货量'
    }, {
        url: 'graph/sk_stream_leaf', // ajax 请求地址
        saikufile: 'report_monthly_tags_up_num', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container4-9').drawLineChart_stream({
        title: '非合作商家销售额', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '商家销售额'
    }, {
        url: 'graph/sk_stream_leaf', // ajax 请求地址
        saikufile: 'report_monthly_sellernick_sales_fee_0', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });




});