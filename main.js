import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as satellite from 'satellite.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as Tone from "tone";



async function main() {
    const response = await fetch("./all-satellites.json");
    const satellite_objs = await response.json();   
    
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

    // https://tonejs.github.io/docs/15.1.22/classes/Oscillator.html
    const osc = new Tone.Oscillator(440, "sawtooth4").toDestination();
    osc.volume.value = -40;

    // don't play audio until user has clicked the play audio button
    let audio_button = document.querySelector(".audio-button");
    audio_button.addEventListener("click", async () => {
        await Tone.start();
        console.log("Audio may now be played");
        osc.start();
    })

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
    const EARTH_RADIUS = 6371;
    const SCALE_KM_TO_SCENE_UNITS = 10 / EARTH_RADIUS;

    // create a list of all satellite records
    let sat_recs = []
    for (const satellite_obj of satellite_objs) {
        const sat_record = satellite.twoline2satrec(satellite_obj.TLE_LINE1, satellite_obj.TLE_LINE2);
        sat_recs.push(sat_record);
    }

    // console.log(satellite.propagate(sat_recs[0], new Date()));

    // use instancedmesh to allow for thousands of the same shape to be used
    const num_of_sats = satellite_objs.length;
    const sat_geometry = new THREE.SphereGeometry(0.04,8,8);
    const sat_material = new THREE.MeshPhongMaterial({color:"red"});
    const sat_mesh = new THREE.InstancedMesh(sat_geometry, sat_material, num_of_sats);
    scene.add(sat_mesh);

    // create matrix to apply transformations to each instanced mesh
    const matrix = new THREE.Matrix4();
    let current_time = new Date();
    
    function animate(time) {
        camera_controls.update();
        if (earth) {earth.rotation.y += 0.001;} // check to make sure earth model exists
        else {return} // prevents anything from rendering until 3d model finished loading
        
        renderer.render( scene, camera );

        let average_altitude = 0;

        for (let i = 0; i < sat_recs.length; i++) {
            const propagated_sat = satellite.propagate(sat_recs[i], current_time);
            
            // was getting error of null propagated_sat so added this check to prevent trying to access position of null values
            if (!propagated_sat || !propagated_sat.position) { continue }; 

            let x = propagated_sat.position.x * SCALE_KM_TO_SCENE_UNITS;
            let y = propagated_sat.position.y * SCALE_KM_TO_SCENE_UNITS;
            let z = propagated_sat.position.z * SCALE_KM_TO_SCENE_UNITS;

            matrix.makeTranslation(x,y,z);

            sat_mesh.setMatrixAt(i, matrix);

            // calculate altitude
            const distance_from_center = Math.sqrt(
                (propagated_sat.position.x ** 2) + (propagated_sat.position.y ** 2) + (propagated_sat.position.z ** 2)
            )
            if (i == 0) {average_altitude = (distance_from_center - EARTH_RADIUS) / 4;}
            
        };
        console.log(average_altitude);
        osc.frequency.value = average_altitude;

        sat_mesh.instanceMatrix.needsUpdate = true;
        current_time = new Date(current_time.getTime() + 1000);
    }
    renderer.setAnimationLoop(animate);
}
main();