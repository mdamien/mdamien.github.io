/** ### scSiRuleAutoMarginW ######### */
function scSiRuleAutoMarginW(pIdMarginWNode, pPathContainer, pIsDynSize, pMinWidth, pMaxMargin) {
	this.fIsDynSize = pIsDynSize;
	this.fId = pIdMarginWNode;
	this.fPath = pPathContainer;
	this.fMinWidth = pMinWidth;
	this.fMaxMargin = pMaxMargin;
	scOnLoads[scOnLoads.length] = this;
}
scSiRuleAutoMarginW.prototype.onResizedAnc = function(pOwnerNode, pEvent) {
	if( ! this.fIsDynSize) {
		pEvent.stopBranch = true;
		return;
	}
	if(pEvent.resizedNode == pOwnerNode) return;
	if(pEvent.phase==1) this.xReset();
	else this.xRedraw();
}
scSiRuleAutoMarginW.prototype.onResizedDes = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1) this.xReset();
	else this.xRedraw();
}
scSiRuleAutoMarginW.prototype.xReset = function() {
	this.fNode.style.marginLeft = "0px";
	this.fNode.style.marginRight = "0px";
}
scSiRuleAutoMarginW.prototype.xRedraw = function() {
	var vH = this.fContainer.clientHeight;
	if(isNaN(vH) || vH <= 0) return;
	var vContentH = scSiLib.getContentHeight(this.fContainer);
	if(isNaN(vContentH) || vContentH <= 0) return;
	if(vContentH < vH) {
		var vW = this.fContainer.clientWidth;
		if(vW <= this.fMinWidth) return;
		var vMargin = Math.min( this.fMaxMargin * (1 - vContentH / vH), (vW - this.fMinWidth)/2) + "px";
		this.fNode.style.marginLeft = vMargin;
		this.fNode.style.marginRight = vMargin;
	}
}
scSiRuleAutoMarginW.prototype.onLoad = function() {
	this.fNode = sc$(this.fId);
	if( ! this.fNode) return;
	this.fContainer = scPaLib.findNode(this.fPath, this.fNode);
	if( ! this.fContainer) return;
	scSiLib.addRule(this.fContainer, this);
	this.xRedraw();
}
scSiRuleAutoMarginW.prototype.loadSortKey = "Si2";
scSiRuleAutoMarginW.prototype.ruleSortKey = "2";

/** ### scSiRuleFlexH ######### */
function scSiRuleFlexH(pIdFlexNode, pPathContainer, pIsDynSize, pRatioFreeSpace) {
	this.fIsDynSize = pIsDynSize;
	this.fId = pIdFlexNode;
	this.fPath = pPathContainer;
	this.fRatioFreeSpace = pRatioFreeSpace;
	scOnLoads[scOnLoads.length] = this;
}
scSiRuleFlexH.prototype.onResizedAnc = scSiRuleAutoMarginW.prototype.onResizedAnc;
scSiRuleFlexH.prototype.onResizedDes = scSiRuleAutoMarginW.prototype.onResizedDes;
scSiRuleFlexH.prototype.xReset = function() {
	this.fNode.style.height = null;
}
scSiRuleFlexH.prototype.xRedraw = function() {
	var vH = this.fContainer.clientHeight;
	if(isNaN(vH) || vH <= 0) return;
	var vContentH = scSiLib.getContentHeight(this.fContainer);
	if(isNaN(vContentH) || vContentH <= 0) return;
	if(vContentH < vH) this.fNode.style.height = Math.round( (vH-vContentH) * this.fRatioFreeSpace)+"px";
}
scSiRuleFlexH.prototype.onLoad = function() {
	this.fNode = sc$(this.fId);
	if( ! this.fNode) return;
	this.fContainer = scPaLib.findNode(this.fPath, this.fNode);
	if( ! this.fContainer) return;
	scSiLib.addRule(this.fContainer, this);
	this.xRedraw();
}
scSiRuleFlexH.prototype.loadSortKey = "Si3";
scSiRuleFlexH.prototype.ruleSortKey = "3";

/** ### ScSiRuleEnsureVisible ######### */
function ScSiRuleEnsureVisible(pPathNode, pPathContainer) {
	this.fPathNode = pPathNode;
	this.fPathContainer = pPathContainer;
	scOnLoads[scOnLoads.length] = this;
}
ScSiRuleEnsureVisible.prototype.onResizedAnc = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1 || pEvent.resizedNode == pOwnerNode) return;
	this.xEnsureVis();
}
ScSiRuleEnsureVisible.prototype.onResizedDes = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1) return;
	this.xEnsureVis();
}
ScSiRuleEnsureVisible.prototype.xEnsureVis = function() {
	var vOffsetMiddle = scSiLib.getOffsetTop(this.fNode, this.fContainer) + this.fNode.offsetHeight/2;
	var vMiddle = this.fContainer.clientHeight / 2;
	this.fContainer.scrollTop = vOffsetMiddle - vMiddle;

}
ScSiRuleEnsureVisible.prototype.onLoad = function() {
try {
	this.fNode = scPaLib.findNode(this.fPathNode);
	if( ! this.fNode) return;
	this.fContainer = scPaLib.findNode(this.fPathContainer, this.fNode);
	if( ! this.fContainer) return;
	scSiLib.addRule(this.fContainer, this);
	this.xEnsureVis();
} catch(e){alert(e);}
}
ScSiRuleEnsureVisible.prototype.loadSortKey = "SiZ";
ScSiRuleEnsureVisible.prototype.ruleSortKey = "Z";

/** ### ScSiRuleResize ######### */
function ScSiRuleResize( pPathContainer, pResizeFunc) {
	this.fPathContainer = pPathContainer;
	this.xResizeFunc = pResizeFunc;
	scOnLoads[scOnLoads.length] = this;
}
ScSiRuleResize.prototype.onResizedAnc = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1 || pEvent.resizedNode == pOwnerNode) return;
	this.xResizeFunc();
}
ScSiRuleResize.prototype.onResizedDes = function(pOwnerNode, pEvent) {
	if(pEvent.phase==1) return;
	this.xResizeFunc();
}
ScSiRuleResize.prototype.xResizeFunc = function() {
}
ScSiRuleResize.prototype.onLoad = function() {
try {
	this.fContainer = scPaLib.findNode(this.fPathContainer, this.fNode);
	if( ! this.fContainer) return;
	scSiLib.addRule(this.fContainer, this);
	this.xResizeFunc();
} catch(e){alert(e);}
}
ScSiRuleResize.prototype.loadSortKey = "SiZZ";
ScSiRuleResize.prototype.ruleSortKey = "ZZ";


