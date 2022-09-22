import * as THREE from 'three';

// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// node index.js --url localhost:8080 --mode CANVAS --trigger FN_TRIGGER --selector "canvas#cnvs"

console.log(fxhash)

const hobbylib = require("./hobby");
let makeknots = hobbylib.makeknots;
let gethobbypoints = hobbylib.gethobbypoints;

let myVec = require("./myvec");
let pixelRatio = 4;
pixelRatio = window.devicePixelRatio;
let iterationCount = 0;

let thevariant; // = Math.floor(fxrand()*3.);

if(fxrand() < .7){
    if(fxrand() < .5){
        thevariant = 0;
    }
    else{
        thevariant = 2;

    }
}
else{
    thevariant = 1;
}

// console.log("variant", thevariant)


const PostProcShader = {
    uniforms: {
        // 'tDiffuse': {
        //     value: null
        // },
        // 'tDiffuse2': {
        //     value: null
        // },
        // 'tDiffuse3': {
        //     value: null
        // },
        'tDiffuse4': {
            value: null
        },
        'resolution': {
            value: [500, 500]
        },
        'ztime': {
            value: fxrand()
        },
        'flip': {
            value: map(fxrand(), 0, 1, 0, 4)
        },
        'seed1': {
            value: map(fxrand(), 0, 1, .9, 1.1)
        },
        'seed2': {
            value: map(fxrand(), 0, 1, .5, 1.5)
        },
        'seed3': {
            value: map(fxrand(), 0, 1, .5, 1.5)
        },
        'color': {
            value: [1,0,0]
        }
    },
    vertexShader: null,
    fragmentShader: null
};

const BlurShader = {
    uniforms: {
        'tDiffuse': {
            value: null
        },
        'dmap': {
            value: null
        },
        'amp': {
            value: 1.
        },
        'variant': {
            value: 2
        },
        'seed': {
            value: fxrand()
        },
        'resolution': {
            value: [500, 500]
        },
        'colorshift': {
            value: [1, 1, 1]
        },
        'uDir': {
            value: [1, 0]
        },
    },
    vertexShader: null,
    fragmentShader: null
};

