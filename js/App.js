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
    // WASD to move selected objects
    if(keyboardMap[event.keyCode] === "W"){
      this.keysPressed.W = 1;
    }
    if(keyboardMap[event.keyCode] === "A"){
      this.keysPressed.A = 1;
    }
    if(keyboardMap[event.keyCode] === "S"){
      this.keysPressed.S = 1;
    }
    if(keyboardMap[event.keyCode] === "D"){
      this.keysPressed.D = 1;
    }
    // in replacement of tab, use backquote because Henry's tab up isn't detected
    // back quote for selecting highlighted
    if(keyboardMap[event.keyCode] === "BACK_QUOTE"){
      this.keysPressed["BACK_QUOTE"] = 1;
    }
    // if PTCHRE are held down and the mouse is clicked, an object will appear at the position of the mouse click
    if(keyboardMap[event.keyCode] === "P"){
      this.keysPressed.P = 1;
    }
    if(keyboardMap[event.keyCode] === "T"){
      this.keysPressed.T = 1;
    }
    if(keyboardMap[event.keyCode] === "C"){
      this.keysPressed.C = 1;
    }
    if(keyboardMap[event.keyCode] === "H"){
      this.keysPressed.H = 1;
    }
    if(keyboardMap[event.keyCode] === "R"){
      this.keysPressed.R = 1;
    }
    if(keyboardMap[event.keyCode] === "E"){
      this.keysPressed.E = 1;
    }
    // DELETE to delete highlighted objects
    if(keyboardMap[event.keyCode] === "DELETE"){
      this.keysPressed["DELETE"] = 1;
    }
    // IJKL to scroll with the camera
    if(keyboardMap[event.keyCode] === "I"){
      this.keysPressed.I = 1;
    }
    if(keyboardMap[event.keyCode] === "J"){
      this.keysPressed.J = 1;
    }
    if(keyboardMap[event.keyCode] === "K"){
      this.keysPressed.K = 1;
    }
    if(keyboardMap[event.keyCode] === "L"){
      this.keysPressed.L = 1;
    }

    //arrow keys to move selected objects
    if(event.keyCode === 37){
      this.keysPressed["LEFT"] = 1;
    }
    if(event.keyCode === 38){
      this.keysPressed["UP"] = 1;
    }
    if(event.keyCode === 39){
      this.keysPressed["RIGHT"] = 1;
    }
    if(event.keyCode === 40){
      this.keysPressed["DOWN"] = 1;
    }

    if(event.keyCode === 32){
      this.keysPressed["SPACE"] = 1;
    }
    
    // Z for ZOOM
    if(keyboardMap[event.keyCode] === "Z"){
      this.keysPressed.Z = 1;
    }
    // X for unZOOM
    if(keyboardMap[event.keyCode] === "X"){
      this.keysPressed.X = 1;
    }

    // hold 0 and mouse click + mouse drag to pan
    if(keyboardMap[event.keyCode] === "0"){
      this.keysPressed["0"] = 1;
    }
  };
  document.onkeyup = (event) => {
    if(keyboardMap[event.keyCode] === "W"){
      this.keysPressed.W = 0;
    }
    if(keyboardMap[event.keyCode] === "A"){
      this.keysPressed.A = 0;
    }
    if(keyboardMap[event.keyCode] === "S"){
      this.keysPressed.S = 0;
    }
    if(keyboardMap[event.keyCode] === "D"){
      this.keysPressed.D = 0;
    }
    if(keyboardMap[event.keyCode] === "BACK_QUOTE"){
      this.keysPressed["BACK_QUOTE"] = 0;
    }
    if(keyboardMap[event.keyCode] === "P"){
      this.keysPressed.P = 0;
    }
    if(keyboardMap[event.keyCode] === "T"){
      this.keysPressed.T = 0;
    }
    if(keyboardMap[event.keyCode] === "C"){
      this.keysPressed.C = 0;
    }
    if(keyboardMap[event.keyCode] === "H"){
      this.keysPressed.H = 0;
    }
    if(keyboardMap[event.keyCode] === "R"){
      this.keysPressed.R = 0;
    }
    if(keyboardMap[event.keyCode] === "E"){
      this.keysPressed.E = 0;
    }
    if(keyboardMap[event.keyCode] === "DELETE"){
      this.keysPressed["DELETE"] = 0;
    }
    // IJKL to scroll with the camera
    if(keyboardMap[event.keyCode] === "I"){
      this.keysPressed.I = 0;
    }
    if(keyboardMap[event.keyCode] === "J"){
      this.keysPressed.J = 0;
    }
    if(keyboardMap[event.keyCode] === "K"){
      this.keysPressed.K = 0;
    }
    if(keyboardMap[event.keyCode] === "L"){
      this.keysPressed.L = 0;
    }
    //arrow keys to move selected objects
    if(event.keyCode === 37){
      this.keysPressed["LEFT"] = 0;
    }
    if(event.keyCode === 38){
      this.keysPressed["UP"] = 0;
    }
    if(event.keyCode === 39){
      this.keysPressed["RIGHT"] = 0;
    }
    if(event.keyCode === 40){
      this.keysPressed["DOWN"] = 0;
    }
    if(keyboardMap[event.keyCode] === "Z"){
      this.keysPressed.Z = 0;
    }
    if(keyboardMap[event.keyCode] === "X"){
      this.keysPressed.X = 0;
    }
    if(event.keyCode === 32){
      this.keysPressed["SPACE"] = 0;
    }
    // hold 0 and mouse click + mouse drag to pan
    if(keyboardMap[event.keyCode] === "0"){
      this.keysPressed["0"] = 0;
    }
  };
  this.canvas.onmousedown = (event) => {
    // calculate and scale the mouse clicks so that they are where the computer thinks they are
    this.mousePressed.Down = 1;
    this.mousePressed.X = 2*((event.clientX / this.canvas.width) - 0.5);
    this.mousePressed.Y = -2*((event.clientY / this.canvas.height) - 0.5);
    this.mousePressed.PreviousX = event.clientX;
    this.mousePressed.PreviousY = event.clientY;
  };
  this.canvas.onmousemove = (event) => {
    event.stopPropagation();
    if (this.mousePressed.Down){
      this.mousePressed.Move = 1;

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