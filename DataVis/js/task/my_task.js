/**
 * Created by zhangbobell on 2015/1/19.
 */
$(function(){

    $('.status-btn').css('display', 'none');

    var param;

    $('.task-item').on('click', function() {

        var _self = $(this);

        param = {
            db: $('#db').val(),
            taskId: _self.attr('data-id')
        };

        // 请求摘要信息
        $.ajax({
            url:"task/get_task_abstract_by_id",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            var data = JSON.parse(d);
            var abs = '备注：' + data[0].activity_comment + '<br />';
                abs += '指派人：' + data[0].username + '<br />';
                abs +='状态：' + data[0].action_status;


            $('#abs').animate({
                height: '0'
            }, {
               complete: function() {
                    $(this).remove();

                    var $abs = $('<div id="abs">').addClass('col-md-12').css('height', '0').html(abs);

                    $abs.insertAfter(_self.parent());
                    $abs.animate({
                       height: '100'
                    });

               }
            });

        }); // ajax 结束


        // 请求详细信息
        $.ajax({
            url:"task/get_task_detail_by_id",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            var data = JSON.parse(d);

            $.each(data, function(idx, ele) {
                if (ele.action_type_category == '1') {
                    var opts = ele.action_type_detail.split(',');
                    $select = $('<select>').addClass('user-input');
                    $.each(opts, function(idx, ele) {
                        var $opt = $('<option>').text(ele).val(ele);
                        $select.append($opt);
                    });

                    if (ele.action_tag != null || ele.action_tag != '') {
                        $select.find("option[value='"+ ele.action_tag +"']").attr('selected','selected');
                    }

                    ele.widget = $select.prop('outerHTML');


                } else if (ele.action_type_category == '2') {
                    $input = $('<input value="">').addClass('user-input');

                    if (ele.action_tag != null || ele.action_tag != '') {
                        $input = $('<input value="'+ ele.action_tag +'">');
                    } else {
                        $input = $('<input>');
                    }

                    $input.addClass('user-input')


                    console.log($input);
                    ele.widget = $input.prop('outerHTML');
                }

                console.log(ele);
            })

            _displayTask(data);
            $('.status-btn').css('display', '');
        }); // ajax 结束

    })


    $('.status-btn').on('click', function() {

        param.status = $(this).val();

        $.ajax({
            url:"task/process_task",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            if (d) {
                $.bootstrapGrowl('更新任务状态成功', {type: 'success'});
            } else {
                $.bootstrapGrowl('更新任务状态失败', {type: 'danger'});
            }
        });// ajax 结束

    });

    $('.user-input').live('blur', function(){
        param.task_item_result = $(this).val();
        param.task_item_obj = $(this).parent().parent().find("td[data-i='2']").text();

        $.ajax({
            url:"task/process_task_item",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            if (d) {
                $.bootstrapGrowl('写入成功', {type: 'success'});
            } else {
                $.bootstrapGrowl('写入失败', {type: 'danger'});
            }
        });// ajax 结束
    })


    /*
    * 通过 mrjsontable 展示任务详情
    * */
    function _displayTask(d) {

        $("#task-detail").html('');
        $("#task-detail").mrjsontable({
            tableClass: "table table-bordered table-hover",
            pageSize: 20,
            editable: false,
            dg_id: "DG-show-record",
            //updateCallback: _tableUpdateCallback,
            columns: [
                {
                    heading: "创建日期",
                    data: "createtime",
                    type: "datetime",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "更新日期",
                    data: "updatetime",
                    type: "datetime",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "任务目标",
                    data: "activity_target",
                    type: "string",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "操作类型",
                    data: "action_type",
                    type: "string",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "操作",
                    data: "widget",
                    type: "string",
                    sortable: false,
                    dg_visible: true,
                    dg_editable: true
                }
            ],
            data: d
        });
    }

});