function shuffle(array) {
    let currentIndex = array.length
    var randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(fxrand() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [
            array[currentIndex], array[randomIndex]
        ] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

let camera,
    scene,
    renderer,
    renderer2,
    rawTarget,
    depthTarget,
    blurTarget,
    blurTargetH,
    blurTargetV,
    composer;
var bvShader,
    bfShader;
var svShader,
    sfShader;
var loaded = false;
var orbitcontrols;

var points;
var ress = 1000;
var baseWidth = 1000;
var baseHeight = 1000;
var canvasWidth = 1;
var canvasHeight = 1;
var winScale = 1.;
var pg;
var canvas;
var paletteCanvas;

var isdown = false;

var coshu = 1;

var seed = fxrand() * 10000;

var wind = 0.0;
var scrollscale = 1.3;
var globalIndex = 0;
var frameCount = 0;
var particlePositions = [];
var particleColors = [];
var particleSizes = [];
var particleAngles = [];
var particleIndices = [];

var horizon = map(fxrand(), 0, 1, 0.7, 0.93);

var treeGroundSpread;

var sunPos;
var sunColor;
var sunSpread;
var isDark;
var hasSun;

var colorful = fxrand() < .6;
var verycolorful = fxrand() < .25;

// function getColorString(colorful, verycolorful) {
//     if (verycolorful) {
//         return 'total color';
//     } else {
//         if (colorful) {
//             return 'harmonic'
//         } else {
//             return 'solid'
//         }
//     }
// }

// window.$fxhashFeatures = {
//     "variant": getColorString(colorful, verycolorful)
// }

var backgroundColor;

function isMobile() {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) 
            check = true;
        }
    )(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function power(p, g) {
    if (p < 0.5) 
        return 0.5 * Math.pow(2 * p, g);
    else 
        return 1 - 0.5 * Math.pow(2 * (1 - p), g);
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

var mouse = {
    'x': 0,
    'y': 0
};

var mouseprev = {
    'x': 0,
    'y': 0
};

function lerp(v1, v2, p) {
    return v1 + p * (v2 - v1);
}

function getHorizon(x) {
    var dispr = .5 * baseHeight * (-.5 * power(noise(x * 0.003 + 3133.41), 3))
    return baseHeight * horizon + (1. - horizon * .8) * .6 * baseHeight * (
        -.5 * power(noise(x * 0.003), 2)
    ) + .0 * dispr * fxrand();
}

function map(x, v1, v2, v3, v4) {
    return (x - v1) / (v2 - v1) * (v4 - v3) + v3;
}

function max(x, y) {
    if (x >= y) 
        return x;
    return y;
}

function min(x, y) {
    if (x <= y) 
        return x;
    return y;
}

function constrain(x, a, b) {
    return max(a, min(x, b));
}

var loader = new THREE.FileLoader();
loader.load('assets/shaders/post.vert', function (data) {
    PostProcShader.vertexShader = data;

    loader.load('assets/shaders/post.frag', function (data) {
        PostProcShader.fragmentShader = data;
        
        loader.load('assets/shaders/blur.vert', function (data) {

            BlurShader.vertexShader = data;
            
            loader.load('assets/shaders/blur.frag', function (data) {
                let sinlkp = getShaderSine();
                // data = data.replace('SSS', sinlkp);
                BlurShader.fragmentShader = data;
                reset();
            });
        });
    });
});

var palettes0 = [
    'f4c7a4-e8e1ef-d9fff8-c7ffda-c4f4c7-9bb291',
    'f46036-5b85aa-414770-372248',
    '084c61-db504a-e3b505-4f6d7a-56a3a6',
    '177e89-084c61-db3a34-ffc857-323031',
    '32373b-4a5859-f4d6cc-f4b860-c83e4d',
    'c0caad-9da9a0-654c4f-b26e63-cec075',
    'ac80a0-89aae6-3685b5-0471a6-061826',
    'fbf5f3-e28413-de3c4b-c42847',
    'dceed1-aac0aa-736372-a18276-7a918d',
    '12355b-420039-d72638-ff570a',
    '555b6e-89b0ae-bee3db-faf9f9-ffd6ba',
    'de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
    'f55d3e-878e88-f7cb15-76bed0',
    'fe5f55-f0b67f-d6d1b1-c7efcf-eef5db',
    'bfb48f-564e58-904e55-f2efe9-252627',
    'ba1200-031927-9dd1f1-508aa8-c8e0f4',
    'ffbc42-df1129-bf2d16-218380-73d2de',
    '1f363d-40798c-70a9a1-9ec1a3-cfe0c3',
    'fa8334-fffd77-ffe882-388697-54405f',
    'ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
    '3e5641-a24936-d36135-282b28-83bca9',
    '664c43-873d48-dc758f-e3d3e4-00ffcd',
    '013a63-01497c-014f86-2a6f97-2c7da0-468faf-61a5c2-fa1603',
    '304d7d-db995a-bbbbbb-222222-fdc300',
    '8789c0-45f0df-c2cae8-8380b6-111d4a',
    '006466-065a60-fb525b-144552-1b3a4b-212f45-272640-fb525b-312244-3e1f47-4d194d',
    '003844-006c67-f194b4-ffb100-ffebc6',
    '4d5057-4e6e5d-4da167-3bc14a-cfcfcf',
    '007f5f-2b9348-55a630-80b918-aacc00-bfd200-d4d700-dddf00-eeef20-cf3311',
    '5fad56-f2c14e-f78154-4d9078-b4431c'
]

var palettesy = ['007f5f-2b9348-55a630-80b918-aacc00-bfd200-d4d700-dddf00-eeef20-cf3311']

var palettesx = ['c0caad-9da9a0-654c4f-b26e63-cec075-084c61-db504a-e3b505-f4c7a4-e8e1ef-d9fff8-6' +
        '64c43-873d48-dc758f-e3d3e4-00ffcd-c7ffda-c4f4c7-9bb291-3e5641-a24936-d36135-28' +
        '2b28-83bca9-4f6d7a-56a3a6-32373b-4a5859-f4d6cc-f4b860-c83e4d-ba1200-031927-9dd' +
        '1f1-508aa8-c8e0f4-b84527-d2a467-e2af51-714c04-1f3c36-88beb6-4e2649-39160e-9527' +
        '09-975341-ffbc42-df1129-bf2d16-218380-73d2de']

// if(verycolorful)     palettes0 = palettesx;

let palettesstrings = [
     'f3db53-f19ba6-a08a7f-d50a15-3c71ec-f3dd56-d40b16-3c6cf0-f19ba6-a08a7f', 
     'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a97c73-af3e4d',
     '121212-F05454-30475E-F5F5F5-F39189-BB8082-6E7582-046582',
     '084c61-db504a-e3b505-4f6d7a-56a3a6-177e89-084c61-db3a34-ffc857-323031',
     '32373b-4a5859-f4d6cc-f4b860-c83e4d-de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
     'fa8334-fffd77-ffe882-388697-54405f-ffbc42-df1129-bf2d16-218380-73d2de',
     '3e5641-a24936-d36135-282b28-83bca9-ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
     '304d7d-db995a-bbbbbb-222222-fdc300-664c43-873d48-dc758f-e3d3e4-00ffcd',
     '5fad56-f2c14e-f78154-4d9078-b4431c-8789c0-45f0df-c2cae8-8380b6-111d4a',
     '4C3A51-774360-B25068-FACB79-dddddd-2FC4B2-12947F-E71414-F17808-Ff4828',
     '087e8b-ff5a5f-3c3c3c-f5f5f5-c1839f-1B2430-51557E-816797-D6D5A8-ff2222',
     '4C3F61-B958A5-9145B6-FF5677-65799B-C98B70-EB5353-394359-F9D923-36AE7C-368E7C-187498',
     '99e2b4-99d4e2-f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1',
     '080708-3772ff-df2935-fdca40-e6e8e6-d8dbe2-a9bcd0-58a4b0-373f51-1b1b1e',
     '001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226',
     '5f0f40-9a031e-fb8b24-e36414-0f4c5c',
     '264653-2a9d8f-e9c46a-f4a261-e76f51',
     'd8f3dc-b7e4c7-95d5b2-74c69d-52b788-40916c-2d6a4f-1b4332-081c15',
     '03071e-370617-6a040f-9d0208-d00000-dc2f02-e85d04-f48c06-faa307-ffba08',
     '1a1423-372549-774c60-b75d69-eacdc2',
    //  '383b36-26408f-00b0fa-297d45-bf1f2e',
     'f75c03-820263-291720-f75c03-820263-291720-f75c03-820263-291720-04a777',
     '1655c9-f505a5-e3980e-e6b967-93a8cf-d6cdc7-6f8695-1c448e',
     '0a0a0a-1f1f1f-220001-47030a-6b020a-7e030e-89010c-00858f-f7f4f3-dad6d6',
     '054a91-3e7cb1-81a4cd-dbe4ee-f17300',
     '000000-2f4550-586f7c-b8dbd9-f4f4f9',
     '8b85c1-59a96a-ef3054-5c5552-42cafd',
     '090427-cfcdd6-c91b18-788a91-373f43',
     'dc3000-83250b-45070a-59565d-fa6302',
    //  '283d3b-197278-edddd4-c44536-772e25-0d3b66-faf0ca-f4d35e-ee964b-f95738',
     'fe5d26-f2c078-faedca-c1dbb3-7ebc89-3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
     'c0caad-9da9a0-654c4f-b26e63-cec075-084c61-db504a-e3b505-f4c7a4-e8e1ef-d9fff8-6' +
        '64c43-873d48-dc758f-e3d3e4-00ffcd-c7ffda-c4f4c7-9bb291-3e5641-a24936-d36135-28' +
        '2b28-83bca9-4f6d7a-56a3a6-32373b-4a5859-f4d6cc-f4b860-c83e4d-ba1200-031927-9dd' +
        '1f1-508aa8-c8e0f4-b84527-d2a467-e2af51-714c04-1f3c36-88beb6-4e2649-39160e-9527' +
        '09-975341-ffbc42-df1129-bf2d16-218380-73d2de'
];

palettesstrings = [
    'f3db53-f19ba6-a08a7f-d50a15-3c71ec-f3dd56-d40b16-3c6cf0-f19ba6-a08a7f', 
     'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a97c73-af3e4d',
     '121212-F05454-30475E-F5F5F5-F39189-BB8082-6E7582-046582',
     '084c61-db504a-e3b505-4f6d7a-56a3a6-177e89-084c61-db3a34-ffc857-323031',
     '32373b-4a5859-f4d6cc-f4b860-c83e4d-de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
     'fa8334-fffd77-ffe882-388697-54405f-ffbc42-df1129-bf2d16-218380-73d2de',
     '3e5641-a24936-d36135-282b28-83bca9-ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
     'dc3000-83250b-45070a-59565d-fa6302',
     '33658a-86bbd8-758e4f-f6ae2d-f26419',
      'fe5d26-f2c078-faedca-c1dbb3-7ebc89-3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
      'f3db53-f19ba6-a08a7f-d50a15-3c71ec-f3dd56-d40b16-3c6cf0-f19ba6-a08a7f', 
      'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a97c73-af3e4d',
     '084c61-db504a-e3b505-4f6d7a-56a3a6-177e89-084c61-db3a34-ffc857-323031',
];

let blurCamera;
let blurScene;
let blurGeometry;
let blurMaterial;
let blurMesh;
let postprocCamera;
let postprocScene;
let postprocGeometry;
let postprocMaterial;
let postprocMesh;

//   palettesstrings = [
//     '264653-2a9d8f-e9c46a-f4a261-e76f51-f3db53-f19ba6-a08a7f-d50a15-3c71ec-f3dd56-d40b16-3c6cf0-f19ba6-a08a7f-111111-222222-333333-444444-555555-666666-777777-888888-999999-aaaaaa-bbbbbb', 'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a' +
//     '97c73-af3e4d-054a91-3e7cb1-81a4cd-dbe4ee-f17300-8b85c1-59a96a-ef3054-5c5552-42cafd-4C3A51-774360-B25068-FACB79-dddddd-2FC4B2-12947F-E71414-F17808-Ff4828-283d3b-197278-edddd4-c44536-772e25-0d3b66-faf0ca-f4d35e-ee964b-f95738',
//  ];

palettes0 = palettesstrings;

var palettes = [];
palettes0.forEach(element => {
    palettes.push(element);
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16) / 255.,
            parseInt(result[2], 16) / 255.,
            parseInt(result[3], 16) / 255.
        ]
        : null;
}

for (var k = 0; k < palettes.length; k++) {
    let text = palettes[k];
    let cols = text.split('-')
    let caca = [];
    cols.forEach((e) => {
        caca.push(hexToRgb(e))
    });
    shuffle(caca)
    var coco = [];
    caca.forEach((e, i) => {
        coco.push([
            (caca[i][0] + .1* map(fxrand(), 0, 1, -.2, .2)),
            (caca[i][1] + .1* map(fxrand(), 0, 1, -.2, .2)),
            (caca[i][2] + .1* map(fxrand(), 0, 1, -.2, .2))
        ])
    });
    palettes[k] = coco;
}

function getShaderPalette(){
    let s = '';

    //let palette = palettes[Math.floor(fxrand()*palettes.length)]
    let palette = palettes[Math.floor(fxrand()*palettes.length)]
    for(let k = 0; k < palette.length; k++){
        s = s + `gWeights[${k}] = vec3(${palette[k][0]}, ${palette[k][1]}, ${palette[k][2]});\n`;
        s = s + '\n';
    }
    s = s + `gWeights[${palette.length}] = vec3(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]});\n`;

    return {palette: s, len: palette.length+1};
}


function getShaderSine(){
    let s = '';

    for(let k = 0; k < 360; k++){
        let t = map(k, 0, 360, 0, 2*3.14159265);
        let sval = Math.sin(t);
        if(sval == 0)
            sval = "0.0";
        if(sval == 1)
            sval = "1.0";
        if(sval == -1)
            sval = "-1.0";
        s = s + `sinl[${k}] = ${sval};\n`;
    }
    s = s + '\n';

    return s;
}

function getRandomColor() {
    pp = fxrand();
    //let pp = Math.pow(fxrand(), 3);
    return palette[Math.floor(palette.length * pp)];
}

function getIn(k) {
    k = k % 1.;
    k = power(k, 2.);
    let pale = palette;
    let dd = pale.length - 1;
    let pa = 1. / dd;
    let idx1 = Math.floor(k / pa);
    let idx2 = (idx1 + 1) % dd;
    var pe = (k - idx1 * pa) / pa;
    var rr = map(pe, 0, 1, pale[idx1][0], pale[idx2][0]);
    var gg = map(pe, 0, 1, pale[idx1][1], pale[idx2][1]);
    var bb = map(pe, 0, 1, pale[idx1][2], pale[idx2][2]);
    return [rr, gg, bb];
}

var palette;
let omx, omy;
let verysmudged = false;

function reset() {
    iterationCount++;
    dett = fxrand() < .75;
    // if(fxrand() < .9){
    //     if(fxrand() < .5){
    //         thevariant = 0;
    //     }
    //     else{
    //         thevariant = 2;

    //     }
    // }
    // else{
    //     thevariant = 1;
    // }
    // console.log("variant", thevariant)

    dett = true;

    ttime = 0
    var thidx = Math.floor(map(fxrand(), 0, 1, 0, palettes.length));
    palette = palettes[thidx]
    shuffle(palette)
    //console.log(palettes0[thidx]);

    var ns = map(fxrand(), 0, 1, 0, 100000);
    noiseSeed(ns);
    globalIndex = 0;
    scrollscale = 1.3;
    frameCount = 0;
    seed = fxrand() * 10000;
    
    omx = 1.;
    omy = 1.;
    if(fxrand() < 1.66){
        if(fxrand() < .5){
            omx = .75;
            omy = 1.;
        }
        else{
            omx = 1.;
            omy = .75;
        }
    }
    omy = 1.;
    omx = .75;
    omx = 1;
    
    var ww = window.innerWidth || canvas.clientWidth || body.clientWidth;
    var wh = window.innerHeight || canvas.clientHeight || body.clientHeight;

    baseWidth = ress*omx - 0;
    baseHeight = ress*omy - 0;

    var mm = min(ww, wh);
    winScale = mm / baseWidth;

    canvasWidth = mm * omx - 0*133 * mm / (ress*omx);
    canvasHeight = mm * omy - 0*133 * mm / (ress*omy);

    ww = canvasWidth
    wh = canvasHeight

    let sxx = map(fxrand(), 0, 1, 0.05, 0.95);
    sunPos = [
        sxx,
        getHorizon(sxx * baseWidth) / baseHeight + map(fxrand(), 0, 1, -.0, .1)
    ];
    sunSpread = map(fxrand(), 0, 1, 1.85, 1.85);

    var hsv = [
        Math.pow(map(fxrand(), 0, 1, 0.0, 0.9), 2),
        map(fxrand(), 0, 1, 0.2, 0.56),
        map(fxrand(), 0, 1, 0.3, 0.76)
    ]
    if (hsv[0] > 0.05) {
        hsv[1] = map(fxrand(), 0, 1, 0.14, 0.315)
        //hsv[2] = map(fxrand(), 0, 1, 0.2, 0.8)
    }
    if (sunPos[1] > horizon) {
        //hsv[2] = map(fxrand(), 0, 1, 0.4, 0.7)
    }

    if (isDark) {
        hsv[2] *= .5;
    }

    backgroundColor = HSLtoRGB(hsv[0], hsv[1], hsv[2])

    // while(myDot(backgroundColor, [0,1,0]) > 0.5){    hsv = [Math.pow(fxrand()*.5,
    // 2), map(fxrand(), 0, 1, 0.2, 0.36), map(fxrand(), 0, 1, 0.5, 0.7)]
    // backgroundColor = HSVtoRGB(hsv[0], hsv[1], hsv[2]) } backgroundColor[2] =
    // Math.pow(backgroundColor[2], .6)

    sunColor = [
        map(fxrand(), 0, 1, 0.992, 1.036) % 1.0,
        map(fxrand(), 0, 1, 0.9, .96),
        map(fxrand(), 0, 1, .8, 1.0)
    ]
    if (sunColor[0] > .13 && sunColor[0] < .98) {
        //sunColor[1] *= .7; sunColor[2] *= .7;
    }
    sunColor = HSVtoRGB(sunColor[0], sunColor[1], sunColor[2]);
    sunColor = [
        255. * sunColor[0],
        255. * sunColor[1],
        255. * sunColor[2]
    ]
    if (isDark) {
        sunColor = HSLtoRGB(
            map(fxrand(), 0, 1, 0.5, .7),
            map(fxrand(), 0, 1, 0.1, .2),
            map(fxrand(), 0, 1, .4, .6)
        );
        sunColor = [
            255. * sunColor[0],
            255. * sunColor[1],
            255. * sunColor[2]
        ]
        sunPos[1] = map(fxrand(), 0, 1, -.4, -.3);
        sunSpread = map(fxrand(), 0, 1, 1.1, 1.1);
    }
    // sunColor = [255.*Math.pow(backgroundColor[0], .35),
    // 255.*Math.pow(backgroundColor[1], 2.3), 255.*Math.pow(backgroundColor[2],
    // 2.3)]
    if ((backgroundColor[0] + backgroundColor[1] + backgroundColor[2]) / 3 < .35) {
        // sunColor = HSVtoRGB(map(fxrand(), 0, 1, 0.4, .61), map(fxrand(), 0, 1, 0.2,
        // .34), map(fxrand(), 0, 1, .6, 1.0)); sunColor = [255.*sunColor[0],
        // 255.*sunColor[1], 255.*sunColor[2]]
    }

    /*if(ww/wh > 1){
        baseWidth = Math.round(ress * ww/wh)
        baseHeight = ress
    }
    else{
        baseWidth = ress
        baseHeight = Math.round(ress * wh/ww)
    }*/

    //groundclr.a[3] = 0; resizeCanvas(ww, wh, true); pg = createGraphics(ww, wh);

    particlePositions = [];
    particleColors = [];
    particleSizes = [];
    particleAngles = [];
    particleIndices = [];

    loadShadersAndData();

}

function loadShadersAndData() {

    //const material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );
    var loader = new THREE.FileLoader();
    var numFilesLeft = 2;
    function runMoreIfDone() {
        --numFilesLeft;
        if (numFilesLeft === 0) {
            loadData();
        }
    }
    // loader.load('./assets/shaders/blur.frag', function (data) {
    //     bfShader = data;
    //     runMoreIfDone();
    // });
    // loader.load('./assets/shaders/blur.vert', function (data) {
    //     bvShader = data;
    //     runMoreIfDone();
    // });
    loader.load('./assets/shaders/sphere.frag', function (data) {

        let fc = getComposition();
        data = data.replace('XXX', fc)

        let genpalette = getShaderPalette();
        data = data.replace('YYY', genpalette.palette)
        data = data.replace('ZZZ', ""+genpalette.len)
        // console.log(genpalette.palette)
        // console.log(data)

        sfShader = data;
        runMoreIfDone();
    });
    loader.load('./assets/shaders/sphere.vert', function (data) {
        svShader = data;
        runMoreIfDone();
    });
}

function isOverlapping(v1, v2) {
    let a1 = v1[0]
    let b1 = v1[1]
    let ad1 = v1[2]
    let bd1 = v1[3]
    let r1 = v1[4]
    let a2 = v2[0]
    let b2 = v2[1]
    let ad2 = v2[2]
    let bd2 = v2[3]
    let r2 = v2[4]

    let x1 = a1 + ad1 / 2 * Math.cos(r1);
    let z1 = b1 + ad1 / 2 * Math.sin(r1);
    let x2 = a1 - ad1 / 2 * Math.cos(r1);
    let z2 = b1 - ad1 / 2 * Math.sin(r1);

    let x3 = a2 + ad2 / 2 * Math.cos(r2);
    let z3 = b2 + ad2 / 2 * Math.sin(r2);
    let x4 = a2 - ad2 / 2 * Math.cos(r2);
    let z4 = b2 - ad2 / 2 * Math.sin(r2);

    let vec1 = new myVec(x1, z1, 0);
    let vec2 = new myVec(x2, z2, 0);
    let vec3 = new myVec(x3, z3, 0);
    let vec4 = new myVec(x4, z4, 0);

    if (doLinesIntersect(vec1, vec2, vec3, vec4)) {
        return true;
    }
    return false;
}

let swirls = [];

function getQuadMeshes(){
    let qs = [];
    let nn = 10;
    let chc = Math.floor(random(0, 4));
    // console.log('chc', chc);

    if(thevariant == 1){
        chc = fxrand() < .5 ? 0 : 2;
    }

    if(chc == 0){
        nn = random(4, 5);
        if(thevariant == 1){
            nn = 12;
        }
        for(let k = 0; k < nn; k++){
            let x = random(-40, 40);
            let y = random(-40, 40);
            x = map(fxrand(), 0, 1, camera.left, camera.right)
            y = map(fxrand(), 0, 1, camera.top, camera.bottom)
            let area = 20*11;
            let w = random(70, 80);
            let h = random(70, 80);
            let r = random(-20, 20)/180*3.14;

            r = random(-.0, .0);

            let q = getQuadMesh(x, y, w, h, r);

            qs.push(q);
        }
    }
    if(chc == 1){
        nn = random(12, 33);
        let ee = random(1, 3);
        
        for(let k = 0; k < nn; k++){
            let x = random(-40, 40);
            let y = map(Math.pow(fxrand(), ee), 0, 1, -180, 180);
            x = map(fxrand(), 0, 1, camera.left, camera.right)
            y = map(Math.pow(fxrand(), 3), 0, 1, camera.bottom, camera.top)
            let area = 20*200;
            let w = random(20, 200);
            let h = area/w;
            let r = random(-20, 20)/180*3.14;

            w = random(200, 300);
            h = random(5, 10);
            r = random(-.01, .01);

            let q = getQuadMesh(x, y, w, h, r);

            qs.push(q);
        }
    }
    if(chc == 2){
        nn = random(13, 14);
        for(let k = 0; k < nn; k++){
            let x = map(fxrand(), 0, 1, camera.left, camera.right)
            let y = map(fxrand(), 0, 1, camera.top, camera.bottom)
            let area = 20*200;
            let w = random(120, 240);
            let h = area/w;
            let r = random(-55, 55)/180*3.14;

            //w = random(200, 300);
            //h = random(1, 2)*10;
            r = random(-.9, .9);

            let q = getQuadMesh(x, y, w, h, r);

            qs.push(q);
        }
    }
    if(chc == 3){
        nn = random(123, 124);
        let ffq1 = random(0.007, 0.02);
        let ffq2 = random(0.002, 0.02);
        let he = fxrand() < -.5 ? random(3, 6) : random(23, 26);
        let we = random(90, 140);
        let quant = fxrand() < .5;
        for(let k = 0; k < nn; k++){
            let x = map(power(noise(k*ffq1, 31.31), 3), 0, 1, camera.left, camera.right);
            let y = map(power(noise(k*ffq1, 22.55), 3), 0, 1, camera.top, camera.bottom);
            let area = 20*200;
            let w = we;
            let h = he;
            let r = map(power(noise(k*ffq2, 54.32), 3), 0, 1, -150, 150)/180*3.14;

            if(quant)
                r = Math.round(r/(3.14/4))*3.14/4;

            //w = random(200, 300);
            //h = random(1, 2)*10;

            let q = getQuadMesh(x, y, w, h, r);

            qs.push(q);
        }
    }

    qs = centerMeshes(qs);

    // if(thevariant == 1 || true){
    //     let q = getQuadMesh(0, 0, Math.abs(camera.right-camera.left)*.7, Math.abs(camera.top-camera.bottom)*.7, 0);
    //     q.material = new THREE.MeshBasicMaterial( { color: new THREE.Color(0,0,0) } );
    //     q.position.z = 22;
    //     qs.push(q);
    // }


    return qs;
}

function centerMeshes(meshes){
    let mx = 0;
    let my = 0;
    for(let k = 0; k < meshes.length; k++){
        mx += meshes[k].position.x;
        my += meshes[k].position.y;
    }
    mx = mx/meshes.length;
    my = my/meshes.length;
    for(let k = 0; k < meshes.length; k++){
        meshes[k].position.x -= mx;
        meshes[k].position.y -= my;
    }
    
    // let sx = random(.6, .99);
    // let sy = random(.6, .99);
    // for(let k = 0; k < meshes.length; k++){
    //     meshes[k].position.x *= sx;
    //     meshes[k].position.y *= sy;
    // }

    return meshes;
}

function getQuadMesh(x, y, w, h, r){
    let width = w;
    let height = h;
    let widthSegments = 1;
    let heightSegments = 1;
    let geometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);

    let roro = random(0, .8);
    let uvs = [];
    uvs.push(roro+0, 0, 0)
    uvs.push(roro+.2, 0, 0)
    uvs.push(roro+.2, 1, 0)
    uvs.push(roro+0, 1, 0)

    //geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uvs', new THREE.Float32BufferAttribute(uvs, 3));

    let swirlmaterial = new THREE.ShaderMaterial({
        lights: true,
        side: THREE.DoubleSide,
        uniforms: {
            ...THREE.UniformsLib.lights,
            uGlossiness: {
                value: 20
            },
            uColor: {
                value: new THREE.Color(...getIn(Math.pow(fxrand(), 1)))
            },
            resolution: {
                value: [100, 100]
            },
            uTime: {
                value: 0
            },
            algo: {
                value: .5
            },
            seed: {
                value: fxrand()
            }
        },
        vertexShader: svShader,
        fragmentShader: sfShader,
        transparent: true,
    });
    let quadMesh = new THREE.Mesh(geometry, swirlmaterial);

    quadMesh.position.x = x;
    quadMesh.position.y = y;
    quadMesh.position.z = random(-10,10);
    quadMesh.rotation.z = r;

    return quadMesh;
}


