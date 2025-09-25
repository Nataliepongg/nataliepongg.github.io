// Mount a simple Liquid Chrome background into #liquid-chrome-container using OGL UMD
import { Renderer, Program, Mesh, Triangle } from 'https://unpkg.com/ogl@0.0.107/dist/ogl.mjs';

(function () {
    function initLiquidChrome() {
        var container = document.getElementById('liquid-chrome-container');
        if (!container) {
            console.error('[LiquidChrome] Container not found: #liquid-chrome-container');
            return;
        }
        // Using ESM import above; no window.OGL check needed

        var renderer;
        try {
            renderer = new Renderer({ antialias: true, alpha: true, premultipliedAlpha: true });
        } catch (e) {
            console.error('[LiquidChrome] Failed to create WebGL renderer:', e);
            container.style.background = 'radial-gradient(1200px 600px at 50% 0%, rgba(122,162,255,0.12), rgba(0,0,0,0))';
            return;
        }
        var gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        renderer.dpr = Math.min(2, (window.devicePixelRatio || 1));

        var vertexShader = "\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n";

        var fragmentShader = "\nprecision highp float;\nuniform float uTime;\nuniform vec3 uResolution;\nuniform vec3 uBaseColor;\nuniform float uAmplitude;\nuniform float uFrequencyX;\nuniform float uFrequencyY;\nuniform vec2 uMouse;\nvarying vec2 vUv;\n\nvec4 renderImage(vec2 uvCoord) {\n    vec2 fragCoord = uvCoord * uResolution.xy;\n    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);\n\n    for (float i = 1.0; i < 10.0; i++){\n        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);\n        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);\n    }\n\n    vec2 diff = (uvCoord - uMouse);\n    float dist = length(diff);\n    float falloff = exp(-dist * 20.0);\n    float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;\n    uv += (diff / (dist + 0.0001)) * ripple * falloff;\n\n    vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));\n    return vec4(color, 1.0);\n}\n\nvoid main() {\n    vec4 col = vec4(0.0);\n    int samples = 0;\n    for (int i = -1; i <= 1; i++){\n        for (int j = -1; j <= 1; j++){\n            vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));\n            col += renderImage(vUv + offset);\n            samples++;\n        }\n    }\n    gl_FragColor = col / float(samples);\n}\n";

        var triangle = new Triangle(gl);
        var program;
        try {
            program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]) },
                    uBaseColor: { value: new Float32Array([0.45, 0.65, 1.0]) },
                uAmplitude: { value: 0.3 },
                uFrequencyX: { value: 3 },
                uFrequencyY: { value: 3 },
                uMouse: { value: new Float32Array([0, 0]) }
            }
            });
        } catch (err) {
            console.error('[LiquidChrome] Shader/program error:', err);
            container.style.background = 'radial-gradient(1200px 600px at 50% 0%, rgba(122,162,255,0.12), rgba(0,0,0,0))';
            return;
        }
        var mesh = new Mesh(gl, { geometry: triangle, program: program });

        function resize() {
            var w = Math.max(1, container.clientWidth);
            var h = Math.max(1, container.clientHeight);
            renderer.setSize(w, h);
            var res = program.uniforms.uResolution.value;
            res[0] = gl.canvas.width;
            res[1] = gl.canvas.height;
            res[2] = gl.canvas.width / Math.max(1, gl.canvas.height);
        }
        window.addEventListener('resize', resize);

        // Wait for layout to ensure we don't size to 0x0
        var attempts = 0;
        (function waitForSize(){
            attempts++;
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                resize();
                console.log('[LiquidChrome] Initialized with size', container.clientWidth + 'x' + container.clientHeight);
            } else if (attempts < 10) {
                requestAnimationFrame(waitForSize);
            } else {
                console.warn('[LiquidChrome] Container size still 0 after waiting; forcing resize anyway.');
                resize();
            }
        })();

        function handleMouseMove(event) {
            var rect = container.getBoundingClientRect();
            var x = (event.clientX - rect.left) / rect.width;
            var y = 1 - (event.clientY - rect.top) / rect.height;
            var m = program.uniforms.uMouse.value;
            m[0] = x;
            m[1] = y;
        }
        container.addEventListener('mousemove', handleMouseMove);

        var animationId;
        function update(t) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * 0.2;
            renderer.render({ scene: mesh });
        }
        animationId = requestAnimationFrame(update);

        container.appendChild(gl.canvas);
        if (!gl || gl.isContextLost && gl.isContextLost()) {
            console.warn('[LiquidChrome] WebGL context lost or unavailable. Showing fallback background.');
            container.style.background = 'radial-gradient(1200px 600px at 50% 0%, rgba(122,162,255,0.12), rgba(0,0,0,0))';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiquidChrome);
    } else {
        initLiquidChrome();
    }
})();


