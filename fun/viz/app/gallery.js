elementResizeEvent = function(element, fn) {
  var window = this;
  var document = window.document;

  var attachEvent = document.attachEvent;
  if (typeof navigator !== "undefined") {
    var isIE = navigator.userAgent.match(/Trident/);
  }

  var requestFrame = (function() {
    var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) {
        return window.setTimeout(fn, 20);
      };
    return function(fn) {
      return raf(fn);
    };
  })();

  var cancelFrame = (function() {
    var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
      window.clearTimeout;
    return function(id) {
      return cancel(id);
    };
  })();

  function resizeListener(e) {
    var win = e.target || e.srcElement;
    if (win.__resizeRAF__) {
      cancelFrame(win.__resizeRAF__);
    }
    win.__resizeRAF__ = requestFrame(function() {
      var trigger = win.__resizeTrigger__;
      trigger.__resizeListeners__.forEach(function(fn) {
        fn.call(trigger, e);
      });
    });
  }

  function objectLoad(e) {
    this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
    this.contentDocument.defaultView.addEventListener('resize', resizeListener);
  }

  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    if (attachEvent) {
      element.__resizeTrigger__ = element;
      element.attachEvent('onresize', resizeListener);
    } else {
      if (getComputedStyle(element).position == 'static') {
        element.style.position = 'relative';
      }
      var obj = element.__resizeTrigger__ = document.createElement('object');
      obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
      obj.setAttribute('class', 'resize-sensor');
      obj.__resizeElement__ = element;
      obj.onload = objectLoad;
      obj.type = 'text/html';
      if (isIE) {
        element.appendChild(obj);
      }
      obj.data = 'about:blank';
      if (!isIE) {
        element.appendChild(obj);
      }
    }
  }
  element.__resizeListeners__.push(fn);
};




componentWidthMixin = {
  getInitialState: function() {
    if (this.props.initialComponentWidth !== undefined && this.props.initialComponentWidth !== null) {
      return {
        componentWidth: this.props.initialComponentWidth
      };
    } else {
      return {};
    }
  },
  // Add our resize sensor.
  componentDidMount: function() {
    this.setState({
      componentWidth: this.getDOMNode().offsetWidth
    });
    elementResizeEvent(this.getDOMNode(), this.onResize);
  },
  // When the DOM updates, check that our resize sensor is still there.
  componentDidUpdate: function() {
    if (0 === this.getDOMNode().getElementsByClassName('resize-sensor').length) {
      elementResizeEvent(this.getDOMNode(), this.onResize);
    }
  },
  onResize: function() {
    this.setState({
      componentWidth: this.getDOMNode().offsetWidth
    });
  }
};

calculateLayout = function(props, state) {
  var childComponentWidth, componentsPerRow, idealComponentsPerRow;
  if (props.margin === 0) {
    idealComponentsPerRow = state.componentWidth / props.targetWidth;
  } else {
    idealComponentsPerRow = ((state.componentWidth / props.margin) + 1) / ((props.targetWidth / props.margin) + 1);
  }
  componentsPerRow = Math.round(idealComponentsPerRow);
  childComponentWidth = ((state.componentWidth + props.margin) / componentsPerRow) - props.margin;
  return [childComponentWidth, componentsPerRow];
};

PropTypes = React.PropTypes;


ComponentGallery = React.createClass({
  displayName: "ComponentGallery",
  mixins: [componentWidthMixin],
  propTypes: {
    children: PropTypes.any.isRequired,
    disableServerRender: PropTypes.bool,
    margin: PropTypes.number,
    noMarginBottomOnLastRow: PropTypes.bool,
    marginBottom: PropTypes.number,
    targetWidth: PropTypes.number,
    widthHeightRatio: PropTypes.number
  },
  getDefaultProps: function() {
    return {
      margin: 10,
      noMarginBottomOnLastRow: false,
      targetWidth: 200,
      widthHeightRatio: 1,
      disableServerRender: false
    };
  },
  render: function() {
    var componentWidth, componentsPerRow, ref;
    if (this.state.componentWidth === 0) {
      return React.createElement("div", null);
    } else if (!this.isMounted() && this.props.disableServerRender) {
      return React.createElement("div", null);
    } else {
      ref = calculateLayout(this.props, this.state), componentWidth = ref[0], componentsPerRow = ref[1];
      return React.createElement("div", {
        "className": "component-gallery " + this.props.className,
        "style": {
          overflow: "hidden"
        }
      }, React.Children.map(this.props.children, (function(_this) {
        return function(child, i) {
          var marginBottom, marginRight, numRows;
          marginBottom = _this.props.margin;
          if (_this.props.noMarginBottomOnLastRow) {
            numRows = Math.ceil(React.Children.count(_this.props.children) / componentsPerRow);
            if ((i + 1) > ((numRows - 1) * componentsPerRow)) {
              marginBottom = 0;
            }
          }
          if (_this.props.marginBottom && marginBottom !== 0) {
            marginBottom = _this.props.marginBottom;
          }
          if (componentsPerRow === 1) {
            marginRight = 0;
          } else if (i !== 0 && (i + 1) % componentsPerRow === 0) {
            marginRight = 0;
          } else {
            marginRight = _this.props.margin;
          }
          return React.DOM.div({
            className: "component-wrapper",
            style: {
              width: componentWidth + "px",
              height: (componentWidth * _this.props.widthHeightRatio) + "px",
              display: "inline-block",
              marginRight: marginRight + "px",
              marginBottom: marginBottom + "px",
              overflow: "aitp",
              position: "relative",
              "verticalAlign": "top"
            }
          }, child);
        };
      })(this)));
    }
  }
});