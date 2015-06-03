;
(function() {
	function _log(e, type) {
		console.log(type + ":")
		console.log(e)
	}

	function _loadstart(e, elem, type) {
		this.debug && _log(e, type)
		this.uploadbutton.prop("disabled", false).hide();
		this.loadstart && this.loadstart(e, e.type);
		this.startTime = new Date();
	}

	function _progress(e, elem, type) {
		this.debug && _log(e, type)
		this.endTime = new Date();
		altime = (e.loaded - (this.endval||0)) / (this.endTime - this.startTime);
		this.endval = e.loaded;
		Lnum = Math.pow(10, 2);
		calcspeed = Math.round(altime * Lnum) / Lnum;
		var progress = ((e.loaded / e.total) * 100).toFixed(0) + "%";
		this.progressbox.find("span").css({
			width: progress
		}).html(/100%/.test(progress) ? progress : progress + "," + calcspeed + "K/s");
		this.progress && this.progress(e, progress);
		//_log(progress, type)
	}

	function _about(e, elem, type) {
		this.debug && _log(e, type)
		self.uploadbutton.prop("disabled", true).removeAttr("disabled").show();
		this.error && this.error(e, e.type);
	}

	function _error(e, elem, type) {
		this.debug && _log(e, type)
		self.uploadbutton.prop("disabled", true).removeAttr("disabled").show();
		this.error && this.error(e, e.type);
	}

	function _load(e, elem, type) {
		this.debug && _log(e, type)
		var self = this;
		self.readerComplete && self.readerComplete();
		if (self.xhrTimeout) clearTimeout(self.xhrTimeout);
		self.xhrTimeout = setTimeout(function() {
			_xhr.call(self, e);
		}, 100);
	}

	function _xhr(e) {
		var self = this;
		var xhr = self.xhr = new XMLHttpRequest();
		xhr.open("post", "", true);
		xhr.timeout = 300000;
		xhr.overrideMimeType("application/octet-stream");
		jQuery.each(["loadstart", "progress", "about", "error", "loaded", "timeout"], function(i, name) {
			xhr.upload.addEventListener(name, function(e) {
				self.handle["on" + name](e, this, "XMLHttpRequest");
			}, false);
		});
		xhr.upload.addEventListener("load", function(e) {
			self.uploadbutton.prop("disabled", true).removeAttr("disabled").show();
			self.complete && self.complete(e, e.type);
		}, false);
		xhr.sendAsBinary && xhr.sendAsBinary(e.target.result);
		xhr.send && xhr.send(e.target.result);
	}

	function _loaded(e, elem, type) {
		this.debug && _log(e, type)
		this.loaded && this.loaded(e, e.type);
	}

	function _change(e, elem, type) {
		this.debug && _log(e, type)
		var self = this,
			target = e.target;
		if (target.files.length > 0) {
			if (self.uploadTimeout) clearTimeout(self.uploadTimeout);
			self.uploadTimeout = setTimeout(function() {
				var file = target.files[0];
				self.reader.readAsBinaryString(file);
			}, 100);
		}
	}

	function _init() {
		var self = this;
		self.handle = {};
		var fileinput = jQuery("<input></input>").attr({
				type: "file",
				accept: "image/*",
				id: "cameraInput",
				name: "cameraInput"
			}).addClass('sign_file'),
			progress = self.progressbox = jQuery("<div></div>").addClass("progress").html('<span></span>'),
			uploadbutton = self.uploadbutton = jQuery("<button></button>").addClass('photograph').html(self.uploadbutton_text || "上传文件");
		jQuery(self.elem).html('').append(fileinput).append(progress).append(uploadbutton);
		uploadbutton.on("click", function(e) {
			var ie = !-[1, ];
			if (ie) {
				fileinput.trigger('click').trigger('change');
			} else {
				fileinput.trigger('click');
			}
		});
		var reader = self.reader = new FileReader();
		jQuery.each(["loadstart", "progress", "about", "error", "load", "loaded", "change", "timeout"], function(i, name) {
			self.handle["on" + name] = function(e, elem, type) {
				switch (name) {
					case "loadstart":
						_loadstart.call(self, e, elem, type);
						break;
					case "progress":
						_progress.call(self, e, elem, type);
						break;
					case "about":
						_about.call(self, e, elem, type);
						break;
					case "error":
						_error.call(self, e, elem, type);
						break;
					case "timeout":
						_error.call(self, e, elem, type);
						break;
					case "load":
						_load.call(self, e, elem, type);
						break;
					case "loaded":
						_loaded.call(self, e, elem, type);
						break;
					case "change":
						_change.call(self, e, elem, type);
						break;
				}
			};
			if (name == "change") fileinput[0].addEventListener(name, function(e) {
				self.handle["on" + name](e, this, "fileinput");
			}, false);
			else if (!/timeout|progress/.test(name)) {
				reader["on" + name] = function(e) {
					self.handle["on" + name](e, this, "reader");
				};
			}
		});
	}

	var fileupload = function(elem, ops) {
		return fileupload.fn.init(elem, ops);
	};
	fileupload.fn = fileupload.prototype = {
		init: function(elem, ops) {
			jQuery.extend(this, ops);
			this.elem = elem;
			var xhr = new XMLHttpRequest();
			if (xhr.upload) {
				_init.call(this);
			} else {
				jQuery(elem).html('您的浏览器不支持HTML5，请更换浏览器');
			}
			xhr = null;
			return this;
		}
	};
	fileupload.fn.init.prototype = fileupload.fn;

	jQuery.fn.fileupload = function(ops) {
		return fileupload(this, ops);
	};
})()