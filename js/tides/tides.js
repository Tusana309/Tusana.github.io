//--
var World = function(cv, cfg) {

        this.config = cfg

        // The primary drawing canvas
        this.canvas = document.getElementById(cfg.cvid)
        this.ctx = cv.getContext("2d")
        this.w = cv.width
        this.h = cv.height

        // World scaling and rendering
        this.lookAt = new Vector(0, 0)                           // Rendering engine is looking at this position
        this.numArrows = 30

        // Time keeping
        this.time = 0					 // global time in seconds

        // Constants and buffer variables
        this.gamma = 6.67408e-11                                 // gravitation constant in m³/(kg*s²)
        this.distMoonEarth = 384400000                           // distance moon to earth in meter
        this.distEarthSun  = 149597870700                        // distance sun to earth 

        // Some vectors of common use
        this.vecEarthSun     = new Vector(0,0)                   // Vector pointing from the earth towards the sun
        this.vecEarthMoon    = new Vector(0,0)                   // Vector pointing from the earth towards the moon
        this.vecCenterOfMass = new Vector(0,0)
        if (cfg.setup==0) {
                // (impact force) A setup for illustrating moons gravitational effect on earth
                this.forceMultiplier = 1500
                this.accMultiplier = 1200
                this.ts = 2                                      // timestep size in seconds
                this.scaleSize = 0.00002                         // scale for sizes	
                this.scaleDist = this.scaleSize                  // scale for dimensions
		
                this.earth = {
                        pos           : new Vector(-9000000, 0), // earth position
                        m             : 5.9721986e24,            // earth mass
                        r             : 12735/2.0*1000,	         // earth radius in meter
                        p             : 365.256 * 86400,         // siderial in seconds
                        tidalForce    : [this.numArrows + 1],    // Tidal force arrows of the moon
                        tidalForceSun : [this.numArrows + 1]     // Tidal force arrows of the moon
                }

                this.moon = {
                        pos : new Vector(7000000, 0), // moon position
                        m   : 7.349e22,               // moon mass
                        r   : 3476/2.0*1000,          // moon radius in meter
                        p   : 27.322 * 86400          // siderial in seconds
                }

        }else if (cfg.setup==1) {
                this.setScaleForceToModel(cfg.scaleForceToModel)

                this.ts = 86400/20                          // 
                this.scaleDist = 0.00000065                   // scale for dimensions
                this.scaleSize = 0.00001                      // scale for sizes	
                this.scaleContext = this.scaleSize

                this.earth = {
                        pos           : new Vector(0, 0),     // earth position
                        m             : 5.9721986e24,	      // earth mass
                        r             : 12735/2.0*1000,       // earth radius in meter
                        p             : 365.256 * 86400,      // siderial in seconds
                        tidalForce    : [this.numArrows + 1], // Tidal force arrows of the moon
                        tidalForceSun : [this.numArrows + 1]  // Tidal force arrows of the moon
                }

                this.moon = {
                        pos : new Vector(0, 0), // moon position
                        m   : 7.349e22,         // moon mass
                        r   : 3476/2.0*1000,    // moon radius in meter
                        p   : 27.322 * 86400    // siderial in seconds
                }

                // Distance of the center of mass from the earth center (4672.68 km)
                this.distCenterOfMass = this.distMoonEarth*this.moon.m / (this.moon.m + this.earth.m)
        }

        // Celestial Bodies

        this.sun = {
                pos      :	new Vector(0, 0), // sun position (remains fixed throughout the simulation)
                m        :	1.98855e30,       // sun mass in kg
                r        :	696342000         // sun radius in meter
        }

        // Color and style definitions
        this.style = {
                colBack          : '#111111',

                // Earth
                colEarth         : 'rgb(30,130,220)',
                colEarthDark     : 'rgba(0, 0, 0, 0.7)',		
                colEarthOutline  : '#00000',

                // Moon
                colMoon	         : '#c5ccd4',
                colMoonOutline   : '#c5ccd4',
                // colMoonDark      : 'rgba(0, 0, 0, 0.9)',
                // 
             
                colWater         : '#1e82dccc',
                colOrbit         : '#ffffff30',
                colOrigin        : 'white',
                // // colCenterOfEarth : 'rgba(255, 165, 0,   1)',
                colSun           : '#ffcc005e'
        }
        this.continentsImage = new Image()
        this.continentsImage.src = this.config.path + "/images/continents.png"
}


