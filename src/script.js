import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import vertexGalaxyShaders from "./shaders/galaxy/vertex.glsl"
import fragmentGalaxyShaders from "./shaders/galaxy/fragment.glsl"

import sunTexture from "./sun.jpg"
import mercuryTexture from "./mercury.jpg"


// import { checkRayIntersections, getMouseVector2 } from './RayCastHelper.js'camera



// console.log(vertexGalaxyShaders);
// console.log(fragmentGalaxyShaders)
/**
 * Base
 */
// Debug
const gui = new GUI();


const gaga = document.querySelector(".lil-gui");
gaga.style.display = "none";
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 200000;
parameters.size = 0.005;
parameters.radius = 5;
parameters.branches = 12;
parameters.spin = 1;
parameters.randomness = 0.254;
parameters.randomnessPower = 3.362;
parameters.insideColor = "#fbe550";
parameters.outsideColor = "#3874ff";


let geometry = null;
let material = null;
let points = null;

var sun = null;
var mercury = null;
var boxex = null;

var not_mango_pie =null;
// var zoomx =  null;
// var zoomy =  null;
// var zoomz =  null;


const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

      const spin = radius * parameters.spin;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *parameters.randomness *radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle) * radius + randomZ;

    // Color
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * solar System object link
  */
  boxex = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();

  const sunGeo = new THREE.SphereGeometry( 0.001, 32, 16 ); 
  const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
  })

  sun = new THREE.Mesh(sunGeo, sunMat);
  boxex.add(sun)
  scene.add(boxex)


  const mercuryGeo = new THREE.SphereGeometry( 0.04, 32, 16 ); 
  const mercuryMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture)
  })
  
  mercury = new THREE.Mesh(mercuryGeo,mercuryMat);
  mercury.name="kakaak"
  const label = document.createElement('div');
  label.className = 'planet-label';
  label.innerHTML = mercury.name;
  sun.add(mercury)
  mercury.position.x = 1.5;

  mercury.userData = { URL: "http://youtube.com"};



  /**
   * Material
   */





  material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    vertexShader: vertexGalaxyShaders,
    fragmentShader: fragmentGalaxyShaders,
    uniforms:{
      uTime:{value: 30},
    },
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(-12)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
  gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);



/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// window.addEventListener("resize", () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;vector

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

var zoomx= camera.position.x
var zoomy=  camera.position.y
var zoomz=  camera.position.z


var camera_vector = new THREE.Vector3(3,3,3);



//stars

// const starGeometry = new THREE.BufferGeometry();
// const StarPos = new Float32Array(parameters.count*3);camera

// for (let i =0;i<parameters.count * 3; i++){
//   StarPos[i] = Math.random() -0.5;
// }

// starGeometry.setAttribute("position", new THREE.BufferAttribute(StarPos,3))
// const pointts = new THREE.Points(
//   starGeometry,
//   new THREE.PointsMaterial ({ size:0.001, sizeAttenuation:true})
// );
// scene.add(pointts)

// const dir = new THREE.Vector3( -1, -2, -1 );

// //normalize the direction vector (convert to vector of length 1)
// dir.normalize();

// const origin = new THREE.Vector3( 0, 0, 0 );
// const length = 1;
// const hex = 0xffff00;
// const headLength = 2; 
// const headWidth = 2; 

// const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex);
// scene.add( arrowHelper );


let mousePointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

//Add listener to call onMouseMove every time the mouse moves in the browser window
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseclick, false);


function onMouseclick(event){
  mousePointer = getMouseVector2(event, window);

  const getFirstValue = true;

  if( event.clientX > toScreenPosition(mercury,camera).x*2-10 && 
      event.clientX < toScreenPosition(mercury,camera).x*2+10 && 
      event.clientY > toScreenPosition(mercury,camera).y*2-10 &&
      event.clientY < toScreenPosition(mercury,camera).y*2+10
    ){
      const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);
      console.log("INtersection array1111111111111111111111111111111111111111111111111111111: ", intersections)
        console.log("Mouse is being clicked ")

        
        
        // function zoom_effect (){
          // var zoomx =   camera.position.x;
          // var zoomy =  camera.position.y; 
          // var zoomz =   camera.position.y;
          zoomx = 3
          zoomy = 3
          zoomz = 3


          // if(zoomx < 3)


        not_mango_pie = setInterval(mango_pie, 20)

       

        function stop_the_reset (){
          clearInterval(not_mango_pie);
               }
        
        setTimeout(start_zooming,2500);
        var apple = null
        function start_zooming(){
        apple = setInterval(apple_pie, 6)
        }
        function stop_the_zoom (){
          clearInterval(apple)
        }

        setTimeout(stop_the_reset,2500);

        setTimeout(stop_the_zoom,4250);


        function open_Solar_Sys(){
        window.location.href = "./Solar_System.html"
        }
        setTimeout(open_Solar_Sys,4251 )
    }


  
  // const cardList = getCardObjects(intersections);
  // flipCards(cardList, flippedCardsList);solar



}
function mango_pie(){
  camera.position.lerp(camera_vector,0.04)

}

        
function apple_pie() {
  

  camera.position.x = zoomx;
  camera.position.y = zoomy;
  camera.position.z = zoomz;

  console.log("  camera.position.x",  camera.position.x)
  console.log("  camera.position.y",  camera.position.z)
  console.log("  camera.position.z",  camera.position.z)
  zoomx = zoomx -0.01
  zoomy = zoomy -0.01
  zoomz = zoomz -0.01


  console.log("22222222222222222222222222222222222222222222222222222222camera.position.x = zoom")

}


