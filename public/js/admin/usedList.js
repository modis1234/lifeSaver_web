define([
    "text!views/usedList",
    "text!views/searchForm",
], function (
    HTML,
    searchForm
) {
    var UsedHisModel = Backbone.Model.extend({
        url: '/used/usedes/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    })

    return Backbone.View.extend({
        el: '.component-box',
        config: {
            form: {
                name: 'usedListForm',
                formHTML: searchForm,
                header: '조회',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        form.clear();
                        window.w2ui['usedListGrid'].clear();
                        $('.w2ui-footer-left').text('');
                        window.w2ui['usedListGrid'].off('refresh:after');
                        form.render();
                        window.main.view.adminView.initForm();
                    },
                    'save': function () {
                        var form = window.w2ui['usedListForm'];
                        var record = form.record;

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
                name: 'usedListGrid',
                recid: "id",
                recordHeight: 30,
                show: { footer: true },
                columnGroups: [
                    { caption: '장비 사용 정보', span: 3 },
                    { caption: '최종 검지 수치', span: 5 }
                ],
                // columns: [
                //     { field: 'start_time', caption: '시작시각', size: '25%', attr: "align=center" },
                //     { field: 'end_time', caption: '종료시각', size: '25%', attr: "align=center" },
                //     { field: 'delay_time', caption: '사용시간', size: '18%', attr: "align=right" },
                //     { field: 'final_value', caption: '최종 검지 수치', size: '18%', attr: "align=left" },
                // ],
                columns: [
                    { field: 'start_time', caption: '시작시각', size: '20%', attr: "align=center" },
                    { field: 'end_time', caption: '종료시각', size: '20%', attr: "align=center" },
                    { field: 'delay_time', caption: '사용시간', size: '15%', attr: "align=right" },
                    { field: 'voc_value', caption: '휘발성유기화합물', size: '10%', attr: "align=center" },
                    { field: 'comb_value', caption: '가연성가스', size: '10%', attr: "align=center" },
                    { field: 'o2_value', caption: '산소', size: '10%', attr: "align=center" },
                    { field: 'h2s_value', caption: '황화수소', size: '10%', attr: "align=center" },
                    { field: 'co_value', caption: '일산화탄소', size: '10%', attr: "align=center" }
                ],
                records: undefined
            } // end grid
        },
        initialize: function () {
            this.$el.html(HTML);
            this.render();
        },
        render: function () {
            var _this = this;
            var formOption = _this.config.form;

            var _fields = [
                { name: 'fromDate', type: 'date', options: { format: 'yyyy/mm/dd', end: $('input[name=toDate]'), keyboard: false, silent: false } },
                { name: 'toDate', type: 'date', options: { format: 'yyyy/mm/dd', end: $('input[name=fromDate]'), keyboard: false, silent: false } }
            ]
            formOption['fields'] = _fields;
            _this.$el.find('#usedList_form').w2form(formOption);
            _this.initForm();

            var gridOption = _this.config.grid;
            _this.$el.find('#usedList_grid').w2grid(gridOption);
        },
        initForm: function () {
            var _this = this;
            _this.$el.find('.w2ui-field:nth-child(4)').css('display', 'none');
            var toDate = window.main.view.getToDay();
            _this.$el.find('input[name=fromDate]').val(toDate);
            _this.$el.find('input[name=toDate]').val(toDate);
            _this.$el.find('input[name=endDate]').removeClass('w2ui-error');
            _this.$el.find('#search-btn').prop('disabled', false);
            _this.$el.find('#download-btn').prop('disabled', true);
            _this.$el.find('#today-btn').trigger('click');


        },
        search: function (obj) {
            var _this = this;
            var model = new UsedHisModel();
            model.url += '/search';
            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;
                    for (i in result) {
                        var _startTime = result[i]['start_time'] || null;
                        var _endTime = result[i]['end_time'] || null;

                        var delayTime = window.main.view.periodTime(_startTime, _endTime);
                        result[i]['delay_time'] = '<p style="color:#516173">' + delayTime + '</p>';

                        if (_startTime) {
                            _startTime = _startTime.substr(0, _startTime.indexOf(':', 14));
                            _startTime = _startTime.replace('T', ' | ');
                        } else {
                            _startTime = ' - '
                        }
                        result[i]['start_time'] = '<p style="color:#516173">'+_startTime+'</p>';

                        if (_endTime) {
                            _endTime = _endTime.substr(0, _endTime.indexOf(':', 14));
                            _endTime = _endTime.replace('T', ' | ');
                        } else {
                            _endTime = ' - '
                        }
                        result[i]['end_time'] = '<p style="color:#516173">'+_endTime+'</p>';
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

                    //  트리구조
                    // window.w2ui[gridName].on('render:after', function (event) {
                    //     var hasClaz = $('.w2ui-show-children').hasClass('w2ui-icon-collapse');
                    //     if (hasClaz) {
                    //         $('.w2ui-show-children').removeClass('w2ui-icon-collapse');
                    //         $('.w2ui-show-children').addClass('w2ui-icon-expand');
                    //     }
                    // });
                    _this.footerSetDate();
                   
                },
                error: function () {

                }
            });

        },
        excelDownload: function (obj) {
            location.replace('/used/usedes/'+window.main.sensorIndex+'/excelDown');      
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