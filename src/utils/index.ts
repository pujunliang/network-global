import * as THREE from "three";
/**
 * 经纬度转球面坐标 （笛卡尔坐标转换）
 * @param R
 * @param longitude
 * @param latitude
 * @returns
 */
export const lon2xyz = (R, longitude, latitude) => {
    const lon = (longitude * Math.PI) / 180;
    const lat = (latitude * Math.PI) / 180;
    const x = R * Math.cos(lat) * Math.sin(lon);
    const y = R * Math.sin(lat);
    const z = R * Math.cos(lon) * Math.cos(lat);
    return { x, y, z };
};

/**
 * 墨卡托投影算法
 * @param longitude
 * @param latitude
 * @param scale
 * @returns
 */
export const lon2xy = (longitude, latitude, scale = 1) => {
    const x = ((longitude * Math.PI) / 180) * scale;
    const y = Math.log(Math.tan((latitude * Math.PI) / 360 + Math.PI / 4)) * scale;
    return { x, y, z: 0 }; // 设 z 为 0，适用于平面地图
};

/**
 * 获取两个点的中心点
 * @param v1
 * @param v2
 * @returns
 */
export const getVCenter = (v1: THREE.Vector3, v2: THREE.Vector3) => {
    const v = v1.add(v2);
    return v.divideScalar(2);
};

/**
 * 获取两向量之间的任意一向量
 * @param v1
 * @param v2
 * @param len  len与两点的距离归一化为 0.0 ~ 1.0
 * @returns
 */
export const getLenVector = (v1: THREE.Vector3, v2: THREE.Vector3, len: number) => {
    let v1v2Len = v1.distanceTo(v2);
    return v1.lerp(v2, len / v1v2Len);
};

/**
 * 获取贝塞尔控制点
 * @param v0
 * @param v3
 * @param isGlobal
 * @returns
 */
export const getBezierPoint = (v0: THREE.Vector3, v3: THREE.Vector3, isGlobal: boolean = false) => {
    const r = 4;
    // 角度
    const angle = (v0.angleTo(v3) * 180) / Math.PI; // 0 ~ Math.PI//
    // 使用 1.2 和 10 来调整弧度
    // 角度值与长度值
    const aLen = angle * 0.8,
        hLen = angle * angle * 10;

    const p0 = new THREE.Vector3(0, 0, 0);

    // 两点的中心位置
    const centerPoint = getVCenter(v0.clone(), v3.clone());

    // 法线向量、使用中心点和向上的向量
    let rayLine: THREE.Ray;
    if (isGlobal) {
        rayLine = new THREE.Ray(p0, centerPoint);
    } else {
        rayLine = new THREE.Ray(centerPoint, new THREE.Vector3(0, 1, 0));
    }

    // // API 更新后，Ray类的 at 方法需要两个参数
    const temp = new THREE.Vector3(0, 0, 0);

    // 计算位置
    const at = hLen / rayLine.at(1, temp).distanceTo(p0);
    // 顶点坐标
    const vTop = rayLine.at(at, temp);

    // 控制点坐标
    const v1 = getLenVector(v0.clone(), vTop, aLen);
    const v2 = getLenVector(v3.clone(), vTop, aLen);
    return [v1, v2];
};

/**
 * 获取范围随机数
 * @param min
 * @param max
 * @returns
 */
export const getRandomBetween = (min, max) => {
    return Math.random() * (max - min) + min;
};

export const clamp = (e, t, n) => {
    return e < t ? t : e > n ? n : e;
};

export const deg2rad = deg => {
    return (Math.PI * deg) / 180;
};

export const rad2deg = rad => {
    return (180 * rad) / Math.PI;
};

export const project_mercator = (e: THREE.Vector3, t: THREE.Vector3) => {
    let tx = t.x,
        ty = t.y,
        o = (Math.PI * ty) / 180,
        i = (90 / Math.PI) * Math.log(Math.tan(0.25 * Math.PI + 0.5 * o)); // 根据墨卡托公式计算Y坐标

    let x = -tx / 180;
    let y = clamp(i / 90, -1, 1);
    let z = -1 * t.z;
    e.set(x, y, z); // 使用 `set` 设置 e 的值
    e.multiplyScalar(10); // 缩放
};

export const project_ecef = (e: THREE.Vector3, t: THREE.Vector3) => {
    let n = deg2rad(t.x), // 经度转弧度
        r = deg2rad(t.y), // 纬度转弧度
        o = 1 * t.z, // 高度
        i = Math.cos(r), // 计算纬度的余弦
        a = Math.sin(r); // 计算纬度的正弦

    e.set(
        -(1 + o) * i * Math.cos(n), // X坐标
        (1 + o) * a, // Y坐标
        (1 + o) * i * Math.sin(n) // Z坐标
    );
    e.multiplyScalar(10); // 缩放
};

export * from "./countries";
