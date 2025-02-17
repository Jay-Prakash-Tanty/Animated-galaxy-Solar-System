import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from './orbitcontrols.js';

const scene = new THREE.Scene();

// Define the camera and set its initial position at an angle
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(150, 150, 150);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

// Create the Sun
let sun;
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
textureLoader.load('./sun.jpg', (texture) => {
  const sunMaterial = new THREE.MeshPhongMaterial({
    map: texture,
    emissive: 0xFFFF00,
    emissiveIntensity: 0.1,
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);
});

// Planet data (size, distance, texture path, name, description)
const planetData = [
  { size: 0.4, distance: 3, texture: './mercury.jpg', name: "Mercury", description: "The smallest planet in the Solar System." },
  { size: 0.6, distance: 5, texture: './venus.jpg', name: "Venus", description: "Venus is the second planet from the Sun and has a thick atmosphere." },
  { size: 0.8, distance: 7, texture: './earth.jpg', name: "Earth", description: "Our home planet, the third from the Sun." },
  { size: 0.7, distance: 9, texture: './mars.jpg', name: "Mars", description: "Known as the Red Planet, it's the fourth from the Sun." },
  { size: 1.2, distance: 12, texture: './jupiter.jpg', name: "Jupiter", description: "The largest planet in the Solar System." },
  { size: 1, distance: 16, texture: './saturn.jpg', name: "Saturn", description: "Famous for its beautiful ring system." },
  { size: 0.9, distance: 20, texture: './uranus.jpg', name: "Uranus", description: "A gas giant with a tilted axis." },
  { size: 0.9, distance: 24, texture: './neptune.jpg', name: "Neptune", description: "The farthest planet from the Sun." },
  { size: 0.6, distance: 30, texture: './pluto.jpg', name: "Pluto", description: "A dwarf planet located at the edge of the Solar System." },
];

// Sort planetData based on distance to ensure they load in the correct order
planetData.sort((a, b) => a.distance - b.distance);

const planets = [];
const orbits = [];
const planetLabels = [];
let orbiting = true;

var planetsLoaded = 0;
console.log("mango")
// Modify the planet creation code
const planetPromises = planetData.map((data, index) => {
  return new Promise((resolve) => {
    console.log(`${index}how many times is this run`,`${planetsLoaded}`,`distance:${data.distance}`,`${data.name}`)
    planetsLoaded++
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    textureLoader.load(data.texture, (texture) => {
      const planetMaterial = new THREE.MeshPhongMaterial({ map: texture, shininess: 10 });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      planet.name = data.name;
      planet.description = data.description;
      planet.orbiting = true;
      planet.angle = Math.random() * Math.PI * 2;
      planet.number = index;
      scene.add(planet);
      planets.push(planet);

      // Create orbit path for each planet
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5, transparent: true });
      const orbitPoints = [];
      const numPoints = 100;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(data.distance * Math.cos(angle), 0, data.distance * Math.sin(angle)));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
      orbits.push(orbitLine);

      // Create clickable labels for each planet
      const label = document.createElement('div');
      label.className = 'planet-label';
      label.innerHTML = data.name;
      label.style.position = 'absolute';
      label.style.color = 'white';
      label.style.fontSize = '18px';
      label.style.pointerEvents = 'none';
      document.body.appendChild(label);
      
      planetLabels.push({ label: label, planet: planet });

      resolve();  // Resolve the promise once the planet is created and added to the scene

    });
  });
});

// Wait for all promises to resolve before starting animation
Promise.all(planetPromises).then(() => {
  animate();
});

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(5, 5, 5).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-5, -5, -5).normalize();
scene.add(directionalLight2);

// Initialize OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.minDistance = 50;
controls.maxDistance = 2000;

// Resize event listener to keep the canvas responsive
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Raycaster for planet selection and hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Hover effect container (will be used to show planet details)
const infoBox = document.createElement('div');
infoBox.style.position = 'absolute';
infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoBox.style.color = 'white';
infoBox.style.padding = '10px';
infoBox.style.borderRadius = '5px';
infoBox.style.display = 'none';
document.body.appendChild(infoBox);

// Function to get the intersected planet using raycasting
function getIntersectingPlanet() {
  return raycaster.intersectObjects(planets);
}

// Mouse move event listener for hovering
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = getIntersectingPlanet();
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const planetDataItem = planetData.find(p => p.name === planet.name);

    // Show the information box with planet details
    infoBox.style.display = 'block';
    infoBox.style.left = `${event.clientX + 10}px`;
    infoBox.style.top = `${event.clientY + 10}px`;
    infoBox.innerHTML = `
      <strong>${planetDataItem.name}</strong><br>
      ${planetDataItem.description}<br>
      <a href="#" onclick="window.open('${planetDataItem.name.toLowerCase()}.html', '_self')">See More</a>
    `;
  } else {
    infoBox.style.display = 'none';
  }
});

// Mouse click event listener for planet selection
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = getIntersectingPlanet();
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const planetDataItem = planetData.find(p => p.name === planet.name);

    // Remove the infoBox
    infoBox.style.display = 'none';

    // Redirect to the planet's HTML page
    window.location.href = `${planetDataItem.name.toLowerCase()}.html`;
  }
});

