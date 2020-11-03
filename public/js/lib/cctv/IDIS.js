function Idis(objectId) {

	if (objectId !== undefined) {
		this.camOCX = document.getElementById(objectId);
	}
}

Idis.prototype = {
	camOCX: undefined,
	ieYn: false,     //브라우져 상태
	ptzEnable: false,  //ptz 동작 상태
	cctvInfo:{
		fan_address: undefined,
		user_id:undefined,
		password:undefined,
		port:undefined

	},
	init: function (data) {
		var _this = this;
		//setTimeout(_this.LoadDefault, 500);

		var agent = navigator.userAgent.toLowerCase();
		if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
			//ie 일 경우
			_this.ieYn = true
			_this.cctvInfo = data;
			_this.LoadDefault();

		}else{
			// ie가 아닐 경우
			this.ieYn=false;
			var test =document.getElementById(this.camOCX);
			console.log("chrom->",this.camOCX);
			var _html = "<div id='fetch-error'>CCTV는 인터넷익스플로러</br> 브라우저에서만 지원합니다.</div>"
			this.camOCX.innerHTML=_html;
		}
	},
	LoadDefault: function(){
		var _this = this;

		if(this.ieYn){
			_this.camOCX.setLayout(1);
			_this.camOCX.setDVRNSServer("dvrnames.net", 10088);
			var _gHostAddress = _this.cctvInfo['fan_address'];
			var _gUserId = _this.cctvInfo['user_id'];
			var _gUserPass = _this.cctvInfo['password'];
			var _gWatchPort = _this.cctvInfo['port']
			var _gDvrnsAddr= 'dvrnames.net';
			var _gDvrnsPort= 10088;
			var _gAudioPort = _this.cctvInfo['port'];
			console.log('CCTVINFO->>>>',_this.cctvInfo);
			// _this.camOCX.setCameraMap(0, 0, 'Web Watch', 'safe01', 0, 'admin', 'work1801!@', '8016', false, false, true, 'dvrnames.net', 10088, '8016');
			// WatSearCtrl.setCameraMap i, 0, gHostAddress, gHostAddress, i, gUserId, gUserPass, gWatchPort, 0, false, gUseDvrns, gDvrnsAddr, gDvrnsPort, gAudioPort
			_this.camOCX.setCameraMap(0, 0, 'Web Watch', _gHostAddress, 0, _gUserId, _gUserPass, _gWatchPort, false, false, true, _gDvrnsAddr, _gDvrnsPort, _gAudioPort);
			_this.camOCX.connect();
		}
	
	},
	WatSearCtrl_CameraStream: function(){
		var _this =this;
		_this.camOCX.setCameraStream(0, 0);

	},
	WatSearCtrl_ConnectedWatch: function(){
		var _this =this;
		window.setTimeout(_this.WatSearCtrl_CameraStream, 500);

	},
	onFullScreen: function(){
		var _this =this;
		_this.camOCX.fullScreen();
	},
	unLoad: function(){
		var _this =this;
		_this.camOCX.finalize();
	}

}
