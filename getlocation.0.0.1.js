;
(function() {
	var userloc = function(elem, ops) {
		return userloc.fn.init(elem, ops);
	};
	userloc.fn = userloc.prototype = {
		init: function(elem, ops) {
			ops && jQuery.extend(this, ops);
			this.elem = elem;
			this.getlocTimeout = null;
			this.getGeo();
			return this;
		},
		getLoc: function(success, error, options) {
			function getsuccess(data) {
				//alert(data && data.coords.latitude + "," + data.coords.longitude)
				jQuery.cookie("userlocation", '' + data.longitude + ',' + data.latitude + ',"",""');
				success && success(data);
			}

			function geterror(data) {
				//alert(data && data.code + "," + data.message)
				error && error(data);
			}
			this.getlocTimeout && clearTimeout(this.getlocTimeout);
			this.getlocTimeout = setTimeout(function() {
				if (navigator.geolocation) {
					if (window.huaweiview) try {
						window.getLocationSuccess = function(a, b) {
							getsuccess({
								coords: {
									latitude: a,
									longitude: b
								}
							})
						}, window.getLocationError = function(a) {
							geterror({
								code: 0,
								message: a
							})
						}, window.hwOTO.getLocation()
					} catch (l) {
						navigator.geolocation.getCurrentPosition(getsuccess, geterror, {
							timeout: 27000,
							enableHighAccuracy: true
						})
					} else navigator.geolocation.getCurrentPosition(getsuccess, geterror, {
						timeout: 27000,
						enableHighAccuracy: false
					});
				} else {
					geterror({
						code: -2,
						message: "抱歉，不支持"
					});
				}
			}, 1);
		},
		getGeo: function(success, error) {
			var self = this;
			this.getLoc(function(data) {
				var city = false,
					cityname = "";
				jQuery.each(jQuery.locations, function(i, arr) {
					if (data.coords.longitude.toFixed(0) == arr[0].toFixed(0) && data.coords.latitude.toFixed(0) == arr[1].toFixed(0)) {
						var loc = jQuery.cookie("userlocation");
						if (loc) {
							loc = loc.split(',');
							loc[2] = arr[2];
							loc[3] = arr[3];
							jQuery.cookie("userlocation", loc.join(','));
						}
						city = arr[2];
						cityname = arr[3];
						return false;
					}
				});
				if (city && typeof city == "string") {
					success && success.call(self, {city:city, cityname:cityname});
				}
			}, function(data) {
				error && error.call(self, data);
			});
		}
	};
	userloc.fn.init.prototype = userloc.fn;
	jQuery.fn.userLoc = function(ops) {
		return userloc(this, ops);
	};

})()