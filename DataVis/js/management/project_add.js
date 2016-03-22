/**
 * Created by bigMan.huizh on 2014/11/15.
 */
$(function(){
  $("#add-project").click(function(event){
      event.preventDefault();

      //验证项目名称，项目数据库输入框的输入是否为空
      if($.trim($("#projectname").val())==="")
      {
          $.bootstrapGrowl('请填写项目名称！');
          $("#projectname").focus();
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
          projectdb: 'db_'+$('#projectdb').val(),
          is_valid: $('input[name="is-valid"]:checked').val()
      };

      $("#add-project").val("正在提交...");

      $.ajax({
          url: "management/add_project",
          type: "post",
          async: false,
          dateType: "json",
          data: new_project
      }).done(function (d) {
          console.log(d);
          if(d == 1){
              $.bootstrapGrowl('恭喜您，创建新项目成功！', {type: 'success'});
          } else if(d == 0){
              $.bootstrapGrowl('很遗憾，创建新项目失败！', {type: 'danger'});
          }else
              $.bootstrapGrowl('很遗憾，该项目已存在！', {type: 'danger'});

          $('#projectname').val("");
          $('#projectdb').val("");
          $("#add-project").val("添 加");
      });

  });

    $('#projectname').on('blur', function(){
        $.ajax({
            url:"management/check_project_name",
            type:"post",
            async:false,
            dateType:"json",
            data: {"projectname": $('#projectname').val()}
        }).done(function(d){
            console.log(d);
            if(d == 1) {
                $.bootstrapGrowl('用户名已经存在！', {type: 'danger'});
            }
        });
    })
})