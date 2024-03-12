import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {gsap} from 'gsap'

let height, width, color, carModel;
width = window.innerWidth
height = window.innerHeight
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 30, width / height , 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( width, height );
renderer.shadowMap.enabled = true
document.getElementById("three").
appendChild( renderer.domElement );
const colors = document.querySelectorAll('.color')
const selectColor = (color)=>{
    switch(color){
        case "white":
        return {r:1,g:1,b:1}
        break
        case "red":
        return {r:1,g:0,b:0}
        break
        case "blue":
        return {r: 0, g: 0, b: .9}
        break
        case "orange":
        return {r: 1, g: 0.3, b: 0}
        break
        case "black":
        return {r:0,g:0,b:0}
        break
    }
}
colors.forEach(el=>{
    console.log(el)
    el.addEventListener('click',(e)=>{
        color = e.target.id
        color = selectColor(color)
         carModel.traverse((node)=>{
        if(node.isMesh){
            console.log(node.name)
            let name = node.name.split('_')
            if(name[1] === "CarpaintMain-material"){
                gsap.to(node.material.color,{duration:2, r:color.r,g:color.g,b:color.b, ease:"sine.out"})
                // node.material.color.set(color)
            }
        }
    })
    })
})
// lighting
const light = new THREE.AmbientLight( 0xcccccc );
scene.add( light );

const spotLight = new THREE.SpotLight(0xffffff, 60)
spotLight.angle = Math.PI
spotLight.penumbra = 0.2
spotLight.position.set(5, 3, 5)
spotLight.castShadow = true
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 30
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
scene.add(spotLight)

const dirLight = new THREE.DirectionalLight(0x55505a, 3)
dirLight.position.set(0, 5 , 0)
dirLight.castShadow = true;
dirLight.shadow.camera.right = 1
dirLight.shadow.camera.right = -10
dirLight.shadow.camera.top = 1
dirLight.shadow.camera.bottom = -10
dirLight.shadow.mapSize.width = 1024
dirLight.shadow.mapSize.height = 1024
scene.add(dirLight)

scene.background = new THREE.Color("rgb(29,30,35)")
camera.position.set(0,-0.2, 0)
camera.lookAt(0,0,0)
// loading models
let loadingIndicator = document.querySelector('.ld-ripple-container') 
let loadingProgress = document.querySelector('.progress')
const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    loadingProgress.innerText = "0%"
};

manager.onLoad = function ( ) {
    loadingIndicator.style.display = "none"
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( Math.floor((itemsLoaded/itemsTotal) * 100) + "%")
    loadingProgress.innerText = Math.floor((itemsLoaded/itemsTotal) * 100) + "%"
};

manager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};

const loader = new GLTFLoader(manager)
// set the ground
const planeGeo = new THREE.PlaneGeometry(100,100)
const planetex = new THREE.TextureLoader().load('/studio_v1_for_car/textures/TilesSlateSquare001_2K_baseColor.png')
planetex.wrapS = THREE.RepeatWrapping
planetex.wrapT = THREE.RepeatWrapping
planetex.repeat.set(20,50)
const planeMat = new THREE.MeshPhongMaterial({map: planetex})
planetex.encoding = THREE.sRGBEncoding
const mesh = new THREE.Mesh(planeGeo, planeMat)
mesh.rotation.x = - Math.PI / 2
mesh.rotation.z = 2
mesh.receiveShadow = true
mesh.position.set(0, 0.05, 0)
scene.add(mesh)
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDaming = true
controls.screenPanning = false
controls.minDistance = 9
controls.maxDistance = 14

// limit vertical rotation
controls.minPolarAngle = Math.PI / 4
controls.maxPolarAngle = Math.PI / 2
controls.rotateSpeed = 0.4

//add animatiobns
const info = document.querySelector('.info')
const specs = document.querySelector('.specs')
controls.addEventListener("start",()=>{
    gsap.to(info,{duration:0.5, x:-100, opacity:0})
    gsap.to(colors,{duration: 0.7, opacity:0})
    gsap.to(specs,{duration:0.6, y:100, opacity:0})
})

controls.addEventListener("end",()=>{
    gsap.to(info,{duration:0.5, x:0, opacity:1})
    gsap.to(colors,{duration: 0.7, opacity:1})
    gsap.to(specs,{duration:0.6, y:0, opacity:1})
})
// garage
loader.load("/studio_v1_for_car/scene.gltf", (gltf)=>{
    const model = gltf.scene
    model.position.set(0,0,0);
    model.rotation.set(0 , 2 ,0)
    model.scale.set(5, 2.5, 2)
    model.receiveShadow = true
    scene.add(model)
})

// load the car model
loader.load('/free_-_high_quality_lamborghini_revuelto/scene.gltf',(gltf)=>{
    const model = gltf.scene
   carModel = model
    model.position.set(0, 0.13 , 2)
    model.rotation.set(0, 2.1, 0)
    model.scale.set(1.3,1.3,1.3)
    model.castShadow = true
    controls.target.copy(model.position)
    scene.add(model)
})

function animate() {
	requestAnimationFrame( animate );
    controls.update()
	renderer.render( scene, camera );
}

window.onresize = function(){
    camera.aspect = window.innerWidth/ window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(widow.innerWidth, window.innerheight)
}
animate();
