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
	return Backbone.View.extend({
		el: '.component',
		view: undefined,
		socket: undefined,
		targetSlide: undefined,
		sensorIndex: undefined,
		initialize: function () {
			console.log('MONITOR!!!')
			this.$el.html(HTML)
			// this.render();

			var _strSensorList = this.getCookie('sensorList');
			_strSensorList = _strSensorList.substr(2, _strSensorList.length - 1);
			var sensorList = JSON.parse(_strSensorList)
			console.log(sensorList)
			this.sensorIndex = sensorList[0]['sensor_index']

			this.swiperDraw(sensorList);
			this.linearGagueRender();
			this.socket = io();

			this.doSocketConn();
		},
		events: {

		},
		doSocketConn: function () {
			var _this = this;
			_this.socket.emit('sendIndex', _this.sensorIndex);
			_this.socket.on('getData', function (data) {
				var _sensor = data['receiveSensor'];
				console.log(_sensor['sensor_index'])
				_this.render(_sensor);
			});

			_this.joinSocket();

		},
		joinSocket: function () {
			var _this = this;
			var _socket = _this.socket;
			var _index = _this.sensorIndex;
			_socket.emit('joinRoom', _index);
			_socket.on('joinRoom', function (data) {
				console.log('join-->', data);
			});
		},
		changeIndex: function (index) {
			var _this = this;
			console.log('newIndex-->', _this.sensorIndex)

			_this.socket.emit('leaveRoom', _this.sensorIndex);

			// _this.socket.on('leaveRoom', function (data) {
			// 	console.log('leaveRoom:(-->', data)
			// });

			_this.socket.on('leave_2', (data) => {
			  });
			
			// new join
			_this.sensorIndex = index;
			_this.joinSocket();

		},
		render: function (data) {
			var _this = this;
			var action = data['action'];
			if (action === 0) {
				//sensor OFF!!!
				// _this.offRender();

			}
			else if (action === 1) {
				//sensor ON!!!
				_this.onRender();
				_this.dataBinding(data);
			}
			else if (action === 2) {
				//sensor RENDERING!!!
				// _this.loadingRender();

			}
		},
		dataBinding: function () {
			var _this = this;
		
		},
		onRender: function(){
			var _this =this;
			_this.$el.find('.textbox').addClass('success');
			_this.$el.find('.gas-contents-box').addClass('success');
			
		},
		offRender: function(){
			var _this =this;
			_this.$el.find('.textbox').removeClass('success');
			_this.$el.find('.gas-contents-box').removeClass('success');

		},
		swiperDraw: function (data) {
			var _this = this;
			var sensorList = data;

			var _html = '<div class="swiper-wrapper">';
			for (var i in sensorList) {
				var _name = sensorList[i]['name'];
				var _sensorIndex = sensorList[i]['sensor_index'];

				_html += `<div class="swiper-slide">
							<div class="swiper-sensor-title">${_name}</div>
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

						var targetSlide = event.clickedSlide;
						var sensorIndex = _this.$el.find(targetSlide).find('.swiper-navigation-bar').text();
						if (sensorIndex !== _this.targetSlide) {
							_this.targetSlide = sensorIndex
							_this.changeIndex(sensorIndex);
						}



					},
					slideChange: function () {
						console.log('slideChange')
						// var sensorIndex = _this.$el.find(targetSlide).find('.swiper-navigation-bar').text();
						// _this.changeIndex(sensorIndex);

					}
				}

			})
		},
		linearGagueRender: function () {
			var _this = this;

			var voc_linearGague = new LinearGauge('svg-box-voc');
			voc_linearGague.init();
			var comb_linearGague = new LinearGauge('svg-box-comb');
			comb_linearGague.init();
			var o2_linearGague = new LinearGauge('svg-box-o2');
			o2_linearGague.init();
			var h2s_linearGague = new LinearGauge('svg-box-h2s');
			h2s_linearGague.init();
			var co_linearGague = new LinearGauge('svg-box-co');
			co_linearGague.init();
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