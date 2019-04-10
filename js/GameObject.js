"use strict";
const GameObject = function(mesh, meshID) {
    this.mesh = mesh;
    this.meshID = meshID;
    
    this.position = new Vec3(0, 0, 0);
    this.originalPosition = new Vec3(0,0,0);
    this.orientation = 0;
    this.scale = new Vec3(1, 1, 1);

    this.modelMatrix = new Mat4();
    this.area = new Vec4(0,0,0,0); // xmin, xmax, ymin, ymax - represents the boundaries that the object can be clicked
};

GameObject.prototype.updateModelMatrix = function() {
    this.modelMatrix.set(); //set to the identity matrix
    this.modelMatrix.scale(this.scale);
    this.modelMatrix.rotate(this.orientation);
    this.modelMatrix.translate(this.position);
};

GameObject.prototype.draw = function(camera) {
    this.updateModelMatrix();
    this.mesh.material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);

    this.mesh.draw();
};

GameObject.prototype.drawSelected = function(camera, material) {
    this.updateModelMatrix();
    material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
    this.mesh.drawSelected(material);
};