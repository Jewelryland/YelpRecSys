/**
 * Created by hui.ZH on 2014/11/12.
 */
$(function() {
    $("#add-user").click(function(event){
        event.preventDefault();

        //验证两次输入的密码是否相同
        if($.trim($('#password').val())!==$.trim($('#re-password').val()))
        {
            $.bootstrapGrowl('两次输入的密码不同！请重新输入.', {type: 'danger'});
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
        if($.trim($("#password").val())==="")
        {
            $.bootstrapGrowl('请填写密码！');
            $("#password").focus();
            return false;
        }
        if($.trim($("#group").val())==="请选择组别")
        {
            $.bootstrapGrowl('请填写用户所在的组别！');
            $("#group").focus();
            return false;
        }

        var new_user = {
            username: $('#username').val(),
            password: $('#password').val(),
            group: $("#group").val(),
            auth_project: $('#auth-project').val(),
            is_valid: $('input[name="is-valid"]:checked').val()
        };

        $("#add-user").val("正在提交...");

        $.ajax({
            url: "management/add_user",
            type: "post",
            async: false,
            dateType: "json",
            data: new_user
        }).done(function (d) {
            console.log(d);
            if(d == 1){
                $.bootstrapGrowl('恭喜您，创建新用户成功！', {type: 'success'});
            } else if(d == 0){
                $.bootstrapGrowl('很抱歉，创建新用户失败！', {type: 'danger'});
            }else
                $.bootstrapGrowl('很抱歉，该用户名已存在！', {type: 'danger'});

            $('#username').val("");
            $('#password').val("");
            $('#re-password').val("");
            $('#group').val("");
            $('#auth-project').val("");
            $('input[name="is-valid"]:checked').val("");
            $("#add-user").val("添 加");
        });
    });

    //blur  当按钮失去焦点
    $('#username').on('blur', function(){
        $.ajax({
            url:"management/check_user_name",
            type:"post",
            async:false,
            dateType:"json",
            data: {"username": $('#username').val()}
        }).done(function(d){
            console.log(d);
            if(d == 1) {
                $.bootstrapGrowl('用户名已经存在！', {type: 'danger'});
            }
        });
    })
    $('#re-password').on('blur', function(){
        if($.trim($('#password').val())!==$.trim($('#re-password').val()))
        {
            $.bootstrapGrowl('两次输入的密码不同！请重新输入.', {type: 'danger'});
            $("#password").focus();
            return false;
        }
    })
})