


var scDragMgr = {
	fStartListeners : new Array(),
	fStopListeners : new Array(),



	makeContainer : function(pKey, pCatchment, pContainer, pIfEmpty, pImage) {
		this.dragdrop.makeContainer(pKey, pCatchment, pContainer, pIfEmpty, pImage); return this;
	},




	setMode : function(pContainer, pMode, pMax) {
		this.dragdrop.setMode(pContainer, pMode, pMax); return this;
	},



	setResizeOnDragOut : function(pContainer, pMode) {
		this.dragdrop.setResizeOnDragOut(pContainer, pMode); return this;
	},


	setDragOverClass : function(pContainer, pClass) {
		this.dragdrop.setDragOverClass(pContainer, pClass); return this;
	},


	getContainers : function (pKey, pRootNode) {
		return this.dragdrop.getContainers(pKey, pRootNode);
	},


	getLabels : function(pContainer) {
		return this.dragdrop.getLabels(pContainer);
	},



	repopulateContainers : function (pKey) {
		this.dragdrop.repopulateContainers(pKey); return this;
	},
	

	makeDraggableLabel : function(pKey, pLabel, pHandle) {
		this.dragdrop.makeDraggableLabel(pKey, pLabel, pHandle); return this;
	},
	

	setCallback : function(pLabel, pfunction) {
		this.dragdrop.setCallback(pLabel, pfunction); return this;
	},


	setDraggable : function (pLabel, pIsDraggable) {
		this.dragdrop.setDraggable(pLabel, pIsDraggable); return this;
	},


	setConstraintBox : function (pLabel, pNode) {



		this.dragdrop.setConstraintBox(pLabel, pNode); return this;
	},


	setDragClass : function(pLabel, pClass) {
		this.dragdrop.setDragClass(pLabel, pClass); return this;
	},


	saveLabelPos : function (pLabel) {
		return this.dragdrop.saveLabelPos(pLabel);
	},


	addStartListener: function(pFunc) {
		this.fStartListeners.push(pFunc)
	},
	

	addStopListener: function(pFunc) {
		this.fStopListeners.push(pFunc)
	}
}

scDragMgr.helpers = {
	
	addClass : function(pNode, pClass) {
		var vNewClassStr = pNode.className;
		for (var i = 1, n = arguments.length; i < n; i++) vNewClassStr += ' '+arguments[i];
		pNode.className = vNewClassStr;
		return scDragMgr.helpers;
	},
	
	delClass : function(pNode, pClass) {
		if (pClass != '') {
			var vCurrentClasses = pNode.className.split(' ');
			var vNewClasses = new Array();
			for (var i = 0, n = vCurrentClasses.length; i < n; i++) {
				var vClassFound = false;
				for (var j = 1, m = arguments.length; j < m; j++) {
					if (vCurrentClasses[i] == arguments[j]) vClassFound = true;
				}
				if (!vClassFound) vNewClasses.push(vCurrentClasses[i]);
			}
			pNode.className = vNewClasses.join(' ');
		}
		return scDragMgr.helpers;
	},
	
	switchClass : function(pNode, pClassOld, pClassNew) {
		if (pClassOld && pClassOld != '') {
			var vCurrentClasses = pNode.className.split(' ');
			var vNewClasses = new Array();
			var vClassFound = false;
			for (var i = 0, n = vCurrentClasses.length; i < n; i++) {
				if (vCurrentClasses[i] != pClassOld) {
					vNewClasses.push(vCurrentClasses[i]);
				} else {
					if (pClassNew && pClassNew != '') vNewClasses.push(pClassNew);
					vClassFound = true;
				}
			}
			if (pClassNew && pClassNew != '' && !vClassFound) vNewClasses.push(pClassNew);
			pNode.className = vNewClasses.join(' ');
		}
		return scDragMgr.helpers;
	},

	isMouseInside : function(pDragEvent, pContainter) {
		if(pContainter.fArea){
			switch(pContainter.shape.toLowerCase()){
			case "circle":
				return (pDragEvent.transformedMouseOffset.insideCircle(pContainter.centerPosition, pContainter.radius));
			case "poly":
				return (pDragEvent.transformedMouseOffset.insidePoly(pContainter.pointsPosition));
			case "rect":
				return (pDragEvent.transformedMouseOffset.insideBox(pContainter.topLeftPosition, pContainter.bottomRightPosition));
			}
		} else return (pDragEvent.transformedMouseOffset.inside(pContainter.topLeftPosition, pContainter.bottomRightPosition));
	},

	isTouchEvent : function(event) {
		if (event.type=="touchstart" || event.type=="touchmove" || event.type=="touchend" || event.type=="touchcancel")
			return true;
		return false;
	},

	map : function(array, func) {
		for (var i = 0, n = array.length; i < n; i++) func(array[i]);
	},

	nextItem : function(item, nodeName) {
		if (item == null) return;
		var next = item.nextSibling;
		while (next != null) {
			if (next.nodeName == nodeName) return next;
			next = next.nextSibling;
		}
		return null;
	},

	previousItem : function(item, nodeName) {
		var previous = item.previousSibling;
		while (previous != null) {
			if (previous.nodeName == nodeName) return previous;
			previous = previous.previousSibling;
		}
		return null;
	},

	moveBefore : function(item1, item2) {
		var parent = item1.parentNode;
		parent.removeChild(item1);
		parent.insertBefore(item1, item2);
	},

	moveAfter : function(item1, item2) {
		var parent = item1.parentNode;
		parent.removeChild(item1);
		parent.insertBefore(item1, item2 ? scDragMgr.helpers.nextItem(item2, item2.nodeName) : null);
	},
	
	isEltContainedByNode: function(pElt, pContainer) {
		var vElt = pElt;
		var vFound = false;
		if (vElt) {
			while (vElt.parentNode && !vFound) {
				vElt = vElt.parentNode;
				vFound = vElt == pContainer;
			}
		}
		return(vFound);
	}
}