World.prototype.setScaleForceToModel = function(stat) {

        this.config.scaleForceToModel = stat;

        this.accMultiplier = 1700000
        this.forceMultiplier = this.accMultiplier * 8
        
}

//-------------------------------------------------------------------------------------------------
//
// Helper Functions
//
//-------------------------------------------------------------------------------------------------

World.prototype.mapToScreen = function(v, scale) {

        var vecScreen = v.clone()
        vecScreen.subtract(this.lookAt)

        // If no scale is provided take default distance scale, otherwise take custom value
        if (scale==null) {
                scale = this.scaleDist
        }

        vecScreen.multiplyValue(scale)
        vecScreen.addXY(this.w/2, this.h/2)

        return vecScreen
}

//-------------------------------------------------------------------------------------------------
//
// Moving Earth and Moon
//
//-------------------------------------------------------------------------------------------------

// Set angular Position of Sun, Earth and Moon
World.prototype.setPositions = function(angleSun, angleMoon) {

        // Earth position is relative to the center of mass
        this.earth.pos.x = -Math.sin(angleMoon) * this.distCenterOfMass
        this.earth.pos.y = -Math.cos(angleMoon) * this.distCenterOfMass

        // Moon position relative to the center of mass
        this.moon.pos.x = Math.sin(angleMoon) * (this.distMoonEarth - this.distCenterOfMass)
        this.moon.pos.y = Math.cos(angleMoon) * (this.distMoonEarth - this.distCenterOfMass)

        // Sun motion, shown by beams of light
        this.sun.pos.x = this.earth.pos.x + Math.sin(angleSun) * this.distEarthSun
        this.sun.pos.y = this.earth.pos.y + Math.cos(angleSun) * this.distEarthSun
}

World.prototype.move = function() {

        if (this.config.autoMove) {
                var angleMoon  = this.time * 2 * Math.PI / this.moon.p
                var angleSun   = this.time * 2 * Math.PI / this.earth.p
                this.setPositions(angleSun, angleMoon)
                this.time += this.ts
        }

        // update the position vectors
        this.vecEarthMoon = Vector.subtractEx(this.moon.pos, this.earth.pos)
        this.vecEarthSun = Vector.subtractEx(this.sun.pos, this.earth.pos)

        // compute center of mass
        // var v1 = this.earth.pos.clone().multiplyValue(this.earth.m)
        // var v2 = this.moon.pos.clone().multiplyValue(this.moon.m)
        // this.vecCenterOfMass = Vector.addEx(v1, v2).divideValue(this.earth.m + this.moon.m)
        this.lookAt = this.earth.pos.clone()
        
}

//-------------------------------------------------------------------------------------------------
//
// Updating the forcefield indicators
//
//-------------------------------------------------------------------------------------------------


