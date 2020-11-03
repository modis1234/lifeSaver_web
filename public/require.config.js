requirejs.config({
    paths: {
        jquery : 'plugins/jQuery/jquery-1.12.5',
        jqueryui : 'plugins/jQueryUI/juqery-ui-no-conflict',
        "jquery-ui-src" : 'plugins/jQueryUI/jquery-ui.min',
        "jquery-mobile": 'plugins/jQueryMobile/jquery.mobile-1.4.5.min',
        backbone : 'plugins/backbone/backbone-min',
        underscore : "plugins/underscore/underscore-min",
        text : "plugins/require/text",
        socket:"plugins/socket/socket.io",
        bootstrap : 'plugins/bootstrap/js/bootstrap.min',
        popper : 'plugins/popper/popper.min',
        w2ui : 'plugins/w2ui/w2ui-1.5.rc1',
        swiper:"plugins/swiper/js/swiper-bundle.min",
        //openui : "js/lib/ui/OpenworksUI",
        moment: "plugins/moment/moment.min",
        daterangepicker: "plugins/daterangepicker/daterangepicker",
        core: "https://www.amcharts.com/lib/4/core.js",
        charts:"https://www.amcharts.com/lib/4/charts.js",
        animated:"https://www.amcharts.com/lib/4/themes/animated.js",
        frozen:"plugins/amChart/themes/frozen",
        amChart:"js/lib/chart/amChart",
        jsTypes:"js/lib/chart/jsc/modules/types",
        jsc:"js/lib/chart/jscharting",
        jscharting:"js/lib/chart/jsc/jscharting",
        ionSlider:"plugins/ionRangeSlider/js/ion.rangeSlider.min",
        alarm : "js/lib/alarm/alarm",
        cctv : "js/lib/cctv/IDIS",
        linearGague : "js/lib/linear-gauge/linear-gague",
        views : ".",
        cs : ".",
    },
    shim :{
        bootstrap : {
            deps : [
                'jquery',
                "jquery-ui-src",
                "css!plugins/bootstrap/css/bootstrap.min"
            ]
        },
        w2ui : {
            deps : [
                'css!plugins/w2ui/w2ui-1.5.rc1.min',
                "css!plugins/fontawesome5/css/fontawesome.min",
                "css!plugins/fontawesome5/css/all"
            ]    
        },
        jscharting: {
            deps: [
                "jsTypes",
                "css!js/lib/chart/css/default.css",
                "css!js/lib/chart/jscharting.css"

            ]
        },
        jsc: {
            deps: [
                "css!js/lib/chart/jscharting.css"

            ]
        },
        ionSlider: {
            deps: [
                "css!plugins/ionRangeSlider/css/ion.rangeSlider.min"
            ]
        },
        swiper: {
            deps: [
                "css!plugins/swiper/css/swiper-bundle.min"
            ]
        },
        daterangepicker:{
        	deps: [
        		"css!plugins/daterangepicker/daterangepicker"
        	]
        },
        "jquery-mobile": {
            deps : [
                "css!plugins/swiper/css/swiper-bundle.min.css",
                "css!plugins/fontawesome5/css/fontawesome.min",
                "css!plugins/fontawesome5/css/all"
            ]
        },
        linearGague: {
            deps: [
                "css!js/lib/linear-gauge/linear-gauge"
            ]
        }
        
    },
    map: {
        '*': {
            'css': 'plugins/require/css.min',
            'popper.js':'popper'
        },
    	
    }
});
