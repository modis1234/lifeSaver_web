function Jscharting(objectId) {

  if (objectId !== undefined) {
    this.element = document.getElementById(objectId);
    this.id = objectId;
    this.init(this.id);

  }
}

Jscharting.prototype = {
  id: undefined,
  element: undefined,
  data: undefined,
  chartObj: {},
  columnChart: undefined,
  init: function (data, callback) {
    var _this = this;
    _this.data = data;
    //_this[callback]();
    var _id = _this.id;

    _this.gauge();
  },
  gauge: function () {
    var _this = this;
    var _id = _this.id;
    var _options = {
      debug: true,
      type: 'gauge',
      legend_visible: false,
      animation_duration: 1000,
      chartArea_boxVisible: false,
      xAxis: {
        /*Used to position marker on top of axis line.*/
        scale: { range: [0, 1], invert: true }
      },
      palette: {
        pointValue: '%yValue',
        ranges: undefined
      },
      yAxis: {
        // lable:"1234",
        defaultTick: { padding: 13, enabled: false },
        customTicks: [30, 40, 60, 70],
        line: {
          width: 8,
          breaks_gap: 0.035,
          color: 'smartPalette'
        },
        scale: { range: [0, 100] }
      },
      defaultSeries: {
        opacity: 1,
        shape: {
          label: { align: 'center', verticalAlign: 'middle' }
        },
        angle: { sweep: 140 },
      },
      series: [
        {
          type: 'marker',
          name: 'Score',
          shape_label: {
            text: '',
            style: { fontSize: 48 }
          },
          defaultPoint: {
            tooltip: '%yValue',
            marker: {
              outline: { width: 4, color: 'currentColor' },
              fill: 'white',
              type: 'circle',
              visible: true,
              size: 17
            }
          },
          points: [[1, 0]]
        }
      ]
    };
    var transId = _id.toLowerCase();
    if (transId.indexOf('o2') > -1) {
      _options['palette']['ranges'] = [
        { value: 0, color: '#FF0000' },
        { value: 30, color: '#FF0000' },
        { value: 40, color: '#00A651' },
        { value: 60, color: '#FF0000' },
        { value: [70, 100], color: '#FF0000' }
      ]
    } else {
      _options['palette']['ranges'] = [
        { value: 0, color: '#00A651' },
        { value: 30, color: '#F6921E' },
        { value: 40, color: '#F6921E' },
        { value: 60, color: '#F6921E' },
        { value: [70, 100], color: '#FF0000' }
      ]
    }

    _this.chartObj = JSC.chart(_id, _options);
   
  }
}