export const mapVertexShader = `
    attribute vec3 position2;
    attribute vec3 normal2;
    uniform float blend;
    uniform float offset_x;
    uniform float height;
    attribute vec2 texcoord;

    varying vec3 v_normal;
    varying vec2 vUv;  // 用于传递纹理坐标
    varying vec3 v_light_vec;
    varying vec3 v_view_vec;

    uniform vec3 light_pos;
    uniform vec3 view_pos;

    void main() {
        vec3 P = mix(position, position2, blend);
        P.x += offset_x;

        v_normal = mix(normal, normal2, blend);
        P += height * v_normal;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        vUv = uv;  // 将纹理坐标传递给片元着色器
        v_light_vec = light_pos - P;
        v_view_vec = view_pos - P;
    }
    `;

export const mapFragmentShader = `
    uniform sampler2D t_blur;
    uniform float tone;
    uniform float alpha;
    uniform vec3 color0;
    uniform vec3 color1;
    uniform vec2 resolution;  // Declare the resolution uniform

    varying vec3 v_normal;
    varying vec3 v_light_vec;
    varying vec3 v_view_vec;
    varying vec2 vUv;  // 用于接收纹理坐标
    void main() {
        vec3 N = normalize(-v_normal);
        vec3 V = normalize(v_view_vec);
        vec3 L = normalize(v_light_vec);
        vec3 H = normalize(L + V);
        float NdotL = max(0.0, dot(N, L));
        float NdotH = max(0.0, dot(N, H));

        float blur = texture2D(t_blur, vUv).r;
        blur = 1.0*pow(blur, 2.0);

        float diffuse = 0.5 + 0.5*NdotL;//0.5*NdotL;
        float specular = 0.75 * pow(NdotH, 15.0); //15.0

        gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);
        gl_FragColor.a = alpha;
    }
    `;

// map grid
export const mapGridVertexShader = `
     attribute vec3 position2;
     varying vec2 vUv;  // 用于传递纹理坐标
     uniform float blend;
     uniform float offset_x;

     void main() {
         vec3 P = mix(position, position2, blend);
         P.x += offset_x;
         gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
         vUv = uv;
     }
     `;

export const mapGridFragmentShader = `
     uniform sampler2D t_blur;  // 模糊纹理
     uniform sampler2D t_pattern;  // 图案纹理
     varying vec2 vUv;
     uniform vec2 pattern_scale;
     uniform vec3 color0;
     uniform vec3 color1;

     void main() {
         float pattern = texture2D(t_pattern, pattern_scale * vUv).r;
         float blur = texture2D(t_blur, vUv).r;

         gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);
         gl_FragColor.a = 1.0;  // 设置完全不透明
     }
     `;

// Map Line
export const mapLineVertexShader = `
        // map_line //
        attribute vec3 position2;
        attribute vec3 normal2;

        uniform float blend;
        uniform float height;

        // map_line.vertex //
        void main() {
            vec3 P = mix(position, position2, blend);
            vec3 N = mix(normal, normal2, blend);
            P += height * N;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        }
    `;

export const mapLineFragmentShader = `
    uniform vec3 color;
    // map_line.fragment //
    void main() {
        gl_FragColor = vec4(color.rgb, 1.0);
    }
`;

// Map Lable
export const mapLableVertexShader = `
       // label //
        varying float v_alpha;
        varying vec2 vUv;  // 用于传递纹理坐标
        uniform vec4 circle_of_interest;
        uniform bool inside;
        // label.vertex //
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);
            if (!inside)
                v_alpha = pow(1.0 - v_alpha, 6.0);
            vUv = uv;
        }
    `;

export const mapLableFragmentShader = `
        // label.fragment //
        uniform sampler2D t_color;
        varying vec2 vUv;
        varying float v_alpha;
        void main() {
            // 采样纹理
            vec4 color = texture2D(t_color, vUv);
            // 修改颜色的透明度，但保持背景透明
            color.a *= 1.0 * v_alpha; // 根据 v_alpha 调整透明度
            gl_FragColor = color;
        }
    `;