function getSwirlMesh(path, dy = 0, rw = 5, parts = 40, width = 5 * 40, pp=0.0) {

    let geometry = new THREE.BufferGeometry();

    let swirlmaterial = new THREE.ShaderMaterial({
        lights: true,
        side: THREE.DoubleSide,
        uniforms: {
            ...THREE.UniformsLib.lights,
            uGlossiness: {
                value: 20
            },
            uColor: {
                value: new THREE.Color(...getIn(Math.pow(fxrand(), 1)))
            },
            resolution: {
                value: [100, 100]
            },
            uTime: {
                value: 0
            },
            algo: {
                value: .5
            },
            seed: {
                value: fxrand()
            }
        },
        vertexShader: svShader,
        fragmentShader: sfShader,
        transparent: true,
    });

    let indices = [];

    let vertices = [];
    // let normals = [];
    let colors = [];
    let uvs = [];

    for (let k = 0; k < path.length; k++) {
        let rx = 0;
        let ry = 0;
        // swiched Y and Z because I want 2D path to map to XZ, not XY
        for (let t = 0; t < parts; t++) {
            let tt = map(t, 0, parts - 1, 0, parts);
            vertices.push(
                path[k].x + rx,
                path[k].z + width / 2 - rw * tt + dy,
                path[k].y + ry
            );
        }
    }

    let cfrq = random(.002, .007);
    for (let k = 0; k < path.length; k++) {
        for (let t = 0; t < parts; t++) {
            let col = getIn((k * cfrq) % 1.);
            let oox = k / (path.length - 1);
            let ooy = t / (parts - 1);
            let amp = map(t, 0, parts - 1, 1, .5);
            amp = map(pp, 0, 1, 1, .7);
            if(fxrand() < .1){
                colors.push(1., 0., 0.);
            }
            else{
                colors.push(amp * col[0], amp * col[1], amp * col[2]);
            }
            uvs.push(oox, ooy, 0.);
        }
    }

    for (let k = 0; k < path.length - 1; k++) {
        for (let t = 0; t < parts - 1; t++) {
            let ii = parts * k + t;
            indices.push(ii, ii + 1, ii + parts);
            indices.push(ii + 1, ii + 1 + parts, ii + parts);
        }
    }

    geometry.setIndex(indices);
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
    );
    // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3
    // ) );
    geometry.computeVertexNormals();
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uvs', new THREE.Float32BufferAttribute(uvs, 3));
    // const material = new THREE.MeshPhongMaterial( {     side: THREE.DoubleSide,
    // vertexColors: true } );
    var swirlmaterial_q = swirlmaterial.clone();
    swirlmaterial_q.uniforms.seed.value = fxrand();
    let mesh = new THREE.Mesh(geometry, swirlmaterial_q);
    // mesh.castShadow = true;

    
    // let strokeCurve = new MyCurve(path, new THREE.Vector3(0, 0, dy));
    // let tuberadius = 2.6;
    // let tubegeo = new Tube(strokeCurve, strokeCurve.length, tuberadius, 12, false);
    // mesh = new THREE.Mesh( tubegeo, swirlmaterial );

    return mesh;
}

