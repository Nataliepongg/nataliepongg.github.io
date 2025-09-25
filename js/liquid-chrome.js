// Mount a simple Liquid Chrome background into #liquid-chrome-container using OGL UMD
(function () {
    function initLiquidChrome() {
        var container = document.getElementById('liquid-chrome-container');
        if (!container || !window.OGL) return;

        var Renderer = window.OGL.Renderer;
        var Program = window.OGL.Program;
        var Mesh = window.OGL.Mesh;
        var Triangle = window.OGL.Triangle;

        var renderer = new Renderer({ antialias: true });
        var gl = renderer.gl;
        gl.clearColor(1, 1, 1, 1);

        var vertexShader = "\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUv;\nvoid main() {\n  vUv = uv;\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n";

        var fragmentShader = "\nprecision highp float;\nuniform float uTime;\nuniform vec3 uResolution;\nuniform vec3 uBaseColor;\nuniform float uAmplitude;\nuniform float uFrequencyX;\nuniform float uFrequencyY;\nuniform vec2 uMouse;\nvarying vec2 vUv;\n\nvec4 renderImage(vec2 uvCoord) {\n    vec2 fragCoord = uvCoord * uResolution.xy;\n    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);\n\n    for (float i = 1.0; i < 10.0; i++){\n        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);\n        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);\n    }\n\n    vec2 diff = (uvCoord - uMouse);\n    float dist = length(diff);\n    float falloff = exp(-dist * 20.0);\n    float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;\n    uv += (diff / (dist + 0.0001)) * ripple * falloff;\n\n    vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));\n    return vec4(color, 1.0);\n}\n\nvoid main() {\n    vec4 col = vec4(0.0);\n    int samples = 0;\n    for (int i = -1; i <= 1; i++){\n        for (int j = -1; j <= 1; j++){\n            vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));\n            col += renderImage(vUv + offset);\n            samples++;\n        }\n    }\n    gl_FragColor = col / float(samples);\n}\n";

        var triangle = new Triangle(gl);
        var program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]) },
                uBaseColor: { value: new Float32Array([0.1, 0.1, 0.1]) },
                uAmplitude: { value: 0.3 },
                uFrequencyX: { value: 3 },
                uFrequencyY: { value: 3 },
                uMouse: { value: new Float32Array([0, 0]) }
            }
        });
        var mesh = new Mesh(gl, { geometry: triangle, program: program });

        function resize() {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            var res = program.uniforms.uResolution.value;
            res[0] = gl.canvas.width;
            res[1] = gl.canvas.height;
            res[2] = gl.canvas.width / gl.canvas.height;
        }
        window.addEventListener('resize', resize);
        resize();

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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLiquidChrome);
    } else {
        initLiquidChrome();
    }
})();


