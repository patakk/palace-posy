#include <common>

// uniform sampler2D tDiffuse;
// uniform sampler2D tDiffuse2;
// uniform sampler2D tDiffuse3;
uniform sampler2D tDiffuse4;
uniform vec2 resolution;
uniform float ztime;
uniform float flip;
uniform float seed1;
uniform float seed2;
uniform float seed3;

varying vec2 vUv;

//uniform float sigma;     // The sigma value for the gaussian function: higher value means more blur
                        // A good value for 9x9 is around 3 to 5
                        // A good value for 7x7 is around 2.5 to 4
                        // A good value for 5x5 is around 2 to 3.5
                        // ... play around with this based on what you need :)

//uniform float blurSize;  // This should usually be equal to
                        // 1.0f / texture_pixel_width for a horizontal blur, and
                        // 1.0f / texture_pixel_height for a vertical blur.

const float pi = 3.14159265f;

const float numBlurPixelsPerSide = 4.0f;



float randomNoise(vec2 p) {
    return fract(16791.414*sin(7.*p.x+p.y*73.41));
}

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

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
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

float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {

    vec2 xy = gl_FragCoord.xy;
    vec2 uv = xy / resolution;

    uv = vUv.xy;

    if(flip < 2.){
        //uv = vec2(uv.x, uv.y);
        //uv = vec2(uv.y, uv.x);
    }
    else if(flip < 1.1){
        //uv = vec2(uv.x, 1.-uv.y);
    }
    else if(flip < 2.1){
        //uv = vec2(1.-uv.x, 1.-uv.y);
    }
    else if(flip < 3.1){
        //uv = vec2(1.-uv.x, uv.y);
    }
    //uv = vec2(1.-uv.x, 1.-uv.y);
    
    float qq = pow(2.*abs(uv.x-.5), 2.)*.84;

    qq = pow(length((uv - .5)*vec2(.72,1.))/length(vec2(.5)), 2.) * .94;

    vec2 dir = uv - .5;
    dir = vec2(dir.y, -dir.x);
    dir = dir / length(dir);
    dir = vec2(1., 0.);


    float ffxx = -1. + 2.*smoothstep(0., 1., fff(uv*.1*vec2(1., 1.)*.3+seed1*3., seed1+3.413));
    float ffyy = -1. + 2.*smoothstep(0., 1., fff(uv*.1*vec2(1., 1.)*.3+seed1*2.+31.31, seed1+1.413));
    float ffa1 = -1. + 2.*smoothstep(0., 1., fff(uv*.1*vec2(1., 1.)*.3+seed1*14.+vec2(ffxx, ffyy), seed1+123.41));
    float ffa2 = -1. + 2.*smoothstep(0., 1., fff(uv*.1*vec2(1., 1.)*.3+seed1*24.+vec2(ffxx, ffyy), seed1+44.13));
    float ffb1 = -1. + 2.*pow(smoothstep(0., 1., fff(uv*.1*vec2(1., 1.00)*12.14+seed1*14.+vec2(ffa1, ffa2), seed1+11.13)), 1.);
    float ffb2 = -1. + 2.*pow(smoothstep(0., 1., fff(uv*.1*vec2(1., 1.00)*12.14+seed1*1.42+vec2(ffa1, ffa2), seed1+33.43)), 1.);
    float ffc  = -1. + 2.*pow(smoothstep(0., 1., fff(uv*.1*vec2(1., 1.00)*1.77+seed1*2.67+vec2(ffa1, ffa2), seed1+73.77)), 3.);
    float ffc1  = -1. + 2.*pow(smoothstep(0., 1., fff(uv*.1*vec2(1., 1.00)*7.43+seed1*3.6877+vec2(ffb1, ffb2), seed1+2.53)), 3.);
    float ffc2  = -1. + 2.*pow(smoothstep(0., 1., fff(uv*.1*vec2(1., 1.00)*1.21+seed1*2.67+vec2(ffb1, ffb2), seed1+7.56)), 3.);
    float ffd  = pow(smoothstep(0., 1., fff(uv*vec2(1., 1.00)*1.21+seed1*2.67+vec2(ffc1, ffc2), seed1+7.56)), 3.);

    float ff = fff(uv*vec2(1., 1.)*5.+seed1*14., seed1);
    float ff2 = fff(uv*vec2(1., 1.)*5.+seed1*14., seed1);
    ff = ff;
    // ff = smoothstep(.1, .99, ff);
    ff2 = smoothstep(.2, .79, ff);
    //ff = (1.-(1.-(.5+.44*sin(2.*resolution.x*uv.x)))*(1.-(.5+.44*sin(2.*resolution.y*uv.y)))) - .5;
    //vec4 texelB2 = blur(uv+vec2(2., 0.)/resolution, ff*5.3*1./resolution.x, dir);

    //float sh1 = power((texelB.r+texelB.g+texelB.b)/3., 5.);
    //float sh2 = power((texelB2.r+texelB2.g+texelB2.b)/3., 5.);
    //float sh = (clamp(sh2-sh1, -1.0, 1.)*3.);
    //vec4 texelB = texture2D(tDiffuse, uv);

    //float lum = texelB.r * 0.3 + texelB.g * 0.59 + texelB.b * 0.11;
    //lum = pow(lum, 0.15);
    //vec4 texelGray = vec4(vec3( lum ), 1.0);
    //texelGray = texelGray*0.5 + texelB*0.5;

    //vec4 texel = texture2D( tDiffuse, (uv+vec2(+0.0, +0.0)) / resolution );
    // vec2 uvm = uv + 23.*vec2(ff2, ff2)/resolution.x;


    // float popo = 0.;
    // for(int k = 0; k < 220; k++){
    //     float aa = -2. + 4.*randomNoise(vec2(float(k)*.041, float(k)*.041));
    //     float bb = -2. + 4.*randomNoise(vec2(float(k)*.041+3141.1, float(k)*.041+3141.1));
    //     float th = .001;
    //     th = .001+.000*randomNoise(vec2(float(k)+31.1, float(k)+31.1));
    //     popo = 1. - smoothstep(.0, th, abs((aa*uv.x-bb*uv.y)-.5));
    //     uvm = uvm + vec2((popo)*.2*(0.01 + .0*randomNoise(vec2(float(k)+22.1, float(k)+22.1))), 0.);
    // }


    // float qx = floor(uv.x*2.)/2.;
    // float qy = floor(uv.y*2.)/2.;
    // float rr = hash13(vec3(qx+1.*seed1,qy+2.6*seed1, seed1+1.341));
    // float gg = hash13(vec3(qx+5.2*seed1,qy+3.5*seed1, seed1+2.341));
    // float bb = hash13(vec3(qx+6.3*seed1,qy+4.4*seed1, seed1+3.341));

    // vec2 quv = vec2(qx, qy);
    // vec2 uvm = (uv-quv)*vec2(2.,2.);

    // uvm.x = power(uvm.x, 1.);
    // uvm.y = power(uvm.y, 1.);

    // float wa = length(uvm-.5)/length(vec2(.5));
    // wa = pow(wa, 2.);

    // uvm = quv + uvm/vec2(2.,2.);

    // vec4 texel = texture2D( tDiffuse, uvm);
    // vec4 texelDepth = texture2D( tDiffuse2, uvm);
    // vec4 texelBlurDepth = texture2D( tDiffuse3, uvm);
    // vec4 texelBlurr = texture2D( tDiffuse4, uvm + 2./resolution.x);
    // vec4 texelBlurg = texture2D( tDiffuse4, uvm + 0./resolution.x);
    // vec4 texelBlurb = texture2D( tDiffuse4, uvm - 2./resolution.x);
    // vec4 texelBlurD = texture2D( tDiffuse4, uvm);
    // float qew = 1.+(5. + 4.*randomNoise(uv*10.))*pow(fract(texelBlurD.r*1.), 2.);
    //uvm = uv + .01*(-.5+vec2(rr+gg,0.));


    float ff3 = fff(uv*vec2(resolution.y, 1.)*3.+seed1*14., seed1);
    ff3 = ff3;
    ff3 = smoothstep(.0, .99, ff3);
    
    float ff4 = fff(uv*vec2(1., resolution.x)*3.+seed1*14., seed1);
    ff4 = ff4;
    ff4 = smoothstep(.0, .99, ff4);
    float ff5 = 0.;

    ff5 = 1. - (1.-ff3)*(1.-ff4);
    ff5 = smoothstep(.0, .999, ff5);

    vec2 uvm = uv + .0011*vec2(ff3, 0.)*ff4; // + .00051*vec2(hash13(vec3(uv*resolution.x, seed1)), hash13(vec3(uv*resolution.x, seed1+1.234)));

    vec4 texelBlur = texture2D( tDiffuse4, uvm);
    // texelBlur = vec4(texelBlurr.r, texelBlurg.g, texelBlurb.b, 1.);
    
    //float depth = texelDepth.r;
    // *texture2D( tDiffuse, uvm+vec2(1.0, 0.0)/resolution.xy)
    // *texture2D( tDiffuse, uvm-vec2(1.0, 0.0)/resolution.xy)
    // *texture2D( tDiffuse, uvm+vec2(0.0, 1.0)/resolution.xy)
    // *texture2D( tDiffuse, uvm-vec2(0.0, 1.0)/resolution.xy);
    //if(texel.r == 0.0 && texel.g == 0.0 && texel.b == 1.0){
        // texel.r = .5 + .5*sin(uv.x*721.31);
        // texel.g = .5 + .5*sin(uv.y*511.31+231.31);
        // texel.b = .5 + .5*sin(uv.x*431.31+334.55);
    //}
    //vec4 texelB = blur(uv, ff*1.5*1./resolution.x, dir);
    //vec4 texelB = blur(tDiffuse, uv, depth*4.42*1./resolution.x + 0./resolution.x*randomNoise(uv+ztime/1000000.+.3143+ztime*.0000+fbm(uv)*.02), dir);

    //vec4 res = texelB*(1.-qq) + texelGray*qq + .0*(-.5+rand(xy*.1));
    //texelB.r = pow(texelB.r, seed1);
    //texelB.g = pow(texelB.g, seed2);
    //texelB.b = pow(texelB.b, seed3);
    //float pp = (texelB.x+texelB.y+texelB.z)/3.;
    //texelB.x = texel.x + .2*(pp-texel.x);
    //texelB.y = texel.y + .2*(pp-texel.y);
    //texelB.z = texel.z + .2*(pp-texel.z);
    ff2 = 1.-pow(ff2, 3.);
    ff2 = .5+.5*ff2;
    //vec4 res = texel*.0 + texelBlur*(1.-.0) + .0*(-.5+rand(xy*.1+mod(ztime*.031, 2.0)));

    vec4 res = texelBlur;

    ////// MARGIN
    float rat = resolution.x/resolution.y;
    float margx = 7./1000. + 0./1800.*(-.5 + smoothstep(0., 1., fff(uv*182.1 + 281.3131,seed1+25.61 )));
    float margy = 7./1000. + 0./1800.*(-.5 + smoothstep(0., 1., fff(uv*221.1 + 114.5255,seed1+35.12 )));
    if(rat > 1.){
        margy *= rat;
    }
    else if(rat < 1.){
        margx /= rat;
    }
    float margin = 1.0;
    float dd = 1. / 1800.;
    float smmth = 0.00;
    margin *= smmth + (1.-smmth)*smoothstep(margx-dd, margx+dd, uv.x);
    margin *= smmth + (1.-smmth)*smoothstep(margy-dd, margy+dd, uv.y);
    margin *= smmth + (1.-smmth)*smoothstep((1.-margx)+dd, (1.-margx)-dd, uv.x);
    margin *= smmth + (1.-smmth)*smoothstep((1.-margy)+dd, (1.-margy)-dd, uv.y);
    res *= margin;
    //////
    
    ////// NOISE
    float salt1 = randomNoise(uv+ztime/1000000.+.3143+ztime*.0000+fbm(uv)*.02);
    salt1 = (smoothstep(.1, .999, salt1));
    salt1 = salt1*salt1*salt1*salt1*salt1*salt1*salt1;
    float salt2 = randomNoise(uv+ztime/1000000.+.2143+ztime*.0000+fbm(uv)*.02);
    salt2 = (smoothstep(.079, .999, salt2));
    
    float saltq = pow(noise(vec2(uv*resolution/1.)), 1.8);
    float saltw = noise(vec2(uv*resolution/1.));
    float salt22 = pow(1.-(1.-saltq*.35)*(1.-saltw*.8), 3.);
    
    float ffx = -1.+2.*fff(uv*vec2(1., 1.)*15.+seed1, 314.51+seed1);
    float ffy = -1.+2.*fff(uv*vec2(1., 1.)*15.+seed1, 22.44+seed1);
    float salt5 = fff(uv*vec2(1., 1.)*3.+seed1*2.+3.9*vec2(ffx, ffy)+ztime, seed1);
     salt5 = pow(smoothstep(.96, .999, fract(salt5*1.3)), 5.);
    salt5 = salt5;
    //res = .06 + res*(.94 - .06);
    res.rgb += 1.*(.1*salt22 + 0.036*salt5);
    //res.rgb = 1. - (1.-res.rgb)*(1.-.06*salt5);
    //////

    float salt3 = 1.8*randomNoise(uv+ztime/1000000.+.2143+ztime*.0000+fbm(uv)*.02);
    //salt3 = (smoothstep(.05,.22, salt3));
    //res.rgb = res.rgb * ((1.-.04)+.04*salt3);

    // vec4 resc = res;
    // if((res.r+res.g+res.b)/3. < -.5){
    //     ff5 = .025*(-.5+smoothstep(.1, .9, ff3*ff4));
    //     resc = resc + ff5;
    // }
    // else{
    //     ff5 = .954 + .046*(-.5+smoothstep(.1, .9, ff3*ff4));
    //     resc = resc * ff5;
    // }

    //ff5 = smoothstep(.0, 1., 1. - (1.-ff3)*(1.-ff4));
    //res = .6*res + (1.-.6)*ff5;
    res = 1. - (1. - res)*(1. - .0031*ff5);



    //res.rgb = res.rgb + .01*(-1.+vec3(rr,gg,bb));

    gl_FragColor = vec4(vec3(salt22), 1.);
    gl_FragColor = vec4(res.rgb, 1.);

    //resc.a = 1.0;
    //res = .4*res + .6*resc;
    //res.a = 1.0;

    // vec2 uvv = uv * 20.;
    // float ffa = fbm(uvv);
    // float ffb = fbm(uvv);
    // for(int k = 0; k < 16; k++){
    //     ffa = fbm(uvv + -1. + vec2(ffa, ffa+.4));
    //     ffb = fbm(uvv + -1. + vec2(ffb+4., ffb+1.4));
    // }
    // float fff = fbm(uvv + vec2(ffa, ffb));

    // float bua = 1.*(1.-abs(texelBlurDepth.r-.5)/.5);
    // vec4 resr = res;
    // resr.r += bua*.2;

    // vec4 mixdepth = bua*resr + (1.-bua)*res;


}