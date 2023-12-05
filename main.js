class Music{
    constructor(id, name, src)
    {
        this.id = id;
        this.name = name;
        this.src = src;
    }

    GetFileBySrc(){

    }

    ParseFile(){

    }
}

class AudioPlayer{
    constructor(eid)
    {
        this.eid = eid;
        this.element = document.getElementById(eid);
        let tempContext = new (window.AudioContext || window.webkitAudioContext)();
        this.context = tempContext;
        this.analyser = tempContext.createAnalyser();
        this.gainnode = tempContext.createGain();
        this.gainnode.gain.value = 0;
        this.musicAnimation = function(){};
        
        this.currentMusic = null;
        this.currentMusicSource = null;
        // this.currentMusicBuffer = tempContext.createBufferSource();

        this.initBind();
    }

    initBind(){
        const array = [
            'setMusic',
            'playAnimation',
            'handlePause',
            'handlePlay',
            'getAnimationFrame'
        ];

        for(let temp of array)
        {
            this[temp] = this[temp].bind(this);
        }

        this.animationFrame = this.getAnimationFrame();
        this.element.addEventListener('play', this.handlePlay)
        this.element.addEventListener('pause', this.handlePause);
    }

    setMusic(music, musicAnimation){
        this.currentMusic = music;
        //选择audio作为播放源
        this.currentMusicSource = this.context.createMediaElementSource(document.getElementById(music.id));
        //连接analyserNode
        this.currentMusicSource.connect(this.analyser);
        //再连接到gainNode
        this.analyser.connect(this.gainnode);
        //最终输出到音频播放器
        this.gainnode.connect(this.context.destination);
        this.musicAnimation = musicAnimation;
    }

    handlePlay(e){
        this.gainnode.gain.value = 1;
        this.animationFrame(this.playAnimation);
    }

    handlePause(e){
        this.gainnode.gain.value = 0;
    }

    getAnimationFrame(callback){
        const temp = 
            window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            window.oRequestAnimationFrame || 
            window.msRequestAnimationFrame || 
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        return function(callback){
            temp(callback);
        };
    }

    playAnimation(){
        if(this.gainnode.gain.value === 1)
        {
            //出来的数组为8bit整型数组，即值为0~256，整个数组长度为1024，即会有1024个频率，只需要取部分进行显示
            let arrayLength = this.analyser.frequencyBinCount;
            let array = new Uint8Array(arrayLength);
            this.analyser.getByteFrequencyData(array);	//将音频节点的数据拷贝到Uin8Array中
            // console.log(array);
            this.musicAnimation(array)
            this.animationFrame(this.playAnimation);
        }
    }
}

class MusicAnimation{
    constructor(eid){
        this.eid = eid;
        this.canvasContainer = document.getElementById(eid);
        this.canvasWidth = this.canvasContainer.offsetWidth;
        this.canvasHeight = this.canvasContainer.offsetHeight;

        this.main = this.main.bind(this);
    }

    main(array){
        console.log(array)
    }
}

class Retangle{
    constructor(index, x, y , weight, height, perStepHeight, value){
        this.index = index;
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.perStepHeight = perStepHeight;

        this.height = height;
        this.value = value;
        this.topItemHeight = height;

        this.changeByValue = this.changeByValue.bind(this)
    }

    changeByValue(value){
        this.value = value;
        let oldHeight = this.height;
        this.height = value;
        if(this.height >= oldHeight){
            this.topItemHeight = this.height;
        }else{
            if(this.topItemHeight > 0){
                this.topItemHeight = this.topItemHeight - 1
            }
        }
    }
}

class RetangleMusicAnimation extends MusicAnimation{
    constructor(eid){
        super(eid)
        this.intervalWidth = 8;
        this.intervalWidth_Space = 2;
        this.intervalNumber = Math.floor(this.canvasWidth / this.intervalWidth);
        this.intervalLength = 0;
        this.playArray = [];

        this.context2D = this.canvasContainer.getContext('2d');
        this.canvasBackgroundStyle = 'rgba(255, 255, 255, .8)';
        this.context2D.fillStyle = this.canvasBackgroundStyle;
        this.context2D.fillRect(0, 0,  this.canvasWidth, this.canvasHeight);
        this.context2D.save();
        this.context2D.translate(0, this.canvasHeight);
        this.context2D.scale(1, -1);

        this.main = this.main.bind(this);
        this.setPlayArray = this.setPlayArray.bind(this);
        this.drawItem = this.drawItem.bind(this);
    }

    main(array){
        if(this.playArray.length === 0){
            this.setPlayArray(array);
            for(let item of this.playArray)
            {
                this.drawItem(item);
            }   
        }else{
            this.updatePlayArray(array);
            for(let item of this.playArray)
            {
                this.drawItem(item);
            }
        }
    }

    drawItem(item){
        console.log(item);
        this.context2D.fillStyle = this.canvasBackgroundStyle;
        this.context2D.fillRect(item.x, item.y, item.weight, this.canvasHeight);
        // this.context2D.clearRect(item.x, item.y, item.weight, this.canvasHeight);
        if(item.height < item.perStepHeight){
            this.context2D.fillStyle = "rgba(211, 211, 211, 1)";
            this.context2D.fillRect(item.x, item.y, item.weight, item.perStepHeight);
        }else{
            // let tempStyle = this.context2D.createLinearGradient(0, 0, 0, item.height);
            // tempStyle.addColorStop(0, "blue");
            // tempStyle.addColorStop(0.7, "yellow");
            // tempStyle.addColorStop(1, "red");
            this.context2D.fillStyle = "rgba(211, 211, 211, 1)";
            this.context2D.fillRect(item.x, item.y, item.weight, item.height);
        }
    }

    setPlayArray(array){
        let result = [];
        let arrayLength = array.length;
        this.intervalLength = Math.floor(arrayLength / this.intervalNumber);
        for(let i = 0 ; i < this.intervalNumber; i ++)
        {
            const item = new Retangle(
                i,
                i * this.intervalWidth,
                array[i * this.intervalLength],
                this.intervalWidth -this.intervalWidth_Space,
                array[i * this.intervalLength],
                5,
                array[i * this.intervalLength]
            )
            result.push(item);
        }
        this.playArray = result;
    }

    updatePlayArray(array){
        let arrayLength = array.length;
        this.intervalLength = Math.floor(arrayLength / this.intervalNumber);
        for(let i = 0 ; i < this.intervalNumber; i ++)
        {
            const temp = this.playArray[i];
            temp.changeByValue(array[i * this.intervalLength]);
        }
    }
}
const music1 = new Music('player-audio', 'diushoujuan', './diushoujuan.mp3');
const musicAnimation1 = new RetangleMusicAnimation('player-canvas');
document.querySelector('#start').addEventListener('click', () => {
	const player1 = new AudioPlayer('player-audio');
	player1.setMusic(music1, musicAnimation1.main);
})