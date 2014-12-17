var tocMgr = {
	fTocPath : "ide:tplToc",
	fTocCoPath : "ide:tplTocCo",
	fTocScrollPath : "ide:tplTocScroll",
	fFraPath : "ide:tplSldFra",
	fClsToc : "tplToc",
	fClsFra : "tplSldFraToc",
	
	fToc : null,
	fTocCo : null,
	fTocSrl : null,
	fFra : null,
	fTglBtn : null,

	fClsTgl : "btnTocTgl",
	fResPrefix : "/skin/img/toc",
	fTocStyledNodes : [],

	/* === Public ============================================================= */
	init : function() {
		if (scHPS.fDisabled) return;
		this.fToc = scPaLib.findNode(this.fTocPath);
		this.fTocCo = scPaLib.findNode(this.fTocCoPath);
		this.fTocSrl = scPaLib.findNode(this.fTocScrollPath);
		this.fFra = scPaLib.findNode(this.fFraPath);
		this.addTocStyledNode(this.fToc,this.fClsToc);
		this.addTocStyledNode(this.fFra,this.fClsFra);
		this.addTocStyledNode(sc$("tplFootBanner"),"tplFootBannerToc");
		// init toc position
		if(scHPS.fStore.get("tocClose") == "false") this.openToc();
		else this.closeToc();
		// Init all sub tocs
		var vSubs = scPaLib.findNodes("des:ul.toc_sub",sc$("toc"));
		for (var i=0; i < vSubs.length; i++) {
			vSubs[i].fTglBtn = scPaLib.findNode("psi:div/chi:a.toc_tgle_o",vSubs[i]);
			vSubs[i].fTglBtn.style.display = "";
		}
		var vFirstSubs = scPaLib.findNodes("chi:li/chi:ul.toc_sub",sc$("toc"));
		for (var i=0; i < vFirstSubs.length; i++) this.xAutoToggleItem(vFirstSubs[i].fTglBtn);
		// init toc scroll container
		this.fTocSrl.style.overflow="hidden";
		// Register scPresMgr listeners 
		scPresMgr.register("onSldShow",this.onSldShow);
		scPresMgr.register("onKeyPress",this.onKeyPress);
		scOnLoads[scOnLoads.length] = this;
		// Add SiRule to keep current selected element visible
		this.fKeepVis = new scSiRuleEnsureVisible("des:div.toc_sel_yes",this.fTocSrl);
	},

	/** tocMgr.register : register a listener. */
	addTocStyledNode : function(pNode, pTocClassPrefix) {
		try{
			if (scHPS.fDisabled || !pNode || typeof pNode == "undefined") return;
			pNode.fTocClassPrefix = pTocClassPrefix || "toc";
			this.fTocStyledNodes.push(pNode);
		}catch(e){}
	},

	/** tocMgr.onLoad */
	onLoad : function() {
		//scCoLib.util.log("tocMgr.onLoad");
		// Add toggle button
		this.fTglBtn = this.xAddBtn(this.fToc, this.fClsTgl+(this.fOpen?"On":"Off"), this.xGetStr(0), (this.fOpen ? this.xGetStr(2) : this.xGetStr(3)));
		this.fTglBtn.onclick = this.toggleToc;
		this.addTocStyledNode(this.fTglBtn,this.fClsTgl);
		scPresMgr.addToolElement(this.fTglBtn);
		// Add Scroll up button
		this.fSrlUp = this.xAddElt("div", this.fTocCo, "tocSrlUp", null, null, this.fTocSrl);
		this.fSrlUp.onclick = function(){
			tocMgr.scrollTask.fSpeed -= 2;
		}
		this.fSrlUp.onmouseover = function(){
			if(tocMgr.scrollTask.fSpeed >= 0) {
				tocMgr.scrollTask.fSpeed = -2; 
				scTiLib.addTaskNow(tocMgr.scrollTask);
			}
		}
		this.fSrlUp.onmouseout = function(){
			tocMgr.scrollTask.fSpeed = 0;
		}
		var vSrlUpBtn = this.xAddBtn(this.fSrlUp, "tocSrlUpBtn", this.xGetStr(4), this.xGetStr(5));
		vSrlUpBtn.onclick = function(){
			tocMgr.scrollTask.step(-20); 
			if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
			return false;
		}
		// Add Scroll down button
		this.fSrlDwn = this.xAddElt("div", this.fTocCo, "tocSrlDwn", null, null);
		this.fSrlDwn.onclick = function(){
			tocMgr.scrollTask.fSpeed += 2;
		}
		this.fSrlDwn.onmouseover = function(){
			if(tocMgr.scrollTask.fSpeed <= 0) {
				tocMgr.scrollTask.fSpeed = 2; 
				scTiLib.addTaskNow(tocMgr.scrollTask);
			}
		}
		this.fSrlDwn.onmouseout = function(){
			tocMgr.scrollTask.fSpeed = 0;
		}
		var vSrlDwnBtn = this.xAddBtn(this.fSrlDwn, "tocSrlDwnBtn", this.xGetStr(6), this.xGetStr(7));
		vSrlDwnBtn.onclick = function(){
			tocMgr.scrollTask.step(20); 
			if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
			return false;
		}
		// Init scroll manager
		this.scrollTask.checkBtn();
		scSiLib.addRule(this.fTocSrl, this.scrollTask);
		this.fTocSrl.onscroll = function(){tocMgr.scrollTask.checkBtn()};
		this.fTocSrl.onmousewheel = function(){tocMgr.scrollTask.step(Math.round(-event.wheelDelta/(scCoLib.isIE ? 60 : 40)))}; //IE, Safari, Chrome, Opera.
		if(this.fTocSrl.addEventListener) this.fTocSrl.addEventListener('DOMMouseScroll', function(pEvent){tocMgr.scrollTask.step(pEvent.detail)}, false);
	},
	loadSortKey : "AZ",

	/** Called by the toggle button - this == tocMgr.fModeHtmlBtn. */
	toggleToc : function(){
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		if (tocMgr.fOpen){
			tocMgr.closeToc();
		} else {
			tocMgr.openToc();
		}
		return false;
	},

	closeToc : function(){
		scHPS.fStore.set("tocClose","true");
		this.fTocCo.style.display = "none";
		for (var i=0;i<this.fTocStyledNodes.length;i++){
			var vNode = this.fTocStyledNodes[i];
			vNode.className = vNode.className.replace(vNode.fTocClassPrefix+"On",vNode.fTocClassPrefix+"Off");
		}
		this.fOpen = false;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(3);
	},

	openToc : function(){
		scHPS.fStore.set("tocClose","false");
		this.fTocCo.style.display = "";
		for (var i=0;i<this.fTocStyledNodes.length;i++){
			var vNode = this.fTocStyledNodes[i];
			vNode.className = vNode.className.replace(vNode.fTocClassPrefix+"Off",vNode.fTocClassPrefix+"On");
		}
		this.fOpen = true;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(2);
		if (this.fKeepVis) this.fKeepVis.resetNode();
	},

	toggleItem : function(pBtn) {
		this.xToggleItem(pBtn,false);
	},

	/** tocMgr.onKeyPress : listener : this == function */
	onKeyPress : function(pCharCode) {
		switch(pCharCode){
			case 77://m
				tocMgr.toggleToc();break;
		}
	},

	/** tocMgr.onSldShow : listener : this == function */
	onSldShow : function(pSld) {
		//scCoLib.util.log("tocMgr.onSldShow");
		try{
			var vSelItem = null;
			var vSldHdr = pSld.fSldHdr;
			var vSelItems = scPaLib.findNodes("des:div.toc_sel_yes",tocMgr.fToc);
			for (var i=0; i < vSelItems.length; i++) vSelItems[i].className = vSelItems[i].className.replace("toc_sel_yes", "toc_sel_no");
			if (vSldHdr.fSldIdx>=0) {
				var vSrc = vSldHdr.fFraNode.src;
				tocMgr.fCurrSldId = vSrc.substring(vSrc.lastIndexOf("/")+1);
				var vCurrLnk = sc$(tocMgr.fCurrSldId);
				vSelItem = scPaLib.findNode("par:div.toc_i",vCurrLnk);
			} else {
				vSelItem = scPaLib.findNode("des:div.toc_i",tocMgr.fToc);
			}
			vSelItem.className = vSelItem.className.replace("toc_sel_no", "toc_sel_yes"); 
			// Make shure this item is visible (open all ancestors)
			var vClosedSubTocs = scPaLib.findNodes("anc:ul.toc_sub_c",vCurrLnk);
			for (var i=0; i < vClosedSubTocs.length; i++) tocMgr.xAutoToggleItem(vClosedSubTocs[i].fTglBtn);
			// Close all other auto-opened sub menus
			var vOpenedSubs = scPaLib.findNodes("des:ul.toc_sub_o",sc$("toc"));
			var vFilterIsOpened = scPaLib.compileFilter("ul.toc_sub_o");
			for (var i=0; i < vOpenedSubs.length; i++) {
				var vSub = vOpenedSubs[i];
				// Sub must have been automatically opened, be still opened, not be part of the ancestors of the current link an not contain any manually subs...
				if (vSub.fIsAuto && scPaLib.checkNode(vFilterIsOpened,vSub) && !tocMgr.xContainedInSub(vSub,vCurrLnk) && !tocMgr.xHasManualyOpenedSub(vSub)) tocMgr.xAutoToggleItem(vSub.fTglBtn);
			}
			// If this item has children, open the sub menu
			var vTocTgler = scPaLib.findNode("nsi:a.toc_tgle_c",vCurrLnk);
			if (vTocTgler) tocMgr.xAutoToggleItem(vTocTgler);
			// Make sure the currently selected item is centered.
			if (tocMgr.fKeepVis) tocMgr.fKeepVis.resetNode();
		}catch(e){scCoLib.util.log("ERROR - tocMgr.onSldShow : "+e)}
	},

	xContainedInSub : function(pSub,pNode) {
		var vAncSubs = scPaLib.findNodes("anc:ul.toc_sub",pNode);
		for (var i=0; i < vAncSubs.length; i++) if (vAncSubs[i] == pSub) return true;
		return false;
	},

	xHasManualyOpenedSub : function(pSub) {
		var vSubs = scPaLib.findNodes("des:ul.toc_sub_o",pSub);
		for (var i=0; i < vSubs.length; i++) if (!vSubs[i].fIsAuto) return true;
		return false;
	},

	xAutoToggleItem : function(pBtn) {
		this.xToggleItem(pBtn,true);
	},

	xToggleItem : function(pBtn,pAuto) {
		if (!pBtn) return;
		var vStatus = pBtn.className;
		var vUl = scPaLib.findNode("par:/nsi:ul.toc_sub",pBtn);
		if (!vUl) return;
		vUl.fIsAuto = pAuto;
		if(vStatus == "toc_tgle_c") {
			pBtn.className = "toc_tgle_o";
			scPaLib.findNode("des:img",pBtn).src = scServices.scLoad.getRootUrl()+this.fResPrefix+"/tgle_o.gif";
			vUl.className = vUl.className.replace("toc_sub_c", "toc_sub_o");
			vUl.style.display = "";
		} else {
			pBtn.className = "toc_tgle_c";
			scPaLib.findNode("des:img",pBtn).src = scServices.scLoad.getRootUrl()+this.fResPrefix+"/tgle_c.gif";
			vUl.className = vUl.className.replace("toc_sub_o", "toc_sub_c");
			vUl.style.display = "none";
			var vOpendSubMnus = scPaLib.findNodes("des:ul.toc_sub_o",vUl);
			for (var j=0; j < vOpendSubMnus.length; j++) this.xAutoToggleItem(vOpendSubMnus[j].fTglBtn);
		}
	},

	/* === Utilities ========================================================== */
	/** tocMgr.xAddElt : Add an HTML element to a parent node. */
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
	/** tocMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		var vBtn = pParent.ownerDocument.createElement("a");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		vBtn.href = "#";
		vBtn.target = "_self";
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** Reteive a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},

	/* === Tasks ============================================================== */
	/** tocMgr.scrollTask : menu scroll timer & size task */
	scrollTask : {
		fClassOffUp : "btnOff",
		fClassOffDown : "btnOff",
		fSpeed : 0,
		execTask : function(){
			try {
				if(this.fSpeed == 0) return false;
				tocMgr.fTocSrl.scrollTop += this.fSpeed;
				return true;
			}catch(e){
				this.fSpeed = 0;
				return false;
			}
		},
		step: function(pPx) {
			try { tocMgr.fTocSrl.scrollTop += pPx; }catch(e){}
		},
		checkBtn: function(){
			var vScrollTop = tocMgr.fTocSrl.scrollTop;
			var vBtnUpOff = tocMgr.fSrlUp.className.indexOf(this.fClassOffUp);
			if(vScrollTop <= 0) {
				if(vBtnUpOff < 0) tocMgr.fSrlUp.className+= " "+this.fClassOffUp;
			} else {
				if(vBtnUpOff >= 0) tocMgr.fSrlUp.className = tocMgr.fSrlUp.className.substring(0, vBtnUpOff);
			}
		
			var vContentH = scSiLib.getContentHeight(tocMgr.fTocSrl);
			var vBtnDownOff = tocMgr.fSrlDwn.className.indexOf(this.fClassOffDown);
			if( vContentH - vScrollTop <= tocMgr.fTocSrl.offsetHeight){
				if(vBtnDownOff < 0) tocMgr.fSrlDwn.className+= " "+this.fClassOffDown;
			} else {
				if(vBtnDownOff >=0) tocMgr.fSrlDwn.className = tocMgr.fSrlDwn.className.substring(0, vBtnDownOff);
			}
		},
		onResizedAnc:function(pOwnerNode, pEvent){
			if(pEvent.phase==2) this.checkBtn();
		},
		ruleSortKey : "checkBtn"
	}
} 

