#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

uniform vec3 uColor;
uniform float uTime;
uniform float uGlossiness;
uniform vec2 resolution;
uniform float seed;
uniform float algo;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec4 vColor;
varying vec4 vUV;
varying vec4 modelPos;


const float pi = 3.14159265f;

const float numBlurPixelsPerSide = 4.0f;



float random (in vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise3 (in vec2 _st, in float t) {
    vec2 i = floor(_st+t);
    vec2 f = fract(_st+t);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 12

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st)*(1.+.85*sin(_st.x));
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm3 ( in vec2 _st, in float t) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise3(_st, t);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}


// gaussian blur filter modified from Filip S. at intel 
// https://software.intel.com/en-us/blogs/2014/07/15/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms
// this function takes three parameters, the texture we want to blur, the uvs, and the texelSize
vec3 gaussianBlur( sampler2D t, vec2 texUV, vec2 stepSize ){   
    // a variable for our output                                                                                                                                                                 
    vec3 colOut = vec3( 0.0 );                                                                                                                                   

    // stepCount is 9 because we have 9 items in our array , const means that 9 will never change and is required loops in glsl                                                                                                                                     
    const int stepCount = 9;

    // these weights were pulled from the link above
    float gWeights[stepCount];
        gWeights[0] = 0.10855;
        gWeights[1] = 0.13135;
        gWeights[2] = 0.10406;
        gWeights[3] = 0.07216;
        gWeights[4] = 0.04380;
        gWeights[5] = 0.02328;
        gWeights[6] = 0.01083;
        gWeights[7] = 0.00441;
        gWeights[8] = 0.00157;

    // these offsets were also pulled from the link above
    float gOffsets[stepCount];
        gOffsets[0] = 0.66293;
        gOffsets[1] = 2.47904;
        gOffsets[2] = 4.46232;
        gOffsets[3] = 6.44568;
        gOffsets[4] = 8.42917;
        gOffsets[5] = 10.41281;
        gOffsets[6] = 12.39664;
        gOffsets[7] = 14.38070;
        gOffsets[8] = 16.36501;
    
    // lets loop nine times
    for( int i = 0; i < stepCount; i++ ){  

        // multiply the texel size by the by the offset value                                                                                                                                                               
        vec2 texCoordOffset = gOffsets[i] * stepSize;

        // sample to the left and to the right of the texture and add them together                                                                                                           
        vec3 col = texture2D( t, texUV + texCoordOffset ).xyz + texture2D( t, texUV - texCoordOffset ).xyz; 

        // multiply col by the gaussian weight value from the array
        col *= gWeights[i];

        // add it all up
        colOut +=  col;                                                                                                                               
    }

    // our final value is returned as col out
    return colOut;                                                                                                                                                   
} 

float fff(vec2 st, float seed){

    vec2 q = vec2(0.);
    q.x = fbm3( st + 0.1, seed*.11);
    q.y = fbm3( st + vec2(1.0), seed*.11);
    vec2 r = vec2(0.);
    r.x = fbm3( st + 1.0*q + vec2(1.7,9.2)+ 0.15*seed*0.11, seed*.11);
    r.y = fbm3( st + 1.0*q + vec2(8.3,2.8)+ 0.126*seed*0.11, seed*.11);
    float f = fbm3(st+r, seed*.11);
    float ff = (f*f*f+0.120*f*f+.5*f);

    return ff;
}