//A function to be called every time the mouse moves
function onMouseMove(event) {
  mousePointer = getMouseVector2(event, window);


  // console.log("event.clientX2:",event.clientX)
  // console.log("event.clientY2:",event.clientY)
  // console.log("window.innerWidth2:",window.innerWidth*(40/100))
  // console.log("window.innerHeight2:",window.innerHeight*(40/100))
  // console.log("window.innerWidth3:",window.innerWidth)
  // console.log("window.innerHeight3:",window.innerHeight)

  const getFirstValue = true;


  console.log("  camera.position.x",  camera.position.x)
  console.log("  camera.position.y",  camera.position.z)
  console.log("  camera.position.z",  camera.position.z)

  // console.log("event.clientX:", event.clientX)
  // console.log("position of merccury x*2 ",toScreenPosition(mercury,camera).x*2)
  // console.log("position of merccury x*2-100 ",toScreenPosition(mercury,camera).x*2-100)
  // console.log("position of mercury x*2+100 ",toScreenPosition(mercury,camera).x*2+100)

  // console.log("event.clientY:", event.clientY)
  // console.log("position of merccury y*2 ",toScreenPosition(mercury,camera).y*2)
  // console.log("position of merccury y*2-100 ",toScreenPosition(mercury,camera).y*2-100)
  // console.log("position of merccury y*2+100 ",toScreenPosition(mercury,camera).y*2+100).html



  if( event.clientX > toScreenPosition(mercury,camera).x*2-10 && 
      event.clientX < toScreenPosition(mercury,camera).x*2+10 && 
      event.clientY > toScreenPosition(mercury,camera).y*2-10 &&
      event.clientY < toScreenPosition(mercury,camera).y*2+10
    ){
      const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);
      console.log("INtersection array1111111111111111111111111111111111111111111111111111111: ", intersections)
      if(intersections.length>0){
        const selectedObject = intersections[0].object;
        const color = new THREE.Color(Math.random(),Math.random(),Math.random())
        selectedObject.material.color = color;
  
        // // console.log()
        // mercury = new THREE.Mesh(new THREE.SphereGeometry( 0.05, 32, 16 ) );
    }
    }

    
  
  // const cardList = getCardObjects(intersections);
  // flipCards(cardList, flippedCardsList);

  console.log("Mouse is being hover ")
}





// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


//this is to disable the right click mouse control feature
controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*(window.innerWidth/2);
    var heightHalf = 0.5*(window.innerHeight/2);

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };

};
function getMouseVector2(event, window){
    let mousePointer = new THREE.Vector2()

    if (event.clientX)


    mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // console.log("event.clientX:",event.clientX*0.1)
    // console.log("event.clientY:",event.clientY*0.1)
    // console.log("window.innerWidth:",window.innerWidth)
    // console.log("window.innerHeight:",window.innerHeight)
    return mousePointer;
}

function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue) {
  raycaster.setFromCamera(mousePointer, camera);

  let intersections = raycaster.intersectObjects(boxex.children, true);
  


  return intersections;
}
  //name of solarsystem
  const solor_click = document.getElementById("solarSystem")
  const canva = document.querySelector("canvas")
  const boxPosition = new THREE.Vector3();


  const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  material.uniforms.uTime.value = elapsedTime+500;



  // const worldPosition = new THREE.Vector3();
  // console.log("position of mercury:",mercury.getWorldPosition(worldPosition))

  // window.innerWidth/2
  // window.innerHeight/2

  // // var vector = new THREE.Vector3
  // var projector = new THREE.Projector()
  // projector.projectorVector(mercury.getWorldPosition(worldPosition).setFromMatrixPosition(objectDirection.matrixWorld), camera)
  // mercury.getWorldPosition(worldPosition).x = (mercury.getWorldPosition(worldPosition).)


  //solarsystem name
  if(mercury){
    boxPosition.setFromMatrixPosition(mercury.matrixWorld);
    boxPosition.project(camera)
    var widthHalf = canva.width/2
    var heightHalf = canva.height/2 
    boxPosition.x = (boxPosition.x * widthHalf)+ widthHalf;
    boxPosition.y = -(boxPosition.y * heightHalf)+ heightHalf;
    solor_click.style.top = `${toScreenPosition(mercury,camera).y*2-74}px`;
    solor_click.style.left = `${toScreenPosition(mercury,camera).x*2-16}px`;


  }

  // Update controls
  controls.update();

  // Render
  sun.rotateY(-0.0004)

  renderer.render(scene, camera);


  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
