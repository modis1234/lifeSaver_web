define([
	"jquery",
	"underscore",
	"backbone",
	"socket",
	"css!cs/stylesheets/common.css",
	"css!cs/stylesheets/layout.css",
	// "css!cs/stylesheets/interaction.css",
	"css!cs/stylesheets/fontawesome.css"
], function (
	$,
	_,
	Backbone,
	Socket
) {
	var GasModel = Backbone.Model.extend({
		url: '/gas/gases',
		parse: function (result) {
			return result;
		}
	});
	var ServerModel = Backbone.Model.extend({
		url: '/server',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		el: 'body',
		view: undefined,
		target: undefined,
		sensorIndex: undefined,
		version: undefined,
		gasList: undefined,
		fullscreenYN: false,
		audioObj: {},
		socket: undefined,
		initialize: function () {
			this.monitorRender();
			// if(!this.socket){
			// 	this.socket = io();

			// }
			//this.adminRender();
			//this.socket = io();

		},
		events: {
			"click .adm": "adminRender",
			"click #dashboard-btn": "monitorRender",
			"click #logout-btn": "logoutHandler"
		},
		monitorRender: function(){
			var _this=this;
			
			_this.$el.find('.header-container').css('display', 'none');
			_this.$el.find('.header-container').removeAttr('id');
			_this.$el.find('.container').removeAttr('id');
			_this.$el.find('.footer-container').removeAttr('id');

			var _url = window.location.pathname;
			_this.sensorIndex = _url.split('/')[2];
			console.log(_this.sensorIndex)
			this.getGasList(_this.sensorIndex);

			var loginObj = _this.getLoginObj();
			console.log('>>>>>>>>',loginObj);
			var sensorVersion = loginObj['sensor'][_this.sensorIndex]['version'];
			sensorVersion = Number(sensorVersion)

			_this.version = sensorVersion;
			// 버전에 따라서 js 파일 로딩(LS-V1=1, LS-V2=2)
			if(sensorVersion===1){		
				console.log("LS-V1")
				_this.render_lsv1()

			} 
			else if(sensorVersion===2){
				_this.render_lsv2()
				console.log('>>>>>>>>>>>>>>>>>>>>>')
			}
			
		},
		render_lsv1: function () {
			var _this = this;

			var view = this.view;
			if (view) view.destroy();
			var url = 'ls1_gasMonitor';
			var _title = $(url).text();
			requirejs([
				'js/LS_V1/' + url
			], function (View) {
				//_this.$el.find('.bottom-component').empty();
				var view = new View();
				_this.view = view;

			});
		},
		render_lsv2: function () {
			var _this = this;

			var view = this.view;
			if (view) view.destroy();
			var url = 'ls2_gasMonitor';
			var _title = $(url).text();
			requirejs([
				'js/LS_V2/' + url
			], function (View) {
				//_this.$el.find('.bottom-component').empty();
				var view = new View();
				_this.view = view;

			});
		},
		adminRender: function () {
			var _this = this;
			_this.socket.disconnect()
			_this.socket.emit('clearInterval',this.sensorIndex);
			_this.$el.find('.header-container').css('display', 'block');
			this.$el.find('.header-container').attr('id', 'admin-header-container');
			this.$el.find('.container').attr('id', 'admin-container');
			this.$el.find('.footer-container').attr('id', 'admin-footer-container');
			// _this.socket.emit('leaveRoom', _this.sensorIndex);
			var view = this.view;
			if (view) view.destroy();
			var url = 'administrator';
			var _title = $(url).text();
			requirejs([
				'js/' + url
			], function (view) {
				//_this.$el.find('.bottom-component').empty();
				var view = new view();
				_this.view = view;
			});


		},
		getGasList: function (data) {
			var _this = this;
			console.log('getGasList->', data)
			var _sensorIndex = data;
			var model = new GasModel();
			model.url += '/' + _sensorIndex;
			model.fetch({
				success: function (model, response) {
					var result = response;
					_this.gasList = {};
					console.log('0.gasLIst--->>>', result)
					for (var i in result) {
						var code = result[i]['code'];
						_this.gasList[code] = result[i];

						code = code.toLowerCase();

						if (code.indexOf('o2') > -1) {
							_this.$el.find('.severityComp').find('.range.' + code).find('.min-value').text(result[i]['range_min']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.warning-low-value').text(result[i]['warning1_low']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.safety-low-value').text(result[i]['normal_low']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.safety-high-value').text(result[i]['normal_high']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.warning-high-value').text(result[i]['warning2_high']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.max-value').text(result[i]['range_max']);

						} else {
							_this.$el.find('.severityComp').find('.range.' + code).find('.min-value').text(result[i]['range_min']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.safety-value').text(result[i]['normal_high']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.warning-value').text(result[i]['warning1_high']);
							_this.$el.find('.severityComp').find('.range.' + code).find('.max-value').text(result[i]['range_max']);
						}
					}
				},
				error: function (model, response) {

				},
			});
		},
		setMain: function (target) {
			var _this = this;
			var _target = target;
			//_this.target = menu;
			if (_this.target == _target) {
				return false;
			} else {
				_this.target = _target;
				var view = this.view;
				if (view) {
					view.destroy();
				}
				var url = _target;
				requirejs([
					'js/' + url
				], function (View) {
					var view = new View();
					_this.view = view;
				});
			}
		},
		logoutHandler: function () {
			var _this = this;
			location.replace('/logout');

		},
		getCookie: function (cname) {
			var name = cname + "=";
			//var decodedCookie = decodeURIComponent(document.cookie);
			var ca = document.cookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				var _indexOf = c.indexOf(name);
				
				if (c.indexOf(name) == 0) {
					var reuslt = c.substring(name.length, c.length);
					return decodeURIComponent(reuslt)
				}
			}
			return "";
		},
		getTitle: function () {
			var _this = this;
			var sensorIndex = _this.sensorIndex;
			var _cookie = this.getCookie('login');
			_cookie = _cookie.substr(2, _cookie.length - 1);
			var _loginObj = JSON.parse(_cookie)
			var sensorObj = _loginObj['sensor'];
			var sensorName = sensorObj[sensorIndex]['name'];

			var siteName = _loginObj['site_name']
			console.log(sensorName)

			var _title = siteName + '-' + sensorName

			return _title
		},
		getLoginObj: function(){
			var _cookie = this.getCookie('login');
			_cookie = _cookie.substr(2, _cookie.length - 1);
			var _loginObj = JSON.parse(_cookie)
			
			return _loginObj
		},
		destroy: function () {
			console.log('socket-->',main.socket)
			this.socket.disconnect();
			this.undelegateEvents();
		}
	});
});