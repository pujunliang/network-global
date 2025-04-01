<template>
    <div
        ref="containerRef"
        class="container"></div>
</template>

<script setup lang="ts" name="main">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted, ref, reactive, toRefs } from "vue";
import Global from "./global";
import Label from "./label";
import Stars from "./stars";
import Corona from "./corona";
import Marker from "./Marker";
import FlyLine from "./FlyLine";
import { Options } from "./interface/index";

let scene = null,
    camera = null,
    renderer = null,
    controls = null;

const containerRef = ref(null);

const R = 60;
const init = () => {
    const posZ = 500;
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog("#ff0000", posZ - R / 2, posZ + R);
    scene.scale.set(0.92, 0.92, 0.92);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 300);
    camera.near = 0.01; // 确保足够小以显示靠近的物体
    camera.position.set(0, -40, 200);

    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0xffffff, 1); // 上半球颜色、下半球颜色、强度
    scene.add(hemisphereLight);
    const light = new THREE.PointLight(0xffffff, 1.0);
    const light2 = new THREE.PointLight(0xffffff, 1.0);
    const ambient = new THREE.AmbientLight(0xffffff);

    light.position.set(20, -50, 0);
    light2.position.set(0, -40, 20);

    scene.add(light);
    scene.add(light2);
    scene.add(ambient);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    directionalLight.position.set(300, 1000, 500);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera = camera;
    directionalLight.shadow.bias = 0.0001;
    directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    // controls.enableRotate = false; //启用旋转
    containerRef.value.appendChild(renderer.domElement);
    create();
};

let global = null;
let label = null;
let stars = null;
let depth = 2;
let corona = null;
let marker = null;
let theme = "dark";
let isGlobal = true;
let flyLine = null;
let map = null;
let blend = 1;
const create = () => {
    const baseOption: Options = { scene, camera, isGlobal, radius: R, theme, depth, blend };
    global = new Global(baseOption);
    global.create();

    label = new Label(baseOption);
    label.create();

    stars = new Stars(baseOption);

    corona = new Corona(baseOption);
    corona.createCorona();

    marker = new Marker(baseOption);
    marker.create();

    flyLine = new FlyLine(baseOption);
    createLines();

    // map = new Map(baseOption);
    // map.create();
};

const createLines = () => {
    const lines = [
        {
            type: "type3",
            startName: "美国-芝加哥",
            start: [-87.59151, 41.869462],
            endName: "台北",
            end: [121.554264, 25.067941]
        },
        {
            type: "type2",
            startName: "美国-温哥华",
            start: [-123.098293, 49.246501],
            endName: "厦门",
            end: [118.123169, 24.505269]
        },
        {
            type: "type1",
            startName: "赞比亚-卢萨卡",
            start: [28.306861, -15.38821],
            endName: "北京",
            end: [116.405994, 39.921797]
        },
        {
            type: "type6",
            startName: "德国-柏林",
            start: [13.40505, 52.543314],
            endName: "成都",
            end: [104.113627, 30.56108]
        },
        {
            type: "type8",
            startName: "美国-纽约",
            start: [-73.857928, 40.850676],
            endName: "泰国-曼谷",
            end: [100.507757, 13.851915]
        }
    ];

    lines.forEach(line => {
        flyLine.addFlyLine(line.start, line.end, line.type);
    });
};

const render = () => {
    controls.update();

    // // 更新混合因子，实现平滑转换
    // blend += 0.01;
    // if (blend > 1.0) blend = 1.0; // 确保blend不超过1.0
    // customMaterial.uniforms.blend.value = blend;

    // if(coneMaterial.uniforms.time.value > 1) {
    //     coneMaterial.uniforms.time.value = 0;
    // }
    // coneMaterial.uniforms.time.value += 0.1;
    // ringsMesh.rotation.z += 0.01;
    if (global) {
        // global.mapBlurMaterial.uniforms.light_pos.value = camera.position;
        global.mapBlurMaterial.uniforms.view_pos.value = camera.position;
        // blend += 0.01;
        // if (blend > 1.0) blend = 0.0; // 确保blend不超过1.0
        // global.mapBlurMaterial.uniforms.blend.value = blend;

        // global.mapGridMaterial.uniforms.blend.value = blend;

        // light_pos: { value: this.camera.position }, //new THREE.Vector3(0, 0, 0)
        // view_pos: { value: this.camera.position }
        global.render();
    }

    label && label.render();
    corona && corona.render();
    marker && marker.render();
    flyLine && flyLine.render();
    renderer.render(scene, camera);
    requestAnimationFrame(render); //每一帧重新渲染（渲染下一帧的时候调用animate1函数）
};

onMounted(() => {
    init();
    render();
});
</script>
<style scoped lang="scss">
.container {
    height: 100%;
}
</style>
