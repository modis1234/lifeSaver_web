define([
    "text!views/receiver",
    "text!views/searchForm",
], function (
    HTML,
    searchForm
) {
    var ReceiverModel = Backbone.Model.extend({
        url: '/receiver/receivers/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    });

    return Backbone.View.extend({
        el: '.component-box',
        config: {
            grid: {
                name: 'receiverGrid',
                recid: "id",
                recordHeight: 30,
                show: {
                    toolbar: true,
                    footer: true,
                    selectColumn: true
                },
                // columns: [
                //     { field: 'start_time', caption: '시작시각', size: '25%', attr: "align=center" },
                //     { field: 'end_time', caption: '종료시각', size: '25%', attr: "align=center" },
                //     { field: 'delay_time', caption: '사용시간', size: '18%', attr: "align=right" },
                //     { field: 'final_value', caption: '최종 검지 수치', size: '18%', attr: "align=left" },
                // ],
                columns: [
                    { field: 'name', caption: '이름', size: '25%', attr: "align=center" },
                    { field: 'tel', caption: '전화번호', size: '25%', attr: "align=center" },
                    { field: 'sms_yn', caption: '전송여부', size: '10%', attr: "align=center" },
                    { field: 'desc', caption: '', size: '40%', attr: "align=center" }
                ],
                records: undefined,
                toolbar: {
                    items: [
                        { type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
                    ],
                    onClick: function (evt) {
                        var target = evt.target;
                        if (target === 'w2ui-reload') {
                            window.main.view.adminView.receiverModel.fetch()
                        }
                        else if (target === 'deleteBtn') {
                            var grid =window.w2ui['receiverGrid'];
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
                        else if(target === 'w2ui-column-on-off'){
                            // $('.w2ui-col-on-off tr:nth-child(1)').css('display','none');
                            // $('.w2ui-col-on-off tr:nth-child(7)').css('display','none');

                        }
                    } //end items- onClick
                },
                multiSearch: false,
                onClick: function(event) {
                    var grid = this;
                    var form = w2ui['receiverForm'];
                    event.onComplete = function(){
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
                name: 'receiverForm',
                // formHTML: searchForm,
                header: '수신자 정보',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        form.clear();
                        window.w2ui['receiverGrid'].selectNone();
                        window.main.view.adminView.initForm();

                    },
                    'save': function () {
                        var form = window.w2ui['receiverForm'];
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
                        recordObj['sensor_name'] = $('.ad-tit-text').text();

                        console.log('receiver->',recordObj)

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
            newGrid: {
				name: 'newReceiverGrid',
				columns: [
                    { field: 'name', caption: '이름', size: '25%', attr: "align=center" },
                    { field: 'tel', caption: '전화번호', size: '25%', attr: "align=center" },
                    { field: 'sms_yn', caption: '전송여부', size: '10%', attr: "align=center" },
                    { field: 'desc', caption: '', size: '40%', attr: "align=center" }
				],
				multiSearch: true,
				records: undefined,
				recid: "id",
			}
        },
        initialize: function () {
            this.$el.html(HTML);

            this.receiverModel = new ReceiverModel();
            this.listenTo(this.receiverModel, "sync", this.getReceiverList);
            this.receiverModel.fetch();

            this.render();

        },
        events: {
            'keyup input#tel': 'inputPhoneNumber',
            'change input.w2ui-input': 'activeSaveBtn'
        },
        activeSaveBtn: function(evt){
            $('.w2ui-btn-blue').prop('disabled', false);
        },
        getReceiverList: function (model, response) {
            var _this = this;
            var result = response;
            console.log(result)
            var gridName = _this.config.grid['name'];
            window.w2ui[gridName].records = result;
            window.w2ui[gridName].refresh();

        },
        render: function () {
            var _this = this;
            var gridOption = _this.config.grid;
            _this.$el.find('#receiver_grid').w2grid(gridOption);

            var smsYNCombo = [
                { id: 'Y', text: 'Y' },
                { id: 'N', text: 'N' }
            ]
            var formOption = _this.config.form;
            var _fields = [
                { name: 'name', type: 'text', html: { caption: '이름', attr: 'style="width: 360px;" ' } },
                { name: 'tel', type: 'text', html: { caption: '연락처', attr: 'style="width: 360px;" maxlength="13"' } },
                { name: 'sms_yn', type: 'list', options: { items: smsYNCombo }, html: { caption: '전송여부', attr: 'style="width: 180px;"' } }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#receiver_form').w2form(formOption);

            var newGridOption = _this.config.newGrid;
            _this.$el.find('#newReceiver_grid').w2grid(newGridOption);

            _this.initForm();
            _this.initGrid();
        },
        initForm: function () {
            var _this = this;
            _this.$el.find('button[name=reset]').text('초기화');
            _this.$el.find('button[name=save]').text('저장');
            $('.w2ui-btn-blue').prop('disabled', true);
            $('#sms_yn').w2field().setIndex(0);

        },
        initGrid: function () {
            var _this = this;
            _this.$el.find('#tb_receiverGrid_toolbar_item_w2ui-search').css('display', 'none');
        },
        insert: function (obj) {
            var _this = this;
            var model = new ReceiverModel();
            model.set(obj);
            model.save({}, {
                success: function (modle, response) {
                    var result = response;
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
        update: function(obj){
            var _this = this;
			var model = new ReceiverModel();
            model.url += '/'+obj.id,
     
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
        delete: function(id){
            var _this = this;
			var _id = id || 0;
			var obj = {};
			obj.id = _id;
			var model = new ReceiverModel();
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
        inputPhoneNumber: function (event) {
            var $target = $(event.target);
            var number = $target.val().replace(/[^0-9]/g, "");
            var phone = "";

            if (number.length < 4) {
                return number;
            } else if (number.length < 7) {
                phone += number.substr(0, 3);
                phone += "-";
                phone += number.substr(3);
            } else if (number.length < 11) {
                phone += number.substr(0, 3);
                phone += "-";
                phone += number.substr(3, 3);
                phone += "-";
                phone += number.substr(6);
            } else {
                phone += number.substr(0, 3);
                phone += "-";
                phone += number.substr(3, 4);
                phone += "-";
                phone += number.substr(7);
            }
            $target.val(phone);

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