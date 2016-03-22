/**
 * Created by zhangbobell on 2015/1/19.
 */
$(function(){

    $('.operate-area').css('display', 'none');

    var param;

    $('.acti-item').on('click', function() {

        var _self = $(this);

        param = {
            db: $('#db').val(),
            actiId: _self.attr('data-id')
        };

        // 请求摘要信息
        $.ajax({
            url:"task/get_activity_abstract_by_id",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            var data = JSON.parse(d);
            var abs = '备注：' + data[0].activity_comment + '<br />';

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
            url:"task/get_activity_detail_by_id",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            var data = JSON.parse(d);

            _displayActivity(data);
            $('.operate-area').css('display', '');
        }); // ajax 结束

    })


    $('#ass-submit').on('click', function() {

        param.username = $('#ass-user').val();
        param.actType = $('#ass-action-type').val();
        param.actName = $('#ass-action-name').val();

        $.ajax({
            url:"task/process_assign",
            type:"post",
            async:true,
            dateType:"json",
            data:param
        }).done(function(d){
            if (d) {
                $.bootstrapGrowl('任务指派成功', {type: 'success'});
            } else {
                $.bootstrapGrowl('任务指派失败', {type: 'danger'});
            }
        });// ajax 结束

    });


    /*
    * 通过 mrjsontable 展示活动详情
    * */
    function _displayActivity(d) {

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
                    heading: "活动目标",
                    data: "activity_target",
                    type: "string",
                    sortable: true,
                    dg_visible: true,
                    dg_editable: true
                },
                {
                    heading: "活动标签",
                    data: "activity_tag",
                    type: "string",
                    dg_visible: false,
                    dg_editable: false
                },
                {
                    heading: "活动类型",
                    data: "activity_type",
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