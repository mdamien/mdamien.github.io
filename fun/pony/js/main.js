"use strict";

var context, gainNode, buffers = {};

window.addEventListener("load",init);
function init(){
	context = new AudioContext();
	gainNode = context.createGain();
	gainNode.gain.value = document.getElementById('volume').value;
	gainNode.connect(context.destination);

	//for each note, put them into the buffer
	var notes = Object.keys(piano);
	document.getElementById('notes-available').innerHTML = notes.join(", ");
	var loading_counter = 0;
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		var byteArray = Base64Binary.decodeArrayBuffer(piano[note]);
		var store_buffer = function(buffer) {
			buffers[this.note] = buffer;
			loading_counter += 1;
			document.getElementById('loading').innerHTML = "Loading "+loading_counter+"/"+(notes.length-1);
			if(loading_counter == notes.length){
				document.getElementById('loading').innerHTML = "";
			}
		}
		var store_buffer_partial = store_buffer.bind({note:note})
		context.decodeAudioData(byteArray, store_buffer_partial, function(err) { console.log("err(decodeAudioData): "+err); });
	}

	//load url shared song
	if(window.location.hash.length > 2){
		document.getElementById('song').value = decodeURIComponent(window.location.hash.slice(1,window.location.hash.length));
	}
}

function play(note,time){
	var source = context.createBufferSource();
	source.buffer = buffers[note];
	source.connect(gainNode);
	source.start(context.currentTime + time);
}


//C D1 E1/2 C2/2 D2/2 E2/10.4 C2*30.10 _*300 => ["C", "D1", "E1/2", "C2/2", "D2/2", "E2/10.4", "C2*30.10", "_*300"]
function listen(){
	var song = document.getElementById('song').value;
	var re = /[A-G_]b*[\d]*((\/[\d]+)\.*([\d]+)*|\*[\d]+\.*([\d]+)*)*/g; //<- crazy black magic, xkcd.com/1171
	var notes = song.match(re);
	var time = 0.0;
	for (var i = 0; i < notes.length; i++) {
		var note = notes[i];
		var length = 1.0;
		if(note.indexOf("/") != -1){
			length = 1/(parseFloat(note.slice(note.indexOf("/")+1,note.length)));
			note = note.slice(0,note.indexOf("/"));
		}
		if(note.indexOf("*") != -1){
			length = (parseFloat(note.slice(note.indexOf("*")+1,note.length)));
			note = note.slice(0,note.indexOf("*"));
		}
		if(note.length == 1){
			note += "3";
		}
		if(note.indexOf("_") == -1){
			play(note,time);
		}
		time += length;
	};
}

document.getElementById('volume').addEventListener('change', function () {
        gainNode.gain.value = this.value;
});

function changeUrl(){
	window.location.hash = document.getElementById('song').value;
}