// mock 8th Wall engine for headless tests: a fixed camera looking down at the ground, no tracking
(function(){var mods=[],raf=0,st={};
window.XR8={addCameraPipelineModules:function(m){mods=mods.concat(m);},clearCameraPipelineModules:function(){mods=[];},
  XrController:{pipelineModule:function(){return{name:'xrc'};},configure:function(){},updateCameraProjectionMatrix:function(){},recenter:function(){}},
  GlTextureRenderer:{pipelineModule:function(){return{name:'gl'};}},
  Threejs:{pipelineModule:function(){return{name:'three',onStart:function(a){var c=a.canvas;st.renderer=new THREE.WebGLRenderer({canvas:c,antialias:true});st.renderer.setSize(innerWidth,innerHeight,false);
      st.scene=new THREE.Scene();st.scene.background=new THREE.Color(0x7a6a5a);st.camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.01,100);}};},xrScene:function(){return st;}},
  run:function(o){mods.forEach(function(m){m.onStart&&m.onStart({canvas:o.canvas});});
    st.camera.position.set(0,1.2,0.9);st.camera.lookAt(0,0,-.1);st.camera.updateMatrixWorld();
    (function loop(){raf=requestAnimationFrame(loop);mods.forEach(function(m){m.onUpdate&&m.onUpdate({});});st.renderer.render(st.scene,st.camera);})();},
  stop:function(){cancelAnimationFrame(raf);}};
window.XRExtras={FullWindowCanvas:{pipelineModule:function(){return{name:'fw'};}},Loading:{pipelineModule:function(){return{name:'ld'};}}};
setTimeout(function(){window.dispatchEvent(new Event('xrloaded'));},50);})();
