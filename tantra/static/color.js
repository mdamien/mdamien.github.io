//random color specific for x
function color(x){
    seed = 0;
    for(var i=0; i < x.length; i++){
        seed += x.charCodeAt(i);
    }
    var o = Math.floor(Math.cos(seed*1000+1000)*100+100);
    return "hsla("+o+", 100%, 45%, 0.5)";
}

function merge_choices(choices){
    //remove duplicates
    var uvs = [];
    choices.forEach(function(line){
        line.forEach(function(uv){
            if(uvs.indexOf(uv) === -1){
                uvs.push(uv);
            }
        });
    })

    //addup schedules
    var times = [];
    uvs.forEach(function(uv){
        uv.times.forEach(function(time){
            time.uv = uv.name;
        })
        times = times.concat(uv.times);
        
    });

    times = times.sort(function(x,y){
        return x.day_index - y.day_index;
    });
    return times;
}
