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
 * Portions created by the Initial Developer are Copyright (C) 2012-2014
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
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

/* ========== Search manager ================================================ */
var searchMgr = {
	fPathRoot : "des:div",
	fPathSchBox : "",
	fPathResBox : "",
	fMaxFilterDisplay : 100,
	fOverflowMethod : "",
	fUnifiedNav : true,
	sFilterTgleClosed : scPaLib.compileFilter(".mnu_tgle_c"),
	fStrings : ["Annuler","Annuler la recherche",
  /*02*/    "Rechercher dans le contenu","Aucun résultat.",
  /*04*/    "1 page trouvée","%s pages trouvées",
  /*06*/    "Précisez votre recherche...","Termes recherchés :",
  /*08*/    "Précédent","Occurrence précédente",
  /*10*/    "Suivant","Occurrence suivante",
  /*12*/    "Page précédente","Page suivante",
  /*14*/    "Liste","Afficher/cacher la liste des pages trouvées",
  /*16*/    "pertinence : %s/9","",
  /*18*/    "","%s",
  /*20*/    "Pas de résultat de recherche","Rechercher",
  /*22*/    "Ouvrir le menu","Fermer le menu"],

/* ========== Public functions ============================================== */

	declareIndex: function(pIdx){
		//scCoLib.util.log("searchMgr.declareIndex : "+pIdx);
		this.fIdxUrl = scCoLib.hrefBase().substring(0,scCoLib.hrefBase().lastIndexOf("/")) + "/" + pIdx;
	},

	setUnifiedNavigation: function(pFlag){
		this.fUnifiedNav = pFlag;
	},

	init: function(pPathSchBox,pPathResBox,pOpt){
		//scCoLib.util.log("searchMgr.init");
		this.fOpt = {searchType:'treeResults'};
		if (typeof pPathSchBox != "undefined") this.fPathSchBox = pPathSchBox;
		if (typeof pPathResBox != "undefined") this.fPathResBox = pPathResBox;
		if (typeof pOpt != "undefined"){
			if (typeof pOpt.searchType != "undefined") this.fOpt.searchType = pOpt.searchType;
		}
		this.fRoot = scPaLib.findNode(this.fPathRoot);
		var vSchBox = scPaLib.findNode(this.fPathSchBox);
		if (!vSchBox) return;
		this.fSearchCmds = scDynUiMgr.addElement("div",vSchBox,"schCmds");
		this.fSearchRes = scPaLib.findNode(this.fPathResBox);
		
		if (!Function.prototype.bind) {
			Function.prototype.bind = function (oThis) {
				if (typeof this !== "function") throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
				var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {}, fBound = function () {return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));};
				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();
				return fBound;
			};
		}
		scOnLoads[scOnLoads.length] = this;
	},

	onLoad: function(){
		//scCoLib.util.log("searchMgr.onLoad");
		try{
			var vSearchForm = scDynUiMgr.addElement("form",this.fSearchCmds,"schForm");
			vSearchForm.autocomplete = "off";
			var vSearchLabel = scDynUiMgr.addElement("label",vSearchForm,"schLabel");
			vSearchLabel.innerHTML = this.fStrings[21];		
			vSearchLabel.setAttribute("for",this.fStrings[21]);		
			this.fSearchInput = scDynUiMgr.addElement("input",vSearchForm,"schInput");
			this.fSearchInput.type = "text";
			this.fSearchInput.id = this.fSearchInput.name = this.fSearchInput.placeholder = this.fStrings[21];
			this.fSearchInput.title = this.fStrings[2];
			this.fSearchInput.onkeyup = this.sKeyUp;
			this.fSearchLaunch = scDynUiMgr.addElement("input",vSearchForm,"schBtnLaunch");
			this.fSearchLaunch.type = "submit";
			this.fSearchLaunch.value = "?";
			this.fSearchLaunch.title = this.fStrings[2];
			this.fSearchLaunch.onclick = this.sFind;
			this.fSearchPropose = scDynUiMgr.addElement("div",this.fSearchCmds,"schPropose schProp_no");
			
			var vResultFrame = scDynUiMgr.addElement("div",this.fSearchRes,"schResFrame" + (this.fUnifiedNav? " schUnifiedNav":""));
			var vResultList = scDynUiMgr.addElement("div",vResultFrame,"schResList");
			if (tplMgr.fScreenTouch && "iScroll" in window){
				var vScrollBox = scDynUiMgr.addElement("div",vResultList,"schResListSrl");
				this.fResultScroll = scDynUiMgr.addElement("div",vScrollBox,"scroller");
				this.fScroller = new iScroll(vScrollBox,{fixedScrollbar:true,bounce:false});
			} else {
				this.fResultScroll = scDynUiMgr.addElement("div",vResultList,"schResListSrl");
			}
			this.fResultTgle = this.xAddBtn(vResultFrame,"schBtnTgle schBtnTgle_cls",this.fStrings[14],this.fStrings[15]);
			this.fResultTgle.onclick = this.sListTgle;
			this.fSearchReset = this.xAddBtn(vResultFrame,"schBtnReset","X",this.fStrings[1]);
			this.fSearchReset.onclick = this.sReset;

			var vSchHitBox = scDynUiMgr.addElement("div",vResultFrame,"schHitBox");
			this.fHitLbl = scDynUiMgr.addElement("span",vSchHitBox,"schHitLbl");
			this.fBtnPrvHit = this.xAddBtn(vSchHitBox,"schBtnPrvHit",this.fStrings[8],this.fStrings[9]);
			this.fBtnPrvHit.onclick = this.sPrvHit;
			this.fHitCnt = scDynUiMgr.addElement("span",vSchHitBox,"schHitCnt");
			this.fBtnNxtHit = this.xAddBtn(vSchHitBox,"schBtnNxtHit",this.fStrings[10],this.fStrings[11]);
			this.fBtnNxtHit.onclick = this.sNxtHit;

			var vSchPageBox = scDynUiMgr.addElement("div",vResultFrame,"schPageBox");
			this.fSearchLbl = scDynUiMgr.addElement("span",vSchPageBox,"schResLbl");
			this.fSearchCnt = scDynUiMgr.addElement("span",vSchPageBox,"schResCnt");
			if (!this.fUnifiedNav){
				this.fBtnPrv = this.xAddBtn(vSchPageBox,"schBtnPrv",this.fStrings[8],this.fStrings[12]);
				this.fBtnPrv.onclick = this.sPrv;
				this.fBtnNxt = this.xAddBtn(vSchPageBox,"schBtnNxt",this.fStrings[10],this.fStrings[13]);
				this.fBtnNxt.onclick = this.sNxt;
			}

			this.getLastResults();
			var vCnt=0;
			if (!this.fResult) return;
			for(var i = 0;i<this.fResult.length;i++) if(this.fResult[i].url == tplMgr.fPageCurrent) vCnt++;
			if(vCnt == 0) scServices.scSearch.resetLastQuery();
			else {
				this.declareManager();
				this.xUpdateUi();
				if (this.fUnifiedNav && this.fTextHits) {
					if(tplMgr.fStore && tplMgr.fStore.get("gotoLastHit") == "true" && this.fTextHits.length>1) {
						this.fCurrHit = this.fTextHits.length-2
						this.sNxtHit();
					} else this.sNxtHit();
					if(tplMgr.fStore && tplMgr.fStore.get("gotoLastHit") == "true") tplMgr.fStore.set("gotoLastHit", false);
				}
			}
		}catch(e){scCoLib.util.log("ERROR - searchMgr.onLoad : "+e)}
	},

	focus: function(){
		if (this.fSearchInput) this.fSearchInput.focus();
	},

	propose: function(){
		//scCoLib.util.log("searchMgr.propose");
		try{
			var vStr = this.fSearchInput.value;
			var vWds = scServices.scSearch.propose(this.fIdxUrl, vStr,{async:true});
			var vShowProp = !vWds || (vWds && vWds.length==0 && vStr.length<3) || vWds && vWds.length>0;
			this.xSwitchClass(this.fSearchPropose,"schProp_"+(vShowProp ? "no" : "yes"), "schProp_"+(vShowProp ? "yes" : "no"), true);
			this.fSearchPropose.fShown = vShowProp ? true : false;
		
			var vProp;
			this.fSearchPropose.innerHTML = "";
			if (vWds && vWds.length>0){
				for(var i = 0;i<vWds.length;i++){
					vProp = this.xAddBtn(this.fSearchPropose,"schBtnPropose",vWds[i].wrd);
					vProp.onclick = this.sProp;
					vProp.onkeyup = this.sPropKeyUp;
				}
			} else if (scServices.scSearch.isLoadable(this.fIdxUrl)==false){
				this.xDisable();
			} else if (!vWds || (vWds && vWds.length==0 && vStr.length<3)){
				scDynUiMgr.addElement("span", this.fSearchPropose,"schProposeExceeded").innerHTML=this.fStrings[6];
			}
		}catch(e){scCoLib.util.log("ERROR - searchMgr.propose : "+e)}
	},

	xDisable: function(){
		tplMgr.setNoAjax();
		this.xSwitchClass(this.fSearchPropose,"schProp_yes", "schProp_no", true);
		this.fSearchPropose.fShown = false;
		this.fSearchPropose.innerHTML = "";
		this.fSearchInput.value = "";
		this.fSearchInput.disabled = true;
		this.fSearchLaunch.disabled = true;
	},

	find: function(){
		//scCoLib.util.log("searchMgr.find");
		var vStr = this.fSearchInput.value;
		if(!vStr) return;

		this.xResetHighlight();
		this.xSwitchClass(this.fSearchPropose,"schProp_yes", "schProp_no", true);
		this.fSearchPropose.fShown = false;
		this.fSearchPropose.innerHTML = "";
		scServices.scSearch.query({id:this.fIdxUrl,str:vStr});
		this.declareManager();
		this.getLastResults();
		this.xUpdateUi();
		if(scServices.scPreload) scServices.scPreload.parseLinks(this.fResultScroll);
		this.xListTgle(true);
	},

	reset: function(){
		if (!this.fSearchDisplay) return;
		scServices.scSearch.resetLastQuery();
		searchMgr.xResetUi();
	},

	declareManager: function(){
		if(!this.fResultMgr) {
			var vOutline = outMgr.xGetOutline();
			vSrcMenu = vOutline.menu;
			vSrcMenu.url = null;
			this.fResultMgr = this.fOpt.searchType=="listResults"?new this.ListResultManager(this.fResultScroll,vSrcMenu):new this.TreeResultManager(this.fResultScroll,vSrcMenu);
		}
	},

	getLastResults: function(){
		var vResultSet = scServices.scSearch.getLastQueryResults();
		if (vResultSet) {
			this.fResult = vResultSet.list;
			var vCoefs = scServices.scSearch.getCategories(this.fIdxUrl);
			var vMaxCat = 0;
			for(var i = 0;i<this.fResult.length;i++){
				var vResult = this.fResult[i];
				var vCat = 0;
				for(var j = 0;j<vCoefs.length;j++){
					vCat += vCoefs[j] * parseInt(vResult.cat.charAt(j));
				}
				if (vCat>vMaxCat) vMaxCat = vCat;
				vResult.cat = vCat;
				
			}
			for(var i = 0;i<this.fResult.length;i++){
				var vResult = this.fResult[i];
				vResult.cat = Math.round(vMaxCat>9 ? vResult.cat * 9 / vMaxCat : vResult.cat);
			}
		} else this.fResult = null;
	},

