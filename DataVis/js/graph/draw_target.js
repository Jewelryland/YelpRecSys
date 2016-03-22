/**
 * Created by Zhao on 14-11-25.
 */

$(function(){


    function draw0(){
        $('#container3-0').drawLineChart({
            title: '年销售额', // 主标题
            subtitle: '', // 副标题
            xLabel: '日期', // x 轴标题
            yLabel: '销售额', // y 轴标题
            columns: ['销售额'], // 系列的名称
            target: ['0', '0']
        }, {
            url: 'graph/sk_ymd_t', // ajax 请求地址
            saikufile: 'report_dayly_chengjiao_zc', // ajax 请求的 saiku 文件
            db: $("#db").val()
        });
    }

//    function draw1(){
//        $('#container3-1').drawLineChart({
//            title: '乱价率', // 主标题
//            subtitle: '', // 副标题
//            xLabel: '日期', // x 轴标题
//            yLabel: '乱价率', // y 轴标题
//            columns: ['乱价率'], // 系列的名称
//            target: ['1', '1']
//        }, {
//            url: 'graph/sk_ym_avg_t', // ajax 请求地址
//            saikufile: 'report_dayly_wrong_price_rate', // ajax 请求的 saiku 文件
//            db: $("#db").val()
//        });
//    }
    function draw2(){
        $('#container3-2').drawLineChart({
            title: '追灿招募销售额', // 主标题
            subtitle: '', // 副标题
            xLabel: '日期', // x 轴标题
            yLabel: '销售额', // y 轴标题
            columns: ['销售额'], // 系列的名称
            target: ['1', '0']
        }, {
            url: 'graph/sk_md_t', // ajax 请求地址
            saikufile: 'report_dayly_chengjiao_zc', // ajax 请求的 saiku 文件
            db: $("#db").val()
        });
    }
    function draw3(){
        $('#container3-3').drawLineChart({
            title: '铺货商家数量', // 主标题
            subtitle: '', // 副标题
            xLabel: '日期', // x 轴标题
            yLabel: '商家数量', // y 轴标题
            columns: ['商家数量'], // 系列的名称
            target: ['1', '3']
        }, {
            url: 'graph/sk_md_t', // ajax 请求地址
            saikufile: 'report_dayly_puhuo_num', // ajax 请求的 saiku 文件
            db: $("#db").val()
        });
    }
//    function draw4(){
//        $('#container3-4').drawLineChart({
//            title: '非授权占比（销售额）', // 主标题
//            subtitle: '副标题 for test', // 副标题
//            xLabel: '日期', // x 轴标题
//            yLabel: '销售额', // y 轴标题
//            columns: ['销售额'], // 系列的名称
//            target: ['1', '0']
//        }, {
//            url: 'graph/sk_md_t', // ajax 请求地址
//            saikufile: 'report_dayly_feishouquan' // ajax 请求的 saiku 文件
//        });
//    }
    function draw5(){
        $('#container3-5').drawLineChart({
            title: '月累计招商数量', // 主标题
            subtitle: '', // 副标题
            xLabel: '日期', // x 轴标题
            yLabel: '招商数', // y 轴标题
            columns: ['招商数'], // 系列的名称
            target: ['1', '2']
        }, {
            url: 'graph/sk_md_t', // ajax 请求地址
            saikufile: 'report_dayly_cooperation_num', // ajax 请求的 saiku 文件
            db: $("#db").val()
        });
    }
    draw0();
    draw2();
//    draw1();
    draw5();
    draw3();
//    draw4();


    $('#btn0').on('click', function(){
        $.xhr0({
            url: 'graph/submit_target',
            data: {target: $('#target0').val(), user: $('#user').val(), period: $('#period0').val(), t_type: $('#t_type0').val()},
            success: function(d){
                d = JSON.parse(d);

                if (d == 1) {
                    draw0();
                } else {
                    alert('input target failed.');
                }
            }
        })
    });
//    $('#btn1').on('click', function(){
//        $.xhr0({
//            url: 'graph/submit_target',
//            data: {target: $('#target1').val(), user: $('#user').val(), period: $('#period1').val(), t_type: $('#t_type1').val()},
//            success: function(d){
//                d = JSON.parse(d);
//
//                if (d == 1) {
//                    draw1();
//                } else {
//                    alert('input target failed.');
//                }
//            }
//        })
//    });

    $('#btn2').on('click', function(){
        $.xhr0({
            url: 'graph/submit_target',
            data: {target: $('#target2').val(), user: $('#user').val(), period: $('#period2').val(), t_type: $('#t_type2').val()},
            success: function(d){
                d = JSON.parse(d);

                if (d == 1) {
                    draw2();
                } else {
                    alert('input target failed.');
                }
            }
        })
    });

    $('#btn3').on('click', function(){
        $.xhr0({
            url: 'graph/submit_target',
            data: {target: $('#target3').val(), user: $('#user').val(), period: $('#period3').val(), t_type: $('#t_type3').val()},
            success: function(d){
                d = JSON.parse(d);

                if (d == 1) {
                    draw3();
                } else {
                    alert('input target failed.');
                }
            }
        })
    });

    $('#btn4').on('click', function(){
        $.xhr0({
            url: 'graph/submit_target',
            data: {target: $('#target4').val(), user: $('#user').val(), period: $('#period4').val(), t_type: $('#t_type4').val()},
            success: function(d){
                d = JSON.parse(d);

                if (d == 1) {
                    draw4();
                } else {
                    alert('input target failed.');
                }
            }
        })
    });
    $('#btn5').on('click', function(){
        $.xhr0({
            url: 'graph/submit_target',
            data: {target: $('#target5').val(), user: $('#user').val(), period: $('#period5').val(), t_type: $('#t_type5').val()},
            success: function(d){
                d = JSON.parse(d);

                if (d == 1) {
                    draw5();
                } else {
                    alert('input target failed.');
                }
            }
        })
    });

});