World.prototype.update = function() {

        this.move()

        var delta = 2 * Math.PI / this.numArrows
                // Disable all the unphysical fancy stuff that is in here to make the
                // vectors point to the moon in the model display
                var scaleSize = 1
                var scaleDist = 1
                var scaleCompensation = 1
                var zerolength = 0
        
        // Compute the acceleration at the earth center and store it as the first entry
        var accEarthMoon = this.vecEarthMoon.clone()
        accEarthMoon.normalize()
        accEarthMoon.multiplyValue(this.gamma * this.moon.m / Math.pow(zerolength + this.vecEarthMoon.length() * scaleDist, 2))
        this.earth.tidalForce[0] = accEarthMoon.multiplyValue(scaleCompensation)

        var accEarthSun = this.vecEarthSun.clone()
        accEarthSun.normalize()
        accEarthSun.multiplyValue(this.gamma * this.sun.m / Math.pow(zerolength + this.vecEarthSun.length() * scaleDist, 2))
        this.earth.tidalForceSun[0] = accEarthSun.multiplyValue(scaleCompensation) 
 
        // Compute accelerations for the earths surface
        for (var i=1; i<this.numArrows + 1; ++i) {

                var posSurface = new Vector(Math.sin(i*delta) * this.earth.r * scaleSize,
                                            Math.cos(i*delta) * this.earth.r * scaleSize)

                //
                // Tidal effect of the moon
                //

                var posMoon = this.vecEarthMoon.clone()
                posMoon.multiplyValue(scaleDist)

                // Create a normalized vector pointing from the earth surface to the moon center and compute 
                // the gavitation force
                var accMoon = Vector.subtractEx(posMoon, posSurface)
                accMoon.normalize()

                var len = Vector.subtractEx(posMoon, posSurface).length() + zerolength
                accMoon.multiplyValue(this.gamma * this.moon.m / (len*len))
		
                // The resulting Gravitational force
                this.earth.tidalForce[i] = accMoon.multiplyValue(scaleCompensation)

                //
                // Tidal effect of the sun
                //

                var posSun = this.vecEarthSun.clone()
                posSun.multiplyValue(scaleDist)

                // Create a normalized vector pointing from the earth surface to the moon center and compute 
                // the gavitation force
                var accSun = Vector.subtractEx(posSun, posSurface)
                accSun.normalize()

                var len = Vector.subtractEx(posSun, posSurface).length() + zerolength
                accSun.multiplyValue(this.gamma * this.sun.m / (len*len))
		
                // The resulting Gravitational force
                this.earth.tidalForceSun[i] = accSun.multiplyValue(scaleCompensation)
        }	
}

//-------------------------------------------------------------------------------------------------
//
// Render Functions
//
//-------------------------------------------------------------------------------------------------

World.prototype.renderSun = function() {

        // center of the screen in pixel
        var cm = this.mapToScreen(this.lookAt)

        // Draw an arrow pointing from the sun towards earth
        var posSunScreen = this.mapToScreen(this.sun.pos, this.scaleDist)


        var vecBeam = posSunScreen.clone().subtract(cm).normalize()
        var vecBeamOrtho = new Vector(vecBeam.y, -vecBeam.x).multiplyValue(this.earth.r * this.scaleSize)
        var offset = vecBeam.multiplyValue(this.earth.r * this.scaleSize * -4)
        
        // render 5 lightbeams as an indication of where the sun is
        for (var i=0; i<3; ++i) {
                this.ctx.drawArrow(posSunScreen.x, 
                                   posSunScreen.y,
                                   cm.x + i*vecBeamOrtho.x - offset.x, 
                                   cm.y + i*vecBeamOrtho.y - offset.y, 
                                   5, 
                                   1, 
                                   this.style.colSun)
                
		
                if (i>0) {
                        this.ctx.drawArrow(posSunScreen.x,
                                           posSunScreen.y, 
                                           cm.x - i*vecBeamOrtho.x - offset.x, 
                                           cm.y - i*vecBeamOrtho.y - offset.y, 
                                           5, 
                                           1, 
                                           this.style.colSun)
                }
        }
}

