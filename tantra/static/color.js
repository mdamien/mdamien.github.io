//random color specific for x
function color(x){
    seed = 0;
    for(var i=0; i < x.length; i++){
        seed += x.charCodeAt(i);
    }
    var o = Math.floor(Math.cos(seed*1000+1000)*100+100);
    return "hsla("+o+", 100%, 45%, 0.5)";
}