let dett = fxrand() < .5;
function getHobbyPath(pts) {
    let knots = makeknots(pts, 1, true);
    let hobbypts;
    hobbypts = gethobbypoints(knots, true, dett ? 333.02 : 3.);
    return hobbypts;
}

let fxaaPass;
let postPass;

let rarax = random(90, 400);
let raray = random(90, 400);

function loadData() {
    /*
    canvas2 = document.createElement("canvas");
    canvas2.id = "hello"
    canvas2.width = ww;
    canvas2.height = wh;
    canvas2.style.position = 'absolute';
    canvas2.style.left = '0px';
    canvas2.style.top = '0px';
    canvas2.style.z_index = '1111';
    console.log(canvas2)
    document.body.append(canvas2)
    */
    winScale = canvasWidth / ress;
    // camera = new THREE.OrthographicCamera(-canvasWidth/2/winScale,
    // canvasWidth/2/winScale, canvasHeight/2/winScale, -canvasHeight/2/winScale, 1,
    // 2000); camera = new THREE.OrthographicCamera( 1000 * 1. / - 2, 1000 * 1. / 2,
    // 1000 / 2, 1000 / - 2, 1, 4000 );
    rarax = 400;
    raray = 400;
    if(fxrand() < .85){
        rarax = random(90, 200);
        raray = random(90, 200);
    }
    
    // if(thevariant == 2){
    //     rarax = min(120, rarax);
    //     raray = min(120, raray);
    // }

    if(fxrand() < 1.85){
        rarax = random(90, 200);
        raray = random(90, 144);
    }

    camera = new THREE.OrthographicCamera(
        -omx*rarax / 2,
        omx*rarax / 2,
        omy*raray / 2,
        -omy*raray / 2,
        1,
        4000
    );
    // camera = new THREE.PerspectiveCamera( 27, canvasWidth / canvasHeight, 1, 222
    // );

    var ff = true;
    if (scene) 
        ff = false;
    scene = new THREE.Scene();

    camera.position.x = 0;
    camera.position.z = 666;
    camera.position.y = 0;
    // camera.lookAt(scene.position);

    var rx = fxrand() * 256;
    var ry = fxrand() * 256;
    // backgroundColor = [pixelData[0]/255., pixelData[1]/255., pixelData[2]/255.];
    // scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

    //

    const particles = 33133;

    const pointsGeo = new THREE.BufferGeometry();

    pointsGeo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(particlePositions, 3)
    );
    pointsGeo.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(particleColors, 4)
    );
    pointsGeo.setAttribute(
        'size',
        new THREE.Float32BufferAttribute(particleSizes, 2)
    );
    pointsGeo.setAttribute(
        'angle',
        new THREE.Float32BufferAttribute(particleAngles, 1)
    );
    pointsGeo.setAttribute(
        'index',
        new THREE.Float32BufferAttribute(particleIndices, 1)
    );

    var customUniforms = {
        u_time: {
            value: frameCount
        },
        u_spread: {
            value: 33
        },
        u_mouse: {
            value: [0, 0]
        },
        u_diffuse: {
            value: [0, 0, 0, 1]
        },
        u_scrollscale: {
            value: scrollscale
        },
        u_winscale: {
            value: 4.
        },
        u_seed: map(fxrand(), 0, 1, 1000.)
    };
    var scustomUniforms = {
        time: {
            value: frameCount
        }
    };

    // const material = new THREE.ShaderMaterial(
    //     {uniforms: customUniforms, vertexShader: vShader, fragmentShader: fShader, transparent: true}
    // );

    const smaterial = new THREE.ShaderMaterial({
        lights: true,
        uniforms: {
            ...THREE.UniformsLib.lights,
            uGlossiness: {
                value: 20
            },
            uColor: {
                value: new THREE.Color(...getIn(Math.pow(fxrand(), 1)))
            },
            resolution: {
                value: [100, 100]
            },
            uTime: {
                value: 0
            },
            seed: {
                value: fxrand()
            }
        },
        vertexShader: svShader,
        fragmentShader: sfShader,
        transparent: true
    });

    //console.log(vShader);

    let totalh = random(40, 200);
    let nh = Math.round(random(1, 4));
    if (fxrand() < .5) 
        nh = 1;
    let oneh = totalh / nh;
    let initpts = getPathPts();

    bmseed = fxrand()
    // if(totalh < 100 && bmseed >= .5){
    //     console.log(bmseed)
    //     console.log('changed')
    //     bmseed = 1. - bmseed;
    // }
    // console.log(bmseed)

    let nptsa1 = [];
    let nptsa2 = [];
    for (let k = 0; k < nh; k++) {
        let yy;
        if (nh == 1) 
            yy = 0;
        else 
            yy = map(k, 0, nh - 1, -(totalh / 2 - oneh / 2), (totalh / 2 - oneh / 2));
        let rw = 1.;
        //let parts = 5;  minimalno 2
        let parts = 1.+Math.round(oneh / rw);
        rw = oneh / parts;
        let width = rw * parts;
        let npts = [];
        for (let q = 0; q < initpts.length; q++) {
            let pt = initpts[q];
            let npt = new myVec(pt.x, pt.y);
            let amp = map(q, 0, initpts.length - 1, 0, 1);
            amp = map(Math.pow(amp, 3), 0, 1, 0, 15) * power(noise(k * 0.07), 4.);
            npt.x += map(fxrand(), 0, 1, -amp, amp);
            npt.y += map(fxrand(), 0, 1, -amp, amp);
            npts.push(npt);
        }
        if(k == 0){
            nptsa1 = npts;
        }
        if(k == nh-1){
            nptsa2 = npts;
        }
        let hobbypath = getHobbyPath(npts);
        let shortened = [];
        let kaka = map(fxrand(), 0, 1, .5, 1.);
        if(nh < 5){
            kaka = 1;
        }
        for(let t = 0; t < hobbypath.length*kaka; t++){
            shortened.push(hobbypath[t]);
        }
        const swirl = getSwirlMesh(shortened, yy, rw, parts, width, nh==1 ? 0. : k/(nh-1));
        //swirls.push(swirl);
        swirl.rotation.x = 40*3.14/180;
        //scene.add(swirl);
    }



    let strokeCurve1 = new MyCurve(getHobbyPath(nptsa1), new THREE.Vector3(0, 0, -totalh/2));
    let strokeCurve2 = new MyCurve(getHobbyPath(nptsa2), new THREE.Vector3(0, 0, totalh/2));
    let tuberadius = .7;
    let tubegeo1 = new Tube(strokeCurve1, strokeCurve1.length, tuberadius, 28, false);
    let tubegeo2 = new Tube(strokeCurve2, strokeCurve2.length, tuberadius, 28, false);
    const tubemat = new THREE.MeshBasicMaterial( { color: new THREE.Color(...getIn(fxrand())) } );
    const tubemesh1 = new THREE.Mesh( tubegeo1, tubemat );
    const tubemesh2 = new THREE.Mesh( tubegeo2, tubemat );
    tubemesh1.rotation.x = 40*3.14/180;
    tubemesh2.rotation.x = 40*3.14/180;

    scene.add( tubemesh1 );
    scene.add( tubemesh2 );

    
    let rects = getQuadMeshes();
    for(let rect of rects){
        scene.add(rect)
    }
   


    // const floorGeo = new THREE.PlaneGeometry( 133, 133, 1, 1 ); const floor = new
    // THREE.Mesh( floorGeo, fmaterial); floor.castShadow = true;
    // floor.receiveShadow = true scene.add( floor ); floor.rotation.x =
    // -90/180*Math.PI; floor.position.y = -2; floor.rotation.z = .3;

    const ambientLight = new THREE.AmbientLight('#ffffff', 0)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight('#ffffff', 0)
    let ang = map(fxrand(), 0, 1, -90, -180) / 180 * 3.14 * (-1);
    ang = fxrand() * 3.14 * 2;
    let rad = map(fxrand(), 0, 1, 5, 6);
    directionalLight
        .position
        .set(rad * Math.cos(ang), 6, rad * Math.sin(ang))
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 24
    directionalLight.shadow.mapSize.height = 24
    // directionalLight.shadow.camera.left = -14;
    // directionalLight.shadow.camera.right = 14;
    // directionalLight.shadow.camera.top = 14;
    // directionalLight.shadow.camera.bottom = -14;
    // directionalLight.shadow.camera.near = .1;
    // directionalLight.shadow.camera.far = 111;
    scene.add(directionalLight)

    if (ff) 
        renderer = new THREE.WebGLRenderer(
            {preserveDrawingBuffer: true, antialias: true, 'precision': 'mediump'}
        );
    
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.autoClear = true;

    
    // renderer2 = new THREE.WebGLRenderer(
    //     {preserveDrawingBuffer: true, antialias: true}
    // );
    // renderer2.autoClear = true;
    // renderer2.setPixelRatio(pixelRatio);
    // renderer2.setSize(canvasWidth, canvasHeight);

    // baseWidth = canvasWidth;
    // baseHeight = canvasHeight;

    rawTarget = new THREE.WebGLRenderTarget(
        baseWidth * pixelRatio,
        baseHeight * pixelRatio
    );

    blurTarget = new THREE.WebGLRenderTarget(
        baseWidth * pixelRatio,
        baseHeight * pixelRatio
    );

    blurTargetH = new THREE.WebGLRenderTarget(
        baseWidth * pixelRatio,
        baseHeight * pixelRatio
    );

    blurTargetV = new THREE.WebGLRenderTarget(
        baseWidth * pixelRatio,
        baseHeight * pixelRatio
    );



    renderer.autoClearColor = true;
    //renderer.setPixelRatio( 1.0 );
    if(isFxpreview){
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(canvasWidth, canvasHeight);
    }
    else{
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(baseWidth, baseHeight);
    }

    renderer.domElement.id = "cnvs"
    // renderer.domElement.style.position = "absolute";
    // renderer.domElement.style.left = "0px"; renderer.domElement.style.top =
    // "0px";
    if (ff) 
        document
            .body
            .appendChild(renderer.domElement);
    
    repositionCanvas(renderer.domElement);

    //renderer.domElement.style.border = "10px solid black";

    //renderer.setClearColor(new THREE.Color(.1, .16, .16), 1);

    let bbc = getIn(fxrand());
    bbc = [.3 + .3 * bbc[0], .3 + .3 * bbc[1], .3 + .3 * bbc[2]];
    scene.background = new THREE.Color(...bbc);
    let bgGeometry = new THREE.BufferGeometry();
    let bgVertices = [
        -omx*400 / 2, -omy*400 / 2, -300., 
        +omx*400 / 2, -omy*400 / 2, -300., 
        +omx*400 / 2, +omy*400 / 2, -300., 
        -omx*400 / 2, +omy*400 / 2, -300., 
    ];
    let bgIndices = [
        0, 1, 3, 1, 2, 3
    ]
    let bgColors = [];
    let pp = fxrand();
    let vbgc1 = getIn(pp);
    let vbgc2 = getIn((pp+random(0.1,.2))%1.);
    vbgc1 = [vbgc1[0], vbgc1[1], vbgc1[2]];
    vbgc2 = [vbgc2[0], vbgc2[1], vbgc2[2]];
    if(fxrand() < .75 && thevariant != 1){
        let rere = .05+.9*fxrand();
        vbgc1 = vbgc2 = [.05, .05, .05];
    }

    for(let k = 0; k < 4; k++){
        let vbgc = vbgc1;
        if(k > 1){
            vbgc = vbgc2;
        }
        bgColors.push(...vbgc);
    }
    bgGeometry.setIndex(bgIndices);
    bgGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(bgVertices, 3)
    );
     bgGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( bgColors, 3) );
    let bgMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    let bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(bgMesh)

    camera.position.x = 0;
    camera.position.z = 666;
    camera.position.y = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));
    // orbitcontrols = new OrbitControls(camera, renderer.domElement);
    // camera.lookAt(new THREE.Vector3(0,5,0)); OVO
    //renderer2.setRenderTarget(rawTarget); 
    //renderer2.setClearColor( new THREE.Color(1, 0, 0));
    //renderer2.shadowMap.enabled = true
    //renderer2.shadowMap.type = THREE.PCFSoftShadowMap;
    // renderer.setClearColor( new THREE.Color(.6, .6, .6), 1 );
    // renderer.setClearColor( new THREE.Color(r1*p+(1-p)*r2, g1*p+(1-p)*g2,
    // b1*p+(1-p)*b2), 1 ); renderer.setClearColor( new THREE.Color(.9, .16, .16), 1
    // ); renderer.clear();
    PostProcShader.uniforms.seed1.value = fxrand();
    PostProcShader.uniforms.color.value = getIn(fxrand());


    // fxaaPass = new ShaderPass(FXAAShader);
    // postPass = new ShaderPass(PostProcShader);
    // postPass.uniforms.resolution.value = [
    //     canvasWidth * pixelRatio,
    //     canvasHeight * pixelRatio
    // ]
    // fxaaPass.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth *
    // pixelRatio ); fxaaPass.uniforms[ 'resolution' ].value.y = 1 / (
    // window.innerHeight * pixelRatio );
    // fxaaPass.uniforms.resolution.value = [
    //     1 / (canvasWidth * pixelRatio),
    //     1 / (canvasHeight * pixelRatio)
    // ];

    // composer = new EffectComposer(renderer);
    // const renderPass = new RenderPass(scene, camera);
    // composer.addPass(renderPass);
    // composer.addPass(fxaaPass);
    // composer.addPass(postPass);
    //composer.render();

    var r1 = palette[0][0];
    var g1 = palette[0][1];
    var b1 = palette[0][2];
    var r2 = .5;
    var g2 = .5;
    var b2 = .5;
    var p = .85;

    
    blurCamera = new THREE.OrthographicCamera(
        -omx*400 / 2,
        omx*400 / 2,
        omy*400 / 2,
        -omy*400 / 2,
        1,
        4000
    );
    blurCamera.position.z = 666;
    blurScene = new THREE.Scene(); 
    blurGeometry = new THREE.PlaneGeometry(400*omx, 400*omy); 
    blurMaterial = new THREE.ShaderMaterial({
             uniforms: BlurShader.uniforms,
             vertexShader: BlurShader.vertexShader,     
             fragmentShader: BlurShader.fragmentShader,     
             transparent:  false 
    }); 
    blurMesh = new THREE.Mesh(blurGeometry, blurMaterial);
    blurScene.add(blurMesh);
    
    postprocCamera = new THREE.OrthographicCamera(
        -omx*400 / 2,
        omx*400 / 2,
        omy*400 / 2,
        -omy*400 / 2,
        1,
        4000
    );
    postprocCamera.position.z = 666;
    postprocScene = new THREE.Scene(); 
    postprocGeometry = new THREE.PlaneGeometry(400*omx, 400*omy); 
    postprocMaterial = new THREE.ShaderMaterial({
             uniforms: PostProcShader.uniforms,
             vertexShader: PostProcShader.vertexShader,     
             fragmentShader: PostProcShader.fragmentShader,     
             transparent:  false 
    }); 
    postprocMesh = new THREE.Mesh(postprocGeometry, postprocMaterial);
    postprocScene.add(postprocMesh);
   
    if(fxrand() < .5)
        scene.background = new THREE.Color(...bbc);
    else
        scene.background = new THREE.Color(.0,.0,.0);
    
    renderRoutine();




    
    if (firsttime) {
        //animate();
        firsttime = false;
    }

    window.addEventListener( 'resize', onWindowResize );

    fxpreview();
    // console.log('hash:', fxhash); window.addEventListener( 'resize',
    // onWindowResize ); window.onmousemove = animate; window.onmouseup =
    // function(){isdown = false; mouseprev.x = mouse.x; mouseprev.y = mouse.y;};
}

