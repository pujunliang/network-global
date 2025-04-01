import * as THREE from "three";
import Pointer from "./Pointer";
import { lon2xyz } from "@/utils";
import { Options } from "./interface/index";

/**
 * 处理烟雾
 */
export default class Marker {
    public isGlobal: boolean = false;
    private scene;
    private camera;
    private group: THREE.Group;
    private R: number = 0;
    private theme: string;
    private depth: number;
    constructor(options: Options) {
        const { scene, camera, isGlobal, radius, theme, depth } = options;
        this.scene = scene;
        this.camera = camera;
        this.isGlobal = isGlobal;
        this.R = radius;
        this.theme = theme;
        this.depth = depth;
        this.group = new THREE.Group();
        if (this.isGlobal) {
            this.group.rotateY(Math.PI / 2);
        }
        this.scene.add(this.group);
    }

    create() {
        const cities = [
            {
                name: "北京",
                type: "type1",
                side: 3,
                coord: [116.405994, 39.921797]
            },
            {
                name: "厦门",
                type: "type2",
                side: 4,
                coord: [118.123169, 24.505269]
            },
            {
                name: "台北",
                type: "type3",
                side: 6,
                coord: [121.554264, 25.067941]
            },
            {
                name: "香港",
                type: "type2",
                side: 8,
                coord: [114.195346, 22.306501]
            },
            {
                name: "武汉",
                type: "type5",
                side: 10,
                coord: [114.342524, 30.656563]
            },
            {
                name: "成都",
                type: "type6",
                side: 3,
                coord: [104.113627, 30.56108]
            },
            {
                name: "日本-东京",
                type: "type7",
                side: 4,
                coord: [139.804383, 35.787313]
            },
            {
                name: "泰国-曼谷",
                type: "type8",
                side: 10,
                coord: [100.507757, 13.851915]
            },
            {
                name: "伊朗-德黑兰",
                type: "type9",
                side: 6,
                coord: [51.313385, 35.757326]
            },
            {
                name: "乌克兰-基辅",
                type: "type2",
                side: 3,
                coord: [30.561234, 50.482195]
            },
            {
                name: "委内瑞拉-玻利瓦尔",
                type: "type4",
                side: 4,
                coord: [-63.559336, 6.355369]
            },
            {
                name: "美国-纽约",
                type: "type8",
                side: 6,
                coord: [-73.857928, 40.850676]
            },
            {
                name: "美国-洛杉矶",
                type: "type5",
                side: 3,
                coord: [-118.291999, 34.084256]
            },
            {
                name: "巴西-巴西利亚",
                type: "type9",
                side: 4,
                coord: [-47.903942, -15.79835]
            },
            {
                name: "赞比亚-卢萨卡",
                type: "type1",
                side: 8,
                coord: [28.306861, -15.38821]
            },
            {
                name: "利比亚-绿洲省",
                type: "type4",
                side: 3,
                coord: [21.297491, 29.127015]
            },
            {
                name: "法国-巴黎",
                type: "type5",
                side: 6,
                coord: [2.293083, 48.902025]
            },
            {
                name: "德国-柏林",
                type: "type6",
                side: 4,
                coord: [13.40505, 52.543314]
            },
            {
                name: "土耳其-伊斯坦布尔",
                type: "type3",
                side: 6,
                coord: [28.978362, 41.014622]
            },
            {
                name: "美国-芝加哥",
                type: "type3",
                side: 3,
                coord: [-87.59151, 41.869462]
            },
            {
                name: "美国-温哥华",
                type: "type2",
                side: 4,
                coord: [-123.098293, 49.246501]
            }
        ];
        const points = [];
        cities.forEach(city => {
            const [lon, lat] = city.coord;
            let newR = this.R + this.depth + 0.5; // 是上浮的偏移量

            // if (isRussia) {
            //     newR += 1.085; // 这里你可以根据需要调整增量，抬高凹陷区域
            // }

            const position = lon2xyz(newR, lon, lat);
            const point = new Pointer({ theme: this.theme, type: city.type, side: city.side } as Options);
            point.position.copy(position);
            point.lookAt(new THREE.Vector3(0, 0, 0));
            point.rotateZ((30 * Math.PI) / 180);
            point.rotateX(-(Math.PI / 2));
            points.push(point);
        });

        this.group.add(...points);
    }

   

    render() {
        this.group.children.forEach((point: Pointer) => {
            point.render();
        });
    }
}