/* === Tools ================================================================ */
/** scSiRuleEnsureVisible : sc size rule that ensures a given node is visible in it's container' */
function scSiRuleEnsureVisible(pPathNode, pContainer) {
	this.fPathNode = pPathNode;
	this.fContainer = pContainer;
	scOnLoads[scOnLoads.length] = this;
}
scSiRuleEnsureVisible.prototype.onLoad = function() {
	try {
		this.resetNode();
		scSiLib.addRule(this.fContainer, this);
	} catch(e){scCoLib.util.logError("ERROR scSiRuleEnsureVisible.onLoad",e);}
}
scSiRuleEnsureVisible.prototype.onResizedAnc = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1 || pEvent.resizedNode == pOwnerNode) return;
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.onResizedDes = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1) return;
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.resetNode = function() {
	this.fNode = scPaLib.findNode(this.fPathNode, this.fContainer);
	this.ensureVis();
}
scSiRuleEnsureVisible.prototype.initTask = function(pTargetScrollTop) {
	this.fTargetScrollTop = pTargetScrollTop;
	try{
		this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
		this.fCycles = Math.min(25, Math.max(10, Math.round(Math.abs(this.fContainer.scrollTop - this.fTargetScrollTop)/ 10)));
		//scCoLib.util.log("this.fCycles:::"+this.fCycles);
		scTiLib.addTaskNow(this);
	}catch(e){scCoLib.util.log("ERROR scSiRuleEnsureVisible.initTask: "+e);}
}
scSiRuleEnsureVisible.prototype.execTask = function() {
	try{
		if (!scPresMgr.fEnableEffects) {
			this.precipitateEndTask();
			return false;
		}
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

			var vCurrScrollTop = this.fContainer.scrollTop;
			var vNewScrollTop = vCurrScrollTop - (2 * (vCurrScrollTop - this.fTargetScrollTop) / (this.fCycles+1) );
			this.fContainer.scrollTop = vNewScrollTop;
			return true;
		}
	}catch(e){scCoLib.util.log("ERROR scSiRuleEnsureVisible.execTask: "+e);}
}
scSiRuleEnsureVisible.prototype.precipitateEndTask = function() {
	try{
		this.fContainer.scrollTop = this.fTargetScrollTop;
	}catch(e){scCoLib.util.log("ERROR scSiRuleEnsureVisible.precipitateEndTask: "+e);}
}
scSiRuleEnsureVisible.prototype.ensureVis = function() {
	if( !this.fNode) return;
	try{
		var vParent = this.fNode.offsetParent;
		if( !vParent || vParent.tagName.toLowerCase() == "body") return;
		var vOffset = this.fNode.offsetTop;
		while(vParent != this.fContainer) {
			var vNewParent = vParent.offsetParent;
			vOffset += vParent.offsetTop;
			vParent = vNewParent;
		}
		var vOffsetMiddle = vOffset + this.fNode.offsetHeight/2;
		var vMiddle = this.fContainer.clientHeight / 2;
		this.initTask(vOffsetMiddle - vMiddle);
	} catch(e) {scCoLib.util.log("ERROR scSiRuleEnsureVisible.ensureVis: "+e)}
}
scSiRuleEnsureVisible.prototype.loadSortKey = "SiZ";
scSiRuleEnsureVisible.prototype.ruleSortKey = "Z";

