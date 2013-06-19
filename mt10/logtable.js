var LT = new Object(); //namespace for all methods related to the log table

LT.go = function() {
	$("#logtable .result table").html("");
	var mx = $("#logtable .mx").val();
    var base = $("#logtable .base").val();
	var N = parseInt($("#logtable .N").val());
	if( N == undefined){
    	return;
    }
    
    var maxx = Math.pow(2,N);
    var r = LT.expoTable(LT.s2pol(base),LT.s2pol(mx),maxx);
    $("#logtable .result .exponents").html(LT.expoTableHTML(r,maxx));
    $("#logtable .result .log").html(LT.logTableHTML(r,maxx));
}

LT.s2pol = function(x) {
    x = x.split("").reverse();
    for(var i=0; i<x.length; i++) { x[i] = parseInt(x[i], 10); }
    return x;
}

LT.zeroFill = function(p,j) {
    for (var i = 0; i == j; i++) {
        if(p[i] == undefined){
                p.push(0);
        }
    };
    return p;
}

LT.zeros = function(n) {
   var array = new Array(n);
   for (var i=n+1; i--;) {
     array[i] = 0;
   }
   return array;
}

//LT.addPols( [0,1] , [1, 0]) == [1,1]  //OK
//LT.addPols([0,0],[0]) == [0,0] // ok
LT.addPols = function(p1,p2) {
    var p3 = p1.slice();
    for(var i=0; i<p1.length; i++){
        LT.zeroFill(p1,i);LT.zeroFill(p2,i);
        p3[i] = (p1[i] + p2[i]) % 2;
    }
    return p3;
}

//LT.mulMonomes( 1, 2, 1,2) == [0,0,0,0,1] //OK
//LT.mulMonomes(1,1,1,1) == [0, 0, 1] //ok
LT.mulMonomes = function(x,n,y,m) {
    if(x == 0 || y == 0) return [0];
    var mon = LT.zeros(n*m);
    mon[n+m] = 1;
    return mon;
}

//LT.mulPol( [0,1], 1, 1 ) == [0,0,1] //ok
//LT.mulPol([1,1],1,2) == [0,0,1,1]
LT.mulPol = function(p,x,n) {
    if(x == 0) return [0];
    var p2 = LT.zeros(p.length);
    for(var i=0; i<p.length; i++){
        console.log(LT.mulMonomes(x,n,p[i],i));
        p2 = LT.addPols(p2,LT.mulMonomes(x,n,p[i],i));
    }
    return p2;
}

//LT.trim([0,1,0]) == [0,1]
LT.trim = function(pol){
    return pol.slice(0,pol.lastIndexOf(1)+1);
}

//LT.mulPols( [0,1], [0,1]) == [0,0,1]  //ok
//LT.mulPols( [0,1], [1,1]) == [0,1,1]  //ok
//LT.mulPols([1,1],[1,1,1]) == LT.mulPols([1,1,1],[1,1]) //non-ok
LT.mulPols = function(p1,p2) {
    var p3 = LT.zeros(Math.max(p1.length,p2.length));
    for(var i=0; i< p1.length; i++){
        console.log(LT.mulPol(p2,p1[i],i));
        p3 = LT.addPols(p3,LT.mulPol(p2,p1[i],i));
        console.log("p3:"+p3);
    }
    return p3;
}

LT.degree = function(p){
    return p.lastIndexOf(1);
}

//LT.dividePol(LT.mulPols([1,1],[1,1,1,1,1,1,1,1]),[1,1,1,1,0,0,0,0,1]) == 1A    // non-ok
LT.dividePol = function(p,mx){ // divide the pol by mx and return the rest: this is really awesome too
    while (LT.degree(p) >= LT.degree(mx)){
        var mx_dec = mx.slice().reverse();
        for(var i=0;i < LT.degree(p)-LT.degree(mx);i++){
            mx_dec.push(0); //mul pol by x
        }
        mx_dec = mx_dec.reverse();
        p = LT.addPols(p,mx_dec); //p = p - m(x)*x^(deg(p)-deg(mx))
    }
    return p;
}


//LT.expoTable([1,1],[1,0],10) //ok (sans div)
LT.expoTable = function(base,mx,maxx) {
    var arr = [];
    arr.push([1]);
    for(var i=1;i < maxx;i++) {
        arr.push(LT.mulPols(base,arr[i-1]));
        arr[i] = LT.trim(arr[i]);
        arr[i] = LT.dividePol(arr[i],mx);
        //console.log(arr[i]);
    }
    return arr;
}

//LT.pol2num([1,1,0]) == 5
LT.pol2num = function(pol) {
    return parseInt(pol.reverse().join(""),2);
}

LT.expoTableHTML = function(table,maxx) {
    var arr = table.slice();
    //to hex
    for(var i=0;i < maxx;i++) {
        arr[i] = LT.pol2num(arr[i]).toString(16).toUpperCase();
    }

    //to a nice table
    var r = "<thead><tr><th></th>";
    for(var i=0;i < maxx;i+=10){
        r += "<th>"+i+"</th>";
    }
    r += "</tr></thead><tbody>";
    for(var i=0;i < 10;i++){
        r += "<tr><th>"+i+"</th>";
        for(var j=0;j < maxx;j+=10){
            r += "<th>"+arr[(j+i)%maxx]+"</th>";
        }
        r += "</tr>"
    }
    r += "</tbody>";
    return r;
}

LT.logTableHTML = function(arr_orig,maxx) {
    var arr = arr_orig.slice();
    var logarr = [];

    //to num
    for(var i=0;i < maxx;i++) {
        arr[i] = LT.pol2num(arr[i]);
    }

    //build the log arr
    for(var i=0;i < maxx;i++) {
        logarr.push(arr.indexOf(i));
        if(logarr[i] == -1){
            logarr[i] = "";
        }
    }

    //to hex
    for(var i=0;i < maxx;i++) {
        arr[i] = arr[i].toString(16).toUpperCase();
    }
    //to a nice table
    var r = "<thead><tr><th></th>";
    for(var i=0;i < maxx;i+=16){
        r += "<th>"+i.toString(16).toUpperCase()+"</th>";
    }
    r += "</tr></thead><tbody>";
    for(var i=0;i < 16;i++){
        r += "<tr><th>"+i.toString(16).toUpperCase()+"</th>";
        for(var j=0;j < maxx;j+=16){
            r += "<th>"+logarr[(j+i)%maxx]+"</th>";
        }
        r += "</tr>";
    }
    r += "</tbody>";
    return r;
}
