function LinearGauge(objectId) {
    if (objectId !== undefined) {
        this.id = objectId;
        this._el = document.getElementById(objectId);
    }
}

LinearGauge.prototype = {
    _el: undefined,
    id: undefined,
    type: undefined,
    options: {
        count: 15,
        range: {
            'o2': [
                { from: 1, to: 5, text: 'danger' },
                { from: 6, to: 9, text: 'normal' },
                { from: 10, to: 15, text: 'danger' }
            ],
            'defalut': [
                { from: 1, to: 5, text: 'normal' },
                { from: 6, to: 9, text: 'warning' },
                { from: 10, to: 15, text: 'danger' }
            ]
        }
    },
    init: function (type) {
        var _this = this;
        _this.type = type;
        $(_this._el).addClass('linear-gague-container');
        _this.drawing();
    },
    drawing: function () {
        var _this = this;

        var _id = _this.id;
        var range;
        if (_this.type === 'o2') {
            range = _this.options['range']['o2'];
        } else {
            range = _this.options['range']['defalut'];
        }
        var _count = _this.options['count'];
        var _html = '';
        for (var i = 0; i < _count; i++) {
            var _topPosition = i * 5.3;
            var _number = (_count - i);
            var text = ''
            for (var j = 0; j < range.length; j++) {
                var from = range[j]['from'];
                var to = range[j]['to'];
                if (_number >= from && _number <= to) {
                    text = range[j]['text'];

                }
            }
            var _template = `<svg class="svgClz svgClz-${_id} svgClz-${text}" id="linearGague-data-${_id}-${_number}" range=${_number}/${_count} percent=${(100 / _count) * _number} active="false" state="${text}" style="top: ${_topPosition}px;">
                            <rect x="0" y="0" rx="1" ry="1" width="50" height="5"></rect></svg>`;
            _html += _template
        }
        _html += `<div class="point-out-container" id="point-out-${_id}-constainer"><div class="point-out" id="point-out-${_id}" state="normal"></div></div>`;

        $(_this._el).append(_html)
        if (_this.type === 'o2') {
            $(`#point-out-${_id}`).css('top', '30%');
            $(`.svgClz-svg-box-o2[state=normal]`).attr('active', 'true')
        } else {
            $(`#point-out-${_id}`).css('top', '0%');
        }


    },
    initStyle: function () {
        var _this = this;
    },
    setData: function (value) {
        var _this = this;
        var _id = this.id;
        var $targetList = $('.svgClz-' + _id);

        if (_this.type === 'o2') {
            var _stateText = '';
            for (var i = 0; i < $targetList.length; i++) {
                var percent = $($targetList[i]).attr('percent');
                var id = $($targetList[i]).attr('id');
                var _tempId = $($targetList[i + 1]).attr('id');
                if (value >= 40 && value <= 60) {
                    // normal
                    if (percent <= value && percent>=40 && percent<=60) {
                        // console.log('value-->>',value)
                        $('#' + id).attr('active', 'true');
                    } else if(percent >value || percent <40 ){
                        $('#' + id).attr('active', 'false');
                    }
                    _stateText = 'normal'
                }
                else if (value > 0 && value < 40) {
                    // low_danger
                    console.log('12321321321')
                    if (percent < value || percent > 60) {
                        $('#' + id).attr('active', 'false');
                    } else if (percent >= value && value < 40) {
                        $('#' + _tempId).attr('active', 'true');

                    }
                    _stateText = 'danger'

                }
                else if (value > 60 && value <= 100) {
                    //high_danger
                    if (percent >= value) {
                        $('#' + id).attr('active', 'false');
                    } else if(percent<value && percent > 40){
                        $('#' + id).attr('active', 'true');

                    }
                    _stateText = 'danger'

                }

            }

            $(`#point-out-${_id}`).animate({ top: value + '%' }, 500);
            $(`#point-out-${_id}`).attr('state', _stateText);
        } else {
            for (var i = 0; i < $targetList.length; i++) {
                var percent = $($targetList[i]).attr('percent');
                var id = $($targetList[i]).attr('id');
                if (percent >= 0 && percent <= value) {
                    $('#' + id).attr('active', 'true');
                }
                else if (percent > value) {
                    $('#' + id).attr('active', 'false');

                } else {
                    $('#' + id).attr('active', 'false');
                }
            }
            var _state = $($('.svgClz-' + _id + '[active=true]')[0]).attr('state');

            $(`#point-out-${_id}`).animate({ top: value + '%' }, 500);
            $(`#point-out-${_id}`).attr('state', _state);

        }


    },
    initData: function () {

    },
    getData: function () {

    },
    clear: function () {
        var _this = this;
        // _this.setData(0);
        $('.svgClz').attr('active','false')
        $('.point-out').animate({ top: '5px' }, 500);
    }

}
