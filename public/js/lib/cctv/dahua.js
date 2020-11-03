function Dahua(objectId){

	if(objectId !== undefined){
		this.camOCX = document.getElementById(objectId);
	}
}

Dahua.prototype={
	camOCX: undefined,
	ieYn : false,     //브라우져 상태
	ptzEnable:false,  //ptz 동작 상태
  init:function(option){
		var _this = this;
		var _option=option

		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
			//ie 일 경우
			_this.ieYn = true
			var _ip = _option.ip || "";
			var _port = _option.port || "";
			if(!_ip || !_port){
				alert("ip 또는 port를 확인하세요.")
			}
			
			_this.connect(_option);

		}else{
				// ie가 아닐 경우
			this.ieYn=false;
			var test =document.getElementById(this.camOCX);
			console.log("chrom->",this.camOCX);
			var _html = "<div><span>CCTV는 IE브라우저에서만</br> 지원합니다.</span></div>"
			this.camOCX.innerHTML=_html;
		}
	},
	connect:function(option){
		var _this=this;
		if(this.ieYn){
			var _option = option;
			var _ip = _option.ip || "";
			var _port = _option.port || "";
			// 최초 한번 수행.
			_this.camOCX.SetVideoWndNum (1);	// cam 화면에 1개의 화면만 표시되도록 4개까지 가능.
			//cctv ddns 접속
			_this.camOCX.LoginDevice( _ip, _port, "admin", "work1801!@", _port );  //ip, port, username, password, port
			_this.camOCX.ConnectRealVideo( _ip, 0, 0, 0); // ip, 0, 0, 0
		}
		
	},
	disConnect:function(ip){
		if(this.ieYn){
			var _this= this;
			var _ip = ip || "";
			var _successYN =	_this.camOCX.LogoutDevice(_ip);
				_this.camOCX.DisConnectRealVideo(_ip,0,0)
				if(_successYN){
					console.log("disconnect!!")
				}else{
					console.log("disconnect fali!!")
				}

		}
		 	
	},
	movePTZbutton:function(options){

     var _html = "<div class='ptzCtl' id='ptz-move'>"
		 for(var i=0; i<options.length; i++){
			 var moveAction = options[i];
			 var _id = moveAction.id || "";
			 var _code = moveAction.code || "";

	 	  _html += "<span class='moveptz' id='"+_id+"' value='"+_code+"''>("+_code+")</span>"

		 }
		 _html += "</div>"

		 return _html;

	},

	zoomPTZbutton:function(options){

	 var _html = "<select id='select-code'>"
	 		for(var i=0; i<options.length; i++){
					var zoomAction = options[i];
					var _id = zoomAction.id ||"";
					var _code= zoomAction.code || "";

					_html +=" <option id='"+_id+"' value='"+_code+"'>"+_code+"</option>"
			}
			_html  +="</select><div class='ptzCtl' id='ptz-zoom'><span class='zoomptz' id='plus' value='Plus'>Plus</span><span class='zoomptz' id='minus' value='Minus'>Minus</span></div>";

			return _html;

	},
  ptzLocate:function(){
		var _this = this;
		var _ieYn = _this.ieYn;
		var _ptzEnable = _this.ptzEnable;

		if ( _ieYn==false) { return ; }
		if(_ptzEnable){
			console.log("1.ptzEnable-->",_ptzEnable)
			//컨트롤 불가 상태로 전환
			_this.camOCX.ActivePTZLocate(false); //컨트롤 불가능
			_this.ptzEnable = false;
		}
		else{
			console.log("2.ptzEnable-->",_ptzEnable)
			//컨트롤 가능 상태로 전환
			_this.camOCX.ActivePTZLocate(true); //컨트롤 가능
			_this.ptzEnable = true;
		}
	},

	startPTZ:function(option){
		var _this = this;
		 var _ieYn = _this.ieYn;

		 if(_ieYn){
			 var _code = option.code || "";
			 var _step = option.step || 0;
			 console.log ( "StartPTZ, " + _code +", " + _step ) ;
 		  _this.camOCX.StartPTZ(_code,_step,_step,0); //PTZ 실행

		 }
	},
	stopPTZ:function(option){
		var _this = this;
		var _ieYn = _this.ieYn;

		if (_ieYn) {
			var _code = option.code || "";
		  var _step = option.step || 0;

				console.log ( "StopPTZ, " + _code +", " + _step ) ;
				_this.camOCX.StopPTZ(_code,_step,_step,0); //PTZ 멈춤
		}
	},
  zoomStartPTZ:function(option){
		var _this = this;
		var _ieYn = _this.ieYn;
		/* code = ZoomTele/FocusNear/IrisLarge */
		if(_ieYn){
			var _code = option.code || null;
			var _step = option.step || 0;
			console.log("zoomStartPTZ: ",_code,",",_step);

			if(_code && _step !== 0){
			    _this.startPTZ(option)
			}

		}

	},
	zoomStopPTZ:function(option){
		var _this = this;
		var _ieYn = _this.ieYn;
			/* code = ZoomWide/ZoomWide
								FocusFar/FocusNear
								IrisSmall/IrisLarge
			*/
       if(_ieYn){
			var _code = option.code || "";
			var _step = option.step || 0;
    	console.log("zoomStoptPTZ: ",_code,",",_step);
    	 if(_code && _step !== 0){
				_this.stopPTZ(option);
         }
       }
	},
	moveStartPTZ:function(option){
		/* code = LeftUp/Up/RightUp
				  Left/Locate/Right
				  LeftDown/Down/RightDown
		*/
		var _this =this;

		var _code = option.code || "";
		var _step = option.step || 0;
		console.log("moveStartPTZ:",_code,",",_step)

			console.log(">>>>",option);
	 if(_code && _step !== 0){
	  	_this.ptzStart(option);
	 }
	},
	moveStopPTZ:function(option){
		var _this =this;

		var _code = option.code || "";
		var _step = option.step || 0;
		console.log("moveStopPTZ:",_code,",",_step)
	 if(_code && _step !== 0){
	  	_this.ptzStop(option);
	 }
	}


}
