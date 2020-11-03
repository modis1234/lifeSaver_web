define([
    "text!views/sensorInfo",
    "text!views/sensorForm"
], function (
    HTML,
    sensorForm
) {
    var SensorInfoModel = Backbone.Model.extend({
        url: '/sensor/sensors',
        parse: function (result) {
            return result;
        }
    });

    return Backbone.View.extend({
        el: '.component-box',
        config: {
            grid: {
                name: 'sensorInfoGrid',
                recid: "id",
                recordHeight: 150,
                show: {
                    // toolbar: true,
                    footer: true,
                    // selectColumn: true
                },
                columns: [
                    { field: 'sensor_index', caption: '센서별칭', size: '10%', attr: "align=center" },
                    { field: 'action', caption: '상태', size: '5%', attr: "align=center" },
                    { field: 'used_time', caption: '동작시각', size: '15%', attr: "align=center" },
                    { field: 'delay_time', caption: '사용시간', size: '10%', attr: "align=center" },
                    { field: 'warmingup_count', caption: '워밍업(초)', size: '8%', attr: "align=center" },
                    { field: 'rolling_count', caption: '롤링(초)', size: '8%', attr: "align=center" },
                    { field: 'alarm_path', caption: '위험알림음', size: '15%', attr: "align=center" },
                    { field: 'value', caption: '검지수치', size: '20%', attr: "align=left" }
                ],
                records: undefined,
                toolbar: {
                    items: [
                        { type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
                    ],
                    onClick: function (evt) {
                        var target = evt.target;
                        if (target === 'w2ui-reload') {
                            window.main.view.adminView.SensorInfoModel.fetch()
                        }
                        else if (target === 'deleteBtn') {
                            var grid = window.w2ui['sensorInfoGrid'];
                            var selectIdArr = grid.getSelection();
                            var _selectIdCnt = selectIdArr.length;
                            if (_selectIdCnt) {
                                var options = {
                                    msg: "선택 된 " + _selectIdCnt + "개 데이터를 삭제하시겠습니까?",
                                    title: '수신자 삭제',
                                    width: 450,
                                    height: 220,
                                    btn_yes: {
                                        text: '확인',
                                        class: '',
                                        style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
                                        callBack: function () {
                                            for (var i in selectIdArr) {
                                                window.main.view.adminView.delete(selectIdArr[i]);

                                            }
                                        }
                                    },
                                    btn_no: {
                                        text: '취소',
                                        class: '',
                                        style: '',
                                        callBack: function () {
                                        }
                                    },
                                    callBack: null
                                };
                                w2confirm(options);

                            } else {
                                w2alert("삭제할 데이터를 선택하세요");
                            }
                        }
                        else if (target === 'w2ui-column-on-off') {
                            // $('.w2ui-col-on-off tr:nth-child(1)').css('display','none');
                            // $('.w2ui-col-on-off tr:nth-child(7)').css('display','none');

                        }
                    } //end items- onClick
                },
                multiSearch: false,
                onClick: function (event) {
                    var grid = this;
                    var form = w2ui['sensorInfoForm'];
                    event.onComplete = function () {
                        var sel = grid.getSelection();
                        if (sel.length == 1) {
                            form.grid = sel[0];
                            form.record = $.extend(true, {}, grid.get(sel[0]));
                            form.refresh();
                            $('.w2ui-btn-blue').prop('disabled', false);

                        } else {
                            form.clear();
                            $('.w2ui-btn-blue').prop('disabled', true);
                            $('.w2ui-field').find('input').removeClass('w2ui-error');
                            window.main.view.adminView.initForm();
                        }
                    }
                }
            }, // end grid
            form: {
                name: 'sensorInfoForm',
                formHTML: sensorForm,
                header: '수신자 정보',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        form.clear();
                        window.w2ui['sensorInfoGrid'].selectNone();
                        window.main.view.adminView.initForm();

                    },
                    'save': function () {
                        var form = window.w2ui['sensorInfoForm'];
                        var record = form.record;
                        var _id = record['id'];
                        var _name = $('input[name=name]').val();
                        var _tel = $('input[name=tel]').val();
                        var _smsYN = record['sms_yn']['text'];
                        if (!_name) {
                            w2alert("이름을 입력하세요");
                            return false;
                        }
                        if (!_tel) {
                            w2alert("연락처를 입력하세요");
                            return false;
                        }

                        var recordObj = {};
                        recordObj['name'] = _name;
                        recordObj['tel'] = _tel;
                        recordObj['sms_yn'] = _smsYN;


                        if (_id) {
                            // update
                            recordObj['id'] = _id;
                            var options = {
                                msg: "선택 된 수신자를 수정하시겠습니까?",
                                title: '수신자 수정',
                                width: 450,
                                height: 220,
                                btn_yes: {
                                    text: '확인',
                                    class: '',
                                    style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
                                    callBack: function () {

                                        window.main.view.adminView.update(recordObj);
                                    }
                                },
                                btn_no: {
                                    text: '취소',
                                    class: '',
                                    style: '',
                                    callBack: function () {
                                    }
                                },
                                callBack: null
                            };
                            w2confirm(options);

                        } else {
                            // insert
                            var options = {
                                msg: "새로운 수신자를 등록 하시겠습니까?",
                                title: '수신자 등록',
                                width: 450,
                                height: 220,
                                btn_yes: {
                                    text: '확인',
                                    class: '',
                                    style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
                                    callBack: function () {
                                        window.main.view.adminView.insert(recordObj);

                                    }
                                },
                                btn_no: {
                                    text: '취소',
                                    class: '',
                                    style: '',
                                    callBack: function () {
                                    }
                                },
                                callBack: null
                            };
                            w2confirm(options);
                        }


                    }
                }
            }, // end form
        },
        initialize: function () {
            this.$el.html(HTML);

            this.sensorInfoModel = new SensorInfoModel();
            this.listenTo(this.sensorInfoModel, "sync", this.getsensorInfoList);
            this.sensorInfoModel.fetch();

            this.render();
            console.log(sensorForm);
        },
        events: {
            'change input.w2ui-input': 'activeSaveBtn'
        },
        activeSaveBtn: function (evt) {
            $('.w2ui-btn-blue').prop('disabled', false);
        },
        getsensorInfoList: function (model, response) {
            var _this = this;
            var result = response;
            console.log(result);

            for (i in result) {
                var _action = result[i]['action'];
                if (_action === 0) {
                    result[i]['action'] = 'OFF'
                }
                else if (_action === 1) {
                    result[i]['action'] = 'ON'
                }
                else if (_action === 2) {
                    result[i]['action'] = 'LOADING..'
                }

                var _startTime = result[i]['start_time'] || null;
                var _endTime = result[i]['end_time'] || null;

                var delayTime = window.main.view.periodTime(_startTime, _endTime);
                result[i]['delay_time'] = '<p style="color:#516173">' + delayTime + '</p>';

                if (_startTime) {
                    _startTime = _startTime.substr(0, _startTime.indexOf(':', 14));
                    _startTime = _startTime.replace('T', ' | ');
                }
                result[i]['start_time'] = '<p style="color:#516173">' + _startTime + '</p>';

                if (_endTime) {
                    _endTime = _endTime.substr(0, _endTime.indexOf(':', 14));
                    _endTime = _endTime.replace('T', ' | ');
                } else {
                    _endTime = ' - '
                }
                result[i]['end_time'] = '<p style="color:#516173">' + _endTime + '</p>';

                result[i]['used_time'] = '<span>시작시각:'+result[i]['start_time']+'<br/>'
                                        +'종료시각:'+result[i]['end_time']+'<br/>'
                                        +'</span>'


                var _recordTime = result[i]['record_time'] || null;
                if (_recordTime) {
                    _recordTime = _recordTime.substr(0, _recordTime.indexOf(':', 14));
                    _recordTime = _recordTime.replace('T', ' | ');
                } else {
                    _recordTime = ' - '
                }

                var o2Value = result[i]['o2_value'];
                var o2Code = result[i]['o2_state_code'];
                var vocValue = result[i]['voc_value'];
                var vocCode = result[i]['voc_state_code'];
                var combValue = result[i]['comb_value'];
                var combCode = result[i]['comb_state_code'];
                var h2sValue = result[i]['h2s_value'];
                var h2sCode = result[i]['h2s_state_code'];
                var coValue = result[i]['co_value'];
                var coCode = result[i]['co_state_code'];

                var text = '<span>일시: ' + _recordTime + '</br>'
                    + '휘발성유기화합물: ' + vocValue + 'PPM</br>'
                    + '가연성가스: ' + combValue + '%LEL</br>'
                    + '산소: ' + o2Value + '%VOL</br>'
                    + '황화수소: ' + combValue + 'PPM</br>'
                    + '일산화탄소: ' + coValue + 'PPM</span>';

                result[i]['value'] = text;
                result[i]['warmingup_count'] = result[i]['warmingup_count'] / 1000;
                result[i]['rolling_count'] = result[i]['rolling_count'] / 1000;


            }



            var gridName = _this.config.grid['name'];
            window.w2ui[gridName].records = result;
            window.w2ui[gridName].refresh();

        },
        render: function () {
            var _this = this;
            var gridOption = _this.config.grid;
            _this.$el.find('#sensorInfo_grid').w2grid(gridOption);

            var smsYNCombo = [
                { id: 'Y', text: 'Y' },
                { id: 'N', text: 'N' }
            ]
            var formOption = _this.config.form;
            var _fields = [
                { name: 'gas_index', type: 'text', html: { caption: '센서별칭', attr: 'style="width: 180px;" ' } },
                { name: 'warmingup_count', type: 'list', html: { caption: '워밍업시간', attr: 'style="width: 180px;" maxlength="13"' } },
                { name: 'rolling_count', type: 'text', html: { caption: '롤링업시간', attr: 'style="width: 180px;"' } },
                { name: 'alarm_path', type: 'text', html: { caption: 'PC알림음', attr: 'style="width: 180px;"' } }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#sensorInfo_form').w2form(formOption);

            _this.initForm();
            _this.initGrid();
        },
        initForm: function () {
            var _this = this;
            _this.$el.find('button[name=reset]').text('초기화');
            _this.$el.find('button[name=save]').text('저장');
            $('.w2ui-btn-blue').prop('disabled', true);
        },
        initGrid: function () {
            var _this = this;
            _this.$el.find('#tb_sensorInfoGrid_toolbar_item_w2ui-search').css('display', 'none');
        },
        insert: function (obj) {
            var _this = this;
            var model = new SensorInfoModel();
            model.set(obj);
            model.save({}, {
                success: function (modle, response) {
                    var result = response;
                    console.log(result);


                    var gridName = _this.config.grid['name'];
                    var formName = _this.config.form['name'];
                    var newGridName = _this.config.newGrid['name'];


                    window.w2ui[gridName].add(result);
                    window.w2ui[newGridName].add(result);
                    window.w2ui[formName].clear();


                },
                error: function () {

                }
            });
        },
        update: function (obj) {
            var _this = this;
            var model = new SensorInfoModel();
            model.url += "/" + obj.id;

            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;
                    var gridName = _this.config.grid['name'];
                    window.w2ui[gridName].set(obj['id'], obj);
                    var formName = _this.config.form['name'];
                    //window.w2ui[formName].clear();
                    $('.w2ui-btn-blue').prop('disabled', true);

                },
                error: function (model, response) {

                }
            });
        },
        delete: function (id) {
            var _this = this;
            var _id = id || 0;
            var obj = {};
            obj.id = _id;
            var model = new SensorInfoModel();
            model.set(obj);
            model.url += "/" + _id;
            model.destroy({
                success: function (model, response) {
                    var gridName = _this.config.grid['name'];
                    var formName = _this.config.form['name'];

                    window.w2ui[gridName].remove(_id);
                    window.w2ui[gridName].selectNone();
                    window.w2ui[formName].clear();


                },
                error: function () {

                },
            });
        },
        destroy: function () {
            var _this = this;
            var formName = _this.config.form['name'];
            if (window.w2ui.hasOwnProperty(formName)) {
                window.w2ui[formName].destroy()
            }
            var gridName = _this.config.grid['name'];
            if (window.w2ui.hasOwnProperty(gridName)) {
                window.w2ui[gridName].destroy()
            }
            var newGridName = _this.config.newGrid['name'];
            if (window.w2ui.hasOwnProperty(newGridName)) {
                window.w2ui[newGridName].destroy()
            }
            this.undelegateEvents();
        },
    });
});