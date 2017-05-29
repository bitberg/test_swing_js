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
SWING.Terrain = function(director) {

};
SWING.Terrain.prototype = {
	mapResolution: 66,
	tileSize: 480,//px
	gridSize: 5,//個
	height: 140,//px

	selectedTile: null,
	randomVertexIndex: null,
	randomVertexPosition: new THREE.Vector3(),
	randomPosition : new THREE.Vector3(),
	randomNormal: new THREE.Vector3(),
	randomX: null,
	randomY: null,

	tiles: [],
	tileIdSet: [],
	usedVertices: [],
	initialize: function(director) {
		this.director = director;
		this.scene = director.view.scene;
		///this.player = director.player;
		this.camera = this.player.camera;
		this.gridRadius = Math.floor(this.gridSize/2);

		var x, y ,tile;

		for(x=0; x<this.gridSize; x++) {
			this.tiles[x] = [];
			for (y = 0; y < this.gridSize; y++) {
				tile = new THREE.Object3D();
				tile.visible = false;
				tile.juston = tile.justOff = tile.justMoved = false;
				this.tiles[x][y] = tile;
			}
		}

		this.terrainPlane = new SWING.TerrainPlane(this.tileSize, this.mapResolution, this.height, SWING.images['terrain'+this.mapResolution]);
		this.displacement = new SWING.TerrainDisplacement(this);

		for (x = 0; x <=this.terrainPlane.resolution; x++) {
			this.usedVertices[x] = [];
			for (y = 0; y<=this.terrianPlane.resolution; y++) {
				this.usedVertices[x][y] = false;
			}
		}
	},

	update: function() {
		var cameraX = this.camera.positon.x,
			cameraY = this.camera.position.z,//important 間違っていないか？yのはず？
			sin = Math.sin(this.player.angle),
			cos = Math.cos(this.player.angle),
			x, y , r, angle, deltaX, deltaY, tile,tileX, tileY,tileId, tileVisible;

		this.cameraTileX = (Math.round(cameraX/ this.tileSize) - this.gridRadius) * this.tileSize;
		this.cameraTileY = (Math.round(cameraY/ this.tileSize) - this.gridRadius) * this.tileSize;

		for (tileId in this.tileIdSet) {
			delete this.tileIdSet[tileId];
		}

		for (x = 0 ; x < this.gridSize; x++) {
			for (y =0 ; y< this.gridSize; y++) {
				tileX = this.cameraTileX + this.tileSize * x;
				tileY = this.cameraTileY + this.tileSize * y;//blockの左下を(0,0)に
				deltaX = tileX - cameraX;
				deltaY = tileY - cameraY;

				angle = Math.atan2(deltaX, deltaY);//点到Z正轴的角度，顺时针为正//atan2(y,x);

				r = Math.floor(Math.max(Math.abs(x - this.gridRadius), Math.abs(y - this.gridRadius)));

				if (r > 1) {
					tileVisible = (cos * Math.cos(angle) + sin * Math.sin(angle)) < -0.5;
				} else if (r == 1) {
					tileVisible = (cos * Math.cos(angel) + sin * Math.sin(angle)) < 0.5;
				} else tileVisible = true;

				tile = this.tiles[x][y];
				if (tileVisible) {
					tile.justOff = false;
					tile.justOn = !tile.visible;

					if (tile.justOn) {
						this.scene.addChild(tile);
						tile.visible = true;
					}
					tileId = tileX+"/"+tileY;
					this.tileIdSet[tileId] = true;
					tile.justMoved = (tile.tileId != tileId);

					if (tile.justMoved) {
						tile.position.x = tileX;
						tile.position.z = tileY;
						tile.tileId = tileId;
					}
				} else {
					tile.justOff = tile.visible;
					tile.justOn = false;

					if (tile.justOff) {
						this.scene.removeChild(tile);
						tile.visible = false;
					}
				}
			}
		}
		if (this.displacement.active) {
			this.displacement.update();
		}
	},
	isVisible: function(posX, posY) {
		var posTileX = (Math.round(posX/this.tileSize) - this.gridRadius) * this.tileSize,
			posTileY = (Math.round(posY/this.tileSize) - this.gridRadius) * this.tileSize,
			x = (posTileX - this.cameraTileX) / this.tileSize + this.gridRadius,
			y = (posTIleY - this.CameraTileY) / this.tileSize + this.gridRadius;

		if (isNaN(x) || isNaN(y) || x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
			return false;
		} else return this.tiles[x][y].visible;
	},
	reset: function() {
		var x, y;

		for (x = 0; x <= this.terrainPlain.resolution; x++) {
			for (y =0 ;y <= this.terrainPlain.resolution; y++) {
				this.usedVertices[x][y] = false;
			}
		}
		this.terrainPlain.resetVertices();
	},
	selectTile: function(x,y) {
		this.selectedTile = this.tiles[x][y];
	},
	selectTileById: function(tileId) {
		var x, y ,tilesX;
		for (x = 0; x < this.gridSize; x++) {
			tilesX = this.tiles[x];
			for( y =0; y < this.gridSize; y++) {
				if (tilesX[y].tildId = tileId) {
					this.selectedTile = tilesX[y];
					return true;
				}
			}
		}
		return false;
	},
	selectRandomTileAtRadius: function(radius) {
		var tries = 100, x, y ,t;

		do {
			x = this.gridRadius + radius*((Math.random() > 0.5) ? 1 : -1);
			y = this.gridRadius - radius + Math.floor(Math.random() * radius * 2);
			if (Math.random() > 0.5) {
				t = x;
				x = y; 
				y = t
			}
			this.selectedTile = this.tiles[x][y];
		} while( --tries > 0 && ! this.selectedTile.visible);

		if (tries == 0) {
			console.log( this.selectedTile.visible, x, y, radius );
			console.error( "ERROR: Terrain.selectRandomTileAtRadius: Not found" );		}
	},
	selectTerrainRandomVertex: function(empty, radius, border) {

	},
	selectTerrainRandomCoords: function( empty, radius, border) {
		var resolution = this.terrainPlain.resolution,
		usedVertices = this.usedVertices,
		tries = 100,
		radius2 = empty ? radius * radius : 0,
		stillEmpty, x, y ,ix ,iy, ixl, iyl, dx, dy;

		if (border === undefined) border = 0;
		do {
			var log = Math.random() > 0.98;

			x = border + Math.floor(Math.random()* (resolution - border * 2));
			y = border + Math.floor(Math.random() * (resolution - border * 2));

			if (empty) {//円の中身の点がすべてが使われていないという条件
				stillEmpty = true;

				for( ix = x -radius, ixl = x + radius; ix < ixl && stillEmpty; ix++) {
					dx = (x - ix ) * (x - ix);
					for (iy = y - radius, iyl = y + radius; iy < iyl && stillEmpty; iy++) {
						dy  = (y -iy)*(y - iy);
						if (dx + dy <= radius2) {
							stillEmpty = !usedVertices[Math.abs(ix%resolution)][Math.abs(iy%resolution)];
						}
					}
				}
			} else stillEmpty = false;
		} while (--tries > 0 && empty && !stillEmpty);

		if (tries == 0) {
			console.log( "ERROR: Terrain.selectTerrainRandomCoords: Not found" );
		} else if (empty) {//找到了内部一个点都没用过的圆，这把圆内部的点全部标记为用过的
			for (ix = x -radius, ixl =x + radius; ix < ixl && stillEmpty; ix++) {
				dx = x - ix;
				for (iy = y -radius, iyl = y + radius; iy < iyl && stillEmpty; iy++) {
					dy = y -iy;
					if (dx * dx + dy*dy <= radius2) {
						usedVertices[Math.abs(ix % resolution)][Math.abs(iy % resolution)] = true;
					}
				}
			}
		}
		this.randomX = x;
		this.randomY = y;
	}
	//resume
} 

