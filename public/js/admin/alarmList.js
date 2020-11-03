define([
    "text!views/alarmList",
    "text!views/searchForm"
], function (
    HTML,
    searchForm
) {
    var AlarmHisModel = Backbone.Model.extend({
        url: '/alarm/alarms/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    })

    return Backbone.View.extend({
        el: '.component-box',
        config: {
            form: {
                name: 'alarmListForm',
                formHTML: searchForm,
                header: '조회',
                fields: undefined,
                actions: {
                    'reset': function() {
                        form.clear();
                        window.w2ui['alarmListGrid'].clear();
                        $('.w2ui-footer-left').text('');
                        window.w2ui['alarmListGrid'].off('refresh:after');
                        form.render();
                        window.main.view.adminView.initForm();
                    },
                    'save': function(){
                        var form = window.w2ui['alarmListForm'];
                        var record = form.record;
                        var gasType = record['gas_type']['value'];
                        if( gasType === 0){
                            gasType = undefined;
                        }

                        var _fromDate = $('input[name=fromDate]').val();
                        _fromDate = _fromDate.replace(/\//g, '-');

                        var _toDate = $('input[name=toDate]').val();
                        var date = new Date(_toDate);
                        date.setDate(date.getDate() + 1);

                        var endYear = date.getFullYear();
                        var endMonth = date.getMonth() + 1;
                        endMonth = endMonth >= 10 ? endMonth : '0' + endMonth;
                        var endDay = date.getDate();
                        endDay = endDay >= 10 ? endDay : '0' + endDay;
                        _toDate = endYear + '-' + endMonth + '-' + endDay;

                        var searchObj = {};
                        searchObj['fromDate'] = _fromDate;
                        searchObj['toDate'] = _toDate;
                        searchObj['gas_type'] = gasType;
                        window.main.view.adminView.search(searchObj);

                    }
                },
                onAction: function (event) {
                    var target = event.target;
                    if (target === 'download') {
                        window.main.view.adminView.excelDownload();
                    }
                    else if (target === 'toDay') {
                        window.main.view.setToday();
                    }
                    else if (target === 'thisWeek') {
                        window.main.view.setThisWeek();
                    }
                    else if (target === 'thisMonth') {
                        window.main.view.setThisMonth();
                    }
                    else if (target === 'lastMonth') {
                        window.main.view.setLastMonth();
                    }
                },
                onChange: function (event) {
                    var target = event.target;
                    if (target === 'locatation') {
                        var deviceVal = $('input[name=location]').val();
                    }
                    else if (target === 'fromDate' || target === 'toDate') {
                        $('.date-setting').find('.w2ui-btn').removeClass('w2ui-btn-blue');
                        window.main.view.dateCheck();
                    }

                }
            }, // end form
            grid: {
                name: 'alarmListGrid',
                recid: 'id',
                recordHeight : 30,
                show: { footer: true },
                columnGroups: [
                    { caption: '알람 발생 정보', span: 5 },
                    { caption: '검지 수치', span: 3 }
                ],
                columns: [          
                    { field: 'name', caption: '가스타입', size: '10%', attr: "align=right"},      
                    { field: 'state', caption: '상태', size: '8%', attr: "align=center" },
                    { field: 'record_time', caption: '발생시각', size: '15%', attr: "align=center" },
                    { field: 'restore_time', caption: '해제시각', size: '15%', attr: "align=center"},
                    { field: 'delay_time', caption: '총 경보시간', size: '12%', attr: "align=right"},
                    { field: 'init_value', caption: '초기 검지 수치', size: '10%', attr: "align=center"},
                    { field: 'max_value', caption: '최대 검지 수치(일시)', size: '15%', attr: "align=center"},
                    { field: 'normal_range', caption: '정상 수치', size: '15%', attr: "align=center"}
                ],
            } // end grid
        },
        initialize: function () {
            this.$el.html(HTML);
            this.render();
        },
        render: function() {
            var _this =this;
            var formOption = _this.config.form;
            var _fields = [
                { name: 'fromDate', type: 'date', options: { format: 'yyyy/mm/dd', end: $('input[name=toDate]'), keyboard: false, silent: false } },
                { name: 'toDate', type: 'date', options: { format: 'yyyy/mm/dd', end: $('input[name=fromDate]'), keyboard: false, silent: false } },
                { name: 'gas_type', type: 'list', options: { items: window.main.view.gasTypeCombo} }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#alarmList_form').w2form(formOption);
            _this.initForm();

            var gridOption = _this.config.grid;
            _this.$el.find('#alarmList_grid').w2grid(gridOption);

        },
        initForm: function() {
            var _this = this;
            var toDate = window.main.view.getToDay();
            _this.$el.find('input[name=fromDate]').val(toDate);
            _this.$el.find('input[name=toDate]').val(toDate);
            _this.$el.find('input[name=endDate]').removeClass('w2ui-error');
            _this.$el.find('#search-btn').prop('disabled', false);
            _this.$el.find('#download-btn').prop('disabled', true);
            _this.$el.find('#today-btn').trigger('click');

        },
        search: function(obj) {
            var _this = this;
            var model = new AlarmHisModel();
            model.url += '/search';
            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;
                    var _gasTypeCombo = window.main.view.gasTypeCombo;
                    for( i in result ) {
                        var recordTime = result[i]['record_time'];
                        var restoreTime = result[i]['restore_time'];
                        var delayTime = window.main.view.periodTime(recordTime, restoreTime);
                        result[i]['delay_time'] = '<p style="color:#516173">'+delayTime+'</p>';
                        recordTime = recordTime.substr(0,recordTime.indexOf(':',14));
                        recordTime = recordTime.replace('T', ' | ');
                        result[i]['record_time'] = '<p style="color:#FF0000">'+recordTime+'</p>';

                        if(restoreTime){
                            restoreTime = restoreTime.substr(0,restoreTime.indexOf(':',14));
                            restoreTime = restoreTime.replace('T', ' | ');
                        } else {
                            restoreTime = "미복구"
                        }
                        result[i]['restore_time'] = '<p style="color:#1ABA00">'+restoreTime+'</p>';

                        var maxRecord = result[i]['maxRecord_time'] || null; 
                        if(maxRecord){
                            maxRecord = maxRecord.substr(0,maxRecord.indexOf(':',14));
                            maxRecord = maxRecord.replace('T', ' | ');
                        } else {
                            maxRecord=" - "
                        }
                        var maxValue = result[i]['max_value'] || " - ";
                        result[i]['max_value'] = '<p style="color:#516173">'+maxValue+" ("+maxRecord+")</p>"; 
                        result[i]['state'] = '위험' 

                        for(j in _gasTypeCombo){
                            var _gasType = _gasTypeCombo[j]['value'];
                            var _gasName = _gasTypeCombo[j]['code'];
                            var _normalRange = _gasTypeCombo[j]['normal_range'];
                            if( result[i]['gas_type'] === _gasType ){
                                result[i]['name'] = _gasName;
                                result[i]['normal_range'] = _normalRange;
                            }
                        }

                   
                    }
                    var gridName = _this.config.grid['name'];
                    window.w2ui[gridName].records = result;
                    window.w2ui[gridName].refresh();

                    var resultLeng = result.length;
                    if (resultLeng > 0) {
                        _this.$el.find('#download-btn').prop('disabled', false);
                    }
                    else if (resultLeng == 0) {
                        _this.$el.find('#download-btn').prop('disabled', true);
                    }
                    
                    _this.footerSetDate();


                },
                error: function () {

                }
            });
        },
        footerSetDate: function(){
            var _this = this;
            var gridName = _this.config.grid['name'];
            var date = new Date();
            var toYear = date.getFullYear();
            var tempMonth = date.getMonth() + 1;
            var toMonth = tempMonth >= 10 ? tempMonth : '0' + tempMonth;
            var tempDate = date.getDate();
            var toDate = tempDate >= 10 ? tempDate : '0' + tempDate;

            var toHour = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
            var toMinute = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
            var toSec = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();

            var currentDate = toYear + '-' + toMonth + '-' + toDate + ' ' + toHour + ':' + toMinute + ':' + toSec;

            $('.w2ui-footer-left').text(currentDate);
            window.w2ui[gridName].on('refresh:after', function (event) {
                $('.w2ui-footer-left').text(currentDate);
            });

        },
        excelDownload: function (obj) {
            location.replace('/alarm/alarms/'+window.main.sensorIndex+'/excelDown');      
        },
        destroy: function () {
            var _this = this;
            var formName = _this.config.form['name'];
            if (window.w2ui.hasOwnProperty(formName)) {
                window.w2ui[formName].destroy()
            }
            var girdName = _this.config.grid['name'];
            if (window.w2ui.hasOwnProperty(girdName)) {
                window.w2ui[girdName].destroy()
            }
            this.undelegateEvents();
        },
    });
});