/* â”€â”€ HERO SECTION â€” WebGL Plasma Shader Background â”€â”€ */
(function () {
  'use strict';

  const VS = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  const FS = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed      = 0.2;
    const float gridSmoothWidth   = 0.015;
    const float axisWidth         = 0.05;
    const float majorLineWidth    = 0.025;
    const float minorLineWidth    = 0.0125;
    const float majorLineFreq     = 5.0;
    const float minorLineFreq     = 1.0;
    const float scale             = 5.0;
    const float minLineWidth      = 0.01;
    const float maxLineWidth      = 0.2;
    const float lineSpeed         = 1.0 * overallSpeed;
    const float lineAmplitude     = 1.0;
    const float lineFrequency     = 0.2;
    const float warpSpeed         = 0.2 * overallSpeed;
    const float warpFrequency     = 0.5;
    const float warpAmplitude     = 1.0;
    const float offsetFrequency   = 0.5;
    const float offsetSpeed       = 1.33 * overallSpeed;
    const float minOffsetSpread   = 0.6;
    const float maxOffsetSpread   = 2.0;
    const int   linesPerGroup     = 16;

    /* Darker gold, reduced intensity so it doesn't clash with text */
    const vec4  lineColor   = vec4(0.38, 0.28, 0.12, 1.0);
    const float lineOpacity = 0.55;
    /* Dark backgrounds: pure dark â†’ subtle gold-warm dark */
    const vec4 bgColor1  = vec4(0.08,  0.08,  0.08,  1.0);
    const vec4 bgColor2  = vec4(0.155, 0.125, 0.075, 1.0);

    #define drawSmoothLine(pos, hw, t)  smoothstep(hw, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, hw, t)   smoothstep(hw + gridSmoothWidth, hw, abs(pos - (t)))
    #define drawCircle(pos, r, coord)   smoothstep(r + gridSmoothWidth, r, length(coord - (pos)))

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }

    float getPlasmaY(float x, float hFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * hFade * lineAmplitude + offset;
    }

    void main() {
      vec2 uv    = gl_FragCoord.xy / iResolution.xy;
      vec2 space = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.x * 2.0 * scale;

      float hFade = 1.0 - (cos(uv.x * 6.28318) * 0.5 + 0.5);
      float vFade = 1.0 - (cos(uv.y * 6.28318) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + hFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * hFade;

      vec4 lines = vec4(0.0);

      for (int l = 0; l < linesPerGroup; l++) {
        float nIdx        = float(l) / float(linesPerGroup);
        float offsetTime  = iTime * offsetSpeed;
        float offsetPos   = float(l) + space.x * offsetFrequency;
        float rand        = random(offsetPos + offsetTime) * 0.5 + 0.5;
        float hw          = mix(minLineWidth, maxLineWidth, rand * hFade) * 0.5;
        float offset      = random(offsetPos + offsetTime * (1.0 + nIdx)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
        float lineY       = getPlasmaY(space.x, hFade, offset);
        float line        = drawSmoothLine(lineY, hw, space.y) * 0.5
                          + drawCrispLine(lineY, hw * 0.15, space.y);

        float cx          = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2  cPos        = vec2(cx, getPlasmaY(cx, hFade, offset));
        float circle      = drawCircle(cPos, 0.01, space) * 4.0;

        lines += (line + circle) * lineColor * rand;
      }

      vec4 col  = mix(bgColor1, bgColor2, uv.x);
      col      *= vFade;
      col.a     = 1.0;
      col      += lines * lineOpacity;

      gl_FragColor = col;
    }
  `;

  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('[hero-shader] compile:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function buildProgram(gl) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VS);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[hero-shader] link:', gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  function init() {
    const canvas = document.getElementById('hero-shader-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return; /* WebGL not supported â€” hero falls back to existing dark bg */

    const prog = buildProgram(gl);
    if (!prog) return;

    /* Full-screen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos    = gl.getAttribLocation(prog, 'aVertexPosition');
    const uRes    = gl.getUniformLocation(prog, 'iResolution');
    const uTime   = gl.getUniformLocation(prog, 'iTime');

    const section = document.getElementById('hero');

    function resize() {
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();

    const t0 = performance.now();
    let raf;

    function draw() {
      const t = (performance.now() - t0) / 1000;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(aPos);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    }

    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