World.prototype.renderMoon = function() {

        // compute the render position of the moon
        var posMoon = this.moon.pos.clone()
        posMoon = this.mapToScreen(posMoon, this.scaleDist)

        var r = this.moon.r * this.scaleSize

        // bright side
        var colOutline = this.style.colMoonOutline
        var thickness = 2
        if (!this.config.setup==1) {
                var v = Math.round(128 + 128 * Math.sin(this.time*0.15))
                colOutline = 'rgb(' + v + ',' + v + ',' + v + ')'	
                thickness = 4
        }

        this.ctx.drawCircle(posMoon, r, 0, 2 * Math.PI, this.style.colMoon, colOutline, thickness)

        // dark side
        if (this.config.showSun) {
                var a1 = this.vecEarthSun.verticalAngle()
                var a2 = a1 + Math.PI
                this.ctx.drawCircle(posMoon, r, a1, a2,this.style.colMoonDark , this.style.colMoonOutline)
        }

        if (this.config.setup==0) {
                this.ctx.drawImage(this.dragDropImage, posMoon.x - r, posMoon.y - r, 2*r, 2*r)
        }

        // var offset = this.moon.r * this.scaleSize

        // this.ctx.font="20px Arial"
        // this.ctx.fillStyle='#c5ccd4'
        // this.ctx.fillText("Mặt Trăng", posMoon.x - 45, posMoon.y + offset + 25)
}


World.prototype.renderEarth = function() {

        var f  = this.accMultiplier
        var f2 = this.forceMultiplier

        // visual on screen position of the an earth that is scaled differently in size than in distance:
        var posEarthScreen = this.mapToScreen(this.earth.pos, this.scaleSize)

        var r = this.earth.r * this.scaleSize

        // Daysite
        this.ctx.drawCircle(posEarthScreen, r, 0, 2 * Math.PI, this.style.colEarth, this.style.colEarthOutline)

        // continents
        this.ctx.drawImage(this.continentsImage, posEarthScreen.x - r, posEarthScreen.y - r, 2*r, 2*r)

        // Nightside
        if (this.config.showSun) {
                var a1 = this.vecEarthSun.verticalAngle()
                var a2 = a1 + Math.PI
                this.ctx.drawCircle(posEarthScreen, r, a1, a2, this.style.colEarthDark, this.style.colEarthOutline)
        }

        var tf  = this.earth.tidalForce[0].clone()
        var tfs = this.earth.tidalForceSun[0].clone()

        if (this.config.showAccSum) {
                var results = [this.numArrows + 1]
	
                // Draw Vector arrows
                var delta = 2 * Math.PI / this.numArrows

                for (var i=1; i<this.numArrows + 1; ++i) {
                	// Earth position in world coordinates
                        var posScreen = Vector.addEx(posEarthScreen, new Vector(Math.sin(i*delta) * this.earth.r * this.scaleSize,
                                                                                Math.cos(i*delta) * this.earth.r * this.scaleSize))
                        //
                        // Tidal force Moon
                        //
                        var tfi = this.earth.tidalForce[i]
                        
                        var v3 = Vector.subtractEx(tfi, tf)
                
                        //
                        // Tidal force Sun
                        //

                        var v6 = Vector.subtractEx(this.earth.tidalForceSun[i], tfs)
                       

                        //
                        // Combination of Sun and Moon forces
                        //
			
                        results[i] = { x : posScreen.x + f2 * (v3.x + v6.x),
                                       y : posScreen.y + f2 * (v3.y + v6.y) }
                }


                if (this.config.showAccSum) {
                        this.ctx.fillStyle = this.style.colWater
                        this.ctx.beginPath()
                        this.ctx.moveTo(results[0].x, results[0].y)

                        for (var i=1; i<this.numArrows + 1; ++i) {
                                this.ctx.lineTo(results[i].x, results[i].y)
                        }

                        this.ctx.closePath()
                        this.ctx.fill()
                }


                // Draw vectors at the earths center
                
        }
        
}