let bmseed = Math.round(fxrand()*1000.)/1000.;
function renderRoutine(){
    
    blurMesh.material.uniforms.resolution.value = [baseWidth*pixelRatio, baseHeight*pixelRatio];
    postprocMesh.material.uniforms.resolution.value = [baseWidth*pixelRatio, baseHeight*pixelRatio];
    postprocMesh.material.uniforms.seed1.value = 5.*fxrand();
    for(let k = 0; k < swirls.length; k++){
        let sw = swirls[k];
        sw.material.uniforms.algo.value = 0.0;
    }
    renderer.setRenderTarget(rawTarget); 
    
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    for(let k = 0; k < swirls.length; k++){
        let sw = swirls[k];
        sw.material.uniforms.algo.value = 1.0;
    }
    scene.background = new THREE.Color(1, 1, 1);
    // renderer.setRenderTarget(depthTarget); 
    // camera.updateProjectionMatrix();
    // renderer.render(scene, camera);

    // let finalBlurTexture = depthTarget.texture;
    // blurMesh.material.uniforms.tDiffuse.value = finalBlurTexture;
    blurMesh.material.uniforms.seed.value = bmseed;
    // blurMesh.material.uniforms.dmap.value = depthTarget.texture;
    let bluramp = random(1.9, 2.1);
    if(fxrand() < .25)
        bluramp = random(3, 5);
    bluramp = dett ? random(.15, .5) : random(.5, .6);
    bluramp = random(.2, .9);
    bluramp = random(.9, 1.9);
    blurMesh.material.uniforms.variant.value = thevariant;
    
    blurCamera.updateProjectionMatrix();
    // for(let k = 0; k < 1; k++){
    //     blurMesh.material.uniforms.tDiffuse.value = finalBlurTexture;
    //     blurMesh.material.uniforms.uDir.value = [1, 0];
    //     blurMesh.material.uniforms.amp.value = bluramp;
    //     renderer.setRenderTarget(blurTargetH); 
    //     renderer.render(blurScene, blurCamera);
        
    //     blurMesh.material.uniforms.tDiffuse.value = blurTargetH.texture;
    //     blurMesh.material.uniforms.uDir.value = [0, 1];
    //     blurMesh.material.uniforms.amp.value = bluramp;
    //     renderer.setRenderTarget(blurTargetV);
    //     renderer.render(blurScene, blurCamera);

    //     finalBlurTexture = blurTargetV.texture;
    // }

    let finalBlurTexture = rawTarget.texture;
    let passes = 11;
    if(thevariant != 2)
        passes = random(4, 9);

    
    let blurampx = bluramp;
    let blurampy = bluramp;
    if(thevariant==2 || true){
        blurampx = 2;
        blurampy = .02;
    }
    // console.log(blurampx, blurampy);
    blurMesh.material.uniforms.colorshift.value = [fxrand()>.5?1:0,fxrand()>.5?1:0,fxrand()>.5?1:0];
    // console.log(blurMesh.material.uniforms.colorshift.value);
    for(let k = 0; k < passes; k++){
        blurMesh.material.uniforms.tDiffuse.value = finalBlurTexture;
        blurMesh.material.uniforms.uDir.value = [1, 0];
        blurMesh.material.uniforms.amp.value = blurampx;
        renderer.setRenderTarget(blurTargetH); 
        renderer.render(blurScene, blurCamera);
        
        blurMesh.material.uniforms.tDiffuse.value = blurTargetH.texture;
        blurMesh.material.uniforms.uDir.value = [0, 1];
        blurMesh.material.uniforms.amp.value = blurampy;
        renderer.setRenderTarget(blurTarget);
        renderer.render(blurScene, blurCamera);
        finalBlurTexture = blurTarget.texture;
    }

    postprocCamera.updateProjectionMatrix();
    // postprocMesh.material.uniforms.tDiffuse.value = rawTarget.texture;
    // postprocMesh.material.uniforms.tDiffuse2.value = depthTarget.texture;
    // postprocMesh.material.uniforms.tDiffuse3.value = blurTargetV.texture;
    postprocMesh.material.uniforms.tDiffuse4.value = blurTarget.texture;

    renderer.setRenderTarget(null);
    renderer.setClearColor( new THREE.Color(palette[0][0], palette[0][1], palette[0][2]) );
    renderer.render(postprocScene, postprocCamera);

}

