function triggerHeader(e){
	if(e.pageY - $(window).scrollTop() < 30){
		$('header').removeClass('hide')
		$('.viewport').addClass('hide')
	}else{
		$('.viewport').removeClass('hide')
		$('header').addClass('hide')
	}
}


$(function(){
	$('.everything').mousemove(triggerHeader);
});