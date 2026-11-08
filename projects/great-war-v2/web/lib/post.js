import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const FX = {
  uniforms: {
    tDiffuse: { value: null }, res: { value: new THREE.Vector2(1920, 1080) }, time: { value: 0 },
    vignette: { value: .55 }, grain: { value: .035 }, chroma: { value: .0015 }, whip: { value: 0 }, whipAng: { value: 0 },
    comic: { value: 0 }, glitch: { value: 0 }, gseed: { value: 0 }, sat: { value: 1.08 }, temp: { value: 0 }, contrast: { value: 1.04 },
    flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) }, letterbox: { value: 0 }, zoomBlur: { value: 0 }, bw: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `
  uniform sampler2D tDiffuse; uniform vec2 res; uniform float time, vignette, grain, chroma, whip, whipAng, comic, glitch, gseed, sat, temp, contrast, flash, letterbox, zoomBlur, bw; uniform vec3 flashCol;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
  vec3 ca(vec2 uv){ vec2 d = (uv-.5)*chroma*2.; return vec3(texture2D(tDiffuse, uv+d).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv-d).b); }
  void main(){
    vec2 uv = vUv;
    if (glitch > 0.){ float row = floor(uv.y*28.); if (hash(vec2(row, gseed)) < glitch*.55) uv.x += (hash(vec2(row, gseed+1.))-.5)*.16*glitch; }
    vec3 col = vec3(0.);
    if (whip > .002){ vec2 dir = vec2(cos(whipAng), sin(whipAng))*whip*.09; for (int i=0;i<18;i++){ float k = float(i)/17.-.5; col += ca(uv+dir*k); } col /= 18.; }
    else if (zoomBlur > .002){ for (int i=0;i<16;i++){ float k = float(i)/15.; col += ca(.5+(uv-.5)*(1.-k*zoomBlur*.12)); } col /= 16.; }
    else col = ca(uv);
    if (glitch > 0.){ float h = hash(vec2(floor(uv.y*70.), gseed+3.)); col.r = mix(col.r, texture2D(tDiffuse, uv+vec2(.014*glitch*h,0.)).r, glitch); col.b = mix(col.b, texture2D(tDiffuse, uv-vec2(.014*glitch,0.)).b, glitch); }
    if (comic > 0.){
      vec2 px = 1.5/res;
      float tl=lum(texture2D(tDiffuse,uv+px*vec2(-1,1)).rgb), t=lum(texture2D(tDiffuse,uv+px*vec2(0,1)).rgb), tr=lum(texture2D(tDiffuse,uv+px*vec2(1,1)).rgb);
      float l=lum(texture2D(tDiffuse,uv+px*vec2(-1,0)).rgb), r=lum(texture2D(tDiffuse,uv+px*vec2(1,0)).rgb);
      float bl=lum(texture2D(tDiffuse,uv+px*vec2(-1,-1)).rgb), b=lum(texture2D(tDiffuse,uv+px*vec2(0,-1)).rgb), br=lum(texture2D(tDiffuse,uv+px*vec2(1,-1)).rgb);
      float gx = -tl-2.*l-bl+tr+2.*r+br, gy = -tl-2.*t-tr+bl+2.*b+br; float e = smoothstep(.18, .45, length(vec2(gx,gy)));
      vec3 lc = col * 1.18 + .035; float L0 = max(lum(lc), 1e-3), Lq = mix(floor(L0*5.+.65)/5., L0, .35); vec3 p = clamp(lc * (Lq / L0), 0., 1.); float pl = lum(p); p = clamp(mix(vec3(pl), p, 1.15), 0., 1.);
      vec2 cell = mod(vUv*res, 7.)-3.5; float dotm = step(length(cell), 3.4*(1.-pl)); p *= mix(1., .78, dotm*step(pl, .45));
      col = mix(col, mix(p, vec3(.04,.03,.06), e), comic);
    }
    float L = lum(col); col = mix(vec3(L), col, sat * (1.-bw));
    col *= vec3(1.+temp*.10, 1.+temp*.02, 1.-temp*.12);
    col = (col-.5)*contrast+.5;
    float v = smoothstep(1.05, .3, length((vUv-.5)*vec2(1.25, 1.))); col *= mix(1., v, vignette);
    col += (hash(vUv*res + fract(time*13.7)*100.)-.5)*grain;
    col = mix(col, flashCol, flash);
    float lb = letterbox*.11; if (vUv.y < lb || vUv.y > 1.-lb) col = vec3(0.);
    gl_FragColor = vec4(col, 1.);
  }`,
};

export function makePost(renderer, scene, camera, w, h){
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), .5, .5, 1.15); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fx = new ShaderPass(FX); fx.uniforms.res.value.set(w, h); composer.addPass(fx);
  return { composer, bloom, fx: fx.uniforms };
}