scDragMgr.events = {

	fix : function(event) {
		if (!event) event = window.event;
		if (event.target) {
			if (event.target.nodeType == 3) event.target = event.target.parentNode;
		} else if (event.srcElement) {
			event.target = event.srcElement;
		}
		return event;
	},

	register : function(element, type, func) {
		if (element.addEventListener) {
			element.addEventListener(type, func, false);
		} else if (element.attachEvent) {
			if (!element._listeners) element._listeners = new Array();
			if (!element._listeners[type]) element._listeners[type] = new Array();
			var workaroundFunc = function() {
				func.apply(element, new Array());
			}
			element._listeners[type][func] = workaroundFunc;
			element.attachEvent('on' + type, workaroundFunc);
		}
	},

	unregister : function(element, type, func) {
		if (element.removeEventListener) {
			element.removeEventListener(type, func, false);
		} else if (element.detachEvent) {
			if (element._listeners && element._listeners[type] && element._listeners[type][func]) {
				element.detachEvent('on' + type, element._listeners[type][func]);
			}
		}
	}
}


scDragMgr.coordinates = {

	create : function(x, y) {
		return new _scDragMgrCoordinate(this, x, y);
	},

	origin : function() {
		return this.create(0, 0);
	},

	topLeftPosition : function(element) {
		var left = parseInt(scDragMgr.css.readStyle(element, "left"));
		var left = isNaN(left) ? 0 : left;
		var top = parseInt(scDragMgr.css.readStyle(element, "top"));
		var top = isNaN(top) ? 0 : top;
		return this.create(left, top);
	},

	bottomRightPosition : function(element) {
		return this.topLeftPosition(element).plus(this._size(element));
	},

	topLeftOffset : function(element) {
		var offset = this._offset(element);
		var parent = element.offsetParent;
		while (parent) {
			offset = offset.plus(this._offset(parent));
			offset = offset.minus(this._scroll(parent));
			parent = parent.offsetParent;
		}
		return offset;
	},

	bottomRightOffset : function(element) {
		return this.topLeftOffset(element).plus(this.create(element.offsetWidth, element.offsetHeight));
	},

	scrollOffset : function() {
		if (window.pageXOffset) {
			return this.create(window.pageXOffset, window.pageYOffset);
		} else if (document.documentElement) {
			return this.create(document.body.scrollLeft + document.documentElement.scrollLeft, document.body.scrollTop + document.documentElement.scrollTop);
		} else if (document.body.scrollLeft >= 0) {
			return this.create(document.body.scrollLeft, document.body.scrollTop);
		} else {
			return this.create(0, 0);
		}
	},

	clientSize : function() {
		if (window.innerHeight >= 0) {
			return this.create(window.innerWidth, window.innerHeight);
		} else if (document.documentElement) {
			return this.create(document.documentElement.clientWidth, document.documentElement.clientHeight);
		} else if (document.body.clientHeight >= 0) {
			return this.create(document.body.clientWidth, document.body.clientHeight);
		} else {
			return this.create(0, 0);
		}
	},

	/**
	 * mouse coordinate relative to the window (technically the
	 * browser client area) i.e. the part showing your page
	 */
	mousePosition : function(event) {
		event = scDragMgr.events.fix(event);

		var eventPositionElement=event;
		if (scDragMgr.helpers.isTouchEvent(event)) {

			if (event.type=="touchend") {
				eventPositionElement=event.changedTouches[0];
			} else {
				eventPositionElement=event.touches[0];
			}
		}
		return this.create(eventPositionElement.clientX, eventPositionElement.clientY);
	},

	/**
	 * mouse coordinate relative to the document
	 */
	mouseOffset : function(event) {
		var eventPositionElement=event;
		event = scDragMgr.events.fix(event);
		if (scDragMgr.helpers.isTouchEvent(event)) {
			if (event.type=="touchend") {
				eventPositionElement=event.changedTouches[0];
			} else {
				eventPositionElement=event.touches[0];
			}
		}
		if (eventPositionElement.pageX >= 0 || eventPositionElement.pageX < 0) {
			return this.create(eventPositionElement.pageX, eventPositionElement.pageY);
		} else if (eventPositionElement.clientX >= 0 || eventPositionElement.clientX < 0) {
			return this.mousePosition(event).plus(this.scrollOffset());
		}
	},

	_size : function(element) {
		return this.create(element.offsetWidth, element.offsetHeight);
	},

	_offset : function(element) {
		return this.create(element.offsetLeft,element.offsetTop);
	},

	_scroll : function(element) {
		return this.create(element.scrollLeft,element.scrollTop);
	}
}

function _scDragMgrCoordinate(factory, x, y) {
	this.factory = factory;
	this.x = isNaN(x) ? 0 : x;
	this.y = isNaN(y) ? 0 : y;
}

