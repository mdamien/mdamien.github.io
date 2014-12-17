

 
 
var scAssmntMgr = {


	setMode : function(pElt, pMode){
		if(!pElt) return;
		switch(pMode) {
		case "collapsed" :
			pElt.style.display = "none";
			if("scSiLib" in window) scSiLib.fireResizedNode(pElt);
			break;
		case "invisible" :
			pElt.style.display = "";
			pElt.style.visibility = "hidden";
			if("scSiLib" in window) scSiLib.fireResizedNode(pElt);
			break;
		case "enabled" : 
			if(pElt.className.indexOf("buttonDisabled")>=0) pElt.className = pElt.className.replace("buttonDisabled", "");
			pElt.setAttribute("href", "#");
		case "disabled" : 
			if(pMode=="disabled") {
				if(pElt.className.indexOf("buttonDisabled")>0) pElt.className = pElt.className+" buttonDisabled";
				pElt.removeAttribute("href");
			}
		default :
			pElt.style.display = "";
			pElt.style.visibility = "";
			if("scSiLib" in window) scSiLib.fireResizedNode(pElt);
		}
	},

	isDisabled : function(pButton){
		return pButton==null || pButton.className.indexOf("buttonDisabled")>=0;
	},

	setToggleStatus : function(pButton, pOn){
		if(pButton==null) return;
		if(pOn){ 
			var vIdx = pButton.className.lastIndexOf("toggleButtonOff");
			pButton.className = (vIdx>0 ? pButton.className.substring(0, vIdx) :  pButton.className) + " toggleButtonOn";
		} else {
			var vIdx = pButton.className.lastIndexOf("toggleButtonOn");
			pButton.className = (vIdx>0 ? pButton.className.substring(0, vIdx) :  pButton.className) + " toggleButtonOff";
		}
	},

	isToggleOn : function(pButton){
		return pButton!=null && pButton.className.indexOf("toggleButtonOn")>=0;
	},
	


	/* Stylage par défaut des areas de imagemaps (gmcq) */
	mapHighlightDefault : {
		fillColor: '000000',
		fillOpacity: 0.1,
		strokeColor: 'CCCCCC',
		strokeOpacity: 0.5
	},
	mapHighlightRight : {
		fillColor: '00FF00',
		fillOpacity: 0.1,
		strokeColor: '00FF00',
		strokeOpacity: 1,
		alwaysOn: true
	},
	mapHighlightWrong : {
		fillColor: 'FF0000',
		fillOpacity: 0.1,
		strokeColor: 'FF0000',
		strokeOpacity: 1,
		alwaysOn: true
	},
	gmcqInitUi : function(pId){

		try{
			var vMgr = window[pId];
			vMgr.fImg = scPaLib.findNodes("ide:"+pId+"_form/des:img")[1];
			vMgr.fAreas = scPaLib.findNodes("ide:"+pId+"_form/des:area");
			vMgr.fInputs = scPaLib.findNodes("ide:"+pId+"_form/des:input");
			vMgr.fRows = scPaLib.findNodes("ide:"+pId+"_form/des:tr");
			vMgr.fClass = scPaLib.findNode("ide:"+pId+"_form/des:table").className.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			var xInitMarker = function(pElt,pDefaultImage){
			
			}
			if (vMgr.fFreeMarker){
				vMgr.fMarkerFrame = scPaLib.findNode("ide:"+pId+"_form/chi:div");
				if (vMgr.fSingleResp){
					vMgr.fMarker = scDynUiMgr.addElement("div", vMgr.fMarkerFrame, vMgr.fClass+"_zn", vMgr.fImg, {position:"absolute", width:"1px",height:"1px"});
					this.setMode(vMgr.fMarker, "invisible");
					var vSelectBox = scDynUiMgr.addElement("span", vMgr.fMarker, vMgr.fClass+"_mk");
					this.xGmcqInitMarker(vSelectBox, vMgr);
				}
			} else {
				vMgr.fSelectBoxes = scPaLib.findNodes("ide:"+pId+"_form/des:span");
				for(var i=0; i<vMgr.fSelectBoxes.length; i++){
					var vSelectBox = vMgr.fSelectBoxes[i];
					this.setMode(vSelectBox, "invisible");
					this.xGmcqInitMarker(vSelectBox, vMgr);
				}
			}
			vMgr.fChoiceAsTooltip = (typeof vMgr.fTooltipOptions != "undefined");
			if (vMgr.fChoiceAsTooltip){
				this.setMode(scPaLib.findNode("ide:"+pId+"_form/des:table"), "collapsed");
				for(var i=0; i<vMgr.fAreas.length; i++) vMgr.fAreas[i].fOpt = scTooltipMgr.xInitOpts(vMgr.fTooltipOptions);
				vMgr.fLabels = scPaLib.findNodes("ide:"+pId+"_form/des:td");
			}
		} catch(e) {scCoLib.util.log("ERROR - scAssmntMgr.initGmcqUi :"+e);}
	},
	
	gmcqHighlight : function(pMgr){
		try{
			scMapMgr.maphighlight(pMgr.fImg, scMapMgr.extend(this.mapHighlightDefault, {alwaysOn:(pMgr.fHighlight == "always"),neverOn:(pMgr.fHighlight == "never")}));
		} catch(e) {scCoLib.util.log("ERROR - scAssmntMgr.gmcqHighlight :"+e);}
	},
	
	gmcqUpdateUi : function(pId){

		try{
			var vMgr = window[pId];
			if (vMgr.fFreeMarker){
				if (vMgr.fSingleResp){
					this.setMode(vMgr.fMarker,"invisible");
					for(var i=0; i<vMgr.fInputs.length; i++){
						var vInput = vMgr.fInputs[i];
						if (vInput.checked){
							vMgr.fMarker.style.left = vInput.fMarker.x+"px";
							vMgr.fMarker.style.top = vInput.fMarker.y+"px";
							this.setMode(vMgr.fMarker,"visible");
						}
					}
				}
			} else {
				for(var i=0; i<vMgr.fSelectBoxes.length; i++) this.setMode(vMgr.fSelectBoxes[i], sc$(pId+"_"+i).checked ? "visible" : "invisible");
			}
			if (vMgr.fChoiceAsTooltip){
				for(var i=0; i<vMgr.fAreas.length; i++){
					var vArea = vMgr.fAreas[i];
					if (vArea.ttId) {
						var vTt = sc$(vArea.ttId);
						if (vTt) vTt.parentNode.removeChild(vTt);
					}
					var xHasContent = function(pElt){
						if (scDynUiMgr.readStyle(pElt, "display") == "none") return false;
						if (pElt.nodeType == 3 || pElt.nodeName.toLowerCase()=="img" || pElt.nodeName.toLowerCase()=="object") return true;
						for (var i=0; i < pElt.childNodes.length; i++){
							if (xHasContent(pElt.childNodes[i])) return true;
						}
						return false;
					}
					if (xHasContent(vMgr.fLabels[i])){
						var vLbl = vMgr.fLabels[i].innerHTML.replace(/id="[^"]*"/g, "");
						scTooltipMgr.xMakeTt(vArea, vLbl, "" , vMgr.fClass, "");
						vArea.onmouseover = function (pEvt) {scTooltipMgr.showTooltip(this,pEvt); return false;};
					}
				}
			}
		} catch(e) {scCoLib.util.log("ERROR - scAssmntMgr.gmcqUpdateUi :"+e);}
	},
	
	gmcqSetSolution : function(pId, pShow){

		try{
			var vMgr = window[pId];
			for(var i=0; i<vMgr.fAreas.length; i++){
				var vArea = vMgr.fAreas[i];
				var vRowClass = vMgr.fRows[i].className;
				if (pShow){
					vArea.maphighlight = (vRowClass.indexOf("assmntSolCheck")>=0 || vRowClass.indexOf("assmntSolRight")>=0 ? this.mapHighlightRight : this.mapHighlightWrong);
				} else vArea.maphighlight = null;
			}
			this.gmcqHighlight(vMgr);
		} catch(e) {scCoLib.util.log("ERROR - scAssmntMgr.gmcqSetSolution :"+e);}
	},
	
	xGmcqInitMarker : function(pElt, pMgr){
		var vBkImg = scDynUiMgr.readStyle(pElt, "backgroundImage");
		if (!vBkImg || vBkImg == "none"){
			pElt.style.position = "absolute";
			pElt.style.width = "40px";
			pElt.style.height = "40px";
			pElt.style.top = "50%";
			pElt.style.left = "50%";
			pElt.style.marginTop = "-20px";
			pElt.style.marginLeft = "-20px";
			pElt.style.backgroundImage = "url('"+scServices.scLoad.getRootUrl()+"/lib-sma/assmntDhtmlTransf/"+(pMgr.fFreeMarker?"mark":"select")+".gif')";
		}
	}
	
}