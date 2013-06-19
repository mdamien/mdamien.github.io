var EL = new Object();

EL.goGraph = function() {
	$("#elliptic .result .graph").html("");
	var equa = $("#elliptic .equa").val();
	var n = parseInt($("#elliptic .n").val());
	if( n == undefined){
    	return;
    }

    var data = [];
    if(equa == "y*y = x*x*x + x + 2"){
    	data = EL.graphFast(n);
    }else{
    	data = EL.graphByEval(equa,n);
    }
    $('#elliptic .result .graph').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'xy'
        },
        title: {
            text: "Solutions de l'équation "+equa+" sur Z/"+n+"Z"
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'X'
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            min : 0,
            max: n
        },
        yAxis: {
            title: {
                text: 'Y'
            },
            min : 0,
            max: n
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 3,
                    states: {
                        hover: {
                            enabled: true,
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{point.x},{point.y}'
                }
            }
        },
        series: [{
        	name : "Solutions",
            data: data
        }]
    });    
    return data;
}

EL.graphByEval = function(equa,n){
	equa = "("+equa.replace("=",")%n = (")+")%n";
	equa = equa.replace("=","==");
	return eval("\
	var arr = []; \
	for(var x=0;x < n;x++){ \
		for (var y = 0; y < n; y++) { \
			if("+equa+"){ \
				arr.push([x,y]); \
			} \
		}; \
	} \
	;arr;");
}

EL.graphFast = function(n){
	var arr = [];
	for(var x=0;x < n;x++){
		for (var y = 0; y < n; y++) {
			if( (y*y)%n == (x*x*x + x + 2)%n){
				arr.push([x,y]);
			}
		};
	}
	return arr;
}