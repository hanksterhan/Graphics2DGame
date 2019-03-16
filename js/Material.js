"use strict";
const Material = function(gl, program) {
    this.gl = gl; 
    this.program = program;
    return UniformReflection.addProperties(
        this.gl, 
        this.program.glProgram, 
        this);
};

Material.prototype.commit = function(){
    const gl = this.gl;
    this.program.commit();
    UniformReflection.commitProperties(
        this.gl,
        this.program.glProgram, 
        this);
};