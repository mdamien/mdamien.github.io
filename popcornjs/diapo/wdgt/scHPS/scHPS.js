/**
 * LICENCE[[
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1/CeCILL 2.O
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is 
 * samuel.monsarrat@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2009-2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * sylvain.spinelli@kelis.fr
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.0 (http://www.cecill.info/licences.en.html),
 * in which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL, the LGPL or the CeCILL, and not to allow
 * others to use your version of this file under the terms of the MPL, indicate
 * your decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL, the LGPL or the CeCILL. If you do not
 * delete the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL, the LGPL or the CeCILL.
 * ]]LICENCE
 */

/** SCENARI Html Presentation System. 
    scHPS : general package containing utility functions and objects */
var scHPS = {
	/* Default paths. */
	fCoFilter : ".ssContainer",
	fIgnoreFilter : ".ssIgnore",
	fCoBlocksRootPath : "des:.ssBkRoot",
	fCoAltBlocksRootPath : "chi:.ssBkRootAlt",
	fCoAltBlocksMenuPath : "des:.ssAltBlockMenu/des:.ssAltBlockMenuItem",
	fBlkCoPath : "des:.ssBkCo",
	fCutableFilter : ".ssCutable|p|ol|ul|li|table|tr|pre",
	fUncutableFilter : ".ssUncutable|tr",
	fForcedCutFilter : ".ssForcedCut",
	fFixedHeightFilter : ".ssFixedHeight",
	fKeyMap : {nextStep:["key_right","key_down"," ","n","key_pageDown"],
	           previousStep:["\b","key_left","key_up","p","key_pageUp"],
	           nextSlide:"e",
	           previousSlide:"r",
	           home:"key_home",
	           toggleEffects:"f",
	           switchToHtml:"h",
	           closeZoom:"key_escape"},

	/* Constantes de stylage. */
	fCssNameSS : "modeSS",
	fCssNameHTML : "modeHTML",

	fSlideClass : "ssSlide",

	/* Constantes pour les animations. */
	/** Largeur mini du slide */
	fBlkMinWidth : 500,
	/** Ratio de marge max par rapport à la largeur du container */
	fBlkMaxMargin : 0.2,
	/** Ratio d'espace libre à placer au dessus du contenu */
	fBlkTopSpace : 0.3,
	/** Opacité pour les masks des steps. */
	fStepMaskOpacity : 0.9,
	fStepMaskOpacityPrv : 0.9,
	fStepMaskOpacityNxt : 0.9,
	
	/** default slide constants */
	fDefaultFontSize : 22, // fontSize in pixels par défaut pour un veiwport de 800x600
	fBlksPath : "des:.ssBkRoot",
	fSsClassPrefix : "sld",
	fDefaultAnimStep : 5000,

	/** base constants */
	fNavie6 : parseFloat(scCoLib.userAgent.substring(scCoLib.userAgent.indexOf("msie")+5)) < 7,
	fNavie8 : parseFloat(scCoLib.userAgent.substring(scCoLib.userAgent.indexOf("msie")+5)) < 9,
	fScreenTouch : ("ontouchstart" in window && ((/iphone|ipad/gi).test(navigator.appVersion) || (/android/gi).test(navigator.appVersion))),
	fDisabled : true,

	/* --- Public ------------------------------------------------------------- */
	/** scHPS.init : MUST be called before any other scHPS interaction */
	init : function() {
		try{
			// Sanity checks...
			if (!("scSiLib" in window)) throw "scSiLib.js not present in presentation window.";
			if (!("scTiLib" in window)) throw "scTiLib.js not present in presentation window.";
			if (!("scPaLib" in window)) throw "scPaLib.js not present in presentation window.";
			if (window.location.search.indexOf("mode=html")<0 && !this.fNavie6) this.fDisabled = false;
			this.fStore = new scHPS.LocalStore();
			scOnLoads[scOnLoads.length] = this;
		} catch(e){scCoLib.util.logError("ERROR scHPS.init", e);}
	},
	/** scHPS.onLoad : Main onLoad function called by the SCENARI framework. */
	onLoad : function() {
		try{
			//scCoLib.util.log("scHPS.onLoad");
			// ie6 warning...
			if (window.location.search.indexOf("mode=html")<0 && this.fNavie6){
				if(this.fStore.get("ie6Warn") != "true") alert(this.xGetStr(7));
				this.fStore.set("ie6Warn", "true");
			}
			// firebug warning...
			if (!scCoLib.fDebug && window.console && window.console.firebug) alert(this.xGetStr(6));
		}catch(e){scCoLib.util.logError("ERROR PresMgr.onLoad", e);}
	},
	loadSortKey : "AA",
	/** scHPS.swichToSsStyles : Swich to slide-show CSS files.
	 * @param pDoc (optional) : document to swich. */
	swichToSsStyles : function(pDoc) {
		//scCoLib.util.log("scHPS.swichToSsStyles");
		var vDoc = (typeof pDoc == "undefined" ? document : pDoc) ;
		if (!vDoc.fCssSwiched){
			var vCss = null;
			for(var i = 0; (vCss = vDoc.getElementsByTagName("link")[i]); i++) {
				if (vCss.getAttribute("rel").indexOf("style") != -1){
					var vTitle = vCss.getAttribute("title") || "";
					if(vTitle.indexOf(this.fCssNameHTML) != -1) vCss.disabled = true;
					if(vTitle.indexOf(this.fCssNameSS) != -1) {
//						vCss.setAttribute("rel","stylesheet"); // Bug Safari 5.1
//						vCss.removeAttribute("title"); // Bug Safari 5.1
						vCss.disabled = true; // IE bug
						vCss.disabled = false;
					}
				}
			}
		}
		vDoc.fCssSwiched = true;
	},
	/* --- Private ------------------------------------------------------------ */
	/** scHPS.xGetStr : Reteive a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},
	/** scHPS.xSwitchToHtmlMode */
	xSwitchToHtmlMode : function(pForce){
		pForce = (typeof pForce == "undefined" ? false : pForce);
		var vAsw = false;
		if (!pForce) vAsw = confirm( this.xGetStr(10));
		if (vAsw || pForce){
			var vLoc = window.location;
			window.location.href = vLoc.href.split("?")[0] + "?mode=html";
		}
		return false;
	},
	/** scHPS.xProcessKeyMap : Return an interpreted keymap object. */
	xProcessKeyMap: function(pMap) {
		var i, vAction, vKeys, vKey;
		var vMap = {};
		var xKeyCode = function (pStr){
			if (!pStr || pStr.length == 0) return 0;
			switch(pStr){
				case "key_right" : return 39;
				case "key_left" : return 37;
				case "key_up" : return 38;
				case "key_down" : return 40;
				case "key_pageUp" : return 33;
				case "key_pageDown" : return 34;
				case "key_home" : return 36;
				case "key_escape" : return 27;
				default: return pStr.toUpperCase().charCodeAt(0);
			}
		}
		for (vAction in pMap) {
			vKeys = pMap[vAction];
			if (typeof vKeys == "object"){
				for (i = 0; i < vKeys.length; i++){
					vMap[String(xKeyCode(vKeys[i]))] = vAction;
				}
			} else vMap[String(xKeyCode(vKeys))] = vAction;
		}
		return vMap;
	},
	/* --- Static ------------------------------------------------------------- */
	/** scHPS.sFadeEltStart - this = scHPS.FadeEltTask */
	sFadeEltStart : function(){
		var vBkColor = scHPS.xReadStyle(this.fElt, "backgroundColor") || scHPS.xReadStyle(this.fMgr.fSldFra, "backgroundColor") || "white";
		if (scHPS.fNavie8) this.fElt.style.backgroundColor = (vBkColor == "transparent" ? "white" : vBkColor);
	},
	/** scHPS.sFadeEltEnd - this = scHPS.FadeEltTask */
	sFadeEltEnd : function(){
		if (scHPS.fNavie8) this.fElt.style.backgroundColor = "";
	},
	/** scHPS.sOnKeyUp : key event manager. */
	sOnKeyUp : function(pEvt, pMgr){
		var vEvt = pEvt || window.event;
		var vCharCode = vEvt.which || vEvt.keyCode;
		return pMgr.xKeyMgr(vCharCode);
	},
	/** scHPS.sOnKeyDown : key down event manager. */
	sOnKeyDown : function(pEvt, pMgr){
		var vEvt = pEvt || window.event;
		var vCharCode = vEvt.which || vEvt.keyCode;
		switch(vCharCode){
			case 32: case 33: case 34: case 35: case 36: // Space,  PgUp, PgDn, End, Home
			case 37: case 39: case 38:  case 40: // Arrow keys
				vEvt.preventDefault ? vEvt.preventDefault() : vEvt.returnValue = false; break; // disable all window scrolling keys
			default: break; // do not block other keys
		}
	},
	/** scHPS.sMouseMgr : mouse event manager */
	sMouseMgr : function(pMgr){
		if (pMgr.fToolHider) pMgr.xShowTools();
	},
	/** scHPS.sTouchMgr : touch event manager this = PresMgr */
	sTouchMgr : function(pEvt){
		if (this.fToolHider) this.xShowTools();
		switch(pEvt.type) {
			case "touchstart":
				if(pEvt.touches.length == 1){
					this.fSwipeStart = {x:pEvt.touches[0].pageX,y:pEvt.touches[0].pageY};
					this.fSwipeEnd = this.fSwipeStart;
				}
				break;
			case "touchmove":
				pEvt.preventDefault()
				if(pEvt.touches.length == 1){
					this.fSwipeEnd = {x:pEvt.touches[0].pageX,y:pEvt.touches[0].pageY};
				}
				break;
			case "touchend":
				try{ //Swipe left & right to change page (delta Y < 30% & delta X > 100px)
					var vDeltaX = this.fSwipeStart.x - this.fSwipeEnd.x;
					if (Math.abs((this.fSwipeStart.y - this.fSwipeEnd.y)/vDeltaX) < 0.3){ 
						if (vDeltaX > 100) this.next();
						else if(vDeltaX <- 100) this.previous();
					}
					this.fSwipeStart = {x:null,y:null};
					this.fSwipeEnd = this.fSwipeStart;
				} catch(e){}
		}
	},


	/* --- Utilities ---------------------------------------------------------- */
	/** scHPS.xAddElt : Add an HTML element to a parent node.
	 * @param pName : tag name of element.
	 * @param pParent : parent node of the button.
	 * @param pClassName : element class name.
	 * @param pNoDisplay (optional) : element is created with display=none.
	 * @param pHidden (optional) : element is created with visibility=hidden.
	 * @param pNxtSib (optional) : node to insert element before.
	 * @return element node. */
	xAddElt : function(pName, pParent, pClassName, pNoDisplay, pHidden, pNxtSib){
		var vElt;
		if(this.fNavie8 && pName.toLowerCase() == "iframe") {
			//BUG IE : impossible de masquer les bordures si on ajoute l'iframe via l'API DOM.
			var vFrmHolder = pParent.ownerDocument.createElement("div");
			if (pNxtSib) pParent.insertBefore(vFrmHolder,pNxtSib)
			else pParent.appendChild(vFrmHolder);
			vFrmHolder.innerHTML = "<iframe scrolling='no' frameborder='0' allowtransparency='true'></iframe>";
			vElt = vFrmHolder.firstChild;
		} else {
			vElt = pParent.ownerDocument.createElement(pName);
			if (pNxtSib) pParent.insertBefore(vElt,pNxtSib)
			else pParent.appendChild(vElt);
		}
		if (pClassName) vElt.className = pClassName;
		if (pNoDisplay) vElt.style.display = "none";
		if (pHidden) vElt.style.visibility = "hidden";
		return vElt;
	},
	/** scHPS.xAddEltNoDisp : Add a non displayed HTML element to a parent node. */
	xAddEltNoDisp : function(pName, pParent, pClassName) {
		var vElt = this.xAddElt(pName, pParent, pClassName, true, false);
		return vElt;
	},
	/** scHPS.xAddEltHidden : Add a hidden HTML element to a parent node. */
	xAddEltHidden : function(pName, pParent, pClassName) {
		var vElt = this.xAddElt(pName, pParent, pClassName, false, true);
		return vElt;
	},
	/** scHPS.xAddBtn : Add an HTML button to a parent node.
	 * @param pParent : parent node of the button.
	 * @param pMgr : manager object that may be used in pFunc.
	 * @param pFunc : static function to call when button it pressed (should return false).
	 * @param pClassName : button class name.
	 * @param pCapt : button caption.
	 * @param pNxtSib (optional) : node to insert button before.
	 * @return button node. */
	xAddBtn : function(pParent, pMgr, pFunc, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		vBtn.fMgr = pMgr;
		vBtn.onclick = pFunc;
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** scHPS.xAddBindToFunction : And bind() to functions in old browsers. */
	xAddBindToFunction: function(pFunction) {
		// Extend function.bind, see: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
		if (!pFunction.bind) {
			pFunction.bind = function (oThis) {
				if (typeof this !== "function") {
					// closest thing possible to the ECMAScript 5 internal IsCallable function
					throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
				}
				var aArgs = Array.prototype.slice.call(arguments, 1),
						fToBind = this,
						fNOP = function () {},
						fBound = function () {
							return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
						};
				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();
				return fBound;
			};
		}
		return pFunction;
	},
	/** scHPS.xReadStyle : Read a style property (inline or CSS).
	 * @param pElt : element node.
	 * @param pProp : CSS property to read (must be written in CamelCase ex: marginTop).
	 * @return CSS property value or null. */
	xReadStyle : function(pElt, pProp) {
		try {
			var vVal = null;
			if (pElt.style[pProp]) {
				vVal = pElt.style[pProp];
			} else if (pElt.currentStyle) {
				vVal = pElt.currentStyle[pProp];
			} else {
				var vDefaultView = pElt.ownerDocument.defaultView;
				if (vDefaultView && vDefaultView.getComputedStyle) {
					var vStyle = vDefaultView.getComputedStyle(pElt, null);
					var vProp = pProp.replace(/([A-Z])/g,"-$1").toLowerCase();
					if (vStyle[vProp]) return vStyle[vProp];
					else vVal = vStyle.getPropertyValue(vProp);
				}
			}
			return vVal.replace(/\"/g,""); //Opera returns certain values quoted (literal colors).
		} catch (e) {
			return null;
		}
	},
	/** scHPS.xGetEltTop : Retrun an element's absolute top (from pRoot or the top of the page).
	 * @param pElt start element.
	 * @param pRoot optional finish element, if present and is an ancestor of pElt, retun the top of pElt in relation to pRoot. */
	xGetEltTop: function(pElt, pRoot) {
		var vY;
		var vRoot = pRoot || null;
		vY = scCoLib.toInt(pElt.offsetTop);
		if (pElt.offsetParent.tagName.toLowerCase() != 'body' && pElt.offsetParent.tagName.toLowerCase() != 'html' && pElt.offsetParent != vRoot) {
			vY -= pElt.offsetParent.scrollTop;
			vY += this.xGetEltTop(pElt.offsetParent, vRoot);
		}
		return vY;
	},
	/** scHPS.xGetEltH : Retrun an element's height. */
	xGetEltH: function(pElt) {
		return(scCoLib.toInt(pElt.style.pixelHeight || pElt.offsetHeight));
	},
	/* scHPS.xSerialiseObjJs - Serialize a javascript object
	 * pObj : object
	 * return : string */
	xSerialiseObjJs : function(pObj){
		var vBuf="";
		iEscapeJs = function(pChar){
			switch(pChar) {
				case '\t' : return "\\t";
				case '\n' : return "\\n";
				case '\r' : return "\\r";
				case '\'' : return "\\\'";
				case '\"' : return "\\\"";
				case '\\' : return "\\\\";
			} 
			return "";
		};
		if(pObj) for (var vKey in pObj){
			var vLbl = (pObj instanceof Array) ? "" : "\'" + vKey + "\':";
			var vObj = pObj[vKey];
			if(vObj != null) {
				vBuf+= (vBuf!="" ? "," : "") + vLbl;
				if(vObj instanceof Array || typeof vObj == "object" || vObj instanceof Object) vBuf+= this.xSerialiseObjJs(vObj);
				else if(typeof vObj == "number") vBuf+= vObj;
				else vBuf+= "\'" + vObj.toString().replace(/[\t\n\r\\'"]/g, iEscapeJs) + "\'";
			}
		}
		if(pObj instanceof Array) return "[" + vBuf + "]";
		else if(typeof pObj == "object" || vObj instanceof Object) return "{" + vBuf + "}";
		else return vBuf;
	},
	/* scHPS.xDeserialiseObjJs - Deserialize a javascript object
	 * pStr : string
	 *  return : object */
	xDeserialiseObjJs : function(pStr){
		if(!pStr) return null;
		var vVal;
		try{
			eval("vVal="+pStr);
			return vVal;
		}catch(e){
			return null;
		}
	},
	/** scHPS.xSetOpacity : Set the opacity of a given node.
	 * @param pRate Variable de 0 à 1. */
	xSetOpacity: function(pNode, pRate){
		if(!this.fNavie8) pNode.style.opacity = pRate;
		else pNode.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity="+pRate*100+")";
	},
	/** scHPS.xStartOpacityEffect : Start the opacity of a given node.
	 * On ajoute le filtre d'opacité sur IE.
	 * On place le node en visibility: "".
	 * @param pRate 2 valeurs possibles: 0 (invisible) ou 1 (visible). */
	xStartOpacityEffect: function(pNode, pRate){
		if(!this.fNavie8) pNode.style.opacity = pRate;
		else pNode.style.filter = pRate==1 ? "progid:DXImageTransform.Microsoft.Alpha(opacity=100)" : "progid:DXImageTransform.Microsoft.Alpha(opacity=0)";
		pNode.style.visibility = "";
	},
	/** scHPS.xEndOpacityEffect : End the opacity of a given node.
	 * On supprime le filtre d'opacité sur IE (évite des bugs de refresh).
	 * On place le node en visibility: hidden.
	 * @param pRate 2 valeurs possibles: 0 (invisible) ou 1 (visible). */
	xEndOpacityEffect: function(pNode, pRate){
		if(!this.fNavie8) pNode.style.opacity = pRate;
		else pNode.style.removeAttribute("filter");
		if(pRate == 0) pNode.style.visibility = "hidden";
		else pNode.style.visibility = "";
	}
}
/* === Browser dependant generic utilities ================================== */
if(scHPS.fNavie8) {
	/** scHPS.importElt : import a element into a parent. */
	scHPS.importElt = function(pEltSrc, pDocDst, pParentDst, pChildDst) {
		try {
			var vWrapper;
			var vDeep = false;
			switch(pEltSrc.nodeName) {
				case "TBODY" :
				case "TR" :
					var vRes = pDocDst.createElement(pEltSrc.nodeName);
					//TODO gestion attributs : pEltSrc.cloneNode(false).outerHTML + regEpx pour extraire les attr  ou parseXml ou gestion en dur
					if(pParentDst) pParentDst.appendChild(vRes);
					if(pChildDst) vRes.appendChild(pChildDst);
					return vRes;
				case "TD" :
					vWrapper = pDocDst.createElement("TR");
					break;
				case "OPTION" :
					vWrapper = pDocDst.createElement("SELECT");
					break;
				case "OBJECT" :
					//Cas particulier : on clone Objet et param d'un coup.
					vWrapper = pDocDst.createElement("DIV");
					vDeep = true;
					break;
				case "PARAM" :
					//Cas particulir déjà traité/
					return null;
				default :
					vWrapper = pDocDst.createElement("DIV");
			}
			vWrapper.innerHTML = vDeep ? pEltSrc.outerHTML : pEltSrc.cloneNode(false).outerHTML;
			var vRes = vWrapper.firstChild;
			while(vRes && vRes.nodeType!=1) vRes = vRes.nextSibling;
			if(vRes) {
				if(pParentDst) pParentDst.appendChild(vRes);
				if(pChildDst) vRes.appendChild(pChildDst);
			}
			return vRes;
		} catch(e){}
	}
	/** scHPS.importElt : import a node into a parent. */
	scHPS.importNode = function(pEltSrc, pDocDst, pParentDst) {
		switch(pEltSrc.nodeType){
			case 1 : 
				return this.importElt(pEltSrc, pDocDst, pParentDst);
			case 3 : 
				var vElt = pDocDst.createTextNode(pEltSrc.nodeValue);
				if(pParentDst) pParentDst.appendChild(vElt);
				return vElt;
		}
	}
	/** scHPS.importElt : deep-import a node into a parent. */
	scHPS.importDeepNode = function(pEltSrc, pDocDst, pParentDst) {
		switch(pEltSrc.nodeType){
			case 1 : 
				var vElt = this.importElt(pEltSrc, pDocDst, pParentDst);
				for(var vCh = pEltSrc.firstChild; vCh; vCh = vCh.nextSibling) this.importDeepNode(vCh, pDocDst, vElt);
				return vElt;
			case 3 : 
				var vElt = pDocDst.createTextNode(pEltSrc.nodeValue);
				if(pParentDst) pParentDst.appendChild(vElt);
				return vElt;
		}
	}
} else {
	/** scHPS.importElt : import a element into a parent. */
	scHPS.importElt = function(pEltSrc, pDocDst, pParentDst, pChildDst) {
		var vRes = pDocDst.importNode(pEltSrc, false);
		if(pParentDst) pParentDst.appendChild(vRes);
		if(pChildDst) vRes.appendChild(pChildDst);
		return vRes;
	}
	/** scHPS.importElt : import a node into a parent. */
	scHPS.importNode = scHPS.importElt;
	/** scHPS.importElt : deep-import a node into a parent. */
	scHPS.importDeepNode = function(pEltSrc, pDocDst, pParentDst) {
		var vElt = pDocDst.importNode(pEltSrc, true);
		if(pParentDst) pParentDst.appendChild(vElt);
		return vElt;
	}
}
/* === Generic Utility Classes ============================================== */
/** scHPS.FadeEltTask : TiLib task that fades a given element in or out.
 * @param pElt element to fade.
 * @param pDir fade direction : 0=out, 1=in.
 * @param pMgr .
 * @param pStartFunc optionnal function that will be executed at the start of the task.
 * @param pEndFunc optionnal function that will be executed at the end of the task.
 * @param pInstant optionnal parameter if true no animation. */
scHPS.FadeEltTask = function(pElt,pDir,pMgr,pStartFunc,pEndFunc,pInstant){
	//scCoLib.util.log("New scHPS.FadeEltTask");
	this.fRate = new Array();
	this.fRate[0] = [.9, .85, .8, .7, .6, .5, .4, .3, .2, .15, .1];
	this.fRate[1] = [.1, .15, .2, .3, .4, .5, .6, .7, .8, .85, .9];
	try{
		this.fElt = pElt;
		this.fDir = (pDir >= 1 ? 1 : 0);
		this.fMgr = pMgr || {fEnableEffects:"true"};
		this.fStartFunc = pStartFunc || function(){};
		this.fEndFunc = pEndFunc || function(){};
		if (pInstant || !this.fMgr.fEnableEffects) {
			this.terminate();
			return;
		}
		if (this.fElt.fFadeTask) {
			this.fElt.fFadeTask.changeDir(this.fDir);
		} else {
			this.fStartFunc();
			scHPS.xStartOpacityEffect(this.fElt, 1-this.fDir);
			this.fEndTime = ( Date.now  ? Date.now() : new Date().getTime() ) + 100;
			this.fIdx = -1;
			this.fElt.fFadeTask = this;
			scTiLib.addTaskNow(this);
		}
	}catch(e){scCoLib.util.log("ERROR scHPS.FadeEltTask : "+e);}
}
scHPS.FadeEltTask.prototype = {
	/** FadeEltTask.execTask */
	execTask : function(pInstant){
		if (!pInstant){
			while(this.fEndTime < (Date.now ? Date.now() : new Date().getTime()) && this.fIdx < this.fRate[this.fDir].length) {
				this.fIdx++;
				this.fEndTime += 100;
			}
			this.fIdx++;
			this.fEndTime += 100;
		}
		if(this.fIdx >= this.fRate[this.fDir].length) {
			scHPS.xEndOpacityEffect(this.fElt, this.fDir);
			this.fEndFunc();
			this.fElt.fFadeTask = null;
			return false;
		}
		scHPS.xSetOpacity(this.fElt, this.fRate[this.fDir][this.fIdx]);
		return true;
	},
	/** FadeEltTask.execchangeDirTask */
	changeDir : function(pDir){
		var vDir = (pDir >= 1 ? 1 : 0)
		if (vDir != this.fDir) this.fIdx = this.fRate[this.fDir].length - this.fIdx - 1;
		this.fDir = vDir;
	},
	/** FadeEltTask.terminate */
	terminate : function(){
		//scCoLib.util.log("scHPS.FadeEltTask.terminate");
		this.fIdx = this.fRate[this.fDir].length;
		this.execTask(true);
	}
}
/** scHPS.LocalStore : Inits and returns a new local storage object based on localStorage / cookies in that order.
 * @pId (optional) : id of new local store. */
scHPS.LocalStore = function (pId){
	if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
	this.fId = pId || "";
	this.fRootKey = document.location.pathname.substring(0,document.location.pathname.lastIndexOf("/")) +"/";
	if ("localStorage" in window && typeof window.localStorage != "undefined") {
		this.get = function(pKey) {var vRet = localStorage.getItem(this.fRootKey+this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
		this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
	} else {
		this.get = function(pKey){var vReg=new RegExp(this.xKey(pKey)+"=([^;]*)");var vArr=vReg.exec(document.cookie);if(vArr && vArr.length==2) return(unescape(vArr[1]));else return null};
		this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
	}
	this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
	this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
}

/* =============================================================================
 * Managers
 * ========================================================================== */
 
/** == scHPS.PresMgr : Presentation manager class ==============================
 * @param pSldFraPath : path to the slide frame.
 * @param pNavPath : path to the navigation bar.
 * @param pTocLnksPath : path to all toc entries.
 * @param pIsMaster (optional) : true = PresMgr is master on current page. */
scHPS.PresMgr = function(pSldFraPath, pNavPath, pTocLnksPath, pIsMaster){
	//scCoLib.util.log("New PresMgr");
	if (scHPS.fDisabled) return;
	this.fOwnerWindow = window;
	this.fSldFraPath = pSldFraPath;
	this.fNavPath = pNavPath;
	this.fTocLnksPath = pTocLnksPath || null;
	this.fIsMaster = (typeof pIsMaster == "undefined" ? true :  pIsMaster);
	// Init default paths & classes
	this.fCoFilter = scHPS.fCoFilter;
	this.fIgnoreFilter = scHPS.fIgnoreFilter;
	this.fCoBlocksRootPath = scHPS.fCoBlocksRootPath;
	this.fCoAltBlocksRootPath = scHPS.fCoAltBlocksRootPath;
	this.fCoAltBlocksMenuPath = scHPS.fCoAltBlocksMenuPath;
	this.fBlkCoPath = scHPS.fBlkCoPath;
	this.fCutableFilter = scHPS.fCutableFilter;
	this.fUncutableFilter = scHPS.fUncutableFilter;
	this.fForcedCutFilter = scHPS.fForcedCutFilter;
	this.fFixedHeightFilter = scHPS.fFixedHeightFilter;
	this.fSlideClass = scHPS.fSlideClass;
	this.fSsClassPrefix = scHPS.fSsClassPrefix;
	// Init default behaviours
	this.fKeyMap = scHPS.xProcessKeyMap(scHPS.fKeyMap);
	// Init local slide rules
	this.fSldRules = [];
	//Init Listeners
	this.fListeners = {};
	this.fListeners['onSldLoad'] = new Array();
	this.fListeners['onSldShow'] = new Array();
	this.fListeners['onBlkShow'] = new Array();
	this.fListeners['onKeyPress'] = new Array();
	this.fListeners['onAction'] = new Array();
	//Init tool element list
	this.fToolElts = new Array();
	//Init liste elements stylés avec la position actuel dans le slide-show (FirstSlide LastSlide, FirstStep, LastStep)
	this.fSldPosStyledElts = new Array();
	scOnLoads[scOnLoads.length] = this;
}
scHPS.PresMgr.prototype = {
	/* --- fields ------------------------------------------------------------- */
	fCurrSld : null,
	/* --- Public ------------------------------------------------------------- */
	/** PresMgr.initContainerFilter
	    Must be called before onLoad() */
	initContainerFilter : function(pContainerFilter) {
		this.fCoFilter = pContainerFilter;
	},
	/** PresMgr.initIgnoreFilter
	    Must be called before onLoad() */
	initIgnoreFilter : function(pIgnoreFilter) {
		this.fIgnoreFilter = pIgnoreFilter;
	},
	/** PresMgr.initCutableFilter
	    Must be called before onLoad() */
	initCutableFilter : function(pCutableFilter) {
		this.fCutableFilter = pCutableFilter;
	},
	/** PresMgr.initForcedCutFilter
	    Must be called before onLoad() */
	initForcedCutFilter : function(pForcedCutFilter) {
		this.fForcedCutFilter = pForcedCutFilter;
	},
	/** PresMgr.initUncutableFilter
	    Must be called before onLoad() */
	initUncutableFilter : function(pUncutableFilter) {
		this.fUncutableFilter = pUncutableFilter;
	},
	/** PresMgr.initFixedHeightFilter
	    Must be called before onLoad() */
	initFixedHeightFilter : function(pFixedHeightFilter) {
		this.fFixedHeightFilter = pFixedHeightFilter;
	},
	/** PresMgr.initContainerBlocksRootPath 
	    Must be called before onLoad() */
	initContainerBlocksRootPath : function(pContainerBlocksRootPath) {
		this.fCoBlocksRootPath = pContainerBlocksRootPath;
	},
	/** PresMgr.initContainerAlternativeBlocksRootPath 
	    Must be called before onLoad() */
	initContainerAlternativeBlocksRootPath : function(pContainerAlternativeBlocksRootPath) {
		this.fCoAltBlocksRootPath = pContainerAlternativeBlocksRootPath;
	},
	/** PresMgr.initContainerAlternativeBlocksRootPath 
	    Must be called before onLoad() */
	initContainerAlternativeBlocksMenuPath : function(pContainerAlternativeBlocksMenuPath) {
		this.fCoAltBlocksMenuPath = pContainerAlternativeBlocksMenuPath;
	},
	/** PresMgr.initBlockContentPath
	    Must be called before onLoad() */
	initBlockContentPath : function(pBlkCoPath) {
		this.fBlkCoPath = pBlkCoPath;
	},
	/** PresMgr.initSlideClass
	    Must be called before onLoad() */
	initSlideClass : function(pSlideClass) {
		this.fSlideClass = pSlideClass;
	},
	/** PresMgr.initToolsPath : Set path of optional tools element (if defined extra buttons will be added such as the ability to switch to HTML mode). 
	    Must be called before onLoad() */
	initToolsPath : function(pToolsPath) {
		this.fToolsPath = pToolsPath;
	},
	/** PresMgr.initZoomPaths : Set paths of elements that constitute the zoom frame.
	    Must be called before onLoad() */
	initZoomPaths : function(pZoomFramePath,pZoomContentPath) {
		this.fZoomFramePath = pZoomFramePath;
		this.fZoomContentPath = pZoomContentPath;
	},
	/** PresMgr.initZoomPaths : Set path of wait message element.
	    Must be called before onLoad() */
	initWaitPath : function(pWaitPath) {
		this.fWaitPath = pWaitPath;
	},
	/** PresMgr.addSlidePositionStyledPath : register a path as a slide-position styled element.
	    Must be called before onLoad() */
	addSlidePositionStyledPath : function(pPath) {
		if (scHPS.fDisabled) return;
		this.fSldPosStyledElts.push(pPath);
	},
	/** PresMgr.addLocalSlideRule : Add a bindable block for local slides
	 * @param pFunc : function that will be called for each local slide (must take a SldMgr as an argument).
	 * @param pFilterPath optional : scPaLib path that can filter the slides.
	    Must be called before onLoad() */
	addLocalSlideRule : function(pFunc,pFilterPath){
		if (scHPS.fDisabled) return;
		this.fSldRules.push({fFilter : pFilterPath ? scPaLib.compileFilter(pFilterPath) : "", fFunc : pFunc});
	},
	/** PresMgr.onLoad : Main onLoad function called by the SCENARI framework. */
	onLoad : function() {
		try{
			//scCoLib.util.log("PresMgr.onLoad");
			var vPresMgr = this;
			this.fEnableEffects = !(scHPS.fStore.get("enableEffects") == "false");
			//Find Slideshow base elements
			this.fSldFra = scPaLib.findNode(this.fSldFraPath);
			if (!this.fSldFra) throw "Slideshow root frame not found."
			this.fNav = scPaLib.findNode(this.fNavPath);
			if (!this.fNav) throw "Slideshow navigation bar not found."
			//
			this.fToolsShowTime = new Date().getTime();
			this.fHeartbeat = window.setInterval(function(){scHPS.PresMgr.sHeartbeat(vPresMgr)},1000);
			// Page master presentation stuff
			if (this.fIsMaster){
				scHPS.swichToSsStyles();
				if(scCoLib.isIE) document.body.attachEvent("onmousemove", function(){scHPS.sMouseMgr(vPresMgr)});
				else window.addEventListener("mousemove", function(){scHPS.sMouseMgr(vPresMgr)},true);
				if(scCoLib.isIE) document.body.attachEvent("onmousedown", function(){scHPS.sMouseMgr(vPresMgr)});
				else window.addEventListener("mousedown", function(){scHPS.sMouseMgr(vPresMgr)},true);
				if(scCoLib.isIE) document.body.attachEvent("onkeyup", function(){scHPS.sOnKeyUp(window.event,vPresMgr)});
				else window.addEventListener("keyup", function(pEvt){scHPS.sOnKeyUp(pEvt,vPresMgr)},false);
				if(scCoLib.isIE) document.body.attachEvent("onkeydown", function(){scHPS.sOnKeyDown(window.event,vPresMgr)});
				else window.addEventListener("keydown", function(pEvt){scHPS.sOnKeyDown(pEvt,vPresMgr)},false);
				if (scHPS.fScreenTouch){
					window.addEventListener("touchstart", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchmove", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchend", scHPS.sTouchMgr.bind(vPresMgr),true);
					window.addEventListener("touchcancel", scHPS.sTouchMgr.bind(vPresMgr),true);
				}
			}
			// path & filter compilation 
			this.fCoFilterComp = scPaLib.compileFilter(this.fCoFilter);
			this.fIgnoreFilterComp = scPaLib.compileFilter(this.fIgnoreFilter);
			this.fCoBlocksRootPathComp = scPaLib.compilePath(this.fCoBlocksRootPath);
			this.fCoAltBlocksRootPathComp = scPaLib.compilePath(this.fCoAltBlocksRootPath);
			this.fCoAltBlocksMenuPathComp = scPaLib.compilePath(this.fCoAltBlocksMenuPath);
			this.fBlkCoPathComp = scPaLib.compilePath(this.fBlkCoPath);
			this.fCutableFilterComp = scPaLib.compileFilter(this.fCutableFilter);
			this.fFixedHeightFilterComp = scPaLib.compileFilter(this.fFixedHeightFilter);
			this.fForcedCutFilterComp = scPaLib.compileFilter(this.fForcedCutFilter);
			this.fSlidePath = scPaLib.compilePath("des:."+this.fSlideClass);
			//Init local slides
			var vLocalSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
			this.fFirstLocalIdx = -vLocalSlds.length;
			for (var i=0;i<vLocalSlds.length;i++){
				var vSld = vLocalSlds[i];
				vSld.fSldHdr = new scHPS.SldLocalHdr(i - vLocalSlds.length, this);
				var vSldMgr = new scHPS.SldLocalMgr(vSld, vSld.fSldHdr);
				for (var j=0;j<this.fSldRules.length;j++){
					try {
						var vRule = this.fSldRules[j];
						if (vRule.fFilter == "" || scPaLib.checkNode(vRule.fFilter, vSld)) vRule.fFunc(vSldMgr);
					} catch(e){scCoLib.util.log("WARNING PresMgr.onLoad - local slide rule num. " + j + ": "+e);}
				}
				vSld.fSldHdr.initSld();
				scHPS.xEndOpacityEffect(vSld, 0);
			}
			//Init toc - external slides
			this.fSldUrls = [];
			if (this.fTocLnksPath){
				var vTocLnks = scPaLib.findNodes(this.fTocLnksPath);
				if (vTocLnks.length>0){
					var vBtnHome = vTocLnks.shift();
					var vPresMgr = this;
					var vFirstIdx = this.fFirstLocalIdx;
					vBtnHome.onclick = function(){vPresMgr.loadSlide(vFirstIdx, true);return false;};
					for (var i=0; i < vTocLnks.length; i++){
						var vLnk = vTocLnks[i];
						this.fSldUrls[i] = vLnk.href.split("?")[0];
						vLnk.fSldIdx = i;
						vLnk.fPresMgr = this;
						vLnk.onclick = scHPS.PresMgr.sOnClickTocLnk;
					}
				}
			}
			//Init nav bar
			this.fNav.fDefaultClass = this.fNav.className;
			this.fNav.innerHTML = ""; // Purge the nav bar
			this.fBtnPrv = this.xAddBtn(this.fNav, "btnPrv", scHPS.xGetStr(0), scHPS.xGetStr(1));
			this.fBtnPrv.style.visibility = "hidden";
			this.fBtnNxt = this.xAddBtn(this.fNav, "btnNxt", scHPS.xGetStr(2), scHPS.xGetStr(3));
			this.addToolElement(this.fNav);
			//Init optional tools 
			if (this.fToolsPath){
				this.fTools = scPaLib.findNode(this.fToolsPath);
				if (!this.fTools) throw "Slideshow tools bar not found."
				this.fTools.innerHTML = ""; // Purge the tools bar
				this.fBtnModeHtml = this.xAddBtn(this.fTools, "btnModeHtml", scHPS.xGetStr(8), scHPS.xGetStr(9));
				this.fBtnEfcts = this.xAddBtn(this.fTools, "btnEfcts", scHPS.xGetStr(11), scHPS.xGetStr(12));
				this.fBtnEfcts.style.display = (this.fEnableEffects ? "none" : "");
				this.fBtnNoEfcts = this.xAddBtn(this.fTools, "btnNoEfcts", scHPS.xGetStr(11), scHPS.xGetStr(13));
				this.fBtnNoEfcts.style.display = (this.fEnableEffects ? "" : "none");
				this.addToolElement(this.fTools);
			}
			//Init zoom container
			this.fZoom = (this.fZoomFramePath ? scPaLib.findNode(this.fZoomFramePath) : scHPS.xAddElt("div", document.body, null));
			if (!this.fZoom) throw "Slideshow zoom container not found."
			this.fZoom.className = this.fZoom.className + " "+this.fSsClassPrefix+"Zm";
			this.fZoom.style.visibility = "hidden";
			this.fZoom.fCo = (this.fZoomContentPath ? scPaLib.findNode(this.fZoomContentPath) : this.fZoom);
			this.fZoom.fSld = scHPS.xAddElt("div", this.fZoom.fCo, this.fSsClassPrefix+"ZmSld");
			this.fZoom.fFrg = scHPS.xAddElt("div", this.fZoom.fCo, this.fSsClassPrefix+"ZmFrg");
			this.fZoom.fBtnCls = this.xAddBtn(this.fZoom.fCo, "btnZmCls", scHPS.xGetStr(4), scHPS.xGetStr(5));
			//Init wait message.
			this.fWaitMsg = (this.fWaitPath ? scPaLib.findNode(this.fWaitPath) : scHPS.xAddElt("div", document.body, null));
			if (!this.fWaitMsg) throw "Slideshow wait message not found."
			this.fWaitMsg.className = this.fWaitMsg.className + " "+this.fSsClassPrefix+"WaitMsg";
			this.fWaitMsg.style.visibility = "hidden";
			this.fWaitMsg.innerHTML = "<span>" + scHPS.xGetStr(22) + "</span>";
			//Init slide-position styled elements
			for (var i=0;i<this.fSldPosStyledElts.length;i++){
				this.fSldPosStyledElts[i] = scPaLib.findNode(this.fSldPosStyledElts[i]);
				if (this.fSldPosStyledElts[i]) this.fSldPosStyledElts[i].fBaseClass = this.fSldPosStyledElts[i].className;
			}
			//Enable tool auto hiding
			this.enableToolHider(true);
			//Affichage du premier slide (rendu instantanné)
			var vFirstSlide = vLocalSlds[0];
			if (!vFirstSlide && this.fSldUrls[0]) vFirstSlide = this.xBuildSlide(0);
			if (vFirstSlide) this.fSwitchSldTask.initTask(vFirstSlide, "first", true);
			else throw "no local or external slides found."
		}catch(e){scCoLib.util.logError("ERROR PresMgr.onLoad",e);}
	},
	loadSortKey : "A",
	/** PresMgr.addToolElement : register a node as a tool (auto hidden elements). */
	addToolElement : function(pNode) {
		if (scHPS.fDisabled) return;
		this.fToolElts.push(pNode);
	},
	/** PresMgr.register : register a listener. */
	register : function(pType, pFunc, pCtx) {
		if (scHPS.fDisabled) return;
		if (pCtx) {
			scHPS.xAddBindToFunction(pFunc);
			this.fListeners[pType].push(pFunc.bind(pCtx));
		} else this.fListeners[pType].push(pFunc);
	},
	/** PresMgr.enableToolHider : Enable / Disable auto tool hiding */
	enableToolHider : function(pEnable) {
		if (scHPS.fDisabled) return;
		this.fToolHider = pEnable;
		if (!pEnable) this.xShowTools();
	},
	/** PresMgr.enableEffects : Enable / Disable visual effects */
	enableEffects : function(pEnable) {
		if (scHPS.fDisabled) return;
		this.fEnableEffects = pEnable;
		scHPS.fStore.set("enableEffects",String(this.fEnableEffects));
		if (this.fBtnEfcts) this.fBtnEfcts.style.display = (this.fEnableEffects ? "none" : "");
		if (this.fBtnNoEfcts) this.fBtnNoEfcts.style.display = (this.fEnableEffects ? "" : "none");
	},
	/** PresMgr.toggleEffects : Toggle visual effects */
	toggleEffects : function() {
		this.enableEffects(!this.fEnableEffects);
	},
	/** PresMgr.setKeyMap : change how the keys are interpreted.
	    @param pKeyMap : object defining the action->mapping (see scHPS.fKeyMap at top of file)  */
	setKeyMap : function(pKeyMap) {
		var vAction;
		for (vAction in scHPS.fKeyMap){
			if (typeof pKeyMap[vAction] == "undefined") pKeyMap[vAction] = scHPS.fKeyMap[vAction];
		}
		this.fKeyMap = scHPS.xProcessKeyMap(pKeyMap);
	},
	/** PresMgr.loadSlide : Load a slide by index id. 
	 * @param pFromStart : affiche le slide du début (true) ou de la fin (false).
	 * @param pInstantResult : si true précipite le résultat instannément, sans animation.
	 * @return false si echec (pas de slide d'idx pIdx, ...) */
	loadSlide : function(pIdx, pFromStart, pInstantResult) {
		//scCoLib.util.log("PresMgr.loadSlide: "+pIdx);
		if (scHPS.fDisabled) return;
		this.xNotifyListeners("onAction", "loadSlide");
		this.xResetFocus();
		return this.xGotoSlide(pIdx, pFromStart, pInstantResult);
	},
	/** PresMgr.getCurrSld : Returns the current slide.
	 * @return current slide */
	getCurrSlide : function(){
		if (scHPS.fDisabled) return;
		return this.fSwitchSldTask.fNewSld || this.fCurrSld;
	},
	/** PresMgr.redrawSlideZone : Redessinement de la zone des slides (suite à resize notamment). */
	redrawSlideZone : function(){
		//scCoLib.util.log("PresMgr.redrawSlideZone");
		//Si besoin fixer la zone porteuse des slides this.fSldFra en JS...
		if(this.fCurrSld) this.fCurrSld.fSldHdr.redrawSld();
		if(this.fZoom.fSldHdr) this.fZoom.fSldHdr.redrawSld();
		
		var vFutureSld =  this.fSwitchSldTask.fNewSld;
		if(vFutureSld && ! vFutureSld.fSldHdr.fIsLoaded) vFutureSld = null;
		var vSld = this.fSldFra.firstChild;
		while(vSld) {
			if(vSld === this.fCurrSld || vSld === vFutureSld ) {
				vSld.fSldHdr.redrawSld();
			} else {
				vSld.fSldHdr.invalidateSize();
			}
			vSld = vSld.nextSibling;
		}
	},
	/** PresMgr.hasNext : 
	 * @return true if the presentation has a next step / slide */
	hasNext : function() {
		if (scHPS.fDisabled) return;
		var vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			return (vSld.fSldHdr.hasNext() ? true : !vSld.fSldHdr.isLastSld());
		} else return false;
	},
	/** PresMgr.hasPrevious : 
	 * @return true if the presentation has a previous step / slide */
	hasPrevious : function() {
		if (scHPS.fDisabled) return;
		var vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			return (vSld.fSldHdr.hasPrevious() ? true : !vSld.fSldHdr.isFirstSld());
		} else return false;
	},
	/** PresMgr.showZoom : Show the passed ressource in the zoom.
	 * @param pRes : resource to zoom.
	 * @param pOpts optional : zoom options. */
	showZoom : function(pRes, pOpts) {
		if (scHPS.fDisabled) return;
		return this.xShowZoom(pRes, pOpts);
	},
	/** PresMgr.next : Move forward 1 step / slide.
	 * @param pSkip if true move to beginning of next slide.
	 * @return false si l'action a échouée (chargement en cours du slide). */
	next : function(pSkip) {
		//scCoLib.util.log("PresMgr.next");
		if (scHPS.fDisabled) return;
		if(this.fZoom.fAct && !pSkip){
			if(this.fZoom.fSldHdr && !this.fZoom.fSldHdr.fIsLoaded) return false;
			if(!this.fZoom.fSldHdr || this.fZoom.fSldHdr && !this.fZoom.fSldHdr.goToNxt()) this.xHideZoom();
		} else {
			this.xHideZoom();
			var vFromSld =  this.fSwitchSldTask.fNewSld || this.fCurrSld;
			if( ! vFromSld || ! vFromSld.fSldHdr.fIsLoaded) return false;
			this.xNotifyListeners("onAction", "next");
			if (pSkip || ! vFromSld.fSldHdr.goToNxt()) {
				return this.xGotoSlide(vFromSld.fSldHdr.fSldIdx+1, true, false);
			}
		}
		return true;
	},
	/** PresMgr.previous : Move back 1 step / slide.
	 * @param pSkip if true move to beginning of previous slide.
	 * @return false si l'action a échouée (chargement en cours du slide). */
	previous : function(pSkip) {
		//scCoLib.util.log("PresMgr.previous");
		if (scHPS.fDisabled) return;
		if(this.fZoom.fAct && !pSkip){
			if(this.fZoom.fSldHdr && !this.fZoom.fSldHdr.fIsLoaded) return false;
			if(!this.fZoom.fSldHdr || this.fZoom.fSldHdr && !this.fZoom.fSldHdr.goToPrv()) this.xHideZoom();
		} else {
			this.xHideZoom();
			var vFromSld =  this.fSwitchSldTask.fNewSld || this.fCurrSld;
			if( ! vFromSld ||  ! vFromSld.fSldHdr.fIsLoaded) return false;
			this.xNotifyListeners("onAction", "previous");
			if (pSkip || ! vFromSld.fSldHdr.goToPrv()) {
				return this.xGotoSlide(vFromSld.fSldHdr.fSldIdx-1, (pSkip ? true : false), false);
			}
		}
		return true;
	},
	/* --- private ------------------------------------------------------------ */
	/** PresMgr.xUpdateGui */
	xUpdateGui : function() {
//		scCoLib.util.log("PresMgr.xUpdateGui");
		var vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			this.fBtnNxt.style.visibility = (vSld.fSldHdr.hasNext() ? "" : (!vSld.fSldHdr.isLastSld() ? "" : "hidden"));
			this.fBtnPrv.style.visibility = (vSld.fSldHdr.hasPrevious() ? "" : (!vSld.fSldHdr.isFirstSld() ? "" : "hidden"));
		}
		this.xUpdateSldPosStyledElts();
	},
	/** PresMgr.xUpdateSldPosStyledElts */
	xUpdateSldPosStyledElts : function() {
		// Add slide-postion classes on registed elements if needed.
		var vSld = this.getCurrSlide();
		if (vSld && vSld.fSldHdr) {
			for (var i=0;i<this.fSldPosStyledElts.length;i++){
				var vNewClass = this.fSldPosStyledElts[i].fBaseClass + (vSld.fSldHdr.isFirstSld() ? " "+this.fSsClassPrefix+"FirstSlide" + (!vSld.fSldHdr.hasPrevious() ? " "+this.fSsClassPrefix+"FirstStep" : "") : (vSld.fSldHdr.isLastSld() ? " "+this.fSsClassPrefix+"LastSlide" + (!vSld.fSldHdr.hasNext() ? " "+this.fSsClassPrefix+"LastStep" : "") : ""));
				if (this.fSldPosStyledElts[i].className != vNewClass) this.fSldPosStyledElts[i].className = vNewClass;
			}
		}
	},
	/** PresMgr.xGotoSlide : Navigation vers un slide. 
	 * @param pIdx : slide index to load.
	 * @param pFromStart : affiche le slide du début (true) ou de la fin (false).
	 * @param pInstantResult : if true no animation.
	 * @return false si echec (pas de slide d'idx pIdx, ...) */
	xGotoSlide : function(pIdx, pFromStart, pInstantResult) {
		//scCoLib.util.log("PresMgr.xGotoSlide: "+pIdx);
		try{
			//Borne pIdx selon les limites du slide show
			if(pIdx < this.fFirstLocalIdx) return false;
			if(pIdx >= this.fSldUrls.length) return false;
		
			var vFutureSld =  this.fSwitchSldTask.fNewSld;
			var vFutureIdx = vFutureSld ? vFutureSld.fSldHdr.fSldIdx : -99;
			var vCurrIdx = this.fCurrSld ? this.fCurrSld.fSldHdr.fSldIdx : -99;
			if(vCurrIdx == pIdx) {
				//On redemande le slide en cours.
				//On kill un éventuel début de transition vers un autre slide.
				if(vFutureSld) this.fSwitchSldTask.rollbackTask();
				var vCurrSldHdr = this.fCurrSld.fSldHdr;
				var vBlock = pFromStart ? vCurrSldHdr.getFirstBlock() : vCurrSldHdr.getLastBlock();
				this.fSwitchBlkTask.initTask(vCurrSldHdr.getCurrBlk(), vBlock, pFromStart? "F" : "L", pInstantResult);
			} else if(vFutureIdx == pIdx) {
				//On redemande le slide qui va venir
				this.fSwitchSldTask.precipitateEndTask();
				var vCurrSldHdr = this.fCurrSld.fSldHdr;
				var vBlock = pFromStart ? vCurrSldHdr.getFirstBlock() : vCurrSldHdr.getLastBlock();
				this.fSwitchBlkTask.initTask(vCurrSldHdr.getCurrBlk(), vBlock, pFromStart? "F" : "L", pInstantResult);
			} else {
				//Recherche le slide dans le cache
				var vSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
				for (var i=0;i<vSlds.length;i++){
					var vSld = vSlds[i];
					if(vSld.fSldHdr.fSldIdx == pIdx) {
						//Trouvé
						this.fSwitchSldTask.initTask(vSld, pFromStart? "first" : "last", pInstantResult);
						return true;
					}
				}
				//Pas trouvé dans le cache, on charge.
				var vPresMgr = this;
				this.fWaitProc = window.setTimeout(function(){scHPS.PresMgr.sShowWait(vPresMgr)}, 800);
				this.fSwitchSldTask.initTask(this.xBuildSlide(pIdx), pFromStart? "first" : "last", pInstantResult);
			}
			return true;
		}catch(e){scCoLib.util.logError("ERROR PresMgr.xGotoSlide",e);}
	},
	/** PresMgr.xSetCurrSlide : Affecte le nouveau slide "stabilisé" et devient la nouvelle référence.
	 * Gère le cache des slides en fonction de cette nouvelle position.
	 * @param pNewCurrSlide : new slide to set as current. */
	xSetCurrSlide : function(pNewCurrSlide) {
		//scCoLib.util.log("PresMgr.xSetCurrSlide");
		try{
			scHPS.PresMgr.sHideWait(this);
			if (this.fWaitProc) window.clearTimeout(this.fWaitProc);
			this.fCurrSld = pNewCurrSlide;
			var vNewIdx = pNewCurrSlide.fSldHdr.fSldIdx;
			var vNextIdx = vNewIdx + 1;
			var vPrevIdx = vNewIdx - 1;
			var vNextLimit = vNewIdx + 8;
			var vPrevLimit = vNewIdx - 2;
			var vIsNextOk = false;
			var vIsPrevOk = false;

			var vSlds = scPaLib.findNodes(this.fSlidePath, this.fSldFra);
			for (var i=0;i<vSlds.length;i++){
				var vSld = vSlds[i];
				var vSldIdx = vSld.fSldHdr.fSldIdx;
				if(vSldIdx == vPrevIdx) {
					vIsPrevOk = true;
				} else if(vSldIdx == vNextIdx) {
					vIsNextOk = true;
				}
				if((vSldIdx < vPrevLimit || vSldIdx > vNextLimit) && vSldIdx>=0) {
					//pas un slide de proximité, ni local, on purge.
					vSld.parentNode.removeChild(vSld);
				}
			}
			if( ! vIsNextOk && vNextIdx >= 0 && vNextIdx < this.fSldUrls.length) {
				this.xBuildSlide(vNextIdx);
			}
			if( ! vIsPrevOk && vPrevIdx >= 0 && vPrevIdx < this.fSldUrls.length) {
				this.xBuildSlide(vPrevIdx);
			}
			this.xResetFocus();
			this.xNotifyListeners("onSldShow", this.fCurrSld);
		}catch(e){scCoLib.util.logError("ERROR PresMgr.xSetCurrSlide",e);}
	},
	/** PresMgr.xBuildSlide : Chargement d'un slide.
	 * @param pIdx : slide index to build. */
	xBuildSlide : function(pIdx) {
		//scCoLib.util.log("PresMgr.xBuildSlide: "+pIdx);
		var vSld = scHPS.xAddEltHidden("div", this.fSldFra, this.fSlideClass);
		vSld.fSldHdr = new scHPS.SldHdr(vSld, pIdx, this);
		vSld.fSldHdr.initSld();
		return vSld;
	},
	/** PresMgr.xInitBlocks : Init tous les blocks fils d'un blockRoot (du slide ou d'un container) */
	xInitBlocks : function(pParentHdr, pBlockRoot){
		var vResult = [];
		if(pBlockRoot) {
			//scCoLib.util.log("PresMgr.xInitBlocks");
			var vRootHdr = pParentHdr;
			while(typeof vRootHdr.fParentHdr != "undefined") vRootHdr = vRootHdr.fParentHdr;
			var vNode = pBlockRoot.firstChild;
			while(vNode) {
				if(vNode.nodeType==1) {
					if(!scPaLib.checkNode(this.fIgnoreFilterComp, vNode)) {
						if(scPaLib.checkNode(this.fCoFilterComp, vNode)) {
							vNode.fBlkHdr = new scHPS.BlkCoHdr(pParentHdr, vNode, vResult.length);
						} else {
							vNode.fBlkHdr = new scHPS.BlkHdr(pParentHdr, vNode, vResult.length);
							vNode.fCount = vRootHdr.fBlkCount++
						}
						vNode.fIdx = vResult.length;
						vResult[vResult.length] = vNode;
						vNode.style.visibility = "hidden";
					}
				}
				vNode = vNode.nextSibling;
			}
		}
		return vResult;
	},
	/** PresMgr.xKeyMgr */
	xKeyMgr : function(pCharCode){
		//scCoLib.util.log("PresMgr.xKeyMgr: "+pCharCode);
		this.xNotifyListeners("onKeyPress", pCharCode);
		var vAction;
		try{
			vAction = this.fKeyMap[String(pCharCode)];
		} catch(e){};
		if (!vAction) return false;
		switch(vAction){
			case "nextStep":
				this.next(); return false;
			case "previousStep":
				this.previous(); return false;
			case "toggleEffects":
				this.toggleEffects(); return false;
			case "nextSlide":
				this.next(true); return false;
			case "previousSlide":
				this.previous(true); return false;
			case "home":
				this.loadSlide(-1);return false;
			case "closeZoom":
				this.xHideZoom();return false;
			case "switchToHtml":
				return scHPS.xSwitchToHtmlMode();
		}
	},
	/** PresMgr.xShowZoom : display the zoom window
	 * @param pRes : resource to zoom
	 * @param pOpt : zoom options (type, openAsHtml, etc.) */
	xShowZoom : function(pRes, pOpt){
		var vDst = null;
		var vZm = this.fZoom
		var vPresMgr = this;
		pOpt = pOpt || {};
		vZm.fFraHdr = null;
		vZm.fSldHdr = null;
		vZm.fSld.innerHTML = "";
		vZm.fFrg.innerHTML = "";
		if (!vZm.fAct){
			vZm.fAct = true;
			switch(pOpt.type){
				case "sld":
					new scHPS.FadeEltTask(vZm.fFrg,0,vPresMgr,null,null,true);
					new scHPS.FadeEltTask(vZm.fSld,1,vPresMgr,null,null,true);
					vZm.fSldHdr = new scHPS.SldZoomHdr(vZm.fSld, pRes.href+(pOpt.setModeHtml?"?mode=html":""),vPresMgr,function(){new scHPS.FadeEltTask(vZm,1,vPresMgr,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);});
					vZm.fSldHdr.initSld();
					break;

				case "fra":
					new scHPS.FadeEltTask(vZm.fFrg,0,vPresMgr,null,null,true);
					new scHPS.FadeEltTask(vZm.fSld,1,vPresMgr,null,null,true);
					vZm.fFraHdr = new scHPS.FraZmHdr(vZm.fSld, pRes.href+(pOpt.setModeHtml?"?mode=html":""),vPresMgr,function(){new scHPS.FadeEltTask(vZm,1,vPresMgr,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);});
					vZm.fFraHdr.init();
					break;

				default:
					new scHPS.FadeEltTask(vZm.fFrg,1,vPresMgr,null,null,true);
					new scHPS.FadeEltTask(vZm.fSld,0,vPresMgr,null,null,true);
					vDst = scHPS.importDeepNode(pRes, vZm.fFrg.ownerDocument, vZm.fFrg);
					new scHPS.FadeEltTask(vZm,1,vPresMgr,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);
			}
			this.fNav.className = this.fNav.fDefaultClass + " "+this.fSsClassPrefix+"NavZoom";
		} else {
			switch(pOpt.type){
				case "sld":
					vZm.fSldHdr = new scHPS.SldZoomHdr(vZm.fSld, pRes.href+(pOpt.setModeHtml?"?mode=html":""),vPresMgr);
					vZm.fSldHdr.initSld();
					break;

				case "fra":
					vZm.fFraHdr = new scHPS.FraZmHdr(vZm.fSld, pRes.href+(pOpt.setModeHtml?"?mode=html":""),vPresMgr);
					vZm.fFraHdr.init();
					break;

				default:
					vDst = scHPS.importDeepNode(pRes, vZm.fFrg.ownerDocument, vZm.fFrg);
					new scHPS.FadeEltTask(vZm.fSld,0,vPresMgr,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);
					new scHPS.FadeEltTask(vZm.fFrg,1,vPresMgr,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);
			}
		}
		this.xNotifyListeners("onAction", "showZoom");
		return vDst;
	},
	/** PresMgr.xHideZoom : hide the zoom window */
	xHideZoom : function(){
		if (this.fZoom.fAct){
			this.fZoom.fAct = false;
			new scHPS.FadeEltTask(this.fZoom,0,this,scHPS.sFadeEltStart,scHPS.PresMgr.sHideZoomEnd);
			this.fNav.className = this.fNav.fDefaultClass;
			this.xNotifyListeners("onAction", "hideZoom");
		}
	},
	/** PresMgr.xGetZoomContainer : return the zoom container */
	xGetZoomContainer : function(){
		return this.fZoom.fFrg;
	},
	/** PresMgr.xGetZoomSlide : return the zoom iframe container */
	xGetZoomSlide : function(){
		return this.fZoom.fFra;
	},
	/** PresMgr.xResetFocus - sets the focus to the current slide. */
	xResetFocus : function() {
		if (this.fCurrSld && this.fCurrSld.fSldHdr && this.fCurrSld.fSldHdr.fFraNode){
			var vFra = this.fCurrSld.fSldHdr.fFraNode;
			if (vFra.focus) vFra.focus();
			var vPge = this.fCurrSld.fSldHdr.fSldMgr.getBlksRoot();
			if (vPge && vPge.focus) vPge.focus();
		}
	},
	/** PresMgr.xNotifyListeners - calls all the listeners of a given type. */
	xNotifyListeners : function(pType,pRes) {
		//scCoLib.util.log("PresMgr.xNotifyListeners: "+pType);
		var vListener = this.fListeners[pType];
		for (var i=0;i<vListener.length;i++) {
			try {
				vListener[i](pRes);
			} catch(e) {scCoLib.util.logError("ERROR PresMgr.xNotifyListeners",e);}
		}
	},
	/** PresMgr.xHideTools : tool hider */
	xHideTools : function(){
		if (!this.fToolsHidden) {
			var vNewTime = new Date().getTime();
			if (vNewTime-this.fToolsShowTime >= 5000) {
				this.fToolsHidden = true;
				for (var i=0;i<this.fToolElts.length;i++) {
					try {
						new scHPS.FadeEltTask(this.fToolElts[i],0,this,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);
					} catch(e) {scCoLib.util.logError("ERROR PresMgr.xHideTools",e);}
				}
			}
		}
	},
	/** PresMgr.xShowTools : tool shower */
	xShowTools : function(){
		if (this.fToolsHidden) {
			this.fToolsHidden = false;
			for (var i=0;i<this.fToolElts.length;i++) {
				try {
					new scHPS.FadeEltTask(this.fToolElts[i],1,this,scHPS.sFadeEltStart,scHPS.sFadeEltEnd);
				} catch(e) {scCoLib.util.logError("ERROR PresMgr.xShowTools",e);}
			}
		}
		this.fToolsShowTime = new Date().getTime();
	},
	/* --- Tasks -------------------------------------------------------------- */
	/** PresMgr.fSwitchSldTask : TiLib task that swiches from the current slide to a new one. */
	fSwitchSldTask : {
		fNewSld: null,
		fStatus: null,
		fPresMgr: null,
		fIdx: -1,
		fRateOld: [.9, .8, .7, .5, .3, .2, .1,  0,  0,  0,  0],
		fRateNew: [ 0,  0,  0,  0, .1, .2, .3, .5, .7, .8, .9],
		/** PresMgr.fSwitchSldTask.initTask : Init la task pour accéder à un nouveau slide.
		 * @param pBlock block à afficher.
		 * @param pStatus 
		 * 			"first"  : affichage du 1er step du 1er block,
		 * 			"last" : affichage du dernier step du dernier block.
		 * @param pInstantResult si true précipite le résultat instannément, sans animation. */
		initTask : function(pNewSld, pStatus, pInstantResult){
			//scCoLib.util.log("PresMgr.fSwitchSldTask.initTask: status: "+pStatus);
			try{
				this.fPresMgr = pNewSld.fSldHdr.getPresMgr();
				if (!this.fPresMgr.fEnableEffects) pInstantResult = true;
				//On annule tout autre task en cours
				this.fPresMgr.fSwitchStpTask.precipitateEndTask();
				this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
				if (this.fNewSld) {
					//On annule les effets en cours pour revenir à la situation initiale.
					scHPS.xEndOpacityEffect(this.fNewSld, 0);
					//Enchainement rapide, plus d'animation.
					pInstantResult = true;
				}
				this.fIdx = -1;
				this.fNewSld = pNewSld;
				this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
				this.fStatus = pStatus;
				this.fInstantResult = pInstantResult;
				if(pInstantResult && this.fNewSld.fSldHdr.fIsLoaded) this.precipitateEndTask();
				else scTiLib.addTaskNow(this);
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchSldTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchSldTask.execTask */
		execTask : function(){
			try{
			if(! this.fNewSld) return false; //precipitateEndTask() appelé entre temps.
			if(! this.fNewSld.fSldHdr.fIsLoaded) {
				//Nouvelle sld pas encore chargée, on attend...
				//Note: timeout pour sortir ? pas forcément, toute action user de navigation entrainera un cancel.
				return true;
			}
			if(this.fStatus != "") {
				//scCoLib.util.log("PresMgr.fSwitchSldTask.execTask: firstPass");
				//Une fois chargé, 1er passage : initialisation du block et du step demandé.
				var vNewSldHdr = this.fNewSld.fSldHdr;
				switch(this.fStatus) {
				case "first" : 
					this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getFirstBlock(), "F", true);
					break;
				case "last" : 
					this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getLastBlock(), "L", true);
					break;
				}
				//Début de l'animation
				//On commence à rendre visible le nouveau slide.
				scHPS.xStartOpacityEffect(this.fNewSld, 0);
				if(this.fPresMgr.fCurrSld) scHPS.xStartOpacityEffect(this.fPresMgr.fCurrSld, 1);
				this.fStatus = "";
				if(this.fInstantResult) {
					//Si on avait demandé un affichage immédiat.
					this.precipitateEndTask();
					return false;
				}
			}
			var vNow = Date.now ? Date.now() : new Date().getTime();
			while(this.fEndTime < vNow && this.fIdx < this.fRateOld.length) {
				//On saute des steps si le processor est trop lent.
				this.fIdx++;
				this.fEndTime += 100;
			}
			this.fIdx++;
			this.fEndTime += 100;
			if(this.fIdx >= this.fRateOld.length) {
				this.precipitateEndTask();
				return false;
			} else {
				if(this.fPresMgr.fCurrSld) scHPS.xSetOpacity(this.fPresMgr.fCurrSld, this.fRateOld[this.fIdx]);
				scHPS.xSetOpacity(this.fNewSld, this.fRateNew[this.fIdx]);
				return true;
			}
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchSldTask.execTask : "+e);}
		},
		/** PresMgr.fSwitchSldTask.precipitateEndTask : Précipite la fin de la task en cours. */
		precipitateEndTask : function(){
			try{
			if( ! this.fNewSld) return;
			if( ! this.fNewSld.fSldHdr.fIsLoaded) throw "bug: interdit d'appeler PresMgr.fSwitchSldTask.precipitateEndTask() lorsque le slide cible n'est pas encore chargé.";
			if(this.fPresMgr.fCurrSld) scHPS.xEndOpacityEffect(this.fPresMgr.fCurrSld, 0);
			if(this.fStatus != "") {
				//Le block et step n'ont pas encoré été initialisés, animation non démarrée
				var vNewSldHdr = this.fNewSld.fSldHdr;
				switch(this.fStatus) {
				case "first" : 
					this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getFirstBlock(), "F", true);
					break;
				case "last" : 
					this.fPresMgr.fSwitchBlkTask.initTask(vNewSldHdr.getCurrBlk(), vNewSldHdr.getLastBlock(), "L", true);
					break;
				}
			}
			scHPS.xEndOpacityEffect(this.fNewSld, 1);
			this.fPresMgr.xUpdateGui();
			this.fPresMgr.xSetCurrSlide(this.fNewSld);
			this.fNewSld = null;
			this.fIdx = -1;
			this.fStatus = null;
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchSldTask.precipitateEndTask : "+e);}
		},
		/** PresMgr.fSwitchSldTask.rollbackTask : Annule l'animation et retourne sur le slide en cours. */
		rollbackTask : function(){
			try{
			if( ! this.fNewSld) return;
			if(this.fStatus == "") {
				//On avait commencé à basculer...
				scHPS.xEndOpacityEffect(this.fNewSld, 0);
				if(this.fPresMgr.fCurrSld) scHPS.xEndOpacityEffect(this.fPresMgr.fCurrSld, 1);
			}
			this.fNewSld = null;
			this.fIdx = -1;
			this.fStatus = null;
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchSldTask.rollbackTask : "+e);}
		}
	},
	/** PresMgr.fSwitchBlkTask : TiLib task that swiches from the current block to a new one. */
	fSwitchBlkTask : {
		fOldBlock: null,
		fNewBlock: null,
		fStep: 0,
		fIdx: -1,
		fRateOld: [.9, .8, .7, .5, .3, .2, .1,  0,  0,  0,  0],
		fRateNew: [ 0,  0,  0,  0, .1, .2, .3, .5, .7, .8, .9],
		/** PresMgr.fSwitchBlkTask.initTask : init la task pour accéder à un nouveau block.
		 * @param pTarget Block/Step cible à afficher
		 * 			"F" : First
		 * 			"L" : Last
		 * 			"S" : Same : redraw suite à resize
		 * @param pInstantResult si true précipite le résultat instantannément, sans animation. 
		 * @param pStartFunc optionnal function that will be executed at the start of the task.
		 * @param pEndFunc optionnal function that will be executed at the end of the task.*/
		initTask : function(pOldBlock, pNewBlock, pTarget, pInstantResult, pStartFunc, pEndFunc){
			if(!pNewBlock) return;
			//scCoLib.util.log("PresMgr.fSwitchBlkTask.initTask");
			try{
				this.fPresMgr = pNewBlock.fBlkHdr.getPresMgr();
				if (!this.fPresMgr.fEnableEffects) pInstantResult = true;
				//On précipite le chgt de steps.
				this.fPresMgr.fSwitchStpTask.precipitateEndTask();
				if (this.fNewBlock) {
					//On précipite notre propre task qui est en cours.
					this.precipitateEndTask();
					//Enchainement rapide, plus d'animation.
					pInstantResult = true;
				}
				//Positionnement du bloc (et de ses fils).
				pNewBlock.fBlkHdr.fixSizeAndTarget(pTarget);
				if(pOldBlock == pNewBlock) {
					//Pas d'animation si ce block est déjà le current.
					this.fOldBlock = null;
					this.fNewBlock = null;
					return;
				}
				//scCoLib.util.log("PresMgr.fSwitchBlkTask pInstantResult:::"+pInstantResult);
				this.fIdx = -1;
				this.fOldBlock = pOldBlock;
				this.fNewBlock = pNewBlock;
				if(pStartFunc) pStartFunc();
				this.fEndFunc = pEndFunc;
				if(pInstantResult) this.precipitateEndTask();
				else {
					//Préparation de l'animation
					this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
					if(this.fOldBlock) scHPS.xStartOpacityEffect(this.fOldBlock, 1);
					scHPS.xStartOpacityEffect(this.fNewBlock, 0);
					scTiLib.addTaskNow(this);
				}
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchBlkTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchBlkTask.execTask */
		execTask : function(){
			try{
			if(! this.fNewBlock) return false; //precipitateEndTask() appelé entre temps.
			var vNow = Date.now ? Date.now() : new Date().getTime();
			while(this.fEndTime < vNow && this.fIdx < this.fRateOld.length) {
				//On saute des steps si le processor est trop lent.
				this.fIdx++;
				this.fEndTime += 100;
			}
			this.fIdx++;
			this.fEndTime += 100;
			if(this.fIdx >= this.fRateOld.length) {
				this.precipitateEndTask();
				return false;
			} else {
				if(this.fOldBlock) scHPS.xSetOpacity(this.fOldBlock, this.fRateOld[this.fIdx]);
				scHPS.xSetOpacity(this.fNewBlock, this.fRateNew[this.fIdx]);
				return true;
			}
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchBlkTask.execTask : "+e);}
		},
		/** PresMgr.fSwitchBlkTask.precipitateEndTask : Précipite la fin de la task en cours. */
		precipitateEndTask : function(){
			try{
			if(!this.fNewBlock) return;
			if(this.fOldBlock) scHPS.xEndOpacityEffect(this.fOldBlock, 0);
			scHPS.xEndOpacityEffect(this.fNewBlock, 1);
			this.fNewBlock.fBlkHdr.fParentHdr.setCurrBlock(this.fNewBlock);
			this.fPresMgr.xNotifyListeners("onBlkShow", this.fNewBlock);
			this.fPresMgr.xUpdateGui();
			this.fNewBlock = null;
			this.fOldBlock = null;
			this.fIdx = -1;
			if(this.fEndFunc) this.fEndFunc();
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchBlkTask.precipitateEndTask : "+e);}
		}
	},
	/** PresMgr.fSwitchStpTask : TiLib task that swiches from the current step to a new one. */
	fSwitchStpTask : {
		/** Paramétrage de l'animation. */
		fBlkHdr: null,
		fTargetStepIdx : -1,
		/** Objectif à atteindre en terme de déplacement du content. */
		fTargetTop : 0,
		/** Nombre de cycles restant à réaliser. */
		fCycles : -1,
		/** Mask qui va détenir le focus. */
		fNewMask : null,
		/** Mask précédent qui détenait le focus. */
		fOldMask : null,
		/** PresMgr.fSwitchStpTask.initTask : init la task pour accéder à un nouveau step.
		 * @param pTargetStep Step cible à passer en focus
		 * 			"F" : First (pInstantResult est alors forcé à true)
		 * 			"L" : Last (pInstantResult est alors forcé à true)
		 * 			"N" : Next Retourne false si pas de next, true si next trouvé.
		 * 			"P" : Previous
		 * 			"S" : Same : redraw suite à resize (pInstantResult est alors forcé à true)
		 * 					Note : le début est le même, la fin du step peut varier.
		 * @param pInstantResult si true précipite le résultat instannément, sans animation. */
		initTask : function(pBlock, pTargetStep, pInstantResult){
			try{
				this.fPresMgr = pBlock.fBlkHdr.getPresMgr();
				if (!this.fPresMgr.fEnableEffects) pInstantResult = true;
				if(this.fBlkHdr) {
					this.precipitateEndTask();
					//Enchainement rapide, plus d'animation.
					pInstantResult = true;
				}
				this.fCycles = -1;
				var vBlkHdr = pBlock.fBlkHdr;
				if( ! vBlkHdr.fSteps) return false;
				switch(pTargetStep) {
				case "F":
					this.fTargetStepIdx = 0;
					pInstantResult = true;
					break;
				case "L":
					this.fTargetStepIdx = vBlkHdr.fSteps.length-1;
					pInstantResult = true;
					break;
				case "N":
					if(vBlkHdr.fCurrStep < vBlkHdr.fSteps.length -1) this.fTargetStepIdx = vBlkHdr.fCurrStep+1;
					else return false;
					break;
				case "P":
					if(vBlkHdr.fCurrStep >0) this.fTargetStepIdx = vBlkHdr.fCurrStep-1;
					else return false;
					break;
				case "S":
					this.fTargetStepIdx = vBlkHdr.fCurrStep;
					pInstantResult = true;
					break;
				}
				for (var i=0; i<vBlkHdr.fMasks.length; i++){
					var vMask = vBlkHdr.fMasks[i];
					vMask.fOpacity = (i<this.fTargetStepIdx ? vMask.fOpacityPrv : vMask.fOpacityNxt);
					if (pTargetStep=="F" || pTargetStep=="L"){
						scHPS.xSetOpacity(vMask, vMask.fOpacity);
					}
				}
				
				this.fBlkHdr = vBlkHdr;
				//Reaffichage du mask du step en cours.
				this.fOldMask = null;
				if(vBlkHdr.fCurrStep>=0) {
					this.fOldMask = vBlkHdr.fMasks[vBlkHdr.fCurrStep];
					this.fOldMask.style.display="";
				}
				//Calcul de la hauteur cible
				var vAvailH = vBlkHdr.fBlkContent.parentNode.offsetHeight;
				this.fNewMask  = vBlkHdr.fMasks[this.fTargetStepIdx];
				if( ! this.fNewMask) {
				}
				this.fTargetTop = (vAvailH-this.fNewMask.offsetHeight) / 2 - this.fNewMask.offsetTop;
				//Lancement de la tache
				if(pInstantResult) this.precipitateEndTask();
				else {
					if(this.fOldMask) scHPS.xSetOpacity(this.fOldMask, 0);
					this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
					this.fCycles = Math.min(25, Math.max(10, Math.round(Math.abs(vBlkHdr.fBlkContent.offsetTop - this.fTargetTop)/ 10)));
					//scCoLib.util.log("this.fCycles:::"+this.fCycles);
					scTiLib.addTaskNow(this);
				}
				return true;
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchStpTask.initTask : "+e);}
		},
		/** PresMgr.fSwitchStpTask.execTask */
		execTask : function(){
			if(! this.fBlkHdr) return false; //precipitateEndTask() appelé entre temps.
			try{
			var vNow = Date.now ? Date.now() : new Date().getTime();
			while(this.fEndTime < vNow && this.fCycles >0) {
				//On saute des steps si le processor est trop lent.
				this.fCycles--;
				this.fEndTime += 100;
			}
			this.fCycles--;
			if(this.fCycles <= 0) {
				this.precipitateEndTask();
				return false;
			} else {
				this.fEndTime += 100;
				var vDeltaOpacityNew = Math.min(this.fNewMask.fOpacity, 4 * this.fNewMask.fOpacity / this.fCycles);
				var vDeltaOpacityOld = Math.min(this.fOldMask.fOpacity, 4 * this.fOldMask.fOpacity / this.fCycles);
				//scCoLib.util.log("vDeltaOpacity:::"+vDeltaOpacity+" - this.fCycles::"+this.fCycles);
				if(this.fOldMask) {
					scHPS.xSetOpacity(this.fOldMask, vDeltaOpacityOld);
				}
				scHPS.xSetOpacity(this.fNewMask, this.fNewMask.fOpacity - vDeltaOpacityNew);
				var vCurrPos = this.fBlkHdr.fBlkContent.offsetTop;
				var vNewTop = vCurrPos - (2 * (vCurrPos - this.fTargetTop) / (this.fCycles+1) );
				this.fBlkHdr.fBlkContent.style.top = vNewTop+"px";
				return true;
			}
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchStpTask.execTask : "+e);}
		},
		/** PresMgr.fSwitchStpTask.precipitateEndTask : Permet de précipiter la fin de la task en cours. */
		precipitateEndTask : function(){
			try{
			if(! this.fBlkHdr) return;
			//On place le content
			this.fBlkHdr.fBlkContent.style.top = this.fTargetTop+"px";
			if(this.fOldMask) {
				scHPS.xSetOpacity(this.fOldMask, this.fOldMask.fOpacity);
			}
			//On suppr le mask du step en cours (pour l'interactivité)
			this.fNewMask.style.display = "none";
			//On affecte le nouvel état.
			this.fBlkHdr.xSetCurrStep(this.fTargetStepIdx);
			this.fPresMgr.xUpdateGui();
			this.fBlkHdr = null;
			this.fTargetStepIdx = -1,
			this.fCycles = -1;
			this.fOldMask = null;
			this.fNewMask = null;
			}catch(e){scCoLib.util.log("ERROR PresMgr.fSwitchStpTask.precipitateEndTask : "+e);}
		}
	},
	/* --- Utilities ---------------------------------------------------------- */
	/** PresMgr.xAddBtn */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		return scHPS.xAddBtn(pParent, this, scHPS.PresMgr.sBtnMgr, pClassName, pCapt, pTitle, pNxtSib);
	}
}
/* --- Static --------------------------------------------------------------- */
/** PresMgr.sOnClickTocLnk : TOC item onclick event - this = link */
scHPS.PresMgr.sOnClickTocLnk = function(){
	this.fPresMgr.loadSlide(this.fSldIdx, true, false);
	return false;
}
/** PresMgr.sShowWait. */
scHPS.PresMgr.sShowWait = function(pMgr){
	if (pMgr.fWaitMsg) pMgr.fWaitMsg.style.visibility = "";
},
/** PresMgr.sHideWait. */
scHPS.PresMgr.sHideWait = function(pMgr){
	if (pMgr.fWaitMsg) pMgr.fWaitMsg.style.visibility = "hidden";
},
/** PresMgr.sHeartbeat : run every second. */
scHPS.PresMgr.sHeartbeat = function(pMgr){
	if (pMgr.fToolHider) pMgr.xHideTools();
},
/** PresMgr.sBtnMgr : Buttons manager - this = button */
scHPS.PresMgr.sBtnMgr = function(){
	var vPresMgr = this.fMgr;
	//scCoLib.util.log("PresMgr.sBtnMgr: "+this.fName);
	switch(this.fName){
		case "btnNxt":
			vPresMgr.next();break;
		case "btnPrv":
			vPresMgr.previous();break;
		case "btnZmCls":
			vPresMgr.xHideZoom();break;
		case "btnModeHtml":
			scHPS.xSwitchToHtmlMode();break;
		case "btnEfcts":
			vPresMgr.enableEffects(true);break;
		case "btnNoEfcts":
			vPresMgr.enableEffects(false);break;
	}
	vPresMgr.xResetFocus();
	return false;
}
/** PresMgr.sHideZoomEnd - this = scHPS.FadeEltTask */
scHPS.PresMgr.sHideZoomEnd = function(){
	this.fElt.fFraHdr = null; 
	this.fElt.fSldHdr = null;
	this.fElt.fSld.innerHTML = "";
	this.fElt.fFrg.innerHTML = "";
	if (scHPS.fNavie8) this.fElt.style.backgroundColor = "";
}

/** == scHPS.SldMgr : Slide manager class ======================================
 * @param pRootPath : slide root path.
 * @param pWin : current window.
 * @param pSldHdr optional : slide handler. */
scHPS.SldMgr = function(pRootPath, pWin, pSldHdr){
	//scCoLib.util.log("New SldMgr");
	try{
		if (!pRootPath) return;
		this.fSldHdr = pSldHdr || pWin.frameElement.fSldHdr;
		if (!this.fSldHdr) return;
		this.fSldHdr.setSldMgr(this);
		this.fRootPath = pRootPath;
		this.fWin = pWin||window;
		if ("scSiLib" in this.fWin) this.fSiLib = this.fWin.scSiLib;
		else throw "scSiLib.js not present in slide window.";
		this.fPresMgr = this.fSldHdr.getPresMgr();
		this.fBindBlks = [];
		// Init constants
		this.fDefaultFontSize = scHPS.fDefaultFontSize;
		this.fBlksPath = scHPS.fBlksPath;
		this.fDefaultAnimStep = scHPS.fDefaultAnimStep;
	}catch(e){scCoLib.util.logError("ERROR SldMgr", e);}
}
scHPS.SldMgr.prototype = {
	/* --- Public ------------------------------------------------------------- */
	/** SldMgr.setBlocksPath */
	setBlocksPath : function(pBlocksPath){
		this.fBlksPath = pBlocksPath;
	},
	/** SldMgr.setDefaultFontSize */
	setDefaultFontSize : function(pDefaultFontSize){
		this.fDefaultFontSize = pDefaultFontSize;
	},
	/** SldMgr.onLoad : Appelé par le presMgr parent, pas par le framework standard scOnLoads. */
	onLoad : function(){
		try{
			//scCoLib.util.log("SldMgr.onLoad");
			var vPresMgr = this.fPresMgr;
			var vSldMgr = this;
			var vBod = this.fWin.document.body;
			if (!this.fRootNode) this.fRootNode = scPaLib.findNode(this.fRootPath, this.fWin.document);
			this.fBlksRoot = scPaLib.findNode(this.fBlksPath, this.fRootNode);
			if (!this.fBlksRoot) throw "Slide block root node not found."
			//Save init table col widths
			var vCols = scPaLib.findNodes("des:col", this.fRootNode);
			for (var i = 0; i < vCols.length; i++) if(!isNaN(vCols[i].width)) vCols[i].fDefaultWidth = vCols[i].width;
			//Set sizes
			this.xFixRatioNormalScreen();
			this.xFixBlocksRootSize();
			//Abonnement au resize
			this.fSiLib.addRule(vBod, this);
			// Si le slide manager est ds une window diff.du presentation manager...
			if (vPresMgr.fOwnerWindow != this.fWin){
				if(scCoLib.isIE) vBod.attachEvent("onmousemove", function(){scHPS.sMouseMgr(vPresMgr)});
				else this.fWin.addEventListener("mousemove", function(){scHPS.sMouseMgr(vPresMgr)},true);
				if(scCoLib.isIE) vBod.attachEvent("onmousedown", function(){scHPS.sMouseMgr(vPresMgr)});
				else this.fWin.addEventListener("mousedown", function(){scHPS.sMouseMgr(vPresMgr)},true);
				if(scCoLib.isIE) vBod.attachEvent("onkeyup", function(){scHPS.sOnKeyUp(vSldMgr.fWin.event,vPresMgr)});
				else this.fWin.addEventListener("keyup", function(pEvt){scHPS.sOnKeyUp(pEvt,vPresMgr)},false);
				if(scCoLib.isIE) vBod.attachEvent("onkeydown", function(){scHPS.sOnKeyDown(vSldMgr.fWin.event,vPresMgr)});
				else this.fWin.addEventListener("keydown", function(pEvt){scHPS.sOnKeyDown(pEvt,vPresMgr)},false);
				if (scHPS.fScreenTouch){
					this.fWin.addEventListener("touchstart", scHPS.sTouchMgr.bind(vPresMgr),true);
					this.fWin.addEventListener("touchmove", scHPS.sTouchMgr.bind(vPresMgr),true);
					this.fWin.addEventListener("touchend", scHPS.sTouchMgr.bind(vPresMgr),true);
					this.fWin.addEventListener("touchcancel", scHPS.sTouchMgr.bind(vPresMgr),true);
				}
			}
		}catch(e){scCoLib.util.logError("ERROR SldMgr.onLoad", e);}
	},
	/** SldMgr.getBlksRoot */
	getBlksRoot : function(){
		return this.fBlksRoot;
	},
	/** SldMgr.getBlksAvailHeight */
	getBlksAvailHeight : function(){
		return this.fBlksRoot.offsetHeight;
	},
	/** SldMgr.getBlksAvailWidth */
	getBlksAvailWidth : function(){
		return this.fBlksRoot.offsetWidth;
	},
	/** SldMgr.getRatioNormalScreen */
	getRatioNormalScreen : function(){
		return this.fRatioNormalScreen;
	},
	/** SldMgr.addBindableBlk : Add a bindable block for processing by onLoad(). */
	addBindableBlk : function(pPath, pOpt, pBkConstructor){
		this.fBindBlks.push({fPath : pPath, fOpt : pOpt, fConst : pBkConstructor});
	},
	/** SldMgr.findOwnerBlk : Retrun the block that is ancestor to the specified element. */
	findOwnerBlk : function(pElt){
		if (pElt == this.fBlksRoot) return pElt;
		var vAncs = [pElt];
		vAncs = vAncs.concat(scPaLib.findNodes("anc:", pElt));
		for(var i=0; i < vAncs.length; i++) if (vAncs[i] == this.fBlksRoot) return vAncs[i-1];
		return null;
	},
	/** SldMgr.bindBlks : bind all blocks (images, animations) in a given root */
	bindBlks : function(pRoot, pHdr){
		//scCoLib.util.log("SldMgr.bindBlks");
		pHdr = pHdr || this.fSldHdr;
		for(var i=0; i < this.fBindBlks.length; i++) this.xBindBlk(this.fBindBlks[i].fPath, this.fBindBlks[i].fOpt, this.fBindBlks[i].fConst, pRoot, pHdr);
	},
	/** SldMgr.onResizedAnc : Api scSiLib. */
	onResizedAnc : function(pOwnerNode, pEvent){
		//Resize du slide.
		if(pEvent.phase==1) {
			this.xFixRatioNormalScreen();
			this.xFixBlocksRootSize();
		} else {
			this.fPresMgr.redrawSlideZone();
		}
	},
	/** SldMgr.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** SldMgr.ruleSortKey : Api scSiLib. */
	ruleSortKey : "AA",

	/* --- Private ------------------------------------------------------------ */
	/** SldMgr.xBindBlk */
	xBindBlk : function(pPath, pOpt, pBkConstructor, pRoot, pHdr){
		pOpt = pOpt || {};
		pOpt.fSldMgr = this;
		pOpt.fHdr = pHdr;
		pRoot = pRoot || this.fBlksRoot;
		var vBlks = scPaLib.findNodes(pPath, pRoot);
		for(var i=0; i < vBlks.length; i++) {
			new pBkConstructor(vBlks[i], pOpt);
		}
	},
	/** SldMgr.xFixBlocksRootSize */
	xFixBlocksRootSize : function(){
		var vBodyH = this.xRootHeight();
		var vTop = this.fBlksRoot.offsetTop;
		this.fBlksRoot.style.height = Math.max(50, vBodyH - vTop)+"px";
	},
	/** SldMgr.xRootHeight */
	xRootHeight : function() {
		return scCoLib.toInt(this.fRootNode.style.pixelWidth || this.fRootNode.offsetHeight);
	},
	/** SldMgr.xRootWidth */
	xRootWidth : function() {
		return scCoLib.toInt(this.fRootNode.style.pixelWidth || this.fRootNode.offsetWidth);
	},
	/** SldMgr.xFixRatioNormalScreen */
	xFixRatioNormalScreen : function(){
		this.fRatioNormalScreen = Math.sqrt(this.xRootHeight() / 600 * this.xRootWidth() / 800);
		var vBaseFontSize = Math.round(this.fRatioNormalScreen * this.fDefaultFontSize);
		this.fRootNode.style.fontSize = vBaseFontSize+"px";
		// Adapt table col width
		var vCols = scPaLib.findNodes("des:col");
		for (var i = 0; i < vCols.length; i++) if(vCols[i].fDefaultWidth) vCols[i].width = Math.round(this.fRatioNormalScreen * vCols[i].fDefaultWidth);
	},

	/* --- Private ------------------------------------------------------------ */
	/** SldMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pFunc, pClassName, pCapt, pTitle, pNxtSib) {
		return scHPS.xAddBtn(pParent, this, pFunc, pClassName, pCapt, pTitle, pNxtSib);
	}
}

/** == scHPS.SldLocalMgr : Local slide manager class ===========================
 * @param pSldHdr : slide handler.
 * @param pRootNode : slide root node. */
scHPS.SldLocalMgr = function(pRootNode,pSldHdr){
	//scCoLib.util.log("New SldLocalMgr");
	try{
		this.fSldHdr = pSldHdr;
		this.fSldHdr.setSldMgr(this);
		this.fRootNode = pRootNode;
		this.fWin = window;
		if ("scSiLib" in this.fWin) this.fSiLib = this.fWin.scSiLib;
		else throw "ERROR : scSiLib.js not present in slide window.";
		this.fPresMgr = this.fSldHdr.getPresMgr();
		this.fBindBlks = [];
		// Init constants
		this.fDefaultFontSize = scHPS.fDefaultFontSize;
		this.fBlksPath = scHPS.fBlksPath;
		this.fDefaultAnimStep = scHPS.fDefaultAnimStep;
	}catch(e){scCoLib.util.logError("ERROR SldLocalMgr", e);}
}
scHPS.SldLocalMgr.prototype = new scHPS.SldMgr();

/* =============================================================================
 * Handlers
 * ========================================================================== */

/** == scHPS.SldHdr : Handler de slide standard. ============================ */
scHPS.SldHdr = function(pSldNode, pIdx, pPresMgr){
	if (!pPresMgr) return;
	//scCoLib.util.log("New SldHdr");
	this.fSldNode = pSldNode;
	this.fSldIdx = pIdx;
	this.fPresMgr = pPresMgr;
	this.fBlksRoot = null;
	this.fIsLoaded = false;
	this.fCurrBlk = null;
	this.fBlkCount = 0;
	this.fFraNode = null;
}
scHPS.SldHdr.prototype = {
	/** SldHdr.initSld */
	initSld : function(){
		//scCoLib.util.log("SldHdr.initSld");
		this.fFraNode = scHPS.xAddElt("iframe", this.fSldNode, "slideFra");
		this.fFraNode.fSldHdr = this;
		this.fCurrBlk = null;
		if(scCoLib.isIE) this.fFraNode.onreadystatechange = scHPS.SldHdr.sOnloadSlide;
		else this.fFraNode.onload = scHPS.SldHdr.sOnloadSlide;
		this.fFraNode.src = this.fPresMgr.fSldUrls[this.fSldIdx];
	},
	/** SldHdr.postOnLoad */
	postOnLoad : function() {
	},
	/** SldHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** SldHdr.setSldMgr */
	setSldMgr : function(pSldMgr) {
		this.fSldMgr = pSldMgr;
	},
	/** SldHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** SldHdr.getFirstBlock */
	getFirstBlock : function() {
		return this.fBlks ? this.fBlks[0] : null;
	},
	/** SldHdr.getLastBlock */
	getLastBlock : function() {
		return this.fBlks ? this.fBlks[this.fBlks.length-1] : null;
	},
	/** SldHdr.getCurrBlk */
	getCurrBlk : function(){
		return this.fCurrBlk;
	},
	/** SldHdr.getCurrBlkIdx */
	getCurrBlkIdx : function(){
		return (this.fCurrBlk?this.fCurrBlk.fIdx:0);
	},
	/** SldHdr.getCurrBlkCounter */
	getCurrBlkCounter : function(){
		if (!this.fCurrBlk) return 0;
		return this.fCurrBlk.fBlkHdr.getCurrBlkCounter ? this.fCurrBlk.fBlkHdr.getCurrBlkCounter() : this.fCurrBlk.fCount;
	},
	/** SldHdr.goToNxt : Navigue à l'intérieur du slide (ie dans les blocks et steps) pour avancer d'un cran. */
	goToNxt : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		var vNxt;
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.goToNxt()) return true;
			vNxt = this.fBlks[this.fCurrBlk.fBlkHdr.fBlkIdx+1];
		} else {
			vNxt = this.fBlks[0];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrBlk, vNxt, "F", false);
			return true;
		}
		return false;
	},
	/** SldHdr.goToPrv : Navigue à l'intérieur du slide (ie dans les blocks et steps) pour reculer d'un cran. */
	goToPrv : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		var vNxt;
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.goToPrv()) return true;
			vNxt = this.fBlks[this.fCurrBlk.fBlkHdr.fBlkIdx-1];
		} else {
			vNxt = this.fBlks[this.fBlks.length-1];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrBlk, vNxt, "L", false);
			return true;
		}
		return false;
	},
	/** SldHdr.hasNext */
	hasNext : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasNext()) return true;
			return this.fCurrBlk.fBlkHdr.fBlkIdx < this.fBlks.length - 1;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.hasPrevious */
	hasPrevious : function(){
		if(this.fCurrBlk) {
			if(this.fCurrBlk.fBlkHdr.hasPrevious()) return true;
			return this.fCurrBlk.fBlkHdr.fBlkIdx > 0;
		} else return this.fBlks.length > 1;
	},
	/** SldHdr.redrawSld */
	redrawSld : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		//On redessine le block en cours et invalide les autres blocks.
		for(var i = 0, vLen = this.fBlks.length; i < vLen; i++) {
			var vBlk = this.fBlks[i];
			if(vBlk === this.fCurrBlk) {
				vBlk.fBlkHdr.redrawBlk();
			} else {
				vBlk.fBlkHdr.invalidateSize();
			}
		}
	},
	/** SldHdr.invalidateSize */
	invalidateSize : function(){
		for(var i = 0; i < this.fBlks.length; i++) {
			this.fBlks[i].fBlkHdr.invalidateSize();
		}
	},
	/** SldHdr.getAvailHeight */
	getAvailHeight : function(){
		return this.fSldMgr.getBlksAvailHeight();
	},
	/** SldHdr.getAvailWidth */
	getAvailWidth : function(){
		return this.fSldMgr.getBlksAvailWidth();
	},
	/** SldHdr.keyMgr */
	keyMgr : function(pCharCode){
		return this.fPresMgr.xKeyMgr(pCharCode);
	},
	/** SldHdr.mouseMgr */
	mouseMgr : function(){
		return scHPS.sMouseMgr(this.fPresMgr);
	},
	/** SldHdr.showZoom */
	showZoom : function(pRes, pOpts){
		return this.fPresMgr.xShowZoom(pRes, pOpts);
	},
	/** SldHdr.hideZoom */
	hideZoom : function(){
		return this.fPresMgr.xHideZoom();
	},
	/** SldHdr.getZoomContainer */
	getZoomContainer : function(pRes){
		return this.fPresMgr.xGetZoomContainer();
	},
	/** SldHdr.getZoomSlide */
	getZoomSlide : function(pRes){
		return this.fPresMgr.xGetZoomSlide();
	},
	/** SldHdr.setCurrBlock */
	setCurrBlock : function(pNewBlock){
		this.fCurrBlk = pNewBlock;
	},
	/** SldHdr.isFirstSld */
	isFirstSld : function(){
		return this.fSldIdx == this.fPresMgr.fFirstLocalIdx;
	},
	/** SldHdr.isZoomSld */
	isZoomSld : function(){
		return false;
	},
	/** SldHdr.isLastSld */
	isLastSld : function(){
		return this.fSldIdx == this.fPresMgr.fSldUrls.length - 1;
	}
}
/** SldHdr.sOnloadSlide : Appelé sur l'event onload de la frame du slide. this == iframe du sld. */
scHPS.SldHdr.sOnloadSlide = function(){
	try{
		if(scCoLib.isIE && this.readyState != "complete") return;
		try{var vSldDoc = this.contentWindow.document;}catch(e){};
		var vSldHdr = this.fSldHdr;
		var vPresMgr = vSldHdr.getPresMgr();
		if (typeof vSldDoc == "undefined") {
			var vAsw = confirm(scHPS.xGetStr(23));
			if (vAsw) scHPS.xSwitchToHtmlMode(true);
			else throw "Unable do access slide document."
		}
		//scCoLib.util.log("SldHdr.sOnloadSlide: "+vSldDoc.title);
		scHPS.swichToSsStyles(vSldDoc);
		
		//Load du SldMgr dans l'iframe.
		var vSubSldMgr = vSldHdr.getSldMgr();
		vSubSldMgr.onLoad();

		// Init Blocks
		vSldHdr.fBlksRoot = vSubSldMgr.getBlksRoot();
		vSldHdr.fBlks = vPresMgr.xInitBlocks(vSldHdr, vSldHdr.fBlksRoot);

		// flag, load ok.
		vSldHdr.fIsLoaded = true;
		vPresMgr.xNotifyListeners("onSldLoad", vSldHdr.fSldNode);
		vSldHdr.postOnLoad();
	} catch(e){scCoLib.util.logError("ERROR SldHdr.sOnloadSlide", e);}
}

