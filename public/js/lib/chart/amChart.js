function chart(objectId) {

  if (objectId !== undefined) {
    this.element = document.getElementById(objectId);
    this.id = objectId;
  }
}

chart.prototype = {
  id: undefined,
  element: undefined,
  chartData: undefined,
  lineChart: undefined,
  columnChart: undefined,
  init: function (data, callback) {
    var _this = this;
    _this.chartData = data;

    //_this.pieofpie();
    _this[callback]();
  },
  realTime: function () {
    var _this = this;
    _this.line();
    var html = '<div class="column-chartDiv" id="'+_this.id+'-column" style="height: 249px;"></div>';
    var el = _this.element;
    $(el).after(html);
    _this.column();
    //_this.interval()
  },
  line: function () {
    var _this = this;
    /**
     * Generate random chart data
     */
    let chartData = _this.chartData;
    // _this.generateChartData();
    var el = _this.element;
    _this.lineChart = AmCharts.makeChart(el, {
      "type": "serial",
      "theme": "light",
      "zoomOutButton": {
        "backgroundColor": '#000000',
        "backgroundAlpha": 0.15
      },
      "dataProvider": chartData,
      "categoryField": "date",
      "categoryAxis": {
        "parseDates": false,
        "minPeriod": "ss",
        "dashLength": 1,
        "gridAlpha": 0.15,
        "axisColor": "#DADADA",
        "autoGridCount": false,
        "gridPosition": "start",
        "gridCount": 13,
        "color": "#C5C9CF"

      },
      "valueAxes": [{
        "id": "g1",
        // "minimum": 0,
        // "maximum": 1000,
      }],
      "graphs": [{
        "id": "g2",
        "valueField": "value",
        //"bullet": "round",
        "bulletBorderColor": "#FFFFFF",
        "bulletBorderThickness": 2,
        "lineThickness": 1,
        "lineColor": "#0D52D1",
        "negativeLineColor": "#0352b5",
        "hideBulletsCount": 50
      }],
      "chartCursor": {
        "cursorPosition": "mouse"
      },
      "chartScrollbar": {
        "graph": "g2",
        "scrollbarHeight": 40,
        "color": "#FFFFFF",
        "autoGridCount": true,
        "enabled": false
      }
    })
  },
  column: function () {
    var _this = this;
    var chartData = _this.chartData;
    console.log('column-->',chartData);
    _this.columnChart = AmCharts.makeChart(_this.id+'-column', {
      "type": "serial",
      "theme": "light",
      // "marginRight": 70,
      "dataProvider": chartData,
      "gridAboveGraphs": true,
      "startDuration": 1,
      "graphs": [{
        "id": "g2",
        "balloonText": "[[category]]: <b>[[value]]</b>",
        "fillColorsField": "color",
        "fillAlphas": 1,
        "lineAlpha": 0,
        "type": "column",
        "valueField": "value",
        "lineColor": "#fdd400",
      }],
      "valueAxes": [{
        "id": "g2",
        // "minimum": 0,
        // "maximum": 100
      }],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "date",
      "categoryAxis": {
        "gridPosition": "start",
        "gridAlpha": 1,
        // "tickPosition": "end",
        // "tickLength": 30,
        // 추가
        "autoGridCount": false,
        "tickPosition": "start",
        "tickLength": 20,
        "axisColor": "#929292",
        "axisThickness": 1,
        "axisAlpha": 1,
        "gridAlpha": 1,
        "gridColor": "#B1B5BA",
        "gridCount": 13,
        "gridThickness": 1,
        "parseDates": false,
        "minPeriod": "ss"
      },
      "export": {
        "enabled": true
        // "divId": "exportdiv"
      }

    });
  },
  generateChartData: function () {
    var _this = this;
    var firstDate = new Date();

    for (var i = 0; i < 13; i++) {
      var newDate = new Date(firstDate);
      newDate.setSeconds(newDate.getSeconds() + 2);

      var _getMonth = newDate.getMonth() + 1;
      var _getDate = newDate.getDate();
      var _getHours = newDate.getHours();
      var _getMinutes = newDate.getMinutes();
      var _getSenconds = newDate.getSeconds();

      var recordTime = (_getMonth >= 10 ? _getMonth : '0' + _getMonth)
        + '-' + (_getDate >= 10 ? _getDate : '0' + _getDate)
        + ' ' + (_getHours >= 10 ? _getHours : '0' + _getHours)
        + ':' + (_getMinutes >= 10 ? _getMinutes : '0' + _getMinutes)
        + ':' + (_getSenconds >= 10 ? _getSenconds : '0' + _getSenconds)


      _this.chartData.push({
        "date": "",
        "value": 1
      });
      firstDate = newDate;
    }
    // console.log(chartData);
    //return chartData;

  },
  interval: function () {
    var _this = this;
    setInterval(function () {
      // if mouse is down, stop all updates
      if (_this.lineChart.mouseDown)
        return;

      // add new datapoint at the end
      // var newDate = new Date(chartData[chartData.length - 1].date);
      // newDate.setSeconds(newDate.getSeconds() + 2);

      var newDate = new Date();
      var visits = Math.round(Math.random() * 40) + 500;
      var stockLeng = _this.lineChart.dataProvider.length;
      if (stockLeng >= 13) {
        _this.lineChart.dataProvider.splice(0, 1);
      }
      var _getMonth = newDate.getMonth() + 1;
      var _getDate = newDate.getDate();
      var _getHours = newDate.getHours();
      var _getMinutes = newDate.getMinutes();
      var _getSenconds = newDate.getSeconds();

      var recordTime = (_getMonth >= 10 ? _getMonth : '0' + _getMonth)
        + '-' + (_getDate >= 10 ? _getDate : '0' + _getDate)
        + ' ' + (_getHours >= 10 ? _getHours : '0' + _getHours)
        + ':' + (_getMinutes >= 10 ? _getMinutes : '0' + _getMinutes)
        + ':' + (_getSenconds > 10 ? _getSenconds : '0' + _getSenconds)

      _this.lineChart.dataProvider.push({
        date: "",
        value: visits
      });
      _this.lineChart.validateData();


      // if mouse is down, stop all updates
      if (_this.columnChart.mouseDown)
        return;
      var leng = _this.columnChart.dataProvider.length;
      if (leng >= 13) {
        _this.columnChart.dataProvider.splice(0, 1);
      }

      var _color;
      if (visits >= 50) {
        _color = "#FF0F00"
      }
      else if (visits < 50 && visits >= 30) {
        _color = "#00A652"
      }
      else if (visits < 30 && visits >= 0) {
        _color = "#F6931E"
      }

      _this.columnChart.dataProvider.push({
        "date": recordTime,
        "value": visits,
        "color": _color
      });

      _this.columnChart.validateData();
    }, 2000);
  }
}