/* === Callback functions =================================================== */
	sReset: function(){
		searchMgr.reset();
		return false;
	},

	sFind: function(){
		searchMgr.find();
		return false;
	},

	sListTgle: function(){
		searchMgr.xListTgle();
		return false;
	},

	sProp: function(){
		searchMgr.fSearchInput.value = this.firstChild.innerHTML;
		searchMgr.find();
		return false;
	},

	sPropKeyUp: function(pEvt){
		var vEvt = pEvt || window.event;
		var vNode;
		switch(vEvt.keyCode){
		case 40:
			vNode = scPaLib.findNode("nsi:a",this);
			break;
		case 38:
			vNode = scPaLib.findNode("psi:a",this);
			if(!vNode) vNode = scPaLib.findNode("anc:.schCmds/chi:.schInput",this);
		}
		if (vNode) vNode.focus();
	},

	sKeyUp: function(pEvt){
		var vEvt = pEvt || window.event;
		if (this.value.length>0) searchMgr.xSwitchClass(searchMgr.fSearchCmds,"schCmds_noact", "schCmds_act", true);
		else searchMgr.xSwitchClass(searchMgr.fSearchCmds,"schCmds_act", "schCmds_noact", true);
		
		if (this.value.length==0) searchMgr.xResetUi();
		if (this.value.length>0 && vEvt.keyCode != "13") searchMgr.propose();
		else {
			searchMgr.xSwitchClass(searchMgr.fSearchPropose,"schProp_yes", "schProp_no", true);
			searchMgr.fSearchPropose.fShown = false;
			searchMgr.fSearchPropose.innerHTML = "";
		}
		if (searchMgr.fSearchPropose.fShown && vEvt.keyCode == "40") {
			var vProp = scPaLib.findNode("chi.a",searchMgr.fSearchPropose);
			if (vProp) vProp.focus();
		}
		if (vEvt.stopPropagation) vEvt.stopPropagation();
		else vEvt.cancelBubble = true;
	},

	sPrv: function(){
		if (searchMgr.fResultMgr.hasPreviousPage(tplMgr.fPageCurrent)) {
			if(searchMgr.fUnifiedNav && tplMgr.fStore) tplMgr.fStore.set("gotoLastHit", true);
			tplMgr.loadPage(searchMgr.fResultMgr.getPreviousPage(tplMgr.fPageCurrent));
		}
		return false;
	},

	sNxt: function(){
		if (searchMgr.fResultMgr.hasNextPage(tplMgr.fPageCurrent)) {}tplMgr.loadPage(searchMgr.fResultMgr.getNextPage(tplMgr.fPageCurrent));
		return false;
	},

	sPrvHit: function(){
		if (searchMgr.fTextHits && searchMgr.fTextHits.length>0 && searchMgr.fCurrHit>0){
			searchMgr.xListTgle(false);
			searchMgr.xSwitchClass(searchMgr.fTextHits[searchMgr.fCurrHit], "schHit_current", "schHit");
			searchMgr.xSwitchClass(searchMgr.fTextHits[--searchMgr.fCurrHit], "schHit", "schHit_current");
			// Si tabBox les onglets sont ouverts
			searchMgr.xIsTabBox();
			tplMgr.scrollTo(searchMgr.fTextHits[searchMgr.fCurrHit].id);
			searchMgr.xUpdateHitUi();
		} 
		else searchMgr.sPrv();
		return false;
	},

	sNxtHit: function(){
		if (searchMgr.fTextHits && searchMgr.fTextHits.length>0 && searchMgr.fCurrHit<searchMgr.fTextHits.length-1){
			searchMgr.xListTgle(false);
			if (searchMgr.fCurrHit>=0) searchMgr.xSwitchClass(searchMgr.fTextHits[searchMgr.fCurrHit], "schHit_current", "schHit");
			searchMgr.xSwitchClass(searchMgr.fTextHits[++searchMgr.fCurrHit], "schHit", "schHit_current");
			// Si tabBox les onglets sont ouverts
			searchMgr.xIsTabBox();
			tplMgr.scrollTo(searchMgr.fTextHits[searchMgr.fCurrHit].id);
			searchMgr.xUpdateHitUi();
		} 
		else searchMgr.sNxt();
		return false;
	},

	/* ========== Private functions =========================================== */
	xIsTabBox: function(){
		var vTabBoxCo = scPaLib.findNode("anc:.tabBoxPnl_co",searchMgr.fTextHits[searchMgr.fCurrHit])
		if(vTabBoxCo) vTabBoxCo.fBtn.click();
	},

	xListTgle: function(pState){
		if (typeof pState == "undefined") pState = !this.fListOpen;
		if (pState){
			tplMgr.xSwitchClass(searchMgr.fRoot, "schDisplayList_off", "schDisplayList_on", true);
		} else {
			tplMgr.xSwitchClass(searchMgr.fRoot, "schDisplayList_on", "schDisplayList_off", true);
		}
		this.fListOpen = pState;
		window.setTimeout(function(){if (searchMgr.fScroller) searchMgr.fScroller.refresh();}, 500);
	},

	xResetUi: function(){
		if (!this.fSearchDisplay) return;
		//scCoLib.util.log("searchMgr.xResetUi");
		this.fSearchDisplay = false;
		searchMgr.xListTgle(false);
		tplMgr.xSwitchClass(this.fRoot, "schDisplay_on", "schDisplay_off", true);
		tplMgr.xSwitchClass(this.fRoot, "schDisplayList_on", "schDisplayist_off", true);
		this.fSearchInput.value = "";
		this.fSearchInput.className = "schInput";
		this.fSearchLbl.innerHTML = "";
		searchMgr.xSwitchClass(searchMgr.fSearchPropose,"schProp_yes schProp_no", "", true);
		this.fSearchPropose.innerHTML = "";
		this.xResetHighlight();
	},

	xUpdateUi: function(){
		if (this.fSearchInput.value.length>0) searchMgr.xSwitchClass(this.fSearchCmds,"schCmds_noact", "schCmds_act", true);
		else searchMgr.xSwitchClass(this.fSearchCmds,"schCmds_act", "schCmds_noact", true);
		if (!this.fResult) return;

		this.fSearchDisplay = true;
		searchMgr.xSwitchClass(searchMgr.fRoot, "schDisplay_off", "schDisplay_on", true);
		this.fResultScroll.innerHTML = "";

		if (this.fResult && this.fResult.length > 0){
			this.fResultMgr.buildResult(this.fResult);
			this.fResultMgr.loadPage(tplMgr.fPageCurrent);

			searchMgr.xSwitchClass(searchMgr.fSearchRes, "schDisplay_", "schDisplay_"+(this.fResult.length == 1 ? "one" : "many"), true, false);
			var vRoot = sc$("tplCo");
			if (!vRoot) return;
			this.xHighlight(vRoot, scServices.scSearch.getLastSearch(this.fIdxUrl));
			searchMgr.xUpdateResUi();
		} 
		else {
			this.fSearchLbl.innerHTML = this.fStrings[3];
			var vNoResult = scDynUiMgr.addElement("div",this.fResultScroll,"schNoRes");
			vNoResult.innerHTML = this.fStrings[20];
			this.xSwitchClass(this.fSearchRes, "schDisplay_", "schDisplay_none", true, false);
			this.xResetHighlight();
			if (this.fScroller) this.fScroller.refresh();
		}

	},

	xUpdateResUi: function(){
		//scCoLib.util.log("searchMgr.xUpdateResUi");
		if (!this.fUnifiedNav){
			if (this.fResultMgr.hasPreviousPage(tplMgr.fPageCurrent)) this.xSwitchClass(this.fBtnPrv,"schBtnAct_no", "schBtnAct_yes", true);
			else this.xSwitchClass(this.fBtnPrv,"schBtnAct_yes", "schBtnAct_no", true);
			if (this.fResultMgr.hasNextPage(tplMgr.fPageCurrent)) this.xSwitchClass(this.fBtnNxt,"schBtnAct_no", "schBtnAct_yes", true);
			else this.xSwitchClass(this.fBtnNxt,"schBtnAct_yes", "schBtnAct_no", true);
		}
		var vPageCount = this.fResultMgr.getPageCount();
		if (vPageCount && vPageCount > 0) {
			if(this.fResultMgr.getPageRank(tplMgr.fPageCurrent)) this.fSearchCnt.innerHTML = this.fResultMgr.getPageRank(tplMgr.fPageCurrent) + "/" + vPageCount;
			this.fSearchLbl.innerHTML = (vPageCount == 1 ? this.fStrings[4] : this.fStrings[5].replace("%s",vPageCount));
			this.xSwitchClass(this.fSearchRes, "schDisplay_", "schDisplay_"+(vPageCount == 1 ? "one" : "many"), true, false);
		}
		else this.fSearchLbl.innerHTML = this.fStrings[3];
	},

	xUpdateHitUi: function(){
		//scCoLib.util.log("searchMgr.xUpdateHitUi");
		if (!this.fUnifiedNav){
			if (this.fTextHits && this.fTextHits.length>0 && this.fCurrHit>0) this.xSwitchClass(this.fBtnPrvHit,"schBtnHitAct_no", "schBtnHitAct_yes", true);
			else this.xSwitchClass(this.fBtnPrvHit,"schBtnHitAct_yes", "schBtnHitAct_no", true);
			if (this.fTextHits && this.fTextHits.length>0 && this.fCurrHit<this.fTextHits.length-1) this.xSwitchClass(this.fBtnNxtHit,"schBtnHitAct_no", "schBtnHitAct_yes", true);
			else this.xSwitchClass(this.fBtnNxtHit,"schBtnHitAct_yes", "schBtnHitAct_no", true);
		} else {
			if ((this.fTextHits && this.fTextHits.length>0 && this.fCurrHit>0) || this.fResultMgr.hasPreviousPage(tplMgr.fPageCurrent)) this.xSwitchClass(this.fBtnPrvHit,"schBtnHitAct_no", "schBtnHitAct_yes", true);
			else this.xSwitchClass(this.fBtnPrvHit,"schBtnHitAct_yes", "schBtnHitAct_no", true);
			if ((this.fTextHits && this.fTextHits.length>0 && this.fCurrHit<this.fTextHits.length-1) || this.fResultMgr.hasNextPage(tplMgr.fPageCurrent)) this.xSwitchClass(this.fBtnNxtHit,"schBtnHitAct_no", "schBtnHitAct_yes", true);
			else this.xSwitchClass(this.fBtnNxtHit,"schBtnHitAct_yes", "schBtnHitAct_no", true);
		}
		if (this.fTextHits.length>0 && this.fCurrHit>=0) this.fHitCnt.innerHTML = (this.fCurrHit+1) + "/" + this.fTextHits.length;
		else this.fHitCnt.innerHTML = "";
	},

	xHighlight: function(pRoot, pStr){
		//scCoLib.util.log("searchMgr.xHighlight");
		var vTextNodes = [];
		var vNoIdxFilter = scPaLib.compileFilter(".noIndex|.pbTi|objBox_ti|.hidden|.bkSolResOut|.footnotes|.CodeMirror-linenumber|script|noscript|object");
		var textNodeWalker = function (pNde){
			while (pNde){
				if (pNde.nodeType == 3) vTextNodes.push(pNde);
				else if (pNde.nodeType == 1 && !scPaLib.checkNode(vNoIdxFilter,pNde)) textNodeWalker(pNde.firstChild);
				pNde = pNde.nextSibling;
			}
		}
		textNodeWalker(pRoot.firstChild);
		var i,j,k,vTxtNode,vTxtVal,vTxtNorm,vTxtMached,vHolder,vToken,vHits,vHit,vReg,vOffset,vIsOldOffset;
		var vTokens = scServices.scSearch.buildTokens(this.fIdxUrl, pStr);
		for (i = 0; i<vTokens.length;i++) vTokens[i].fCount=0;
		for (i = 0; i<vTextNodes.length;i++){
			vHits = [];
			vTxtNode = vTextNodes[i];
			vTxtNorm = scServices.scSearch.normalizeString(this.fIdxUrl, vTxtNode.nodeValue);
			for (j = 0; j<vTokens.length;j++){
				vToken = vTokens[j];
				if (!vToken.neg && vTxtNorm.length>=vToken.wrd.length){
					if (vToken.exact) vReg = new RegExp("(?:^|\\W)("+vToken.wrd+")(?:$|\\W)","i");
					else if (vToken.start) vReg = new RegExp("(?:^|\\W)("+vToken.wrd+")","i");
					else vReg = new RegExp(vToken.wrd,"i");
					vOffset = vTxtNorm.search(vReg);
					while(vOffset>=0){
						vToken.fCount++
						if(vToken.exact && /\W/.test(vTxtNorm.charAt(vOffset))) vOffset++;
						vIsOldOffset = false;
						vHit = {start:vOffset,end:vOffset+vToken.wrd.length};
						for (k = 0; k<vHits.length;k++){
							if (vHit.start>=vHits[k].start && vHit.start<=vHits[k].end || vHit.end>=vHits[k].start && vHit.end<=vHits[k].end){
								vHits[k].start = Math.min(vHit.start,vHits[k].start);
								vHits[k].end = Math.max(vHit.end,vHits[k].end);
								vIsOldOffset = true;
							}
						}
						if (!vIsOldOffset) vHits.push(vHit);
						vOffset = vTxtNorm.substring(vHit.end).search(vReg);
						if (vOffset>=0) vOffset = vHit.end + vOffset;
					}
				}
			}
			if (vHits.length>0){
				// Ouvre bloc collapsable contenant un schHit
				var vBkExtra = scPaLib.findNode("anc:.collBlk_closed",vTxtNode);
				if(vBkExtra) vBkExtra.fTitle.onclick();
				vHits.sort(function(a,b){return a.start - b.start});
				var vIdx = 0;
				vTxtMached = "";
				vTxtVal = vTxtNode.nodeValue;
				for (var j = 0; j<vHits.length;j++){
					vHit = vHits[j];
					vTxtMached += vTxtVal.substring(vIdx,vHit.start).replace("<", "&lt;");
					vTxtMached += "<span class='schHit' id='schId"+i+j+"'>"+vTxtVal.substring(vHit.start,vHit.end).replace("<", "&lt;")+"</span>";
					vIdx = vHit.end;
				}
				vTxtMached += vTxtVal.substring(vHits[vHits.length-1].end);
				vHolder = scDynUiMgr.addElement("span", vTxtNode.parentNode, null, vTxtNode);
				vTxtNode.parentNode.removeChild(vTxtNode);
				vHolder.innerHTML = vTxtMached;
			}
		}
		this.fTextHits = scPaLib.findNodes("des:span.schHit",pRoot);
		var vDispTokens = [];
		for (i = 0; i<vTokens.length;i++){
			vToken = vTokens[i];
			if (!vToken.neg) vDispTokens.push((vToken.exact?'"':'')+vToken.wrd+(vToken.exact?'"':'')+" <em>("+vToken.fCount+")</em>");
		}
		this.fHitLbl.innerHTML = this.fStrings[7]+' <span class="schTerm">'+this.fStrings[19].replace("%s",vDispTokens.join(", "))+'</span>';
		this.fCurrHit = -1;
		this.xUpdateHitUi();
	},

	xResetHighlight: function(){
		if (!this.fTextHits || this.fTextHits.length==0) return;
		for (i = 0; i<this.fTextHits.length;i++){
			var vTextHit = this.fTextHits[i];
			var vParent = vTextHit.parentNode;
			var vTextNode = vParent.ownerDocument.createTextNode(String(vTextHit.firstChild.nodeValue));
			vParent.insertBefore(vTextNode,vTextHit);
			vParent.removeChild(vTextHit);
		}
		this.fTextHits = [];
		this.fCurrHit = -1;
		this.fHitLbl.innerHTML = "";
		var vCbks = scPaLib.findNodes(tplMgr.fCbkPath);
		if (vCbks) {
			for (var i in vCbks) {			
				var vTgl = scPaLib.findNode("des:a", vCbks[i]);
				if (vTgl && vTgl.className.indexOf("open")>=0) vTgl.onclick();
			}
		}
	},
	
	/* === Utilities ============================================================ */

	/** searchMgr.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : tplMgr.xAddBtn,

	/** searchMgr.xSwitchClass - replace a class name. */
	xSwitchClass : tplMgr.xSwitchClass,


	loadSortKey: "ZZsearchMgr"
}