vec4 blur(sampler2D t, vec2 coor, float blurSize, vec2 direction){
    float sigma = 3.0;
    // Incremental Gaussian Coefficent Calculation (See GPU Gems 3 pp. 877 - 889)
    vec3 incrementalGaussian;
    incrementalGaussian.x = 1.0f / (sqrt(2.0f * pi) * sigma);
    incrementalGaussian.y = exp(-0.5f / (sigma * sigma));
    incrementalGaussian.z = incrementalGaussian.y * incrementalGaussian.y;
    
    vec4 avgValue = vec4(0.0f, 0.0f, 0.0f, 0.0f);
    float coefficientSum = 0.0f;
    
    // Take the central sample first...
    avgValue += texture2D(t, coor.xy) * incrementalGaussian.x;
    coefficientSum += incrementalGaussian.x;
    incrementalGaussian.xy *= incrementalGaussian.yz;
    
    // Go through the remaining 8 vertical samples (4 on each side of the center)
    for (float i = 1.0f; i <= numBlurPixelsPerSide; i++) { 
        avgValue += texture2D(t, coor.xy - i * blurSize * 
                            direction) * incrementalGaussian.x;         
        avgValue += texture2D(t, coor.xy + i * blurSize * 
                            direction) * incrementalGaussian.x;         
        coefficientSum += 2. * incrementalGaussian.x;
        incrementalGaussian.xy *= incrementalGaussian.yz;
    }
    
    return avgValue / coefficientSum;
}

float power(float p, float g) {
    if (p < 0.5)
        return 0.5 * pow(2.*p, g);
    else
        return 1. - 0.5 * pow(2.*(1. - p), g);
}

float map(float v, float v1, float v2, float v3, float v4){
    return (v-v1)/(v2-v1)*(v4-v3)+v3;
}

