"use strict";
// App constructor
const App = function(canvas, overlay) {
  this.canvas = canvas;
  this.overlay = overlay;
  this.keysPressed = {};
  this.mousePressed = {};

  // obtain WebGL context
  this.gl = canvas.getContext("webgl2");
  if (this.gl === null) {
    throw new Error("Browser does not support WebGL2");
  }


  // serves as a registry for textures or models being loaded
  this.gl.pendingResources = {};
  // create a simple scene
  this.scene = new Scene(this.gl);
  
  this.resize();
};

// match WebGL rendering resolution and viewport to the canvas size
App.prototype.resize = function() {
  this.canvas.width = this.canvas.clientWidth;
  this.canvas.height = this.canvas.clientHeight;
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

  this.scene.camera.setAspectRatio(
    this.canvas.clientWidth / this.canvas.clientHeight
  );
};

App.prototype.registerEventHandlers = function() {
  document.onkeydown = (event) => {
    // B for bomb
    if(keyboardMap[event.keyCode] === "B"){
      this.keysPressed.B = 1;
    }
    // Q for quake
    if(keyboardMap[event.keyCode] === "Q"){
      this.keysPressed.Q = 1;
    }
    // A to rotate camera counterclockwise
    if(keyboardMap[event.keyCode] === "A"){
      this.keysPressed.A = 1;
    }
    // D to rotate camera clockwise
    if(keyboardMap[event.keyCode] === "D"){
      this.keysPressed.D = 1;
    }
    // Z to control mouse drag
    if(keyboardMap[event.keyCode] === "Z"){
      this.keysPressed.Z = 1;
    }
  };

  document.onkeyup = (event) => {
    if(keyboardMap[event.keyCode] === "B"){
      this.keysPressed.B = 0;
    }
    if(keyboardMap[event.keyCode] === "Q"){
      this.keysPressed.Q = 0;
    }
    // A to rotate camera counterclockwise
    if(keyboardMap[event.keyCode] === "A"){
      this.keysPressed.A = 0;
    }
    // D to rotate camera clockwise
    if(keyboardMap[event.keyCode] === "D"){
      this.keysPressed.D = 0;
    }
    // Z to control mouse drag
    if(keyboardMap[event.keyCode] === "Z"){
      this.keysPressed.Z = 0;
    }
  };

  this.canvas.onmousedown = (event) => {
    // calculate and scale the mouse clicks so that they are where the computer thinks they are
    this.mousePressed.Down = 1;
    this.mousePressed.Xdown = 2*((event.clientX / this.canvas.width) - 0.5);
    this.mousePressed.Ydown = -2*((event.clientY / this.canvas.height) - 0.5);
    this.mousePressed.PreviousX = event.clientX;
    this.mousePressed.PreviousY = event.clientY;
  };

  this.canvas.onmousemove = (event) => {
    event.stopPropagation();
    if (this.mousePressed.Down){
      this.mousePressed.Move = 1;
      this.mousePressed.currentX = 2*((event.clientX / this.canvas.width) - 0.5);
      this.mousePressed.currentY = 2*((event.clientY / this.canvas.width) - 0.5);


      this.mousePressed.dx = 2*(((event.clientX - this.mousePressed.PreviousX) / this.canvas.width));
      this.mousePressed.dy = -2*(((event.clientY - this.mousePressed.PreviousY) / this.canvas.height));
      this.mousePressed.PreviousX = event.clientX;
      this.mousePressed.PreviousY = event.clientY;
    }
  };
  this.canvas.onmouseout = (event) => {
    //jshint unused:false
  };
  this.canvas.onmouseup = (event) => {
    this.mousePressed.Down = 0;
    this.mousePressed.Move = 1;
    this.mousePressed.Xup = 2*((event.clientX / this.canvas.width) - 0.5);
    this.mousePressed.Yup = -2*((event.clientY / this.canvas.height) - 0.5);

  };
  window.addEventListener('resize', () => this.resize() );
  window.requestAnimationFrame( () => this.update() );
};

// animation frame update
App.prototype.update = function() {

  const pendingResourceNames = Object.keys(this.gl.pendingResources);
  if (pendingResourceNames.length === 0) {
    // animate and draw scene
    this.scene.update(this.gl, this.keysPressed, this.mousePressed);
    this.overlay.innerHTML = "Esketit.";
  } else {
    this.overlay.innerHTML = "Loading: " + pendingResourceNames;
  }

  // refresh
  window.requestAnimationFrame( () => this.update() );
};

// entry point from HTML
window.addEventListener('load', function() {
  const canvas = document.getElementById("canvas");
  const overlay = document.getElementById("overlay");
  overlay.innerHTML = "WebGL";

  const app = new App(canvas, overlay);
  app.registerEventHandlers();
});