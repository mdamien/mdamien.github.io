
function times_to_table(times) {
    var all = ''; 
    var prev_day = '';
    var prev_uv = '';
    times.forEach(function(time){
        var day = time.day;
        if(prev_day == day){
            day = '&nbsp;';
        }
        prev_day = day;
        Object.keys(day_schedule).forEach(function (key) {
            if(key !== 'day'){ 
                day += '<span class="pull-right uv_mini"style="background-color:'
                 + color(key) +'">'+key+'</span>'
                var times = day_schedule[key];
                var r = '<tr><td>'+day+'</td>';
                var m_curr = 8*60;
                for(var i=0; i <= times.length; i++){
                    var last_filler = false;
                    var time = {}
                    if(i == times.length){
                       last_filler = true; 
                       time.h_start = time.h_end = 20;
                       time.m_start = time.m_end = 0;
                    }
                    else{
                        time = times[i];
                    }
                    var m_goal = time.h_start*60+time.m_start;
                    var span = Math.floor((m_goal-m_curr)/15)
                    if(span !=0){
                        r += '<td class="empty" colspan="'+span+'"></td>';
                    }
                    m_curr = m_goal;
                    m_goal = time.h_end*60+time.m_end;
                    span = Math.floor((m_goal-m_curr)/15)
                    if(span !== 0){
                        r += '<td class="filled type_'+time.type+'" colspan="'+span+'"'
                            + ' title="'+time.formatted+'"'
                            +'>';
                        r += '</td>';
                    }
                    m_curr = m_goal;
                }
                r += '</tr>';
                all += r;
            }
        });
    });
    return all;
}

function check_schedule(schedule){
    return true;
}