/** == scHPS.SldLocalHdr : Handler de slide local : pas d'iframe. =========== */
scHPS.SldLocalHdr = function(pId, pPresMgr){
	//scCoLib.util.log("New SldLocalHdr");
	this.fSldIdx = pId;
	this.fPresMgr = pPresMgr;
	this.fIsLoaded = false;
	this.fCurrBlk = null;
	this.fBlkCount = 0;
}
scHPS.SldLocalHdr.prototype = new scHPS.SldHdr();
/** SldLocalHdr.initSld */
scHPS.SldLocalHdr.prototype.initSld = function(){
	this.fCurrBlk = null;
	//Load 
	var vSubSldMgr = this.getSldMgr();
	vSubSldMgr.onLoad();
	// Init Blocks
	this.fBlksRoot = vSubSldMgr.getBlksRoot();
	this.fBlks = this.fPresMgr.xInitBlocks(this, this.fBlksRoot);
	// flag, load ok.
	this.fIsLoaded = true;
}
/** SldLocalHdr.redrawSld */
scHPS.SldLocalHdr.prototype.redrawSld = function() {
	//On précipite les animations en cours.
	this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
	//On redessine le block en cours.
	if(this.fCurrBlk) this.fCurrBlk.fBlkHdr.redrawBlk();
}
/** SldLocalHdr.getAvailHeight */
scHPS.SldLocalHdr.prototype.getAvailHeight = function(){
	return this.fBlksRoot.offsetHeight;
}
/** SldLocalHdr.getAvailWidth */
scHPS.SldLocalHdr.prototype.getAvailWidth = function(){
	return this.fBlksRoot.offsetWidth;
}

