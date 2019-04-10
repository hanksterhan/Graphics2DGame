"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  
  this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured_vs.essl");
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
  this.texturedProgram = new Program(gl, this.vsTextured, this.fsTextured);

  this.texturedQuad = new TexturedQuadGeometry(gl);

  this.grayTexturedMaterial = new Material(gl, this.texturedProgram);
  this.grayTexturedMaterial.colorTexture.set(new Texture2D(gl, "sprites/asteroid.png"));
  this.grayAsteroidMesh = new Mesh(this.texturedQuad, this.grayTexturedMaterial);

  this.redTexturedMaterial = new Material(gl, this.texturedProgram);
  this.redTexturedMaterial.colorTexture.set(new Texture2D(gl, "sprites/asteroid1.png"));
  this.redAsteroidMesh = new Mesh(this.texturedQuad, this.redTexturedMaterial);

  this.greenTexturedMaterial = new Material(gl, this.texturedProgram);
  this.greenTexturedMaterial.colorTexture.set(new Texture2D(gl, "sprites/asteroid2.png"));
  this.greenAsteroidMesh = new Mesh(this.texturedQuad, this.greenTexturedMaterial);

  this.purpTexturedMaterial = new Material(gl, this.texturedProgram);
  this.purpTexturedMaterial.colorTexture.set(new Texture2D(gl, "sprites/asteroid3.png"));
  this.purpAsteroidMesh = new Mesh(this.texturedQuad, this.purpTexturedMaterial);

  // helper list to populate game board with different asteroids
  this.asteroidMeshes = [this.grayAsteroidMesh, this.redAsteroidMesh, this.greenAsteroidMesh, this.purpAsteroidMesh];

  this.triangleGeometry = new TriangleGeometry(gl);
  
  this.timeAtLastFrame = new Date().getTime();

  this.camera = new OrthoCamera();
  this.camera.updateViewProjMatrix();
  
  // this.asteroid.position.set({x:0, y:0, z:0});
  this.gameBoard = [];
  this.numRows = 10;
  this.numCols = 10;
  this.setFrame = 1;

Scene.prototype.resetSelected = function(){
  this.selected = null;
  this.selectedCol = null;
  this.selectedRow = null;
  
  this.topCol = null;
  this.topRow = null;
  this.leftCol = null;
  this.leftRow = null;
  this.rightCol = null;
  this.rightRow = null;
  this.bottomCol = null;
  this.bottomRow = null;
}

