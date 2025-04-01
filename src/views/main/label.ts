import * as THREE from "three";
import Shader from "./shader";
import { lon2xy, lon2xyz, getCountryNameInLanguage, project_mercator, project_ecef } from "@/utils";
/**
 * 处理文本
 */
export default class Label {
    public mapLabelMaterial;
    private radius: number = 60;
    public isGlobal: boolean = true;
    private group: THREE.Group;
    private scene;
    private camera;
    public depth: number = 0;
    private isCreated = false;
    private blend: number;

    constructor(options) {
        const { camera, scene, depth, blend } = options;
        this.camera = camera;
        this.scene = scene;
        this.depth = depth;
        this.blend = blend;
        this.initMaterial();
    }

    async create() {
        this.isCreated = false;

        if (this.group) {
            this.scene.remove(this.group);
        } else {
            this.group = new THREE.Group();
        }

        if(this.blend >= 0.5) {
            this.group.rotateY(Math.PI);
        }
        const labels = await this.loadLabelData();
        const texture = this.createLabelTexture(labels);
        const labelMesh = this.createLabelMesh(labels, texture);
        labelMesh.scale.set(10, 10, 10);
        this.group.add(labelMesh);
        this.scene.add(this.group);
        this.isCreated = true;
    }

    async loadLabelData() {
        const response = await fetch("./json/labels.json");
        const data = await response.json();
        const labels = [];
        const defaultZ = 1e-4;
        data.countries.forEach(country => {
            let name = getCountryNameInLanguage(country.iso2);
            country.coord[2] = defaultZ;
            let [x, y, z] = country.coord;

            country.coord = new THREE.Vector3(x, y, z);
            country.coord.z *= 2;
            labels.push({
                name,
                pos: new THREE.Vector3(),
                coord: country.coord, // [longitude, latitude] in radians
                fontSize: country.font_size
            });
        });

        // data.cities.forEach(city => {
        //     city.coord[2] = defaultZ;
        //     let [x, y, z] = city.coord;
        //     city.coord = new THREE.Vector3(x, y, z);
        //     labels.push({
        //         name: city.name,
        //         pos: new THREE.Vector3(),
        //         coord: city.coord,
        //         fontSize: 15
        //     });
        // });

        return labels;
    }

    // 创建标签纹理（保持不变）
    createLabelTexture(labels) {
        const TEXTURE_SIZE = 2048 / 1; //2048;
        const scale = 1 / TEXTURE_SIZE;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = TEXTURE_SIZE;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Ubuntu Mono";
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";
        const o = [0, 0];
        labels.forEach(label => {
            const textWidth = ctx.measureText(label.name).width;
            if (o[0] + textWidth >= TEXTURE_SIZE) {
                o[0] = 0;
                o[1] += 34;
            }

            ctx.fillText(label.name, o[0], o[1] - 0);
            label.box = [o[0], o[1] - 4, o[0] + textWidth, o[1] + 31];
            label.box[0] *= scale;
            label.box[1] *= scale;
            label.box[2] *= scale;
            label.box[3] *= scale;

            o[0] += textWidth;
        });

        const texture: THREE.CanvasTexture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.generateMipmaps = true;
        return texture;
    }

    /**
     * 创建标签网格
     * @param labels 文本标签数据
     * @param texture 纹理数据
     * @returns 
     */
    createLabelMesh(labels, texture) {
        const geometry = new THREE.BufferGeometry();
        const s = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
        const transformedVertices = [];
        const uvCoords = [];
        labels.forEach(label => {
            this.project(label.pos, label.coord); // 默认使用 ECEF 投影
            label.pos.multiplyScalar(0.63); // 调整标签的位置
            const labelSize = label.fontSize * 1.0; // 字体大小

            // 计算标签的矩阵变换
            const mat = new THREE.Matrix4();
            mat.identity();
            // "ecef"
            if (this.blend >= 0.5) {
                const tempVec3 = new THREE.Vector3();
                const crossVec = new THREE.Vector3();
                const rightVec = new THREE.Vector3();

                tempVec3.copy(label.pos).normalize();
                crossVec.set(0, 1, 0);
                crossVec.cross(tempVec3).normalize();
                rightVec.crossVectors(crossVec, tempVec3);
                mat.set(
                    crossVec.x,
                    crossVec.y,
                    crossVec.z,
                    0,
                    tempVec3.x,
                    tempVec3.y,
                    tempVec3.z,
                    0,
                    rightVec.x,
                    rightVec.y,
                    rightVec.z,
                    0,
                    0,
                    0,
                    0,
                    1
                );
                // 计算标签朝向球心
                const target = new THREE.Vector3(0, 0, 0); // 球心位置
                mat.lookAt(label.pos, target, new THREE.Vector3(0, 1, 0)); // 让标签朝向球心
            }

            // 缩放矩阵
            mat.scale(new THREE.Vector3(labelSize * (label.box[2] - label.box[0]), labelSize * (label.box[3] - label.box[1]), 1));

            // 创建一个翻转矩阵
            const flipMatrix = new THREE.Matrix4();
            flipMatrix.makeRotationY(Math.PI); // 绕 Y 轴旋转 180 度
            mat.multiply(flipMatrix); // 将翻转应用到 lookAt

            mat.setPosition(label.pos);
            // 计算标签的顶点和纹理坐标
            for (let i = 0; i < s.length; i += 2) {
                const u = s[i];
                const v = s[i + 1];

                // 计算转换后的顶点位置
                const tempVert = new THREE.Vector3(u, v, 0);
                tempVert.applyMatrix4(mat);
                transformedVertices.push(tempVert.x, tempVert.y, tempVert.z);

                // // 计算纹理坐标
                let texU = 0.5 * (1 + u);
                let texV = 0.5 * (1 + v);
                    texU = this.lerp(label.box[2], label.box[0], texU);
                    texV = this.lerp(label.box[3], label.box[1], texV);
                    texV = 1 - texV; // 反转 Y 坐标

                uvCoords.push(texU, texV);
            }
        });

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(transformedVertices, 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvCoords, 2));

        this.mapLabelMaterial.uniforms.t_color.value = texture;
        return new THREE.Mesh(geometry, this.mapLabelMaterial);
    }

    project(e, t) {
        this.blend < 0.5 ? project_mercator(e, t) : project_ecef(e, t);
    }

    lerp(e, t, n) {
        return (1 - n) * e + n * t;
    }

    render() {
        if (this.isCreated) {
            let t = this.lerp(30, 180, this.blend);
            const cameraPos = this.camera.position;
            this.mapLabelMaterial.uniforms.circle_of_interest.value = new THREE.Vector4(cameraPos.x, cameraPos.y, cameraPos.z, t);
        }
    }

    initMaterial() {
        const texture = new THREE.TextureLoader().load("./static/pattern.png");
        texture.needsUpdate = true;
        this.mapLabelMaterial = new THREE.ShaderMaterial({
            vertexShader: Shader.mapLableVertexShader,
            fragmentShader: Shader.mapLableFragmentShader,
            uniforms: {
                circle_of_interest: { value: new THREE.Vector4(0, 0, 0, 4) }, //100000 new THREE.Vector4(0, 0, 0, 4)
                inside: { value: true },
                t_color: { value: texture } // 动态生成的纹理
            },
            transparent: true, // 启用透明度
            depthTest: true, // 启用深度测试
            depthWrite: false, // 禁止深度写入
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
    }
}
