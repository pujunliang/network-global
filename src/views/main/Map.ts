import * as THREE from "three";
import { lon2xyz, lon2xy, project_mercator, project_ecef } from "@/utils";
import Shader from "./shader";
import { THEME_COLOR } from "./theme";
import { Base64 } from "js-base64";
export default class Map {
    private camera;
    private scene;
    private radius: number = 60;
    public mapType: number = 1; // 0 平面 1 球体
    public depth: number = 2;
    private group: THREE.Group;

    constructor(options) {
        const { camera, scene, depth } = options;
        this.camera = camera;
        this.scene = scene;
        this.depth = depth;
        this.group = new THREE.Group();
        this.group.position.z = 0.1;
    }

    create() {
        fetch("./json/map.json")
            .then(res => res.json())
            .then(map => {
                // 加载顶点数据并创建几何体
                const geometry = this.build_geometry(map);

                // 创建一个材质
                const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

                // 创建一个网格并添加到场景中
                const mesh = new THREE.Mesh(geometry, material);
                this.group.add(mesh);
                this.scene.add(this.group);
            });
    }

    decode(data, t) {
        let n = atob(data),
            r = n.length,
            o = new ArrayBuffer(r),
            i = new Uint8Array(o);
        for (let a = 0; a < r; ++a) i[a] = n.charCodeAt(a);
        return t ? new t(o) : o;
    }

    forEach() {
        let e = new THREE.Vector3(); // 创建一个新的 THREE.Vector3 对象
        return function (t, n = 4, r = 0, o, i, a) {
            let u, s;
            // 默认步长 n = 4，起始位置 r = 0，结束位置 s 取决于 o
            s = o ? Math.min(o * n + r, t.length) : t.length;
            for (u = r; u < s; u += n) {
                // 将每3个元素处理为一个 THREE.Vector3 对象
                e.set(t[u], t[u + 1], t[u + 2]);
                // 调用回调函数 i 来处理向量，传入 e 和其他参数
                i(e, e, a); // 根据需要修改 i 的处理方式
                // 更新数组 t 中的值
                t[u] = e.x;
                t[u + 1] = e.y;
                t[u + 2] = e.z;
            }
            return t; // 返回修改后的数组
        };
    }

    build_geometry(mapData) {
        let t = [],
            n = mapData.geom,
            r = new THREE.Vector3(),
            o = new THREE.Vector3(),
            uv = new THREE.Vector2();

        n.faces = this.decode(n.faces, Uint16Array);
        n.lines = this.decode(n.lines, Uint16Array);
        n.coast = this.decode(n.coast, Uint16Array);
        n.verts = this.decode(n.verts, Int16Array);

        function convert(index, height) {
            let lon = (180 * n.verts[2 * index + 0]) / 32768;
            let lat = (90 * n.verts[2 * index + 1]) / 32768;
            // 根据原始数据计算顶点坐标
            r.set(
                lon, // 经度
                lat, // 纬度
                height // 高度
            );

            uv.set(
                0.5 + r.x / 360, // U坐标
                0.5 - r.y / 180 // V坐标
            );

            let u = t.length / 14;

            // 转换为墨卡托投影
            project_mercator(o, r);
            // 向数组中添加顶点数据
            t.push(o.x, o.y, o.z);
            t.push(0, 0, 0); // 法线（暂时设置为0）
            // 检查推入的值
            if (Number.isNaN(o.x) || Number.isNaN(o.y) || Number.isNaN(o.z)) {
                debugger;
                console.log(`NaN detected in ECEF projection at index ${index}:`, o);
            }
            // 转换为ECEF坐标
            project_ecef(o, r);
            t.push(o.x, o.y, o.z);
            t.push(0, 0, 0); // 法线（暂时设置为0）

            // 添加纹理坐标
            t.push(uv.x, uv.y);
            // return u;
        }
        // const vertsLen = n.verts.length;
        for (let vertsLen = n.verts.length, s = 0; s < vertsLen; ++s) {
            convert(s, 0);
        }
        let c = Array.apply([], n.faces);
        (c.length = n.faces.length), (c.constructor = Array), (this.coast_start = c.length);

        for (let s = 0; s < n.coast.length; s += 2) {
            var l = n.coast[s + 0],
                f = n.coast[s + 1],
                p = convert(l, -0.014),
                h = convert(f, -0.014);

            (l = convert(l, 0)), (f = convert(f, 0));

            c.push(l, f, p);
            c.push(f, h, p);
        }

        this.coast_count = c.length - this.coast_start;
        let d = new THREE.Vector3(),
            v = new THREE.Vector3(),
            g = 14;

        for (let s = 0; s < c.length; s += 3) {
            let l = c[s + 0];
            let f = c[s + 1];
            let m = c[s + 2];
            for (let y = 0; y < 2; ++y) {
                let _ = 6 * y;

                let dx = t[g * f + _] - t[g * l + _],
                    dy = t[g * f + _ + 1] - t[g * l + _ + 1],
                    dz = t[g * f + _ + 2] - t[g * l + _ + 2];

                d.set(dx, dy, dz);

                let vx = t[g * m + _] - t[g * l + _],
                    vy = t[g * m + _ + 1] - t[g * l + _ + 1],
                    vz = t[g * m + _ + 2] - t[g * l + _ + 2];
                    
                v.set(vx, vy, vz);

                o.crossVectors(d, v);
                o.normalize();

                // 更新顶点法线
                t[g * l + _ + 3] += o.x;
                t[g * l + _ + 3 + 1] += o.y;
                t[g * l + _ + 3 + 2] += o.z;
            }
        }

        this.forEach()(t, g, 3, 0, function (e) {
            e.normalize();
        });
        this.forEach()(t, g, 9, 0, function (e) {
            e.normalize();
        });
        var geometry = new THREE.BufferGeometry();

        var data = new Float32Array(t);
        // 每个顶点有 14 个值（位置3 + 法线3 + position2 3 + normal2 3 + uv 2）
        const vertexCount = data.length / 14;
        // 确保数组长度是 14 的倍数
        if (data.length % 14 !== 0) {
            console.error("数据长度不是 14 的倍数，请检查数据");
        }
        // 为每个属性创建对应的 BufferAttribute
        geometry.setAttribute("position", new THREE.BufferAttribute(data.subarray(0, vertexCount * 3), 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(data.subarray(vertexCount * 3, vertexCount * 6), 3));
        // geometry.setAttribute("position2", new THREE.BufferAttribute(data.subarray(vertexCount * 6, vertexCount * 9), 3));
        // geometry.setAttribute("normal2", new THREE.BufferAttribute(data.subarray(vertexCount * 9, vertexCount * 12), 3));
        // geometry.setAttribute("uv", new THREE.BufferAttribute(data.subarray(vertexCount * 12, vertexCount * 14), 2));

        return geometry;
    }
}