/** searchMgr.ListResultManager. */
searchMgr.ListResultManager = function (pRoot,pOutline) {
	try{
		//scCoLib.util.log("searchMgr.ListResultManager.init");
		var vPagesList = this.fPagesList = {};
		this.fRoot = pRoot;
		var iOutlineWalker = function (pItem,pParent) {
			for (var i=0; i<pItem.children.length; i++) {
				var vItem = pItem.children[i];
				var vUrl = vItem.url;
				vPagesList[vUrl] = {title:vItem.label,source:vItem.source,id:vItem.id,parent:pParent};
				vParent = {url:vUrl,label:vItem.label};
				var vPagesParent = pParent?pParent.concat([vParent]):[vParent];
				if(pItem.children[i].children) iOutlineWalker(pItem.children[i],vPagesParent);
			}
		}
		iOutlineWalker(pOutline);
	} catch(e){scCoLib.util.log("searchMgr.ListResultManager init : "+e);}
}
searchMgr.ListResultManager.prototype = {
	/** ListResultManager.buildResult */
	buildResult : function(pResult) {
		this.fResult = pResult.sort(function(a,b){return (scCoLib.toInt(b.cat) - scCoLib.toInt(a.cat))});
		this.fDedupeResults = [];
		var vRoot = scDynUiMgr.addElement("ul",this.fRoot,"mnu_root");
		for (var i = 0; i < this.fResult.length; i++){
			if(i>=searchMgr.fMaxFilterDisplay) break;
			var vResult = this.fResult[i];
			var vPageUrl = vResult.url;
			var vPageRes = this.fPagesList[vPageUrl];
			// Dédoublone et crée les entrées pour la création des fils d'ariane
			var vCnt = 0;
			if(vPageRes) {
				if(!vPageRes.urls) {
					vPageRes.parents = [];
					vPageRes.urls = [];
					vPageRes.fLiParentBk = [];
				}			
				for(var j in this.fPagesList){
						if(vPageUrl != j && vPageRes.id == this.fPagesList[j].id) {
							// Regroupement des parents
							vPageRes.parents[0] = vPageRes.parent;
							vPageRes.parents[vCnt+1] = this.fPagesList[j].parent;
							// Regroupement des urls
							vPageRes.urls[0] = vPageUrl;
							vPageRes.urls[vCnt+1] = j;
							// Suppression des doublons et du champ parent inutile
							delete vPageRes.parent;
							delete this.fPagesList[j];
							vCnt++;
						}
				}
				// Création d'un tableau dédoublonné
				this.fDedupeResults.push(vResult);
				// Création du premier lien
				vPageRes.fLbl = scDynUiMgr.addElement("li",vRoot,"schPgeBk mnu_sel_no schPgeRank_"+vResult.cat);
				var vRankText = searchMgr.fStrings[16].replace("%s",vResult.cat);
				var vPgeBtn = searchMgr.xAddBtn(vPageRes.fLbl,"schPgeBtn schPgeSource_"+vPageRes.source,vPageRes.title,vRankText);
				vPgeBtn.href = scServices.scLoad.getRootUrl() + "/" + vPageUrl;
				scDynUiMgr.addElement("span",vPgeBtn,"schPgeRank").innerHTML = "<span>" + vRankText + "</span>";
				// Affiche un fil d'ariane si doublons (si la variable urls existe)
				if(vPageRes.urls.length > 1) {
					vPageRes.fLbl.className = vPageRes.fLbl.className + " mnu_b"
					var vTglBtn = searchMgr.xAddBtn(vPageRes.fLbl,"schParent_tgle_c","+",null,vPgeBtn);
					vTglBtn.onclick = this.toggleParentList;
					vTglBtn.fUl = scDynUiMgr.addElement("ul",vRoot,"schParentList schParentList_c");
					var vParentArr = vPageRes.parents;
					for(var j = 0; j < vParentArr.length; j++){
							vPageRes.fLiParentBk[j] = scDynUiMgr.addElement("li",vTglBtn.fUl,"mnu_sel_no");
							var vParentLnk = searchMgr.xAddBtn(vPageRes.fLiParentBk[j],"schParentBtn");
							vParentLnk.href = scServices.scLoad.getRootUrl() + "/" + vPageRes.urls[j];
							if(vParentArr[j] != undefined){
								for(var k = 0; k < vParentArr[j].length; k++){
									var vParentLabel = scDynUiMgr.addElement("span",vParentLnk,"schParentLabel");
									vParentLabel.innerHTML = " > "+vParentArr[j][k].label;
							}
						} 
						var vParentLabel = scDynUiMgr.addElement("span",vParentLnk,"schParentLabel");
						 	vParentLabel.innerHTML = " > "+vPageRes.title;
					}
				}
			}
		}
		if (searchMgr.fScroller) searchMgr.fScroller.refresh();
	},
	/** ListResultManager.hasNextPage */
	hasNextPage : function(pUrl){
		return this.getResultCurrId(pUrl) && this.fDedupeResults[scCoLib.toInt(this.getResultCurrId(pUrl))+1] || !this.getResultCurrId(pUrl) ? true : false;
	},

	/** ListResultManager.hasPreviousPage */
	hasPreviousPage : function(pUrl){
		return this.getResultCurrId(pUrl) && this.fDedupeResults[scCoLib.toInt(this.getResultCurrId(pUrl))-1] ? true : false;
	},

	/** ListResultManager.getNextPage : return the URL of next visible item of the given url in the current displayed menu. */
	getNextPage : function(pUrl){
		return this.fDedupeResults[this.getResultCurrId(pUrl)?scCoLib.toInt(this.getResultCurrId(pUrl))+1:0].url;
	},

	/** ListResultManager.getPreviousPage : return the URL of previous visible item of the given url in the current displayed menu. */
	getPreviousPage : function(pUrl){
		return this.fDedupeResults[scCoLib.toInt(this.getResultCurrId(pUrl))-1].url;
	},

	/** ListResultManager.getPageCount : return the visible page cout the current displayed menu. */
	getPageCount : function(){	
		return this.fDedupeResults.length;
	},

	/** ListResultManager.getPreviousPage : return the rank of the given url in the current displayed menu. */
	getPageRank : function(pUrl){
		return this.getResultCurrId(pUrl) ? scCoLib.toInt(this.getResultCurrId(pUrl))+1 : null;
	},
	/** ListResultManager.loadPage */
	loadPage : function(pUrl){
		for(i in this.fPagesList) {
			if(this.fPagesList[i].urls) {
				for(var j = 0; j < this.fPagesList[i].urls.length; j++) {
					if(pUrl == this.fPagesList[i].urls[j]) {
						searchMgr.xSwitchClass(this.fPagesList[i].fLbl, "mnu_sel_no", "mnu_sel_yes");
						searchMgr.xSwitchClass(this.fPagesList[i].fLiParentBk[j], "mnu_sel_no", "mnu_sel_yes");
					}
				}
			}
		}
		for(i in this.fDedupeResults) {
			if(pUrl == this.fDedupeResults[i].url) searchMgr.xSwitchClass(this.fPagesList[pUrl].fLbl, "mnu_sel_no", "mnu_sel_yes");
		}
	},
	/** ListResultManager.getResultCurrId */
	getResultCurrId: function(pUrl){	
		for(i in this.fDedupeResults) {
			if(pUrl == this.fDedupeResults[i].url) return i;
		}
	},
	/** ListResultManager.toggleParentList */
	toggleParentList : function() {
		try{
			if (!this) return;
			var vStatus = this.className;
			var vUl = this.fUl;
			if (!vUl) return;
			if(vStatus == "schParent_tgle_c") {
				this.className = "schParent_tgle_o";
				this.innerHTML = "<span>-</span>"
				vUl.className = vUl.className.replace("schParentList_c", "schParentList_o");
				vUl.fClosed = false;
			} else {
				this.className = "schParent_tgle_c";
				this.innerHTML = "<span>+</span>"
				vUl.className = vUl.className.replace("schParentList_o", "schParentList_c");
				vUl.fClosed = true;
			}
			if (searchMgr.fScroller) searchMgr.fScroller.refresh();
		} catch(e){scCoLib.util.log("searchMgr.ListResultManager.toggleParentList : "+e);}
		return false;
	}
}

