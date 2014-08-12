agenda = {}

agenda.add_full_mins = function(time){
    time.start = time.h_start*60+time.m_start;
    time.end = time.h_end*60+time.m_end;
    time.fingerprint = time.uv+'-'+time.type;
}

agenda.time_overlap = function(a, b){
    if(a.day_index !== b.day_index){return false;}
    return Math.max(a.start, b.start) <= Math.min(a.end, b.end)
}

agenda.time_overlap_with_other = function(time, times){
    var ret = false;
    times.some(function(time2){
        if(time2 != time && agenda.time_overlap(time, time2)){
            ret = true;
        }
        return ret;
    });
    return ret;
}

agenda.have_overlaps = function(times){
    for(var i=0;i < times.length;i++){
        if(agenda.time_overlap_with_other(times[i], times)){
            return true;
        }
    }
    return false;
}

agenda.compute_necessaries = function(times) {
    var necs = [];
    times.forEach(function(time){
        if(necs.indexOf(time.fingerprint) === -1){
            necs.push(time.fingerprint);
        }
    });
    return necs;
}


agenda.valid_combination_exists = function(times, all_times, necs){
    if(!necs){
        necs = agenda.compute_necessaries(all_times);
    }
    if(times.length == necs.length){
        if(!agenda.have_overlaps(times)){
            return [true, times];
        }
    }
    else if(times.length < necs.length){
        var current_necs = agenda.compute_necessaries(times);
        for(var i=0; i<all_times.length; i++){
            var time = all_times[i];
            if(current_necs.indexOf(time.fingerprint) === -1){
                var times_new = times.concat([]);
                times_new.push(time);
                var result = agenda.valid_combination_exists(times_new, all_times, necs);
                if(result){
                   return result;
                } 
            }
        }
    }
    return false;
}

agenda.basics = function(times){
    var l = [];
    times.forEach(function(time){
        if(time.type == time.full_type){
            l.push(time);
        }
    })
    return l;
}

agenda.bootstrap_combination_detection = function(times){
    var basics = agenda.basics(times);
    return agenda.valid_combination_exists(basics, times)
}

agenda.uvs_valid_comb = function(names){
    var times = [];
    __UVS__.forEach(function(uv){
        if(names.indexOf(uv.name) !== -1){
            uv.times.forEach(function(time){
                time.uv = uv.name;
                agenda.add_full_mins(time);
            })
            times = times.concat(uv.times);
        }
    })
    var result = agenda.bootstrap_combination_detection(times);
    if(result){
        agenda.print_times(result[1]);
    }else{
        console.log('no valid comb found')
    }
}
agenda.print_times = function(times){
        times.forEach(function(time){
            console.log(time.uv, time.day, time.formatted);
        })
}

agenda.test = function(){
    var assertEq = function(txt,a,b){
        if(a !== b){
            console.log("TEST FAILED:",a,'!==',b,"("+txt+')');
        }else{
            console.log("TEST PASSED:",a,'===',b,"("+txt+')');
        }
    }
    var assertSetEq = function(txt, a, b){
        var indexes = [];
        for(var i=0; i < a.length; i++){
            var j = b.indexOf(a[i]);
            if(j === -1 || indexes.indexOf(j) !== -1){
                console.log(a[i],'not in', b)
                console.log("TEST FAILED:",a,'!==',b,"("+txt+')');
                return;
            }
            indexes.push(j);
        }
        console.log("TEST PASSED:",a,'===',b,"("+txt+')');
    }

    var time = {uv: 'LB14', type:'C', h_start:12, m_start:25, h_end:14, m_end:15, day_index:1}
    var time2 = {uv: 'BL10', type:'D', h_start:11, m_start:25, h_end:13, m_end:15, day_index:1}
    var time3 = {uv: 'LO01', type:'T', h_start:15, m_start:25, h_end:16, m_end:15, day_index:1}
    var times = [time, time2, time3];
    times.forEach(function(time){agenda.add_full_mins(time)})
    
    assertEq('time_overlap 1', true, agenda.time_overlap(time, time2))
    assertEq('time_overlap 2', false, agenda.time_overlap(time2, time3))
    assertEq('overlap_with_other', true, agenda.time_overlap_with_other(time, [time, time2, time3]))
    assertEq('overlap_with_other 2', false, agenda.time_overlap_with_other(time3, [time, time2, time3]))
    assertEq('have_overlaps', true, agenda.have_overlaps([time, time2, time3]))
    assertEq('have_overlaps 2', false, agenda.have_overlaps([time,time3]))
    assertSetEq('necessaries', ['LB14-C', 'BL10-D', 'LO01-T'],
                agenda.compute_necessaries([time, time2, time3]))
    //assertEq('valid comb exists', false, agenda.valid_combination_exists([], [time, time2, time3]))
    assertEq('valid comb exists', true, agenda.valid_combination_exists([], [time2, time3])[0])
}

agenda.profile = function(){
      console.timeline();
      console.profile();
      agenda.uvs_valid_comb(['LA13', 'CM11', 'GE10', 'LA11'])
      console.timelineEnd();
      console.profileEnd();
}

agenda.test()