function getPathPts() {
    let scax = 1;
    let scay = 1;
    let midx = 1;
    let midy = 1;
    let pts = [];

    let tries = 0;
    while(scax < 100 && tries++ < 100){
        pts = [];
        let striw = random(.08, .8);
        let frae = random(.03, .033);
        if (fxrand() < 1.5) {
            let nn = random(24, 62);
            for (let k = 0; k < nn; k++) {
                pts.push(new myVec(
                    0.24 * map(power(noise(k * frae, 985.33), 2), 0, 1, -1000 / 2 * 1.4, 1000 / 2 * 1.4),
                    0.24 * map(k, 0, nn - 1, -1010 / 2, 1010 / 2) * 1.1 + 0.24 * map(power(noise(k * 1.3, 123.33), 2), 0, 1, -1010 / 2 * .3, 1010 / 2 * .3),
                ));
            }
        } else {
            let nn = random(4, 64);
            for (let k = 0; k < nn; k++) {
                pts.push(
                    new myVec(0.24 * random(-1000 / 2, 1000 / 2), 0.24 * random(-1010 / 2 * striw, 1010 / 2 * striw),)
                );
            }
        }
    
        let hp = getHobbyPath(pts);
        let minx = 100000;
        let miny = 100000;
        let maxx = -100000;
        let maxy = -100000;
        for(let k = 0; k < hp.length; k++){
            let p = hp[k];
            if(p.x < minx) minx = p.x;
            if(p.y < miny) miny = p.y;
            if(p.x > maxx) maxx = p.x;
            if(p.y > maxy) maxy = p.y;
        }
        midx = (minx + maxx)/2;
        midy = (miny + maxy)/2;
    
        scax = Math.abs(maxx-minx);
        scay = Math.abs(maxy-miny);
    }


    if(omy < 1.){
        //scax = scay = 170/scay;
        scax = 300/scax;
        scay = 170/scay;
        // console.log('hello');
        // console.log(minx, maxx, miny, maxy);
        // console.log(scax, scay);
    }
    else{
        scax = scay = 300/scay;
    }
    
    let shifted = [];
    for(let k = 0; k < pts.length; k++){
        let p = pts[k];
        shifted.push(new myVec(scax*(p.x-midx), scay*(p.y-midy)))
    }

    return shifted;
}

let dtime = 1. / 30;
let ttime = 0;
let firsttime = true;

let camera_positions = [
    new THREE.Vector3(0, 800, 800),
    new THREE.Vector3(0, 0, 800),
    new THREE.Vector3(-800, 0, 0),
    new THREE.Vector3(-100, -800, 0),
    new THREE.Vector3(-800, 0, 0),
    new THREE.Vector3(0, 0, 800)
]

function animate() {
    // renderer.setRenderTarget(null); renderer.clear(); orbitcontrols.update();
    // swirlmaterial.uniforms.uTime.value = ttime;
    // ttime += dtime;

    if (idwn || true) {
        // orbitcontrols.update();
    } else {
        let intdur = 3;
        let tttime = ttime % (camera_positions.length * intdur);
        let transition = 2;

        for (let to = 0; to < camera_positions.length; to++) {
            let li = map(
                to,
                0,
                camera_positions.length - 1,
                intdur,
                intdur * camera_positions.length
            );
            if (tttime < li) {
                let ctime = power(constrain(map(tttime, li - transition, li, 0, 1), 0, 1), 2);
                camera.position.x = lerp(
                    camera_positions[to].x,
                    camera_positions[(to + 1) % camera_positions.length].x,
                    ctime
                );
                camera.position.y = lerp(
                    camera_positions[to].y,
                    camera_positions[(to + 1) % camera_positions.length].y,
                    ctime
                );
                camera.position.z = lerp(
                    camera_positions[to].z,
                    camera_positions[(to + 1) % camera_positions.length].z,
                    ctime
                );
                break;
            }
        }

        let dd = Math.sqrt(
            camera.position.x * camera.position.x + camera.position.y * camera.position.y + camera.position.z * camera.position.z
        );
        camera.position.x /= dd;
        camera.position.y /= dd;
        camera.position.z /= dd;
        camera.position.x *= 500;
        camera.position.y *= 500;
        camera.position.z *= 500;
        camera.lookAt(new THREE.Vector3(0, 0, 0))
    }
    renderRoutine()
    //renderer2.render(scene, camera);

    //composer.readBuffer.tpostPass.uniforms.tDiffuse2.value = rawTarget.texture;

    // composer.render();

    requestAnimationFrame(animate)
}

function lines() {
    var nn = Math.round(map(fxrand(), 0, 1, 310, 320)) * .1

    for (var k = 0; k < nn * .1; k++) {
        var brr = map(fxrand(), 0, 1, 0.01, 0.15);
        x2 = map(fxrand(), 0, 1, -ress / 2 * .05, ress / 2 * .05);
        y2 = map(Math.pow(fxrand(), 3), 0, 1, -ress / 2 * .05, ress / 2 * .05);
        x1 = map(fxrand(), 0, 1, -ress / 2 * .4, ress / 2 * .4);
        y1 = map(Math.pow(fxrand(), 3), 0, 1, -ress / 2 * .4, ress / 2 * .4);
        // drawLine(    new THREE.Vector2(x1, y1),    new THREE.Vector2(x2, y2),
        // map(fxrand(), 0, 1, 0.3, 0.6)*1.8, 1.5, [brr*4,brr*.1,brr*.1], 33 );
    }

    var x1 = map(fxrand(), 0, 1, -ress / 2 * .9, ress / 2 * .9);
    var y1 = map(fxrand(), 0, 1, -ress / 2 * .9, ress / 2 * .9);
    var x2 = map(fxrand(), 0, 1, -ress / 2 * .9, ress / 2 * .9);
    var y2 = map(fxrand(), 0, 1, -ress / 2 * .9, ress / 2 * .9);
    for (var k = 0; k < nn; k++) {
        var brr = map(fxrand(), 0, 1, 0.01, 0.15);
        x2 = x1;
        y2 = y1;
        x1 = map(power(fxrand(), 3), 0, 1, -ress / 2 * .9, ress / 2 * .9);
        y1 = map(power(fxrand(), 3), 0, 1, -ress / 2 * .9, ress / 2 * .9);
        if (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) < 1200) {
            drawLine(
                new THREE.Vector2(x1, y1),
                new THREE.Vector2(x2, y2),
                map(fxrand(), 0, 1, 0.3, 0.6),
                1.1,
                [
                    brr, brr, brr
                ],
                33
            );
        }
        // drawLine(    new THREE.Vector2(map(fxrand(), 0, 1, -ress/2*.1, ress/2*.1),
        // map(fxrand(), 0, 1, -ress/2*.1, ress/2*.1)),    new
        // THREE.Vector2(map(fxrand(), 0, 1, -ress/2*.9, ress/2*.9), map(fxrand(), 0, 1,
        // -ress/2*.9, ress/2*.9)),    map(fxrand(), 0, 1, 0.3, 0.6), 1.5,
        // [brr,brr,brr], 24 );
    }
}

