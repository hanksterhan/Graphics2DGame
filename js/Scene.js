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
  
  this.gameBoard = [];
  this.numRows = 10;
  this.numCols = 10;
  this.setFrame = 1;
  this.quakeCount = 0;
  this.quakeFrameLimit = 100;

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

Scene.prototype.checkValidSwap = function(direction){
  // 0 up, 1 right, 2 down, 3 left
  // returns [[xstart, xend, xbar, ystart, yend, ybar], [xstart2, xend2, xbar2, ystart2, yend2, ybar2]] if 2 swaps are possible
  // returns [[xstart, xend, xbar, ystart, yend, ybar]] if only the selected swap is possible
  // returns [[xstart2, xend2, xbar2, ystart2, yend2, ybar2]] if only the secondary swap is possible
  // returns [] if no swaps are possible

  var xstart = 0;
  var xend = 0;
  var xbar = 0; // the original y axis of the x check
  var ystart = 0;
  var yend = 0;
  var ybar = 0; // the original x axis of the y check

  var xstart2 = this.selectedCol;
  var xend2 = this.selectedCol;
  var xbar2 = this.selectedRow;
  var ystart2 = this.selectedRow;
  var yend2 = this.selectedRow;
  var ybar2 = this.selectedCol;

  if (direction == 0){
    // check swapping up
    xstart = this.topCol;
    xend = this.topCol;
    xbar = this.topRow;
    ystart = this.topRow;
    yend = this.topRow;
    ybar = this.topCol;

    // horizontal check
    var i = 1;
    while((this.topCol-i >= 0) && this.gameBoard[this.topRow][this.topCol-i].meshID == this.selected.meshID){
      xstart -= 1;
      i += 1;
    }
    var i = 1;
    while((this.topCol+i < this.numCols) && this.gameBoard[this.topRow][this.topCol+i].meshID == this.selected.meshID){
      xend += 1;
      i += 1;
    }

    // vertical check
    var i = 1;
    while((this.topRow-i >= 0) && this.gameBoard[this.topRow-i][this.topCol].meshID == this.selected.meshID){
      ystart -= 1;
      i += 1;
    }

    // Secondary check
    var secondaryID = this.gameBoard[this.topRow][this.topCol].meshID;

    // horizontal check
    var i = 1;
    while((this.selectedCol-i >= 0) && this.gameBoard[this.selectedRow][this.selectedCol-i].meshID == secondaryID){
      xstart2 -= 1;
      i += 1;
    }
    var i = 1;
    while((this.selectedCol+i < this.numCols) && this.gameBoard[this.selectedRow][this.selectedCol+i].meshID == secondaryID){
      xend2 += 1;
      i += 1;
    }

    // vertical check
    var i = 1;
    while((this.selectedRow-i >= 0) && this.gameBoard[this.selectedRow-i][this.selectedCol].meshID == secondaryID){
      ystart2 -= 1;
      i += 1;
    }

  } else if(direction == 1){
    //check swapping right
    xstart = this.rightCol;
    xend = this.rightCol;
    xbar = this.rightRow;
    ystart = this.rightRow;
    yend = this.rightRow;
    ybar = this.rightCol;

    // vertical check
    var i = 1;
    while((this.rightRow-i >= 0) && this.gameBoard[this.rightRow-i][this.rightCol].meshID == this.selected.meshID){
      ystart -= 1;
      i += 1;
    }
    var i = 1;
    while((this.rightRow+i < this.numRows) && this.gameBoard[this.rightRow+i][this.rightCol].meshID == this.selected.meshID){
      yend += 1;
      i += 1;
    }
    // horizontal check
    var i = 1;
    while((this.rightCol+i < this.numCols) && this.gameBoard[this.rightRow][this.rightCol+i].meshID == this.selected.meshID){
      xend += 1;
      i += 1;
    }

    var secondaryID = this.gameBoard[this.rightRow][this.rightCol].meshID;

    // vertical check
    var i = 1;
    while((this.selectedRow-i >= 0) && this.gameBoard[this.selectedRow-i][this.selectedCol].meshID == secondaryID){
      ystart2 -= 1;
      i += 1;
    }
    var i = 1;
    while((this.selectedRow+i < this.numRows) && this.gameBoard[this.selectedRow+i][this.selectedCol].meshID == secondaryID){
      yend2 += 1;
      i += 1;
    }
    // horizontal check
    var i = 1;
    while((this.selectedCol+i < this.numCols) && this.gameBoard[this.selectedRow][this.selectedCol+i].meshID == secondaryID){
      xend2 += 1;
      i += 1;
    }

  } else if(direction == 2){
    // check swapping bottom
    xstart = this.bottomCol;
    xend = this.bottomCol;
    xbar = this.bottomRow;
    ystart = this.bottomRow;
    yend = this.bottomRow;
    ybar = this.bottomCol;

    // horizontal check
    var i = 1;
    while((this.bottomCol-i >= 0) && this.gameBoard[this.bottomRow][this.bottomCol-i].meshID == this.selected.meshID){
      xstart -= 1;
      i += 1;
    }
    var i = 1;
    while((this.bottomCol+i < this.numCols) && this.gameBoard[this.bottomRow][this.bottomCol+i].meshID == this.selected.meshID){
      xend += 1;
      i += 1;
    }

    // vertical check
    var i = 1;
    while((this.bottomRow+i < this.numRows) && this.gameBoard[this.bottomRow+i][this.bottomCol].meshID == this.selected.meshID){
      yend += 1;
      i += 1;
    }

    var secondaryID = this.gameBoard[this.bottomRow][this.bottomCol].meshID;

    // horizontal check
    var i = 1;
    while((this.selectedCol-i >= 0) && this.gameBoard[this.selectedRow][this.selectedCol-i].meshID == secondaryID){
      xstart2 -= 1;
      i += 1;
    }
    var i = 1;
    while((this.selectedCol+i < this.numCols) && this.gameBoard[this.selectedRow][this.selectedCol+i].meshID == secondaryID){
      xend2 += 1;
      i += 1;
    }

    // vertical check
    var i = 1;
    while((this.selectedRow+i < this.numRows) && this.gameBoard[this.selectedRow+i][this.selectedCol].meshID == secondaryID){
      yend2 += 1;
      i += 1;
        }
  } else {
    //check swapping left
    xstart = this.leftCol;
    xend = this.leftCol;
    xbar = this.leftRow;
    ystart = this.leftRow;
    yend = this.leftRow;
    ybar = this.leftCol;

    // vertical check
    var i = 1;
    while((this.leftRow-i >= 0) && this.gameBoard[this.leftRow-i][this.leftCol].meshID == this.selected.meshID){
      ystart -= 1;
      i += 1;
    }
    var i = 1;
    while((this.leftRow+i < this.numRows) && this.gameBoard[this.leftRow+i][this.leftCol].meshID == this.selected.meshID){
      yend += 1;
      i += 1;
    }
    // horizontal check
    var i = 1;
    while((this.leftCol-i >= 0) && this.gameBoard[this.leftRow][this.leftCol+i].meshID == this.selected.meshID){
      xstart -= 1;
      i += 1;
    }

    var secondaryID = this.gameBoard[this.bottomRow][this.bottomCol].meshID;

    // vertical check
    var i = 1;
    while((this.selectedRow-i >= 0) && this.gameBoard[this.selectedRow-i][this.selectedCol].meshID == secondaryID){
      ystart2 -= 1;
      i += 1;
    }
    var i = 1;
    while((this.selectedRow+i < this.numRows) && this.gameBoard[this.selectedRow+i][this.selectedCol].meshID == secondaryID){
      yend2 += 1;
      i += 1;
    }
    // horizontal check
    var i = 1;
    while((this.selectedCol-i >= 0) && this.gameBoard[this.selectedRow][this.selectedCol+i].meshID == secondaryID){
      xstart2 -= 1;
      i += 1;
    }
  }
    
  var returnList = [];
  // check if valid move
  if (xend - xstart >= 2 || yend - ystart >= 2){
    returnList.push([xstart, xend, xbar, ystart, yend, ybar]);
    console.log("orig swap");
  } 
  if(xend2 - xstart2 >= 2 || yend2 - ystart2 >= 2){
    returnList.push([xstart2, xend2, xbar2, ystart2, yend2, ybar2]);
    console.log("secondary swap");
  }
  console.log("returning ", returnList);
  return returnList;
}