// // stars
// export const starsVertexShader = `
//         // stars //
//         attribute float size; // 每个点的大小
//         void main() {
//             gl_PointSize = size; // 设置点的大小
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//     `;

// export const starsFragmentShader = `
//         // stars.fragment //
//         uniform vec4 color;
//         void main() {
//             gl_FragColor = color;
//         }
//     `;

// corona
export const coronaVertexShader = `
    // corona //
    attribute vec4 vertex;
    varying vec2 vUv;  // 用于传递纹理坐标
    uniform float zoff;
    uniform float r;
    // corona.vertex //
    void main() {
        float s = r + (30.0 * vertex.w);
        vec3 P = vec3(s * vertex.xy, zoff);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        vUv = vertex.zw;
    }       
    `;

export const coronaFragmentShader = `
    varying vec2 vUv;  // 从顶点着色器传来的纹理坐标
    uniform sampler2D t_smoke;  // 烟雾纹理
    uniform float time;  // 动态时间变化
    uniform vec3 color0;  // 烟雾的颜色0
    uniform vec3 color1;  // 烟雾的颜色1

    // corona.fragment //
    void main() {
        vec2 uv = vec2(5.0*vUv.x + 0.01*time, 0.8 - 1.5*vUv.y);
        float smoke = texture2D(t_smoke, uv).r;
        uv = vec2(3.0*vUv.x - 0.007*time, 0.85 - 0.5*vUv.y);
        smoke *= 3.5*texture2D(t_smoke, uv).r;

        float t = pow(vUv.y, 0.25);
        gl_FragColor.rgb = mix(color0, color1, t) + 0.3*smoke;
        gl_FragColor.a = 1.0;
    }`;

