$(function(){




    $('#container2-1').drawLineChart({
        title: '追灿招募成交额（不包含运费）', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '成交额', // y 轴标题
        columns: ['成交额'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_chengjiao_zc', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-2').drawLineChart_week({
        title: '追灿招募商家数量（分销商评级）', // 主标题
        subtitle: '', // 副标题
        xLabel: '序号', // x 轴标题
        yLabel: '成交额', // y 轴标题
        columns: ['无评级', '银卡', '金卡', '白金卡', '钻石卡', '金钻石卡']
    }, {
        url: 'graph/sk_yw', // ajax 请求地址
        saikufile: 'report_weekly_level_new', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-3').drawLineChart({
        title: '追灿招募商家数量', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '商家数量', // y 轴标题
        columns: ['商家数量'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_all_num', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-4').drawLineChart_week({
        title: '追灿招募成交额（分销商评级）', // 主标题
        subtitle: '', // 副标题
        xLabel: '序号', // x 轴标题
        yLabel: '商家数量', // y 轴标题
        columns: ['无评级', '银卡', '金卡', '白金卡', '钻石卡', '金钻石卡']
    }, {
        url: 'graph/sk_yw', // ajax 请求地址
        saikufile: 'report_weekly_level_num', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-5').drawLineChart({
        title: '平均上架商品数（追灿招募）', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '上架商品数', // y 轴标题
        columns: ['上架商品数'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_up_item', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-6').drawLineChart({
        title: '追灿招募上架率', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '上架率', // y 轴标题
        columns: ['上架率'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_up_rate', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-7').drawLineChart({
        title: '30天动销率', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '动销率', // y 轴标题
        columns: ['动销率'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // saiku结构是ym，取最小颗粒
        saikufile: 'report_monthly_dongxiao_rate_zc', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-8').drawLineChart({
        title: '全网销售额', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '成交额', // y 轴标题
        columns: ['追灿招募', '非追灿招募'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_chengjiao', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-9').drawLineChart({
        title: '渠道乱价率', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '乱价率', // y 轴标题
        columns: ['追灿招募','非追灿招募'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_wrong_price_rate_zc', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-10').drawLineChart({
        title: '订单退款率', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '退款率', // y 轴标题
        columns: ['追灿招募','非追灿招募'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_tuikuan_rate', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });

    $('#container2-11').drawLineChart({
        title: '订单关闭率', // 主标题
        subtitle: '', // 副标题
        xLabel: '日期', // x 轴标题
        yLabel: '关闭率', // y 轴标题
        columns: ['追灿招募','非追灿招募'] // 系列的名称
    }, {
        url: 'graph/sk_ymd', // ajax 请求地址
        saikufile: 'report_dayly_order_close_rate', // ajax 请求的 saiku 文件
        db: $("#db").val()
    });





});