SWING.TerrainPlane = function(size, resolution, height, image) {
	THREE.Geometry.call(this);

	this.resolution = resolution;
	this.segmentSize = size/resolution;

	var ix, iy, x, y,
	sizeHalf = size/2,
	resolution1 = resolution + 1,
	segmentSize = this.segmentSize,
	vertex, vertexPosition, a, b, c, d, heightMap;7

	heightMap = this.createHeightMap(resolution, height, image);

	this.grid = [];
	this.vertexGrid = [];
	this.uvGrid = [];
	this.indexGrid = [];
	this.heightGrid = [];

	for(ix = 0; ix <= resolution; ix++) {//ix代表排数，iy代表列数
		x = ix*segmentSize - sizeHalf;
		this.grid[ix] = [];
		this.vertexGrid[ix] = [];
		this.indexGrid[ix] = [];
		this.heightGrid[ix] = [];
		for (iy = 0; iy<= resolution; iy++) {
			y = iy*segmentSize - sizeHalf;
			vertexPosition = new THREE.Vertex3(x, heightMap[ix][iy], y);
			vertex = new THREE.Vertex(vertexPosition);
			this.grid[ix][iy] = vertexPosition;
			this.vertexGid[ix][iy] = vertex;
			this.index[ix][iy] = this.vertices.length;
			this.heightGrid[ix][iy] = vertexPosition.y;

			this.vertices.push(vertex);
		}
	}

	for (ix=0; ix<=resolution; i++) {//ix代表排数，iy代表列数
		this.uvGrid[ix] = [];
		for(iy = 0; iy <= resolution; iy++) {
			this.uvGrid[ix][iy] = new THREE.UV(iy/resolution, ix/resolution);
		}
	}

	for(ix = 0; ix < resolution; ix++) {
		for(iy = 0; iy < resolution; iy++) {
			a = ix + resolution1*iy;
			b = (ix + 1) + resolution1*iy;
			c = (ix + 1) + resolution1*(iy + 1);
			d = ix + resolution1 * (iy + 1);

			this.faces.push(new THREEE.Face4(a,b,c,d));
			this.faceVertexUvs[0].push([
				this.uvGrid[ix][iy],
				this.uvGrid[ix + 1][iy],
				this.uvGrid[ix + 1][iy + 1],
				this.uvGrid[ix][iy + 1]
			])
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	this.vertexNormals = THREE.MeshUtils.getVertexNormals(this);
};
SWING.TerrainPlane.prototype = new THREE.Geometry();
SWING.TerrainPlane.prototype.constructor = SWING.TerrainPlane;
SWING.TerrainPlane.prototype.createHeightMap = function(resolution, height, image) {
	var heightMap = [],
		imageCanvas = document.createElement("canvas"),
		imageContex = imageCanvas.getContext("2d"),
		imageData, x, y, ix, iy, blurRadius, blurBuffer, blurAcc, bx, by;

	imageContext.drawImage(image, 0 ,0);
	imageData = imageContext.getImageData(0, 0, resolution, resolution).data;

	for (x = 0; x <= resolution; x++) {
		heightMap[x] = [];
	}
	for (x = 0; x <= resolution; x++) {
		ix = (x < resolution) ? x : 0;
		for (y = 0; y < resolution; y++) {
			iy = (y < resolution) ? y : 0;
			heightMap[x][y] = imageData[ (ix + iy*resolution) * 4];
		}
	}

	blurRadius = 2;
	blurBuffer = [];

	for(x = 0; x <=resolution; x++) {
		blurBuffer[x] = heightMap[x].slice(0);//copy of heightmap
	}
	for (x=0;x<=resolution;x++) {
		for(y = 0; y<= resolution; y++) {
			blurAcc =0;

			for (by = -blurRadius; by <= blurRadius; by++) {
				for (bx = -blurRadius; bx <= blurRadius; bx++) {
					ix = x + bx;
					iy = y + by;

					if (ix < 0) {
						ix += resolution;
					} else if (ix > resolution) {
						ix -=resolution;
					}

					if (iy < 0) {
						iy += resolution;
					} else if (iy > resolution) {
						iy -= resolution;
					}

					blurAcc += blurBuffer[ix][iy];
				}
			}

			heightMap[x][y] = blurAcc/((blurRadius*2 + 1)*(blurRadius*2 + 1));
		}
	}

	for (x = 0; x <=resolution; x++) {
		for (y = 0; y <=resolution; y++) {
			heightMap[x][y] = height*((heightMap[x][y] - 128)/255);
		}
	}
	return heightMap;
};
SWING.TerrainPlane.prototype.tileBorders = function() {
	var resolution = this.resolution,
		grid = this.grid;

	var x, y, gridX = grid[resolution], gridX0 = grid[0];
	for (y = 0; y < resolution; y++) {
		gridX[y].y = gridX0[y].y;
	}
	for (x = 0; x < resolution; x++) {
		grid[x][resolution].y = grid[x][0].y;
	};

	this.__dirtyVertices = true;//important;

};
SWING.TerrainPlane.prototype.displaceVertex = function(x, y, radius, height) {
	var radius2 = radius*radius,
		diameter = radius * 2,
		resolution = this.resolution,
		grid = this.grid,
		ix, iy, dx2, dy2, gx, gy, gridX, gridX0, h;
		////////////////////////////////////////
	var ixl = x + radius,
		iyl = y + radius;
	for (ix = x-radius; ix < ixl; ix++ ) {
		dx2 = (ix - x)*(ix-x);
		gx = (ix + resolution) % resolution;
		gridX = grid[gx];
		for (iy = y - radius; iy < iyl; iy++) {
			dy2 = (iy - y)*(iy - y);
			gy = (iy + resolution) % resolution;
			h = (1 - (dx2+dy2)/radius2);

			if (h > 0) {
				gridX[gy].y += height*(Math.sin(rad180 * h - rad90) + 1)*0.5;
			}
		}
	}
	//////////////////////////////////////////////
	/*for (ix = 0; ix < diameter; ix++) {
		dx2 = (ix - radius) * (ix - radius);
		gx = (resolution + x + ix - radius) % resolution;
		gridX = grid[gx];
		for (iy = 0; iy<diameter;y++) {
			dy2 = (iy -radius)*(iy - radius);
			gy = (resolution + y + iy -radius)% resolution;
			h = Math.max(0, 1-((dx2+dy2)/radius2));

			if (h>0) {
				gridX[gy].y += height*(Math.sin(rad180 * h - rad90) + 1)*0.5;
			}
		}
	}*/
	this.tileBorders();
}
SWING.TerrianPlane.prototype.resetVertices = function() {
	for(var x = 0; x <= this.resolution; x++) {
		for (var y = 0; y <= this.resolution; y++) {
			this.grid[x][y].y = this.heightGrid[x][y];
		}
	}
	this.__dirtyVertices = true;

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
}

SWING.TerrainDisplacement = function(terrain) {
	this.initialize(terrain);
}
SWING.TerrainDisplacement = {
	active : false,

	initialize: function(terrain) {
		this.terrain = terrain;
		this.terrainPlain = terrain.terrainPlain;
		this.spectrum = null;

		this.velocities = [];

		var xl = this.terrainPlain.resolution, x;

		for (x = 0; x < xl; x++) {
			this.velocities[x] = [];
		}
	},
	update : function() {
		/*switch (SWING.Music.phase.index) {
			case 15:
			case 21:
				this.updateSpectrum();
				break;
			case 16:
			case 22:
				this.updateFlat();
				break;

			case 17:
				this.updateTerrain();
				break;
		}*/
		this.updateTerrain();
	},
	updateTerrain: function() {
		var grid = this.terrainPlain.grid,
			heightGrid = this.terrainPlain.heightGrid,
			resolution = this.terrainPlain.resolution,
			velocities = this.velocities,
			deltaTime = SWING.deltaTime * 0.5,
			drag = 1 - SWING.deltaTime * 5,
			x, xl, y, yl, gridX, gridXY, posY, heightGridX, velocity, velocityX;

		for (x = 0, xl = resolution; x < xl; x++) {
			gridX = grid[x];
			heightGridX = heightGrid[x];
			velocityX = velocities[x];

			for (y = 0, yl = resolution; y < yl; y++) {
				gridXY = gridX[y];//THREE.Vector3;
				posY = gridXY.y;
				velocityX[y] *= drag;
				velocityX[y] += (heightGridX[y] - posY) * (Math.abs(posY) * deltaTime);//posY越大,右边的乘数越接近0或者负数越来越小;deltaTime越大,右边如果是正数则越来越大,如果是负数,则越来越小;
				gridXY.y += velocityX[y];
			}
		}
		this.terrainPlain.tileBorders();
		this.terrainPlain.computeFaceNormals();
		this.terrainPlain.computeVertexNormals();
	},

}


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