define([
	"swiper",
	"linearGague",
	"text!views/monitor_m",
	"css!cs/stylesheets/mobile/monitor.css",
	"css!cs/stylesheets/mobile/interaction.css"
], function (
	Swiper,
	LinearGague,
	HTML
) {
	var GasModel = Backbone.Model.extend({
		url: '/gas/gases',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		el: '.component',
		view: undefined,
		socket: undefined,
		targetSlide: undefined,
		sensorIndex: undefined, // 현재 소켓 연결 중인 센서인덱스
		siteName:undefined,
		status: undefined, // 현재 가스센서 상태
		gasList: undefined, // GAS { GASTYPE:{}},
		linearGagueObj: undefined,
		initialize: function () {
			console.log('MONITOR!!!')
			this.$el.html(HTML)
			// this.render();

			var _strSensorList = this.getCookie('sensorList');
			var _login = this.getCookie('login');
			_login = JSON.parse(_login.substr(2, _login.length - 1));
			// console.log(">>>",_login)
			this.siteName = _login['site_name']

			_strSensorList = _strSensorList.substr(2, _strSensorList.length - 1);
			var sensorList = JSON.parse(_strSensorList)
			var index = sensorList[0]['sensor_index']
			this.initSocketConn(index);

			this.swiperDraw(sensorList);
			//this.socket = main.socket = io();

		},
		events: {
			"click .swiper-slide": "changeIndex"
		},
		initSocketConn: function (index) {
			var _this = this;
			if (_this.sensorIndex !== index || !_this.sensorIndex) {
				if (!_this.linearGagueObj) {
					this.linearGagueRender();
				}
				if (_this.socket) {
					_this.socket.disconnect();
				}
				if(_this.gasList){
					_this.gasList = undefined
				}	
				// this.getGasList(index);
				_this.gasList = main.gasList[index];
				this.socket = main.socket = io();
				this.sensorIndex = index;
				// console.log(index)
				_this.socket.emit('initData', index);
				_this.socket.on('initData', function (data) {
					console.log(data['receiveSensor'])
					_this.render(data['receiveSensor']);

				});

			} else {
				console.log('Same sensorIndex!!')
				return false
			}

			_this.doSocketConn(index);

		},
		doSocketConn: function (index) {
			var _this = this;

			_this.socket.emit('getData', index);
			_this.socket.on('getData', function (data) {
				// console.log(data)
				_this.render(data);


			});

		},
		render: function (data) {
			var _this = this;
			var _action = data['action'];
			if (_action === 0 || _action === 2) {
				if (this.status !== _action) {
					_this.offRender();
				}

			}
			else if (_action === 1) {
				if (this.status !== _action) {
					_this.onRender();
				}
				_this.dataBinding(data);
			}
		},
		dataBinding: function (data) {
			var _this = this;
			for (var key in data) {
				if (key.indexOf('o2') > -1) {
					var o2Value = data['o2_value']
					var o2StateCode = data['o2_state_code']
					_this.$el.find('.o2-sensor').find('.number').text(o2Value)
					_this.stateBinding('o2', o2StateCode);
					_this.gaugeCalculator('o2', o2StateCode, o2Value);
				}
				else if (key.indexOf('voc') > -1) {
					var vocValue = data['voc_value']
					var vocStateCode = data['voc_state_code']
					_this.$el.find('.voc-sensor').find('.number').text(vocValue)
					_this.stateBinding('voc', vocStateCode);
					_this.gaugeCalculator('voc', vocStateCode, vocValue);

				}
				else if (key.indexOf('co') > -1) {
					var coValue = data['co_value']
					var coStateCode = data['co_state_code']
					_this.$el.find('.co-sensor').find('.number').text(coValue)
					_this.stateBinding('co', coStateCode);
					_this.gaugeCalculator('co', coStateCode, coValue);

				}
				else if (key.indexOf('h2s') > -1) {
					var h2sValue = data['h2s_value']
					var h2sStateCode = data['h2s_state_code']
					_this.$el.find('.h2s-sensor').find('.number').text(h2sValue)
					_this.stateBinding('h2s', h2sStateCode);
					_this.gaugeCalculator('h2s', h2sStateCode, h2sValue);


				} else {
					var combValue = data['comb_value']
					var combStateCode = data['comb_state_code']
					_this.$el.find('.comb-sensor').find('.number').text(combValue)
					_this.stateBinding('comb', combStateCode);
					_this.gaugeCalculator('comb', combStateCode, combValue);

				}

			}
		},
		stateBinding: function (gasType, state) {
			var _this = this;
			var gasData = _this.gasList[gasType];
			var rangeText = '';
			var stateText = '';
			var $targetStateClz = _this.$el.find('.' + gasType + '-sensor').find('.badge');
			var $targetValueClz = _this.$el.find('.' + gasType + '-sensor').find('.value');

			if (state === 0) {
				var normalLow = gasData['normal_low']
				var normalHigh = gasData['normal_high']
				rangeText = normalLow + '~' + normalHigh;
				$targetStateClz.addClass('normal');
				$targetStateClz.removeClass('warning');
				$targetStateClz.removeClass('danger');

				$targetValueClz.addClass('normal');
				$targetValueClz.removeClass('warning');
				$targetValueClz.removeClass('danger');


			}
			else if (state === 1) {
				if (gasType === 'o2') {
					$targetStateClz.removeClass('normal');
					$targetStateClz.removeClass('warning');
					$targetStateClz.addClass('danger');
	
					$targetValueClz.removeClass('normal');
					$targetValueClz.removeClass('warning');
					$targetValueClz.addClass('danger');

				} else {
					var warningLow = gasData['warning1_low']
					var warningHigh = gasData['warning1_high']
					rangeText = warningLow + '~' + warningHigh;

					$targetStateClz.removeClass('normal');
					$targetStateClz.addClass('warning');
					$targetStateClz.removeClass('danger');
					
					$targetValueClz.removeClass('normal');
					$targetValueClz.addClass('warning');
					$targetValueClz.removeClass('danger');
				}
			}
			else if (state === 2) {
				if (gasType === 'o2') {

				} else {
					var dangerLow = gasData['danger1_low']
					var dangerHigh = gasData['danger1_high']
					rangeText = dangerLow + '~' + dangerHigh;
				}
				$targetStateClz.removeClass('normal');
				$targetStateClz.removeClass('warning');
				$targetStateClz.addClass('danger');

				$targetValueClz.removeClass('normal');
				$targetValueClz.removeClass('warning');
				$targetValueClz.addClass('danger');
			}
			_this.$el.find('.' + gasType + '-sensor').find('.unit').text(rangeText)


		},
		changeIndex: function (event) {
			var _this = this;
			var _target = event.currentTarget;
			console.log(_target)
			var index = _this.$el.find(_target).find('.swiper-navigation-bar').text()

			_this.initSocketConn(index)

		},
		onRender: function () {
			var _this = this;
			_this.$el.find('.textbox').addClass('success');
			_this.$el.find('.gas-contents-box').addClass('success');



		},
		offRender: function () {
			var _this = this;
			_this.$el.find('.textbox').removeClass('success');
			_this.$el.find('.gas-contents-box').removeClass('success');
			_this.$el.find('.gas-list').find('.number').text("--")
			_this.$el.find('.badge').removeClass('normal');
			_this.$el.find('.badge').removeClass('warning');
			_this.$el.find('.badge').addClass('danger');

			_this.$el.find('.value').removeClass('normal');
			_this.$el.find('.value').removeClass('warning');
			_this.$el.find('.value').addClass('danger');

			_this.linearGagueObj['voc'].clear();
			_this.linearGagueObj['h2s'].clear();
			_this.linearGagueObj['co'].clear();
			_this.linearGagueObj['o2'].clear();
			_this.linearGagueObj['comb'].clear();

			_this.gaugeValue['voc'] = undefined;
			_this.gaugeValue['h2s'] = undefined;
			_this.gaugeValue['co'] = undefined;
			_this.gaugeValue['o2'] = undefined;
			_this.gaugeValue['comb'] = undefined;


		},
		swiperDraw: function (data) {
			var _this = this;
			var sensorList = data;

			var _html = '<div class="swiper-wrapper">';
			for (var i in sensorList) {
				var _name = sensorList[i]['name'];
				var _sensorIndex = sensorList[i]['sensor_index'];

				_html += `<div class="swiper-slide">
							<div class="swiper-sensor-title">${this.siteName}-${_name}</div>
							<div class="swiper-navigation-bar">${_sensorIndex}</div>
						</div>`;

			}
			_html += '</div>'

			_this.$el.find('#swiper-container').append(_html);


			var sensorListLeng = sensorList.length;
			var _slidePerView = 0;
			if (sensorListLeng === 1) {
				_slidePerView = 1;
			}
			else if (sensorListLeng > 1 && sensorListLeng <= 2) {
				_slidePerView = 2;
			}
			else if (sensorListLeng >= 3) {
				_slidePerView = 3;
			}
			_this.swiperRender(_slidePerView);

		},
		swiperRender: function (value) {
			var _this = this;
			var _slidesPerView = value;

			var mySwiper2 = new Swiper('#swiper-container', {
				watchSlidesProgress: true,
				watchSlidesVisibility: true,
				slidesPerView: _slidesPerView,
				clickable: true,
				allowSlideNext: true,
				allowTouchMove: true,
				animating: true,
				on: {
					init: function () {
						console.log('swiper initialized')
					},
					click: function (event) {

						//slide change
						var prevTargetIndex = event.clickedIndex;
						var actionTargetIndex = event.clickedIndex + 1;
						var nextTargetIndex = event.clickedIndex + 2;

						var elLeng = $('.swiper-slide').length;
						var prevTargetEl = $('.swiper-slide').length;

						targetIndex = actionTargetIndex;
						this.slideTo(prevTargetIndex, 400)
						// this.slideNext(400)

						var prevTargetEl = $('.swiper-slide:nth-child(' + prevTargetIndex + ')');
						var actionTargetEl = $('.swiper-slide:nth-child(' + actionTargetIndex + ')');
						var nextTargetEl = $('.swiper-slide:nth-child(' + nextTargetIndex + ')');

						$('.swiper-slide').removeClass('swiper-slide-prev');
						$('.swiper-slide').removeClass('swiper-slide-active');
						$('.swiper-slide').removeClass('swiper-slide-next');
						$('.swiper-slide').removeClass('swiper-slide-visible');


						prevTargetEl.addClass('swiper-slide-prev')
						actionTargetEl.addClass('swiper-slide-active')
						nextTargetEl.addClass('swiper-slide-next')

						prevTargetEl.addClass('swiper-slide-visible')
						actionTargetEl.addClass('swiper-slide-visible')
						nextTargetEl.addClass('swiper-slide-visible')

					},
					slideChange: function (event) {
						setTimeout(()=>{
							var index = _this.$el.find(event.$el).find('.swiper-slide-active').find('.swiper-navigation-bar').text()
							if(_this.targetSlide !== index){
								_this.$el.find(event.$el).find('.swiper-slide-active').trigger('click');
							}
						},500);
					}
				}

			})
		},
		gaugeValue: {},
		linearGagueRender: function () {
			var _this = this;
			_this.linearGagueObj = {}
			_this.linearGagueObj['voc'] = new LinearGauge('svg-box-voc');
			_this.linearGagueObj['voc'].init('voc');
			_this.gaugeValue['voc'] = undefined
			_this.linearGagueObj['comb'] = new LinearGauge('svg-box-comb');
			_this.linearGagueObj['comb'].init('comb');
			_this.gaugeValue['comb'] = undefined

			_this.linearGagueObj['o2'] = new LinearGauge('svg-box-o2');
			_this.linearGagueObj['o2'].init('o2');
			_this.gaugeValue['o2'] = undefined

			_this.linearGagueObj['h2s'] = new LinearGauge('svg-box-h2s');
			_this.linearGagueObj['h2s'].init('h2s');
			_this.gaugeValue['h2s'] = undefined

			_this.linearGagueObj['co'] = new LinearGauge('svg-box-co');
			_this.linearGagueObj['co'].init('co');
			_this.gaugeValue['co'] = undefined

		},
		gaugeCalculator: function (gasType, stateCode, value) {

			var _this = this;
			var _gasList = _this.gasList
			var result;
			if (gasType === 'o2') {
				if (stateCode === 0) {

					var normalLow = _gasList[gasType]['normal_low'];
					var normalHigh = _gasList[gasType]['normal_high'];
					var _division = normalHigh-normalLow;
					var _value = value-normalLow;
					var result = (_value/_division) *100;
					result = Math.round(result*100)/100

					var final = 20*(result/100)
					final = Math.round(final*100)/100
					final = 40+final;

					_this.linearGagueObj[gasType].setData(final);

				}
				else if (stateCode === 1 || stateCode === 2) {
					var danger1Low = _gasList[gasType]['danger1_low'];
					var warning1High = _gasList[gasType]['warning1_high']
					var warning2Low = _gasList[gasType]['warning2_low']
					var danger2High = _gasList[gasType]['danger2_high']

					if(value>=danger1Low && value<=warning1High){
						var result = (value/warning1High)*100
						var final = 40*(result/100)
						final = Math.round(final*100)/100
						final = (final<=40&&final>33.3) ? final-12 : final
						if (!_this.gaugeValue[gasType] || _this.gaugeValue[gasType] !== result) {
							_this.linearGagueObj[gasType].setData(final);
						}

					} 
					else if(value >= warning2Low && value<=danger2High){
						var _value = value-warning2Low;
						var _division = danger2High-warning2Low;
						var result = (_value/_division)*100;

						var final = 40*(result/100)
						final = Math.round(final*100)/100
						final = 60+final;
						final = final<66.6 ? final+6.6 : final
						if (!_this.gaugeValue[gasType] || _this.gaugeValue[gasType] !== result) {
							_this.linearGagueObj[gasType].setData(final);
						}

					}
				}
			} else {
				if (stateCode === 0) {
					var normalLow = _gasList[gasType]['normal_low'];
					var normalHigh = _gasList[gasType]['normal_high'];
					var _division = (1 / normalHigh) * value;
					result = (23.85 * _division) * 100;
					result = Math.round(result) / 100
					result = result === 0 ? 6.7 : result;
					if (!_this.gaugeValue[gasType] || _this.gaugeValue[gasType] !== result) {
						_this.gaugeValue[gasType] = result
						_this.linearGagueObj[gasType].setData(result);
					}
				}
				else if (stateCode === 1) {
					var warning1Low = _gasList[gasType]['warning1_low']
					var warning1High = _gasList[gasType]['warning1_high'];
					var _subWarning = value - warning1Low;
					var _division = (1 / (warning1High - warning1Low)) * _subWarning;
					var _multiWarning = 9.45 * _division;
					result = (40 + _multiWarning) * 100;
					result = Math.round(result) / 100

					if (!_this.gaugeValue[gasType] || _this.gaugeValue[gasType] !== result) {
						console.log(gasType, '->', result)
						_this.gaugeValue[gasType] = result
						_this.linearGagueObj[gasType].setData(result);
					}


				}
				else if (stateCode === 2) {
					var danger1Low = _gasList[gasType]['danger1_low']
					var danger1High = _gasList[gasType]['danger1_high'];
					var _subDanger = value - danger1Low;
					var _division = (1 / (danger1High - danger1Low)) * _subDanger;
					var _multiDanger = 16.7 * _division;
					result = (67 + _multiDanger) * 100;
					result = Math.round(result) / 100

					if (!_this.gaugeValue[gasType] || _this.gaugeValue[gasType] !== result) {
						_this.gaugeValue[gasType] = result
						_this.linearGagueObj[gasType].setData(result);
					}
				}
			}
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
		destroy: function () {
			this.socket.disconnect();
			this.undelegateEvents();
		}
	});
});