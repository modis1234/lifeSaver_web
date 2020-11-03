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
                    { caption: '경고 범위', span: 2 },
                    { caption: '위험 범위', span: 2 },
                ],
                columns: [
                    // { field: 'el_name', caption: '명칭', size: '10%', sortable: true, attr: "align=center" },
                    { field: 'name', caption: '가스명', size: '22%', sortable: true, attr: "align=right" },
                    { field: 'code', caption: '화학식', size: '10%', attr: "align=center" },
                    { field: 'unit', caption: '단위', size: '10%', attr: "align=center" },
                    { field: 'measure_range', caption: '검지범위', size: '18%', attr: "align=right" },
                    { field: 'normal_range', caption: '범위', size: '18%', attr: "align=right" },
                    { field: 'warning1_range', caption: '범위1', size: '18%', attr: "align=right" },
                    { field: 'warning2_range', caption: '범위2', size: '18%', attr: "align=right" },
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

                            var gasType = selectGrid['code'].toUpperCase();
                            if (gasType.indexOf('O2') > -1) {
                                $('input[name=normal_low]').prop('readonly', false);
                                $('input[name=warning1_low]').prop('readonly', false);
                                $('input[name=warning1_high]').prop('readonly', true);
                                $('input[name=warning2_low]').prop('readonly', true);
                                $('input[name=warning2_high]').prop('readonly', false);

                            } else {
                                $('input[name=normal_low]').prop('readonly', true);
                                $('input[name=warning1_low]').prop('readonly', true);
                                $('input[name=warning1_high]').prop('readonly', false);
                                $('input[name=warning2_low]').prop('readonly', true);
                                $('input[name=warning2_high]').prop('readonly', true);
                            }

                        } else {
                            form.clear();
                            $('.w2ui-btn-blue').prop('disabled', true);
                            //$('.w2ui-field').find('input').removeClass('w2ui-error');
                            // window.main.view.adminView.initForm();
                            $('input[name=normal_low]').prop('readonly', true);
                            $('input[name=warning1_low]').prop('readonly', true);
                            $('input[name=warning1_high]').prop('readonly', false);
                            $('input[name=warning2_low]').prop('readonly', true);
                            $('input[name=warning2_high]').prop('readonly', true);
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
                        var _id = record['id'];
                        var recordObj;
                        recordObj = record;
                        recordObj['id']=record['id'];
                        recordObj['range_min']=record['range_min'];
                        recordObj['range_max']=record['range_max'];
                        recordObj['normal_low']= parseFloat($('input[name=normal_low]').val());
                        recordObj['normal_high']=parseFloat($('input[name=normal_high]').val());
                        recordObj['warning1_low']=parseFloat($('input[name=warning1_low]').val());
                        recordObj['warning1_high']=parseFloat($('input[name=warning1_high]').val());
                        recordObj['warning2_low']=parseFloat($('input[name=warning2_low]').val());
                        recordObj['warning2_high']=parseFloat($('input[name=warning2_high]').val());
                        recordObj['danger1_low']=parseFloat($('input[name=danger1_low]').val());
                        recordObj['danger1_high']=parseFloat($('input[name=danger1_high]').val());
                        recordObj['danger2_low']=parseFloat($('input[name=danger2_low]').val());
                        recordObj['danger2_high']=parseFloat($('input[name=danger2_high]').val());

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
                    var $target = $('input[name=' + target + ']')
                    var _code = _this.record['code'];
                    _code = _code.toUpperCase();
                    if (_code.indexOf('O2') > -1) {
                        var targetValue = $target.val();
                        if (target === 'normal_low') {
                            var setNumber = Number(targetValue) - 0.1;
                            setNumber = setNumber.toFixed(1);
                            $('input[name=warning1_high]').val(setNumber);
                        }
                        else if (target === 'normal_high') {
                            var setNumber = Number(targetValue) + 0.1;
                            setNumber = setNumber.toFixed(1);
                            $('input[name=warning2_low]').val(setNumber);
                        }
                        else if (target === 'warning1_low') {
                            var setNumber = Number(targetValue) - 0.1;
                            setNumber = setNumber.toFixed(1);
                            $('input[name=danger1_high]').val(setNumber);
                        }
                        else if (target === 'warning2_high') {
                            var setNumber = Number(targetValue) + 0.1;
                            setNumber = setNumber.toFixed(1);
                            $('input[name=danger2_low]').val(setNumber);
                        }


                    } else {
                        // if (_code.indexOf('VOC') > -1) {
                            // var targetValue = $target.val();
                            // var setNumber = Number(targetValue) + 0.01;
                            // setNumber = setNumber.toFixed(2);
                            // if (target === 'normal_high') {
                            //     $('input[name=warning1_low]').val(setNumber);
                            // }
                            // else if (target === 'warning1_high') {
                            //     $('input[name=danger1_low]').val(setNumber);
                            // }
                        // } else {
                            var targetValue = $target.val();
                            var setNumber = Number(targetValue) + 1;
                            if (target === 'normal_high') {
                                $('input[name=warning1_low]').val(setNumber);
                            }
                            else if (target === 'warning1_high') {
                                $('input[name=danger1_low]').val(setNumber);
                            }
                        // }
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
                { name: 'normal_low', type: 'text' },
                { name: 'normal_high', type: 'text' },
                { name: 'warning1_low', type: 'text' },
                { name: 'warning1_high', type: 'text' },
                { name: 'warning2_low', type: 'text' },
                { name: 'warning2_high', type: 'text' },
                { name: 'danger1_low', type: 'text' },
                { name: 'danger1_high', type: 'text' },
                { name: 'danger2_low', type: 'text' },
                { name: 'danger2_high', type: 'text' }
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