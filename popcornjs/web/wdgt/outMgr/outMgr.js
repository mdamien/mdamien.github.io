/* === Opale menu manager =============================================== */
var outMgr = {
	fMainPath : "",
	fMnuPath : "",
	fOutPath : "",
	fClsOut : "tplOut",
	
	fOut : null,
	fTglBtn : null,
	fUrlOutline : null,

	fCls : "mnu",
	fClsTgl : "btnOutTgl",
	fResPrefix : "/skin/img/mnu",
	fOverflowMethod : "hidden",
	
	fStrings : ["défilement haut","Faire défiler le menu vers le haut",
	            "défilement bas","Faire défiler le menu vers le bas",
	            "Masquer le plan","Afficher le plan",
	            "Masquer / afficher le plan","",
	            "Ouvrir le menu","Fermer le menu"],


	/* === Public ============================================================= */
	init : function(pMainPath,pMnuPath,pOutPath) {
		//scCoLib.util.log("outMgr.init");
		this.fIsLocal = window.location.protocol == "file:";
		if (typeof pMainPath != "undefined") this.fMainPath = pMainPath;
		if (typeof pMnuPath != "undefined") this.fMnuPath = pMnuPath;
		if (typeof pOutPath != "undefined") this.fOutPath = pOutPath;
		var vMnu = scPaLib.findNode(this.fMnuPath);
		this.fOut = scPaLib.findNode(this.fOutPath);
		this.fMain = scPaLib.findNode(this.fMainPath);
		if (!this.fOut || !vMnu || !this.fMain) return;
		this.fMnuFra = this.fOut.parentNode;
		this.fFilterIsClosed = scPaLib.compileFilter("ul.mnu_sub_c");
		this.fFilterIsBranch = scPaLib.compileFilter(".mnu_b");
		this.fSelMnuItem = scPaLib.findNode("des:div.mnu_sel_yes",this.fOut);
		this.fPortrait = window.innerHeight > window.innerWidth;
		if(tplMgr.fScreenTouch || tplMgr.fScreenSmall) window.addEventListener('resize',this.sResize,false);

		// Init
		this.fCurrItem = scPaLib.findNode("des:li.mnu_sel_yes",this.fOut);
		this.fSubLbls = scPaLib.findNodes("des:div.mnu_b",this.fOut);
		for (var i=0; i < this.fSubLbls.length; i++) {
			var vLbl = this.fSubLbls[i];
			var vSub = scPaLib.findNode("nsi:ul",vLbl);
			vLbl.fTglBtn = this.xAddBtn(vLbl,"mnu_tgle_"+(vSub?"o":"c"),(vSub?"v":">"),(vSub?this.fStrings[9]:this.fStrings[8]));
			vLbl.fTglBtn.onclick = this.sToggleItem;
			vLbl.fTglBtn.fLbl = vLbl;
			vLbl.fTglBtn.fUl = vSub;
		}
		
		// Init Scroll
		var vVisRule = null;
		if (ScSiRuleEnsureVisible) vVisRule = new ScSiRuleEnsureVisible("ide:tplMnu/des:div.mnu_sel_yes", "anc:ul.mnu");
		this.fOut.className = this.fOut.className.replace("mnu_static", "");
		if (tplMgr.fScreenTouch){
			vVisRule.xEnsureVis = function(){
				try{
					outMgr.fMnuFra.fScroller.refresh();
					if (scSiLib.getContentHeight(vMnu)< scSiLib.getOffsetTop(this.fNode,vMnu)+this.fNode.offsetHeight) outMgr.fMnuFra.fScroller.scrollToElement(this.fNode,0);
				}catch(e){alert(e);}
			}
		} else {
			this.fOut.style.overflow=this.fOverflowMethod;
			this.fSrlUp = this.xAddElt("div", this.fMnuFra, this.fCls+"SrlUpFra", null, null, this.fOut);
			this.fSrlUpBtn = this.xAddBtn(this.fSrlUp, this.fCls+"SrlUpBtn", this.xGetStr(0), this.xGetStr(1));
			this.fSrlDwn = this.xAddElt("div", this.fMnuFra, this.fCls+"SrlDwnFra");
			this.fSrlDwnBtn = this.xAddBtn(this.fSrlDwn, this.fCls+"SrlDwnBtn", this.xGetStr(2), this.xGetStr(3));
		}
		
		// Init Menu Collapser
		var vMnuOpn = this.xAddElt("div", vMnu, this.fCls+"Opn", null, null, scPaLib.findNode("nsi:",this.fMnuFra));
		var vMnuOpnBtn = this.xAddBtn(vMnuOpn, this.fCls+"OpnBtn", null, this.xGetStr(4));
		vMnuOpnBtn.onclick = function(){return outMgr.xCloseMnu()};
		var vMnuOpnImg = this.xAddElt("img", vMnuOpnBtn, "btnImg");
		vMnuOpnImg.setAttribute("alt", this.xGetStr(4));
		vMnuOpnImg.src = scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/collapse.png";
		vMnuOpnImg.onmouseover = function(){this.src=scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/collapseOver.png";}
		vMnuOpnImg.onmouseout = function(){this.src=scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/collapse.png";}
		var vMnuOpnLbl = this.xAddElt("span", vMnuOpnBtn, "btnLbl");
		vMnuOpnLbl.innerHTML = this.xGetStr(4);
		
		var vMnuCls = this.xAddElt("div", this.fMain, this.fCls+"Cls", null, null, scPaLib.findNode("nsi:",vMnu));
		var vMnuClsBtn = this.xAddBtn(vMnuCls, this.fCls+"ClsBtn", null, this.xGetStr(5));
		vMnuClsBtn.onclick = function(){return outMgr.xOpenMnu();};
		var vMnuClsImg = this.xAddElt("img", vMnuClsBtn, "btnImg");
		vMnuClsImg.setAttribute("alt", this.xGetStr(5));
		vMnuClsImg.src = scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/open.png";
		vMnuClsImg.onmouseover = function(){this.src=scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/openOver.png";}
		vMnuClsImg.onmouseout = function(){this.src=scServices.scLoad.getRootUrl()+outMgr.fResPrefix+"/open.png";}
		var vMnuClsLbl = this.xAddElt("span", vMnuClsBtn, "btnLbl");
		vMnuClsLbl.innerHTML = this.xGetStr(5);
		var vPlayBtn = scPaLib.findNode("ide:tplLft/des:span.playBtnSel");
		if (vPlayBtn) {
			vPlayBtn.onclick = function(){return outMgr.xToggleMnu();};
			vPlayBtn.title = this.xGetStr(6);
		}
		
		this.fMnuCollapse = false;
		if(tplMgr.fStore.get("mnuCollapse") == "true" || this.fPortrait && tplMgr.fScreenSmall) this.xCloseMnu(true,true);

		scOnLoads[scOnLoads.length] = this;
	},

	declareOutline : function(pUrl){
		//scCoLib.util.log("outMgr.declareOutline: "+pUrl);
		this.fUrlOutline = pUrl;
	},

	onLoad : function() {
		//scCoLib.util.log("outMgr.onLoad");
		try{
		if (tplMgr.fScreenTouch && "iScroll" in window){
			this.fMnuFra.fScroller = new iScroll(this.fMnuFra,{fixedScrollbar:true,bounce:false});
		} else {
			// Init Scroll up button
			this.fSrlUp.onclick = function(){
				outMgr.scrollTask.fSpeed -= 2;
			}
			this.fSrlUp.onmouseover = function(){
				if(outMgr.scrollTask.fSpeed >= 0) {
					outMgr.scrollTask.fSpeed = -2; 
					scTiLib.addTaskNow(outMgr.scrollTask);
				}
			}
			this.fSrlUp.onmouseout = function(){
				outMgr.scrollTask.fSpeed = 0;
			}
			this.fSrlUpBtn.onclick = function(){
				outMgr.scrollTask.step(-20); 
				return false;
			}
			// Init Scroll down button
			this.fSrlDwn.onclick = function(){
				outMgr.scrollTask.fSpeed += 2;
			}
			this.fSrlDwn.onmouseover = function(){
				if(outMgr.scrollTask.fSpeed <= 0) {
					outMgr.scrollTask.fSpeed = 2; 
					scTiLib.addTaskNow(outMgr.scrollTask);
				}
			}
			this.fSrlDwn.onmouseout = function(){
				outMgr.scrollTask.fSpeed = 0;
			}
			this.fSrlDwnBtn.onclick = function(){
				outMgr.scrollTask.step(20);
				return false;
			}
			// Init scroll manager
			this.scrollTask.checkBtn();
			scSiLib.addRule(this.fOut, this.scrollTask);
			this.fOut.onscroll = function(){outMgr.scrollTask.checkBtn()};
			this.fOut.onmousewheel = function(){outMgr.scrollTask.step(Math.round(-event.wheelDelta/(scCoLib.isIE ? 60 : 40)))}; //IE, Safari, Chrome, Opera.
			if(this.fOut.addEventListener) this.fOut.addEventListener('DOMMouseScroll', function(pEvent){outMgr.scrollTask.step(pEvent.detail)}, false);
		}
		}catch(e){alert(e);}
	},
	openAll : function() {
		for (var i=0; i < this.fSubs.length; i++) {
			var vSub = this.fSubs[i];
			if (scPaLib.checkNode(this.fFilterIsClosed,vSub)) this.xAutoToggleItem(vSub.fTglBtn);
		}
	},
	loadSortKey : "AZ",

	sResize : function() {
		outMgr.fPortrait = window.innerHeight > window.innerWidth;
		if (outMgr.fPortrait) outMgr.xCloseMnu(null,true);
		else if(tplMgr.fStore.get("mnuCollapse") != "true") outMgr.xOpenMnu(null,true);
	},

	sToggleItem : function() {
		try{
			if (tplMgr.isNoAjax()) return;
			outMgr.xToggleItem(this,false);
			if (tplMgr.fScreenTouch && outMgr.fMnuFra.fScroller) outMgr.fMnuFra.fScroller.refresh();
			else outMgr.scrollTask.checkBtn();
		} catch(e){}
		return false;
	},

	xAutoToggleItem : function(pBtn) {
		this.xToggleItem(pBtn,true);
	},

	xBuildSub : function(pBtn) {
		if (!this.fOutline) this.xInitOutline();
		var vLbl = pBtn.fLbl;
		pBtn.fUl = this.xAddElt("ul",vLbl.parentNode,"mnu_sub mnu_sub_o");
		pBtn.fUl.fTglBtn = pBtn;
		var vLi, vDiv, vLnk, vType, vCls;
		var vChildren = vLbl.fSrc.children;
		for (var i=0; i < pBtn.fLbl.fSrc.children.length; i++){
			var vChi =vChildren[i];
			vType = vChi.children ? "b" : "l";
			vCls = "mnu_sel_no mnu_"+vType+" mnu_typ_"+vChi.source+" mnu_dpt_"+(scPaLib.findNodes("anc:ul.mnu_sub", pBtn).length + 1)+" "+vChi.className;
			vLi = this.xAddElt("li",pBtn.fUl,vCls);
			vDiv = this.xAddElt("div",vLi,"mnuLbl "+vCls);
			vDiv.fSrc = vChi;
			vLnk = this.xAddElt("a",vDiv,"mnu_i mnu_lnk");
			vLnk.href = scServices.scLoad.getRootUrl() + "/" + vChi.url;
			vLnk.target = "_self";
			// Gère l'affichage de la page vue lors de la construction du submenu
			if(scServices.markedPages){
				if(scServices.markedPages.isPageMarked(vLnk.href)) vLi.className += " seen";
				var vViewSpan = this.xAddElt("span",vDiv,"viewBtn");
				vViewSpan.id = scServices.markedPages.getIdFromUrl(vLnk.href);
				var vViewLnk = this.xAddElt("a",vViewSpan);
				vViewLnk.setAttribute("onclick", "markedPageMgr.toggleMarkPageId(this.parentNode.id); return false;");
				vViewLnk.setAttribute("href", "#");
				vViewLnk.innerHTML = '<span>Page vue</span>';
			}
			vLnk.innerHTML = '<span class="mnu_ti">'+vChi.label+'</span>';
			if (vType == "b"){
				vDiv.fTglBtn = this.xAddBtn(vDiv,"mnu_tgle_c",">",null,vDiv.firstChild);
				vDiv.fTglBtn.onclick = this.sToggleItem;
				vDiv.fTglBtn.fLbl = vDiv;
			}
		}
	},

	xInitOutline : function() {
		//scCoLib.util.log("outMgr.xInitOutline");
		try{
			this.fOutline = this.xGetOutline().menu;
			var iOutlineWalker = function (pNode, pSrc) {
				var vChildren = scPaLib.findNodes("chi:li/chi:div.mnuLbl", pNode);
				for (var i=0; i < vChildren.length; i++){
					var vChild = vChildren[i];
					vChild.fSrc = pSrc.children[i];
					if (scPaLib.checkNode(outMgr.fFilterIsBranch,vChild)) iOutlineWalker(scPaLib.findNode("nsi:ul",vChild),pSrc.children[i]);
				}
			}
			iOutlineWalker(this.fOut, this.fOutline);
		}catch(e){
			scCoLib.util.log("ERROR - outMgr.xInitOutline : "+e);
		}
	},

	xGetOutline : function() {
		//scCoLib.util.log("outMgr.xGetOutline");
		try{
			if (tplMgr.isNoAjax()) return;
			if (!this.fOutlineSrc){
				var vReq = this.xGetHttpRequest();
				vReq.open("GET",this.fUrlOutline,false);
				vReq.send();
				this.fOutlineSrc = this.xDeserialiseObjJs(vReq.responseText); 
			}
			return this.fOutlineSrc
		}catch(e){
			scCoLib.util.log("ERROR - outMgr.xGetOutline : "+e);
			if (e.code==19) tplMgr.setNoAjax();
		}
	},

	xToggleItem : function(pBtn) {
		if (!pBtn) return;
		var vStatus = pBtn.className;
		if (!pBtn.fUl) this.xBuildSub(pBtn);
		var vUl = pBtn.fUl;
		if (!vUl) return;
		if(vStatus == "mnu_tgle_c") {
			pBtn.className = "mnu_tgle_o";
			pBtn.innerHTML = "<span>v</span>";
			pBtn.title = this.fStrings[9];
			vUl.className = vUl.className.replace("mnu_sub_c", "mnu_sub_o");
			vUl.style.display = "";
			vUl.fClosed = false;
		} else {
			pBtn.className = "mnu_tgle_c";
			pBtn.innerHTML = "<span>></span>";
			pBtn.title = this.fStrings[8];
			vUl.className = vUl.className.replace("mnu_sub_o", "mnu_sub_c");
			vUl.style.display = "none";
			vUl.fClosed = true;
			var vOpendSubMnus = scPaLib.findNodes("des:ul.mnu_sub_o",vUl);
			for (var j=0; j < vOpendSubMnus.length; j++) this.xAutoToggleItem(vOpendSubMnus[j].fTglBtn);
		}
	},

	xToggleMnu : function(pDontResize,pDontMemorize) {
		if (this.fMnuCollapse) return this.xOpenMnu(pDontResize,pDontMemorize);
		else return this.xCloseMnu(pDontResize,pDontMemorize);
	},

	xCloseMnu : function(pDontResize,pDontMemorize) {
		if(!pDontMemorize) tplMgr.fStore.set("mnuCollapse", "true");
		this.fMnuCollapse = true;
		this.fMain.className = this.fMain.className.replace(/tplMainMnu_[a-zA-Z]*/gi,"tplMainMnu_closed");
		if(!pDontResize) scSiLib.fireResizedNode(document.body);
		return false;
	},

	xOpenMnu : function(pDontResize,pDontMemorize) {
		if(!pDontMemorize) tplMgr.fStore.set("mnuCollapse", "false");
		this.fMnuCollapse = false;
		this.fMain.className = this.fMain.className.replace(/tplMainMnu_[a-zA-Z]*/gi,"tplMainMnu_open");
		if(!pDontResize) scSiLib.fireResizedNode(document.body);
		return false;
	},

	/* === Utilities ========================================================== */
	/** outMgr.xAddElt : Add an HTML element to a parent node. */
	xAddElt : function(pName, pParent, pClassName, pNoDisplay, pHidden, pNxtSib){
		var vElt;
		if(scCoLib.isIE && pName.toLowerCase() == "iframe") {
			//BUG IE : impossible de masquer les bordures si on ajoute l'iframe via l'API DOM.
			var vFrmHolder = pParent.ownerDocument.createElement("div");
			if (pNxtSib) pParent.insertBefore(vFrmHolder,pNxtSib)
			else pParent.appendChild(vFrmHolder);
			vFrmHolder.innerHTML = "<iframe scrolling='no' frameborder='0'></iframe>";
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
	/** outMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		if (pTitle) vBtn.setAttribute("title", pTitle);
		if (pCapt) vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	xGetHttpRequest: function(){
		if ("XMLHttpRequest" in window && (!this.fIsLocal || !("ActiveXObject" in window))) return new XMLHttpRequest();
		else if ("ActiveXObject" in window) return new ActiveXObject("Microsoft.XMLHTTP");
	},
	/** Reteive a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},

	xDeserialiseObjJs : function(pStr){
		if(!pStr) return {};
		var vVal;
		eval("vVal="+pStr);
		return vVal;
	},
	
	/* === Tasks ============================================================== */
	/** outMgr.scrollTask : menu scroll timer & size task */
	scrollTask : {
		fClassOffUp : "btnOff",
		fClassOffDown : "btnOff",
		fSpeed : 0,
		execTask : function(){
			try {
				if(this.fSpeed == 0) return false;
				outMgr.fOut.scrollTop += this.fSpeed;
				return true;
			}catch(e){
				this.fSpeed = 0;
				return false;
			}
		},
		step: function(pPx) {
			try { outMgr.fOut.scrollTop += pPx; }catch(e){}
		},
		checkBtn: function(){
			var vScrollTop = outMgr.fOut.scrollTop;
			var vBtnUpOff = outMgr.fSrlUp.className.indexOf(this.fClassOffUp);
			if(vScrollTop <= 0) {
				if(vBtnUpOff < 0) outMgr.fSrlUp.className+= " "+this.fClassOffUp;
			} else {
				if(vBtnUpOff >= 0) outMgr.fSrlUp.className = outMgr.fSrlUp.className.substring(0, vBtnUpOff);
			}
		
			var vContentH = scSiLib.getContentHeight(outMgr.fOut);
			var vBtnDownOff = outMgr.fSrlDwn.className.indexOf(this.fClassOffDown);
			if( vContentH - vScrollTop <= outMgr.fOut.offsetHeight){
				if(vBtnDownOff < 0) outMgr.fSrlDwn.className+= " "+this.fClassOffDown;
			} else {
				if(vBtnDownOff >=0) outMgr.fSrlDwn.className = outMgr.fSrlDwn.className.substring(0, vBtnDownOff);
			}
		},
		onResizedAnc:function(pOwnerNode, pEvent){
			if(pEvent.phase==2) this.checkBtn();
		},
		ruleSortKey : "checkBtn"
	}
}

