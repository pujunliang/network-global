import * as THREE from "three";
import Shader from "./shader";
import { THEME_COLOR } from "./theme";
import { Options } from "./interface/index";
/**
 * 处理烟雾
 */
export default class Corona {
    public coronaMaterial;
    public isGlobal: boolean = false;
    private scene;
    private radius: number = 0;
    private camera;
    private group: THREE.Group;
    private theme: string;
    constructor(options: Options) {
        const { scene, radius, camera, theme } = options;
        this.scene = scene;
        this.radius = radius;
        this.camera = camera;
        this.theme = theme;
        this.initMaterial();
    }

    createCorona() {
        // 创建一个球体表示烟雾层
        const coronaGeometry = this.createCoronaGeometry();
        const coronaMesh = new THREE.Mesh(coronaGeometry, this.coronaMaterial);
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.group.add(coronaMesh);
    }
    createCoronaGeometry() {
        // 计算顶点数据
        const segments = 128;
        const vertices = [];
        const indices = [];
        for (let n = 0; n <= segments; ++n) {
            const r = (Math.PI * 2 * n) / segments; // 计算每个顶点的角度
            const u = n / segments; // 计算纹理坐标（u）

            const x = Math.cos(r); // 计算每个顶点的 x 坐标
            const y = Math.sin(r); // 计算每个顶点的 y 坐标

            // 顶点数据格式：x, y, u, 0, x, y, u, 1
            vertices.push(x, y, u, 0, x, y, u, 1);
        }

        for (let i = 0; i < segments; i++) {
            const topIndex = i * 2;
            const bottomIndex = topIndex + 1;
            const nextTopIndex = ((i + 1) % segments) * 2;
            const nextBottomIndex = nextTopIndex + 1;

            // 两个三角形面
            indices.push(topIndex, bottomIndex, nextTopIndex); // 第一三角形
            indices.push(bottomIndex, nextBottomIndex, nextTopIndex); // 第二三角形
        }

        // 创建 BufferGeometry 和 BufferAttribute
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 4)); // 每个顶点有4个属性（x, y, u, 0）
        geometry.setAttribute("vertex", new THREE.Float32BufferAttribute(vertices, 4)); // 纹理坐标（u, v）
        geometry.setIndex(indices); // 设置索引数据
        return geometry;
    }

    render() {
        // 更新时间（例如，用于纹理动画或烟雾扩散）
        this.coronaMaterial && (this.coronaMaterial.uniforms.time.value += 0.05);
        this.group?.lookAt(this.camera.position);
    }

    initMaterial() {
        const loadedTexture = new THREE.TextureLoader().load("./static/smoke.jpg");
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter; // 启用 mipmap
        loadedTexture.wrapS = THREE.RepeatWrapping; // 水平重复
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping; // 垂直贴图到边缘
        const { color0, color1 } = THEME_COLOR[this.theme].corona;
        this.coronaMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.coronaVertexShader,
            fragmentShader: Shader.coronaFragmentShader,
            uniforms: {
                time: { value: 0.0 }, // 初始化时间
                color0: { value: color0 }, 
                color1: { value: color1 }, 
                t_smoke: { value: loadedTexture }, // 烟雾纹理
                zoff: { value: 15.1 }, // 烟雾层的高度
                r: { value: this.radius - 1.7 },
                bill: { value: new THREE.Matrix3() } // 面朝摄像机的矩阵
            },
            transparent: true, // 启用透明度
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
    }
}
