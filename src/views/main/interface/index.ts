import * as THREE from "three";
export interface Options {
    scene: THREE.Scene;
    camera: THREE.Camera;
    isGlobal: boolean;
    radius?: number;
    theme?: string;
    depth?: number;
    type?: string;
    side?: number;
    blend?: number;
}