Scene.prototype.clearGems = function(indices){
  // [[xstart, xend, xbar, ystart, yend, ybar], [xstart2, xend2, xbar2, ystart2, yend2, ybar2]] if 2 swaps are possible
  // [[xstart, xend, xbar, ystart, yend, ybar]] if only the selected swap is possible
  // [[xstart2, xend2, xbar2, ystart2, yend2, ybar2]] if only the secondary swap is possible
  for(var i=0; i<indices.length;i++){
    var xstart = indices[i][0];
    var xend = indices[i][1];
    var xbar = indices[i][2]
    var ystart = indices[i][3];
    var yend = indices[i][4];
    var ybar = indices[i][5];
    for(var j=xstart; j<=xend; j++){
      this.bomb(xbar, j);
    }
    for(var k=ystart; k<=yend; k++){
      this.bomb(k, ybar);
    }
  }
}

Scene.prototype.bomb = function(row, col) {
  console.log("deleting at", row, col)
  this.gameBoard[row][col].scale.set(0,0,0);
  this.gameBoard[row][col].mesh = this.asteroidMeshes[Math.floor(Math.random() * this.asteroidMeshes.length)];
}

Scene.prototype.dramaticExit = function(row, col){
  console.log("deleting at ", row, col)
  const deleteTimeStart = new Date().getTime();
  var dt = 0;
  var counter = 0;
  while(dt > -0.4){
    var timeAtThisFrame = new Date().getTime();
    dt = (deleteTimeStart - timeAtThisFrame) / 1000.0;
    counter += 1;
    if (dt.toString().split('').pop() > 8){
      this.gameBoard[row][col].scale.x -= 0.0009;
      this.gameBoard[row][col].scale.y -= 0.0009;
      // this.gameBoard[row][col].orientation += 0.1;
      // this.gameBoard[row][col].position.x += 0.001;
      // this.gameBoard[row][col].position.y += 0.001;
      console.log("spin", this.gameBoard[row][col].position.storage[0]);
    }
    this.gameBoard[row][col].draw(this.camera);
    console.log(dt);
  }  
  console.log(counter);
}

