window.addEventListener("load", function() {
	this.swing = new SWING.Swing();
}, false);




SWING.time = 0;
SWING.deltaTime = 0;
SWING.releaseBuild = true;


var RAD45 = Math.PI/4,
	RAD90 = Math.PI/2,
	RAD180= Math.PI,
	RAD360= Math.PI*2,
	RAD2DEG = 180/Math.PI;


SWING.helpers = {
	bind : function(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		}
	}
};


SWING.Swing = function() {
	SWING.Swing.instance = this;
	this.initialize();
}
SWING.Swing.prototype = {
	constructor: SWING.Swing,
	initialize : function() {
		this.renderManager = new SWING.RenderManager();
		this.input = new SWING.Input();
		this.loader = new SWING.Loader(bind(this, this.launch));
	},

	launch : function() {
		this.view = new SWING.View(this.renderManager);
		this.director = new SWING.Director(this.view);
		this.playExperience();
		this.animateSwing();
	},
	playExperience: function() {
		this.director.start();
		this.experiencePlaying = true;
	},

	animateSwing: function() {
		requertAnimationFrame(bind(this, this.animateSwing));
		if (this.experiencePlaying) {
			this.view.clear();
			this.director.update();
			this.view.update();
			//this.director.postUpdate();
		}
	}
}



SWING.RenderManager = function() {
	this.initialize();
};
SWING.RenderManager.prototype = {
	constructor: SWING.RenderManager,
	initialize: function() {
		var container = document.createElement("div"),
			style = container.style;
		style.position = "absolute";
		style.top = style.left = "0px";
		style.margin = style.padding = "0";
		style.zIdex = 100;
		document.body.appendChild(container);

		var _canvas = document.querySelector(".js_canvas");

		var err = '';

		var retrieveError = function(e) {
			err = e.statusMessage || "unknown error";
		}

		_canvas.addEventListener("webglcontextcreationerror", retrieveError, false );

		var ctx = _canvas.getContext("webgl");
		_canvas.removeEventListener("webglcontextcreationerror", retrieveError, false);

		if (ctx) {
			var renderer = new THREE.WebGLRenderer({canvas: _canvas, clearColor: 0x000000, clearAlpha: 1, antialias: false});
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.autoClear = false;

			this.renderer = renderer;
		} else {
			alert("error" + err);
		}
		if (! SWING.releaseBuild) {
		}
	},
	update : function() {

	}
}



SWING.View = function(renderManager) {
	this.initialize(renderManager);
}
SWING.View.prototype = {
	constructor: SWING.View,
	options: {
		debugView : false,
		debugViewY: 5000,
		antialias: false,
		fog: 1,
		fogAmount: 0.002
	},

	postprocessing: {
		enabled: true,
		blurAmount: 0.0015
	},

	initialize: function(renderManager) {
		this.renderManager = renderManager;
		this.renderer = renderManager.renderer;

		if (this.options.debugView) {
			/*:::::::::::::::::::::::::::::::::
			this.camera = new THREE.Camera(33, window.innerWidth/window.innerHeight, 1,16000);
			this.camera.position.x = 0;
			this.camera.position.y = this.options.debugViewY;
			this.camera.position.z = 700;
			this.camera.rotation.x = -RAD90;
			this.camera.useTarget = false;*/
		} else {
			this.camera = new THREE.Camera(30, window.innerWidth/window.innerHeight, 1,1600);
		}

		this.scene = new THREE.Scene();

		if (!this.options.debugView && this.options.fog) {
			this.scene.fog = new THREE.FogExp2(0x000000, this.options.fogAmount);
		}

		this.sceneVox = new THREE.Scene();

		this.initPostprocessing();

		this.onWindowResizeListener = bind(this, this.onWindowResize);
	},
	clear: function() {
		this.renderer.clear();
	},
	setFog: function(fogAmount) {
		if (!this.options.debugView && this.options.fog) {
			this.scene.fog.fogAmount = fogAmount;
		}
	},
	start: function() {
		window.addEventListener('resize', this.onWindowResizeListener, false);
	},
	stop: function() {
		window.removeEvnetListener('resize', this.onWindowResizeListener, false);
	},
	initPostprocessing: function() {
		this.postprocessing.scene = new THREE.scene();
		this.postprocessing.sceneScreen = new THREE.scene();

		this.postprocessing.camera = new THREE.Camera();
		this.postprocessing.camera.projectionMatrix = THREE.Matrix4.makOrtho(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/-2, window.innerHeight/2, -10000, 10000);
		this.postprocessing.camera.position.z = 100;

		var pars = {
			minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat
		};

		this.postprocessing.rtTexture1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
		this.postprocessing.rtTexture2 = new THREE.WebGLRenderTarget(512,512,pars);
		this.postprocessing.rtTexture3 = new THREE.WebGLRenderTarget(512,512,pars);
	},
	update: function() {

	}
}




/*
	SWING.Director
*/
SWING.Director = function() {
	this.initialize();
};
SWING.Director.prototype = {
	initialize : function() {

	},
};

/*
	SWING.Terrain
*/
SWING.Terrain = function() {

};
SWING.Terrain.prototype = {
	initialize: function() {

	},
}

SWING.TerrainPlane = function() {

};
SWING.TerrainPlane.prototype = {

};


SWING.TileManager = function() {

};
SWING.TileManager.prototype = {

};

SWING.Skybox = function() {

};
SWING.Skybox.prototype = {

};



/*
	SWING.SpectrumEvents
*/
SWING.SpectrumEvents = function() {

};
SWING.SpectrumEvents.prototype = {

};