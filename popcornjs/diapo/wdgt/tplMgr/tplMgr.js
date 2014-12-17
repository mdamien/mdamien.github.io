/* === Opale template manager =============================================== */
var tplMgr = {
/* === Public API =========================================================== */
	xMediaFallback: function(pMedia) {
		while (pMedia.firstChild) {
			if (pMedia.firstChild instanceof HTMLSourceElement) {
				pMedia.removeChild(pMedia.firstChild);
			} else {
				pMedia.parentNode.insertBefore(pMedia.firstChild, pMedia);
			}
		}
		pMedia.parentNode.removeChild(pMedia);
	}
}