Scene.prototype.skyfall = function() {
  for(var row=this.numRows-1; row>=0; row--){
    for(var col=0; col<this.numCols; col++){
      //skyfall needed if gem was deleted
      if (this.gameBoard[row][col].scale.storage[0] == 0){
        this.gameBoard[row][col].scale.set(0.15,0.15,1);
        for(var overhead=row-1; overhead>1; overhead--){
          this.gameBoard[overhead+1][col].mesh = this.gameBoard[overhead][col].mesh;
        }
        this.gameBoard[0][col].mesh = this.asteroidMeshes[Math.floor(Math.random() * this.asteroidMeshes.length)];
      }
    }
  }
}

Scene.prototype.update = function(gl, keysPressed, mousePressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  if (this.setFrame){
    this.startingX = this.camera.windowSize.storage[0] * -0.4;
    this.startingY = this.camera.windowSize.storage[1] * 0.8;
    this.deltaX =  this.camera.windowSize.storage[0] * 0.8 * 0.1;
    this.deltaY = this.camera.windowSize.storage[1] * 0.8 * -0.2;
    this.setFrame = 0;

    // initialize game board
    for(var row=0; row<this.numRows; row++){
      this.row = [];
      for(var col=0; col<this.numCols; col++){
        // choose a random asteroid to appear on the board
        var randNum = Math.floor(Math.random() * this.asteroidMeshes.length);
        this.row.push(new GameObject(this.asteroidMeshes[randNum], randNum));
        

        this.row[this.row.length-1].position.set({x:this.startingX + this.deltaX*col, y:this.startingY + this.deltaY*row, z:0});
        this.row[this.row.length-1].originalPosition.set({x:this.startingX + this.deltaX*col, y:this.startingY + this.deltaY*row, z:0});
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

  //if mouse clicked and the key B is pressed, delete the object 
  if(mousePressed.Down && keysPressed.B){
    this.bomb(this.selectedRow, this.selectedCol);
    this.resetSelected();
  }

  // if the key Q is pressed, quake
  if(keysPressed.Q){
    if (this.quakeCount < this.quakeFrameLimit){
      this.quakeCount += 1;
      this.camera.position.x = 0 + Math.sin(Math.random());
      this.camera.position.y = 0 + Math.sin(Math.random());

      // 0.1% chance of gem disappearing
      for(var row=0; row<this.numRows; row++){
        for(var col=0; col<this.numCols; col++){
          if(Math.floor(Math.random()*1000) == 842){
            this.bomb(row, col);
          }
        }
      }
      
    } else{
      console.log("Quake limit reached");
    }
  } else{ //reset camera position to the center
    this.camera.position.set(0,0);
  }

  // mouse drag selected objects if mouse is down and moving
  if(mousePressed.Down && mousePressed.Move && this.selected != null && keysPressed.Z){
    var ratio = this.camera.windowSize.storage[0] / this.camera.windowSize.storage[1];
    var dx = (mousePressed.dx * this.camera.windowSize.storage[0]);
    var dy = (mousePressed.dy * this.camera.windowSize.storage[1]);

    this.gameBoard[this.selectedRow][this.selectedCol].position.x += dx;
    this.gameBoard[this.selectedRow][this.selectedCol].position.y += dy;

  }

  // if there is a selected gem and the mouse moved, check if the mouse was released over a neighbor
  if (mousePressed.Down == 0 && mousePressed.Move == 1 && this.selected != null){
    //check above
    if (this.topCol != null && this.topRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.topRow][this.topCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.topRow][this.topCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.topRow][this.topCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.topRow][this.topCol].area.storage[3]){
            var indices = this.checkValidSwap(0);
            if(indices.length){
              this.tempMesh = this.gameBoard[this.topRow][this.topCol].mesh;
              this.gameBoard[this.topRow][this.topCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
              this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
              this.tempMesh = null;

              if (keysPressed.Z){
                this.gameBoard[this.selectedRow][this.selectedCol].position.set(
                  {
                    x:this.gameBoard[this.topRow][this.topCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.topRow][this.topCol].originalPosition.storage[1], 
                    z:0
                  }
                );
                this.gameBoard[this.topRow][this.topCol].position.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[1],
                    z:0
                  }
                );
                this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].position.x,
                    y:this.gameBoard[this.selectedRow][this.selectedCol].position.y,
                    z:0
                  }
                );
                this.gameBoard[this.topRow][this.topCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.topRow][this.topCol].position.x,
                    y:this.gameBoard[this.topRow][this.topCol].position.y,
                    z:0
                  }
                );
              }
              
              // reset the selected gem
              this.resetSelected();
              this.clearGems(indices);

            } else{
              console.log('invalid swap');
              this.resetSelected();
            }
   

            

        } 
    } 
    if (this.leftCol != null && this.leftRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.leftRow][this.leftCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.leftRow][this.leftCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.leftRow][this.leftCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.leftRow][this.leftCol].area.storage[3]){
            var indices = this.checkValidSwap(3);
            if (indices.length){
              this.tempMesh = this.gameBoard[this.leftRow][this.leftCol].mesh;
              this.gameBoard[this.leftRow][this.leftCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
              this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
              this.tempMesh = null;

              if (keysPressed.Z){
                this.gameBoard[this.selectedRow][this.selectedCol].position.set(
                  {
                    x:this.gameBoard[this.leftRow][this.leftCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.leftRow][this.leftCol].originalPosition.storage[1], 
                    z:0
                  }
                );
                this.gameBoard[this.leftRow][this.leftCol].position.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[1],
                    z:0
                  }
                );
                this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].position.x,
                    y:this.gameBoard[this.selectedRow][this.selectedCol].position.y,
                    z:0
                  }
                );
                this.gameBoard[this.leftRow][this.leftCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.leftRow][this.leftCol].position.x,
                    y:this.gameBoard[this.leftRow][this.leftCol].position.y,
                    z:0
                  }
                );
              }
  
              // reset the selected gem
              this.resetSelected();
              this.clearGems(indices);

            } else{
              console.log("invalid move");
              this.resetSelected();
            }
      } 
    }

    if (this.rightCol != null && this.rightRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.rightRow][this.rightCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.rightRow][this.rightCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.rightRow][this.rightCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.rightRow][this.rightCol].area.storage[3]){
            var indices = this.checkValidSwap(1);
            if (indices.length){
              this.tempMesh = this.gameBoard[this.rightRow][this.rightCol].mesh;
              this.gameBoard[this.rightRow][this.rightCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
              this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
              this.tempMesh = null;

              if (keysPressed.Z){
                this.gameBoard[this.selectedRow][this.selectedCol].position.set(
                  {
                    x:this.gameBoard[this.rightRow][this.rightCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.rightRow][this.rightCol].originalPosition.storage[1], 
                    z:0
                  }
                );
                this.gameBoard[this.rightRow][this.rightCol].position.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[1],
                    z:0
                  }
                );
                this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].position.x,
                    y:this.gameBoard[this.selectedRow][this.selectedCol].position.y,
                    z:0
                  }
                );
                this.gameBoard[this.rightRow][this.rightCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.rightRow][this.rightCol].position.x,
                    y:this.gameBoard[this.rightRow][this.rightCol].position.y,
                    z:0
                  }
                );
              }
  
              // reset the selected gem
              this.resetSelected();
              this.clearGems(indices);
            } else{
              console.log("invalid move");
              this.resetSelected();
            }
      } 
    }

    if (this.bottomCol != null && this.bottomRow != null){
      if (mousePressed.Xup*this.camera.windowSize.storage[0] > this.gameBoard[this.bottomRow][this.bottomCol].area.storage[0] &&
          mousePressed.Xup*this.camera.windowSize.storage[0] < this.gameBoard[this.bottomRow][this.bottomCol].area.storage[1] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] < this.gameBoard[this.bottomRow][this.bottomCol].area.storage[2] &&
          mousePressed.Yup*this.camera.windowSize.storage[1] > this.gameBoard[this.bottomRow][this.bottomCol].area.storage[3]){
            var indices = this.checkValidSwap(2);
            if (indices.length){
              this.tempMesh = this.gameBoard[this.bottomRow][this.bottomCol].mesh;
              this.gameBoard[this.bottomRow][this.bottomCol].mesh = this.gameBoard[this.selectedRow][this.selectedCol].mesh;
              this.gameBoard[this.selectedRow][this.selectedCol].mesh = this.tempMesh;
              this.tempMesh = null;

              if (keysPressed.Z){
                this.gameBoard[this.selectedRow][this.selectedCol].position.set(
                  {
                    x:this.gameBoard[this.bottomRow][this.bottomCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.bottomRow][this.bottomCol].originalPosition.storage[1], 
                    z:0
                  }
                );
                this.gameBoard[this.bottomRow][this.bottomCol].position.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[0], 
                    y:this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[1],
                    z:0
                  }
                );
                this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.selectedRow][this.selectedCol].position.x,
                    y:this.gameBoard[this.selectedRow][this.selectedCol].position.y,
                    z:0
                  }
                );
                this.gameBoard[this.bottomRow][this.bottomCol].originalPosition.set(
                  {
                    x:this.gameBoard[this.bottomRow][this.bottomCol].position.x,
                    y:this.gameBoard[this.bottomRow][this.bottomCol].position.y,
                    z:0
                  }
                );
              }
  
              // reset the selected gem
              this.resetSelected();
              this.clearGems(indices)
            } else{
              console.log("invalid move");
              this.resetSelected();
            }
     } 
    }

    //reset the selected gem because mouse released over invalid gem
    if (this.selected != null) {
      this.gameBoard[this.selectedRow][this.selectedCol].position.set(this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[0], this.gameBoard[this.selectedRow][this.selectedCol].originalPosition.storage[1], 0);
      this.resetSelected();
    }
  }

  // activate skyfall after quake
  if(!keysPressed.Q){
    this.skyfall();
  }

  if(keysPressed.A){
    this.camera.rotation += 0.01;
  }
  if(keysPressed.D){
    this.camera.rotation -= 0.01;

  }

  // clear the screen
  gl.clearColor(0.2, 0.3, 0.4, 1);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.updateViewProjMatrix();


  // draw all objects
  for(var row=0; row<this.gameBoard.length; row++){
    for(var col=0; col<this.gameBoard[row].length; col++){
      this.gameBoard[row][col].draw(this.camera);
    }
  }
};

}