_scDragMgrCoordinate.prototype = {

	toString : function() {
		return "(" + this.x + "," + this.y + ")";
	},

	toHash : function() {
		return {"x":this.x,"y":this.y}
	},

	clone : function(that) {
		return this.factory.create(this.x, this.y);
	},

	plus : function(that) {
		return this.factory.create(this.x + that.x, this.y + that.y);
	},

	minus : function(that) {
		return this.factory.create(this.x - that.x, this.y - that.y);
	},

	min : function(that) {
		return this.factory.create(Math.min(this.x , that.x), Math.min(this.y , that.y));
	},

	max : function(that) {
		return this.factory.create(Math.max(this.x , that.x), Math.max(this.y , that.y));
	},

	constrainTo : function (one, two) {
		var min = one.min(two);
		var max = one.max(two);
		return this.max(min).min(max);
	},

	distance : function (that) {
		return Math.sqrt(Math.pow(this.x - that.x, 2) + Math.pow(this.y - that.y, 2));
	},

	reposition : function(element) {
		element.style["top"] = this.y + "px";
		element.style["left"] = this.x + "px";
	},


	insideBox : function(pTL, pBR) {
		return (this.x >= pTL.x) && (this.x <= pBR.x) &&(this.y >= pTL.y) && (this.y <= pBR.y);
	},


	insideCircle : function(pCR, pRad) {
		return (this.distance(pCR) <= pRad);
	},


	insidePoly : function(pPts) {
		for (var c = false, i = -1, l = pPts.length, j = l - 1; ++i < l; j = i)
			((pPts[i].y <= this.y && this.y < pPts[j].y) || (pPts[j].y <= this.y && this.y < pPts[i].y))
			&& (this.x < (pPts[j].x - pPts[i].x) * (this.y - pPts[i].y) / (pPts[j].y - pPts[i].y) + pPts[i].x)
			&& (c = !c);
		return c;	
	},

	inside : function(pTL, pBR) {
		return this.insideBox(pTL, pBR);
	}
}


scDragMgr.css = {

	readStyle : function(element, property, defaultVal) {
		defaultVal = typeof(defaultVal) != "undefined" ? defaultVal : null;
		try {
			if (element.style[property]) {
				return element.style[property];
			} else if (element.currentStyle) {
				return element.currentStyle[property];
			} else if (document.defaultView && document.defaultView.getComputedStyle) {
				var style = document.defaultView.getComputedStyle(element, null);
				var prop = property.replace(/([A-Z])/g,"-$1").toLowerCase();
				if (style[prop]) return style[prop];
				else return style.getPropertyValue(prop);
			} else {
				return defaultVal;
			}
		} catch (e) {
			return defaultVal;
		}
	}
}


scDragMgr.drag = {

	createSimpleGroup : function(element, handle) {
		handle = handle ? handle : element;
		var group = this.createGroup(element);
		group.setHandle(handle);
		group.transparentDrag();
		group.onTopWhileDragging();
		group.disableSelection();
		return group;
	},

	createGroup : function(element) {
		var group = new _scDragMgrDragGroup(this, element);
		element.fStylePosBase = scDragMgr.css.readStyle(element, 'position');
		element.fStylePosDrag = 'relative';
		element.style["position"] = element.fStylePosDrag;
		return group;
	},

	constraints : function() {
		return this._constraintFactory;
	},

	_createEvent : function(type, event, group) {
		return new _scDragMgrDragEvent(type, event, group);
	}
}

function _scDragMgrDragGroup(factory, element) {
	this.factory = factory;
	this.element = element;
	this._handle = null;
	this._draggable = true;
	this._thresholdDistance = 0;
	this._transforms = new Array();
	this._listeners = new Array();
	this._listeners['draginit'] = new Array();
	this._listeners['dragstart'] = new Array();
	this._listeners['dragmove'] = new Array();
	this._listeners['dragend'] = new Array();
}

