/**
 * Created by zhangbobell on 14-12-18.
 */
$(function(){
    $('#tag441').on('change', function(){
        $.xhr0({
            url: 'graph/get_tag2',
            data: {tag1: $(this).val()},
            success: function(d) {
                var data = JSON.parse(d);
                if (data != 'null') {
                    var $select = $('<select>').addClass('form-control').attr('id', 'tag442');

                    var $opt = $('<option>').val('All').text('全部');
                    $select.append($opt);

                    $.each(data, function(idx, ele) {
                        var $opt = $('<option>').val(ele['tag2']).text(ele['tag2'] == '' ? 'unname': ele['tag2']);
                        $select.append($opt);
                    })

                    $('#tag442-wrap').html($select);
                } else {
                    $('#tag442-wrap').html('');
                    $('#tag443-wrap').html('');
                }
            }
        });
    })

    $('#tag442').live('change', function(){
        $.xhr0({
            url: 'graph/get_tag3',
            data: {tag1: $('#tag441').val(), tag2: $(this).val()},
            success: function(d) {
                var data = JSON.parse(d);
                if (data != 'null') {
                    var $select = $('<select>').addClass('form-control').attr('id', 'tag443');

                    var $opt = $('<option>').val('All').text('全部');
                    $select.append($opt);

                    $.each(data, function(idx, ele) {
                        var $opt = $('<option>').val(ele['tag3']).text(ele['tag3'] == '' ? 'unname': ele['tag3']);
                        $select.append($opt);
                    })

                    $('#tag443-wrap').html($select);
                } else {
                    $('#tag443-wrap').html('');
                }
            }
        });
    })

    $('#redraw-bubble-44').on('click', function(){

        $('#loading span').text('正在重新绘图...');
        $('#loading').css('display', 'block');

        $.jStorage.flush();
        $.xhr0({
            url: 'graph/redraw_bubble',
            data: {saikufile: 'report_recently_itemnum_up_num', tag1: $('#tag441').val(), tag2: $('#tag442').val(), tag3: $('#tag443').val()},
            success: function(d){
                var d = JSON.parse(d);
                var bubbleChart = {
                    title: '铺货商品数量', // 主标题
                    subtitle: '', // 副标题
                    xLabel: '日期', // x 轴标题
                    yLabel: '铺货商品数量'
                };

                bubbleChart.series = d['res'];
                $('#container4-4').bubbleChart(bubbleChart);
                $('#loading').css('display', 'none');
            }
        });
    });

    $('#tag451').on('change', function(){
        $.xhr0({
            url: 'graph/get_tag2',
            data: {tag1: $(this).val()},
            success: function(d) {
                var data = JSON.parse(d);
                if (data != 'null') {
                    var $select = $('<select>').addClass('form-control').attr('id', 'tag452');

                    var $opt = $('<option>').val('All').text('全部');
                    $select.append($opt);

                    $.each(data, function(idx, ele) {
                        var $opt = $('<option>').val(ele['tag2']).text(ele['tag2'] == '' ? 'unname': ele['tag2']);
                        $select.append($opt);
                    })

                    $('#tag452-wrap').html($select);
                } else {
                    $('#tag452-wrap').html('');
                    $('#tag453-wrap').html('');
                }
            }
        });
    })

    $('#tag452').live('change', function(){
        $.xhr0({
            url: 'graph/get_tag3',
            data: {tag1: $('#tag451').val(), tag2: $(this).val()},
            success: function(d) {
                var data = JSON.parse(d);
                if (data != 'null') {
                    var $select = $('<select>').addClass('form-control').attr('id', 'tag453');

                    var $opt = $('<option>').val('All').text('全部');
                    $select.append($opt);

                    $.each(data, function(idx, ele) {
                        var $opt = $('<option>').val(ele['tag3']).text(ele['tag3'] == '' ? 'unname': ele['tag3']);
                        $select.append($opt);
                    })

                    $('#tag453-wrap').html($select);
                } else {
                    $('#tag453-wrap').html('');
                }
            }
        });
    })

    $('#redraw-bubble-45').on('click', function(){

        $('#loading span').text('正在重新绘图...');
        $('#loading').css('display', 'block');

        $.xhr0({
            url: 'graph/redraw_bubble',
            data: {saikufile: 'report_recently_itemnum_sales_num', tag1: $('#tag451').val(), tag2: $('#tag452').val(), tag3: $('#tag453').val()},
            success: function(d){
                var d = JSON.parse(d);
                var bubbleChart = {
                    title: '铺货商品数量', // 主标题
                    subtitle: '', // 副标题
                    xLabel: '日期', // x 轴标题
                    yLabel: '铺货商品数量'
                };

                bubbleChart.series = d['res'];
                $('#container4-5').bubbleChart(bubbleChart);
                $('#loading').css('display', 'none');
            }
        });
    });


});