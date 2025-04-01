import * as THREE from "three";
import { THEME_COLOR } from "./theme";

/**
 * 处理Starts
 */
export default class Stars {
    public mapStarsMaterial;
    public isGlobal: boolean = false;
    private group: THREE.Group;
    private scene;
    private starCount: number = 10000;
    private radius: number;
    constructor(options) {
        const { scene, radius } = options;
        this.scene = scene;
        this.radius = radius;
        this.init();
    }

    init() {
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.createStar();
    }

    createStar() {
        const starCount = 10000; // 星星数量
        const positions = new Float32Array(starCount * 3); // 星星位置
        const sizes = new Float32Array(starCount); // 星星大小
        const R = 500;
        // 生成随机星星位置和大小
        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * R; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * R; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * R; // z
            sizes[i] = this.lerp(0.1, 1.5, Math.pow(Math.random(), 10)); // 星星大小 [0.5, 3.0]
        }

        // 创建几何体
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

        let texture = new THREE.TextureLoader().load("/static/spark1.png");
        let material = new THREE.PointsMaterial({
            size: 1,
            color: THEME_COLOR.dark.stars,
            opacity: 0.3,
            map: texture,
            transparent: true,
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const stars = new THREE.Points(geometry, material); 
        this.group.add(stars);
    }

    lerp(e, t, n) {
        return (1 - n) * e + n * t;
    }
}
