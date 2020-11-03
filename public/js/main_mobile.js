define([
	"jquery",
	"jquery-mobile",
	"underscore",
	"backbone",
	"css!cs/stylesheets/mobile/main.css"
], function (
	$,
	$mobile,
	_,
	Backbone,
) {
	var GasModel = Backbone.Model.extend({
		url: '/gas/gases',
		parse: function (result) {
			return result;
		}
	});

	return Backbone.View.extend({
		el: 'body',
		view: undefined,
		gasList: undefined,
		initialize: function () {
			console.log('MOBILE!!!')
			this.render();
			this.gasModel = new GasModel();
			this.listenTo(this.gasModel, "sync", this.getGasList);
			this.gasModel.fetch();

		},
		events: {
			"click .menu-icon":"logoutHandler"
		},
		render: function () {
			var _this = this;
			var view = this.view;
			this.$el.find('.header-container').remove();
			if (view) view.destroy();
			var url = 'monitor_mobile';
			var _title = $(url).text();
			requirejs([
				'js/mobile/' + url
			], function (View) {
				var view = new View();
				_this.view = view;
			});

		},
		getGasList: function (model, response) {
			var _this = this;
			console.log(response)
			var results = response
			var _gasList = _this.gasList;
			_gasList = {}
			for (let i in results) {
				let _sensorIndex = results[i]['sensor_index']
				let isIndexProp = _gasList.hasOwnProperty(_sensorIndex);
				if (!isIndexProp) {
					_gasList[_sensorIndex] = {}
				}
				let code = results[i]['code'].toLowerCase();
				let isCodeProp = _gasList[_sensorIndex].hasOwnProperty(code);
				if (!isCodeProp) {
					_gasList[_sensorIndex][code] = results[i];
				}
			}
			_this.gasList = _gasList;
			console.log('0.gasLIst--->>>', _this.gasList)
		},
		logoutHandler: function () {
			location.replace('/logout');

		},
		destroy: function () {
			if (view) view.destroy();
			this.undelegateEvents();
		}
	});
});