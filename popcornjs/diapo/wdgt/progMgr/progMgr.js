var progMgr = {
	fBlkCount : [],
	fBlkCountMax : 0,
	fPathRoot : "ide:tplRootPge",

	/* === Public ============================================================= */
	init : function() {
		if (scHPS.fDisabled) return;
		// Register scPresMgr listeners 
		scPresMgr.register("onSldShow",this.onSldShow);
		scPresMgr.register("onBlkShow",this.onBlkShow);
		scOnLoads[scOnLoads.length] = this;
	},

	addBlockCount : function(pSlideId,pBlkCount) {
		this.fBlkCount[this.fBlkCount.length] = {id:pSlideId,bk:pBlkCount};
		this.fBlkCountMax = 0;
		for (var i=0;i<this.fBlkCount.length;i++) this.fBlkCountMax += this.fBlkCount[i].bk;
	},

	onLoad : function() {
		//scCoLib.util.log("progMgr.onLoad");
		var vRoot = scPaLib.findNode(this.fPathRoot);
		this.fBlkCount[0].id="";
		// Add Counter
		this.fProgFra = this.xAddElt("div", vRoot, "progFra prog_0 progToc"+(tocMgr.fOpen?"On":"Off"), null, null);
		tocMgr.addTocStyledNode(this.fProgFra, "progToc");
		this.fProgCount = this.xAddElt("div", this.fProgFra, "progCount", null, null);
		this.fProgTxt = this.xAddElt("span", this.fProgCount, "progTxt", null, null);
//		scPresMgr.addToolElement(this.fProgFra);
	},
	loadSortKey : "1AA",

	/** progMgr.onBlkShow : listener : this == function */
	onBlkShow : function(pBlk) {
		progMgr.xUpdatePosition();
	},

	/** progMgr.onSldShow : listener : this == function */
	onSldShow : function(pSld) {
		var vSldHdr = pSld.fSldHdr;
		if (vSldHdr.fSldIdx>=0) {
			var vSrc = vSldHdr.fFraNode.src;
			progMgr.fCurrSldId = vSrc.substring(vSrc.lastIndexOf("/")+1);
		} else {
			progMgr.fCurrSldId = "";
		}
		progMgr.xUpdatePosition();
	},

	xUpdatePosition : function() {
		try{
			var vBkCount = 0;
			if (typeof progMgr.fCurrSldId != "undefined"){
				for (var i=0;i<this.fBlkCount.length;i++) {
					if (this.fBlkCount[i].id == this.fCurrSldId) break;
					else vBkCount += this.fBlkCount[i].bk;
				}
				if (scPresMgr.fCurrSld && scPresMgr.fCurrSld.fSldHdr && scPresMgr.fCurrSld.fSldHdr.getCurrBlkCounter) vBkCount += Number(scPresMgr.fCurrSld.fSldHdr.getCurrBlkCounter())+1;
				//scCoLib.util.log("Block count : "+vBkCount+"/"+this.fBlkCountMax);
				progMgr.fProgFra.className = progMgr.fProgFra.className.replace(/prog_[0-9]*/gi,"prog_" + Math.floor(vBkCount / this.fBlkCountMax * 20)*5);
				progMgr.fProgFra.title = Math.floor(vBkCount / this.fBlkCountMax * 100) + "%";
				progMgr.fProgTxt.innerHTML = '<span class="progTxtBlk">' + vBkCount+'</span>/<span class="progTxtTotal">'+this.fBlkCountMax + '</span>';
			}
		}catch(e){scCoLib.util.log("ERROR - progMgr.xUpdatePosition : "+e)}
	},

	/* === Utilities ========================================================== */
	/** progMgr.xAddElt : Add an HTML element to a parent node. */
	xAddElt : function(pName, pParent, pClassName, pNoDisplay, pHidden, pNxtSib){
		var vElt = pParent.ownerDocument.createElement(pName);
		if (pNxtSib) pParent.insertBefore(vElt,pNxtSib)
		else pParent.appendChild(vElt);
		if (pClassName) vElt.className = pClassName;
		if (pNoDisplay) vElt.style.display = "none";
		if (pHidden) vElt.style.visibility = "hidden";
		return vElt;
	}
}