function repositionCanvas(canvas) {
    var win = window;
    var doc = document;
    var body = doc.getElementsByTagName('body')[0];
    var ww = win.innerWidth;
    var wh = win.innerHeight;

    if (isMobile()) {
        //canvas.width = ww; canvas.height = wh; canvas.style.borderWidth = "6px";
    } else {
        // canvas.width = Math.min(ww, wh) - 130; canvas.height = Math.min(ww, wh) -
        // 130;
    }
    canvas.style.width = Math.min(ww, wh)*omx - 0*120 + 'px';
    canvas.style.height = Math.min(ww, wh) - 0*120 + 'px';
    canvas.style.position = 'absolute';
    canvas.style.left = (ww - Math.min(ww, wh)*omx) / 2 +0*120/2+ 'px';
    canvas.style.top = (wh - Math.min(ww, wh)) / 2 +0*120/2+ 'px'; // ovih 6 je border
    // console.log(canvas.style.width)
}

var cnt = 0

var shft = map(fxrand(), 0, 1, 0.6, 1.05) % 1.0;
var shft2 = map(fxrand(), 0, 1, 0.0, 1.0) % 1.0;
var hasAtt = fxrand() < .5;

function HSVtoRGB(h, s, v) {
    var r,
        g,
        b,
        i,
        f,
        p,
        q,
        t;
    if (arguments.length === 1) {
        s = h.s,
        v = h.v,
        h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v,
            g = t,
            b = p;
            break;
        case 1:
            r = q,
            g = v,
            b = p;
            break;
        case 2:
            r = p,
            g = v,
            b = t;
            break;
        case 3:
            r = p,
            g = q,
            b = v;
            break;
        case 4:
            r = t,
            g = p,
            b = v;
            break;
        case 5:
            r = v,
            g = p,
            b = q;
            break;
    }
    return [r, g, b]
}

const HSLtoRGB = (h, s, l) => {
    //s /= 100; l /= 100;
    h = h * 360;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [
        1 * f(0),
        1 * f(8),
        1 * f(4)
    ];
};

function myDot(col1, col2) {
    let dd = Math.sqrt(col1[0] * col1[0] + col1[1] * col1[1] + col1[2] * col1[2]);
    let r = col1[0] / dd;
    let g = col1[1] / dd;
    let b = col1[2] / dd;
    let dd2 = Math.sqrt(col2[0] * col2[0] + col2[1] * col2[1] + col2[2] * col2[2]);
    let r2 = col2[0] / dd2;
    let g2 = col2[1] / dd2;
    let b2 = col2[2] / dd2;
    return r * r2 + g * g2 + b * b2;
}

function onWindowResize() {
    if (renderer) {

        var ww = window.innerWidth || canvas.clientWidth || body.clientWidth;
        var wh = window.innerHeight || canvas.clientHeight || body.clientHeight;

        baseWidth = ress - 0;
        baseHeight = ress - 0;

        var mm = min(ww, wh);
        winScale = mm / baseWidth;

        if (ww < ress + 16 || wh < ress + 16 || true) {
            canvasWidth = mm * omx - 0*133 * mm / ress;
            canvasHeight = mm * omy - 0*133 * mm / ress;
            //baseWidth = mm-16-16; baseHeight = mm-16-16;
        }

        ww = canvasWidth
        wh = canvasHeight
        // baseWidth = ww;
        // baseHeight = wh;

        // winScale = canvasWidth / ress; camera.left = -canvasWidth/2 / winScale;
        // camera.right = +canvasWidth/2 / winScale; camera.top = +canvasHeight/2 /
        // winScale; camera.bottom = -canvasHeight/2 / winScale;
        // camera.updateProjectionMatrix();

        // postPass.uniforms.resolution.value = [
        //     canvasWidth * pixelRatio,
        //     canvasHeight * pixelRatio
        // ]
        // // fxaaPass.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth *
        // // pixelRatio ); fxaaPass.uniforms[ 'resolution' ].value.y = 1 / (
        // // window.innerHeight * pixelRatio );
        // fxaaPass.uniforms.resolution.value = [
        //     1 / (canvasWidth * pixelRatio),
        //     1 / (canvasHeight * pixelRatio)
        // ];
        // renderer.setPixelRatio(pixelRatio);
        //renderer.setPixelRatio( 1.0000 );

        // renderer.setClearColor( new THREE.Color(palette[0][0], palette[0][1],
        // palette[0][2]), 1 ); renderer.clear(); renderer.domElement.id = "cnvs";
        // renderer.domElement.style.position = "absolute";
        // renderer.domElement.style.left = "0px"; renderer.domElement.style.top =
        // "0px";
        repositionCanvas(renderer.domElement);

        // points.material.uniforms.u_time.value = 0;
        // points.material.uniforms.u_scrollscale.value = scrollscale;
        // console.log(winScale); points.material.uniforms.u_winscale.value =
        // winScale*pixelRatio; const composer = new EffectComposer(
        // renderer ); const renderPass = new RenderPass( scene, camera );
        // PostProcShader.uniforms.resolution.value =
        // [canvasWidth*pixelRatio, canvasHeight*pixelRatio];
        // const luminosityPass = new ShaderPass( PostProcShader ); composer.addPass(
        // renderPass ); composer.addPass( luminosityPass ); composer.render();
        // renderer.render( scene, camera );
    } else {
        // reset();
    }
}

function mouseClicked() {
    //
    //reset();
}

function scroll(event) {
    // event.preventDefault(); scrollscale = scrollscale + event.deltaY * -0.002;
    // scrollscale = Math.min(Math.max(.125, scrollscale), 6);
}

window.onmousemove = function (e) {};

let idwn = false;
window.onmousedown = function (e) {
    idwn = true;
};

window.onmouseup = function (e) {
    idwn = false;
};
window.onclick = mouseClicked;
window.onwheel = scroll;

let debug = false;

document.onkeypress = function (e) {
    // if(String.fromCharCode(e.keyCode) == 'q'){
    //     debug = !debug;

    //     if(debug){
    //         renderer.setRenderTarget(null);
    //         renderer.setClearColor( new THREE.Color(palette[0][0], palette[0][1], palette[0][2]) );
    //         renderer.render(scene, camera);
    //     }
    //     else{
    //         renderer.setRenderTarget(null);
    //         renderer.setClearColor( new THREE.Color(palette[0][0], palette[0][1], palette[0][2]) );
    //         renderer.render(postprocScene, postprocCamera);
    //     }
    // }
    // if(String.fromCharCode(e.keyCode) == 'r'){
    //     reset();
    // }
    if(String.fromCharCode(e.keyCode) == 's'){
        save();
    }
};

function save(){
    let canvas = document.getElementById("cnvs");
    let image = canvas.toDataURL("image/png");
    let a = document.createElement("a");
    a.href = image.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    a.download = fxhash + "_" + iterationCount + "_" + pixelRatio + ".png";
    a.click();
}

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4;
let perlin_amp_falloff = 0.5;

const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
let perlin;

var noise = function (x, y = 0, z = 0) {
    if (perlin == null) {
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = fxrand();
        }
    }

    if (x < 0) {
        x = -x;
    }
    if (y < 0) {
        y = -y;
    }
    if (z < 0) {
        z = -z;
    }

    let xi = Math.floor(x),
        yi = Math.floor(y),
        zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf,
        ryf;

    let r = 0;
    let ampl = 0.5;

    let n1,
        n2,
        n3;

    for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);

        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);

        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);

        n1 += scaled_cosine(zf) * (n2 - n1);

        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;

        if (xf >= 1.0) {
            xi++;
            xf--;
        }
        if (yf >= 1.0) {
            yi++;
            yf--;
        }
        if (zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
};

var noiseDetail = function (lod, falloff) {
    if (lod > 0) {
        perlin_octaves = lod;
    }
    if (falloff > 0) {
        perlin_amp_falloff = falloff;
    }
};

var noiseSeed = function (seed) {
    const lcg = (() => {
        const m = 4294967296;
        const a = 1664525;
        const c = 1013904223;
        let seed,
            z;
        return {
            setSeed(val) {
                z = seed = (
                    val == null
                        ? fxrand() * m
                        : val
                ) >>> 0;
            },
            getSeed() {
                return seed;
            },
            rand() {
                z = (a * z + c) % m;
                return z / m;
            }
        };
    })();

    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = lcg.rand();
    }
};

function subVec(v1, v2) {
    return new myVec(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

function addVec(v1, v2) {
    return new myVec(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

function issamepoint(p1, p2) {
    return p1.dist(p2) < 0.1;
}

function radians(val) {
    return val / 180 * Math.PI;
}

function random(a, b) {
    return map(fxrand(), 0, 1, a, b);
}

function findLineIntersection(u, w, v, z) {
    var uw = subVec(w, u);
    var vz = subVec(z, v);
    var uv = subVec(v, u);
    let beta = uw.angleBetween(vz);
    if (beta < radians(0.1)) 
        return false;
    let alfa = uw.angleBetween(uv);

    var vz_ = subVec(z, v);
    vz_.normalize();
    var mmag = -uv.mag() * sin(alfa) / sin(beta);
    if (mmag < 0 || mmag > vz.mag()) 
        return false;
    vz_.mult(mmag);
    var res = addVec(v, vz_);
    return res;
}

function onSegment(p, q, r) {
    if (q.x <= max(p.x, r.x) && q.x >= min(p.x, r.x) && q.y <= max(p.y, r.y) && q.y >= min(p.y, r.y)) 
        return true;
    
    return false;
}

function triorientation(p, q, r) {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/ for details
    // of below formula.
    var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) 
        return 0; // collinear
    
    return (val > 0)
        ? 1
        : 2; // clock or counterclock wise
}

function doLinesIntersect(p1, q1, p2, q2) {
    // Find the four orientations needed for general and special cases
    var o1 = triorientation(p1, q1, p2);
    var o2 = triorientation(p1, q1, q2);
    var o3 = triorientation(p2, q2, p1);
    var o4 = triorientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4) 
        return true;
    
    // Special Cases p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) 
        return true;
    
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) 
        return true;
    
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) 
        return true;
    
    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) 
        return true;
    
    return false; // Doesn't fall in any of the above cases
}

