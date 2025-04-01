// 引入 d3-geo 库以处理地理数据
import * as THREE from "three";
import { lon2xyz, lon2xy } from "@/utils";
import Shader from "./shader";
import { THEME_COLOR } from "./theme";
export default class Global {
    public mapBlurMaterial;
    public mapGridMaterial;
    public mapLineMaterial;
    private camera;
    private scene;
    private blend: number = 0;
    private blurTexture;
    private patternTexture;
    private radius: number = 60;
    public mapType: number = 1; // 0 平面 1 球体
    public depth: number = 2;
    private group: THREE.Group;
    constructor(options) {
        const { camera, scene, depth, blend } = options;
        this.camera = camera;
        this.scene = scene;
        this.depth = depth;
        this.blend = blend;
        this.group = new THREE.Group();
        this.group.position.z = 0.1;
        this.createTexture();
        this.createMaterial();
    }
    create() {
        this.createEarthCountry();
        this.createEarthGrid();
    }
    createMaterial() {
        const texture = new THREE.TextureLoader().load("./static/map_blur.jpg");
        // 创建自定义材质
        this.mapBlurMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.mapVertexShader,
            fragmentShader: Shader.mapFragmentShader,
            uniforms: {
                blend: { value: this.mapType },
                offset_x: { value: 0.0 },
                height: { value: 0.0 },
                tone: { value: 0.5 },
                alpha: { value: 1.0 },
                color0: { value: THEME_COLOR.dark.countries.color0 }, // 起始颜色
                color1: { value: THEME_COLOR.dark.countries.color1 }, // 终止颜色
                t_blur: { value: texture }, // 模糊纹理
                light_pos: { value: new THREE.Vector3(20, 50, 30) }, //new THREE.Vector3(20, -25, -20) new THREE.Vector3(20, -20, 20)
                view_pos: { value: this.camera.position }
            },
            side: THREE.DoubleSide
            // transparent: true
        });
    }

    createTexture() {
        this.blurTexture = new THREE.TextureLoader().load("./static/map_blur.jpg");
        this.patternTexture = new THREE.TextureLoader().load("./static/pattern.png");
        this.patternTexture.wrapS = THREE.RepeatWrapping;
        this.patternTexture.wrapT = THREE.RepeatWrapping;
    }

    createEarthGeo(shape, isRussia) {
        let _radius = this.radius + 0.2;
        // 创建拉伸的几何体
        const extrusionSettings = {
            depth: this.depth, // 厚度设置为 5
            bevelEnabled: true, // 是否启用斜角
            // bevelThickness: 0.8, // 斜角厚度
            bevelSize: 0.1, // 斜角大小
            bevelSegments: 4 // 斜角分段数
        };

        let planeWorldGeometry = new THREE.ExtrudeGeometry(shape, extrusionSettings);
        let geometry = planeWorldGeometry.clone();
        function polar2Cartesian(lat, lng, r = 0, oldZ = 0) {
            const phi = ((90 - lat) * Math.PI) / 180;
            const theta = ((90 - lng) * Math.PI) / 180;

            r += oldZ;
            if (isRussia) {
                r += 1.085; // 这里你可以根据需要调整增量，抬高凹陷区域
            }
            return [
                r * Math.sin(phi) * Math.cos(theta), // x
                r * Math.cos(phi), // y
                r * Math.sin(phi) * Math.sin(theta) // z
            ];
        }

        geometry.attributes.position.array.forEach((coord, idx) => {
            const lat = geometry.attributes.position.getY(idx);
            const lon = geometry.attributes.position.getX(idx);
            const oldZ = geometry.attributes.position.getZ(idx);
            let [x, y, z] = polar2Cartesian(lat, lon, _radius, oldZ);
            geometry.attributes.position.setXYZ(idx, x, y, z);
        });

        geometry.rotateY(Math.PI / 2);
        const position2 = geometry.clone().attributes.position.clone(); // 第二组顶点，用于混合效果
        const normal2 = geometry.clone().attributes.normal.clone(); // 第二组法线
        planeWorldGeometry.setAttribute("position2", position2);
        planeWorldGeometry.setAttribute("normal2", normal2);
        const mesh = new THREE.Mesh(planeWorldGeometry, this.mapBlurMaterial);
        return mesh;
    }

    // 将球面坐标 (lat, lon, z) 转换为平面坐标 (x, y, z)
    sphericalToPlane(lat, lon, oldZ) {
        // 计算经度和纬度
        const longitude = Math.atan2(oldZ, lon); // 经度 (λ)
        const latitude = Math.asin(lat / this.radius); // 纬度 (φ)

        // 墨卡托投影公式
        const x = longitude; // 经度直接映射为 X 坐标
        const y = Math.log(Math.tan(Math.PI / 4 + latitude / 2)); // 纬度通过墨卡托公式转换为 Y 坐标

        // 保留 z 坐标不变
        const z = oldZ;

        return [x, y, z];
    }

    // 将圆锥的顶点转换为平面
    convertToFlatPlane(geometry) {
        geometry.attributes.position.array.forEach((coord, idx) => {
            const lat = geometry.attributes.position.getY(idx);
            const lon = geometry.attributes.position.getX(idx);
            const oldZ = geometry.attributes.position.getZ(idx);
            const [x, y, z] = this.sphericalToPlane(lat, lon, oldZ);
            geometry.attributes.position.setXYZ(idx, x, y, z);
        });
        geometry.computeVertexNormals();
    }

    createEarthGrid() {
        this.mapGridMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.mapGridVertexShader,
            fragmentShader: Shader.mapGridFragmentShader,
            uniforms: {
                blend: { value: this.mapType }, // 默认混合因子
                offset_x: { value: 0.0 }, // 默认偏移量
                pattern_scale: { value: new THREE.Vector2(440, 300) }, // 默认图案缩放
                color0: { value: THEME_COLOR.dark.grid.color0 }, // 起始颜色
                color1: { value: THEME_COLOR.dark.grid.color1 }, // 终止颜色
                t_blur: { value: this.blurTexture }, // 创建一个空的模糊纹理
                t_pattern: { value: this.patternTexture } // 创建一个空的图案纹理
            },
            side: THREE.DoubleSide
        });

        const sphereGeometry = this._getEarthSphereGeo();
        const mesh = new THREE.Mesh(sphereGeometry, this.mapGridMaterial);
        this.group.add(mesh);
    }

    createEarthCountry() {
        fetch("./json/ne_110m_admin_0_countries.geojson")
            .then(res => res.json())
            .then(countries => {
                const polygonMeshes = [];

                countries.features.forEach(feature => {
                    const geometry = feature.geometry;
                    const isRussia = feature.properties.ADMIN.toUpperCase() == "RUSSIA";
                    const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
                    polygons.forEach(polygon => {
                        polygon.forEach(coords => {
                            const shape = new THREE.Shape();
                            coords.forEach((point, index) => {
                                const [x, y] = point;
                                if (index === 0) {
                                    shape.moveTo(x, y);
                                } else {
                                    shape.lineTo(x, y);
                                }
                            });
                            shape.closePath();
                            let mesh = this.createEarthGeo(shape, isRussia);
                            polygonMeshes.push(mesh);
                        });
                    });
                });

                polygonMeshes.forEach(mesh => this.group.add(mesh));
                this.scene.add(this.group);
            });
    }

    render() {
    }

    _getEarthSphereGeo() {
        const sphereGeometry = new THREE.SphereGeometry(this.radius, 64, 64);
        const planeGeometry = new THREE.PlaneGeometry(380, 180, 64, 64);

        // 为平面几何体和球体几何体设置自定义的属性
        planeGeometry.setAttribute("position2", sphereGeometry.attributes.position);
        planeGeometry.setAttribute("normal2", sphereGeometry.attributes.normal);
        return planeGeometry;
    }
}
