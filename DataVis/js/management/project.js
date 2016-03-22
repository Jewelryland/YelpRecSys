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
            url:"management/get_init_project",
            type:"post",
            async:false,
            dateType:"json",
            data:condition
        }).done(function(d){
            data = JSON.parse(d);
            $("#init-project").html("");
            fillInitProjectScreen(data);
        });
    }


    // 确认修改 click 事件
    function updateCallback(){
        $('#DG-show-record').modal('hide');
    };

    function fillInitProjectScreen(d) {
        $("#init-project").mrjsontable({
            tableClass: "table table-bordered table-hovprojecter",
            pageSize: 10,
            editable: false,
            dg_id: "DG-show-record",
            updateCallback: updateCallback,
            columns: [
                {
                    heading: "项目编号",
                    data: "pid",
                    type: "bigint",
                    dg_visible: true,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "项目名称",
                    data: "projectname",
                    type: "varchar",
                    dg_visible: true,
                    dg_editable: false,
                    sortable: true
                },
                {
                    heading: "数据库名称",
                    data: "dbname",
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