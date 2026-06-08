import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as satellite from 'satellite.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mapRanges } from "./helper-functions.js"; 



async function main() {
    const response = await fetch("./all-satellites.json");
    const satellite_objs = await response.json();
    console.log(satellite_objs.length)   
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const camera_max_range = 1000;

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, camera_max_range);
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    const camera_controls = new OrbitControls(camera, renderer.domElement);
    // the point that the camera will rotate around
    camera_controls.target.set(0, 0, 0);

    const scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 10;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(20, 5, 50);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const amb_intensity = 0.1;
    const amb_light = new THREE.AmbientLight(color, amb_intensity);
    scene.add(amb_light);

    //got this example from https://tonejs.github.io/docs/r11/PolySynth
    //but I had to adapt it to new API 
    //a polysynth composed of 6 Voices of Synth
    //var synth = new Tone.PolySynth(Tone.Synth).toDestination(); //toMaster deprecated

    //set the attributes using the set interface (changed to accept objects now)
    // synth.set({
    //     "detune": -1200,
        
    // });
    
    // don't play audio until user has clicked the play audio button
    // let audio_button = document.querySelector(".audio-button");
    // audio_button.addEventListener("click", async () => {
    //     await Tone.start();
    //     console.log("Audio may now be played");
    //     synth.triggerAttack(["G4", "A4", "B4", "D4", "E4"]);
    // })

    // make a sphere for earth
    const loader = new GLTFLoader();
    let earth;

    // code here adapted from https://threejs.org/manual/#en/loading-3d-models
    loader.load( "./earth-model.glb", function (gltf) {
        earth = gltf.scene;
        earth.scale.set(0.02, 0.02, 0.02);
        earth.rotation.x = THREE.MathUtils.degToRad(23.4) // earths tilt, i applied it to x as y and z didnt look correct to me
        scene.add(earth);
        }, undefined, function (error) {
            console.error(error);
        });
    
    // const earth_radius = 10; // in "scene units" (i made that up but it makes sense to me that way)

    // const earth_geometry = new THREE.SphereGeometry(earth_radius, 100, 100);
    // const earth_material = new THREE.MeshPhongMaterial({color: 'blue'});

    // const earth_sphere = new THREE.Mesh(earth_geometry, earth_material);

    // scene.add(earth_sphere)

    // use this scale to convert km above earth's center to scene units for satellite positions
    
    const SCALE_KM_TO_SCENE_UNITS = 10 / 6371; //scene units aren't really, its just my way of conceptualising

    // create a list of all satellite records
    let sat_recs = []
    let sat_ages = []
    let oldest_sat_age = 0;
    let current_time = new Date();

    for (const satellite_obj of satellite_objs) {
        const sat_record = satellite.twoline2satrec(satellite_obj.TLE_LINE1, satellite_obj.TLE_LINE2);
        sat_recs.push(sat_record);

        //calculate ages of each satellite
        const sat_launch_date = new Date(satellite_obj.LAUNCH_DATE);
        const sat_age = current_time - sat_launch_date;
        if (sat_age > oldest_sat_age) {oldest_sat_age = sat_age;}
        sat_ages.push(sat_age);
    }

    // console.log(satellite.propagate(sat_recs[0], new Date()));

    // use instancedmesh to allow for thousands of the same shape to be used
    const num_of_sats = satellite_objs.length;
    const sat_geometry = new THREE.SphereGeometry(0.04,8,8);
    const sat_material = new THREE.MeshPhongMaterial({color:"white"});
    const sat_mesh = new THREE.InstancedMesh(sat_geometry, sat_material, num_of_sats);
    scene.add(sat_mesh);

    // create matrix to apply transformations to each instanced mesh
    const matrix = new THREE.Matrix4();
    
    function animate(time) {
        camera_controls.update();
        if (earth) {earth.rotation.y += 0.001;} // check to make sure earth model exists
        else {return} // prevents anything from rendering until 3d model finished loading
        
        renderer.render( scene, camera );

        for (let i = 0; i < sat_recs.length; i++) {
            const propagated_sat = satellite.propagate(sat_recs[i], current_time);
            
            // was getting error of null propagated_sat so added this check to prevent trying to access position of null values
            if (!propagated_sat || !propagated_sat.position) { continue }; 

            const x = propagated_sat.position.x * SCALE_KM_TO_SCENE_UNITS;
            const y = propagated_sat.position.y * SCALE_KM_TO_SCENE_UNITS;
            const z = propagated_sat.position.z * SCALE_KM_TO_SCENE_UNITS;

            matrix.makeTranslation(x,y,z);

            sat_mesh.setMatrixAt(i, matrix);

            // convert satellite age to hue in HSL. From green to red
            // have to divide 120 by 360 as hue needs to be in range 0-1
            const hue = mapRanges(sat_ages[i], 0, oldest_sat_age, 120/360, 0);  
            let sat_colour = new THREE.Color();
            sat_colour.setHSL(hue, 1, 0.5);
            sat_mesh.setColorAt(i, sat_colour);
    }

    sat_mesh.instanceMatrix.needsUpdate = true;
    sat_mesh.instanceColor.needsUpdate = true;

    current_time = new Date(current_time.getTime() + 1000);
    }

    renderer.setAnimationLoop(animate);
}
main();