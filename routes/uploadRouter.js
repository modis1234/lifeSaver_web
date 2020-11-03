const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require('path');

const fs = require('fs');

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/upload/")
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + extension);
    }
});

let upload = multer({
    //dest: 'upload/'
    storage: storage
});

router.post('/create', upload.single("imgFile"), function (req, res, next) {
    let file = req.file
    let result = {
        originalName: file.originalname,
        size: file.size
    }
    res.status(200);

});

router.get('/read/:path', function (req, res, next) {
    // fs.readFile('./upload/login_tel.png', function(err, data) {
    //     //res.writeHead(200, {"Content-Type": "image/png"});
    //     console.log(data);
    //     res.send(data);
    //     res.end();
    // });
    var _param = req.params.path;
    var filename = '/upload/' + _param;
    console.log(filename);
    fs.readFile(filename,              //파일 읽기
        function (err, data) {
            if(err) {
                res.status(404).end();
            } else {
                //http의 헤더정보를 클라이언트쪽으로 출력
                //image/jpg : jpg 이미지 파일을 전송한다
                //write 로 보낼 내용을 입력
                res.writeHead(200, { "Context-Type": "audio/mpeg3" });//보낼 헤더를 만듬
                res.write(data);   //본문을 만들고
                res.end();  //클라이언트에게 응답을 전송한다
            }
        }
    );

});


module.exports = router;
