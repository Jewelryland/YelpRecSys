/**
 * Created by hui.ZH on 2014/11/12.
 */
$(function() {

    var data;
    var condition = {
        db: 'etc_privileges'
    };
    fetch_init_screen_list(condition);

    function fetch_init_screen_list(condition) {
        $.ajax({
            url:"management/get_init_user",
            type:"post",
            async:false,
            dateType:"json",
            data:condition
        }).done(function(d){
            data = JSON.parse(d);

            $("#init-user").html("");
            fillInitUserScreen(data);
        });
    }

    // 确认修改 click 事件
    function updateCallback(){
        var record = {
            db: 'etc_privileges',
            username: $('#dg-username').val(),
            group: $('#dg-group').val()
        };
        set_checked_record(record);
        $('#DG-show-record').modal('hide');
    };

    /*
     * function: set_checked_record  保存修改
     *
     * 【注】现在还没想好怎么做，就暂时没有完善函数：management/set_checked_user_record
     */
    function set_checked_record(record) {
        $.ajax({
            url:"management/set_checked_user_record",
            type:"post",
            async:false,
            dateType:"json",
            data:record
        }).done(function(d){
            fetch_init_screen_list(condition);
        });
    }

    function fillInitUserScreen(d) {
        $("#init-user").mrjsontable({
            tableClass: "table table-bordered table-hover",
            pageSize: 10,
            editable: false,
            dg_id: "DG-show-record",
            updateCallback: updateCallback,
            columns: [
                {
                    heading: "用户编号",
                    data: "userid",
                    type: "int",
                    dg_visible: false,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "用户名",
                    data: "username",
                    type: "varchar",
                    dg_visible: true,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "组别",
                    data: "group",
                    type: "varchar",
                    dg_visible: true,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "授权项目",
                    data: "projectname",
                    type: "varchar",
                    dg_visible: true,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "是否已禁用",
                    data: "is_valid",
                    type: "enum",
                    dg_visible: false,
                    dg_editable: false
                    //sortable: true
                }
            ],
            data: d
        });
    }
})