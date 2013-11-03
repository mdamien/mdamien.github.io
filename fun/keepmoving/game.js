var Game = {};
Game.framerate = 24; //frame/sec
Game.offset_speed = 10; //px/sec
var p = {};
var ctx = null;

Math.seedrandom("I love my carrot");

function rand(min,max){
    return Math.random()*(max-min)+min;
}

function rect_collide(a,b,off){
    by = b.y+off;
    return !(a.x > b.x+b.w ||  a.x+a.w < b.x || a.y > by+b.h || a.y+a.h < by)
    return !(a.x > x_2+width_2 || x_1+width_1 < x_2 || y_1 > y_2+height_2 || y_1+height_1 < y_2);
    return !(
      ((a.y + a.h) < (b.y)) ||
      (a.y > (b.y + b.h+off)) ||
      ((a.x + a.w) < b.x) ||
      (a.x > (b.x + b.h+off))
  );
}

Game.init = function (){
    Game.canvas = $('#game').get(0);
    ctx = Game.canvas.getContext("2d");
    Game.w = Game.canvas.width;
    Game.h = Game.canvas.height;
    p.x = Game.w/2;
    p.y = Game.h-40;
    p.w = 10;
    p.h = 10;
    Game.offset = 0;
    Game.last_loose = 0;
    Game.max = 0;
    
    Game.objs = []
    Game.last_gen = 0;
    Game.generate_obstacles();
    
    $("#game").mousemove(Game.mousemoved);
    setInterval(Game.loop,1000/Game.frameRate);
}
$(document).ready(Game.init)

Game.draw = function (){
    ctx.clearRect(0,0,Game.w,Game.h);
    for (var i = 0; i < Game.objs.length; i++) {
        var o = Game.objs[i];
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x, o.y+Game.offset, o.w, o.h);
    }
    ctx.fillStyle = "#A00";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    $("#score").html("Score: "+Math.floor(Game.offset-Game.last_loose)+"<br/>Max:"+Math.floor(Game.max));
}

Game.generate_obstacles = function(){
    if(Game.last_gen - Game.h*2 < Game.offset){
        for(var i = 0;i < 60;i++){
            var obj = {x:rand(-10,Game.w+10),
            y:rand(-Game.last_gen-Game.h*2,-Game.last_gen),
            w:rand(100,200),h:rand(3,20),color:"#0AA"};
            Game.objs.push(obj);
        }
        Game.last_gen += Game.h*2;
    }
}

Game.update = function (){
    Game.offset += Game.offset_speed/Game.framerate;
    for (var i = 0; i < Game.objs.length; i++) {
        var o = Game.objs[i];
        if(rect_collide(p,o,Game.offset)){
            o.color = "#F00";
            Game.last_loose = Game.offset;
        }
    }
    Game.generate_obstacles();
    Game.max = Math.max(Game.max,Game.offset-Game.last_loose);
}

Game.loop = function (){
    Game.update();
    Game.draw();
}

Game.mousemoved = function(event){
    p.x = event.offsetX-p.w/2;
    p.y = event.offsetY-p.h/2;
}