/** searchMgr.TreeResultManager. */
searchMgr.TreeResultManager = function (pRoot,pOutline) {
	try{
		//scCoLib.util.log("searchMgr.TreeResultManager.init");
		this.fRoot = pRoot;
		this.fMenu = new searchMgr.MenuManager(pRoot, pOutline,{buildItemCallback:this.setupItem.bind(this)});
	} catch(e){scCoLib.util.log("searchMgr.TreeResultManager init : "+e);}
}
searchMgr.TreeResultManager.prototype = {
	/** TreeResultManager.buildResult */
	buildResult : function(pResult) {
		var vRes = pResult;
		this.fPageList = {ctrl:{},list:[]};
		if (vRes && vRes.length > 0){
			for (var i = 0; i < vRes.length; i++){
				var vPageUrl = vRes[i].url;
				this.fPageList.ctrl[vPageUrl] = vRes[i].cat;
				this.fPageList.list.push(vPageUrl);
			}
			this.fMenu.applyFilter(this.fPageList.list);
		}
		if (searchMgr.fScroller) searchMgr.fScroller.refresh();
	},

	/** TreeResultManager.setupItem */
	setupItem : function(pItem){
		if (!pItem.act) return;
		var vLbl = pItem.fLbl;
		var vLnk = pItem.fLnk;
		var vCat = this.fPageList.ctrl[pItem.url];
		var vCatText =	searchMgr.fStrings[16].replace("%s",vCat);
		if (!vLbl.fClass) vLbl.fClass = vLbl.className;
		if (!vLnk.fContent) vLnk.fContent = vLnk.innerHTML;
		vLbl.className = vLbl.fClass + " schPgeBk schPgeRank_"+vCat;
		vLnk.title = vCatText;
		vLnk.innerHTML = vLnk.fContent+'<span class="schPgeRank"><span>'+vCatText+'</span></span>';
	},

	/** TreeResultManager.hasNextPage */
	hasNextPage : function(pUrl){
		return (this.fMenu.getNextPageUrl(pUrl, true) ? true : false);
	},

	/** TreeResultManager.hasPreviousPage */
	hasPreviousPage : function(pUrl){
		return (this.fMenu.getPreviousPageUrl(pUrl, true) ? true : false);
	},

	/** TreeResultManager.getNextPage : return the URL of next visible item of the given url in the current displayed menu. */
	getNextPage : function(pUrl){
		return this.fMenu.getNextPageUrl(pUrl);
	},

	/** TreeResultManager.getPreviousPage : return the URL of previous visible item of the given url in the current displayed menu. */
	getPreviousPage : function(pUrl){
		return this.fMenu.getPreviousPageUrl(pUrl);
	},

	/** TreeResultManager.getPageCount : return the visible page cout the current displayed menu. */
	getPageCount : function(){
		return this.fMenu.getPageCount();
	},

	/** TreeResultManager.getPreviousPage : return the rank of the given url in the current displayed menu. */
	getPageRank : function(pUrl){
		return this.fMenu.getPageRank(pUrl);
	},
	/** TreeResultManager.loadPage */
	loadPage : function(pUrl){
		this.fMenu.loadPage(pUrl);
	}
}

