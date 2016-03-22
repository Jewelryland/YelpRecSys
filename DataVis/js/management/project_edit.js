/**
 * Created by bigMan.huizh on 2014/11/15.
 */
$(function(){
    var $pid;
    $("#chose-project").change(function(event){
        event.preventDefault();

        //验证项目名称，项目数据库输入框的输入是否为空
        if($.trim($("#chose-project").val())==="选择项目")
        {
            $.bootstrapGrowl('请选择所要编辑的项目名称！',{type: 'danger'});
            $("#chose-project").focus();
            return false;
        }

        var chose_project = {
            projectid: $('#chose-project').val()
        };

        $.ajax({
            url: "management/chose_project",
            type: "post",
            async: false,
            dateType: "json",
            data: chose_project
        }).done(function (d) {
            var da = JSON.parse(d);
            fetch_project_list(da);
            $pid = da.pid;
        });
    });

    function fetch_project_list(da){
        $('#projectname').val(da.projectname);
        $('#projectdb').val(da.dbname);
        var $i = da.is_valid;
        if($i==1){  //此处不知道为什么
            $i=0;
        }else {
            $i=1;
        }
        $('input[name="is-valid"]').get($i).checked = true;
    }

    $("#edit-project").click(function(event){
        event.preventDefault();
        //验证项目名称，项目数据库输入框的输入是否为空
        if($.trim($("#projectname").val())==="")
        {
            $.bootstrapGrowl('请选择项目！');
            $("#chose-project").focus();
            return false;
        }
        if($.trim($("#projectdb").val())==="")
        {
            $.bootstrapGrowl('请填写项目数据库！');
            $("#projectdb").focus();
            return false;
        }

        var new_project = {
            projectname: $('#projectname').val(),
            projectdb: $('#projectdb').val(),
            is_valid: $('input[name="is-valid"]:checked').val(),
            pid: $pid
        };

        $("#edit-project").val("正在修改...");

        $.ajax({
            url: "management/update_project",
            type: "post",
            async: false,
            dateType: "json",
            data: new_project
        }).done(function (d) {
            console.log(d);
            if(d == 1){
                $.bootstrapGrowl('恭喜您，修改成功！', {type: 'success'});
            } else if(d == 0){
                $.bootstrapGrowl('很遗憾，修改失败！', {type: 'danger'});
            }
            $('#chose-project').val("选择项目");
            $('#projectname').val("");
            $('#projectdb').val("");
            $("#edit-project").val("修 改");
        });
    });
})