/** == scHPS.SldZoomHdr : Handler de slide en zoom. ========================= */
scHPS.SldZoomHdr = function(pSldNode, pUrl, pPresMgr, pPostLoadFunc){
	//scCoLib.util.log("New SldZoomHdr");
	this.fSldNode = pSldNode;
	this.fSldIdx = -2;
	this.fPresMgr = pPresMgr;
	this.fPostLoadFunc = pPostLoadFunc || function(){};
	this.fSldUrl = pUrl;
	this.fIsLoaded = false;
	this.fCurrBlk = null;
	this.fBlkCount = 0;
}
scHPS.SldZoomHdr.prototype = new scHPS.SldHdr();
/** SldZoomHdr.initSld */
scHPS.SldZoomHdr.prototype.initSld = function(){
	this.fFraNode = scHPS.xAddElt("iframe", this.fSldNode, "slideFra");
	this.fFraNode.fSldHdr = this;
	this.fCurrBlk = null;
	if(scCoLib.isIE) this.fFraNode.onreadystatechange = scHPS.SldHdr.sOnloadSlide;
	else this.fFraNode.onload = scHPS.SldHdr.sOnloadSlide;
	this.fFraNode.src = this.fSldUrl;
	var vPresMgr = this.fPresMgr;
	vPresMgr.fWaitProc = window.setTimeout(function(){scHPS.PresMgr.sShowWait(vPresMgr)}, 800);
}
/** SldZoomHdr.postOnLoad */
scHPS.SldZoomHdr.prototype.postOnLoad = function() {
	this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrBlk, this.getFirstBlock(), "F", true);
	this.fPostLoadFunc();
	if (this.fPresMgr.fWaitProc) window.clearTimeout(this.fPresMgr.fWaitProc);
	scHPS.PresMgr.sHideWait(this.fPresMgr);
}
scHPS.SldZoomHdr.prototype.isZoomSld = function() {
	return true;
}

