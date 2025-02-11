import * as THREE from 'three';

export function getMouseVector2(event, window){
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

export function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue) {
    raycaster.setFromCamera(mousePointer, camera);

    let intersections = raycaster.intersectObjects(boxex.children, true);
    
    // if(intersections.length>0){
    //     console.log(intersections)
    // }

    return intersections;
}