/**
 * Created by bigMan.huizh on 2014/11/15.
 */
$(function(){
    var $uid;
    var $tag = true;

    $("#chose-user").change(function(event){
        event.preventDefault();

        //验证项目名称，项目数据库输入框的输入是否为空
        if($.trim($("#chose-user").val())==="0")
        {
            $.bootstrapGrowl('请选择所要编辑的用户名称！',{type: 'danger'});
            $("#chose-user").focus();
            return false;
        }

        var chose_user = {
            userid: $('#chose-user').val()
        };

        $.ajax({
            url: "management/chose_user",
            type: "post",
            async: false,
            dateType: "json",
            data: chose_user
        }).done(function (d) {
            da = JSON.parse(d);
            fetch_project_list(da);
            $uid = da[0].userid;
        });
    });

    function fetch_project_list(da){
        $('#username').val(da[0].username);
        $('#group').val(da[0].groupid);
        var $i = da[0].is_valid;
        if($i==1){  //此处不知道为什么
            $i=0;
        }else {
            $i=1;
        }
        $('input[name="is-valid"]').get($i).checked = true;
        var $j = 0;

        var arrayObj = new Array();
        $len = da.length;
        for(;$j<$len;$j++){
            arrayObj.push(da[$j].pid);
        }
        $('#auth-project').val(arrayObj);
    }

    $("#edit-user").click(function(event){
        event.preventDefault();

        if($.trim($('#password').val())!==$.trim($('#re-password').val()))
        {
            $.bootstrapGrowl('两次输入的密码不同！请重新输入.');
            $("#password").focus();
            return false;
        }
        //验证用户名，密码，组别三个输入框是否为空
        if($.trim($("#username").val())==="")
        {
            $.bootstrapGrowl('请填写用户名！');
            $("#username").focus();
            return false;
        }

        $("#edit-user").val("正在修改...");
        if($('#password').val() === ""){
            $tag = false;
        }
        var new_user = {
            username: $('#username').val(),
            password: $('#password').val(),
            group: $("#group").val(),
            //auth_project: $("#auth-project").text(),
            auth_project: $('#auth-project').val(),
            is_valid: $('input[name="is-valid"]:checked').val(),
            limitime:$('#limitime').val(),
            uid: $uid,
            tag: $tag
        };

        $.ajax({
            url: "management/update_user",
            type: "post",
            async: false,
            dateType: "json",
            data: new_user
        }).done(function (d) {
            if(d == 1){
                $.bootstrapGrowl('恭喜您，修改成功！', {type: 'success'});
            } else if(d == 0){
                $.bootstrapGrowl('很遗憾，修改失败！', {type: 'danger'});
            }

            $('#chose-user').val(0);
            $('#username').val("");
            $('#password').val("");
            $('#re-password').val("");
            $('#group').val("");
            $('#auth-project').val("");
            $('input[name="is-valid"]:checked').val("");
            $("#edit-user").val("修 改");
        });
    });

    $('#re-password').on('blur', function(){
        if($.trim($('#password').val())!==$.trim($('#re-password').val()))
        {
            $.bootstrapGrowl('两次输入的密码不同！请重新输入.', {type: 'danger'});
            $("#password").focus();
            return false;
        }
    })

    $('.form_datetime').datetimepicker({
        //language:  'fr',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        forceParse: 0,
        showMeridian: 1
    });
    $('.form_date').datetimepicker({
        language:  'fr',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });
    $('.form_time').datetimepicker({
        language:  'fr',
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 1,
        minView: 0,
        maxView: 1,
        forceParse: 0
    });
})