/** == scHPS.FraZmHdr : Handler d'url dans une iframe en zoom. ============== */
scHPS.FraZmHdr = function(pNode, pUrl, pPresMgr, pPostLoadFunc){
	//scCoLib.util.log("New FraZmHdr");
	this.fZmNode = pNode;
	this.fPresMgr = pPresMgr;
	this.fPostLoadFunc = pPostLoadFunc || function(){};
	this.fUrl = pUrl;
	this.fIsLoaded = false;
	this.fCurrBlk = null;
}
/** FraZmHdr.init */
scHPS.FraZmHdr.prototype.init = function(){
	this.fFraNode = scHPS.xAddElt("iframe", this.fZmNode, "slideFra");
	this.fFraNode.fFraHdr = this;
	this.fCurrBlk = null;
	if(scCoLib.isIE) this.fFraNode.onreadystatechange = scHPS.FraZmHdr.sOnLoad;
	else this.fFraNode.onload = scHPS.FraZmHdr.sOnLoad;
	this.fFraNode.src = this.fUrl;
	var vPresMgr = this.fPresMgr;
	vPresMgr.fWaitProc = window.setTimeout(function(){scHPS.PresMgr.sShowWait(vPresMgr)}, 800);
}
/** FraZmHdr.sOnLoad : Appelé sur l'event onload de la frame. this == iframe. */
scHPS.FraZmHdr.sOnLoad = function() {
	try{
		if(scCoLib.isIE && this.readyState != "complete") return;
		if(this.fIsLoaded) return;
		//scCoLib.util.log("FraZmHdr.sOnLoad");
		this.fIsLoaded = true;
		var vFraHdr = this.fFraHdr;
		vFraHdr.fPostLoadFunc();
		if (vFraHdr.fPresMgr.fWaitProc) window.clearTimeout(vFraHdr.fPresMgr.fWaitProc);
		scHPS.PresMgr.sHideWait(vFraHdr.fPresMgr);
	} catch(e){scCoLib.util.logError("ERROR FraZmHdr.sOnLoad", e);}
}

