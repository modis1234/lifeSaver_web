define([
    "jquery",
    "underscore",
    "backbone",
    "w2ui",
    "text!views/administrator",
    "text!views/adminHeader",
    "css!cs/stylesheets/admin/ad_layout.css",
    "css!cs/stylesheets/admin/ad_main.css",
    "css!cs/stylesheets/admin/w2uiCustom.css"
], function (
    $,
    _,
    Backbone,
    w2ui,
    HTML,
    Header
) {
    var GasModel = Backbone.Model.extend({
        url: '/gas/gases',
        parse: function (result) {
            return result;
        }
    });

    return Backbone.View.extend({
        el: '.container',
        gasList: undefined,
        gasTypeCombo: undefined,
        sensorIndex: window.main.sensorIndex,
        w2uiConfig: {
            sidebar: {
                name: 'menu',
                img: null,
                nodes: [
                    {
                        id: 'setting', text: '모니터링 설정', img: 'icon-folder', expanded: true, group: true, groupShowHide: false, collapsible: false,
                        nodes: [
                            // { id: 'account', text: '계정 관리', icon: 'fas fa-bell' },
                            { id: 'receiver', text: '알림수신자 등록', icon: 'fas fa-bell' },
                            { id: 'sensorInfo', text: '대시보드 관리', icon: 'fas fa-bell' },
                            { id: 'gasInfo', text: '가스타입 설정', icon: 'fas fa-bell' },
                            { id: 'cctvInfo', text: 'CCTV 관리', icon: 'fas fa-bell' },
                            // { id: 'f', text: '경광등 관리', icon: 'fas fa-bell' }
                        ]
                    },
                    {
                        id: 'lookUp', text: '조회', img: 'icon-folder', expanded: true, group: true, groupShowHide: false, collapsible: false,
                        nodes: [
                            { id: 'alarmList', text: '알람 이력 조회', icon: 'fas fa-file-alt' },
                            { id: 'usedList', text: '장비 사용시간', icon: 'fas fa-file-alt' },
                            // { id: 'i', text: '문자 전송 이력 조회', icon: 'fas fa-file-alt' }
                        ]
                    },
                ],
                onClick: function (event) {
                    window.main.view.setMenu(event.target);
                }
            } // end sidebar
        },
        initialize: function () {
            var _this = this;
            this.$el.html(HTML);
            $('#admin-header-container').html(Header);
            // this.gasModel = new GasModel();
            // this.listenTo(this.gasModel, "sync", this.getGasList);
            // this.gasModel.fetch();
            this.getGasIndexList(this.sensorIndex);

            this.render();
            _this.utilsCustom();
            console.log(this.sensorIndex);

            var _title = window.main.getTitle();
            $('.ad-tit-text').text(_title);
            var _src ="";
            if(window.main.version === 1){
                _src = '../../img/lsv1_logo.png'
            } 
            else if(window.main.version === 2){
                _src = '../../img/lsv2_logo.png'
            }
            $('#logo-img').attr('src',_src)  
          
        },
        events: {

        },
        getGasIndexList: function (data) {
			var _this = this;
			console.log('getGasIndexList->', data)
			var _sensorIndex = data;
			var model = new GasModel();
			model.url += '/' + _sensorIndex;
			model.fetch({
				success: function (model, response) {
                    var result = response;
                    _this.gasList = result;
        
                    var _codeList =[];
                    var initAll = { id:0, text:"전체", value:0 };
                    _codeList.push(initAll);
                    for( i in result ){
                        var obj = {};
                        obj['id'] = result[i]['name'];
                        obj['code'] = result[i]['name'];
                        obj['value'] = result[i]['code'];
                        obj['unit'] = result[i]['unit'];
                        obj['normal_range'] = result[i]['normal_low']+'-'+result[i]['normal_high']+result[i]['unit']
                        _codeList.push(obj);
                    }
        
                    _this.gasTypeCombo = _codeList;
                    console.log('>>>>>>>>>>>', _this.gasTypeCombo );

				},
				error: function (model, response) {

				},
			});
		},
        // getGasList: function(model, response){
        //     var _this = this;
        //     var result = response;
        //     _this.gasList = result;

        //     var _codeList =[];
        //     var initAll = { id:0, text:"전체", value:0 };
        //     _codeList.push(initAll);
        //     for( i in result ){
        //         var obj = {};
        //         obj['id'] = result[i]['name'];
        //         obj['code'] = result[i]['name'];
        //         obj['value'] = result[i]['code'];
        //         obj['unit'] = result[i]['unit'];
        //         obj['normal_range'] = result[i]['normal_low']+'-'+result[i]['normal_high']+result[i]['unit']
        //         _codeList.push(obj);
        //     }

        //     _this.gasTypeCombo = _codeList;
            

        // },
        render: function () {
            var _this = this;
            _this.$el.find('#menu-bottom').w2sidebar(_this.w2uiConfig['sidebar']);
            _this.$el.find('#sidebar_menu_focus').remove();
            var sidebarName = _this.w2uiConfig.sidebar['name'];
            if(window.main.version === 1){
                console.log('>>>')
                window.w2ui[sidebarName].hide('cctvInfo')
            } 
         


        },
        setMenu: function (target) {
            var _this = this;
            var _target = target;
            if (_this.adminTarget == _target) {
                return false;
            } else {
                _this.adminTarget = _target;
                var adminView = this.adminView;
                if (adminView) adminView.destroy();
                var url = _target;
                requirejs([
                    'js/admin/' + url
                ], function (Admin) {
                    var adminView = new Admin();
                    console.log(window.main.sensorIndex)
                    _this.adminView = adminView;

                });
            }
        },
        utilsCustom: function () {
            var _shortMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
            var _fullmonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
            var _shortDays = ['월', '화', '수', '목', '금', '토', '일'];
            var _fulldays = ['월', '화', '수', '목', '금', '토', '일'];

            window.w2utils.settings.shortmonths = _shortMonths;
            window.w2utils.settings.fullmonths = _fullmonths;
            window.w2utils.settings.shortdays = _shortDays;
            window.w2utils.settings.fulldays = _fulldays;

        },
        getToDay: function () {
            // 오늘 날짜 리턴
            var date = new Date();
            var toYear = date.getFullYear();
            var tempMonth = date.getMonth() + 1;
            var toMonth = tempMonth >= 10 ? tempMonth : '0' + tempMonth;
            var tempDate = date.getDate();
            var toDate = tempDate >= 10 ? tempDate : '0' + tempDate;

            var toDays = toYear + '/' + toMonth + '/' + toDate;

            return toDays;
        },
        setToday: function () {
            // w2uiCustom Date 오늘 일자 셋팅
            var _this = this;
            var $targetBtn = _this.$el.find('#today-btn');
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if (_hasClaz) {
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=fromDate]').val(_getToDay);
                _this.$el.find('input[name=toDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if (_hasClazSiblings) {
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                _this.$el.find('input[name=fromDate]').val(_getToDay);
                _this.$el.find('input[name=toDate]').val(_getToDay);
            }
        },
        setThisWeek: function () {
            // w2uiCustom 이번주 월~일 일자 셋팅
            var _this = this;
            var $targetBtn = _this.$el.find('#thisWeek-btn');
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if (_hasClaz) {
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=fromDate]').val(_getToDay);
                _this.$el.find('input[name=toDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if (_hasClazSiblings) {
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var currentDay = new Date();
                var theYear = currentDay.getFullYear();
                var theMonth = currentDay.getMonth();
                var theDate = currentDay.getDate();
                var theDayOfWeek = currentDay.getDay();

                var thisWeek = [];

                for (var i = 1; i < 8; i++) {
                    var resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
                    var yyyy = resultDay.getFullYear();
                    var mm = Number(resultDay.getMonth()) + 1;
                    var dd = resultDay.getDate();

                    mm = String(mm).length === 1 ? '0' + mm : mm;
                    dd = String(dd).length === 1 ? '0' + dd : dd;

                    thisWeek[i] = yyyy + '/' + mm + '/' + dd;
                }
                _this.$el.find('input[name=fromDate]').val(thisWeek[1]);
                _this.$el.find('input[name=toDate]').val(thisWeek[7]);
            }
        },
        setThisMonth: function () {
            // w2uiCustom 이번달 1~31일 일자 셋팅			
            var _this = this;
            var $targetBtn = _this.$el.find('#thisMonth-btn');
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if (_hasClaz) {
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=fromDate]').val(_getToDay);
                _this.$el.find('input[name=toDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if (_hasClazSiblings) {
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var date = new Date();
                var thisYear = date.getFullYear();
                var tempMonth = date.getMonth() + 1;
                var thisMonth = tempMonth >= 10 ? tempMonth : '0' + tempMonth;
                var thisDate = '01';

                var fromDate = thisYear + '/' + thisMonth + '/' + thisDate;
                var toDate = _getToDay;

                _this.$el.find('input[name=fromDate]').val(fromDate);
                _this.$el.find('input[name=toDate]').val(toDate);
            }

        },
        setLastMonth: function () {
            // w2uiCustom 지난달 1~31일 일자 셋팅			
            var _this = this;
            var $targetBtn = _this.$el.find('#lastMonth-btn');
            var _hasClaz = $targetBtn.hasClass('w2ui-btn-blue');
            var _hasClazSiblings = $targetBtn.siblings().hasClass('w2ui-btn-blue');
            var _getToDay = _this.getToDay();
            if (_hasClaz) {
                $targetBtn.removeClass('w2ui-btn-blue');
                _this.$el.find('input[name=fromDate]').val(_getToDay);
                _this.$el.find('input[name=toDate]').val(_getToDay);
            } else {
                $targetBtn.addClass('w2ui-btn-blue');
                if (_hasClazSiblings) {
                    $targetBtn.siblings().removeClass('w2ui-btn-blue');
                }
                var firstDay = new Date();
                firstDay.setMonth(firstDay.getMonth() - 1);
                firstDay.setDate(1);

                var firstYear = firstDay.getFullYear();
                var tempFirstMonth = firstDay.getMonth() + 1;
                var firstMonth = tempFirstMonth >= 10 ? tempFirstMonth : '0' + tempFirstMonth;
                var tempFirstDate = firstDay.getDate();
                var firstDate = tempFirstDate >= 10 ? tempFirstDate : '0' + tempFirstDate;
                var startLastDate = firstYear + '/' + firstMonth + '/' + firstDate;

                var endDay = new Date();
                endDay.setMonth(endDay.getMonth());
                endDay.setDate(0);

                var endYear = endDay.getFullYear();
                var tempEndMonth = endDay.getMonth() + 1;
                var endMonth = tempEndMonth >= 10 ? tempEndMonth : '0' + tempEndMonth;
                var temptoDate = endDay.getDate();
                var toDate = temptoDate >= 10 ? temptoDate : '0' + temptoDate;
                var endLastDate = endYear + '/' + endMonth + '/' + toDate;

                _this.$el.find('input[name=fromDate]').val(startLastDate);
                _this.$el.find('input[name=toDate]').val(endLastDate);
            }

        },
        periodTime: function (fromDate, endDate) {
            // 지연시간 계산 리턴
            var fromDate = new Date(fromDate);
            var toDate = endDate ? new Date(endDate) : new Date();

            periodTime = toDate.getTime() - fromDate.getTime();
            pDay = periodTime / (60 * 60 * 24 * 1000);
            strDay = Math.floor(pDay); // 일
            pHour = (periodTime - (strDay * (60 * 60 * 24 * 1000))) / (60 * 60 * 1000);
            strHour = Math.floor(pHour);
            strMinute = Math.floor((periodTime - (strDay * (60 * 60 * 24 * 1000)) - (strHour * (60 * 60 * 1000))) / (60 * 1000));
            sec = Math.floor((periodTime % (1000 * 60)) / 1000);

            var periodDate = '';
            if (periodTime >= 86400000) {
                periodDate = strDay + " 일 " + strHour + " 시간 " + strMinute + '분';
            }
            else if (periodTime >= 3600000 && periodTime < 86400000) {
                periodDate = strHour + " 시간 " + strMinute + '분';
            }
            else if (periodTime >= 60000 && periodTime < 3600000) {
                periodDate = strMinute + '분';

            }
            else if (periodTime < 60000) {

                periodDate = '1분미만';
            }
            return periodDate;
        },
        dateCheck: function () {
            var _this = this;
            var fromDate = _this.$el.find('input[name=fromDate]').val();
            var toDate = _this.$el.find('input[name=toDate]').val();

            if (fromDate > toDate) {
                _this.$el.find('input[name=toDate]').addClass('w2ui-error');
                _this.$el.find('input[name=toDate]').w2tag('시작일 이후의 일자를 <br> 선택하세요.');
                _this.$el.find('#search-btn').prop('disabled', true);

            } else {
                _this.$el.find('input[name=toDate]').removeClass('w2ui-error');
                _this.$el.find('input[name=toDate]').w2tag();
                _this.$el.find('#search-btn').prop('disabled', false);
            }

        },
        destroy: function () {
            var _this = this;
           if(_this.adminView){
                _this.adminView.destroy();
           }
            var sidebarName = _this.w2uiConfig.sidebar['name'];
            if (window.w2ui.hasOwnProperty('menu')) {
                window.w2ui['menu'].destroy()
            }
            this.undelegateEvents();
        }
    });
});