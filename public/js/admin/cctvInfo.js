define([
    "text!views/cctvInfo",
    "text!views/cctvInfoForm"
], function (
    HTML,
    cctvInfoForm
) {
    var CctvModel = Backbone.Model.extend({
        url: '/cctv/cctvs/'+window.main.sensorIndex,
        parse: function (result) {
            return result;
        }
    })

    return Backbone.View.extend({
        el: '.component-box',
        sensorInfo: undefined,
        config: {
            form: {
                name: 'cctvInfoForm',
                formHTML: cctvInfoForm,
                header: 'CCTV 접속 정보',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        window.main.view.adminView.cctvModel.fetch();
                        form.refresh();
                        window.main.view.adminView.initForm();

                    },
                    'update': function (event) {
                        var target = event.currentTarget;
                        $('.w2ui-field input').prop('readonly', false);
                        $('#search-btn').css('display', 'block');
                        $('#update-btn').css('display', 'none');
                    },
                    'save': function (event) {
                        var form = window.w2ui['cctvInfoForm'];
                        var record = form.record;
                        var _id = record['id'];
                        console.log(record);
                        var recordObj = {};
                        recordObj['id'] = _id;
                        recordObj['fan_address'] = record['fan_address'];
                        recordObj['port'] = record['port'];
                        recordObj['user_id'] = record['user_id'];
                        recordObj['password'] = record['password'];
                        var options = {
                            msg: "CCTV 정보를 수정하시겠습니까?",
                            title: 'CCTV 장비 정보 수정',
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
            } // end form
        },
        initialize: function () {
            this.$el.html(HTML);

            this.render();
            this.cctvModel = new CctvModel();
            this.listenTo(this.cctvModel, "sync", this.getCctvList);
            this.cctvModel.fetch();

        },
        render: function () {
            var _this = this;
            var formOption = _this.config.form;
            var _fields = [
                { name: 'fan_address', type: 'text',html: { attr: 'style="width: 180px"' } },
                { name: 'port', type: 'text' },
                { name: 'user_id', type: 'text' },
                { name: 'password', type: 'text' }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#cctvInfo_form').w2form(formOption);
            _this.initForm();
        },
        initForm: function () {
            var _this = this;
            _this.$el.find('#search-btn').css('display', 'none');
            _this.$el.find('#update-btn').css('display', 'block');

            $('input[name=sensor_index]').prop('readonly', true);
            $('input[name=sensor_index]').removeClass('w2ui-error');
            $('.file_input_hidden').prop('disabled', true);
            $('.w2ui-field:nth-child(2) span').css('display', 'none');

            $('.w2ui-field input').prop('readonly', true);

        },
        getCctvList: function (model, response) {
            var _this = this;
            var _result = response[0];

            var formName = _this.config.form['name'];
            window.w2ui[formName].record = $.extend(true, {}, _result);
            window.w2ui[formName].refresh();
        },
        update: function (obj) {
            var _this = this;
            var model = new CctvModel();
            model.url += "/" + obj.id;

            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;
                    console.log(result)

                    var formName = _this.config.form['name'];
                    window.w2ui[formName].record = $.extend(true, {}, result);
                    window.w2ui[formName].refresh();
                    _this.initForm();

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
            this.undelegateEvents();
        },
    });
});