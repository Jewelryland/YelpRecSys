/**
 * Created by zhangbobell on 14-12-5.
 */
define('datetimepicker', ['jquery', 'bootstrap-datetimepicker', 'moment', 'moment_cn', 'initScreenList', 'pageNumber', 'loading'], function($, datetimepicker, moment, cn, list, pageNumber, loading){

    function set(d){
        var dtd = $.Deferred();

        function setdatetimepicker(d){

            var availableDays = JSON.parse(d);
            var defaultDay; // 最新的爬虫时间

            availableDays = $.map(availableDays, function(ele,idx) {
                return moment(ele.updatetime, "YYYY-MM-DD")
            });

            defaultDay = availableDays[availableDays.length - 1];
            moment.locale('zh-cn');

            var $picker = $('#datetime-picker');
            var $pickerParent = $picker.parent();

            $picker.remove();

            $picker.datetimepicker({
                pickDate: true,
                pickTime: false,
                useMinutes: false,
                useSeconds: false,
                useCurrent: false,
                minuteStepping:1,
                showToday: true,
                language:'zh-cn',
                enabledDates: availableDays,
                icons : {
                    time: 'glyphicon glyphicon-time',
                    date: 'glyphicon glyphicon-calendar',
                    up:   'glyphicon glyphicon-chevron-up',
                    down: 'glyphicon glyphicon-chevron-down'
                },
                useStrict: false,
                sideBySide: false,
                daysOfWeekDisabled:[]
            });

            $picker.data("DateTimePicker").setDate(defaultDay);
            $pickerParent.append($picker);

            $picker.on("dp.change",function (e) {

                loading.begin('正在获取数据...');
                list.condition.updatetime = e.date.format('YYYY-MM-DD');

                $.when(list.get(), pageNumber.get()).then(function(listData, totalPages){
                    list.fillTable(listData[0]);
                    pageNumber.setLink(totalPages[0], list.condition.requestPage, list.condition.pageSize);
                    loading.end();
                });
            });

            return dtd.resolve();
        }

        setdatetimepicker(d);

        return dtd.promise();
    }

    return {
        set: set
    }

})