function smoofitude(x){
    return Math.max.apply(Math,primeFactorList(x));
}
function supersmoofitude(x){
    var arr = toFactorPowerList(primeFactorList(x))
    var max = 0;
    for(var i = 0;i < arr.length;i++){
        max = Math.max(max,Math.pow(arr[i][0],arr[i][1]));
    }
    return max;
}

function simple_smooth_calcul() {
    var x = parseInt($("#smooth .x").val());
    var s = x + "=" + primeFactorList(x).join("*")+"<br/>";
    $("#smooth .result").html(s+x+" est "+smoofitude(x)+"-smooth et "+supersmoofitude(x)+"-supersmooth");
}
function smoothtable(maxx){
	var res = {}
    for(var i = 2;i <= maxx;i++){
        var r = smoofitude(i);
        if( res[r] == undefined){
			res[r] = [i];
		}else{
			res[r].push(i);
		}
    }
    return res;
}
function supersmoothtable(maxx){
	var res = {}
    for(var i = 2;i <= maxx;i++){
        var r = supersmoofitude(i);
        if( res[r] == undefined){
			res[r] = [i];
		}else{
			res[r].push(i);
		}
    }
    return res;
}

function generate_smooth_table() {
    var maxx = parseInt($("#smooth-table .x").val());
    var maxB = parseInt($("#smooth-table .B").val());
    var sm = smoothtable(maxx);
    var ssm = supersmoothtable(maxx);
    $("#smooth-table tbody").html("");
    if(maxB == undefined){
    	return;
    }
    for(var i = 2;i <= maxB;i++){
		var r = i == 2 ? "": "Id";
		if (sm[i] != undefined){
			r += i == 2 ? "": " + ";
			r += sm[i];
		}
		var r2 = i == 2 ? "": "Id";
		if (ssm[i] != undefined){
			r2 += i == 2 ? "": " + ";
			r2 += ssm[i];
		}
        $("#smooth-table tbody").append($("<tr><th>"+i+"</th><th>"+r+"</th><th>"+r2+"</th></tr>"));
    }
}

function primeFactorList(n) {
	if (n < 1)
		throw "Argument error";
	
	var result = [];
	while (n != 1) {
		var factor = smallestFactor(n);
		result.push(factor);
		n /= factor;
	}
	return result;
}

function smallestFactor(n) {
	if (n < 2)
		throw "Argument error";
	
	if (n % 2 == 0)
		return 2;
	var end = Math.floor(Math.sqrt(n));
	for (var i = 3; i <= end; i += 2) {
		if (n % i == 0)
			return i;
	}
	return n;
}

function toFactorPowerList(factors) {
	var result = [];
	var factor = factors[0];
	var count = 1;
	for (var i = 1; i < factors.length; i++) {
		if (factors[i] == factor) {
			count++;
		} else {
			result.push([factor, count]);
			factor = factors[i];
			count = 1;
		}
	}
	result.push([factor, count]);
	return result;
}

function goRabin(){
	var p = parseInt($("#rabin .p").val());
	var a = parseInt($("#rabin .a").val());
	if(a == undefined || p == undefined){
    	return;
    }
    $("#rabin .result").html(rabinMiller(p,a))
}

function rapidExpo(a,p,n){ //a^p mod n
	var prod = 1;
	while(p > 0){
		prod = (prod*a) % n;
		p -= 1;
	}
	return prod;
}

function rabinMiller(p,a){
	var b = 0;
	var a2 = a;
	while(a2 % 2 != 0){
		a2 /= 2;
		b += 1;
	}
	var m = (p-1)/Math.pow(2,b);
	z = rapidExpo(a,m,p);
	if(z == 1 || z == p-1){
		return "Probablement premier";
	}
	for(var j = 1;j < b;j++){
		z = (z*z) % p;
		if(z = p-1){
			return "Probablement premier";
		}
		if(z = 1){
			return "Non premier";
		}
	}
	return "Non premier";
}

function goPollard(){
	$("#pollard .result").html("");
	var N = parseInt($("#pollard .N").val());
	var a = parseInt($("#pollard .a").val());
	if( a == undefined || N == undefined){
    	return;
    }
    $("#pollard .result").html(pollard(N,a));
}

function pollard(N,a){
	for(var B = 2;B < N-1;B++){
		D = gcd(a,N);
		if(D != 1){
			return "D = "+D+" , B = "+B;
		}
		for(var p=2;p < B;p++){
			if(isPrime(p)){
				ep = Math.floor(Math.log(B)/Math.log(p));
				a = rapidExpo(a,Math.pow(p,ep),N);
			}
		}
		if(a-1 == 0) return "Changer a";
		D = gcd(a-1,N);
		if(D != 1){
			return "D = "+D+" , B = "+B;
		}
	}
	return "Echec de la factorisation";
}

function gcd(x, y) {
	while (y != 0) {
		var z = x % y;
		x = y;
		y = z;
	}
	return x;
}

function isPrime(n) {
	if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
	if (n%2==0) return (n==2);
	if (n%3==0) return (n==3);
	var m=Math.sqrt(n);
	for (var i=5;i<=m;i+=6) {
		if (n%i==0)     return false;
		if (n%(i+2)==0) return false;
	}
	return true;
} 

function goCarmichael(){
	$("#carmichael .result").html("");
	var N = parseInt($("#carmichael .N").val());
	if( N == undefined){
    	return;
    }
    $("#carmichael .result").html(carmichael(N).join(", "));
}

function goCarmichaelTest(){
	$("#carmichael-test .result").html("");
	var N = parseInt($("#carmichael-test .N").val());
	if( N == undefined){
    	return;
    }
    $("#carmichael-test .result").html(carmichaelTest(N));
}

function isPrimeFactorListUnique(n) {
	var result = [];
	while (n != 1) {
		var factor = smallestFactor(n);
		if(result.indexOf(factor) != -1){
			return false;
		}
		result.push(factor);
		n /= factor;
	}
	return result;
}

function carmichaelTest(n) {
	if(n%2 == 0){
		return "Nombre pair donc pas de carmichael";
	}
	if(!isPrime(n)){
		factors = isPrimeFactorListUnique(n);
		if(factors != false){
			for(var i=0;i < factors.length;i++){
				if( ((n-1) % (factors[i]-1)) != 0){
					return "Ce n'est pas un nombre de carmichael :"+(n-1)+" % "+(factors[i]-1) +" == " + (n-1 % factors[i]-1 ) + "( != 0)";
				}
			}
			return "C'est un nombre de carmichael";
		}
		return "Le nombre à plusieurs même facteurs premier donc ce n'est pas un nombre de carmichael: facteurs:"+primeFactorList(n);
	}else{
		return "Nombre premier donc pas de carmichael";
	}
}

function carmichaelTestClear(n) {
	if(n%2 == 0){
		return false;
	}
	if(!isPrime(n)){
		factors = isPrimeFactorListUnique(n);
		if(factors != false){
			for(var i=0;i < factors.length;i++){
				if( ((n-1) % (factors[i]-1)) != 0){
					return false;
				}
			}
			return true;
		}
		return false;
	}else{
		return false;
	}
}

function carmichael(maxx) {
	var arr = [];
	for(var n=1;n <= maxx;n += 2){
		if(carmichaelTestClear(n)){
			arr.push(n);
		}
	}
	return arr;
}