/** == scHPS.BlkHdr : Handler de blocks dans un slide. ====================== */
scHPS.BlkHdr = function(pParentHdr, pBlkNode, pBlkIdx){
	//scCoLib.util.log("New BlkHdr : "+pBlkNode.firstChild.className);
	if (pBlkNode.fHasHandeler) throw "Block already part of a handeler.";
	pBlkNode.fHasHandeler = true;
	this.fParentHdr = pParentHdr;
	this.fBlkNode = pBlkNode;
	this.fBlkIdx = pBlkIdx;
	this.fPresMgr = this.fParentHdr.getPresMgr();
	this.fSldMgr = this.fParentHdr.getSldMgr();
	this.fBlkContent = scPaLib.findNode(this.fPresMgr.fBlkCoPathComp, this.fBlkNode);
	if (!this.fBlkContent) {
		throw "Block content node not found."
	}
	//Init du positionnement
	this.xResetSizeStepsAndBlocks();
	//Init des blocks dans le content de cet handeler
	this.fParentHdr.getSldMgr().bindBlks(this.fBlkContent, this);
	/** n° de l'étape en cours. */
	this.fCurrStep = -1;
	// Recherche de tous les points de coupe possibles.
	var vSteps = [this.fBlkContent].concat(scPaLib.findNodes("des:"+this.fPresMgr.fCutableFilter, this.fBlkContent));
	this.fAllSteps = [];
	this.fForcedSteps = [];
	for (var i = 0; i < vSteps.length; i++) {
		var vStep = vSteps[i];
		var vLastStep = null;
		if(!scPaLib.findNode("anc:"+this.fPresMgr.fUncutableFilter,vStep)){
			// On ne prend pas en compte ceux qui sont contenus dans un élément "Uncutable"
			if(this.fAllSteps.length > 0) vLastStep = this.fAllSteps[this.fAllSteps.length-1];
			vStep.fOpacityPrv = vStep.getAttribute("data-mask-opacity-prv") || scHPS.fStepMaskOpacityPrv;
			vStep.fOpacityNxt = vStep.getAttribute("data-mask-opacity-nxt") || scHPS.fStepMaskOpacityNxt;
			if(scPaLib.checkNode(this.fPresMgr.fFixedHeightFilterComp,vStep)) vStep.fFixedHeight = true;
			if(scPaLib.checkNode(this.fPresMgr.fForcedCutFilterComp,vStep)) {
				vStep.fForced = true;
				vStep.fForcedMask = true;
				this.fForcedSteps.push(vLastStep); 
			}
			if (!vLastStep || vStep.offsetTop > vLastStep.offsetTop){
				this.fAllSteps.push(vStep);
			} else if (vLastStep && vStep.offsetTop == vLastStep.offsetTop && !vLastStep.fForced){
				this.fAllSteps.pop();
				this.fAllSteps.push(vStep);
			}
		}
	}
	if (this.fForcedSteps.length > 0){
		// On flag tout step directement après un forced step également en forced
		for (var i = this.fAllSteps.length-1; i >0 ; i--) {
			if (this.fAllSteps[i-1].fForced) this.fAllSteps[i].fForced = true;
		}
	}
	if (this.fAllSteps.length < 2) this.fAllSteps = null;
	// Calcul des étapes en fonction de l'espace disponible.
	this.xPlanSteps();
	// Centre le block dans son container
	this.xCenterBlock();
	this.fNeedResize = false;
}
scHPS.BlkHdr.prototype = {
	/** BlkHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** BlkHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** BlkHdr.redrawBlk : Redraw suite à un resize. Le block est en cours... */
	redrawBlk : function(){
		//scCoLib.util.log("BlkHdr.redrawBlk");
		//On précipite les animations en cours sur le steps.
		this.fPresMgr.fSwitchStpTask.precipitateEndTask();
		//On mémorise la situation
		var vPreviousFocusNode = this.fSteps ? this.fSteps[this.fCurrStep] : null;
		//On efface tout positionnement précédent
		this.xResetSizeStepsAndBlocks();
		//On replanifie les steps
		this.xPlanSteps();
		//On recherche la step à afficher
		if(this.fSteps) {
			//Par défaut, step 0.
			this.fCurrStep = 0;
			if(vPreviousFocusNode) {
				//Recherche directe dans le tableau des nouvelles steps
				for(var i=this.fSteps.length-1; i >= 0; i--) {
					if(vPreviousFocusNode==this.fSteps[i]) {
						this.fCurrStep = i;
						break;
					}
				}
				if(this.fCurrStep==-1) {
					//Pas trouvé, on recherche vPreviousFocusNode dans toutes les steps
					var vFirstFocusIdx = -1;
					for(var i=this.fAllSteps.length-1; i >= 0; i--) {
						if(vPreviousFocusNode==this.fAllSteps[i]) {
							vFirstFocusIdx = i;
							break;
						}
					}
					if(vFirstFocusIdx != -1) {
						search:
						for(var i=vFirstFocusIdx-1; i >= 0; i--) {
							var vStep = this.fAllSteps[i];
							for(var j=this.fSteps.length-1; j >= 0; j--) {
								if(vStep==this.fSteps[j]) {
									//On a trouvé la l'étape qui contient vPreviousFocusNode
									this.fCurrStep = j;
									break search;
								}
							}
						}
					}
				}
			}
		} else this.fCurrStep = -1;
		// Centre le block dans son container
		this.xCenterBlock();
		// Resize ok
		this.fNeedResize = false;
		//On resize et redessine le block
		this.fPresMgr.fSwitchBlkTask.initTask(this.fBlkNode, this.fBlkNode, "S", true);
	},
	/** BlkHdr.invalidateSize : Invalide la taille du block. Le block n'est pas actif. */
	invalidateSize : function(){
		this.fNeedResize = true;
	},
	/** BlkHdr.fixSizeAndTarget : Calcul les dimensions du block si nécessaire et redessine les steps du block terminal (appelé par la BlkTask)
	 * @param pTarget Block/Step cible à afficher
	 * 			"F" : First
	 * 			"L" : Last
	 * 			"S" : Same : redraw suite à resize. */
	fixSizeAndTarget : function(pTarget){
		if(this.fNeedResize) {
			// Reset
			this.xResetSizeStepsAndBlocks();
			// Calcul des étapes en fonction de l'espace disponible.
			this.xPlanSteps();
			// Centre le block dans son container
			this.xCenterBlock();
			// Flag ok
			this.fNeedResize = false;
		}
		//Redraw sans animation des steps du block.
		this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, pTarget, true);
	},
	/** BlkHdr.goToNxt : Step suivant */
	goToNxt : function(){
		return this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, "N", false);
	},
	/** BlkHdr.goToPrv : Step précédent */
	goToPrv : function(){
		return this.fPresMgr.fSwitchStpTask.initTask(this.fBlkNode, "P", false);
	},
	/** BlkHdr.hasNext */
	hasNext : function(){
		if (this.fSteps) return this.fCurrStep < this.fSteps.length -1;
		else return false;
	},
	/** BlkHdr.hasPrevious */
	hasPrevious : function(){
		return this.fCurrStep > 0;
	},
	/** BlkHdr.getAvailHeight */
	getAvailHeight : function(){
		return this.fParentHdr.getAvailHeight() - this.fContentHeightDelta;
	},
	/** BlkHdr.getAvailWidth */
	getAvailWidth : function(){
		return this.fBlkContent.offsetWidth;
	},
	/** BlkHdr.xResetSizeStepsAndBlocks : Reset les step à afficher. */
	xResetSizeStepsAndBlocks : function(){
		var vBlkNodeStyle = this.fBlkNode.style;
		var vParentContentStyle = this.fBlkContent.parentNode.style;
		vBlkNodeStyle.fontSize="";
		vBlkNodeStyle.top = "";
		vBlkNodeStyle.left = "";
		vBlkNodeStyle.right = "";
		vParentContentStyle.overflow= "";
		vParentContentStyle.height= "";
		var vBlkContentStyle = this.fBlkContent.style;
		vBlkContentStyle.position = "";
		vBlkContentStyle.top = "";
		vBlkContentStyle.width = "";
		vBlkContentStyle.fontSize = "";
		this.fSteps = null;
		this.fContentHeightDelta = this.fBlkNode.offsetHeight - this.fBlkContent.offsetHeight;
	},
	/** BlkHdr.xPlanSteps : Planifie les step à afficher. */
	xPlanSteps : function(){
		this.fSteps = null;
		var vBlkContentStyle = this.fBlkContent.style;
		var vParentContentStyle = this.fBlkContent.parentNode.style;
		var vHasForcedSteps = this.fForcedSteps.length > 0;
		var vAvailH = this.fParentHdr.getAvailHeight();
		//scCoLib.util.log("BlkHdr.xPlanSteps - vAvailH="+vAvailH);
		var vRealH = this.fBlkNode.offsetHeight;
		if(vRealH < vAvailH && !vHasForcedSteps) {
			//Pas besoin de créer des steps
			this.xRemoveMasks();
			return;
		}
		//On tente un léger resize de la font
		if(vRealH > vAvailH) {
			var vFontSize = 85;
			vBlkContentStyle.fontSize = vFontSize + "%";
			vRealH = this.fBlkNode.offsetHeight;
			if(vRealH < vAvailH && !vHasForcedSteps) {
				//Pas besoin de créer des steps
				this.xRemoveMasks();
				return;
			}
		}
		//Si pas de steps, on tente de garantir que le 100% du contenu sera affiché à l'écran.
		if(!this.fAllSteps || this.fAllSteps.length==1) {
			while (vFontSize > 10 && vRealH > vAvailH){
				vFontSize -=1;
				vBlkContentStyle.fontSize = vFontSize + "%";
				vRealH = this.fBlkNode.offsetHeight;
			}
			//scCoLib.util.log("Single step FontSize="+vFontSize);
			return;
		}
		//On crée les steps (si on a des marqueurs)
		//On fige les dimensions du content du block
		var vContentH = Math.max(20, this.getAvailHeight());
		//scCoLib.util.log("BlkHdr.xPlanSteps - vContentH="+vContentH);
		vBlkContentStyle.position = "absolute";
		vBlkContentStyle.width = "100%";
		vBlkContentStyle.top = "0px";
		vParentContentStyle.overflow = "hidden";
		vParentContentStyle.height = vContentH+"px";
		//On tente de garantir que le 100% du contenu sera affiché à l'écran.
		while (vFontSize > 10 && this.xGetMaxStepHeight() > vContentH){
			vFontSize -=1;
			vBlkContentStyle.fontSize = vFontSize + "%";
		}
		//scCoLib.util.log("Multi step vFontSize="+vFontSize);
		//Le 1er step est nécessairement le content du block
		this.fSteps = [this.fAllSteps[0]];
		//Sélection des steps
		var vPreviousTop = 0;
		var vPreviousAllStepsIdx = -1;
		var vTotalSteps = this.fAllSteps.length;
		//Fonction de calcul du score de chaque point de coupe
		var vBlkContent = this.fBlkContent;
		var vPresMgr = this.fPresMgr;
		function score(pNode){
			try{
				var vTop = pNode.offsetTop;
				var vH = vTop - vPreviousTop;
				if(vH > vContentH) return -1;
				//Malus en fonction de la profondeur de cuttable au dessus
				var vP = pNode.parentNode;
				while(vP != vBlkContent) {
					if(scPaLib.checkNode(vPresMgr.fCutableFilterComp, vP)) vH *= .7;
					vP = vP.parentNode;
				}
				//Malus si le dernier step devient plus petit que celui-là
				if( vRealH - vTop < vTop - vPreviousTop) vH -= (vContentH - (vRealH - vTop))/2;
				return 1000000 + vH;
			}catch(e){scCoLib.util.log("WARNING : BlkHdr.xPlanSteps.score : "+e);}
		}
		do {
			var vBestScore = -1;
			var vBestIdx = -1;
			for(var i = vPreviousAllStepsIdx+1; i<vTotalSteps; i++) {
				if (this.fAllSteps[i].fForced){
					vBestIdx = i;
					break;
				}
				var vScore = score(this.fAllSteps[i]);
				if(vScore > vBestScore) {
					vBestScore = vScore;
					vBestIdx = i;
				} else if(vScore<0) {
					//si <0 : hors zone visible.
					break;
				}
			}
			if(vBestIdx>=0) {
				var vNode = this.fAllSteps[vBestIdx];
				this.fSteps.push(vNode);
				vPreviousTop = vNode.offsetTop;
				vPreviousAllStepsIdx = vBestIdx;
			}
		} while(vBestIdx>=0 && (vRealH-vPreviousTop > vContentH || vHasForcedSteps));
		//scCoLib.util.log("number of steps="+this.fSteps.length);
		//On crée le tableau des masks
		if(! this.fMasks) this.fMasks = [];
		//On crée autant de masks que de steps
		var vBgColor = scHPS.xReadStyle(this.fBlkContent, "backgroundColor") || "white";
		if(vBgColor=="transparent" || vBgColor.search(/rgba\([0-9 ]*,[0-9 ]*,[0-9 ]*,\s?0\s?\)/)>-1) vBgColor = scHPS.xReadStyle(this.fBlkNode, "backgroundColor") || "white";
		if(vBgColor=="transparent" || vBgColor.search(/rgba\([0-9 ]*,[0-9 ]*,[0-9 ]*,\s?0\s?\)/)>-1) vBgColor = "white";
		for(var i = this.fMasks.length; i < this.fSteps.length; i++) {
		var vStep = this.fSteps[i];
			var vMask = scHPS.xAddElt("div", this.fBlkContent, "ssMask "+(vStep.fForcedMask ? "ssForced" : ""));
			vMask.style.position = "absolute";
			vMask.style.left = "0px";
			vMask.style.width = "100%";
			vMask.style.height = "0px";
			vMask.style.backgroundColor = vBgColor;
			vMask.fOpacityPrv = vStep.fOpacityPrv;
			vMask.fOpacityNxt = vStep.fOpacityNxt;
			scHPS.xStartOpacityEffect(vMask,1);
			//if (scCoLib.isIE) vMask.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
			this.fMasks[i] = vMask;
		}
		//On purge les masks en trop
		for(var i = this.fSteps.length; i < this.fMasks.length; i++) {
			this.fBlkContent.removeChild(this.fMasks[i]);
		}
		this.fMasks.length = this.fSteps.length;
		//On place les masks.
		var vPreviousBottom = 0;
		var vLastIdx = this.fSteps.length - 1;
		for(var i = 0; i <= vLastIdx; i++) {
			var vMask = this.fMasks[i];
			var vNextTop = i < vLastIdx ? this.fSteps[i+1].offsetTop : this.fBlkContent.offsetHeight;
			vMask.style.top = vPreviousBottom+"px";
			vMask.style.height = (vNextTop - vPreviousBottom)+"px";
			vMask.style.display="";
			scHPS.xSetOpacity(vMask, vMask.fOpacityNxt);
			vPreviousBottom = vNextTop;
		}
	},
	/** BlkHdr.xGetMaxStepHeight */
	xGetMaxStepHeight : function(){
		var vMaxStepHeight = 0;
		for(var i = 0; i<this.fAllSteps.length; i++) {
			if(!this.fAllSteps[i].fFixedHeight) vMaxStepHeight = Math.max(vMaxStepHeight, (i==this.fAllSteps.length-1 ? this.fAllSteps[i].offsetHeight : this.fAllSteps[i+1].offsetTop - (i>0 ? this.fAllSteps[i].offsetTop : 0)));
			//scCoLib.util.log("xGetMaxStepHeight "+i+" vMaxStepHeight="+vMaxStepHeight);
		}
		return vMaxStepHeight;
	},
	/** BlkHdr.xCenterBlock */
	xCenterBlock : function() {
		var vParentHdr = this.fParentHdr;
		var vAvailH = vParentHdr.getAvailHeight();
		var vW = this.fBlkNode.offsetWidth;
		var vH = this.fBlkNode.offsetHeight;
		var vMargin = 0;
		if(vH < vAvailH) {
			var vAvailW = vParentHdr.getAvailWidth();
			if(vAvailW > scHPS.fBlkMinWidth) {
				vMargin = Math.round(Math.min( vAvailW * scHPS.fBlkMaxMargin * (1 - vH / vAvailH), (vAvailW - scHPS.fBlkMinWidth)/2));
			}
		}
		this.fBlkNode.style.left = vMargin + "px";
		this.fBlkNode.style.right = vMargin + "px" ;
		vAvailH = vParentHdr.getAvailHeight();
		vH = this.fBlkNode.offsetHeight;
		if(vH < vAvailH) {
			this.fBlkNode.style.top = Math.round( (vAvailH-vH) * scHPS.fBlkTopSpace)+"px";
		}
	},
	/** BlkHdr.xSetCurrStep : affecte la step stabilisée (appelé par fSwitchStpTask) */
	xSetCurrStep : function(pCurrStep){
		this.fCurrStep = pCurrStep;
	},
	/** BlkHdr.xRemoveMasks : supprime tous les masks d'un block. */
	xRemoveMasks : function(){
		if(!this.fMasks) return;
		for(var i = this.fMasks.length-1; i >=0; i--) {
			this.fBlkContent.removeChild(this.fMasks[i]);
		}
		this.fMasks = null;
	}
}
/** == scHPS.BlkCoHdr : Handler de blocks de type container de sous-blocks. = */
scHPS.BlkCoHdr = function(pParentHdr, pBlkCoNode, pBlkIdx){
	//scCoLib.util.log("New BlkCoHdr : "+pBlkCoNode.firstChild.className);
	if (pBlkCoNode.fHasHandeler) throw "Container block already part of a handeler.";
	pBlkCoNode.fHasHandeler = true;
	this.fParentHdr = pParentHdr;
	this.fBlkNode = pBlkCoNode;
	this.fBlkIdx = pBlkIdx;
	this.fPresMgr = this.fParentHdr.getPresMgr();
	this.fSldMgr = this.fParentHdr.getSldMgr();
	// Racine des blocks du/des container(s).
	this.fBlksRoot = scPaLib.findNode(this.fPresMgr.fCoBlocksRootPathComp, this.fBlkNode);
	if (!this.fBlksRoot) throw "Container block root node not found.";
	this.fAltBlksRoot = scPaLib.findNode(this.fPresMgr.fCoAltBlocksRootPathComp, this.fBlksRoot);
	// Fixe les dim du/des container(s)
	this.xFixContainerSize();
	// Init les blocks de ce container
	this.fSubBlocks = this.fPresMgr.xInitBlocks(this, this.fBlksRoot);
	// Init alternative blocs
	if (this.fAltBlksRoot) {
		this.fAltBlocks = this.fPresMgr.xInitBlocks(this, this.fAltBlksRoot);
		this.fBtnAltCls = this.fPresMgr.xAddBtn(this.fAltBlksRoot, "btnZmCls", scHPS.xGetStr(4), scHPS.xGetStr(4));
		this.fBtnAltCls.fBlkCoHdr = this;
		this.fBtnAltCls.onclick = function(){this.fBlkCoHdr.closeAlt(); return false;};
		this.fBtnAltCls.style.visibility="hidden";
		var vAltMenuItems = scPaLib.findNodes(this.fPresMgr.fCoAltBlocksMenuPathComp, this.fBlkNode);
		if (vAltMenuItems.length != this.fAltBlocks.length) throw "Container alternative block menu not found.";
		for (var i=0; i<vAltMenuItems.length; i++){
			var vAltMenuItem = vAltMenuItems[i];
			vAltMenuItem.fBlkCoHdr = this;
			vAltMenuItem.fIdx = i;
			vAltMenuItem.onclick = function(){this.fBlkCoHdr.goToAlt(this.fIdx); return false;};
		}
	}
	this.fAltBlockAct = false;
	// Sous-bloc en cours.
	this.fCurrSubBlk = null;
}
scHPS.BlkCoHdr.prototype = {
	/** BlkCoHdr.getPresMgr */
	getPresMgr : function() {
		return this.fPresMgr;
	},
	/** BlkHdr.getSldMgr */
	getSldMgr : function() {
		return this.fSldMgr;
	},
	/** BlkCoHdr.getFirstBlock */
	getFirstBlock : function() {
		return this.fSubBlocks ? this.fSubBlocks[0] : null;
	},
	/** BlkCoHdr.getLastBlock */
	getLastBlock : function() {
		return this.fSubBlocks ? this.fSubBlocks[this.fSubBlocks.length-1] : null;
	},
	/** BlkCoHdr.getCurrBlk */
	getCurrBlk : function(){
		return this.fCurrSubBlk;
	},
	/** SldHdr.getCurrBlkIdx */
	getCurrBlkIdx : function(){
		return (this.fCurrSubBlk?this.fCurrSubBlk.fIdx:0);
	},
	/** SldHdr.getCurrBlkCounter */
	getCurrBlkCounter : function(){
		if (!this.fCurrSubBlk) return 0;
		return this.fCurrSubBlk.fBlkHdr.getCurrBlkCounter ? this.fCurrSubBlk.fBlkHdr.getCurrBlkCounter() : this.fCurrSubBlk.fCount;
	},
	/** BlkCoHdr.setCurrBlock */
	setCurrBlock : function(pNewBlock){
		this.fCurrSubBlk = pNewBlock;
	},
	/** BlkCoHdr.goToNxt : Navigue à l'intérieur du container pour avancer d'un cran. */
	goToNxt : function(){
		var vNxt;
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.goToNxt()) return true;
			if (this.closeAlt()) return true;
			vNxt = this.fSubBlocks[this.fCurrSubBlk.fBlkHdr.fBlkIdx+1];
		} else {
			vNxt = this.fSubBlocks[0];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, vNxt, "F", false);
			return true;
		}
		return false;
	},
	/** BlkCoHdr.goToPrv : Navigue à l'intérieur du container pour reculer d'un cran. */
	goToPrv : function(){
		var vNxt;
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.goToPrv()) return true;
			if (this.closeAlt()) return true;
			vNxt = this.fSubBlocks[this.fCurrSubBlk.fBlkHdr.fBlkIdx-1];
		} else {
			vNxt = this.fSubBlocks[this.fSubBlocks.length-1];
		}
		if(vNxt) {
			this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, vNxt, "L", false);
			return true;
		}
		return false;
	},
	/** BlkCoHdr.closeAlt : ferme le block alternatif en cours. */
	closeAlt : function(){
		if (!this.fAltBlockAct) return false;
		this.fBtnAltCls.style.visibility="hidden";
		this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, this.fPausedSubBlk, "F", false);
		this.fAltBlockAct = false;
		return true;
	},
	/** BlkCoHdr.goToAlt : démarre un block alternatif. */
	goToAlt : function(pIdx){
		if(!this.fAltBlksRoot) return false;
		if(this.fAltBlockAct){
		} else {
			this.fPausedSubBlk = this.fCurrSubBlk;
			this.fBtnAltCls.style.visibility="";
		}
		this.fPresMgr.fSwitchBlkTask.initTask(this.fCurrSubBlk, this.fAltBlocks[pIdx], "F", false);
		this.fAltBlockAct = true;
	},
	/** BlkCoHdr.hasNext */
	hasNext : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasNext()) return true;
			return this.fCurrSubBlk.fBlkHdr.fBlkIdx < this.fSubBlocks.length - 1;
		} else return this.fSubBlocks.length > 1;
	},
	/** BlkCoHdr.hasPrevious */
	hasPrevious : function(){
		if(this.fCurrSubBlk) {
			if(this.fCurrSubBlk.fBlkHdr.hasPrevious()) return true;
			return this.fCurrSubBlk.fBlkHdr.fBlkIdx > 0;
		} else return this.fSubBlocks.length > 1;
	},
	/** BlkCoHdr.redrawBlk */
	redrawBlk : function(){
		//On précipite les animations en cours.
		this.fPresMgr.fSwitchBlkTask.precipitateEndTask();
		//On redessine le block en cours et invalide les autres blocks.
		for(var i = 0, vLen = this.fSubBlocks.length; i < vLen; i++) {
			var vBlk = this.fSubBlocks[i];
			if(vBlk === this.fCurrSubBlk) {
				vBlk.fBlkHdr.redrawBlk();
			} else {
				vBlk.fBlkHdr.invalidateSize();
			}
		}
	},
	/** BlkCoHdr.invalidateSize : Invalide la taille du block. Le block n'est pas actif. */
	invalidateSize : function(){
		for(var i = 0, vLen = this.fSubBlocks.length; i < vLen; i++) {
			this.fSubBlocks[i].fBlkHdr.invalidateSize();
		}
		this.fNeedResize = true;
	},
	/** BlkCoHdr.fixSizeAndTarget : Calcul les dimensions du block si nécessaire et redessine les sous-blocs et les steps du block terminal (appelé par la BlkTask)
	 * @param pTarget Block/Step cible à afficher
	 * 			"F" : First
	 * 			"L" : Last
	 * 			"S" : Same : redraw suite à resize. */
	fixSizeAndTarget : function(pTarget){
		if(this.fNeedResize) this.xFixContainerSize();
		var vNewSubBlk;
		switch(pTarget) {
			case "F" : {
				vNewSubBlk = this.getFirstBlock();
				break;
			}
			case "L" : {
				vNewSubBlk = this.getLastBlock();
				break;
			}
			case "S" : {
				vNewSubBlk = this.fCurrSubBlk;
				break;
			}
		}
		if(vNewSubBlk) {
			//Gestion de l'affichage instantanné des sous-blocs.
			if(this.fCurrSubBlk && this.fCurrSubBlk !== vNewSubBlk) {
				scHPS.xEndOpacityEffect(this.fCurrSubBlk, 0);
			}
			scHPS.xEndOpacityEffect(vNewSubBlk, 1);
			vNewSubBlk.fBlkHdr.fixSizeAndTarget(pTarget);
			this.setCurrBlock(vNewSubBlk);
		}
	},
	/** BlkCoHdr.getAvailHeight : Hauteur disponible pour les fils de ce container. */
	getAvailHeight : function(){
		return this.fBlksRoot.offsetHeight;
	},
	/** BlkCoHdr.getAvailWidth : Largeur disponible pour les fils de ce container. */
	getAvailWidth : function(){
		return this.fBlksRoot.offsetWidth;
	},
	/** BlkCoHdr.xFixContainerSize : Fixe la taille du container dans son contexte parent. */
	xFixContainerSize : function(){
		var vAvailH = this.fParentHdr.getAvailHeight();
		this.fBlksRoot.style.height = Math.max(50, vAvailH - this.fBlksRoot.offsetTop)+"px";
		this.fNeedResize = false;
	}
}

