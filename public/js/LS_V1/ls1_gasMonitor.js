define([
	"amChart",
	"jsc",
	"w2ui",
	"text!views/gasMonitor_v1",
	"text!views/severityPanel",
	"css!cs/stylesheets/ls_v1/main.css",
	"css!cs/stylesheets/ls_v1/layout.css",
	"css!cs/stylesheets/ls_v1/interaction.css",
	"css!cs/stylesheets/severityPanel.css",
	"css!cs/stylesheets/w2popup.css"
], function (
	amChart,
	JSC,
	w2ui,
	HTML,
	severityPanel
) {
	var GasModel = Backbone.Model.extend({
		url: '/gas/gases',
		parse: function (result) {
			return result;
		}
	});
	var TotalSensorModel = Backbone.Model.extend({
		url: '/sensor/sensorsTotal/totallist',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		el: '.container',
		serverAddress: 'http://119.207.78.146:9092',
		config: {
			layout: {
				name: 'layout',
				padding: 4,
				panels: [
					// { type: 'left', size: '50%', resizable: true, minSize: 300 },
					{ type: 'main', minSize: 300 }
				]
			},
			grid: {
				name: 'popupgrid',
				recid: 'id',
				recordHeight: 50,
				columns: [
					{ field: 'site_index', caption: '업체번호', size: '40%', sortable: true, attr: "align=center" },
					{ field: 'site_name', caption: '사업장', size: '40%', sortable: true, attr: "align=center" },
					{ field: 'version_name', caption: 'VERSION', size: '20%', sortable: true, attr: "align=center" },
					{ field: 'name', caption: '센서명칭', size: '40%', sortable: true, attr: "align=center" },
					// { field: 'server_href', caption: '연결', size: '40%', sortable: true, attr: "align=center" }
				],
				onClick: function (event) {
					var grid = this;
					event.onComplete = function () {
						var sel = grid.getSelection();
						if (sel.length == 1) {
							var record = grid.get(sel[0]);

							var _siteName = record['site_name'];
							var _sensorName = record['name'];
							var _version = record['version'];
							var _sensorIndex = record['sensor_index'];
							var _id = record['id'];

							console.log(record);
							if (_sensorIndex === window.main.sensorIndex) {
								grid.unselect(_id);
								return false
							}

							var options = {
								msg: '<span class="popop-title">' + _siteName + '-' + _sensorName + '</span> <br/><br/>연결하시겠습니까?',
								title: '계정 삭제',
								width: 250,
								height: 220,
								btn_yes: {
									text: '연결',
									class: '',
									style: 'background-image:linear-gradient(#73b6f0 0,#2391dd 100%); color: #fff',
									callBack: function () {
										document.cookie = "sensorIndex=" + _sensorIndex;
										document.cookie = "sensorName=" + escape(_sensorName);
										document.cookie = "siteName=" + escape(_siteName);
										document.cookie = "version=" + _version;

										var _server = record['address'];

										window.open(_server + "/lifesaver/" + _sensorIndex)

										w2popup.close();
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
				onRender: function (event) {
					console.log('object ' + this.name + ' is rendered');
				}
			}
		},
		totalSensorList: undefined,
		sensorList: undefined,
		gasList: undefined,
		gasType: ['O2', 'H2S', 'CO', 'VOC', 'COMB'],
		alarmFileName: undefined,
		alarmObj: {
			target: undefined,
			action: 0,
			audioObj: undefined
		},
		jschartObj: {},
		gauge: undefined,
		socket: undefined,
		selectedRow: undefined,
		rollingButton: 1,
		rollingAction: true,
		rollingCount: 0,
		warmingupCount: 0,
		targetButton: undefined,
		chartAction: false,
		usedTimeInterval: undefined,
		counterId: undefined,
		gasValue: { vocValue: 0, h2sValue: 0, combValue: 0, o2Value: 0, coValue: 0 },
		gasStateCode: { vocCode: undefined, h2sCode: undefined, combCode: undefined, o2Code: undefined, coCode: undefined },
		actionState: undefined,
		chartData: undefined,
		abnormalStateGas: {
			targetList: [],
			target: undefined,
			stateCode: undefined
		},
		initSocketConnected: false,
		_template: function (_name, _code, _unit) {
			var HTML = '<div class="name">' + _name + '</div>'
				+ '<div class="ename">' + _code + '</div>'
				+ '<div class="value"><span>--</span></div>'
				+ '<div class="unit">' + _unit + '</div>'
				+ '<div class="gaugeDiv" id="gauge-' + _code + '"></div>';
			return HTML;
		},
		initialize: function () {
			var _this = this;
			this.$el.html(HTML);
			// _this.initData()
			_this.startFnc()

			this.$el.find('.severityBox').html(severityPanel);

			// this.gasModel = new GasModel();
			// this.listenTo(this.gasModel, "sync", this.getGasList);
			// this.gasModel.fetch();


			this.totalSensorModel = new TotalSensorModel();
			this.listenTo(this.totalSensorModel, "sync", this.getTotalSensorList);
			this.totalSensorModel.fetch();

			// _this.buttonRolling();


			this.gasStateCode['vocCode'] = undefined;
			this.gasStateCode['h2sCode'] = undefined;
			this.gasStateCode['combCode'] = undefined;
			this.gasStateCode['o2Code'] = undefined;
			this.gasStateCode['coCode'] = undefined;

			this.getGasList(window.main.sensorIndex);

			var _title = window.main.getTitle();
			_this.$el.find('.tit-span').text(_title)

		},
		getTotalSensorList: function (model, response) {
			var _this = this;
			var currentSensorIndex = window.main.sensorIndex;
			var result = response
			for (i in result) {
				var _sensorIndex = result[i]['sensor_index'];
				if (currentSensorIndex === _sensorIndex) {
					result[i]['w2ui'] = {}
					result[i]['w2ui']['style'] = "background-color:#C2F5B4;"
				}

				var _version = result[i]['version'];
				var versionName;
				if (_version === 1) {
					versionName = "LS-V1"
				}
				else if (_version === 2) {
					versionName = "LS-V2"
				}
				result[i]['version_name'] = versionName;

			}

			_this.totalSensorList = result;

			this.config.grid.records = _this.totalSensorList;
			$().w2layout(this.config.layout);
			$().w2grid(this.config.grid);

			var gridName = _this.config.grid['name'];


		},
		sensorListPopup: function () {
			var _this = this;

			_this.openPopup()

			var gridName = _this.config.grid['name']
			setTimeout(function () {
				window.w2ui[gridName].refresh();
			}, 1000);
		},
		openPopup: function () {
			var _this = this;
			w2popup.open({
				title: '이동식가스센서 리스트',
				width: 900,
				height: 600,
				showMax: true,
				body: '<div id="main" style="position: absolute; left: 5px; top: 5px; right: 5px; bottom: 5px;"></div>',
				onOpen: function (event) {
					event.onComplete = function () {
						$('#w2ui-popup #main').w2render('layout');
						var gridName = _this.config.grid['name'];
						var layoutName = _this.config.layout['name'];
						window.w2ui[layoutName].content('main', window.w2ui[gridName]);
						window.w2ui[gridName].refresh();

					};
				},
				onToggle: function (event) {
					event.onComplete = function () {
						w2ui.layout.resize();
					}
				},
				onComplete: function () {
				},
				onClose: function () {

				}
			});
		},
		startFnc: function () {
			var _this = this;

			_this.socket = main.socket = io();
			_this.socket.on('start', function (data) {
				console.log(data)
				if (_this.initSocketConnected) {
					_this.socket.disconnect();
					_this.initSocketConnected = false
					_this.startFnc();
				} else {
					_this.initData();
					_this.initSocketConnected = true
				}
			});

		},
		initData: function () {
			var _this = this;
			_this.socket.emit('initData', window.main.sensorIndex);
			_this.socket.on('initData', function (data) {
				_this.sensorList = data;
				console.log(data)
				var action = data['receiveSensor']['action'];
				_this.chartData = data['receiveLog'];
				if (action === 1) {
					_this.getSensorList(data['receiveSensor']);
					_this.onRender();
					_this.startCounter(data['receiveSensor']);
				}
				else if (action === 0) {
					_this.offRender();
					//_this.chartData = undefined
					if (!_this.chartData) {
						_this.chartData = data['receiveLog'];
					}

				}
				else if (action === 2) {
					_this.warmingupCount = data['receiveSensor']['warmingup_count']
					if (!_this.chartData) {
						_this.chartData = data['receiveLog'];
					}
					_this.loadingRender();

				}
				_this.actionState = action;

				// 롤링시작
				if (action === 1) {
					_this.rollingCount = data['receiveSensor']['rolling_count'];
					if(_this.rollingInterval){
						clearInterval(_this.rollingInterval)
						_this.rollingInterval=undefined;
					}
					if(_this.rollingAction){
						_this.rollingInterval = setInterval(function () {
							_this.buttonRolling();
						}, _this.rollingCount);
					}
				}


				// PC 알람 파일 경로
				_this.alarmFileName = data['receiveSensor']['alarm_path'];

			});
			// _this.socket.disconnect();
			_this.getData();
		},
		getGasList: function (data) {
			var _this = this;
			var _sensorIndex = data;
			var model = new GasModel();
			model.url += '/' + _sensorIndex;
			model.fetch({
				success: function (model, response) {
					var result = response;
					_this.gasList = {};
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
		getData: function () {
			var _this = this;
			_this.socket = main.socket
			console.log('sendIndex')
			_this.socket.emit('getData', window.main.sensorIndex);
			_this.socket.on('getData', function (data) {
				_this.sensorList = data;
				// console.log('join-->',data)
				var action = data['action'];
				var htmlLang = $('.sensor').children().length;
				var _actionState = _this.actionState;
				//var action = 1;
				var _data = data;
				if (action === 1) {

					if (_actionState !== action) {
						_this.getSensorList(data);
						_this.onRender();
						_this.startCounter(data);

					} else {
						_this.dataBinding(_data);
						var obj = {};
						obj['id'] = _data['id'];
						obj['sensor_index'] = _data['sensor_index'];
						obj['device_index'] = _data['device_index'];
						obj['location'] = _data['location'];
						obj['record_time'] = _data['record_time'];

						obj['O2'] = {};
						obj['O2']['record_time'] = _data['record_time'];
						obj['O2']['gasType'] = 'O2';
						obj['O2']['value'] = _data['o2_value'];
						obj['O2']['state_code'] = _data['o2_state_code'];
						obj['O2']['name'] = '<br>산소';
						obj['O2']['unit'] = '%VOL';


						obj['H2S'] = {};
						obj['H2S']['record_time'] = _data['record_time']
						obj['H2S']['gasType'] = 'H2S';
						obj['H2S']['value'] = _data['h2s_value'];
						obj['H2S']['state_code'] = _data['h2s_state_code'];
						obj['H2S']['name'] = '<br>황화수소';
						obj['H2S']['unit'] = 'PPM';


						obj['CO'] = {};
						obj['CO']['record_time'] = _data['record_time']
						obj['CO']['gasType'] = 'CO';
						obj['CO']['value'] = _data['co_value'];
						obj['CO']['state_code'] = _data['co_state_code'];
						obj['CO']['name'] = '<br>일산화탄소';
						obj['CO']['unit'] = 'PPM';

						obj['VOC'] = {};
						obj['VOC']['record_time'] = _data['record_time'];
						obj['VOC']['gasType'] = 'VOC';
						obj['VOC']['value'] = _data['voc_value'];
						obj['VOC']['state_code'] = _data['voc_state_code'];
						obj['VOC']['name'] = '휘발성<br>유기화합물';
						obj['VOC']['unit'] = 'PPM';


						obj['COMB'] = {};
						obj['COMB']['record_time'] = _data['record_time']
						obj['COMB']['gasType'] = 'COMB';
						obj['COMB']['value'] = _data['comb_value'];
						obj['COMB']['state_code'] = _data['comb_state_code'];
						obj['COMB']['name'] = '<br>가연성가스';
						obj['COMB']['unit'] = '%LEL';

						_this.chartBinding(obj['O2']);
						_this.chartBinding(obj['H2S']);
						_this.chartBinding(obj['CO']);
						_this.chartBinding(obj['VOC']);
						_this.chartBinding(obj['COMB']);

						_this.gaugeBinding(obj['O2']);
						_this.gaugeBinding(obj['H2S']);
						_this.gaugeBinding(obj['CO']);
						_this.gaugeBinding(obj['VOC']);
						_this.gaugeBinding(obj['COMB']);
					}
				}
				else if (action === 0) {
					_this.offRender();
					clearInterval(_this.rollingInterval);
					_this.rollingInterval = undefined;
					_this.rollingAction = false
				}
				else if (action === 2) {
					_this.loadingRender();
					_this.gasStateCode['vocCode'] = undefined;
					_this.gasStateCode['h2sCode'] = undefined;
					_this.gasStateCode['combCode'] = undefined;
					_this.gasStateCode['o2Code'] = undefined;
					_this.gasStateCode['coCode'] = undefined;
					clearInterval(_this.rollingInterval);
					_this.rollingInterval = undefined;
					_this.rollingAction = false
					if(data['warmingup_count'] !== _this.warmingupCount || !_this.warmingupCount){
						_this.warmingupCount = data['warmingup_count']
					}
				}
				_this.actionState = action;
				var _rollingCount = data['rolling_count'];

				if (_this.rollingCount !== _rollingCount || _this.rollingInterval === undefined) {
					clearInterval(_this.rollingInterval);
					_this.rollingInterval = undefined;
					_this.rollingCount = _rollingCount;
					if(_this.rollingAction){
						_this.rollingInterval = setInterval(function () {
							_this.buttonRolling();
						}, _this.rollingCount);

					}
				}

				var _fileName = _this.alarmFileName;
				var _alarmPath = _data['alarm_path'];
				if (_fileName !== _alarmPath) {
					_this.alarmFileName = _alarmPath;
				}

			});


		},
		getSensorList: function (response) {
			var _this = this;
			var result = response;
			var htmlLang = $('.sensor').children().length;
			var action = result['action'];
			//var action = 1;
			if (htmlLang === 0 && action === 1) {
				var obj = {};
				obj['id'] = result['id'];
				obj['sensor_index'] = result['sensor_index'];
				obj['device_index'] = result['device_index'];
				obj['location'] = result['location'];
				obj['record_time'] = result['record_time'];

				obj['O2'] = {};
				obj['O2']['record_time'] = result['record_time'];
				obj['O2']['gasType'] = 'O2';
				obj['O2']['value'] = result['o2_value'];
				obj['O2']['state_code'] = result['o2_state_code'];
				obj['O2']['name'] = '<br>산소';
				obj['O2']['unit'] = '%VOL';


				obj['H2S'] = {};
				obj['H2S']['record_time'] = result['record_time']
				obj['H2S']['gasType'] = 'H2S';
				obj['H2S']['value'] = result['h2s_value'];
				obj['H2S']['state_code'] = result['h2s_state_code'];
				obj['H2S']['name'] = '<br>황화수소';
				obj['H2S']['unit'] = 'PPM';


				obj['CO'] = {};
				obj['CO']['record_time'] = result['record_time']
				obj['CO']['gasType'] = 'CO';
				obj['CO']['value'] = result['co_value'];
				obj['CO']['state_code'] = result['co_state_code'];
				obj['CO']['name'] = '<br>일산화탄소';
				obj['CO']['unit'] = 'PPM';

				obj['VOC'] = {};
				obj['VOC']['record_time'] = result['record_time'];
				obj['VOC']['gasType'] = 'VOC';
				obj['VOC']['value'] = result['voc_value'];
				obj['VOC']['state_code'] = result['voc_state_code'];
				obj['VOC']['name'] = '휘발성<br>유기화합물';
				obj['VOC']['unit'] = 'PPM';


				obj['COMB'] = {};
				obj['COMB']['record_time'] = result['record_time']
				obj['COMB']['gasType'] = 'COMB';
				obj['COMB']['value'] = result['comb_value'];
				obj['COMB']['state_code'] = result['comb_state_code'];
				obj['COMB']['name'] = '<br>가연성가스';
				obj['COMB']['unit'] = '%LEL';

				_this.render(obj);
			}

			_this.dataBinding(result);

		},
		render: function (data) {
			var _this = this;
			var o2_name = data['O2']['name'];
			var o2_code = data['O2']['gasType'];
			var o2_unit = data['O2']['unit'];
			var o2_template = _this._template(o2_name, o2_code, o2_unit);
			_this.$el.find('.o2.sensor').append(o2_template);

			var co_name = data['CO']['name'];
			var co_code = data['CO']['gasType'];
			var co_unit = data['CO']['unit'];
			var co_template = _this._template(co_name, co_code, co_unit);
			_this.$el.find('.co.sensor').append(co_template);

			var h2s_name = data['H2S']['name'];
			var h2s_code = data['H2S']['gasType'];
			var h2s_unit = data['H2S']['unit'];
			var h2s_template = _this._template(h2s_name, h2s_code, h2s_unit);
			_this.$el.find('.h2s.sensor').append(h2s_template);

			var voc_name = data['VOC']['name'];
			var voc_code = data['VOC']['gasType'];
			var voc_unit = data['VOC']['unit'];
			var voc_template = _this._template(voc_name, voc_code, voc_unit);
			_this.$el.find('.voc.sensor').append(voc_template);

			var comb_name = data['COMB']['name'];
			var comb_code = data['COMB']['gasType'];
			var comb_unit = data['COMB']['unit'];
			var comb_template = _this._template(comb_name, comb_code, comb_unit);
			_this.$el.find('.comb.sensor').append(comb_template);

			_this.gaugeRender();
			_this.chartRender(data);

		},
		dataBinding: function (data) {
			var _this = this;
			var _gasStateCode = _this.gasStateCode;

			var o2_value = data['o2_value'];
			var o2_state = data['o2_state_code'];
			_this.valueBinding('.o2.sensor', o2_value);
			if (o2_state !== _gasStateCode['o2Code']) {
				_this.stateBinding('.o2.sensor', 'o2', o2_state);
				_gasStateCode['o2Code'] = o2_state;
			};

			var co_value = data['co_value'];
			var co_state = data['co_state_code'];
			_this.valueBinding('.co.sensor', co_value);
			if (co_state !== _gasStateCode['coCode']) {
				_this.stateBinding('.co.sensor', 'co', co_state);
				_gasStateCode['coCode'] = co_state;
			};


			var h2s_value = data['h2s_value'];
			var h2s_state = data['h2s_state_code'];
			_this.valueBinding('.h2s.sensor', h2s_value);
			if (h2s_state !== _gasStateCode['h2sCode']) {
				_this.stateBinding('.h2s.sensor', 'h2s', h2s_state);
				_gasStateCode['h2sCode'] = h2s_state;
			};

			var voc_value = data['voc_value'];
			var voc_state = data['voc_state_code'];
			_this.valueBinding('.voc.sensor', voc_value);
			if (voc_state !== _gasStateCode['vocCode']) {
				_this.stateBinding('.voc.sensor', 'voc', voc_state);
				_gasStateCode['vocCode'] = voc_state;
			};

			var comb_value = data['comb_value'];
			var comb_state = data['comb_state_code'];
			_this.valueBinding('.comb.sensor', comb_value);
			if (comb_state !== _gasStateCode['combCode']) {
				_this.stateBinding('.comb.sensor', 'COMB', comb_state);
				_gasStateCode['combCode'] = comb_state;
			};

			// 알림음 
			var _abnormalStateGas = _this.abnormalStateGas;
			var _dangerTargetCnt = _abnormalStateGas['targetList'].length;
			var _dangerTarget = _abnormalStateGas['target'];
			var _dangerStateCode = _abnormalStateGas['stateCode'];
			var fileName = _this.alarmFileName;

			if (_dangerStateCode === 2 && _dangerTarget) {
				if (fileName) {
					var setTimeoutId = setTimeout(function () {
						var _audioObj = _this.alarmObj['audioObj'];
						if (!_audioObj) {
							console.log('00.audioObj!!!!!!!!')
							_this.alarmObj['target'] = _dangerTarget;
							_this.alarmPlayHandler();
						} else {
							//_this.playEvent();
							// console.log('11.audioObj!!!!!!!!')

							if (_this.alarmObj['target'] !== _dangerTarget) {
								_this.alarmObj['target'] = _dangerTarget
								_this.playEvent();
							}

						}
					}, 5000);
				}
			} else if (_dangerTargetCnt === 0) {
				if (fileName) {
					_this.alarmPauseHandler();
					clearTimeout(setTimeoutId);
					_this.alarmObj['audioObj']=undefined

				}
			}
		},
		alarmPlayHandler: function (event) {
			var _this = this;
			var fileName = _this.alarmFileName;
			var _audioObj = _this.alarmObj['audioObj'];
			_audioObj = {};
			var _audio = new Audio();
			_audio.src = _this.serverAddress + '/upload/' + fileName;
			_audio.volume = 1;
			_audio.loop = true;
			_audio.play();
			_this.alarmObj['audioObj'] = _audio
			_this.$el.find('.volume-up').css('display', 'none');
			_this.$el.find('.volume-mute').css('display', 'inline-block');
			if (_this.alarmObj['action'] === 0) {
				_this.$el.find('.volume-up').css('display', 'none');
				_this.$el.find('.volume-mute').css('display', 'inline-block');

			}
			_this.alarmObj['action'] = 1;


		},
		alarmPauseHandler: function (event) {
			var _this = this;
			var _audioObj = _this.alarmObj['audioObj'];
			if (_audioObj) {
				_this.$el.find('.volume-mute').css('display', 'none');
				_this.$el.find('.volume-up').css('display', 'none');
				_this.alarmObj['audioObj'].pause();
				_this.alarmObj['action'] = 0;
				_this.alarmObj['audioObj'] = undefined;
			}
		},
		playEvent: function () {
			var _this = this;
			_this.$el.find('.volume-up').css('display', 'none');
			_this.$el.find('.volume-mute').css('display', 'inline-block');
			_this.alarmObj['audioObj'].play();
			_this.alarmObj['action'] = 1;
		},
		pauseEvent: function () {
			var _this = this;
			_this.$el.find('.volume-mute').css('display', 'none');
			_this.$el.find('.volume-up').css('display', 'inline-block');
			_this.alarmObj['audioObj'].pause();
			_this.alarmObj['action'] = 0;
		},
		valueBinding: function (targetEl, value) {
			var _this = this;
			var $target = _this.$el.find(targetEl);
			var isInteger = _this.isInteger(value);

			$target.find('.value').text(isInteger);
		},
		isInteger: function (num) {
			if ((num ^ 0) === num) {
				num = num >= 10 ? num : '0' + num;
			};
			return num
		},
		stateBinding: function (targetEl, gasType, stateCode) {
			var _this = this;
			var lowGasType = gasType.toLowerCase();
			var $target = _this.$el.find(targetEl);
			if (stateCode === 0) {
				$target.addClass('nomal');
				$target.removeClass('warning');
				$target.removeClass('danger');
			}
			else if (stateCode === 1) {
				$target.removeClass('nomal');
				$target.addClass('warning');
				$target.removeClass('danger');
				//_this.$el.find('.chart-list.'+lowGasType+'-chart').trigger('click');
			}
			else if (stateCode === 2) {
				$target.removeClass('nomal');
				$target.removeClass('warning');
				$target.addClass('danger');

			}

			var targetStateCode = _this.abnormalStateGas['stateCode'];
			var targetGas = _this.abnormalStateGas['target'];
			if (stateCode === 1 || stateCode === 2) {
				// 다른 가스 상태 변화
				if (targetGas !== gasType || !targetGas) {
					// 다른 가스 같은 상태 상향 경고->위험: 위험 상태유지
					if (stateCode > targetStateCode || !targetStateCode) {
						console.log('stateCode-->', stateCode);
						_this.abnormalStateGas['target'] = gasType;
						_this.abnormalStateGas['stateCode'] = stateCode;

					}
					// 다른가스 같은 상태라면, 타겟 가스만 변경 상태
					else if (stateCode === targetStateCode) {
						_this.abnormalStateGas['target'] = gasType;
					}
				}
				else if (targetGas === gasType) {
					// 동일 가스 상태 하향 위험->경고
					if (stateCode !== targetStateCode) {
						_this.abnormalStateGas['stateCode'] = stateCode;
					}
				}

				// 상태리스트 추가
				var _findIndex = _this.abnormalStateGas['targetList'].indexOf(gasType);
				if (_findIndex === -1) {
					_this.abnormalStateGas['targetList'].push(gasType);
				}
				_this.rollingAction = false;
				_this.$el.find('.' + _this.abnormalStateGas['target'] + '-chart').trigger('click');
			}
			else if (stateCode === 0) {
				// 경고, 위험 상태에서 안전으로 복귀
				if (targetGas === gasType || !targetGas) {
					_this.abnormalStateGas['target'] = undefined;
					_this.abnormalStateGas['stateCode'] = undefined;
					var findIdx = _this.abnormalStateGas['targetList'].indexOf(gasType);
					_this.abnormalStateGas['targetList'].splice(findIdx, 1);

				}

				var listLang = _this.abnormalStateGas['targetList'].length;
				if (listLang !== 0) {
					_this.abnormalStateGas['target'] = _this.abnormalStateGas['targetList'][listLang - 1];
					var findIdx = _this.abnormalStateGas['targetList'].indexOf(gasType);
					if (findIdx > -1) {
						_this.abnormalStateGas['targetList'].splice(findIdx, 1);

					}
					// 트리거
					_this.rollingAction = false;
					_this.$el.find('.' + _this.abnormalStateGas['target'] + '-chart').trigger('click');
				}
			}
			// var hasClz = _this.$el.find('.sensor').hasClass('danger');
			// if (hasClz) {
			// 	//_this.$el.find('.volume-mute').css('display', 'inline-block');
			// } else {
			// 	_this.$el.find('.volume-up').css('display', 'none');
			// 	_this.$el.find('.volume-mute').css('display', 'none');

			// }
		},
		gaugeRender: function () {
			var _this = this;
			_this.jschartObj["jscVOC"] = new Jscharting('gauge-VOC');
			_this.jschartObj["jscCOMB"] = new Jscharting('gauge-COMB');
			_this.jschartObj["jscO2"] = new Jscharting('gauge-O2');
			_this.jschartObj["jscH2S"] = new Jscharting('gauge-H2S');
			_this.jschartObj["jscCO"] = new Jscharting('gauge-CO');
		},
		gaugeBinding: function (data) {
			var _this = this;
			var _gasType = data['gasType'];
			var _upperGasType = _gasType.toUpperCase();
			var _stateCode = data['state_code'];
			var _value = data['value'];
			var _lowerGasType = _gasType.toLowerCase();
			var fromValue = Math.floor(_this.gasValue[_lowerGasType + 'Value']);
			var result = _this.gaugeCalculator(_upperGasType, _stateCode, _value);
			var toValue = Math.floor(result);

			if (fromValue != toValue) {
				let slidValue;
				slidValue = setInterval(function () {
					if (toValue < fromValue) {
						fromValue -= 5;
						if (fromValue <= toValue) {
							clearInterval(slidValue);
						}
					}
					else if (toValue > fromValue) {
						fromValue += 5;
						if (fromValue >= toValue) {
							clearInterval(slidValue);
						}
					}
					_this.jschartObj["jsc" + _upperGasType].chartObj.series(0).options({ points: [[1, fromValue]] });

				}, 100);
				_this.gasValue[_lowerGasType + 'Value'] = toValue;

			}

			//_this.jschartObj["jsc"+_upperGasType].chartObj.series(0).options({ points: [[1, toValue]] });



		},
		gaugeCalculator: function (gasType, stateCode, value) {
			var _this = this;
			var _gasList = _this.gasList;
			var _value = value;
			var stateCode = stateCode;
			var _gasType = gasType.toUpperCase();
			if (_gasType.indexOf('O2') > -1) {
				if (stateCode === 0) {
					var normalLow = _gasList[gasType]['normal_low'];
					var normalHigh = _gasList[gasType]['normal_high'];
					var _subNormal = _value - normalLow;
					var _division = (1 / (normalHigh - normalLow)) * _subNormal;
					var _multiNomal = 20 * _division;
					var result = 40.1 + _multiNomal;

					var tempRange= 20;
					if(result <= tempRange){
						result = result+1;
					} else {
						result = result-1;
					}

					return result;

				}
				else if (stateCode === 1) {
					var warning1Low = _gasList[gasType]['warning1_low']
					var warning1High = _gasList[gasType]['warning1_high'];
					var warning2Low = _gasList[gasType]['warning2_low'];
					var warning2High = _gasList[gasType]['warning2_high'];
					var result;
					if (value >= warning1Low && value <= warning1High) {

						var _subWarning = _value - warning1Low;
						var _division = (1 / (warning1High - warning1Low)) * _subWarning;
						var _multiWarning = 10 * _division;
						result = 30 + _multiWarning;
					}
					else if (value >= warning2Low && value <= warning2High) {
						var _subWarning = _value - warning2Low;
						var _division = (1 / (warning2High - warning2Low)) * _subWarning;
						var _multiWarning = 10 * _division;
						result = 60 + _multiWarning;
					}


					return result;
				}
				else if (stateCode === 2) {
					var danger1Low = _gasList[gasType]['danger1_low']
					var danger1High = _gasList[gasType]['danger1_high'];
					var danger2Low = _gasList[gasType]['danger2_low'];
					var danger2High = _gasList[gasType]['danger2_high'];
					var result;
					if (value >= danger1Low && value <= danger1High) {

						var _subDanger = _value - danger1Low;
						var _division = (1 / (danger1High - danger1Low)) * _subDanger;
						var _multiDanger = 30 * _division;
						result = _multiDanger;
					}
					else if (value >= danger2Low && value <= danger2High) {
						var _subDanger = _value - danger2Low;
						var _division = (1 / (danger2High - danger2Low)) * _subDanger;
						var _multiDanger = 30 * _division;
						result = 70 + _multiDanger;
					}

					var tempRange= 85;
					if(result <= tempRange){
						result = result+1;
					} else {
						result = result-1;
					}

					return result;

				}
			} else {
				if (stateCode === 0) {
					var normalLow = _gasList[gasType]['normal_low'];
					var normalHigh = _gasList[gasType]['normal_high'];
					var _division = (1 / normalHigh) * _value;
					var result = 30 * _division;

					var tempRange= 15;
					if(result <= tempRange){
						result = result+0.5;
					} else {
						result = result-1;
					}
					return result;

				}
				else if (stateCode === 1) {
					var warning1Low = _gasList[gasType]['warning1_low']
					var warning1High = _gasList[gasType]['warning1_high'];
					var _subWarning = _value - warning1Low;
					var _division = (1 / (warning1High - warning1Low)) * _subWarning;
					var _multiWarning = 40 * _division;
					var result = 30 + _multiWarning;

					var tempRange= 50;
					if(result <= tempRange){
						result = result+1;
					} else {
						result = result-1;
					}
					return result;
				}
				else if (stateCode === 2) {
					var danger1Low = _gasList[gasType]['danger1_low']
					var danger1High = _gasList[gasType]['danger1_high'];
					var _subDanger = _value - danger1Low;
					var _division = (1 / (danger1High - danger1Low)) * _subDanger;
					var _multiDanger = 30 * _division;
					var result = 70 + _multiDanger;

					var tempRange= 85;
					if(result <= tempRange){
						result = result+1;
					} else {
						result = result-0.5;
					}
					return result;
				}
			}

		},
		onRender: function () {
			var _this = this;
			console.log("ON!!!!!!!")
			_this.$el.find('.stateBox').find('.area').addClass('success');
			_this.$el.find('.tit').addClass('success');
			_this.$el.find('.severityComp').find('.image').addClass('success');
			_this.$el.find('.severityComp').find('.range-value').addClass('success');

			_this.$el.find('.count').addClass('success');

			_this.$el.find('.count').find('.action').css('display', 'block');
			_this.$el.find('.count').find('.ready').css('display', 'none');

			_this.rollingAction = true;
			_this.chartAction = true;

			_this.$el.find('.chartBox > ul').css('display', 'block');


			if (_this.counterId) {
				clearInterval(_this.counterId);
				_this.counterId = undefined;
			}

			var listLang = _this.abnormalStateGas.targetList.langth;
			if (!listLang || listLang === 0) {
				_this.rollingAction = true;
				_this.$el.find('#voc-chartBox').css('display', 'block');
				_this.$el.find('#voc-chartBox').siblings().css('display', 'none');

			}
			else {
				_this.rollingAction = false;
				var lastGasType = _this.abnormalStateGas.targetList[0];
				lastGasType = lastGasType.toLowerCase();

				_this.$el.find('#' + lastGasType + '-chartBox').css('display', 'block');
				_this.$el.find('#' + lastGasType + '-chartBox').siblings().css('display', 'none');

			}
		},
		offRender: function () {
			var _this = this;
			console.log("OFF!!!!!!!")
			_this.$el.find('.stateBox').find('.area').removeClass('success');
			_this.$el.find('.stateBox').find('.server').addClass('success');

			_this.$el.find('.tit').removeClass('success');
			_this.$el.find('.severityComp').find('.image').removeClass('success');
			_this.$el.find('.severityComp').find('.range-value').removeClass('success');

			_this.$el.find('.count').find('.action').css('display', 'none');
			_this.$el.find('.count').find('.ready').css('display', 'block');
			_this.$el.find('.count').find('#usedTime-text').text('00:00:00');
			_this.$el.find('.count').find('.ready').text('시스템 준비중입니다.');
			_this.$el.find('.count').removeClass('sucess');


			_this.$el.find('.count').removeClass('success');
			// _this.$el.find('.count').find('.ready').css('display', 'block');
			_this.$el.find('.count').find('.action').css('display', 'none');
			_this.$el.find('.chart-contents-box').css('display', 'none');

			//_this.$el.find('.sensor').find('.value').text('--');
			_this.$el.find('.sensor').removeClass('nomal');
			_this.$el.find('.sensor').removeClass('warning');
			_this.$el.find('.sensor').removeClass('danger');
			//_this.$el.find('.chart-list').removeClass('select');
			_this.rollingAction = false;
			_this.chartAction = false;
			_this.$el.find('.sensor').find('.name').text('');
			_this.$el.find('.sensor').find('.ename').text('');
			_this.$el.find('.sensor').find('.value').text('');
			_this.$el.find('.sensor').find('.unit').text('');
			_this.$el.find('.sensor').empty();

			//_this.$el.find('#usedTime-text').text('00:00:00');

			clearInterval(_this.usedTimeInterval);
			_this.usedTimeInterval = undefined;
			_this.jschartObj = {};

			if (_this.counterId) {
				clearInterval(_this.counterId);
				_this.counterId = undefined;
			}

			_this.$el.find('.chartBox > ul').css('display', 'none');
			_this.$el.find('.chartBox > ul').find('.column-chartDiv').remove();

			_this.gasValue['vocValue'] = 0;
			_this.gasValue['combValue'] = 0;
			_this.gasValue['o2Value'] = 0;
			_this.gasValue['h2sValue'] = 0;
			_this.gasValue['coValue'] = 0;

			_this.gasStateCode['vocCode'] = undefined;
			_this.gasStateCode['h2sCode'] = undefined;
			_this.gasStateCode['combCode'] = undefined;
			_this.gasStateCode['o2Code'] = undefined;
			_this.gasStateCode['coCode'] = undefined;

			_this.$el.find('.camBox').find('.view').empty();

		},
		loadingRender: function () {
			console.log("LOADING!!!!!!!")
			var _this = this;
			_this.$el.find('.stateBox').find('.server').addClass('success');
			_this.$el.find('.tit').addClass('success');
			_this.$el.find('.stateBox').find('.lte').addClass('success');
			_this.$el.find('.stateBox').find('.battery').addClass('success');
			_this.$el.find('.stateBox').find('.server').addClass('success');
			_this.$el.find('.stateBox').find('.data').removeClass('success');

			// _this.$el.find('.severityBox').removeClass('success');
			_this.$el.find('.count').find('.time').addClass('success');
			_this.$el.find('.count').find('.time').css('display', 'block');
			_this.$el.find('.count').find('.ready').text('시스템 점검 중입니다.');

			_this.$el.find('.count').find('.action').css('display', 'none');
			_this.$el.find('.count').find('.ready').css('display', 'block');
			_this.$el.find('.count').find('.ready').text('시스템 점검 중입니다.');

			if (!_this.counterId) {
				_this.setTimer();
			}
			_this.$el.find('.count').removeClass('success');
			// _this.$el.find('.count').find('.ready').css('display', 'block');
			_this.$el.find('.count').find('.action').css('display', 'none');
			_this.$el.find('.chart-contents-box').css('display', 'none');

			//_this.$el.find('.sensor').find('.value').text('--');
			_this.$el.find('.sensor').removeClass('nomal');
			_this.$el.find('.sensor').removeClass('warning');
			_this.$el.find('.sensor').removeClass('danger');
			//_this.$el.find('.chart-list').removeClass('select');
			_this.rollingAction = false;
			_this.chartAction = false;
			_this.$el.find('.sensor').find('.name').text('');
			_this.$el.find('.sensor').find('.ename').text('');
			_this.$el.find('.sensor').find('.value').text('');
			_this.$el.find('.sensor').find('.unit').text('');
			_this.$el.find('.sensor').empty();

			clearInterval(_this.usedTimeInterval);
			_this.usedTimeInterval = undefined;

			_this.$el.find('.severityBox').find('.image').removeClass('success');
			_this.$el.find('.severityBox').find('.range-value').removeClass('success');

			_this.$el.find('.chartBox > ul').find('.column-chartDiv').remove();

			_this.gasValue['vocValue'] = 0;
			_this.gasValue['combValue'] = 0;
			_this.gasValue['o2Value'] = 0;
			_this.gasValue['h2sValue'] = 0;
			_this.gasValue['coValue'] = 0;
			console.log('end-----');
		},
		chartRender: function (data) {
			var _this = this;
			_this.gauge = {};
			var gasType = data;

			for (var key in gasType) {
				var gas = key;
				if (gas === 'O2') {
					_this.gauge[gas] = new chart('o2-chartDiv');
					_this.gauge[gas].init(_this.chartData['O2'], 'realTime');
				}
				else if (gas === 'CO') {
					_this.gauge[gas] = new chart('co-chartDiv');
					_this.gauge[gas].init(_this.chartData['CO'], 'realTime');
				}
				else if (gas === 'H2S') {
					_this.gauge[gas] = new chart('h2s-chartDiv');
					_this.gauge[gas].init(_this.chartData['H2S'], 'realTime');
				}
				else if (gas === 'VOC') {
					_this.gauge[gas] = new chart('voc-chartDiv');
					_this.gauge[gas].init(_this.chartData['VOC'], 'realTime');
				}
				else if (gas === 'COMB') {
					_this.gauge[gas] = new chart('comb-chartDiv');
					_this.gauge[gas].init(_this.chartData['COMB'], 'realTime');

				}
			}
		},
		chartBinding: function (data) {
			var _this = this;
			// if (!_this.chartAction) {
			// 	return false;
			// }
			var gasType = data['gasType'];
			var _gauge = _this.gauge[gasType];

			var recordTime = data['record_time'];
			recordTime = recordTime.substr(11, 8);
			var _value = data['value'];
			var _stateCode = data['state_code'];
			var _color;
			if (_stateCode === 0) {
				_color = "#00A651";
			}
			else if (_stateCode === 1) {
				_color = "#F6921E";
			}
			else if (_stateCode === 2) {
				_color = "#FF0000";
			}
			//lineChart bindings
			var stockLeng = _gauge.lineChart.dataProvider.length;
			if (stockLeng >= 13) {
				_gauge.lineChart.dataProvider.splice(0, 1);
			}
			_gauge.lineChart.dataProvider.push({
				"date": recordTime,
				"value": _value,
				"color": _color
			});

			_gauge.lineChart.validateData();
			_gauge.columnChart.validateData();


			//columnChart binding
			var leng = _gauge.columnChart.dataProvider.length;
			if (leng >= 13) {
				_gauge.columnChart.dataProvider.splice(0, 1);
			}

			// _gauge.columnChart.dataProvider.push({
			// 	"date": recordTime,
			// 	"value": _value,
			// 	"color": _color
			// });
		},
		chartShow: function (event) {
			var _this = this;
			if(!_this.rollingAction){
				return
			}
			var _target = event.currentTarget;
			var hasClaz = _this.$el.find(_target).hasClass('select');
			var _gasType;
			if (!hasClaz) {
				_this.$el.find(_target).siblings().removeClass('select');
				_this.$el.find(_target).addClass('select');
				_gasType = _this.$el.find(_target).attr('value');
				_this.$el.find('#' + _gasType + '-chartBox').css('display', 'block');
				_this.$el.find('#' + _gasType + '-chartBox').siblings().css('display', 'none');
			}
			console.log('rollingButton:', _this.rollingButton)
		},
		buttonRolling: function () {
			var _this = this;
			var listLang = _this.abnormalStateGas.targetList.length;
			if (!listLang) {
				_this.rollingAction = true;
				_this.$el.find('.rollingAt-box').css('display','flex')

			} else {
				_this.rollingAction = false;
				var gasTarget = _this.abnormalStateGas['target']
				_this.$el.find('#' + gasTarget + '-chartBox').css('display', 'block');
				_this.$el.find('#' + gasTarget + '-chartBox').siblings().css('display', 'none');
				_this.$el.find('.'+gasTarget+'-chart').siblings().removeClass('select');
				_this.$el.find('.'+gasTarget+'-chart').addClass('select');
				_this.$el.find('.rollingAt-box').css('display','none')
			}

			if (!_this.rollingAction || _this.actionState == 2) {
				return false;
			}

			var _nthChild = _this.targetButton;
			_nthChild++;
			if (_nthChild <= 5) {
				_this.$el.find('.chart-list:nth-child(' + _nthChild + ')').trigger('click');
			} else {
				_nthChild = 1;
			}
			_this.$el.find('.chart-list:nth-child(' + _nthChild + ')').trigger('click');
			_this.targetButton = _nthChild;

		},
		rollingTargetChange: function (event) {
			var _this = this;
			if(!_this.rollingAction){
				return
			}
			var target = event.currentTarget;
			var indexNo = $(target).index();
			console.log('indexNo-->', indexNo)
			_this.targetButton = indexNo;
		},
		rollingPlayEvent: function () {
			var _this = this;
			console.log("rollingPlayEvent");
			_this.$el.find('span#rolling-start-btn').css('display', 'none');
			_this.$el.find('span#rolling-stop-btn').css('display', 'flex');
			if(!_this.rollingInterva){
				_this.rollingInterval = setInterval(function () {
					_this.buttonRolling();
				}, _this.rollingCount);
				_this.rollingAction = true;
			}

		},
		rollingPauseEvent: function () {
			var _this = this;

			console.log("rollingPauseEvent");
			_this.$el.find('span#rolling-start-btn').css('display', 'flex');
			_this.$el.find('span#rolling-stop-btn').css('display', 'none');
			_this.rollingAction = false;
			clearInterval(_this.rollingInterval);
			_this.rollingInterval = undefined;
		},
		startCounter: function (_data) {
			var _this = this;
			var startTime = _data['start_time'];
			if (!_this.usedTimeInterval && startTime) {

				if (_this.counterId) {
					clearInterval(_this.counterId);
					_this.counterId = undefined;
				}
				_this.usedTimeInterval = setInterval(function () {
					_this.usedTime(startTime);
				}, 1000);
			}
		},
		usedTime: function (fromDate) {
			var _this = this;
			var toDay = new Date();
			var fromDay = new Date(fromDate);

			strPeriod = toDay.getTime() - fromDay.getTime();
			pDay = strPeriod / (60 * 60 * 24 * 1000);
			strDay = Math.floor(pDay);
			pHour = (strPeriod - (strDay * (60 * 60 * 24 * 1000))) / (60 * 60 * 1000);
			strHour = Math.floor(pHour);
			strMinute = Math.floor((strPeriod - (strDay * (60 * 60 * 24 * 1000)) - (strHour * (60 * 60 * 1000))) / (60 * 1000));
			strSeconds = Math.floor((strPeriod - (strDay * (60 * 60 * 24 * 1000)) - (strHour * (60 * 60 * 1000)) - (strMinute * (60 * 1000))) / 1000);

			strHour = strHour >= 10 ? strHour : '0' + strHour;
			strMinute = strMinute >= 10 ? strMinute : '0' + strMinute;
			strSeconds = strSeconds >= 10 ? strSeconds : '0' + strSeconds;

			var strCount = '';
			if(strDay>0){
				strCount = strDay+'일 '+strHour + ':' + strMinute + ':' + strSeconds;
			} else {
				strCount = strHour + ':' + strMinute + ':' + strSeconds;

			}
			_this.$el.find('#usedTime-text').text(strCount);
			//console.log("우리나라가 독립한지:" + strDay + " 일 " + strHour + " 시간 " + strMinute + " 분"+strSecond+"초 되었습니다.");
		},
		setTimer: function () {
			var _this = this;
			var time = _this.warmingupCount/1000;
			var min = '';
			var sec = '';
			_this.counterId = setInterval(function () {
				min = parseInt(time / 60); //몫 계산
				sec = time % 60; //나머지 계산
				var count = '00:' + (min >= 10 ? min : '0' + min) + ':' + (sec >= 10 ? sec : '0' + sec);
				_this.$el.find('#usedTime-text').text(count);

				time--;

				if (time < 0) {
					clearInterval(_this.counterId);
					_this.counterId = undefined;
					if (_this.actionState === 2) {
						if (!_this.counterId) {
							_this.setTimer();
						}
					} else if (_this.actionState === 0) {
						_this.offRender();
					}
				}
			}, 1000);

		},
		alarmPlay: function (event) {
			var _this = this;
			var _target = event.currentTarget;
			console.log(_target);
			_this.$el.find('.volume-up').css('display', 'none');
			_this.$el.find('.volume-mute').css('display', 'inline-block');
		},
		alarmPause: function (event) {
			var _this = this;
			var _target = event.currentTarget;
			console.log(_target);
			_this.$el.find('.volume-mute').css('display', 'none');
			_this.$el.find('.volume-up').css('display', 'inline-block');
		},
		events: {
			"click .chart-list": "chartShow",
			"mousedown .chart-list": "rollingTargetChange",
			"click .volume-mute": "pauseEvent",
			"click .volume-up": "playEvent",
			"click span#rolling-start-btn": "rollingPlayEvent",
			"click span#rolling-stop-btn": "rollingPauseEvent",
			"click .sensor-list": "sensorListPopup"
		},
		destroy: function () {
			var _this = this;
			_this.gasValue['vocValue'] = 0;
			_this.gasValue['combValue'] = 0;
			_this.gasValue['o2Value'] = 0;
			_this.gasValue['h2sValue'] = 0;
			_this.gasValue['coValue'] = 0;
			_this.gasStateCode['vocCode'] = undefined;
			_this.gasStateCode['h2sCode'] = undefined;
			_this.gasStateCode['combCode'] = undefined;
			_this.gasStateCode['o2Code'] = undefined;
			_this.gasStateCode['coCode'] = undefined;
			clearInterval(this.rollingInterval);
			clearInterval(this.usedTimeInterval);
			clearInterval(this.counterId);

			// this.socket.disconnect();
			// this.socket.emit('disconn', 'disconnect!!!!!!!!!!!!!!!')
			var layoutName = _this.config.layout['name'];
			if (window.w2ui.hasOwnProperty(layoutName)) {
				window.w2ui[layoutName].destroy()
			}
			var gridName = _this.config.grid['name'];
			if (window.w2ui.hasOwnProperty(gridName)) {
				window.w2ui[gridName].destroy()
			}


			this.undelegateEvents();
		}
	});
});