define([
    "ionSlider",
    "text!views/sensorInfo",
    "text!views/sensorForm"
], function (
    IonSlider,
    HTML,
    sensorForm
) {
    var SensorModel = Backbone.Model.extend({
        url: '/sensor/sensors/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    })


    return Backbone.View.extend({
        el: '.component-box',
        sensorInfo: undefined,
        server:"http://119.207.78.146:9092",
        config: {
            form: {
                name: 'sensorInfoForm',
                formHTML: sensorForm,
                header: '대시보드 관리',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        var records = window.main.view.adminView.sensorInfo;
                        form.record = $.extend(true, {}, records);
                        form.refresh();
                        window.main.view.adminView.sliderUpdate(records);
                        window.main.view.adminView.initForm();

                    },
                    'update': function (event) {
                        var target = event.currentTarget;
                        $(target).css('display', 'none');
                        $('#search-btn').css('display', 'block');
                        window.main.view.adminView.sliderAbled();
                        // $('input[name=sensor_index]').prop('readonly', false);
                        $('.file_input_hidden').prop('disabled', false);
                        $('.w2ui-field:nth-child(2) span').css('display','block');
                    },
                    'save': function () {
                        var form = window.w2ui['sensorInfoForm'];
                        var record = form.record;
                        var _id = record['id'];
                        var _sensorIndex = record['sensor_index'] || $('input[name=sensor_index]').val();
                        var warmingup_value = $(".warmingup-range-slider").data('from');
                        var rolling_value = $(".rolling-range-slider").data('from');

                        if(!_sensorIndex){
                            w2alert('가스인덱스를 입력하세요.');
                            $('input[name=sensor_index]').addClass('w2ui-error');
                            return false;
                        }

                        console.log(rolling_value);

                        var recordObj = {};
                        recordObj['id'] = _id;
                        recordObj['sensor_index'] = _sensorIndex;
                        recordObj['warmingup_count'] = warmingup_value * 60 * 1000;
                        recordObj['rolling_count'] = rolling_value * 1000;
                        recordObj['alarm_path'] = $('#alarm_path').val();
                        recordObj['action'] = window.main.view.adminView.sensorInfo['action'];

                        if (_id) {
                            // update
                            var options = {
                                msg: "센서장비 정보를 수정하시겠습니까?",
                                title: '센서장비 정보 수정',
                                width: 450,
                                height: 220,
                                btn_yes: {
                                    text: '확인',
                                    class: '',
                                    style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
                                    callBack: function () {
                                        console.log(recordObj);
                                        window.main.view.adminView.update(recordObj);
                                        var insertImg = $('#alarm_path').val();
                                        if (insertImg) {
                                            window.main.view.adminView.fileUpload();
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

                        }
                    }
                },
                onChange: function (event) {
                    console.log(event.target);
                    var targetName = event.target;
                    if (targetName === 'sensor_index') {

                    }
                    else if (targetName === 'warmingup_count') {

                    }
                }
            } // end form
        },
        initialize: function () {
            this.$el.html(HTML);
            this.render();
            this.sensorModel = new SensorModel();
            this.listenTo(this.sensorModel, "sync", this.getSensorList);
            this.sensorModel.fetch();
        },
        render: function () {
            var _this = this;
            var formOption = _this.config.form;
            var _fields = [
                { name: 'sensor_index', type: 'text', html: { attr: 'style="width: 500px"' } },
                { name: 'action_text', type: 'text' },
                { name: 'alarm_path', type: 'text' },
                { name: 'warmingup_count', type: 'text' },
                { name: 'rolling_count', type: 'text' }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#sensorInfo_form').w2form(formOption);
            _this.sliderRender();
            _this.initForm();
        },
        initForm: function () {
            var _this = this;
            _this.$el.find('#search-btn').css('display', 'none');
            _this.$el.find('#update-btn').css('display', 'block');
            var warmingup_instance = _this.$el.find(".warmingup-range-slider").data("ionRangeSlider");
            warmingup_instance.update({
                from_fixed: true
            });
            // slider update
            var rolling_instance = _this.$el.find(".rolling-range-slider").data("ionRangeSlider");
            rolling_instance.update({
                from_fixed: true
            });
            $('input[name=sensor_index]').prop('readonly', true);
            $('input[name=sensor_index]').removeClass('w2ui-error');
            $('.file_input_hidden').prop('disabled', true);
            $('.w2ui-field:nth-child(2) span').css('display','none');


        },
        getSensorList: function (model, response) {
            var _this = this;
            var result = response[0];
            console.log(result);
            _this.setRecord(result);

        },
        setRecord: function(result){
            var _this =this;
            _this.sensorInfo = result;
            _this.sliderUpdate(result);
            console.log('setRecord->',result);
            var _action = result['action'];
            if (_action == 1) {
                result['action_text'] = 'ON'
                _this.$el.find('input#action_text').attr('value', 'on');
            } 
            else if(_action == 0){
                
                result['action_text'] = 'OFF'
                _this.$el.find('input#action_text').attr('value', 'off');
            }
            else if(_action == 2){
                
                result['action_text'] = 'LOADING'
                _this.$el.find('input#action_text').attr('value', 'loading');
            }

            var _alarmFile = result['alarm_path'] || null;
            if (_alarmFile) {
                _this.$el.find('#play-btn').prop('disabled', false);
            } else {
                _this.$el.find('#play-btn').prop('disabled', true);
            }


            var formName = _this.config.form['name'];
            window.w2ui[formName].record = $.extend(true, {}, result);
            window.w2ui[formName].refresh();
        },
        events: {
            "change input[name=imgFile]": "setFileName",
            "click #play-btn": "alarmPlayHandler",
            "click #pause-btn": "alarmPauseHandler"

        },
        sliderRender: function () {
            var _this = this;

            _this.$el.find(".warmingup-range-slider").ionRangeSlider({
                skin: "big",
                grid: true,
                grid_num: 10,
                min: 0,
                max: 20,
                from: 5,
                postfix: '분',
                from_fixed: true,  // fix position of FROM handle
                hide_min_max: true
            });

            _this.$el.find(".rolling-range-slider").ionRangeSlider({
                skin: "big",
                grid: true,
                grid_num: 10,
                min: 0,
                max: 20,
                from: 5,
                postfix: '초',
                from_fixed: true,    // fix position of TO handle
                hide_min_max: true
            });
        },
        sliderUpdate: function (result) {
            var _this = this;
            // slider update
            var warmingup_instance = _this.$el.find(".warmingup-range-slider").data("ionRangeSlider");
            var warmingup_minute = (result['warmingup_count'] / 60) / 1000; // ms -> min 변환 
            warmingup_instance.update({
                from: warmingup_minute
            });
            // slider update
            var rolling_instance = _this.$el.find(".rolling-range-slider").data("ionRangeSlider");
            var rolling_second = result['rolling_count'] / 1000; // ms -> sec 변환 
            rolling_instance.update({
                from: rolling_second
            });
        },
        sliderAbled: function (result) {
            var _this = this;
            // slider update
            var warmingup_instance = _this.$el.find(".warmingup-range-slider").data("ionRangeSlider");
            warmingup_instance.update({
                from_fixed: false
            });
            // slider update
            var rolling_instance = _this.$el.find(".rolling-range-slider").data("ionRangeSlider");
            rolling_instance.update({
                from_fixed: false
            });
        },
        update: function (obj) {
            var _this = this;
            var model = new SensorModel();
            model.url += "/" + obj.id;

            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;
                    console.log(result)

                    var formName = _this.config.form['name'];
                    //window.w2ui[formName].clear();
                   // $('.w2ui-btn-blue').prop('disabled', true);

                    //_this.sensorInfo = result;
                    _this.setRecord(result);
                    _this.initForm();

                },
                error: function (model, response) {

                }
            });
        },
        fileUpload: function (data) {
            var formData = new FormData($('#form')[0]);
            $.ajax({
                type: "POST",
                url: '/upload/create',
                processData: false,
                contentType: false,
                data: formData,
                success: function (data) {

                }
            });

        },
        setFileName: function () {
            var _this = this;
            var value = _this.$el.find('input[name=imgFile]').val();
            var fileValue = value.split("\\");
            var fileName = fileValue[fileValue.length - 1];
            _this.$el.find('#alarm_path').val(fileName);

            _this.$el.find('#play-btn').css('display', 'block');
            _this.$el.find('#pause-btn').css('display', 'none');
        },
        alarmPlayHandler: function (event) {
            var _this = this;
            var $target = _this.$el.find('#play-btn');
            var val = _this.$el.find('#alarm_path').val();
            var audioObj = _this.audioObj = new Audio();
            audioObj.src = _this.server+'/upload/' + val;
            audioObj.volume = 1;
            // audioObj.currentTime=0;
            audioObj.loop = true;
            audioObj.value = "test"
            audioObj.play();

            $target.css('display', 'none');
            _this.$el.find('#pause-btn').css('display', 'block');


        },
        alarmPauseHandler: function (event) {
            var _this = this;
            var $target = _this.$el.find('#pause-btn');

            _this.audioObj.pause();
            $target.css('display', 'none');
            _this.$el.find('#play-btn').css('display', 'block');

        },
        destroy: function () {
            var _this = this;
            var formName = _this.config.form['name'];
            if (window.w2ui.hasOwnProperty(formName)) {
                window.w2ui[formName].destroy()
            }
            this.undelegateEvents();
        }
    });
});