function isinside(point, poly) {
    let wn = 0;

    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let pi = poly[i];
        let pj = poly[j];

        if (pj.y <= point.y) {
            if (pi.y > point.y) {
                if (isLeft(pj, pi, point) > 0) {
                    wn++;
                }
            }
        } else {
            if (pi.y <= point.y) {
                if (isLeft(pj, pi, point) < 0) {
                    wn--;
                }
            }
        }
    }
    return wn != 0;
};

function isLeft(P0, P1, P2) {
    let res = ((P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y));
    return res;
}

class MyCurve extends THREE.Curve {

	constructor( hobbycurve, offset) {

		super();

		this.hobbycurve = hobbycurve;
		this.offset = offset;
        this.length = this.hobbycurve.length;
        this.dis = 1./(this.length-1.);
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

        var idx1 = Math.floor(t/this.dis);
        var idx2 = idx1+1;
        var p = (t - this.dis*idx1)/this.dis;
        if(isNaN(t)){
            idx1 = this.length-2;
            idx2 = this.length-1;
            p = 1.0;
        }
        else{
            if(t == 1.0){
                idx1 = this.length-2;
                idx2 = this.length-1;
                p = 1.0;
            }
        }

        let p1 = this.hobbycurve[idx1];
        let p2 = this.hobbycurve[idx2];


		const tx = lerp(p1.x, p2.x, p) + this.offset.x;
		const ty = lerp(p1.y, p2.y, p) + this.offset.y;
		const tz = lerp(p1.z, p2.z, p) + this.offset.z;

		return optionalTarget.set( tx, tz, ty );
	}

}

class Tube extends THREE.BufferGeometry {
    constructor(path, tubularSegments = 64, radius = 1, radialSegments = 8, closed = false) {

		super();

		this.type = 'TubeGeometry';

		this.parameters = {
			path: path,
			tubularSegments: tubularSegments,
			radius: radius,
			radialSegments: radialSegments,
			closed: closed
		};
        const frames = path.computeFrenetFrames(tubularSegments, closed);

        // expose internals

        this.tangents = frames.tangents;
        this.normals = frames.normals;
        this.binormals = frames.binormals;

        // helper variables

        const vertex = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const uv = new THREE.Vector2();
        let P = new THREE.Vector3();

        // buffer

        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // create buffer data

        generateBufferData();

        // build geometry

        this.setIndex(indices);
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        // functions

        function generateBufferData() {

            for (let i = 0; i < tubularSegments; i++) {

                generateSegment(i);

            }

            // if the geometry is not closed, generate the last row of vertices and normals
            // at the regular position on the given path
            //
            // if the geometry is closed, duplicate the first row of vertices and normals
            // (uvs will differ)

            generateSegment(
                (closed === false)
                    ? tubularSegments
                    : 0
            );

            // uvs are generated in a separate function. this makes it easy compute correct
            // values for closed geometries

            generateUVs();

            // finally create faces

            generateIndices();

        }

        function generateSegment(i) {

            // we use getPointAt to sample evenly distributed points from the given path

            P = path.getPointAt(i / tubularSegments, P);

            // retrieve corresponding normal and binormal

            const N = frames.normals[i];
            const B = frames.binormals[i];

            // generate normals and vertices for the current segment

            for (let j = 0; j <= radialSegments; j++) {
                let amp = 1;

                if(i <= 40){
                    amp = map(i, 0, 40, 0, 1);
                }
                if(i > tubularSegments-40){
                    amp = map(i, tubularSegments-40, tubularSegments, 1, 0);
                }
                amp = .2 + .8*power(amp, 2);

                const v = j / radialSegments * Math.PI * 2;

                const sin = Math.sin(v);
                const cos = -Math.cos(v);

                // normal

                normal.x = (cos * N.x + sin * B.x);
                normal.y = (cos * N.y + sin * B.y);
                normal.z = (cos * N.z + sin * B.z);
                normal.normalize();

                normals.push(normal.x, normal.y, normal.z);

                // vertex
                let nz = .4 + .6*power(noise(i*0.04, 5583.33), 4);
                let rradius = radius * nz * amp;
                vertex.x = P.x + rradius * normal.x;
                vertex.y = P.y + rradius * normal.y;
                vertex.z = P.z + rradius * normal.z;

                vertices.push(vertex.x, vertex.y, vertex.z);

            }

        }

        function generateIndices() {

            for (let j = 1; j <= tubularSegments; j++) {

                for (let i = 1; i <= radialSegments; i++) {

                    const a = (radialSegments + 1) * (j - 1) + (i - 1);
                    const b = (radialSegments + 1) * j + (i - 1);
                    const c = (radialSegments + 1) * j + i;
                    const d = (radialSegments + 1) * (j - 1) + i;

                    // faces

                    indices.push(a, b, d);
                    indices.push(b, c, d);

                }

            }

        }

        function generateUVs() {

            for (let i = 0; i <= tubularSegments; i++) {

                for (let j = 0; j <= radialSegments; j++) {

                    uv.x = i / tubularSegments;
                    uv.y = j / radialSegments;

                    uvs.push(uv.x, uv.y);

                }

            }

        }
    }
    
	toJSON() {

		const data = super.toJSON();

		data.path = this.parameters.path.toJSON();

		return data;

	}

	static fromJSON( data ) {

		// This only works for built-in curves (e.g. CatmullRomCurve3).
		// User defined curves or instances of CurvePath will not be deserialized.
		return new TubeGeometry(
			new Curves[ data.path.type ]().fromJSON( data.path ),
			data.tubularSegments,
			data.radius,
			data.radialSegments,
			data.closed
		);

	}
}



function getCompositionImpl() {
    var rulelevel = 8;
    var s = 'sqrt((x-0.5)*(x-0.5))';
    s = 'x*y';
    var rules = [];
    for (var k = 0; k < 15; k++) {
        var r1 = random(1, 10);
        var r2 = random(1, 10);
        var r3 = random(.1, 3.);
        var r4 = random(.1, 3.);
        var r5 = Math.round(random(3, 10))*1.000001;
        var r6 = Math.round(random(3, 10)) * 1.000001;
        var r7 = random(3, 10);
        var r8 = random(2, 100);
        var r9 = random(2, 100);
        var trules = [
            `(mod(x, y))`,
            `(mod(y, x))`,
            `(x+y+uTime*0.0003)`,
            `(x*y+uTime*0.0003)`,
            `(1.-x+uTime*0.0003)`,
            `(1.-y+uTime*0.0003)`,
            `(.5 + .5*sin(${r1}*x + uTime*0.003))`,
            `(.5 + .5*sin(${r2}*y + uTime*0.003))`,
            `(pow(x, ${r3})+uTime*0.0003)`,
            `(pow(y, ${r4}))`,
            `(1.-x+uTime*0.0003)`,
            `(1.-y+uTime*0.0003)`,
            `(1./y)`,
            `(1./x)`,
            `(fbm(vec2(x*11. + uTime*0.0003, x*1. + uTime*0.0003)))`,
            `(fbm(vec2(y*11. + uTime*0.0003, y*1. + uTime*0.0003)))`,
        ]
        var trul2es = [
            `(x+y)`,
            `(x*y)`,
            `(fbm(vec2(x*${r7} + uTime*0.0003, y*${r4} + uTime*0.0003+${r5})))`,
        ]
       
        rules = rules.concat(trules);
    }

    for (var k = 0; k < rulelevel; k++) {
        var rrules = rules;
        var ns = '';
        for (var i = 0; i < s.length; i++) {
            if (s[i] == 'x' || s[i] == 'y') {
                var chc = Math.floor(random(0, rrules.length));
                while (!rrules[chc].includes(s[i])) {
                    chc = Math.floor(random(0, rrules.length));
                }
                ns += rrules[chc]
            }
            else {
                ns += s[i];
            }
        }
        s = ns;
    }

    return s;
}

function getComposition() {
    let  avgr = 0;
    let  avgd = 0;
    let  maxd = 0;
    let  sum = 0;
    let zas = true;
    let  comp = '';
    //while((maxd < .2 || avgd < .2 || avgr < .2) || zas || sum == 0){
    while (sum < .1 || maxd < .01 || isNaN(maxd)) {
        zas = false;
        comp = getCompositionImpl();
        return comp;
        var vals = [];
        maxd = 0;
        var nn = 5;
        for (var j = 0; j < nn; j++) {
            for (var i = 0; i < Math.round(nn * resx / resy); i++) {
                var X = ((i) % nn + 1) / nn;
                var Y = ((j) % nn + 1) / nn * resy / resx;
                //rez = (eval(comp) + 0.)%1;

                rez = Math.round(eval(comp) * 100);
                if (isNaN(rez))
                    zas = true;
                vals.push(rez);
            }
        }
        sum = 0;
        for (var k = 0; k < vals.length; k++) {
            if (!isNaN(vals[k]) && isFinite(vals[k]))
                sum += vals[k];
        }
        avgr = sum / vals.length;

        var sumd = 0;
        for (var k = 0; k < vals.length; k++) {
            sumd += abs(vals[k] - avgr);
            maxd = max(maxd, abs(vals[k] - avgr));
        }
        avgd = sumd / vals.length;
        //print('hello')

    }
    return comp;
}