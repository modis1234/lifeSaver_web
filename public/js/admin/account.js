define([
    "text!views/account",
    "text!views/accountForm"
], function (
    HTML,
    accountForm
) {
    var AccountModel = Backbone.Model.extend({
        url: '/account/accounts',
        parse: function (result) {
            return result;
        }
    });

    return Backbone.View.extend({
        el: '.component-box',
        permission: {
            0: [
                { id: 'SUPER', text: 'SUPER', role: 0 },
                { id: 'ADMIN', text: 'ADMIN', role: 1 },
                { id: 'USER', text: 'USER', role: 2 }
            ],
            1: [
                { id: 'ADMIN', text: 'ADMIN', role: 1 },
                { id: 'USER', text: 'USER', role: 2 }
            ],
            2: [
                { id: 'USER', text: 'USER', role: 2 }
            ],
        },
        config: {
            grid: {
                name: 'accountGrid',
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
                    { field: 'role_text', caption: '권한', size: '10%', attr: "align=center" },
                    { field: 'user_id', caption: '아이디', size: '20%', attr: "align=center" },
                    { field: 'name', caption: '이름', size: '15%', attr: "align=center" },
                    { field: 'tel', caption: '연락처', size: '20%', attr: "align=center" },
                    { field: 'mail', caption: '메일', size: '30%', attr: "align=center" },
                    { field: 'description', caption: '비고', size: '35%', attr: "align=left" }
                ],
                records: undefined,
                toolbar: {
                    items: [
                        { type: "button", id: "deleteBtn", caption: "Delete", icon: 'fas fa-times-circle' },
                    ],
                    onClick: function (evt) {
                        var target = evt.target;
                        if (target === 'w2ui-reload') {
                            window.main.view.adminView.accountModel.fetch()
                        }
                        else if (target === 'deleteBtn') {
                            var grid = window.w2ui['accountGrid'];
                            var selectIdArr = grid.getSelection();
                            var _selectIdCnt = selectIdArr.length;
                            if (_selectIdCnt) {
                                var options = {
                                    msg: "선택 된 " + _selectIdCnt + "개 데이터를 삭제하시겠습니까?",
                                    title: '계정 삭제',
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
                    }//end items- onClick
                },
                multiSearch: false,
                onClick: function (event) {
                    var grid = this;
                    var form = w2ui['accountForm'];
                    event.onComplete = function () {
                        var sel = grid.getSelection();
                        if (sel.length == 1) {
                            form.grid = sel[0];
                            console.log(grid.get(sel[0]));
                            form.record = $.extend(true, {}, grid.get(sel[0]));
                            form.refresh();
                            $('.w2ui-btn-blue').prop('disabled', false);
                            $('#search-btn').css('display', 'none');
                            $('#update-btn').css('display', 'block');
                            $('.w2ui-account-form .w2ui-field:nth-child(4)').css('display', 'none'); 
                            $('.w2ui-account-form .w2ui-field:nth-child(5)').css('display', 'none');
                        } else {
                            form.clear();
                            // $('.w2ui-btn-blue').prop('disabled', true);
                            $('.w2ui-field').find('input').removeClass('w2ui-error');
                            window.main.view.adminView.initForm();
                        }
                    }
                }
            }, // end grid
            form: {
                name: 'accountForm',
                formHTML: accountForm,
                header: '계정 정보',
                fields: undefined,
                actions: {
                    'reset': function () {
                        var form = this;
                        form.clear();
                        window.w2ui['accountGrid'].selectNone();
                        window.main.view.adminView.initForm();

                    },
                    'save': function () {
                        // 등록
                        var form = this;
                        var record = form.record;
                        var _role = record['role_text'] ? record['role_text']['role'] : null;
                        var _userId = record['user_id'] || null;
                        console.log('insert-->?>>',record);
                    
                        if (!_userId) {
                            $('input[name=user_id]').w2tag('아이디를 입력하세요.');
                            $('input[name=user_id]').addClass('w2ui-error');
                            return false;
                        }

                        var _password = record['password'] || null;
                        if (!_password) {
                            $('input[name=password]').w2tag('비밀번호를 입력하세요.');
                            $('input[name=password]').addClass('w2ui-error');
                            return false;
                        }
                        var _passwordChk = record['password_chk'] || null;
                        if (!_passwordChk) {
                            $('input[name=password_chk]').w2tag('입력 된 비밀번호 확인이 필요합니다.');
                            $('input[name=password_chk]').addClass('w2ui-error');
                            return false;
                        }
                        var _name = record['name'] || null;
                        if (!_name) {
                            $('input[name=name]').w2tag('이름을 입력하세요.');
                            $('input[name=name]').addClass('w2ui-error');
                            return false;
                        }
                        var _tel = record['tel'] || undefined;
                        // if (!_tel) {
                        //     $('input[name=tel]').w2tag('연락처를 입력하세요.');
                        //     $('input[name=tel]').addClass('w2ui-error');
                        //     return false;
                        // }
                        var _mail = record['mail'] || null;
                        if (!_mail) {
                            $('input[name=mail]').w2tag('이메일을 입력하세요.');
                            $('input[name=mail]').addClass('w2ui-error');
                            return false;
                        }
                        var _description = record['description'] || null;


                        var recordObj = {};
                        recordObj['role'] = _role;
                        recordObj['user_id'] = _userId;
                        recordObj['password'] = _password;
                        recordObj['name'] = _name;
                        recordObj['tel'] = _tel;
                        recordObj['mail'] = _mail;
                        recordObj['description'] = _description;
                        console.log('insert-->', recordObj);
                        var options = {
                            msg: "새로운 계정를 등록 하시겠습니까?",
                            title: '계정 등록',
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


                    },
                    'update': function () {
                        //수정
                        var form = this;
                        var record = form.record;
                        var _id = record['id'];
                        var _role = record['role_text'] ? record['role_text']['role'] : null;
                        var _userId = record['user_id'] || null;
                        console.log("recor->",record);
                        if (!_userId) {
                            $('input[name=user_id]').w2tag('아이디를 입력하세요.');
                            $('input[name=user_id]').addClass('w2ui-error');
                            return false;
                        }

                        var _name = record['name'] || null;
                        if (!_name) {
                            $('input[name=name]').w2tag('이름을 입력하세요.');
                            $('input[name=name]').addClass('w2ui-error');
                            return false;
                        }
                        var _tel = record['tel'] || null;
                        // if (!_tel) {
                        //     $('input[name=tel]').w2tag('연락처를 입력하세요.');
                        //     $('input[name=tel]').addClass('w2ui-error');
                        //     return false;
                        // }
                        var _mail = record['mail'] || null;
                        if (!_mail) {
                            $('input[name=mail]').w2tag('이메일을 입력하세요.');
                            $('input[name=mail]').addClass('w2ui-error');
                            return false;
                        }
                        var _description = record['description'] || null;
                        console.log(record);

                        var recordObj = {};
                        recordObj['id'] = _id;
                        recordObj['role'] = _role;
                        recordObj['user_id'] = _userId;
                        recordObj['name'] = _name;
                        recordObj['tel'] = _tel;
                        recordObj['mail'] = _mail;
                        recordObj['description'] = _description;

                        var options = {
                            msg: "새로운 계정를 수정 하시겠습니까?",
                            title: '계정 수정',
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
                }, //end actions
                onChange: function (event) {
                    var target = event.target;
                    console.log(target);
                    var $target = $('input[name=' + target + ']');
                    var hsaClz = $target.hasClass('w2ui-error');
                    if (hsaClz) {
                        var textLeng = $target.length;
                        if (textLeng !== 0) {
                            $target.removeClass('w2ui-error');
                        }
                    }

                    if (target === 'password_chk') {
                        var pw = $('#password').val();
                        var pwCheck = $('#password_chk').val();
                        if (pw !== pwCheck) {
                            $('#error_text').css('display', 'block');
                            $('#password_chk').addClass('w2ui-error');
                        } else {
                            $('#error_text').css('display', 'none');
                            $('#password_chk').removeClass('w2ui-error');
                        }
                    } 
                    else if(target === 'tel'){
                    }

                }
            }, // end form
            newGrid: {
                name: 'newAccountGrid',
                columns: [
                    { field: 'role_text', caption: '권한', size: '10%', attr: "align=center" },
                    { field: 'user_id', caption: '아이디', size: '20%', attr: "align=center" },
                    { field: 'name', caption: '이름', size: '20%', attr: "align=center" },
                    { field: 'tel', caption: '연락처', size: '20%', attr: "align=center" },
                    { field: 'mail', caption: '이메일', size: '40%', attr: "align=center" },
                    { field: 'description', caption: '비고', size: '35%', attr: "align=center" }
                ],
                multiSearch: true,
                records: undefined,
                recid: "id",
            }
        },
        initialize: function () {
            this.$el.html(HTML);

            this.accountModel = new AccountModel();
            this.listenTo(this.accountModel, "sync", this.getAccountList);
            this.accountModel.fetch();

            this.render();

        },
        events: {
            'keypress input#tel': 'inputPhoneNumber'
        },
        getAccountList: function (model, response) {
            var _this = this;
            var result = response;
            
            for (i in result) {
                var _role = result[i]['role'];
                var roleText;
                if (_role === 0) {
                    roleText = 'SUPER';
                }
                else if (_role === 1) {
                    roleText = 'ADMIN';
                }
                else if (_role === 2) {
                    roleText = 'USER';
                }
                result[i]['role_text'] = roleText;
            }

            console.log(result)
            var gridName = _this.config.grid['name'];
            window.w2ui[gridName].records = result;
            window.w2ui[gridName].refresh();

            window.w2ui[gridName].off('onDblClick');

        },
        render: function () {
            var _this = this;
            var gridOption = _this.config.grid;
            _this.$el.find('#account_grid').w2grid(gridOption);

            var formOption = _this.config.form;

            var _fields = [
                { name: 'role_text', type: 'list', options: { items: _this.permission[0] }, html: { caption: '권한' } },
                { name: 'user_id', type: 'text', html: { caption: '아이디', attr: 'style="width: 360px;" ' } },
                { name: 'password', type: 'pass', html: { caption: '비밀번호' } },
                { name: 'password_chk', type: 'password', html: { caption: '비밀번호확인' } },
                { name: 'name', type: 'text', html: { caption: '이름' } },
                { name: 'tel', type: 'text', html: { caption: '연락처' } },
                { name: 'mail', type: 'email', html: { caption: '이메일' } },
                { name: 'description', type: 'text', html: { caption: '비고' } }
            ];
            formOption['fields'] = _fields;
            _this.$el.find('#account_form').w2form(formOption);

            // var newGridOption = _this.config.newGrid;
            // _this.$el.find('#newAccount_grid').w2grid(newGridOption);

            _this.initForm();
            _this.initGrid();
        },
        initForm: function () {
            var _this = this;
            // $('.w2ui-btn-blue').prop('disabled', true);
            $('#search-btn').css('display', 'block');
            $('#update-btn').css('display', 'none');
            $('#error_text').css('display', 'none');
            $('#password_chk').removeClass('w2ui-error');
            $('#role_text').w2field().setIndex(0);

        },
        initGrid: function () {
            var _this = this;
            _this.$el.find('#tb_accountGrid_toolbar_item_w2ui-search').css('display', 'none');

        },
        insert: function (obj) {
            var _this = this;
            var model = new AccountModel();
            model.set(obj);
            model.save({}, {
                success: function (modle, response) {
                    var result = response;
                  
                    var _role = result['role'];
                    var roleText;
                    if (_role === 0) {
                        roleText = 'SUPER';
                    }
                    else if (_role === 1) {
                        roleText = 'ADMIN';
                    }
                    else if (_role === 2) {
                        roleText = 'USER';
                    }

                    var gridName = _this.config.grid['name'];
                    var formName = _this.config.form['name'];
                    result['role_text'] = roleText;
                    window.w2ui[gridName].add(result);
                    window.w2ui[formName].clear();

                },
                error: function () {

                }
            });
        },
        update: function (obj) {
            var _this = this;
            var model = new AccountModel();
            model.url += "/" + obj.id;

            model.set(obj);
            model.save({}, {
                success: function (model, response) {
                    var result = response;

                    var _role = result['role'];
                    var roleText;
                    if (_role === 0) {
                        roleText = 'SUPER';
                    }
                    else if (_role === 1) {
                        roleText = 'ADMIN';
                    }
                    else if (_role === 2) {
                        roleText = 'USER';
                    }
                    result['role_text'] = roleText;


                    var gridName = _this.config.grid['name'];
                    window.w2ui[gridName].set(obj['id'], obj);
                    _this.initForm();


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
            var model = new AccountModel();
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
            } else if (number.length < 10) {
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