/** searchMgr.MenuManager - Menu manager class. */
searchMgr.MenuManager = function (pRoot, pOutline, pOpt) {
	try{
		this.fOpt = {target:"_self",addScroller:false,addTitleAttributes:false,contextRoot:null,neverFilter:false,buildItemCallback:function(pItem){}};
		if (typeof pOpt != "undefined"){
			if (typeof pOpt.target != "undefined") this.fOpt.target = pOpt.target;
			if (typeof pOpt.addScroller != "undefined") this.fOpt.addScroller = pOpt.addScroller;
			if (typeof pOpt.addTitleAttributes != "undefined") this.fOpt.addTitleAttributes = pOpt.addTitleAttributes;
			if (typeof pOpt.contextRoot != "undefined") this.fOpt.contextRoot = pOpt.contextRoot;
			if (typeof pOpt.neverFilter != "undefined") this.fOpt.neverFilter = pOpt.neverFilter;
			if (typeof pOpt.buildItemCallback != "undefined") this.fOpt.buildItemCallback = pOpt.buildItemCallback;
		}
		this.fRoot = pRoot;
		this.fOutline = pOutline;
		this.fRoot.fSrc = pOutline;
		this.fFilter = false;
		var vFirstItem = null;
		var vItemIndex = this.fItemIndex = {};
		var iOutlineInit = function(pItem){
			if (pItem.url){
				if (!vItemIndex[pItem.url]) vItemIndex[pItem.url] = [];
				if (!vFirstItem) vFirstItem = pItem;
				vItemIndex[pItem.url].push(pItem);
			}
			if (pItem.children) {
				for (var i=0; i<pItem.children.length; i++) {
					var vChi = pItem.children[i];
					vChi.par = pItem;
					if (i<pItem.children.length-1) vChi.ctxNxt = pItem.children[i+1];
					if (i>0) vChi.ctxPrv = pItem.children[i-1];
					vChi.idx = i;
					iOutlineInit(vChi);
				}
			}
		}
		iOutlineInit(this.fOutline);
		var iOutlineWalker = function(pItem){
			if (pItem.children) pItem.nxt = pItem.children[0];
			else if (pItem.ctxNxt) pItem.nxt = pItem.ctxNxt;
			else if (pItem.par){
				var vPar = pItem.par;
				while (vPar && !vPar.ctxNxt) vPar = vPar.par;
				if (vPar && vPar.ctxNxt) pItem.nxt = vPar.ctxNxt;
			}
			if (typeof pItem.idx != "undefined" && pItem.idx==0) pItem.prv = pItem.par;
			else {
				var vPrv = pItem.ctxPrv;
				while(vPrv && typeof vPrv.children != "undefined") vPrv = vPrv.children[vPrv.children.length-1];
				if (vPrv) pItem.prv = vPrv;
			}
			if (pItem.children) {
				for (var i=0; i<pItem.children.length; i++) {
					iOutlineWalker( pItem.children[i]);
				}
			}
		}
		iOutlineWalker(this.fOutline);
		this.fFirstItem = vFirstItem;
		this.fFirstFilteredItem = null;

		if (this.fOpt.addScroller) this.buildMenuScroller();
		if (this.fOpt.contextRoot) this.fContext = scDynUiMgr.addElement("span",this.fOpt.contextRoot,"ctx_root");

	} catch(e){scCoLib.util.log("searchMgr.MenuManager init : "+e);}
}
searchMgr.MenuManager.prototype = {
	/** MenuManager.buildMenuScroller - build a menu scroller infrastructre. */
	buildMenuScroller : function() {
		// Init Scroll
		this.fRoot.fMgr = this;
		this.fScrollerEnabled = true;
		this.fRoot.style.overflow = searchMgr.fOverflowMethod;
		var vFra = this.fRoot.parentNode;

		// Init Scroll up button
		this.fSrlUp = scDynUiMgr.addElement("div", vFra, "mnuSrlUpFra", this.fRoot);
		this.fSrlUp.fMgr = this;
		this.fSrlUp.onclick = function(){
			this.fMgr.fSpeed -= 2;
		}
		this.fSrlUp.onmouseover = function(){
			if(this.fMgr.fSpeed >= 0) {
				this.fMgr.fSpeed = -2; 
				scTiLib.addTaskNow(this.fMgr);
			}
		}
		this.fSrlUp.onmouseout = function(){
			this.fMgr.fSpeed = 0;
		}
		this.fSrlUpBtn = searchMgr.xAddBtn(this.fSrlUp, "mnuSrlUpBtn", searchMgr.fStrings[0], searchMgr.fStrings[1]);
		this.fSrlUpBtn.fMgr = this;
		this.fSrlUpBtn.onclick = function(){
			this.fMgr.setScrollStep(-20); 
			return false;
		}
		// Init Scroll down button
		this.fSrlDwn = scDynUiMgr.addElement("div", vFra, "mnuSrlDwnFra");
		this.fSrlDwn.fMgr = this;
		this.fSrlDwn.onclick = function(){
			this.fMgr.fSpeed += 2;
		}
		this.fSrlDwn.onmouseover = function(){
			if(this.fMgr.fSpeed <= 0) {
				this.fMgr.fSpeed = 2; 
				scTiLib.addTaskNow(this.fMgr);
			}
		}
		this.fSrlDwn.onmouseout = function(){
			this.fMgr.fSpeed = 0;
		}
		this.fSrlDwnBtn = searchMgr.xAddBtn(this.fSrlDwn, "mnuSrlDwnBtn", searchMgr.fStrings[2], searchMgr.fStrings[3]);
		this.fSrlDwnBtn.fMgr = this;
		this.fSrlDwnBtn.onclick = function(){
			this.fMgr.setScrollStep(20);
			return false;
		}
		// Init scroll manager
		this.checkScrollBtns();
		this.ensureVisible();
		scSiLib.addRule(this.fRoot, this);
		this.fRoot.onscroll = function(){this.fMgr.checkScrollBtns()};
		this.fRoot.onmousewheel = function(){this.fMgr.setScrollStep(Math.round(-event.wheelDelta/(scCoLib.isIE ? 60 : 40)))}; //IE, Safari, Chrome, Opera.
		if(this.fRoot.addEventListener) this.fRoot.addEventListener('DOMMouseScroll', function(pEvent){this.fMgr.setScrollStep(pEvent.detail)}, false);

	},
	/** MenuManager.buildSubMenu - build the sub menu of a given root dom node. */
	buildSubMenu : function (pRoot, pHidden) {
		//scCoLib.util.log("MenuManager.buildSubMenu");
		var i,vChi,vUl,vBtn,vTyp;
		for (i=0; i< pRoot.fSrc.children.length; i++){
			vChi = pRoot.fSrc.children[i];
			if (!this.fFilter && !vChi.prn || this.fFilter && vChi.vis){
				vTyp = vChi.children ? "b" : "l";
				this.buildMenuEntry(pRoot, vChi, pHidden);
				if (vTyp == "b"){
					vBtn = searchMgr.xAddBtn(vChi.fLbl,"mnu_tgle_c",">",searchMgr.fStrings[22]);
					vBtn.onclick = this.sToggleMnuItem;
					vUl = scDynUiMgr.addElement("ul",vChi.fLi,"mnu_sub mnu_sub_c",null,{"display":"none"});
					vChi.fLbl.fTglBtn = vBtn;
					vChi.fLnk.fTglBtn = vBtn;
					vUl.fTglBtn = vBtn;
					vUl.fSrc = vChi;
					vUl.fMgr = this;
					vBtn.fLbl = vChi.fLbl;
					vBtn.fUl = vUl
					vChi.fUl = vUl;
				}
			}
		}
		pRoot.fBuilt = true;
		if (this.fOpt.addScroller) this.checkScrollBtns();
	},
	/** MenuManager.buildMenuEntry - build the menu entry of a given source node. */
	buildMenuEntry : function(pParent, pSrc, pHidden) {
		var vUl,vLi,vDiv,vLnk,vTyp,vCls;
		vTyp = pSrc.children ? "b" : "l";
		vCls = "mnu_sel_no mnu_"+vTyp+" mnu_src_"+pSrc.source+" mnu_dpt_"+(scPaLib.findNodes("anc:ul.mnu_sub", pParent).length + 1)+" "+pSrc.className+" mnu_sch_"+(this.fFilter && pSrc.act ? "yes" : "no");
		vLi = scDynUiMgr.addElement("li",pParent,vCls);
		vDiv = scDynUiMgr.addElement("div",vLi, "mnuLbl "+vCls);
		vLnk = scDynUiMgr.addElement("a",vDiv,"mnu_i mnu_lnk");
		if (pSrc.url) {
			vLnk.href = scServices.scLoad.getRootUrl() + "/" + pSrc.url;
			vLnk.target = this.fOpt.target;
		} else {
			vLnk.href = "#";
			vLnk.onclick = function(){try{if(this.fTglBtn && this.fTglBtn.className.indexOf("mnu_tgle_c")>=0) searchMgr.xToggleMnuItem(this.fTglBtn)} catch(e){};return false;};
		}
		vLnk.fSrc = pSrc;
		vLnk.fMgr = this;
		if (this.fFilter && !pSrc.act) vLnk.onclick = function(){return false};
		else vLnk.onclick = function(){try{
			this.fMgr.fRequestedItem = this.fSrc;
		}catch(e){}};
		vLnk.innerHTML = '<span class="mnu_sch"><span class="capt">'+pSrc.label+'</span></span>';
		if (this.fOpt.addTitleAttributes) vLnk.title = pSrc.label;
		pSrc.fLbl = vDiv;
		pSrc.fLi = vLi;
		pSrc.fLnk = vLnk;
		this.fOpt.buildItemCallback(pSrc);
	},
	/** MenuManager.buildAncestorMenus - garantee that all ancestors of the given item are present. */
	buildAncestorMenus : function(pItem, pHidden) {
		//scCoLib.util.log("MenuManager.buildAncestorMenus");
		var vAncs = [];
		var vItem = pItem
		while(vItem.par && !vItem.fLbl){
			vAncs.push(vItem.par);
			vItem = vItem.par;
		}
		for (var i=vAncs.length-1; i>=0; i--){
			this.buildSubMenu(vAncs[i].fUl, pHidden);
		}
	},
	/** MenuManager.buildContextMenu - build an context menu of the given item. */
	buildContextMenu : function(pItem) {
		//scCoLib.util.log("MenuManager.buildContextMenu");
		var vAncs = [];
		var vCtx = [];
		var vItem = pItem.par
		while(vItem && vItem.url){
			vAncs.push(vItem);
			vItem = vItem.par;
		}
		for (var i=vAncs.length-1; i>=0; i--){
			var vAnc = vAncs[i];
			// vCtx.push('<a href="'+scServices.scLoad.getPathFromRoot(vAnc.url)+'" target="'+this.fOpt.target+'" class="ctx_lnk"><span>'+vAnc.label+'</span></a>');
			// Modif pour sc3.7 et sans frame
			vCtx.push('<a href="'+vAnc.url+'" target="'+this.fOpt.target+'" class="ctx_lnk"><span>'+vAnc.label+'</span></a>');
		}
		return vCtx.join('<span> > </span>')+(vCtx.length>0 ? '<span> > </span>' : '');
	},
	/** MenuManager.resetMenu - reset all filtering info in the menu: . */
	resetMenu : function() {
		//scCoLib.util.log("MenuManager.resetMenu");
		var iResetMenu = function(pItem){
			pItem.act = false;
			pItem.vis = false;
			pItem.cnt = null;
			if (pItem.children) for (var i=0; i<pItem.children.length; i++) iResetMenu(pItem.children[i]);
		}
		iResetMenu(this.fOutline);
		this.fOutline.cntAct = 0;
	},
	/** MenuManager.rebuildMenu - Rebuild the menu from scrach. */
	rebuildMenu : function() {
		//scCoLib.util.log("MenuManager.rebuildMenu");
		var vMgr = this;
		var iResetMenu = function(pItem){
			pItem.fLbl = null;
			pItem.fUl = null;
			pItem.fLi = null;
			if (!vMgr.fFilter){
				pItem.act = false;
				pItem.vis = false;
				pItem.cnt = null;
			}
			if (pItem.children) for (var i=0; i<pItem.children.length; i++) iResetMenu(pItem.children[i]);
		}
		iResetMenu(this.fOutline);
		if (!this.fFilter) this.fOutline.cntAct=0;
		this.fRoot.innerHTML = "";
		var vRootUl = scDynUiMgr.addElement("ul",this.fRoot,"mnu_root mnu_sub mnu_sch_no");
		vRootUl.fSrc = this.fOutline;
		this.buildSubMenu(vRootUl);
	},
	/** MenuManager.getFirstPageUrl - return the URL of the first visible page. */
	getFirstPageUrl : function(){
		this.fRequestedItem = (this.fFilter ? this.fFirstFilteredItem : this.fFirstItem);
		return (this.fRequestedItem ? this.fRequestedItem.url : null);
	},
	/** MenuManager.getNextPageUrl - return the URL of the next visible page of the given url. */
	getNextPageUrl : function(pUrl, pNoRequest){
		var vCurrItem = null;
		if (this.fCurrItem && this.fCurrItem.url == pUrl) vCurrItem = this.fCurrItem;
		if (!vCurrItem){
			var vItems = this.fItemIndex[pUrl];
			if (!vItems) return null;
			vCurrItem = vItems[0];
		}
		var vNxtItem = vCurrItem.nxt;
		if (this.fFilter){
			while (vNxtItem && !vNxtItem.act) vNxtItem = vNxtItem.nxt;
		}
		if (pNoRequest) return (vNxtItem ? vNxtItem.url : null);
		this.fRequestedItem = vNxtItem;
		return (this.fRequestedItem ? this.fRequestedItem.url : null);
	},
	/** MenuManager.getPreviousPageUrl - return the URL of the previous visible page of the given url. */
	getPreviousPageUrl : function(pUrl, pNoRequest){
		var vCurrItem = null;
		if (this.fCurrItem && this.fCurrItem.url == pUrl) vCurrItem = this.fCurrItem;
		if (!vCurrItem){
			var vItems = this.fItemIndex[pUrl];
			if (!vItems) return null;
			vCurrItem = vItems[0];
		}
		var vPrvItem = vCurrItem.prv;
		if (this.fFilter){
			while (vPrvItem && !vPrvItem.act) vPrvItem = vPrvItem.prv;
		}
		if (pNoRequest) return (vPrvItem ? vPrvItem.url : null);
		this.fRequestedItem = vPrvItem;
		return (this.fRequestedItem ? this.fRequestedItem.url : null);
	},
	/** MenuManager.getPageCount - return filtered page cout. */
	getPageCount : function(){
		return this.fOutline.cntAct;
	},
	/** MenuManager.getPageCount - return the page rank of the given url. */
	getPageRank : function(pUrl){
		var vCurrItem = null;
		if (this.fCurrItem && this.fCurrItem.url == pUrl) vCurrItem = this.fCurrItem;
		if (!vCurrItem){
			var vItems = this.fItemIndex[pUrl];
			if (!vItems) return null;
			vCurrItem = vItems[0];
		}
		return (vCurrItem ? vCurrItem.cnt : null);
	},
	/** MenuManager.applyFilter - apply a filter on the menu based on the given array of vidible pages. */
	applyFilter : function(pPageList, pCallBack) {
		if (this.fOpt.neverFilter) return;
		//scCoLib.util.log("MenuManager.applyFilter");
		this.resetMenu();
		this.fFilter = true;
		for (var i=0; i<pPageList.length; i++){
			var vItems = this.fItemIndex[pPageList[i]];
			if (vItems){
				for (var j=0; j<vItems.length; j++){
					var vItem = vItems[j];
					vItem.vis = true;
					vItem.act = true;
					if (pCallBack) pCallBack(vItem);
					this.fOutline.cntAct++;
					while (vItem.par && !vItem.par.vis){
						vItem = vItem.par;
						vItem.vis = true;
					}
				}
			}
		}
		var vCnt = 0;
		var iSetRank = function (pItem){
			if (pItem.act) pItem.cnt = ++vCnt;
			if (pItem.children) {
				for (var i=0; i<pItem.children.length; i++) iSetRank(pItem.children[i]);
			}
		}
		iSetRank(this.fOutline);
		this.rebuildMenu();
		var iFindFirstItems = function (pItem, pArray){
			if (pItem.act) pArray.push(pItem);
			if (pArray.length >= searchMgr.fMaxFilterDisplay) return true;
			if (pItem.children) {
				for (var i=0; i<pItem.children.length; i++) if (iFindFirstItems(pItem.children[i], pArray)) return true;
			}
			else return false;
		}
		var vFirstItems = [];
		iFindFirstItems(this.fOutline, vFirstItems);
		for (var i=0; i<vFirstItems.length; i++){
			this.buildAncestorMenus(vFirstItems[i],false);
			this.openAncestors(vFirstItems[i]);
		}
		if (vFirstItems.length>0) this.fFirstFilteredItem = vFirstItems[0];
		searchMgr.xSwitchClass(this.fRoot, "mnu_sch_no", "mnu_sch_yes");
	},
	/** MenuManager.resetFilter - resert the current filter and rebuild the menu. */
	resetFilter : function(pPageList) {
		//scCoLib.util.log("MenuManager.resetFilter");
		this.fFilter = false;
		this.rebuildMenu();
		this.fFirstFilteredItem = null;
		searchMgr.xSwitchClass(this.fRoot, "mnu_sch_yes", "mnu_sch_no");
		if (this.fCurrItem) this.loadPage(this.fCurrItem.url);
	},
	/** MenuManager.loadPage - set the given url as the 'active' page. */
	loadPage : function(pUri) {
		// scCoLib.util.log("MenuManager.loadPage");
		var vItems;
		if (this.fCurrItem) {
			vItems = this.fItemIndex[this.fCurrItem.url];
			for (var i=0; i<vItems.length; i++) if (vItems[i].fLbl) searchMgr.xSwitchClass(vItems[i].fLbl, "mnu_sel_yes", "mnu_sel_no");
		}
		vItems = this.fItemIndex[pUri];
		if (!vItems) {
			if (this.fContext) this.fContext.innerHTML = "";
			this.fCurrItem = null;
			return;
		}
		var vItemPresent = false;
		for (var i=0; i<vItems.length; i++){
			var vItem = vItems[i];
			if (!this.fFilter || vItem.act){
				if (!vItem.fLbl) this.buildAncestorMenus(vItem);
				this.openAncestors(vItem);
				if (vItem.fLbl.fTglBtn && scPaLib.checkNode(searchMgr.sFilterTgleClosed,vItem.fLbl.fTglBtn)) this.toggleMnuItem(vItem.fLbl.fTglBtn);
				searchMgr.xSwitchClass(vItem.fLbl, "mnu_sel_no", "mnu_sel_yes");
				vItemPresent = true;
			}
		}
		if (!vItemPresent) {
			if (this.fContext) this.fContext.innerHTML = "";
			this.fCurrItem = null;
			return;
		}
		if (this.fRequestedItem && this.fRequestedItem.url == pUri) this.fCurrItem = this.fRequestedItem;
		else this.fCurrItem = vItems[0];
		if (this.fScrollerEnabled) this.ensureVisible();
		if (this.fContext) this.fContext.innerHTML = this.buildContextMenu(this.fCurrItem);
	},
	/** MenuManager.openAncestors - open all closed ancestors of the given item. */
	openAncestors : function(pItem) {
		// Make shure this label is visible (open all ancestors)
		var vClosedSubMnus = scPaLib.findNodes("anc:ul.mnu_sub_c",pItem.fLbl);
		for (var i=0; i < vClosedSubMnus.length; i++){
			this.toggleMnuItem(vClosedSubMnus[i].fTglBtn);
		}
	},
	/** MenuManager.sToggleMnuItem - sub-menu toggle button callback function. */
	sToggleMnuItem : function() {
		try{
			this.fUl.fMgr.toggleMnuItem(this);
		} catch(e){}
		return false;
	},
	/** MenuManager.toggleMnuItem - toggle the sub-menu of the given toggle button. */
	toggleMnuItem : function(pBtn) {
		//scCoLib.util.log("MenuManager.toggleMnuItem");
		if (!pBtn) return;
		var vStatus = pBtn.className;
		var vUl = pBtn.fUl;
		if (!vUl) return;
		if (!vUl.fBuilt) this.buildSubMenu(vUl);
		if(vStatus == "mnu_tgle_c") {
			pBtn.className = "mnu_tgle_o";
			pBtn.innerHTML = "<span>v</span>";
			pBtn.title = searchMgr.fStrings[23];
			vUl.className = vUl.className.replace("mnu_sub_c", "mnu_sub_o");
			if (scCoLib.isIE) this.fRoot.style.visibility = "hidden"; // controunement bug ie7
			vUl.style.display = "";
			if (scCoLib.isIE) this.fRoot.style.visibility = "";
			vUl.fClosed = false;
		} else {
			pBtn.className = "mnu_tgle_c";
			pBtn.innerHTML = "<span>></span>";
			pBtn.title = searchMgr.fStrings[22];
			vUl.className = vUl.className.replace("mnu_sub_o", "mnu_sub_c");
			vUl.style.display = "none";
			vUl.fClosed = true;
			var vOpendSubMnus = scPaLib.findNodes("chi:li/chi:ul.mnu_sub_o",vUl);
			for (var i=0; i < vOpendSubMnus.length; i++) this.toggleMnuItem(vOpendSubMnus[i].fTglBtn);
		}
		if (this.fOpt.addScroller) this.checkScrollBtns();
		if (searchMgr.fScroller) searchMgr.fScroller.refresh();
	},
	/** MenuManager scroll timer & size task */
	fClassOffUp : "btnOff",
	fClassOffDown : "btnOff",
	fSpeed : 0,
	execTask : function(){
		try {
			if(this.fSpeed == 0) return false;
			this.fRoot.scrollTop += this.fSpeed;
			return true;
		}catch(e){
			this.fSpeed = 0;
			return false;
		}
	},
	setScrollStep: function(pPx) {
		try {this.fRoot.scrollTop += pPx;}catch(e){}
	},
	ensureVisible: function(){
		if (!this.fCurrItem) return;
		var vParent = this.fCurrItem.fLbl.offsetParent;
		if( !vParent) return;
		var vOffset = this.fCurrItem.fLbl.offsetTop;
		while(vParent != this.fRoot) {
			var vNewParent = vParent.offsetParent;
			vOffset += vParent.offsetTop;
			vParent = vNewParent;
		}
		if (vOffset < this.fRoot.scrollTop) this.fRoot.scrollTop = vOffset;
		else if (vOffset + this.fCurrItem.fLbl.offsetHeight > this.fRoot.scrollTop + this.fRoot.clientHeight) this.fRoot.scrollTop = vOffset - this.fRoot.clientHeight + this.fCurrItem.fLbl.offsetHeight;
	},
	checkScrollBtns: function(){
		var vScrollTop = this.fRoot.scrollTop;
		var vBtnUpOff = this.fSrlUp.className.indexOf(this.fClassOffUp);
		if(vScrollTop <= 0) {
			if(vBtnUpOff < 0) this.fSrlUp.className+= " "+this.fClassOffUp;
		} else {
			if(vBtnUpOff >= 0) this.fSrlUp.className = this.fSrlUp.className.substring(0, vBtnUpOff);
		}
		var vContentH = scSiLib.getContentHeight(this.fRoot);
		var vBtnDownOff = this.fSrlDwn.className.indexOf(this.fClassOffDown);
		if( vContentH - vScrollTop <= this.fRoot.offsetHeight){
			if(vBtnDownOff < 0) this.fSrlDwn.className+= " "+this.fClassOffDown;
		} else {
			if(vBtnDownOff >=0) this.fSrlDwn.className = this.fSrlDwn.className.substring(0, vBtnDownOff);
		}
	},
	onResizedAnc:function(pOwnerNode, pEvent){
		if(pEvent.phase==1 || pEvent.resizedNode == pOwnerNode) return;
		this.ensureVisible();
		this.checkScrollBtns();
	},
	onResizedDes:function(pOwnerNode, pEvent){
		if(pEvent.phase==1) return;
		this.ensureVisible();
	},
	ruleSortKey : "checkScrollBtns"

}