vec3 colors(float k){
    k = mod(k, 1.);
                                                                                                          
    const int stepCount = ZZZ;

    // these weights were pulled from the link above
    vec3 gWeights[stepCount];
    // gWeights[0] = vec3(0.0, 18.0, 25.0)/255.;
    // gWeights[1] = vec3(0.0, 95.0, 115.0)/255.;
    // gWeights[2] = vec3(10.0, 147.0, 150.0)/255.;
    // gWeights[3] = vec3(148.0, 210.0, 189.0)/255.;
    // gWeights[4] = vec3(233.0, 216.0, 166.0)/255.;
    // gWeights[5] = vec3(238.0, 155.0, 0.0)/255.;
    // gWeights[6] = vec3(202.0, 103.0, 2.0)/255.;
    // gWeights[7] = vec3(187.0, 62.0, 3.0)/255.;
    // gWeights[8] = vec3(174.0, 32.0, 18.0)/255.;
    // gWeights[9] = vec3(155.0, 34.0, 38.0)/255.;

    YYY

    int q;
    int idx1 = int(floor(k*(float(stepCount)-1.)));
    int idx2 = idx1+1;
    
    float pp = k*(float(stepCount)-1.) - float(idx1);
    vec3 colout = mix(gWeights[idx1], gWeights[idx2], pp);  

    return colout;
}       

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    // shadow map
    DirectionalLightShadow directionalLight = directionalLightShadows[0];

    float shadow = getShadow(
        directionalShadowMap[0],
        directionalLight.shadowMapSize,
        directionalLight.shadowBias,
        directionalLight.shadowRadius,
        vDirectionalShadowCoord[0]
    );

    // directional light
    float NdotL = dot(vNormal, directionalLights[0].direction);
    //float lightIntensity = smoothstep(0.0, 0.01, NdotL * shadow);
    float lightIntensity = smoothstep(0.0, 0.01, NdotL * 1.);
    vec3 light = directionalLights[0].color * lightIntensity;

    // specular light
    vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
    float NdotH = dot(vNormal, halfVector);

    float specularIntensity = pow(NdotH * lightIntensity, uGlossiness * uGlossiness);
    float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

    vec3 specular = specularIntensitySmooth * directionalLights[0].color;

    // rim lighting
    float rimDot = 1.0 - dot(vViewDir, vNormal);
    float rimAmount = 0.6;

    float rimThreshold = 0.2;
    float rimIntensity = rimDot * pow(NdotL, rimThreshold);
    rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

    vec3 rim = rimIntensity * directionalLights[0].color;
    gl_FragColor = vec4(uColor * (ambientLightColor + light + specular + rim), 1.0);
    
    float shadow1 = smoothstep(.0, .4, shadow) * smoothstep(.09, .11, NdotL);
    float shadow2 = smoothstep(.0, .4, shadow) * smoothstep(.09, .11, NdotL);
    
    vec2 uv = gl_FragCoord.xy;
    float ff2x = fff(uv*vec2(1., 1.)*.4, 10.);
    float ff2y = fff(uv*vec2(1., 1.)*.4, 20.);
    float ff = fff(uv*vec2(1., 1.)*.6 + vec2(ff2x, ff2y)*44.1, 0.);
    ff = smoothstep(.2, 1., ff)*.4+.3;
    shadow1 = 1.-(1.-shadow1) * (1.-(1.-shadow1)*ff);
    shadow2 = 1.-(1.-shadow2) * (1.-(1.-shadow2)*ff);

    shadow = shadow1 * shadow2;

    vec3 shadowPattern = vec3(
        .5+.5*sin(1.6*gl_FragCoord.y + 1.6*gl_FragCoord.x),
        .5+.5*sin(1.6*gl_FragCoord.y + 1.6*gl_FragCoord.x*1.),
        .5+.5*sin(1.6*gl_FragCoord.y + 1.6*gl_FragCoord.x*1.)
    );
     shadowPattern = vec3(
        .5+.5*sin(1.4*gl_FragCoord.y),
        .5+.5*sin(1.4*gl_FragCoord.y*1.),
        .5+.5*sin(1.4*gl_FragCoord.y*1.)
    );
    
    vec3 shadowPattern2 = vec3(
        .5+.5*sin(1.4*gl_FragCoord.x),
        .5+.5*sin(1.4*gl_FragCoord.x*1.),
        .5+.5*sin(1.4*gl_FragCoord.x*1.)
    );

    uv = uv / resolution.xy;
    vec2 tmp = uv;
    float ang = atan(uColor.x, uColor.y);
    tmp.x = uv.x*cos(ang) - uv.y*sin(ang);
    tmp.y = uv.x*sin(ang) + uv.y*cos(ang);
    uv = tmp;
    float ff3 = fff(vUV.xy*vec2(1333., 1.)*5.+1.314*14., 1.314);
    ff3 = ff3;
    // ff3 = smoothstep(.0, .99, ff3);
    // float ff4 = fff(uv*vec2(1., 1343.)*3.+1.314*14., 45.31);
    // ff4 = ff4 + .2;
    // ff4 = smoothstep(.0, .99, ff4);
    // float ff5 = 0.;
    // ff5 =  smoothstep(.8, .99, 1. - (1.-ff3)*(1.-ff4));

    // shadow = shadow*.88 + (1.-.88)*ff5;
    // shadow = shadow;

    // shadowPattern.x = smoothstep(.9, 1., shadowPattern.x);
    // shadowPattern.x = pow(shadowPattern.x, 3.);


    //shadow = shadow + (1.-shadow)*smoothstep(.0, 1., ff);
    //vec3 col = shadow * vColor.rgb + (1.-shadow)*(vec3(vColor.b, vColor.g, vColor.r));
    //vec3 col = shadow * uColor + (1.-shadow)*(vec3(0.0));

    float ddd = abs(dot(vViewDir, vNormal));
    float ff8 = .5 + .5*sin(120.*vUV.x + 15.*ddd + uTime*0.);

    float ff9 = fff(vUV.xy*vec2(111., 1.)*1.+1.314*14., 1.314);
    float ff10 = .5+.5*sin(1666.*vUV.y);
    float oo = pow(ddd, 1.5);
    //oo = power(oo, 4.);
    vec3 col = vColor.rgb;
    // gl_FragColor = vec4(col * (ambientLightColor + light + specular + rim), 1.0);
    // gl_FragColor = vec4(vec3(ff), 1.0);

    oo = 1. - oo;

    float oofx1 = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+1.314*14.+seed*13.11, 1.314+seed*3.12));
    float oofy1 = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+2.314*14.+seed*13.11, 4.314+seed*3.12));
    float oofx2 = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+5.314*14.+seed*13.11, 3.446+seed*3.12));
    float oofy2 = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+6.314*14.+seed*13.11, 6.665+seed*3.12));
    float oofx = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+2.314*14.+seed*13.11 + 13.*vec2(oofx1, oofy1), 4.314+seed*3.12));
    float oofy = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+4.314*14.+seed*13.11 + 13.*vec2(oofx2, oofy2), 2.314+seed*3.12));
    float oof = -1.+2.*smoothstep(0., 1., fff(vUV.xy*vec2(1., 1.)*2.5+4.314*14.+seed*13.11 + .021*vec2(oofx, oofy*20.), 6.314+seed*3.12));
    oof = .1+(-.1+1.)*(oof/2.+.5);
    // oof *= (.5+.5*oo);
    
     float oof2 = -1.+2.*smoothstep(0., .99, fff(vUV.xy*vec2(1., 3.)*34.5+4.314*14. + .2*vec2(oofx, oofy), 6.314));
     oof2 = .1+(-.1+1.)*(oof2/2.+.5);

    vec3 tempcol = rgb2hsv(col);
    tempcol.x = mod(tempcol.x+oo*0.4, 1.);
    //col = hsv2rgb(tempcol);
    //vec3 irid = colors(oo);
    vec3 irid = colors(mod(vUV.x*1.,1.));
    //vec3 irid = colors(smoothstep(0.0, 1.0, fff(vUV.xy, 1.)));
    //vec3 irid = colors(smoothstep(0.0, .99, 1.*fff(vUV.xy*111.+oof*.1+seed*12., 1.+seed)));

    float kk = smoothstep(0.4, .6, 1.*fff(vUV.xy*111.+oof*.1+seed*12., 1.+seed));
    //irid = oo*kk/sqrt(3.) + (1.-kk)*irid;
    
    float u_time = 0.0;
    float x = vUV.x/1.;
    float y = vUV.y/1./4.;
	float fqq = smoothstep(0.0, 1.0, XXX);

    //vec3 mixed = mix(irid, col, oo*oof+(1.-oo)*1.);

    vec3 grey = vec3(oo);

    //vec3 mixed = mix(irid, col, oo*oof+(1.-oo)*1.);
    vec3 mixed = mix(colors(mod(vUV.x*1.,1.)), colors(mod(vUV.x*.5+.1,1.)), oof);

    //mixed += pow(oo,4.)*fqq;

    // float qx = vUV.x*323.;
	// qx = mod(qx, 1.);
    // qx = smoothstep(.47, .53, qx);
	
	// float qy = floor(pos.x/(num-.013));
	// if(mod(qy, 2.) < .001)
	// 	qy = 1.;	
	// else
	// 	qy = 0.;
	

    // gl_FragColor = vec4(vec3(ff9), 1.0);
    // gl_FragColor = vec4(modelPos.rgb, 1.0);
    // gl_FragColor = vec4(vec3(oo), 1.0);
    // gl_FragColor = vec4(vec3(oo), 1.0);
    // gl_FragColor = vec4(col.rgb, 1.0);
    // gl_FragColor = vec4(vec3(oo), 1.0);
    // gl_FragColor = vec4(vec3(oof2), 1.0);
    // gl_FragColor = vec4(mixed.rgb, power(abs(dot(vNormal, vec3(1.,0.,0.))), 3.));
    // gl_FragColor = vec4(vec3(fqq), 1.0);
    // gl_FragColor = vec4(irid, 1.0);
    
    if(algo > 0.5){
        gl_FragColor = vec4(vec3(vUV.rg, 1.), 1.);
    }
    else{
        gl_FragColor = vec4(mixed.rgb, 1.0);
    }
    //gl_FragColor = vec4(mixed.rgb, 1.-.5*vUV.x);
    gl_FragColor = vec4(mixed.rgb, 1.);

    if(algo > .5){
        gl_FragColor = vec4(vec3(1.-vUV.x), 1.0);
        //gl_FragColor = vec4(vec3(0.), 1.0);
    }

}