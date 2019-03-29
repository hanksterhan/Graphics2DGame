"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  
  this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured_vs.essl");
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
  this.texturedProgram = new Program(gl, this.vsTextured, this.fsTextured);

  this.texturedMaterial = new Material(gl, this.texturedProgram);
  this.texturedMaterial.colorTexture.set(new Texture2D(gl, "sprites/asteroid.png"));

  this.texturedQuad = new TexturedQuadGeometry(gl);
  this.asteroidMesh = new Mesh(this.texturedQuad, this.texturedMaterial);
  this.asteroid = new GameObject(this.asteroidMesh);

  this.triangleGeometry = new TriangleGeometry(gl);
  
  this.timeAtLastFrame = new Date().getTime();

  this.camera = new OrthoCamera();
  this.camera.updateViewProjMatrix();
  
  // this.asteroid.position.set({x:0, y:0, z:0});
  
  // this.gameBoard = [...Array(10)].map(e => Array(10).fill(new GameObject(this.asteroidMesh)));
  this.gameBoard = [];
  this.numRows = 10;
  this.numCols = 10;
  this.setFrame = 1;



Scene.prototype.update = function(gl, keysPressed, mousePressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  if(mousePressed.Down){
    console.log(mousePressed.X*this.camera.windowSize.storage[0], mousePressed.Y*this.camera.windowSize.storage[1]);
  }
  if (this.setFrame){
    this.startingX = this.camera.windowSize.storage[0] * -0.4;
    this.startingY = this.camera.windowSize.storage[1] * 0.8;
    this.deltaX =  this.camera.windowSize.storage[0] * 0.8 * 0.1;
    this.deltaY = this.camera.windowSize.storage[1] * 0.8 * -0.2;
    this.setFrame = 0;
    console.log("window size: ", this.camera.windowSize.storage[0], this.camera.windowSize.storage[1]);

    // initialize game board
    for(var row=0; row<this.numRows; row++){
      this.row = [];
      for(var col=0; col<this.numCols; col++){
        this.row.push(new GameObject(this.asteroidMesh));
        this.row[this.row.length-1].position.set({x:this.startingX + this.deltaX*col, y:this.startingY + this.deltaY*row, z:0});
        this.row[this.row.length-1].scale.set(0.15, 0.15, 1);
        this.row[this.row.length-1].area.set(
          this.startingX + this.deltaX*col - 0.5*this.deltaX, //minX
          this.startingX + this.deltaX*col + 0.5*this.deltaX, //maxX
          this.startingY + this.deltaY*row - 0.5*this.deltaY, //minY
          this.startingY + this.deltaY*row + 0.5*this.deltaY  //maxY
          )
      }
      this.gameBoard.push(this.row);
    }
  }
  
  // If mouse clicked and p is pressed, draw a plant where the mouse is clicked:
  // if(mousePressed.Down && keysPressed.P){
  //   this.plant2 = new GameObject(this.cyanPlant);
  //   this.plant2.position.set({x:mousePressed.X*this.camera.windowSize.storage[0], y:mousePressed.Y*this.camera.windowSize.storage[1], z:0});
  //   this.gameObjects.push(this.plant2);
  // }

  // clear the screen
  gl.clearColor(0.2, 0.3, 0.4, 1);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // draw all objects
  for(var row=0; row<this.gameBoard.length; row++){
    for(var col=0; col<this.gameBoard[row].length; col++){
      this.gameBoard[row][col].draw(this.camera);
    }
  }
};

}