World.prototype.renderUnderlay = function() {

        if (this.config.showEarthOrbit || this.config.showMoonOrbit) {
                
                // Earth Orbit
                if (this.config.showEarthOrbit) {
                        // Draw Center of Mass of the system Earth-Moon, use size scaling factor
                        var cm = this.mapToScreen(this.vecCenterOfMass, this.scaleSize)
                        this.ctx.drawCircle(cm, this.distCenterOfMass * this.scaleSize, 0, 2*Math.PI, null, this.style.colOrbit)
                }

                // Moon Orbit
                if (this.config.showMoonOrbit) {
                        // Draw Center of Mass of the system Earth-Moon, use distance scaling factor
                        var cm = this.mapToScreen(this.vecCenterOfMass, this.ScaleDist)
                        this.ctx.drawCircle(cm, (this.distMoonEarth - this.distCenterOfMass) * this.scaleDist, 0, 2*Math.PI, null, this.style.colOrbit)
                }
        }
}


World.prototype.render = function() {
        this.ctx.fillStyle = this.style.colBack
        this.ctx.fillRect(0, 0, this.w, this.h)

        if (this.config.showSun) {
                this.renderSun()
        }

        this.renderUnderlay()
        this.renderEarth()

        if (this.config.showMoon) {
                this.renderMoon()	
        }

}

//-------------------------------------------------------------------------------------------------
//
// Entrance point
//
//-------------------------------------------------------------------------------------------------


function tidalSimulation(cfg) {
        // Global variables
        var config = cfg

        // The primary drawing canvas
        var cv = document.getElementById(config.cvid)
        var ctx = cv.getContext("2d")

        // Extend the context with a draw arrow function
        ctx.drawVector = function(x, y, vx, vy, len, w, col) {
                var x1 = x
                var y1 = y
                var x2 = x1 + vx
                var y2 = y1 + vy

                var a = Math.atan2(y2-y1, x2-x1)
                this.beginPath()
                this.moveTo(x1, y1)
                this.lineTo(x2, y2)
                this.lineTo(x2 - len * Math.cos(a - Math.PI/6), y2 - len * Math.sin(a - Math.PI/7))
                this.moveTo(x2, y2)
                this.lineTo(x2 - len * Math.cos(a + Math.PI/6), y2 - len * Math.sin(a + Math.PI/7))
                this.lineWidth = (w!=null) ? w : 2
                this.strokeStyle = (col!=null) ? col : 'yellow'
                this.stroke()
                this.closePath()
	}

        ctx.drawArrow = function(x1, y1, x2, y2, len, w, col) {
                var a = Math.atan2(y2-y1, x2-x1)
                this.beginPath()
                this.moveTo(x1, y1)
                this.lineTo(x2, y2)
                this.lineTo(x2 - len * Math.cos(a - Math.PI/6), y2 - len * Math.sin(a - Math.PI/7))
                this.moveTo(x2, y2)
                this.lineTo(x2 - len * Math.cos(a + Math.PI/6), y2 - len * Math.sin(a + Math.PI/7))
                this.lineWidth = (w!=null) ? w : 2
                this.strokeStyle = (col!=null) ? col : 'yellow'
                this.stroke()
                this.closePath()
	}

        ctx.drawCross = function(x, y, w, l, color) {
                this.beginPath()
                this.moveTo(x - l, y)
                this.lineTo(x + l, y)
                this.moveTo(x,     y - l)
                this.lineTo(x,     y + l)
                this.strokeStyle = color
                this.lineWidth = w
                this.stroke()
                this.closePath()
        }

        ctx.drawCircle = function(pos, r, a1, a2, color, colorOutline, lineWidth) {
                this.beginPath()
                this.arc(pos.x, pos.y, r, a1, a2)

                if (color!=null) {
                        this.fillStyle = color
                        this.fill()
                }

                this.lineWidth = (lineWidth!=null) ? lineWidth : 2
                this.strokeStyle = colorOutline
                this.stroke()
                this.closePath()
        }


        var world = new World(cv, config)

        function init(config) {
                if (config.isRunning) {
                        timer = window.setInterval(tick, 30)
                } else {
                        world.update()
                        world.render()
                }
        }

        function tick() {
                world.update()
                world.render()
        }

        init(config)

        return world
}
