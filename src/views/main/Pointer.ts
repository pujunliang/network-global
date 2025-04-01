import * as THREE from "three";
import Shader from "./shader";
import { THEME_COLOR } from "./theme";
import { Options } from "./interface/index";
import { getRandomBetween } from "@/utils";
export default class Pointer extends THREE.Object3D {
    public coneMaterial;
    public impactMaterial;
    public ringsMaterial;
    private clock: THREE.Clock;
    private speed;
    constructor(args: Options) {
        super();
        this.clock = new THREE.Clock();
        this.init(args);
    }

    init({ theme, type, side }: Options) {
        this.speed = getRandomBetween(0.002, 0.006);
        const color = THEME_COLOR[theme].attack[type] || new THREE.Color(0xff0000);
        this.initMaterial(color);
        this.createCone();
        this.createImpact();
        this.createRings(side);
    }

    /**
     * 创建圆锥几何体
     */
    createCone() {
        const bR = 0.1; // 底面半径
        const tR = 0.2; // 底面半径
        const height = 2; // 圆锥高度
        const radialSegments = 6; // 圆的分段数，影响圆锥底面的平滑度
        const geometry = new THREE.CylinderGeometry(bR, tR, height, radialSegments);
        const coneMesh = new THREE.Mesh(geometry, this.coneMaterial);
        coneMesh.position.y += 0.7;
        this.add(coneMesh);
    }

    createImpact() {
        const geometry = new THREE.CircleGeometry(2, 64);
        const mesh = new THREE.Mesh(geometry, this.impactMaterial);
        mesh.rotateX(Math.PI / 2);
        this.add(mesh);
    }

    createRings(side: number = 4) {
        const points = [];
        const ringCount = 18; // 环的数量
        const spacing = 0.2; // 环之间的距离
        const radius = 1.2; // 多边形的半径

        // 生成多边形点
        for (let i = 0; i < ringCount; i++) {
            const z = -1 - i * spacing; // 每个环的 z 坐标
            const ringPoints = [];
            for (let j = 0; j < side; j++) {
                const angle = (j / side) * Math.PI * 2; // 当前顶点的角度
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                ringPoints.push(new THREE.Vector3(x, y, z));
            }
            // 闭合点：最后一个点连接到第一个点
            for (let j = 0; j < ringPoints.length; j++) {
                const current = ringPoints[j];
                const next = ringPoints[(j + 1) % ringPoints.length]; // 循环连接
                points.push(current, next);
            }
        }
        const bufferGeometry = new THREE.BufferGeometry().setFromPoints(points);

        const hud = new THREE.LineSegments(bufferGeometry, this.ringsMaterial);

        hud.position.y += 0.5;
        this.add(hud);
    }

    render() {
        const elapsedTime = this.clock.getElapsedTime(); // 返回以秒为单位的时间
        this.coneMaterial && (this.coneMaterial.uniforms.time.value = (elapsedTime * 0.2) % 1.0); // 每0.1秒循环一次

        if (this.impactMaterial.uniforms.time.value > 1) {
            this.impactMaterial.uniforms.time.value = 0.0;
        }
        this.impactMaterial.uniforms.time.value += 0.003;

        if (this.ringsMaterial.uniforms.time.value > 1) {
            this.ringsMaterial.uniforms.time.value = 0.0;
        }
        this.ringsMaterial.uniforms.time.value += this.speed;
    }

    initMaterial(matColor: THREE.Color) {
        const loadedTexture = new THREE.TextureLoader().load("./static/smoke.jpg");
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter; // 启用 mipmap
        loadedTexture.wrapS = THREE.RepeatWrapping; // 水平重复
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping; // 垂直贴图到边缘

        this.coneMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.coneVertexShader,
            fragmentShader: Shader.coneFragmentShader,
            uniforms: {
                time: { value: 0.0 }, // 初始化时间
                color: { value: matColor }
            },
            transparent: true, // 启用透明度
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        const impactTexture = new THREE.TextureLoader().load("./static/impact-512.jpg");
        impactTexture.minFilter = THREE.LinearFilter; // 优化采样
        impactTexture.magFilter = THREE.LinearFilter;
        this.impactMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.impactVertexShader,
            fragmentShader: Shader.impactFragmentShader,
            uniforms: {
                time: { value: 0.0 }, // 时间控制
                color: { value: matColor },
                t_color: { value: impactTexture } // 加载纹理
            },
            transparent: true, // 启用透明度
            // depthTest: true, // 启用深度测试
            // depthWrite: true, // 禁止深度写入
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending // 禁用混合
        });

        this.ringsMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.ringsVertextShader,
            fragmentShader: Shader.ringsFragmentShader,
            uniforms: {
                time: { value: 0.0 },
                scale: { value: 1.0 },
                color: { value: matColor }
            },
            transparent: true, // 启用透明度
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending // 启用加法混合
        });
    }
}
