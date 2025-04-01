import * as THREE from "three";
import { lon2xyz, getBezierPoint, getRandomBetween } from "@/utils";
import { Options } from "./interface/index";
import Shader from "./shader";
import { THEME_COLOR } from "./theme";

export default class FlyLine {
    private group: THREE.Group;
    private isGlobal: boolean;
    private R: number;
    private depth: number;
    private theme;
    private camera;
    constructor(options: Options) {
        const { scene, camera, isGlobal, radius, theme, depth } = options;
        // this.scene = scene;
        this.camera = camera;
        this.isGlobal = isGlobal;
        this.R = radius;
        this.theme = theme;
        this.depth = depth;
        // this.clock = clock;
        // this.initMaterial();
        this.group = new THREE.Group();
        if (this.isGlobal) {
            this.group.rotateY(Math.PI / 2);
        }
        scene.add(this.group);
    }

    addFlyLine(a, b, type) {
        const aData = lon2xyz(this.R + this.depth + 0.3, a[0], a[1]);
        const bData = lon2xyz(this.R + this.depth + 0.3, b[0], b[1]);

        const v0 = new THREE.Vector3(aData.x, aData.y, aData.z);
        const v3 = new THREE.Vector3(bData.x, bData.y, bData.z);

        const [v1, v2] = getBezierPoint(v0, v3, true);

        const curve2 = new THREE.CubicBezierCurve3(v0, v1, v2, v3);

        const geometry = new THREE.TubeGeometry(curve2, 100, 0.15, 8, false);

        const color = THEME_COLOR[this.theme].attack[type] || new THREE.Color(0xff0000);
        const material = new THREE.ShaderMaterial({
            vertexShader: Shader.missileVertexShader,
            fragmentShader: Shader.missileFragmentShader,
            uniforms: {
                view_position: { value: this.camera.position },
                time: { value: 0.0 }, // 初始化时间
                color: { value: color },
                width: { value: 1.5 }
            },
            transparent: true, // 启用透明度
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const curveObject = new THREE.Mesh(geometry, material);
        curveObject.userData.speed = getRandomBetween(0.004, 0.008);
        this.group.add(curveObject);
    }

    render() {
        this.group.children.forEach((line: any) => {
            line.material.uniforms.time.value += line.userData.speed;
        });
    }
}