// Stars generation function
function generateStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const starCount = 10000;
  const positions = [];
  for (let i = 0; i < starCount; i++) {
    positions.push(Math.random() * 8000 - 4000);
    positions.push(Math.random() * 8000 - 4000);
    positions.push(Math.random() * 8000 - 4000);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// Call the generateStars function
generateStars();

// Custom "Move Camera Up" and "Move Camera Down" buttons with previous style
const moveUpButton = document.createElement('button');
moveUpButton.innerHTML = 'Move Camera Up';
moveUpButton.style.position = 'absolute';
moveUpButton.style.top = '10px';
moveUpButton.style.left = '10px';
moveUpButton.style.padding = '12px 20px';
moveUpButton.style.backgroundColor = 'transparent';
moveUpButton.style.color = 'white';
moveUpButton.style.border = '1px solid white';
moveUpButton.style.borderRadius = '0px';
moveUpButton.style.cursor = 'pointer';
moveUpButton.style.fontSize = '16px';
moveUpButton.style.transition = 'background-color 0.3s ease';
document.body.appendChild(moveUpButton);

const moveDownButton = document.createElement('button');
moveDownButton.innerHTML = 'Move Camera Down';
moveDownButton.style.position = 'absolute';
moveDownButton.style.top = '60px';
moveDownButton.style.left = '10px';
moveDownButton.style.padding = '12px 20px';
moveDownButton.style.backgroundColor = 'transparent';
moveDownButton.style.color = 'white';
moveDownButton.style.border = '1px solid white';
moveDownButton.style.borderRadius = '0px';
moveDownButton.style.cursor = 'pointer';
moveDownButton.style.fontSize = '16px';
moveDownButton.style.transition = 'background-color 0.3s ease';
document.body.appendChild(moveDownButton);

// Add hover animation to buttons
moveUpButton.addEventListener('mouseover', () => {
  moveUpButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
});

moveUpButton.addEventListener('mouseout', () => {
  moveUpButton.style.backgroundColor = 'transparent';
});

moveDownButton.addEventListener('mouseover', () => {
  moveDownButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
});

moveDownButton.addEventListener('mouseout', () => {
  moveDownButton.style.backgroundColor = 'transparent';
});

// Camera move step
let cameraY = camera.position.y;
const cameraMoveStep = 5;

// Button event listeners for moving the camera up and down
moveUpButton.addEventListener('click', () => moveCameraToY(camera.position.y + cameraMoveStep));
moveDownButton.addEventListener('click', () => moveCameraToY(camera.position.y - cameraMoveStep));

// Interpolating camera movement for smooth transition
function moveCameraToY(newY) {
  const duration = 500; // Duration in ms
  const startY = camera.position.y;
  const distance = newY - startY;
  let startTime;

  function animateMove(time) {
    if (!startTime) startTime = time;
    const progress = (time - startTime) / duration;
    if (progress < 1) {
      camera.position.y = startY + progress * distance;
      requestAnimationFrame(animateMove);
    } else {
      camera.position.y = newY;
    }
    controls.update();
  }

  requestAnimationFrame(animateMove);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate planets around the sun based on their angle and distance
  if (orbiting) {
    planets.forEach((planet, index) => {
      planet.angle += 0.0001 * (index + 1);
      // const distance = planetData[index].distance;
      let distance = 0
      if( planet.number == 0){
        distance = 3  
      }
      else if( planet.number == 1){
        distance = 5  
      }
      else if( planet.number == 2){
        distance = 7  
      }
      else if( planet.number == 3){
        distance = 9 
      }
      else if( planet.number == 4){
        distance = 12 
      }
      else if( planet.number == 5){
        distance = 16 
      }
      else if( planet.number == 6){
        distance = 20 
      }
      else if( planet.number == 7){
        distance = 24  
      }
      else if( planet.number == 8){
        distance = 30
      }
      
      // console.log(`planet:${planet.name}`,`planet_index:${planet.number}`,`index:${index}`,"how many times is this loadededis my question??")
      // console.log(`distance of planet::${distance}`)
      planet.position.x = distance * Math.cos(planet.angle);
      planet.position.z = distance * Math.sin(planet.angle);
    });
  }

  // Update labels' position to follow planets
  planetLabels.forEach(({ label, planet }) => {
    const labelPosition = new THREE.Vector3(planet.position.x, planet.position.y + 2, planet.position.z);
    labelPosition.project(camera);
    label.style.left = `${(labelPosition.x + 1) * window.innerWidth / 2}px`;
    label.style.top = `${(-(labelPosition.y - 1) * window.innerHeight / 2)}px`;
  });

  // Update controls and render scene
  controls.update();
  renderer.render(scene, camera);
}

// Create Rings around Saturn and Jupiter
function createRing(planet, radius, innerRadius, outerRadius, texturePath) {
  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  textureLoader.load(texturePath, (texture) => {
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Align the ring horizontally
    ring.position.set(planet.position.x, planet.position.y, planet.position.z);
    scene.add(ring);
  });
}

// Add rings to Saturn and Jupiter
createRing(planets[5], 16, 14, 18, './saturn_ring.png'); // Saturn rings
createRing(planets[4], 12, 10, 14, './jupiter_ring.png'); // Jupiter rings

// Create the Asteroid Belt between Mars and Jupiter
function createAsteroidBelt() {
  const asteroidGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const asteroidMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  const asteroidBelt = [];

  for (let i = 0; i < 150; i++) { // Reduced the number of asteroids for a less crowded belt
    const distance = Math.random() * (12 - 9) + 9; // Narrowed the asteroid belt width
    const angle = Math.random() * Math.PI * 2;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(x, Math.random() * 2 - 1, z);
    asteroidBelt.push(asteroid);
    scene.add(asteroid);
  }
}

// Create Asteroid Belt
createAsteroidBelt();