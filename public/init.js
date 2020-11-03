requirejs([
	"require.config"
], function() {
	requirejs([
		"jquery",
		"jqueryui"
	], function($) {
		$(document).ready(function() {
			requirejs([
				"js/main"
			], function(
				Main
			){
				main = new Main();
			});
		});
	});
});
