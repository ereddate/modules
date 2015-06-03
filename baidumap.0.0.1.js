/*baiduMap start*/ ;
(function() {
	window.baiduMap = function() {
		var baiduMap = function(elem, ops) {
			return baiduMap.fn.init(elem, ops);
		};

		baiduMap.fn = baiduMap.prototype = {
			init: function(elem, ops) {
				this.mapLevel = 15;
				this.mapCenter = {
					longitude: 0, //经度
					latitude: 0 //纬度
				};
				this.elem = elem;
				jQuery.extend(this, ops);
				this.mapId = jQuery(this.elem).attr("id");
				var self = this;
				this.map = baiduMap._initMap(this, function(map) {
					self.handle && self.handle.getPoints(map, function(data) {
						jQuery.each(data, function(i, obj) {
							var point = obj.offset.split(','),
								points = new BMap.Point(point[0], point[1]);
							obj.offset = points;
							obj.distance = baiduMap._getDistance(self.centerPoint, points, map);
							obj.customPoint = self.customPoint;
							obj.pointTmpl = self.handle.getPointTmpl;
							baiduMap._createPoint(map, obj, {
								click: function() {
									self.handle.point_click(obj);
								}
							});
						});
					});
				});
				return this;
			}
		};

		baiduMap.fn.init.prototype = baiduMap.fn;

		baiduMap._initMap = function(target, callback) {
			var map = new BMap.Map(target.mapId),
				point = target.centerPoint = new BMap.Point(target.mapCenter.longitude, target.mapCenter.latitude); //经、纬度
			map.centerAndZoom(point, target.mapLevel);
			map.addEventListener('tilesloaded', function() {
				callback && callback(map);
			});
			return map;
		};

		function _toRad(d) {
			return d * Math.PI / 180;
		}

		baiduMap._getDistance2 = function(pointA, pointB) {
			var dis = 0;
			var radLat1 = _toRad(pointA[1]);
			var radLat2 = _toRad(pointB[1]);
			var deltaLat = radLat1 - radLat2;
			var deltaLng = _toRad(pointA[0]) - _toRad(pointB[0]);
			var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
			return (dis * 6378137).toFixed(2);
		};

		baiduMap._getDistance = function(pointA, pointB, map) {
			return map && (map.getDistance(pointA, pointB)).toFixed(2) || 0;
		};

		function _createCustomPoint(map, tmpl, point, title) {
			this._map = map;
			this._text = title;
			this._point = point;
			this._tmpl = tmpl;
			return this;
		}
		_createCustomPoint.prototype = new BMap.Overlay();
		_createCustomPoint.prototype.initialize = function(map) {
			this._map = map;
			tmpl = this._tmpl(this._text);
			this._div = tmpl;
			jQuery(tmpl).css("z-index", BMap.Overlay.getZIndex(this._point.lat));
			jQuery(this._map.getPanes().labelPane).append(tmpl);
		};
		_createCustomPoint.prototype.draw = function() {
			var map = this._map;
			var pixel = map.pointToOverlayPixel(this._point);
			jQuery(this._div).css({
				position: "absolute",
				top: pixel.y + "px",
				left: pixel.x + "px"
			});
		};

		baiduMap._createPoint = function(map, point, handles) {
			var marker;
			if (map) {
				if (!point.customPoint) {
					marker = new BMap.Marker(point.offset); // 创建标注    
					point.title && marker.setLabel(new BMap.Label(point.title, {
						offset: new BMap.Size(20, -10)
					}));
				} else {
					marker = new _createCustomPoint(map, point.pointTmpl, point.offset, point.title || "");
				}
				if (marker) {
					map.addOverlay(marker);
					handles && jQuery.each(handles, function(name, handle) {
						(!point.customPoint && marker || marker._div[0]).addEventListener(name, handle);
					});
				}
			}
			return marker;
		}

		window.baiduMap = baiduMap;

		jQuery.fn.map = function(ops) {
			baiduMap(this, ops);
			return this;
		};
	};

	function initialize() {
		//alert(baiduMap._getDistance2([116.3896,39.91917],[116.3940,39.91726]))
		baiduMap();
		jQuery("#map").map({
			mapCenter: {
				longitude: 116.404,
				latitude: 39.915
			},
			mapLevel: 10,
			customPoint: false,
			handle: {
				getPointTmpl: function(title) {
					var point = jQuery('<div style="width:100px;height:20px;background:#fff;border:1px #000 solid;"></div>');
					title && point.html(title);
					return point;
				},
				getPoints: function(map, render) {
					render([{
						offset: "116.404,39.915",
						title: "title1"
					}, {
						offset: "116.504,39.915",
						title: "title2"
					}, {
						offset: "116.604,39.915",
						title: "title3"
					}]);
				},
				point_click: function(data) {
					alert("距离原点 " + data.distance + " 米");
				}
			}
		});
	}

	function loadScript() {
		var script = document.createElement("script");
		script.src = "http://api.map.baidu.com/api?v=1.5&ak=jTnd6KZ09vHAM6g5g4npbhle&callback=initialize"; //此为v1.5版本的引用方式
		// http://api.map.baidu.com/api?v=1.5&ak=您的密钥&callback=initialize"; //此为v1.4版本及以前版本的引用方式
		document.body.appendChild(script);
	}

	loadScript();
})()
/*baiduMap end*/