// cone
export const coneVertexShader = `
    // cone //
    varying vec2 v_coord;
    // cone.vertex //
    void main() {
        v_coord = vec2(0.0, position.y);
    float scale = 0.17 * mix(0.15, 0.4, position.y);
         vec3 P = scale * position;
          P.y *= 5.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
export const coneFragmentShader = `
    varying vec2 v_coord;
    uniform vec3 color;
    uniform float time;
    // cone.fragment //
    void main() {
        gl_FragColor.rgb = color;
        gl_FragColor.rgb += (1.0 - vec3(v_coord.y)) * 0.08; // 0.2
        gl_FragColor.a = (1.0 - v_coord.y) * 1.0;
        gl_FragColor.a *= 1.0 - pow(2.0*abs(time - 0.5), 2.0);
    }`;

// impact //
export const impactVertexShader = `
    varying vec2 v_texcoord0;
    varying vec2 v_texcoord;
    varying vec2 v_texcoord2;
    varying vec2 v_texcoord3;
    uniform float time;

    // impact.vertex //
    #define PI 3.14159265359

    vec2 rotate_vec2(vec2 v, float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return vec2(c*v.x - s*v.y, s*v.x + c*v.y);
    }

    void main() {
        vec3 P = position; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        v_texcoord0 = position.xy;
        
        float impact_scale = 1.0 / (time + 1.0);
        // float impact_scale = 0.4;
        v_texcoord = impact_scale*rotate_vec2(position.xy , time) + 0.5;
        v_texcoord2 = impact_scale*rotate_vec2(position.xy , -time) + 0.5;
        float scale = 1.5 + 0.3*sin(2.0*time);
        v_texcoord3 = scale * impact_scale*rotate_vec2(position.xy , -0.32323 * time) + 0.5;
    }`;

// impact.fragment //
export const impactFragmentShader = `
    varying vec2 v_texcoord0;
    varying vec2 v_texcoord;
    varying vec2 v_texcoord2;
    varying vec2 v_texcoord3;
    uniform vec3 color;
    uniform sampler2D t_color;
    uniform float time;
    void main() {
        vec3 C = texture2D(t_color, v_texcoord).rgb;
        vec3 C2 = texture2D(t_color, v_texcoord2).rgb;
        vec3 C3 = 0.6*texture2D(t_color, v_texcoord3).rgb;

        gl_FragColor.rgb = color.rgb * (C * C2) + C3;

        // grid
        {
            float x = 0.0;
            vec2 t = 4.0 * (v_texcoord0) +  1.0;
            t = t - floor(t);
            if (t.x < 0.10)
                x += 1.0;
            if (t.y < 0.10)
                x += 1.0;
            x *= 1.0 - 2.0*length(v_texcoord0  )+  1.0;
            gl_FragColor.rgb += 0.5 * x * (color.rgb * 2.0);
        }
        gl_FragColor.a = 1.0 - pow(2.0*abs(time - 0.5), 2.0);
        //  gl_FragColor.a = 1.0;
    }`;

export const missileTubeVertextShader = `
    // missile_tube //
    attribute vec4 ss;
    varying float v_alpha;
    // missile_tube.vertex //
    void main() {
        vec3 P = ss.xyz;
        v_alpha = abs(ss.w);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
    }`;

export const missileTubeFragmentShader = `
    // missile_tube.fragment //
    varying float v_alpha;
    uniform vec3 color;
    uniform float time;
    void main() {
        gl_FragColor.rgb = color;
        gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 0.1); // 3.5
    }`;

export const ringsVertextShader = `
    // rings //
    // attribute vec3 vertex;
    varying float v_alpha;
    uniform vec3 color;
    uniform float time;
    uniform float scale;

    void main() {
        float spread = 0.5 + (time * 0.3*position.z);
        vec3 P = scale * spread * vec3(position.xy, -2.50*(position.z)*time);
        P = P.xzy;
        P.y = -P.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0);
        v_alpha = 1.0 - position.z/6.0;
    }`;

export const ringsFragmentShader = `
    // rings.fragment //
    uniform vec3 color;
    varying float v_alpha;
    uniform float time;
    void main() {
        gl_FragColor.rgb = color;
        gl_FragColor.a = (1.0 - pow(time, 7.0)) * (v_alpha * time);
    }`;

// missile
export const missileVertexShader = `
    varying vec3 v_normal;
    varying vec3 v_view_vec;
    varying float v_alpha;
    varying float v_v;
    uniform vec3 view_position;
    uniform float width;

    // missile.vertex //
    void main() {
        float u = uv.x; 
        float v = uv.y; 
        v_v = v;

        float w = 0.2 + 0.3*(1.0 - pow(2.0*abs(u - 0.5), 2.0));
        w = width * w * (v - 0.5);

        vec3 P = position.xyz;
        P.x += w;

        v_normal = normalize(P);
        v_view_vec = normalize(view_position - P);
        v_alpha = u;
        gl_Position = projectionMatrix * modelViewMatrix *  vec4(P, 1.0);
    }
`;

export const missileFragmentShader = `
    uniform float time;
    uniform vec3 color;
    varying vec3 v_normal;
    varying vec3 v_view_vec;
    varying float v_alpha;
    varying float v_v;
    // missile.fragment 
    void main() {
        vec3 N = normalize(v_normal);
        vec3 V = normalize(v_view_vec);
        float NdotV = max(0.0, dot(N, V));
        float w = 1.0 - pow(abs(v_v), 4.0);
        gl_FragColor.rgb = color.rgb;
        gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5); //3.5
        gl_FragColor.a *= w;
    }
`;

//0.7 * v_alpha;
export default {
    mapVertexShader,
    mapFragmentShader,

    mapGridVertexShader,
    mapGridFragmentShader,

    mapLineVertexShader,
    mapLineFragmentShader,

    mapLableVertexShader,
    mapLableFragmentShader,

    coronaVertexShader,
    coronaFragmentShader,

    coneVertexShader,
    coneFragmentShader,

    impactVertexShader,
    impactFragmentShader,

    missileTubeVertextShader,
    missileTubeFragmentShader,

    ringsVertextShader,
    ringsFragmentShader,

    missileVertexShader,
    missileFragmentShader
};