_scDragMgrDragGroup.prototype = {
	/*
	 * TODO:
	 *   - unregister(type, func)
	 *   - move custom event listener stuff into Event library
	 *   - keyboard nudging of "selected" group
	 */

	setHandle : function(handle) {
		var events = scDragMgr.events;

		handle.scDragMgrDragGroup = this;
		events.register(handle, 'mousedown', this._dragInit);
		handle.onmousedown = function() { return false }

		events.register(handle, 'touchstart', this._dragInit);
		handle.ontouchstart = function() { return false }

		if (this.element != handle) events.unregister(this.element, 'mousedown', this._dragInit);
		if (this.element != handle) events.unregister(this.element, 'touchstart', this._dragInit);
	},

	register : function(type, func) {
		this._listeners[type].push(func);
	},

	addTransform : function(transformFunc) {
		this._transforms.push(transformFunc);
	},

	verticalOnly : function() {
		this.addTransform(this.factory.constraints().vertical());
	},

	horizontalOnly : function() {
		this.addTransform(this.factory.constraints().horizontal());
	},

	setThreshold : function(thresholdDistance) {
		this._thresholdDistance = thresholdDistance;
	},

	transparentDrag : function(opacity) {
		var opacity = typeof(opacity) != "undefined" ? opacity : 0.75;
		var originalOpacity = scDragMgr.css.readStyle(this.element, "opacity", "");
		this.register('dragstart', function(dragEvent) {
			var element = dragEvent.group.element;
			element.style.opacity = opacity;
			element.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
		})
		this.register('dragend', function(dragEvent) {
			var element = dragEvent.group.element;
			element.style.opacity = originalOpacity;
			element.style.filter = 'alpha(opacity=100)';
		})
	},

	onTopWhileDragging : function(zIndex) {
		var zIndex = typeof(zIndex) != "undefined" ? zIndex : 100000;
		var originalZIndex = scDragMgr.css.readStyle(this.element, "zIndex", "");
		this.register('dragstart', function(dragEvent) {
			dragEvent.group.element.style.zIndex = zIndex;
		})
		this.register('dragend', function(dragEvent) {
			dragEvent.group.element.style.zIndex = originalZIndex;
		})
	},

	setDraggable : function(draggable) {
		this._draggable = draggable;
	},

	disableSelection : function() {
		this.element.onselectstart = function() {return false;}
		this.element.unselectable = "on";
		this.element.style.MozUserSelect = "none";
	},

	_dragInit : function(event) {
		try{
			event = scDragMgr.events.fix(event)
			var group = scDragMgr.scDragMgrDragGroup = this.scDragMgrDragGroup;
			var dragEvent = group.factory._createEvent('draginit', event, group);
			if (group._draggable) {
				if (scDragMgr.helpers.isTouchEvent(event)) {
					event.stopPropagation();
					event.preventDefault();
				}
				group._isThresholdExceeded = false;
				group._initialMouseOffset = dragEvent.mouseOffset;
				group._grabOffset = dragEvent.mouseOffset.minus(dragEvent.topLeftOffset);
				scDragMgr.events.register(document, 'mousemove', group._drag);
				scDragMgr.events.register(document, 'touchmove', group._drag);
				document.onmousemove = function() { return false };
				scDragMgr.events.register(document, 'mouseup', group._dragEnd);
				scDragMgr.events.register(document, 'touchend', group._dragEnd);
				scDragMgr.events.register(document, 'touchcancel', group._dragEnd);
				group._notifyListeners(dragEvent);
				for (var i=0; i<scDragMgr.fStartListeners.length; i++) try{scDragMgr.fStartListeners[i](group);}catch(e){}
			}
		} catch(e) {scCoLib.util.logError("_scDragMgrDragGroup._dragInit: ", e);}
	},

	_drag : function(event) {
		try{
			event = scDragMgr.events.fix(event);
			var coordinates = scDragMgr.coordinates;
			var group = this.scDragMgrDragGroup || scDragMgr.scDragMgrDragGroup;
			if (!group) return;
			if (scDragMgr.helpers.isTouchEvent(event)) {
				event.stopPropagation();
				event.preventDefault();
			}
			var dragEvent = group.factory._createEvent('dragmove', event, group);
			var newTopLeftOffset = dragEvent.mouseOffset.minus(group._grabOffset);
			if (!group._isThresholdExceeded) {
				var distance = dragEvent.mouseOffset.distance(group._initialMouseOffset);
				if (distance < group._thresholdDistance) return;
				group._isThresholdExceeded = true;
				group._notifyListeners(group.factory._createEvent('dragstart', event, group));
			}
			for (var i=0; i<group._transforms.length; i++) {
				var transform = group._transforms[i];
				newTopLeftOffset = transform(newTopLeftOffset, dragEvent);
			}
			var dragDelta = newTopLeftOffset.minus(dragEvent.topLeftOffset);
			var newTopLeftPosition = dragEvent.topLeftPosition.plus(dragDelta);
			newTopLeftPosition.reposition(group.element);
			dragEvent.transformedMouseOffset = newTopLeftOffset.plus(group._grabOffset);
			group._notifyListeners(dragEvent);
			var errorDelta = newTopLeftOffset.minus(coordinates.topLeftOffset(group.element));
			if (errorDelta.x != 0 || errorDelta.y != 0) {
				coordinates.topLeftPosition(group.element).plus(errorDelta).reposition(group.element);
			}
		} catch(e) {scCoLib.util.logError("_scDragMgrDragGroup._drag: ", e);}
	},

	_dragEnd : function(event) {
		try{
			event = scDragMgr.events.fix(event);
			var group = this.scDragMgrDragGroup || scDragMgr.scDragMgrDragGroup;
			var dragEvent = group.factory._createEvent('dragend', event, group);
			if (scDragMgr.helpers.isTouchEvent(event)) {
				event.stopPropagation();
				event.preventDefault();
			}
			group._notifyListeners(dragEvent);
			for (var i=0; i<scDragMgr.fStopListeners.length; i++) try{scDragMgr.fStopListeners[i](group);}catch(e){}
			if(this.scDragMgrDragGroup) this.scDragMgrDragGroup = null;
			if(scDragMgr.scDragMgrDragGroup) scDragMgr.scDragMgrDragGroup = null;
			scDragMgr.events.unregister(document, 'mousemove', group._drag);
			document.onmousemove = null;
			scDragMgr.events.unregister(document, 'mouseup', group._dragEnd);
			document.mouseup = null;
			scDragMgr.events.unregister(document, 'touchmove', group._drag);
			scDragMgr.events.unregister(document, 'touchend', group._dragEnd);
			scDragMgr.events.unregister(document, 'touchcancel', group._dragEnd);
		} catch (e){scCoLib.util.logError("_scDragMgrDragGroup._dragEnd: ", e);}
	},
	
	_notifyListeners : function(dragEvent) {
		try{
			var listeners = this._listeners[dragEvent.type];
			for (var i=0; i<listeners.length; i++) {
				listeners[i](dragEvent);
			}
		} catch(e) {scCoLib.util.logError("_scDragMgrDragGroup._notifyListeners: ", e);}
	}
}

function _scDragMgrDragEvent(type, event, group) {
	this.type = type;
	this.group = group;
	this.mousePosition = scDragMgr.coordinates.mousePosition(event);
	this.mouseOffset = scDragMgr.coordinates.mouseOffset(event);
	this.transformedMouseOffset = this.mouseOffset;
	this.topLeftPosition = scDragMgr.coordinates.topLeftPosition(group.element);
	this.topLeftOffset = scDragMgr.coordinates.topLeftOffset(group.element);
	this.bottomRightPosition = scDragMgr.coordinates.bottomRightPosition(group.element);
	this.bottomRightOffset = scDragMgr.coordinates.bottomRightOffset(group.element);
}

_scDragMgrDragEvent.prototype = {
	toString : function() {
		return "mouse: " + this.mousePosition + this.mouseOffset + " - " +	"xmouse: " + this.transformedMouseOffset + " - " +	"left,top: " + this.topLeftPosition + this.topLeftOffset;
	}
}

