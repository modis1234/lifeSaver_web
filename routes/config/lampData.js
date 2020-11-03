const lamp = {
    color:{
        0:'OFF',
        2:'적색',        
        3:'황색',        
        4:'녹색',
        5:'적색+황색',
        6:'적색+녹색',
        7:'황색+녹색',
        8:'적색+황색+녹색'
    },
    lampType: {
        0:'OFF',
        1:'ON',
        2:'BLINK'
    },
    soundGroup: {
        0:'WS',
        1:'WP',
        2:'WM',
        3:'WA',
        4:'WB',
    },
    soundChannel:{
        0:'OFF',
        1:'Fire A_WANG',
        2:'Emergency',
        3:'Ambulance',
        4:'PI-PI-PI',
        5:'PI_continue'
    }
};

module.exports=lamp;