/* =============================================================================
 * Blocks
 * ========================================================================== */

/** == scHPS.AnimBlk : Animation Block class ================================= */
scHPS.AnimBlk = function(pElt, pOpt){
	if(!pElt) return;
	//var vMgr = this;
	//scCoLib.util.log("New AnimBlk");
	this.fOpt = pOpt || {};
	this.fOpt.autoStart = (typeof this.fOpt.autoStart == "undefined" ? true : this.fOpt.autoStart);
	this.fOpt.hideToolbar = (typeof this.fOpt.hideToolbar == "undefined" ? true : this.fOpt.hideToolbar);
	this.fOpt.counter = (typeof this.fOpt.counter == "undefined" ? false : this.fOpt.counter);
	this.fOpt.loop = (typeof this.fOpt.loop == "undefined" ? true : this.fOpt.loop);
	this.fOpt.soft = (typeof this.fOpt.soft == "undefined" ? true : this.fOpt.soft);
	this.fOpt.animStep = (typeof this.fOpt.animStep == "undefined" ? (this.fSldMgr && this.fSldMgr.fDefaultAnimStep ? this.fSldMgr.fDefaultAnimStep : scHPS.fDefaultAnimStep) : this.fOpt.animStep);
	this.fSldMgr = pOpt.fSldMgr;
	this.fPresMgr = this.fSldMgr.fPresMgr;
	this.fSsClassPrefix = (this.fSldMgr && this.fSldMgr.fSsClassPrefix ? this.fSldMgr.fSsClassPrefix : scHPS.fSsClassPrefix);
	this.fIdx = -1;
	this.fRateOld = [.9, .8, .7, .6, .5, .4, .3, .2, .1];
	this.fRateNew = [.1, .2, .3, .4, .5, .6, .7, .8, .9];
	this.fNxtSwitchTime = ( Date.now  ? Date.now() : new Date().getTime() ) + this.fOpt.animStep;
	this.fEndTime = this.fNxtSwitchTime + 100;
	this.fImgs = scPaLib.findNodes(this.fPathImgs, pElt);
	if (!this.fImgs || this.fImgs.length==0) return;
	for (var i = 0; i < this.fImgs.length; i++) {
		this.fImgs[i].style.position = "absolute";
		this.fImgs[i].style.visibility = "hidden";
		this.fImgs[i].fRank = i+1;
		this.fImgs[i].fPrvImg = this.fImgs[(i > 0 ? i-1 : this.fImgs.length - 1)];
		this.fImgs[i].fNxtImg = this.fImgs[(i < this.fImgs.length - 1 ? i+1 : 0)];
		if (i == this.fImgs.length - 1) this.fImgs[i].fLast = true;
	}
	this.fCurrImg = this.fImgs[0];
	this.fNxtImg = this.fCurrImg.fNxtImg;
	if (this.fOpt.autoStart){
		scHPS.xStartOpacityEffect(this.fCurrImg, 1);
		scHPS.xStartOpacityEffect(this.fNxtImg, 0);
	} else{
		this.fCurrImg.style.visibility = "";
	}
	pElt.fImgs = this.fImgs;
	pElt.style.width="100%";
	pElt.fStart = scHPS.xAddElt("div",pElt,this.fSsClassPrefix + "AnmStart");
	pElt.fStart.onclick = scHPS.AnimBlk.sBtnPly;
	pElt.fStart.fMgr = this;
	pElt.fStart.onmousemove = function() {scHPS.AnimBlk.sShowCtrl(pElt)};
	pElt.fCtrl = scHPS.xAddElt("div",pElt,this.fSsClassPrefix + "AnmCtrl");
	pElt.fBtnPrv = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPrv,this.fSsClassPrefix+"AnmBtnPrv",scHPS.xGetStr(14),scHPS.xGetStr(15));
	pElt.fBtnPly = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPly,this.fSsClassPrefix+"AnmBtnPly",scHPS.xGetStr(18),scHPS.xGetStr(19));
	pElt.fBtnPly.style.display = this.fOpt.autoStart ? "none" : "";
	pElt.fBtnPse = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnPse,this.fSsClassPrefix+"AnmBtnPse",scHPS.xGetStr(20),scHPS.xGetStr(21));
	pElt.fBtnPse.style.display = this.fOpt.autoStart ? "" : "none";
	pElt.fBtnNxt = scHPS.xAddBtn(pElt.fCtrl,this,scHPS.AnimBlk.sBtnNxt,this.fSsClassPrefix+"AnmBtnNxt",scHPS.xGetStr(16),scHPS.xGetStr(17));
	if (this.fOpt.counter){
		var vCounter = scHPS.xAddElt("span",pElt.fCtrl,this.fSsClassPrefix + "Counter");
		vCounter.innerHTML = " / "+this.fImgs.length;
		this.fImgRank = scHPS.xAddElt("span",vCounter,this.fSsClassPrefix + "Rank", null, null, vCounter.firstChild);
		this.fImgRank.innerHTML = "1";
	}
	pElt.fCtrl.style.visibility = this.fOpt.hideToolbar ? "hidden" : "";
	pElt.fCtrl.fOn = !this.fOpt.hideToolbar;
	pElt.onmouseover = function() {scHPS.AnimBlk.sShowCtrl(pElt)};
	this.fElt = pElt;
	pElt.fAnimBlk = this;
	this.fPlyMode = this.fOpt.autoStart ? 2 : 0;
	this.fNxtPlyMode = this.fOpt.autoStart ? 2 : 0;
	this.fSldMgr.fSiLib.addRule(pElt, this);
	scTiLib.addTaskNow(this);
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.AnimBlk.prototype = {
	fPathImgs : scPaLib.compilePath("chi:"),
	/** AnimBlk.onResizedAnc : Api scSiLib. */
	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase==1) {
			try{
				var vMaxHeight = 0;
				var i;
				for (var i = 0; i < pOwnerNode.fImgs.length; i++){
					vMaxHeight = Math.max(vMaxHeight,pOwnerNode.fImgs[i].clientHeight);
				}
				for (var i = 0; i < pOwnerNode.fImgs.length; i++){
					pOwnerNode.fImgs[i].style.marginTop = (vMaxHeight - pOwnerNode.fImgs[i].clientHeight) / 2 + "px"
					pOwnerNode.fImgs[i].style.marginLeft = (pOwnerNode.clientWidth - pOwnerNode.fImgs[i].clientWidth) / 2 + "px"
				}
				pOwnerNode.style.height=vMaxHeight + "px";
			}catch(e){scCoLib.util.logError("ERROR AnimBlk.onResizedAnc", e);}
		}
	},
	/** AnimBlk.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** AnimBlk.ruleSortKey : Api scSiLib. */
	ruleSortKey : "B",
	/** AnimBlk.setNxtPlyMode. */
	setNxtPlyMode : function(){
		if (!this.fOpt.loop && this.fCurrImg.fLast && this.fPlyMode == 2) scHPS.AnimBlk.sBtnPse(this);
		var vNow = (Date.now ? Date.now() : new Date().getTime());
		var vAddTempo = (this.fPlyMode == 2 && this.fNxtPlyMode == 2);
		this.fPlyMode = this.fNxtPlyMode;
		this.fNxtPlyMode = (this.fPlyMode != 2 ? 0 : 2);
		if (this.fPlyMode != 0) {
			this.fNxtSwitchTime = vNow + (vAddTempo ? this.fOpt.animStep : 0);
			this.fEndTime = this.fNxtSwitchTime + 100;
			this.fNxtImg = (this.fPlyMode < 0 ? this.fCurrImg.fPrvImg : this.fCurrImg.fNxtImg);
		}
	},
	/** AnimBlk.execTask. */
	execTask : function(){
		try{
			var vNow = (Date.now ? Date.now() : new Date().getTime());
			if(this.fPlyMode != 0 && this.fNxtSwitchTime < vNow){
				if (!this.fPresMgr.fEnableEffects || !this.fOpt.soft){
					scHPS.xEndOpacityEffect(this.fCurrImg, 0);
					scHPS.xEndOpacityEffect(this.fNxtImg, 1);
					this.fCurrImg = this.fNxtImg;
					if (this.fImgRank) this.fImgRank.innerHTML = this.fCurrImg.fRank;
					this.fIdx = -1;
					this.setNxtPlyMode();
					return true;
				}
				if (this.fIdx < 0) {
					scHPS.xStartOpacityEffect(this.fCurrImg, 1);
					scHPS.xStartOpacityEffect(this.fNxtImg, 0);
				}
				while(this.fEndTime < vNow && this.fIdx < this.fRateOld.length) {
					this.fIdx++;
					this.fEndTime += 100;
				}
				this.fIdx++;
				this.fEndTime += 100;
				if(this.fIdx >= this.fRateOld.length) {
					scHPS.xEndOpacityEffect(this.fCurrImg, 0);
					scHPS.xEndOpacityEffect(this.fNxtImg, 1);
					this.fCurrImg = this.fNxtImg;
					if (this.fImgRank) this.fImgRank.innerHTML = this.fCurrImg.fRank;
					this.fIdx = -1;
					this.setNxtPlyMode();
					return true;
				}
				scHPS.xSetOpacity(this.fCurrImg, this.fRateOld[this.fIdx]);
				scHPS.xSetOpacity(this.fNxtImg, this.fRateNew[this.fIdx]);
			} else if (this.fPlyMode != this.fNxtPlyMode) this.setNxtPlyMode();
		}catch(e){scCoLib.util.logError("ERROR AnimBlk.execTask", e);}
		return true;
	}
}
/** AnimBlk.sBtnPrv. */
scHPS.AnimBlk.sBtnPrv = function(){
	var vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = -1;
	var vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	vAnim.fStart.style.visibility = "hidden";
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sBtnPly. */
scHPS.AnimBlk.sBtnPly = function(){
	var vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = 2;
	var vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="none";
	vAnim.fBtnPse.style.display="";
	vAnim.fStart.style.visibility = "hidden";
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sBtnPse. */
scHPS.AnimBlk.sBtnPse = function(pMgr){
	var vAnimBlk = this.fMgr||pMgr;
	vAnimBlk.fNxtPlyMode = 0;
	var vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	scHPS.AnimBlk.sShowCtrl(vAnim);
}
/** AnimBlk.sBtnNxt. */
scHPS.AnimBlk.sBtnNxt = function(){
	var vAnimBlk = this.fMgr;
	vAnimBlk.fNxtPlyMode = 1;
	var vAnim = vAnimBlk.fElt;
	vAnim.fBtnPly.style.display="";
	vAnim.fBtnPse.style.display="none";
	vAnim.fStart.style.visibility = "hidden";
	scHPS.AnimBlk.sShowCtrl(vAnim);
	return false;
}
/** AnimBlk.sShowCtrl. */
scHPS.AnimBlk.sShowCtrl = function(pAnim){
	var vPresMgr = pAnim.fAnimBlk.fPresMgr;
	if (pAnim.fOffProc) window.clearTimeout(pAnim.fOffProc);
	if (!pAnim.fCtrl.fOn){
		new scHPS.FadeEltTask(pAnim.fCtrl, 1,vPresMgr);
		pAnim.fCtrl.fOn = true;
	}
	if (pAnim.fAnimBlk.fOpt.hideToolbar) pAnim.fOffProc = window.setTimeout(function(){scHPS.AnimBlk.sHideCtrl(pAnim)}, 3000);
	return false;
}
/** AnimBlk.sHideCtrl. */
scHPS.AnimBlk.sHideCtrl = function(pAnim){
	var vPresMgr = pAnim.fAnimBlk.fPresMgr;
	if (pAnim.fCtrl.fOn){
		new scHPS.FadeEltTask(pAnim.fCtrl, 0,vPresMgr);
		pAnim.fCtrl.fOn = false;
		pAnim.fOffProc = null;
	}
	return false;
}

/** == scHPS.FraZmBlk : frameZoom Block class ===================================
   frameZoom block (anchors pointing to resources that need to be opened in an iframe as a zoom).*/
scHPS.FraZmBlk = function(pElt, pOpt){
	if(!pElt) return;
	//scCoLib.util.log("New FraZmBlk");
	pElt.fOpt = pOpt || {};
	pElt.fSldMgr = pOpt.fSldMgr;
	if (!pElt.fOpt.type) pElt.fOpt.type = "fra";
	pElt.href = pElt.href.replace(/mode=html/gi,"mode=ss");
	pElt.onclick = scHPS.FraZmBlk.sOnClickZoom;
}
/** FraZmBlk.sOnClickZoom - this == element */
scHPS.FraZmBlk.sOnClickZoom = function(){
	if (!this.fSldMgr || !this.fSldMgr.fSldHdr) return false;
	this.fSldMgr.fSldHdr.showZoom(this, this.fOpt);
	return false;
}

/** == scHPS.SizeBlk* : Size Block classes =================================== */
/** scHPS.SizeBlk : Base size block. */
scHPS.SizeBlk = function(){}
scHPS.SizeBlk.prototype = {
	/** SizeBlk.fPathResFra. */
	fPathResFra : scPaLib.compilePath("chi:div.resFra"),
	/** SizeBlk.fPathZoom. */
	fPathZoom : scPaLib.compilePath("des:.zoom"),
	/** SizeBlk.overrideOptions. */
	overrideOptions : function(pElt){
		var vOpt = pElt.getAttribute("data-options");
		if (vOpt) {
			vOpt = scHPS.xDeserialiseObjJs(vOpt);
			for (var vItem in vOpt){
				this.fOpt[vItem] = vOpt[vItem];
			}
		}
	},
	/** SizeBlk.onResizedDes : Api scSiLib. */
	onResizedDes : function(pOwnerNode, pEvent){
	},
	/** SizeBlk.isEltNotAlone. */
	isEltNotAlone : function(pRoot, pEltAlone){
		if(pEltAlone == pRoot) return false;
		switch(pRoot.nodeType) {
			case 1 : 
				var vNm = pRoot.nodeName;
				if(vNm == "IMG" || vNm == "OBJECT" |vNm == "EMBED") return true;
				for(var vCh = pRoot.firstChild; vCh; vCh = vCh.nextSibling) if(this.isEltNotAlone(vCh, pEltAlone)) return true;
				break;
			case 3 :
				return (/\S/.test(pRoot.nodeValue));
		}
		return false;
	}
}

/** scHPS.SizeBlkImg : Image size block. */
scHPS.SizeBlkImg = function(pElt, pOpt){
	if(!pElt) return;
	//scCoLib.util.log("New SizeBlkImg");
	this.fOpt = pOpt || {};
	this.overrideOptions(pElt);
	pElt.fRatio = (typeof this.fOpt.ratio == "number") ? this.fOpt.ratio : 1;
	pElt.fZoomRatio = (typeof this.fOpt.zoomRatio == "number") ? this.fOpt.zoomRatio : 1.3;
	pElt.fSldMgr = pOpt.fSldMgr;
	pElt.fHdr = pOpt.fHdr;
	var vImg = scPaLib.findNode(this.fPathImg, pElt);
	if(!vImg) {
		scCoLib.util.log("SizeBlkImg - WARNING : cannot find base image element.");
		return;
	}
	pElt.fImg = vImg;
	pElt.fAreas = scPaLib.findNodes(this.fPathAreas, pElt);
	if (pElt.fAreas.length>0) {
		pElt.fHasMap = true;
		pElt.fBaseWidth = vImg.width;
		for (var i = 0; i < pElt.fAreas.length; i++) pElt.fAreas[i].fCoords = pElt.fAreas[i].coords;
	}
	pElt.fResFra = scPaLib.findNode(this.fPathResFra, pElt);
	pElt.fListImg = [];
	var vListImg = scPaLib.findNodes(this.fPathListImg, pElt);
	var vLargeImg = scPaLib.findNode(this.fPathLargeImg, pElt);
	if (vLargeImg) vListImg.push(vLargeImg);
	var vImgInList = false;
	if (vListImg.length>0){
		for (var i = 0; i < vListImg.length; i++){
			var vImgNode = vListImg[i];
			var vSrc = vImgNode.src || vImgNode.getAttribute("data-src");
			var vWidth = vImgNode.width || vImgNode.getAttribute("data-width");
			var vHeight = vImgNode.height || vImgNode.getAttribute("data-height");
			pElt.fListImg.push({src:vSrc, width:scCoLib.toInt(vWidth), height:scCoLib.toInt(vHeight), img:(vImgNode.nodeName.toLowerCase()=="img"? vImgNode:null)});
			if (vWidth == vImg.width && vHeight == vImg.height) vImgInList = true;
		}
	}
	if (!vImgInList) pElt.fListImg.push({src:vImg.src, width:vImg.width, height:vImg.height, img:vImg});
	pElt.fListImg.sort(function (p1, p2){return (p1.width < p2.width ? -1 : p1.width == p2.width ? 0 : 1)});
	pElt.fOriW = pElt.fListImg[pElt.fListImg.length-1].width || 500;
	pElt.fOriH = pElt.fListImg[pElt.fListImg.length-1].height || 400;
	pElt.fAspect = pElt.fOriH / pElt.fOriW;
	pElt.fSldMgr.fSiLib.addRule(pElt, this);
	pElt.fZoom = scPaLib.findNode(this.fPathZoom, pElt);
	if(pElt.fZoom) {
		pElt.fZoom.onclick = scHPS.SizeBlkImg.sOnClickZoom;
		pElt.fZoom.fBlk = pElt;
		if (!pElt.fHasMap) pElt.fImg.onclick = scHPS.SizeBlkImg.sOnClickZoom;
		pElt.fImg.fBlk = pElt;
	}
	if (pOpt.addOverlay && pElt.fResFra){
		pElt.fOverlay = scHPS.xAddElt("div", pElt.fResFra, "resOverlay", null, null, (pElt.fZoom ? pElt.fZoom : null));
		if(pElt.fZoom) {
			pElt.fOverlay.onclick = scHPS.SizeBlkImg.sOnClickZoom;
			pElt.fOverlay.fBlk = pElt;
		}
	}
	//pElt.fSizeBlk = this;
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.SizeBlkImg.prototype = new  scHPS.SizeBlk();
/** SizeBlkImg.fPathImg */
scHPS.SizeBlkImg.prototype.fPathImg = scPaLib.compilePath("chi:.resFra|.imgBase/chi:img");
/** SizeBlkImg.fPathAreas */
scHPS.SizeBlkImg.prototype.fPathAreas = scPaLib.compilePath("chi:.resFra|.imgBase/des:area");
/** SizeBlkImg.fPathListImg */
scHPS.SizeBlkImg.prototype.fPathListImg = scPaLib.compilePath("chi:.imgOthers/chi:img|span");
/** SizeBlkImg.fPathLargeImg */
scHPS.SizeBlkImg.prototype.fPathLargeImg = scPaLib.compilePath("chi:.imgLarge/chi:img|span");
/** SizeBlkImg.onResizedAnc */
scHPS.SizeBlkImg.prototype.onResizedAnc = function(pOwnerNode, pEvent){
	if(pEvent.phase==1) {
		try{
			var vImg = pOwnerNode.fImg;
			if(!vImg) return;
			var vIsAlone = ! this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
			var vRate = pOwnerNode.fSldMgr.getRatioNormalScreen() * pOwnerNode.fRatio;
			var vWantedW = pOwnerNode.fOriW * vRate;
			var vWantedH = pOwnerNode.fOriH * vRate;
			var vMaxW = pOwnerNode.fHdr.getAvailWidth() *  (this.fOpt.ratioWidth || .8);
			var vMaxH = pOwnerNode.fHdr.getAvailHeight() * ( vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8) ) - (this.fOpt.captionHeight || 30);
			var vFinalW;
			pOwnerNode.fZoomOn = false;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				var vRH = vWantedH / vMaxH;
				vFinalW = (vWantedW / vMaxW > vRH) ? vMaxW : vWantedW / vRH;
				pOwnerNode.fZoomOn = true;
			} else {
				vFinalW = vWantedW;
			}
			vFinalW = Math.round(Math.min(vFinalW, pOwnerNode.fOriW));
			var vFinalH = Math.round(vFinalW * pOwnerNode.fAspect);
			var vList = pOwnerNode.fListImg;
			//if (vList.length < 2) return;
			for (var i = vList.length-1; i > 0; i--) if(vList[i-1].width < vFinalW) break;
			var vImgIdx = i;
			//if (pOwnerNode.fImgIdx && pOwnerNode.fImgIdx == vImgIdx) return;
			var vImgSel = vList[vImgIdx];
			if (pOwnerNode.fImgIdx != vImgIdx) vImg.src = vImgSel.src;
			pOwnerNode.fImgIdx = vImgIdx;
			vImg.width = vFinalW;
			vImg.height = vFinalH;
			//var vAlign = scHPS.xReadStyle(vImgSel, "verticalAlign") || "0";
			//if (!isNaN(parseFloat(vAlign))) {
			//	vImg.style.verticalAlign = vAlign+"px";
			//}
			if (pOwnerNode.fResFra){
				pOwnerNode.fResFra.style.width=vFinalW+"px";
				pOwnerNode.fResFra.style.height=vFinalH+"px";
			}
			pOwnerNode.fZoomOn = pOwnerNode.fZoom && pOwnerNode.fZoomOn && (vImgIdx < vList.length-1 || vImgSel.width>vFinalW);
			if (this.fOpt.forceZoom) pOwnerNode.fZoomOn = true;
			if (pOwnerNode.fZoom) pOwnerNode.fZoom.style.display = (pOwnerNode.fZoomOn) ? "" : "none";
			if (pOwnerNode.fOverlay) pOwnerNode.fOverlay.className = (pOwnerNode.fZoomOn) ? "resOverlay resOverlayZoom" : "resOverlay";
			else vImg.style.cursor = (pOwnerNode.fZoomOn && !pOwnerNode.fHasMap) ? "pointer" : "";
			if (pOwnerNode.fHasMap){
				var vRatio = vFinalW / pOwnerNode.fBaseWidth;
				for (var i = 0; i < pOwnerNode.fAreas.length; i++){
					var vArea = pOwnerNode.fAreas[i];
					var vCoords = vArea.fCoords.split(",");
					for (var j = 0; j < vCoords.length; j++) vCoords[j] = Math.round(vCoords[j] * vRatio);
					vArea.coords = vCoords.join(",");
				}
			}
		}catch(e){scCoLib.util.logError("ERROR SizeBlkImg.onResizedAnc", e);}
	}
}
/** SizeBlkImg.ruleSortKey */
scHPS.SizeBlkImg.prototype.ruleSortKey = "A";
/** SizeBlkImg.sOnClickZoom */
scHPS.SizeBlkImg.sOnClickZoom = function(pEvent) {
	var vBlk = this.fBlk;
	if (!vBlk.fZoomOn) return;
	if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
	var vSldHdr = vBlk.fSldMgr.fSldHdr;
	var vZmItm = vSldHdr.showZoom(vBlk.fImg);
	var vCt = vSldHdr.getZoomContainer();
	var vResizer = {
		onResizedDes : function(pOwnerNode, pEvent) {},
		onResizedAnc : function(pOwnerNode, pEvent) {
			if(pEvent && pEvent.phase==2) return;
			var vRate = vBlk.fSldMgr.getRatioNormalScreen() * vBlk.fZoomRatio;
			var vWantedW = vBlk.fOriW * vRate;
			var vWantedH = vBlk.fOriH * vRate;
			var vMaxW = vCt.offsetWidth;
			var vMaxH = vCt.offsetHeight;
			var vFinalW;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				var vRH = vWantedH / vMaxH;
				vFinalW = (vWantedW / vMaxW > vRH) ? vMaxW : vWantedW / vRH;
			} else {
				vFinalW = vWantedW;
			}
			var vFinalH = vFinalW * vBlk.fAspect;
			var vList = vBlk.fListImg;
//			for (var i = 1, l = vList.length; i < l; i++) if(vList[i].width > vFinalW) break;
			for (var i = vList.length-1; i > 0; i--) if(vList[i-1].width < vFinalW) break;
			var vImgIdx = i;
			var vImgSel = vList[vImgIdx];
			if (vBlk.fImgZmIdx != vImgIdx) vZmItm.src = vImgSel.src;
			pOwnerNode.fImgZmIdx = vImgIdx;
			vZmItm.width = vFinalW;
			vZmItm.height = vFinalH;
			vZmItm.style.marginTop = Math.max(0, (vMaxH - vFinalH) / 2)+"px";
			vZmItm.style.cursor = "pointer";
			vZmItm.onclick = function(){vSldHdr.hideZoom();};
		}
	}
	scSiLib.addRule(vZmItm, vResizer);
	vResizer.onResizedAnc(vZmItm);
	return false;
}