Scene.prototype.update = function(gl, keysPressed, mousePressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  if(mousePressed.Down){
    console.log(mousePressed.Xdown*this.camera.windowSize.storage[0], mousePressed.Ydown*this.camera.windowSize.storage[1]);
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
        // choose a random asteroid to appear on the board
        this.row.push(new GameObject(this.asteroidMeshes[Math.floor(Math.random() * this.asteroidMeshes.length)]));

        this.row[this.row.length-1].position.set({x:this.startingX + this.deltaX*col, y:this.startingY + this.deltaY*row, z:0});
        this.row[this.row.length-1].scale.set(0.15, 0.15, 1);

        // area is vec4: xmin, xmax, ymin, ymax
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
  
  // if mouse clicked, see if it is on an obj, selected object stored in this.selected
  if(mousePressed.Down && this.selected == null){
    for(var row=0; row<this.numRows; row++){
      for(var col=0; col<this.numCols; col++){
        // area is vec4: xmin, xmax, ymin, ymax
        if (mousePressed.Xdown*this.camera.windowSize.storage[0] > this.gameBoard[row][col].area.storage[0] &&
            mousePressed.Xdown*this.camera.windowSize.storage[0] < this.gameBoard[row][col].area.storage[1] &&
            mousePressed.Ydown*this.camera.windowSize.storage[1] < this.gameBoard[row][col].area.storage[2] &&
            mousePressed.Ydown*this.camera.windowSize.storage[1] > this.gameBoard[row][col].area.storage[3]){
              this.selected = this.gameBoard[row][col];
              this.selectedRow = row;
              this.selectedCol = col;

              //keep track of the 4 cells next to the selected cell
              this.leftRow = (col != 0) ? row : null; // nothing to the left
              this.rightRow = (col != 9) ? row : null; // nothing to the right
              this.topRow = (row != 0) ? row - 1: null; // nothing above
              this.bottomRow = (row != 9) ? row + 1 : null; // nothing below
              
              this.leftCol = (col != 0) ? col - 1 : null; // nothing to the left
              this.rightCol = (col != 9) ? col + 1 : null; // nothing to the right
              this.topCol = (row != 0) ? col : null; // nothing above
              this.bottomCol = (row != 9) ? col : null; // nothing below
        }
      }
    }
  }

  // mouse drag selected objects if mouse is down and moving
  if(mousePressed.Down && mousePressed.Move && this.selected != null){
    var ratio = this.camera.windowSize.storage[0] / this.camera.windowSize.storage[1];
    var dx = (mousePressed.dx * this.camera.windowSize.storage[0]) / (ratio);
    var dy = (mousePressed.dy * this.camera.windowSize.storage[1]);

    // // determine which direction the mouse is moving, if not enough in either direction 
    // // left
    // if (mousePressed.currentX < this.gameBoard[this.leftRow][this.leftCol].area.storage[1]) {

    // }
    // // right
    // if (mousePressed.currentX > this.gameBoard[this.rightRow][this.rightCol].area.storage[0]) {

    // }

    // // up
    // if (mousePressed.currentY > this.gameBoard[this.topRow][this.topCol].area.storage[2]) {

    // }

    // // down 
    // if (mousePressed.currentY < this.gameBoard[this.bottomRow][this.bottomCol].area.storage[3]) {
      
    // }
  }

  // if there is a selected gem and the mouse moved, check if the mouse was released over a neighbor
  if (mousePressed.Down == 0 && mousePressed.Move == 1 && this.selected != null){
    //check above
    if (this.topCol != null && this.topRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.topRow][this.topCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.topRow][this.topCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.topRow][this.topCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.topRow][this.topCol].area.storage[3]){
            this.tempMesh = this.gameBoard[this.topRow][this.topCol].mesh;
            this.gameBoard[this.topRow][this.topCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
            this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
            this.tempMesh = null;

            // reset the selected gem
            this.resetSelected();
        } 
    } 
    if (this.leftCol != null && this.leftRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.leftRow][this.leftCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.leftRow][this.leftCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.leftRow][this.leftCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.leftRow][this.leftCol].area.storage[3]){
            this.tempMesh = this.gameBoard[this.leftRow][this.leftCol].mesh;
            this.gameBoard[this.leftRow][this.leftCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
            this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
            this.tempMesh = null;

            // reset the selected gem
            this.resetSelected();
      } 
    }

    if (this.rightCol != null && this.rightRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.rightRow][this.rightCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.rightRow][this.rightCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.rightRow][this.rightCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.rightRow][this.rightCol].area.storage[3]){
            this.tempMesh = this.gameBoard[this.rightRow][this.rightCol].mesh;
            this.gameBoard[this.rightRow][this.rightCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
            this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
            this.tempMesh = null;

            // reset the selected gem
            this.resetSelected();
      } 
    }

    if (this.bottomCol != null && this.bottomRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.bottomRow][this.bottomCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.bottomRow][this.bottomCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.bottomRow][this.bottomCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.bottomRow][this.bottomCol].area.storage[3]){
            this.tempMesh = this.gameBoard[this.bottomRow][this.bottomCol].mesh;
            this.gameBoard[this.bottomRow][this.bottomCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
            this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
            this.tempMesh = null;

            // reset the selected gem
            this.resetSelected();
     } 
    }

    //reset the selected gem because mouse released over invalid gem
    this.resetSelected();

  }



  //   if (mousePressed.Xdown*this.camera.windowSize.storage[0] > this.gameBoard[row][col].area.storage[0] &&
  //       mousePressed.Xdown*this.camera.windowSize.storage[0] < this.gameBoard[row][col].area.storage[1] &&
  //       mousePressed.Ydown*this.camera.windowSize.storage[1] < this.gameBoard[row][col].area.storage[2] &&
  //       mousePressed.Ydown*this.camera.windowSize.storage[1] > this.gameBoard[row][col].area.storage[3]){
  //       console.log("something happened")
  //     }
  //     if(this.mousePressed.Xup*this.camera.windowSize.storage[0]
  //     this.mousePressed.Yup*this.camera.windowSize.storage[1]

  //     mousePressed.Xdown*this.camera.windowSize.storage[0] > this.gameBoard[row][col].area.storage[0]
  // }

  // instead of doing this, when we find the index of the selected gem, get neighbors

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


