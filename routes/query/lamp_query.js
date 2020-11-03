const _query = {
    findByAll() {
        let query = 'SELECT * FROM env_lamp;';
        return query;
    },
    insert(data) {
        let ulDX = data.ulDX || ""; //현장 인덱스
        let elName = data.el_name || ""; //명칭
        let blIdx = data.bl_idx || 0; // 무슨 인덱???? 나도 몰라??? 왜 있지???
        let location = data.location || ""; // 설치위치
        let elAddress = data.el_address; //경광등 Address
        let elPort = data.el_port; //경광등 포트
        let safetyColor = data.el_s_color || 0; //안전 색상
        let safetyLamp = data.el_s_lamp || 0; //안전 점등 방식
        let safetySound = data.el_s_sound || 0; //안전 경광등 음원그룹
        let safetySoundCh = data.el_s_sound_ch || 0; //안전 경광등 음원그룹

        let warningColor = data.el_w_color || 0; //경고 색상
        let warningLamp = data.el_w_lamp || 0; //경고 점등 방식
        let warningSound = data.el_w_sound || 0; //경고 경광등 음원그룹
        let warningSoundCh = data.el_w_sound_ch || 0; //경고 경광등 음원그룹

        let dangerColor = data.el_d_color || 0; //위험 색상
        let dangerLamp = data.el_d_lamp || 0; //위험 점등 방식
        let dangerSound = data.el_d_sound || 0; //위험 경광등 음원그룹
        let dangerSoundCh = data.el_d_sound_ch || 0; //위험 경광등 음원그룹

        let networkColor = data.el_n_color || 0; //네트워크장애 색상
        let networkLamp = data.el_n_lamp || 0; //네트워크장애 점등 방식
        let networkSound = data.el_n_sound || 0; //네트워크장애 경광등 음원그룹
        let networkSoundCh = data.el_n_sound_ch || 0; //네트워크장애 경광등 음원그룹

        let actNum = data.act_num || 0; // 상태 알림: 0:안전, 2:경고, 3:위험, 4:네트워크장애
        let actSound = data.act_sound || 0; //사운드 ON/OFF(0:off,1:on)


        let query = `INSERT INTO env_lamp (uIDX, el_name, bl_idx, el_address, el_port, 
                    el_s_color, el_s_lamp, el_s_sound, el_s_sound_ch, 
                    el_w_color, el_w_lamp, el_w_sound, el_w_sound_ch, 
                    el_d_color, el_d_lamp, el_d_sound, el_d_sound_ch,
                    el_n_color, el_n_lamp, el_n_sound, el_n_sound_ch,
                    act_num, act_sound) '
                    VALUES ("${ulDX}", "${elName}", ${blIdx}, "${elAddress}", ${elPort}, 
                    ${safetyColor}, ${safetyLamp}, ${safetySound}, ${safetySoundCh}, 
                    ${warningColor}, ${warningLamp}, ${warningSound}, ${warningSoundCh}, 
                    ${dangerColor}, ${dangerLamp}, ${dangerSound}, ${dangerSoundCh}, 
                    ${networkColor}, ${networkLamp}, ${networkSound}, ${networkSoundCh}, 
                    ${actNum}, ${actSound});`; //input Column 수 : 24개
        return query;

    },
    update(data) {
        let _data = data;
        let _id = data.id;
        let el_name = data.el_name || ""; // 설치위치
        let elAddress = data.el_address || ""; //경광등 Address
        let elPort = data.el_port; //경광등 포트
        let safetyColor = data.el_s_color || 0; //안전 색상
        let safetyLamp = data.el_s_lamp || 0; //안전 점등 방식
        let safetySound = data.el_s_sound || 0; //안전 경광등 음원그룹
        let safetySoundCh = data.el_s_sound_ch || 0; //안전 경광등 음원그룹

        let warningColor = data.el_w_color || 0; //경고 색상
        let warningLamp = data.el_w_lamp || 0; //경고 점등 방식
        let warningSound = data.el_w_sound || 0; //경고 경광등 음원그룹
        let warningSoundCh = data.el_w_sound_ch || 0; //경고 경광등 음원그룹

        let dangerColor = data.el_d_color || 0; //위험 색상
        let dangerLamp = data.el_d_lamp || 0; //위험 점등 방식
        let dangerSound = data.el_d_sound || 0; //위험 경광등 음원그룹
        let dangerSoundCh = data.el_d_sound_ch || 0; //위험 경광등 음원그룹

        let networkColor = data.el_n_color || 0; //네트워크장애 색상
        let networkLamp = data.el_n_lamp || 0; //네트워크장애 점등 방식
        let networkSound = data.el_n_sound || 0; //네트워크장애 경광등 음원그룹
        let networkSoundCh = data.el_n_sound_ch || 0; //네트워크장애 경광등 음원그룹

        let actSound = data.act_sound || 0; //사운드 ON/OFF(0:off,1:on)

        let query = `UPDATE env_lamp SET 
                        el_name="${el_name}", 
                        el_address="${elAddress}", 
                        el_port=${elPort}, '
                        el_s_color=${safetyColor}, 
                        el_s_lamp=${safetyLamp}, 
                        el_s_sound=${safetySound}, 
                        el_s_sound_ch=${safetySoundCh}, 
                        el_w_color=${warningColor}, 
                        el_w_lamp=${warningLamp}, 
                        el_w_sound=${warningSound}, 
                        el_w_sound_ch=${warningSoundCh}, 
                        el_d_color=${dangerColor}, 
                        el_d_lamp=${dangerLamp}, 
                        el_d_sound=${dangerSound}, 
                        el_d_sound_ch=${dangerSoundCh}, 
                        el_n_color=${networkColor}, 
                        el_n_lamp=${networkLamp}, 
                        el_n_sound=${networkSound}, 
                        el_n_sound_ch=${networkSoundCh} 
                    WHERE el_idx=${_id};`;

        return query;
    },
    /* 
        @CRUD UPDATE
        @param x
        @body actSound (0:OFF, 1:ON)
        @comment 경광등 사운드 off
    */
    soundOff(data) {
        let _data = data;
        let actSound = data.act_sound || 0; //사운드 ON/OFF(0:off,1:on)

        let query = `UPDATE env_lamp SET 
                    act_sound=${actSound};`;

        return query;


    },
    delete(params) {
        let _id = params.id;

        let query = `DELETE FROM env_lamp WHERE el_idx=${_id};`;
        return query;
    }
}

module.exports = _query;
