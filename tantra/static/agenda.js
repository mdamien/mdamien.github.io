agenda = {}

agenda.add_full_mins = function(time){
    time.start = time.h_start*60+time.m_start;
    time.end = time.h_end*60+time.m_end;
    time.fingerprint = time.uv+'-'+time.type;
}

agenda.time_overlap = function(a, b){
    if(a.day_index !== b.day_index){return false;}
    return Math.max(a.start, b.start) < Math.min(a.end, b.end)
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

agenda.remove_all_impossible = function(necs, times) {
    return times.filter(function(time){
        return necs.indexOf(time.fingerprint) === -1;
    })
}

agenda.valid_combination_exists = function(times, all_times, necs){
    if(!necs){
        necs = agenda.compute_necessaries(all_times);
    }
    if(agenda.have_overlaps(times)){
        return false;
    }
    
    //ugly hack: check duplicates fingerprints
    for(var i=0; i<times.length; i++){
      var fingerprints = [];
      for(var i=0; i<times.length; i++){
            var time = times[i];
            if(fingerprints.indexOf(time.fingerprint) !== -1){
               return false; 
            }
            fingerprints.push(time.fingerprint);
      }
    }
    
    if(times.length == necs.length){
        return [true, times];
    }
    else if(times.length < necs.length){
        var current_necs = agenda.compute_necessaries(times);
        all_times = agenda.remove_all_impossible(current_necs, all_times);
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
    times.forEach(function(time){
        agenda.add_full_mins(time);
    })
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
        //agenda.print_times(result[1]);
        return true;
    }else{
        //console.log('no valid comb found')
        return false;
    }
}

agenda.print_times = function(times){
        times.forEach(function(time){
            console.log(time.uv, time.day, time.formatted);
        })
}

agenda._combs = function(arr) {
  if (arr.length == 1) {
    return arr[0];
  } else {
    var result = [];
    var allCasesOfRest = agenda._combs(arr.slice(1));
    for (var i = 0; i < allCasesOfRest.length; i++) {
      for (var j = 0; j < arr[0].length; j++) {
        result.push(arr[0][j] + allCasesOfRest[i]);
      }
    }
    return result;
  }
}

agenda.all_choices_combinations = function(choices){
   var arr = [];
   choices.forEach(function(line){
       var l = [];
       line.forEach(function(uv){
           l.push(uv.name+'-');
       })
       arr.push(l);
   })
   var result = agenda._combs(arr);
   var result2 = [];
   result.forEach(function(r){
       var line = r.split('-');
       result2.push(line.slice(0,line.length-1))
   });
   return result2;
}

agenda.test_choices = function(choices){
    var combs = agenda.all_choices_combinations(choices);
    var valids = [];
    var invalids = [];
    for(var i=0; i < combs.length; i++){
        var comb = combs[i];
        var is_valid = agenda.uvs_valid_comb(comb);
        if(is_valid){
            valids.push(comb);
        }else{
            invalids.push(comb);
        }
    }
    return [valids, invalids];
}

agenda.test = function(){
    var assertEq = function(txt,a,b){
        if(a !== b){
            console.log("TEST",['FAILED'],a,'!==',b,"("+txt+')');
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
                console.log("TEST",['FAILED'],a,'!==',b,"("+txt+')');
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
    assertEq('valid comb exists', true, agenda.valid_combination_exists([], [time2, time3])[0])
    assertEq('valid comb exists uvs 1', false,  agenda.uvs_valid_comb(['BA05', 'BM05', 'AP52', 'CM06']))
    assertEq('valid comb exists uvs 2', false,  agenda.uvs_valid_comb(['BA05', 'BM05', 'AP52']))
    assertEq('valid comb exists uvs 3', true,  agenda.uvs_valid_comb(['BA05', 'BM05']))
    assertEq('valid comb exists uvs (two basics)', true,  agenda.uvs_valid_comb(['AP53']))
}

agenda.profile = function(){
      console.timeline();
      console.profile();
      agenda.uvs_valid_comb(['LA13', 'CM11', 'GE10', 'LA11'])
      console.timelineEnd();
      console.profileEnd();
}

//agenda.test()
//agenda.profile()

