// simple //
attribute vec3 position;
uniform mat4 mvp;
uniform vec4 color;

// simple.vertex //
void main() {
    gl_Position = mvp * vec4(position, 1.0);
}

// simple.fragment //
void main() {
    gl_FragColor = color;
}


// gnomon //
attribute vec3 position;
attribute vec3 color;
varying vec3 v_color;
uniform mat4 mvp;
uniform vec4 rotation;
uniform vec3 location;
uniform float scale;

// gnomon.vertex //
vec3 transform_quat(vec3 v, vec4 q) {
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w*t + cross(q.xyz, t);
}

void main() {
    v_color = color;
    vec3 P = location + scale * transform_quat(position, rotation);
    gl_Position = mvp * vec4(P, 1.0);
}

// gnomon.fragment //
void main() {
    gl_FragColor.rgb = v_color;
    gl_FragColor.a = 1.0;
}


// scape //
attribute vec4 position;
attribute vec2 texcoord;
varying vec2 v_texcoord;
uniform mat4 mvp;
uniform vec4 color;
uniform vec3 fog_color;
uniform sampler2D pattern;

// scape.vertex //
void main() {
    vec3 P = position.xyz;
    gl_Position = mvp * vec4(P, 1.0);
    v_texcoord = texcoord + 0.5;
}

// scape.fragment //
void main() {
    gl_FragColor = color + 0.2 * texture2D(pattern, v_texcoord);

#define USE_FOG
#ifdef USE_FOG
    {
        // fog
        const float LOG2 = 1.442695;
        const float fog_density = 0.1;
        float z = gl_FragCoord.z / gl_FragCoord.w;
        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);
        gl_FragColor.rgb = mix(fog_color, gl_FragColor.rgb, fog_factor);
        gl_FragColor.a = 1.0;
    }
#endif
}

// scape_lines //
attribute vec3 position;
uniform mat4 mvp;
uniform vec4 color;

// scape_lines.vertex //
void main() {
    vec3 P = position.xyz;
    gl_Position = mvp * vec4(P, 1.0);
}

// scape_lines.fragment //
void main() {
    gl_FragColor = color;

#define USE_FOG
#ifdef USE_FOG
    {
        // fog
        const float LOG2 = 1.442695;
        const float fog_density = 0.1;
        float z = gl_FragCoord.z / gl_FragCoord.w;
        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);
        gl_FragColor.a *= fog_factor;
    }
#endif
}


// rings //
attribute vec4 position;
varying float v_side;
uniform mat4 mvp;
uniform vec3 color;

// rings.vertex //
void main() {
    vec3 P = position.xyz;
    v_side = sign(position.w);
    gl_Position = mvp * vec4(P, 1.0);
}

// rings.fragment //
void main() {
    float x = 1.0 - v_side*v_side;
    gl_FragColor = vec4(color, x);
}


// missile_tube //
attribute vec4 position;
varying float v_alpha;
uniform mat4 mvp;
uniform vec3 color;
uniform float time;

// missile_tube.vertex //
void main() {
    vec3 P = position.xyz;
    v_alpha = abs(position.w);
    gl_Position = mvp * vec4(P, 1.0);
}

// missile_tube.fragment //
void main() {
    gl_FragColor.rgb = color;
    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);
}

// connector //
attribute vec4 position;
uniform mat4 mvp;
uniform vec4 color;

// connector.vertex //
void main() {
    vec3 P = position.xyz;
    float side = position.w;
    if (side > 0.5)
        gl_Position = mvp * vec4(P, 1.0);
    else
        gl_Position = vec4(P, 1.0);
}

// connector.fragment //
void main() {
    gl_FragColor = color;
}



// hedgehog //
attribute vec2 coord;
varying vec2 v_coord;
uniform mat4 mvp;
uniform mat3 bill;
uniform vec3 position;
uniform vec2 scale;
uniform sampler2D t_color;
uniform float fade;

// hedgehog.vertex //
void main() {
    vec3 P = vec3(2.0*(coord - 0.5), 0.0);
    P.xy *= scale;
    P = bill * P;
    P += position;
    gl_Position = mvp * vec4(P, 1.0);
    v_coord = vec2(coord.x, 1.0-coord.y);
}

// hedgehog.fragment //
void main() {
    gl_FragColor = texture2D(t_color, v_coord);
    gl_FragColor.a = fade;
}
