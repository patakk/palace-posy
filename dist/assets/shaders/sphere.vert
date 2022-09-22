#include <common>
#include <shadowmap_pars_vertex>

attribute vec4 color;
attribute vec4 uvs;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec4 vColor;
varying vec4 vUV;
varying vec4 modelPos;


void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-viewPosition.xyz);
    vColor = color;
    vUV = uvs;
    modelPos = modelPosition;

    gl_Position = clipPosition;

}