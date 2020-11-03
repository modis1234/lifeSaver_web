define([
    "text!views/gasInfo",
    "text!views/gasInfoForm"
], function (
    HTML,
    form
) {
    var GasModel = Backbone.Model.extend({
        url: '/gas/gases/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    })

    return Backbone.View.extend({
        el: '.component-box',
        config: {
            grid: {
                name: 'gasInfoGrid',
                recordHeight: 30,
                show: {
                    footer: true
                },
                columnGroups: [
                    { caption: '가스 정보', span: 4 },
                    { caption: '안전 범위', span: 1 },
                    { caption: '경고 범위', span: 1 },
                    { caption: '위험 범위', span: 2 },
                ],
                columns: [
                    // { field: 'el_name', caption: '명칭', size: '10%', sortable: true, attr: "align=center" },
                    { field: 'name', caption: '가스명', size: '22%', sortable: true, attr: "align=right" },
                    { field: 'code', caption: '화학식', size: '10%', attr: "align=center" },
                    { field: 'unit', caption: '단위', size: '10%', attr: "align=center" },
                    { field: 'measure_range', caption: '검지범위', size: '18%', attr: "align=right" },
                    { field: 'normal_range', caption: '범위', size: '18%', attr: "align=right" },
                    { field: 'warning1_range', caption: '범위', size: '18%', attr: "align=right" },
                    { field: 'danger1_range', caption: '범위1', size: '18%', attr: "align=right" },
                    { field: 'danger2_range', caption: '범위2', size: '18%', attr: "align=right" }
                ],
                records: undefined,
                recid: "id",
                onClick: function (event) {
                    var grid = this;
                    var form = w2ui['gasInfoForm'];
                    event.onComplete = function () {
                        var sel = grid.getSelection();
                        if (sel.length == 1) {
                            form.grid = sel[0];
                            var selectGrid = grid.get(sel[0]);
                            form.record = $.extend(true, {}, selectGrid);
                            form.refresh();
                            $('.w2ui-btn-blue').prop('disabled', false);
                            var _code = selectGrid['code']
                            var _alarm1;
                            var _alarm2;
                            if(_code.indexOf('O2')>-1){
                                _alarm1 = selectGrid['normal_low']
                                _alarm2 = selectGrid['normal_high']

                                $('.w2ui-form-bottom').addClass('o2-form');
                                $('.w2ui-form-bottom').removeClass('default-form');
                            } else {
                                _alarm1 = selectGrid['warning1_low']
                                _alarm2 = selectGrid['danger1_low']

                                $('.w2ui-form-bottom').removeClass('o2-form');
                                $('.w2ui-form-bottom').addClass('default-form');
                            }

                            $('#value_1').val(_alarm1);
                            $('#value_2').val(_alarm2);

                            var _minimum = selectGrid['range_min']
                            var _maximum = selectGrid['range_max']
                            $('.range_minimum').text(_minimum);
                            $('.range_maximum').text(_maximum);
                        } else {
                            form.clear();
                            $('#value_1').val('');
                            $('#value_2').val('');
                            $('.range_minimum').text('');
                            $('.range_maximum').text('');
                            $('.w2ui-btn-blue').prop('disabled', true);
                            $('.w2ui-input').removeClass('w2ui-error')
                        }
                    }
                }
            }, // end grid
            form: {
                name: 'gasInfoForm',
                header: '가스 정보',
                formHTML: form,
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        form.clear();
                        $('input[name=normal_low]').prop('readonly', true);
                        $('input[name=warning1_low]').prop('readonly', true);
                        $('input[name=warning1_high]').prop('readonly', false);
                        $('input[name=warning2_low]').prop('readonly', true);
                        $('input[name=warning2_high]').prop('readonly', true);
                        window.w2ui['gasInfoGrid'].selectNone();

                    },
                    'save': function () {
                        var form = window.w2ui['gasInfoForm'];
                        var record = form.record;
                        window.w2ui['gasInfoGrid'].selectNone();

                        
                        var _id = record['id'];
                        var recordObj={};
                        // recordObj = record;
                        recordObj['id']=record['id'];
                        
                        var alarm1_value = parseFloat(record['alarm_1'])
                        var alarm2_value = parseFloat(record['alarm_2'])
                        var code = record['code']
                        recordObj['code']=record['code'];
                        recordObj['alarm_1']=alarm1_value
                        recordObj['alarm_2']=alarm2_value 
                        recordObj['range_min']=record['range_min']
                        recordObj['range_max']=record['range_max']

                        if(code === 'O2'){
                            recordObj['normal_low'] = alarm1_value
                            recordObj['normal_high'] = alarm2_value
                            recordObj['warning1_low'] = null;
                            recordObj['warning1_high'] = null;
                            recordObj['warning2_low'] = null;
                            recordObj['warning2_high'] = null;
                            recordObj['danger1_low'] = record['range_min']
                            recordObj['danger1_high'] = alarm1_value-0.1;
                            recordObj['danger2_low'] = alarm2_value+0.1;
                            recordObj['danger2_high'] = record['range_max']

                        } else {
                            recordObj['normal_low'] = record['range_min'];
                            recordObj['normal_high'] = alarm1_value-1;
                            recordObj['warning1_low'] = alarm1_value;
                            recordObj['warning1_high'] = alarm2_value-1;
                            recordObj['warning2_low'] = null;
                            recordObj['warning2_high'] = null
                            recordObj['danger1_low'] = alarm2_value
                            recordObj['danger1_high'] =record['range_max']
                            recordObj['danger2_low'] =null;
                            recordObj['danger2_high'] = null;
                        }
                        
                        if (_id) {
                            // update
                            recordObj['id'] = _id;
                            var options = {
                                msg: "선택 된 가스 정보를 수정하시겠습니까?",
                                title: '가스 정보 수정',
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
                        }

                    }
                }, //end actions
                onChange: function (event) {
                    var _this = this;
                    var target = event.target;
                    console.log(target);
                    if( target === 'alarm_2'){
                        var alarm1_value = $('input[name=alarm_1]').val();
                        var alarm2_value = $('input[name='+target+']').val();
                        if(alarm2_value <= alarm1_value  || alarm2_value<=0){
                            $('input[name='+target+']').w2tag('알람값 1 입력값 이상의 값을 입력하세요.')
                            $('input[name='+target+']').addClass('w2ui-error')
                            $('.w2ui-btn-blue').prop('disabled', true);
                        } else {
                            $('input[name='+target+']').w2tag('')
                            $('input[name='+target+']').removeClass('w2ui-error')
                            $('.w2ui-btn-blue').prop('disabled', false);

                        }
                        
                    } 
                    else if(target === 'alarm_1'){
                        var alarm1_value = $('input[name='+target+']').val();
                        var alarm2_value = $('input[name=alarm_2]').val();
                        if(alarm1_value >= alarm2_value || alarm1_value<=0){
                            $('input[name='+target+']').w2tag('알람값 2 입력값 미만의 값을 입력하세요.')
                            $('input[name='+target+']').addClass('w2ui-error')
                            $('.w2ui-btn-blue').prop('disabled', true);

                        } else {
                            $('input[name='+target+']').w2tag('')
                            $('input[name='+target+']').removeClass('w2ui-error')
                            $('.w2ui-btn-blue').prop('disabled', false);
                        }
                    }
                }
            }, // end form

        },
        initialize: function () {
            this.$el.html(HTML);
            this.gasModel = new GasModel();
            this.listenTo(this.gasModel, "sync", this.getGasList);
            this.gasModel.fetch();
            this.render();

        },
        events: {

        },
        render: function () {
            var _this = this;
            var gridOption = _this.config.grid;
            _this.$el.find('#gasInfo_grid').w2grid(gridOption);

            var formOption = _this.config.form;
            var _fields = [
                { name: 'name', type: 'text', html: { caption: '가스명', attr: 'style="width: 360px;" ' } },
                { name: 'code', type: 'text', html: { caption: '화학식', attr: 'style="width: 360px;"' } },
                { name: 'unit', type: 'text', html: { caption: '단위', attr: 'style="width: 360px;"' } },
                { name: 'measure_range', type: 'text', html: { caption: '검지범위', attr: 'style="width: 360px;"' } },
                { name: 'alarm_1', type: 'text' },
                { name: 'alarm_2', type: 'text' }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#gasInfo_form').w2form(formOption);
        },
        getGasList: function (model, response) {
            var _this = this;
            var result = response;
            for (i in result) {
                var rangeMin = result[i]['range_min'];
                var rangeMax = result[i]['range_max'];
                result[i]['measure_range'] = _this.setRangeValue(rangeMin, rangeMax);
                // result[i]['measure_range'] = rangeMin + ' - ' + rangeMax;

                var normalLow = result[i]['normal_low'];
                var normalHigh = result[i]['normal_high'];
                result[i]['normal_range'] = _this.setRangeValue(normalLow, normalHigh);

                var warning1Low = result[i]['warning1_low'];
                var warning1High = result[i]['warning1_high'];
                result[i]['warning1_range'] = _this.setRangeValue(warning1Low, warning1High);

                var warning2Low = result[i]['warning2_low'];
                var warning2High = result[i]['warning2_high'];
                result[i]['warning2_range'] = _this.setRangeValue(warning2Low, warning2High);


                var danger1Low = result[i]['danger1_low'];
                var danger1High = result[i]['danger1_high'];
                result[i]['danger1_range'] = _this.setRangeValue(danger1Low, danger1High);

                var danger2Low = result[i]['danger2_low'];
                var danger2High = result[i]['danger2_high'];
                result[i]['danger2_range'] = _this.setRangeValue(danger2Low, danger2High);

                var code = result[i]['code'];
                if(code.indexOf('O2')>-1){
                    result[i]['alarm_1']=normalLow
                    result[i]['alarm_2']=normalHigh
                } else {
                    result[i]['alarm_1']=warning1Low
                    result[i]['alarm_2']=danger1Low
                }


            }
            var gridName = _this.config.grid['name'];
            window.w2ui[gridName].records = result;
            window.w2ui[gridName].refresh();


        },
        setRangeValue: function(lowValue, highValue){
            var _rangeText;
            if(lowValue && highValue ){
                _rangeText = lowValue+' - '+highValue;
            } else {
                if(lowValue === 0 || highValue ===0){
                    _rangeText = lowValue+' - '+highValue;

                } else {
                    _rangeText = '-'
                }
            }

            return _rangeText;

        },
        numberCheck: function (target) {
            var target = event.target;
            setTimeout(function () {
                var regNumber = /^[0-9]*$/;
                var temp = $(target).val();
                if (!regNumber.test(temp)) {
                    $(target).val(temp.replace(/[^0-9]/g, ""));
                    $(target).addClass('w2ui-error');
                    $(target).w2tag('숫자만 입력하세요.');
                } else {
                    $(target).removeClass('w2ui-error');
                    $(target).w2tag();

                }

            }, 100);

        },
        update: function (obj) {
            var _this = this;
			var model = new GasModel();
            model.url += "/" + obj.id;
			model.set(obj);
			model.save({}, {
				success: function (model, response) {
                    var result = response;
                   var rangeMin = result['range_min'];
                   var rangeMax = result['range_max'];
                   result['measure_range'] = _this.setRangeValue(rangeMin, rangeMax);
                   // result[i]['measure_range'] = rangeMin + ' - ' + rangeMax;
   
                   var normalLow = result['normal_low'];
                   var normalHigh = result['normal_high'];
                   result['normal_range'] = _this.setRangeValue(normalLow, normalHigh);
   
                   var warning1Low = result['warning1_low'];
                   var warning1High = result['warning1_high'];
                   result['warning1_range'] = _this.setRangeValue(warning1Low, warning1High);
   
                   var warning2Low = result['warning2_low'];
                   var warning2High = result['warning2_high'];
                   result['warning2_range'] = _this.setRangeValue(warning2Low, warning2High);
   
   
                   var danger1Low = result['danger1_low'];
                   var danger1High = result['danger1_high'];
                   result['danger1_range'] = _this.setRangeValue(danger1Low, danger1High);
   
                   var danger2Low = result['danger2_low'];
                   var danger2High = result['danger2_high'];
                   result['danger2_range'] = _this.setRangeValue(danger2Low, danger2High);


                   var gridName = _this.config.grid['name'];
                   window.w2ui[gridName].set(result['id'], result);
                 
                   $('.w2ui-btn-blue').prop('disabled', true);
                   
                    window.main.getGasList(window.main.sensorIndex);
				},
				error: function (model, response) {

				}
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
            
            this.undelegateEvents();
        },
    });
});