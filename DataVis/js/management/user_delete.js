/**
 * Created by bigMan.huizh on 2014/11/15.
 */

$(function(){
    $("#user-delete").click(function(event){
        event.preventDefault();

        //验证项目名称，项目数据库输入框的输入是否为空
        if($.trim($("#delete-user").val())==="")
        {
            $.bootstrapGrowl('请选择所要删除的用户！', {type: 'danger'});
            $("#delete-user").focus();
            return false;
        }

        var del_user = {
            userid: $('#delete-user').val()
        };

        $("#user-delete").val("正在删除...");

        $.ajax({
            url: "management/delete_user",
            type: "post",
            async: false,
            dateType: "json",
            data: del_user
        }).done(function (d) {
            if(d == '0'){  //d的数据集可能是一个json文件
                $.bootstrapGrowl('很遗憾，删除失败！', {type: 'danger'});
            } else {
                $.bootstrapGrowl('恭喜您，删除成功！', {type: 'success'});

                //删除之后动态重新加载数据库中剩余的信息
                //此时返回的data的数据是从数据库中查询到得到的最新数据，而不是简单的1或者0，可能是一个数组
                var data = JSON.parse(d);//将d转化成对象形式

                $('#delete-user').html('');//清空原来的数据
                $.each(data, function(idx, ele){
                    var $option = $('<option>').val(ele.userid).text(ele.username);
                    $('#delete-user').append($option);
                });
            }

            $('#user-delete').val("删 除");
        });

    });
})