scDragMgr.drag._constraintFactory = {
	
	vertical : function() {
		return function(coordinate, dragEvent) {
			var x = dragEvent.topLeftOffset.x;
			return coordinate.x != x ? coordinate.factory.create(x, coordinate.y) : coordinate;
		}
	},

	horizontal : function() {
		return function(coordinate, dragEvent) {
			var y = dragEvent.topLeftOffset.y;
			return coordinate.y != y ? coordinate.factory.create(coordinate.x, y) : coordinate;
		}
	}
}


scDragMgr.dragdrop = {
	

	fFirstCatchments : new Array(),
	fLastCatchments : new Array(),



	makeContainer : function (pKey, pCatchment, pContainer, pIfEmpty, pImage) {
		try {
			var vKey = (typeof pKey != "undefined") ? pKey : 'defaultKey' ;
			vKey = (vKey.length == 0) ? 'defaultKey' : vKey;
			if (typeof pCatchment.fKey != "undefined") {
				scCoLib.util.logError("dragdrop.makeContainer: "+pCatchment.id+" is already init.");
				return
			}

			pCatchment.fKey = vKey;
			pCatchment.fResizeOnDragOut = false;
			pCatchment.fUpdatable = true;
			pCatchment.onDragOver = new Function(); // public dragover  event (for styles etc)
			pCatchment.onDragOut = new Function(); //public dragout event (for styles etc)
			pCatchment.xUpdateGui = this._UpdateGui;
			pCatchment.xIsDropable = this._IsDropable;
			pCatchment.xOnDragOver = this._onDragOver;
			pCatchment.xOnDragOut = this._onDragOut;
			if (pCatchment.tagName.toLowerCase()=="area"){
				if (typeof pImage == "undefined") {
					scCoLib.util.logError("dragdrop.makeContainer: area catchment without an image.");
					return
				}
				pCatchment.fArea = true;
				pCatchment.fImage = pImage
				var vCoods = pCatchment.coords.split(",");
				switch(pCatchment.shape.toLowerCase()){
				case "circle":
					pCatchment.centerDelta = scDragMgr.coordinates.create(scCoLib.toInt(vCoods[0]),scCoLib.toInt(vCoods[1]));
					pCatchment.radius = scCoLib.toInt(vCoods[2]);
					break;
				case "poly":
					pCatchment.pointsDelta = new Array(vCoods.length/2);
					pCatchment.pointsPosition = new Array(vCoods.length/2);
					for (var i = 0; i < pCatchment.pointsDelta.length; i++){
						pCatchment.pointsDelta[i] = scDragMgr.coordinates.create(scCoLib.toInt(vCoods[2*i]),scCoLib.toInt(vCoods[2*i+1]));
					}
					break;
				case "rect":
					pCatchment.topLeftDelta = scDragMgr.coordinates.create(scCoLib.toInt(vCoods[0]),scCoLib.toInt(vCoods[1]));
					pCatchment.bottomRightDelta = scDragMgr.coordinates.create(scCoLib.toInt(vCoods[2]),scCoLib.toInt(vCoods[3]));
				}
			}
			

			if (typeof this.fFirstCatchments[pCatchment.fKey] == "undefined") {
				this.fFirstCatchments[pCatchment.fKey] = this.fLastCatchments[pCatchment.fKey] = pCatchment;
				pCatchment.fPreviousCatchment = null;
				pCatchment.fNextCatchment = null;
			} else {
				pCatchment.fPreviousCatchment = this.fLastCatchments[pCatchment.fKey];
				pCatchment.fNextCatchment = null;
				this.fLastCatchments[pCatchment.fKey].fNextCatchment = pCatchment;
				this.fLastCatchments[pCatchment.fKey] = pCatchment;
			}

			if (typeof pContainer != "undefined") {
				pContainer.fDelaultDisplay = scDragMgr.css.readStyle(pContainer, "display");
				pContainer.fCatchment = pCatchment;
				pCatchment.fContainer = pContainer;
				this.setMode(pContainer, "ordered", -1);
				this.setDragOverClass(pContainer, "");
			}

			if (pIfEmpty && typeof pIfEmpty != "undefined") {
				pIfEmpty.fDelaultDisplay = scDragMgr.css.readStyle(pIfEmpty, "display");
				pCatchment.fIfEmpty = pIfEmpty;
			}
			pCatchment.fIsEmpty = pCatchment.xUpdateGui();
		} catch (vError) {
			scCoLib.util.logError("dragdrop.makeContainer: ", vError);
		}
	},


	setMode : function(pContainer, pMode, pMax) {
		try {
			if  (typeof pContainer.fCatchment != "undefined") {
				var vCatchment = pContainer.fCatchment;
				vCatchment.fDropMode = pMode;
				vCatchment.fMaxLabels = pMax;
				switch(vCatchment.fDropMode.toLowerCase()){
					case "ordered":
						vCatchment.xOnDragPostProcess = this._onDragSort;
						vCatchment.xOnDragEndPostProcess = this._onDropReposition;
						break;
					case "append":
						vCatchment.xOnDragPostProcess = new Function();
						vCatchment.xOnDragEndPostProcess = this._onDropReposition;
						break;
					case "inBulk":
						vCatchment.xOnDragPostProcess = new Function();
						vCatchment.xOnDragEndPostProcess = new Function();
				}
			}
		} catch (vError) {
			scCoLib.util.logError("dragdrop.setMode: ", vError);
		}
	},


	setResizeOnDragOut : function(pContainer, pMode) {
		try {
			pContainer.fCatchment.fResizeOnDragOut = pMode;
		} catch (vError) {
			scCoLib.util.logError("dragdrop.setResizeOnDragOut: ", vError);
		}
	},


	setDragOverClass : function(pContainer, pClass) {
		if (pClass) pContainer.fCatchment.fDragOverClass = pClass;
		else pContainer.fCatchment.fDragOverClass = "";
	},


	getContainers : function(pKey, pRootNode) {
		try {
			var vContainers = new Array();
			var vCatchment = scDragMgr.dragdrop.fFirstCatchments[pKey];
			while (vCatchment != null) {
				if (scDragMgr.helpers.isEltContainedByNode(vCatchment, pRootNode)) vContainers.push(vCatchment.fContainer);
				vCatchment = vCatchment.fNextCatchment;
			}
			return (vContainers)
		} catch (vError) {
			scCoLib.util.logError("dragdrop.getContainers: ", vError);
		}
	},


	getLabels : function(pContainer) {
		try {
			var vLabels = new Array();
			if  (typeof pContainer != "undefined") {
				var vChild = pContainer.firstChild;
				while (vChild != null) {
					if  (vChild.fIsDraggable) vLabels.push(vChild);
					vChild = vChild.nextSibling;
				}
			}
			return (vLabels);
		} catch (vError) {
			scCoLib.util.logError("dragdrop.getLabels: ", vError);
		}
	},
	

	countLabels : function(pContainer) {
		try {
			var vCount = 0;
			if  (typeof pContainer != "undefined") {
				var vChild = pContainer.firstChild;
				while (vChild != null) {
					if  (vChild.fIsDraggable) vCount++;
					vChild = vChild.nextSibling;
				}
			}
			return (vCount)
		} catch (vError) {
			scCoLib.util.logError("dragdrop.countLabels: ", vError);
		}
	},



	repopulateContainers : function (pKey) {
		try {
			var vCatchment = scDragMgr.dragdrop.fFirstCatchments[pKey];
			while (vCatchment != null) {
				this._emptyLabels(vCatchment.fContainer);
				vCatchment = vCatchment.fNextCatchment;
			}
			vCatchment = scDragMgr.dragdrop.fFirstCatchments[pKey];
			while (vCatchment != null) {
				this._populate(vCatchment.fContainer);
				vCatchment = vCatchment.fNextCatchment;
			}
		} catch (vError) {
			scCoLib.util.logError("dragdrop.repopulateContainers: ", vError);
		}
	},
	

	makeDraggableLabel : function(pKey, pLabel, pHandle) {
		try {
			var vKey = (typeof pKey != "undefined") ? pKey : 'defaultKey';
			vKey = (vKey.length == 0) ? 'defaultKey' : vKey;
			if (typeof pLabel.fKey != "undefined") {
				scCoLib.util.logError("dragdrop.makeDraggableLabel: "+pLabel.id+" is already init.");
				return
			}
			pLabel.fIsDraggable = true;

			if (pLabel.parentNode.fCatchment && pLabel.parentNode.fCatchment.xUpdateGui) {
				pLabel.parentNode.fCatchment.xUpdateGui();
			}
			pHandle = pHandle ? pHandle : pLabel;
			var vGroup = scDragMgr.drag.createGroup(pLabel);
			vGroup.setHandle(pHandle);
			vGroup.transparentDrag();
			vGroup.setThreshold(4);
			vGroup.onTopWhileDragging();
			vGroup.disableSelection();
			vGroup.register('dragstart', this._onDragStart);
			vGroup.register('dragmove', this._onDragMove);
			vGroup.register('dragend', this._onDragEnd);
			pLabel.fStartParent = null;
			pLabel.fLastParent = null;
			pLabel.fKey = vKey;
			pLabel.fGroup = vGroup;
			pLabel.xDropCallback = new Function();
		} catch (vError) {
			scCoLib.util.logError("dragdrop.makeDraggableLabel: ", vError);
		}
	},
	

	setConstraintBox : function(pLabel, pNode) {
		try {
			var vCoords = scDragMgr.coordinates;
			var vMaxTopLeft = vCoords.topLeftOffset(pNode);
			var vMaxBottomRight = vCoords.bottomRightOffset(pNode).minus(vCoords._size(pLabel));
			pLabel.fGroup.addTransform(function(pCoordinate, pDragEvent) {
				return pCoordinate.constrainTo(vMaxTopLeft, vMaxBottomRight);
			})
		} catch (vError) {
			scCoLib.util.logError("dragdrop.setConstraintBox: ", vError);
		}
	},
	

	setCallback : function(pLabel, pfunction) {
		try {
			pLabel.xDropCallback = pfunction;
		} catch (vError) {
			scCoLib.util.logError("dragdrop.setCallback: ", vError);
		}
	},


	setDraggable : function (pLabel, pIsDraggable) {
		try {
			pLabel.fGroup.setDraggable(pIsDraggable);
			var vStyle = pLabel.style;
			if(vStyle["position"]) vStyle["position"] = (pIsDraggable ? (pLabel.fStylePosDrag ? pLabel.fStylePosDrag : 'relative') : (pLabel.fStylePosBase ? pLabel.fStylePosBase : 'static'));
		} catch (vError) {
			scCoLib.util.logError("dragdrop.setDraggable: ", vError);
		}
	},


	setDragClass : function(pLabel, pClass) {
		if (pClass) pLabel.fDragClass = pClass;
		else pLabel.fDragClass = "";
	},


	saveLabelPos : function (pLabel) {
		try {
			var vRetVal = 'x:'+pLabel.offsetLeft;
			vRetVal += ',y:'+pLabel.offsetTop;
			return vRetVal;
		} catch (vError) {
			scCoLib.util.logError("dragdrop.saveLabelPos: ", vError);
		}
	},



	_emptyLabels : function(pContainer) {
		if  (typeof pContainer != "undefined") {
			var vChild = pContainer.firstChild;
			while (vChild != null) {
				if  (vChild.fIsDraggable) {
					var vNextChild = vChild.nextSibling;
					pContainer.removeChild(vChild);
					vChild = vNextChild;
				} else vChild = vChild.nextSibling;
			}
		}
	},


	_populate : function(pContainer) {
		if  (typeof pContainer != "undefined" && pContainer.labelsToAdd) {
			for (var i = 0, n = pContainer.labelsToAdd.length; i < n; i++) {
				if (pContainer.labelsToAdd[i] && pContainer.labelsToAdd[i].label) {
					var vLabel = pContainer.labelsToAdd[i].label;
					pContainer.appendChild(vLabel);
					if (pContainer.fCatchment.fDropMode == 'inBulk') {
						scDragMgr.coordinates.create((pContainer.labelsToAdd[i].x ? pContainer.labelsToAdd[i].x : 0), (pContainer.labelsToAdd[i].y ? pContainer.labelsToAdd[i].y : 0)).reposition(vLabel);
					} else scDragMgr.coordinates.create(0, 0).reposition(vLabel);
				}
			}
			pContainer.fCatchment.fUpdatable = true;
			pContainer.fCatchment.xUpdateGui();
			pContainer.labelsToAdd = null;
		}
	},
	

	_UpdateCatchments : function(pKey, pForce) {
		var vCatchment = scDragMgr.dragdrop.fFirstCatchments[pKey];
		while (vCatchment != null) {
			if (pForce || vCatchment.fUpdatable){
				if(vCatchment.fArea){
					var vImgtopLeftPosition = scDragMgr.coordinates.topLeftOffset(vCatchment.fImage);
					switch(vCatchment.shape.toLowerCase()){
					case "circle":
						vCatchment.centerPosition = vImgtopLeftPosition.plus(vCatchment.centerDelta);
						break;
					case "poly":
						for (var i = 0; i < vCatchment.pointsDelta.length; i++) vCatchment.pointsPosition[i] = vImgtopLeftPosition.plus(vCatchment.pointsDelta[i]);
						break;
					case "rect":
						vCatchment.topLeftPosition = vImgtopLeftPosition.plus(vCatchment.topLeftDelta);
						vCatchment.bottomRightPosition = vImgtopLeftPosition.plus(vCatchment.bottomRightDelta);
					}
				} else {
					vCatchment.topLeftPosition = scDragMgr.coordinates.topLeftOffset(vCatchment);
					vCatchment.bottomRightPosition = scDragMgr.coordinates.bottomRightOffset(vCatchment);
				}
				vCatchment.fUpdatable = false;
			}
			vCatchment = vCatchment.fNextCatchment;
		}
	},
	

	_UpdateGui : function() {
		var vHasItems = false;
		if  (typeof this.fContainer != "undefined") {
			var vChild = this.fContainer.lastChild;
			while (vChild != null && !vHasItems) {
				if  (vChild.fIsDraggable) {
					vHasItems = true;
				}
				vChild = vChild.previousSibling;
			}
			if (typeof this.fIfEmpty != "undefined") {
				if (typeof this.fContainer != "undefined" && this.fContainer != this) this.fContainer.style["display"] = (!vHasItems ? "none" : this.fContainer.fDelaultDisplay);
				this.fIfEmpty.style["display"] = (vHasItems ? "none" : this.fIfEmpty.fDelaultDisplay);
			}
		}
		scDragMgr.dragdrop._UpdateCatchments(this.fKey);
		return vHasItems;
	},


	_IsDropable : function(pDragEvent) {
		return( this.fMaxLabels == -1 || scDragMgr.dragdrop.countLabels(this.fContainer) < this.fMaxLabels || pDragEvent.group.element.parentNode.fCatchment == this );
	},

	_onDragOver : function(pDragEvent) {
		var vItem = pDragEvent.group.element;
		var vCurrentCatchment = vItem.parentNode.fCatchment;
		vCurrentCatchment.onDragOut();
		scDragMgr.helpers.delClass(vCurrentCatchment, vCurrentCatchment.fDragOverClass);
		vCurrentCatchment.fContainer.removeChild(vItem);
		vCurrentCatchment.fUpdatable = true;
		vCurrentCatchment.xUpdateGui();
		this.fContainer.appendChild(vItem);
		this.fContainer.fCatchment.fUpdatable = true;
		vItem.fLastContainer = this.fContainer;
		this.xUpdateGui();
		this.onDragOver();
		scDragMgr.helpers.addClass(this, this.fDragOverClass);
	},

	_onDragOut : function(pDragEvent) {
		var vItem = pDragEvent.group.element;
		var vCurrentContainer = vItem.parentNode;
		var vCurrentCatchment = vCurrentContainer.fCatchment;
		vCurrentCatchment.onDragOut()
		scDragMgr.helpers.delClass(vCurrentCatchment, vCurrentCatchment.fDragOverClass);
		vItem.fLastContainer = null;
		if (! vCurrentCatchment.fResizeOnDragOut){

			if (scCoLib.isIE){

				vCurrentCatchment.style.height = (vCurrentCatchment.offsetHeight - scCoLib.toInt(vCurrentCatchment.currentStyle.borderTopWidth) - scCoLib.toInt(vCurrentCatchment.currentStyle.borderBottomWidth))+"px";
				vCurrentCatchment.style.width = (vCurrentCatchment.offsetWidth - scCoLib.toInt(vCurrentCatchment.currentStyle.borderLeftWidth) - scCoLib.toInt(vCurrentCatchment.currentStyle.borderRightWidth))+"px";
			} else {
				vCurrentCatchment.style.height = (vCurrentCatchment.clientHeight!=""?vCurrentCatchment.clientHeight+"px":"");
				vCurrentCatchment.style.width = (vCurrentCatchment.clientWidth!=""?vCurrentCatchment.clientWidth+"px":"");
			}
		}
		if (vCurrentContainer != vItem.fStartContainer) {
			vCurrentCatchment.fContainer.removeChild(vItem);
			vCurrentCatchment.fUpdatable = true;
			vCurrentCatchment.xUpdateGui();
			if (vItem.fStartPrevSibling) vItem.fStartContainer.insertBefore(vItem, vItem.fStartPrevSibling ? scDragMgr.helpers.nextItem(vItem.fStartPrevSibling, vItem.fStartPrevSibling.nodeName) : null);
			else if (vItem.fStartNextSibling) vItem.fStartContainer.insertBefore(vItem, vItem.fStartNextSibling);
			else vItem.fStartContainer.appendChild(vItem);
			vItem.fStartContainer.fCatchment.fUpdatable = true;
		} else {
			if (vItem.fStartPrevSibling) scDragMgr.helpers.moveAfter(vItem, vItem.fStartPrevSibling);
			else if (vItem.fStartNextSibling) scDragMgr.helpers.moveBefore(vItem, vItem.fStartNextSibling);
		}
		vItem.fStartContainer.fCatchment.xUpdateGui();
	},

	_onDropReposition : function(pDragEvent) {
		var vItem = pDragEvent.group.element
		scDragMgr.coordinates.create(0, 0).reposition(vItem);
	},


	_onDragSort : function(pDragEvent) {
		var vHelpers = scDragMgr.helpers;
		var vItem = pDragEvent.group.element;
		var vMoveTo = null;
		var vCoordinates = scDragMgr.coordinates;
		var vXmouse = pDragEvent.transformedMouseOffset;
		var vPrevious = vHelpers.previousItem(vItem, vItem.nodeName);
		while (vPrevious != null) {
			var vThreshold = vCoordinates.bottomRightOffset(vPrevious);
			if (vXmouse.y <= vThreshold.y && vXmouse.x <= vThreshold.x) {
				vMoveTo = vPrevious;
			}
			vPrevious = vHelpers.previousItem(vPrevious, vItem.nodeName);
		}
		if (vMoveTo != null) {
			vHelpers.moveBefore(vItem, vMoveTo);
			vItem.fForceDropCallback = true;
			return;
		}
		var vNext = vHelpers.nextItem(vItem, vItem.nodeName)
		while (vNext != null) {
			var vThreshold = vCoordinates.topLeftOffset(vNext);
			if (vThreshold.y <= vXmouse.y && vThreshold.x <= vXmouse.x) {
				vMoveTo = vNext;
			}
			vNext = vHelpers.nextItem(vNext, vItem.nodeName);
		}
		if (vMoveTo != null) {
			vHelpers.moveBefore(vItem, vHelpers.nextItem(vMoveTo, vItem.nodeName));
			vItem.fForceDropCallback = true;
			return;
		}
	},


	_onDragStart : function(pDragEvent) {
		var vItem = pDragEvent.group.element;

		scDragMgr.dragdrop._UpdateCatchments(vItem.fKey, true);
		
		vItem.fStartContainer = vItem.parentNode;
		vItem.fStartPrevSibling = scDragMgr.helpers.previousItem(vItem, vItem.nodeName);
		vItem.fStartNextSibling = scDragMgr.helpers.nextItem(vItem, vItem.nodeName);
		vItem.fLastContainer = vItem.fStartContainer;
		scDragMgr.helpers.addClass(vItem, vItem.fDragClass);
		vItem.parentNode.fCatchment.onDragOver();
		

		if (scTooltipMgr) scTooltipMgr.hideTooltip(true);

		scDragMgr.helpers.addClass(vItem.parentNode.fCatchment, vItem.parentNode.fCatchment.fDragOverClass);
	},

	_onDragMove : function(pDragEvent) {
		var vItem = pDragEvent.group.element;


		var vIsOutside = true;
		var vCatchment = scDragMgr.dragdrop.fFirstCatchments[vItem.fKey];
		while (vCatchment != null) {
			if (scDragMgr.helpers.isMouseInside(pDragEvent, vCatchment) && vCatchment.xIsDropable(pDragEvent)) {
				vIsOutside = false;
				break;
			}
			vCatchment = vCatchment.fNextCatchment;
		}

		if (vIsOutside) {
			if (vItem.fLastContainer != null) {
				vItem.fLastContainer.fCatchment.xOnDragOut(pDragEvent);
			}

		} else if (vCatchment && (vItem.fLastContainer == null || vCatchment != vItem.fLastContainer.fCatchment)) {
			vCatchment.xOnDragOver(pDragEvent);
		}
		if (vCatchment) vCatchment.xOnDragPostProcess(pDragEvent, vCatchment);
	},

	_onDragEnd : function(pDragEvent) {
		var vItem = pDragEvent.group.element;
		scDragMgr.helpers.delClass(vItem, vItem.fDragClass);
		vItem.parentNode.fCatchment.onDragOut();
		scDragMgr.helpers.delClass(vItem.parentNode.fCatchment, vItem.parentNode.fCatchment.fDragOverClass);

		var vCatchment = scDragMgr.dragdrop.fFirstCatchments[vItem.fKey];
		while (vCatchment != null) {
			if (! vCatchment.fResizeOnDragOut){
				vCatchment.style.height="";
				vCatchment.style.width="";
			}
			vCatchment = vCatchment.fNextCatchment;
		}
		if (vItem.fForceDropCallback || vItem.fStartContainer != vItem.parentNode) {
			try{
				vItem.xDropCallback();
			} catch (vError){
				scCoLib.util.logError("dragdrop._onDragEnd: ", vError);
			}
		}
		vItem.parentNode.fCatchment.xOnDragEndPostProcess(pDragEvent);
	}
}
