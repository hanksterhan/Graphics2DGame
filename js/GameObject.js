"use strict";
const GameObject = function(mesh) {
    this.mesh = mesh;
    
    this.position = new Vec3(0, 0, 0);
    this.orientation = 0;
    this.scale = new Vec3(1, 1, 1);

    this.modelMatrix = new Mat4();
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