/** scHPS.SizeBlkObj : Embeded object size block. */
scHPS.SizeBlkObj = function(pElt, pOpt){
	if(!pElt) return;
	//scCoLib.util.log("New SizeBlkObj");
	this.fOpt = pOpt || {};
	this.overrideOptions(pElt);
	pElt.fRatio = (typeof this.fOpt.ratio == "number") ? this.fOpt.ratio : 1;
	pElt.fZoomRatio = (typeof this.fOpt.zoomRatio == "number") ? this.fOpt.zoomRatio : 1.3;
	pElt.fSldMgr = pOpt.fSldMgr;
	pElt.fHdr = pOpt.fHdr;
	var vObj = scPaLib.findNode(this.fPathObject, pElt);
	if(!vObj) {
		scCoLib.util.log("SizeBlkObj - WARNING : cannot find base object element.");
		return;
	}
	pElt.fObj = vObj;
	pElt.fResFra = scPaLib.findNode(this.fPathResFra, pElt);
	pElt.fSldMgr.fSiLib.addRule(pElt, this);
	pElt.fZoom = scPaLib.findNode(this.fPathZoom, pElt);
	if(pElt.fZoom) {
		pElt.fZoom.onclick = scHPS.SizeBlkObj.sOnClickZoom;
		pElt.fZoom.fBlk = pElt;
	}
	if (pOpt.onAction) pOpt.fHdr.getPresMgr().register("onAction", pOpt.onAction, pElt);
	if (pOpt.addOverlay && pElt.fResFra){
		pElt.fOverlay = scHPS.xAddElt("div", pElt.fResFra, "resOverlay", null, null, (pElt.fZoom ? pElt.fZoom : null));
		pElt.fOverlay.onclick = scHPS.SizeBlkObj.sOnClickZoom;
		pElt.fOverlay.fBlk = pElt;
	}
	//pElt.fSizeBlk = this;
	this.onResizedAnc(pElt,{phase:1});
}
scHPS.SizeBlkObj.prototype = new  scHPS.SizeBlk();
/** SizeBlkObj.fPathObject */
scHPS.SizeBlkObj.prototype.fPathObject = scPaLib.compilePath("des:object|video");
/** SizeBlkObj.onResizedAnc */
scHPS.SizeBlkObj.prototype.onResizedAnc = function(pOwnerNode, pEvent){
	if(pEvent.phase==1) {
		try{
			var vObj = pOwnerNode.fObj;
			if(!vObj) return;
			if(!vObj.oriW) vObj.oriW = vObj.width || 500;
			if(!vObj.oriH) vObj.oriH = vObj.height || 400;
			var vIsAlone = ! this.isEltNotAlone(pOwnerNode.fSldMgr.findOwnerBlk(pOwnerNode), pOwnerNode);
			var vRate = pOwnerNode.fSldMgr.getRatioNormalScreen() * pOwnerNode.fRatio;
			var vWantedW = vObj.oriW * vRate;
			var vWantedH = vObj.oriH * vRate;
			var vMaxW = pOwnerNode.fHdr.getAvailWidth() *  (this.fOpt.ratioWidth || .8);
			var vMaxH = pOwnerNode.fHdr.getAvailHeight() * ( vIsAlone ? (this.fOpt.ratioHeightAlone || .9) : (this.fOpt.ratioHeight || .8) ) - (this.fOpt.captionHeight || 30);
			pOwnerNode.fZoomOn = false;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				var vRW = vWantedW / vMaxW;
				var vRH = vWantedH / vMaxH;
				if(vRW > vRH) {
					vObj.width = vMaxW;
					vObj.height = vWantedH / vRW;
				} else {
					vObj.width = vWantedW / vRH;
					vObj.height = vMaxH;
				}
				pOwnerNode.fZoomOn = true;
			} else {
				vObj.width = vWantedW;
				vObj.height = vWantedH;
				pOwnerNode.fZoomOn = false;
			}
			pOwnerNode.fZoomOn = pOwnerNode.fZoomOn || this.fOpt.forceZoom;
			if(pOwnerNode.fZoom) pOwnerNode.fZoom.style.display = pOwnerNode.fZoomOn ? "" : "none";
			if(pOwnerNode.fOverlay) pOwnerNode.fOverlay.className = pOwnerNode.fZoomOn ? "resOverlay resOverlayZoom" : "resOverlay";
			
			if (pOwnerNode.fResFra){
				pOwnerNode.fResFra.style.width=vObj.width+"px";
				pOwnerNode.fResFra.style.height=vObj.height+"px";
			}
		}catch(e){scCoLib.util.logError("ERROR SizeBlkObj.onResizedAnc", e);}
	}
}
/** SizeBlkObj.ruleSortKey */
scHPS.SizeBlkObj.prototype.ruleSortKey = "A";
/** SizeBlkObj.sOnClickZoom */
scHPS.SizeBlkObj.sOnClickZoom = function(pEvent) {
	var vBlk = this.fBlk;
	if (!vBlk.fSldMgr || !vBlk.fSldMgr.fSldHdr) return false;
	var vSldHdr = vBlk.fSldMgr.fSldHdr;
	var vZmItm = vSldHdr.showZoom(vBlk.fObj);
	var vCt = vSldHdr.getZoomContainer();
	var vResizer = {
		onResizedDes : function(pOwnerNode, pEvent) {},
		onResizedAnc : function(pOwnerNode, pEvent) {
			if(pEvent && pEvent.phase==2) return;
			var vRate = vBlk.fSldMgr.getRatioNormalScreen() * vBlk.fZoomRatio;
			var vWantedW = vBlk.fObj.oriW * vRate;
			var vWantedH = vBlk.fObj.oriH * vRate;
			var vMaxW = vCt.offsetWidth;
			var vMaxH = vCt.offsetHeight;
			if(vWantedW > vMaxW || vWantedH > vMaxH) {
				var vRW = vWantedW / vMaxW;
				var vRH = vWantedH / vMaxH;
				if(vRW > vRH) {
					vZmItm.width = vMaxW;
					vZmItm.height = vWantedH / vRW;
				} else {
					vZmItm.width = vWantedW / vRH;
					vZmItm.height = vMaxH;
				}
			} else {
				vZmItm.width = vWantedW;
				vZmItm.height = vWantedH;
			}
			vZmItm.style.marginTop = Math.max(0, (vMaxH - vZmItm.height) / 2)+"px";
		}
	}
	scSiLib.addRule(vZmItm, vResizer);
	vResizer.onResizedAnc(vZmItm);
	return false;
}
// Call library init function...
scHPS.init();
