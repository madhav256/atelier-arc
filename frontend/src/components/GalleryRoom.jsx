import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';


const WORKS = [
  { src: '/art/work-24.jpg', title: 'The Eleventh Tide', slug: 'the-eleventh-tide', position: [-2.6, 2.2, -3.65], size: [1.65, 2.03] },
  { src: '/art/work-23.jpg', title: 'Night Swimming', slug: 'night-swimming', position: [0, 2.2, -3.65], size: [1.82, 2.28] },
  { src: '/art/work-25.jpg', title: 'Glass Harbour', slug: 'glass-harbour', position: [2.6, 2.2, -3.65], size: [1.65, 2.03] },
];

function GalleryCanvas({ onError }) {
  const host = useRef(null);
  useEffect(() => {
    let disposed = false;
    let complete = false;
    let renderer;
    let frame;
    let observer;
    let visibilityObserver;
    let inView = true;
    let textures = [];
    let release = () => {};
    async function start() {
      try {
        const THREE = await import('three');
        if (disposed || !host.current) return;
        const el = host.current;
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.42;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        el.append(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#e9e6df');
        const camera = new THREE.PerspectiveCamera(43, 1, .1, 40);
        const target = new THREE.Vector3(0, 2.05, -2.9);
        camera.position.set(0, 2.3, 6.3);
        camera.lookAt(target);
        const material = (color, roughness = 1) => new THREE.MeshStandardMaterial({ color, roughness });
        const chalk = material('#faf8f3');
        const wall = material('#e9e5dc');
        const floor = material('#d2c9bc');
        const dark = material('#40362d', .7);
        const bronze = new THREE.MeshStandardMaterial({ color: '#9d7842', metalness: .42, roughness: .45 });
        const addBox = (w, h, d, x, y, z, mat, shadows = true) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          mesh.position.set(x, y, z);
          mesh.receiveShadow = true;
          mesh.castShadow = shadows;
          scene.add(mesh);
          return mesh;
        };
        addBox(13, .15, 14, 0, -.075, 0, floor, false);
        addBox(13, 5.8, .14, 0, 2.9, -3.85, chalk, false);
        addBox(.16, 5.8, 14, -6.4, 2.9, 0, wall, false);
        addBox(.16, 5.8, 14, 6.4, 2.9, 0, wall, false);
        addBox(13, .18, 14, 0, 5.8, 0, chalk, false);
        addBox(12.8, .12, .12, 0, .085, -3.68, chalk, false);
        addBox(12.8, .06, .08, 0, 5.62, -3.69, chalk, false);
        // The slim bronze plinth, soft bench and wall recess make a room, not a flat mockup.
        addBox(1.8, .19, .52, 0, .55, 1.1, wall);
        addBox(.08, .51, .42, -.68, .27, 1.1, wall);
        addBox(.08, .51, .42, .68, .27, 1.1, wall);
        addBox(1.8, .012, .012, 0, .665, .8, bronze, false);
        const loader = new THREE.TextureLoader();
        await Promise.all(WORKS.map((work) => new Promise((resolve) => {
          loader.load(work.src, (tex) => {
            if (disposed) { tex.dispose(); return resolve(); }
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
            textures.push(tex);
            const [x, y, z] = work.position;
            const [w, h] = work.size;
            addBox(w + .16, h + .16, .12, x, y, z, dark);
            addBox(w + .12, h + .12, .04, x, y, z + .075, bronze);
            addBox(w + .045, h + .045, .025, x, y, z + .107, wall);
            const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
            art.position.set(x, y, z + .126);
            scene.add(art);
            // Museum-style catalogue plaques below each frame.
            addBox(.59, .09, .015, x, y - h / 2 - .25, z + .105, wall, false);
            resolve();
          }, undefined, resolve);
        })));
        if (disposed) return;
        const ambient = new THREE.HemisphereLight('#ffffff', '#baa897', 1.45);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight('#fff6e6', 2.3);
        sun.position.set(-3.5, 5.5, 2.5);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
        sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
        sun.shadow.normalBias = .03;
        sun.shadow.bias = -.0004;
        scene.add(sun);
        const resize = () => {
          if (!el.isConnected) return;
          const width = Math.max(1, el.clientWidth);
          const height = Math.max(1, el.clientHeight);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        observer = new ResizeObserver(resize); observer.observe(el); resize();
        visibilityObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { rootMargin: '100px' });
        visibilityObserver.observe(el);
        let yaw = 0, goalYaw = 0, pitch = 0, goalPitch = 0, dragging = false;
        let lastX = 0, lastY = 0, lastInteraction = performance.now();
        const pointerDown = (e) => {
          dragging = true; lastX = e.clientX; lastY = e.clientY;
          renderer.domElement.setPointerCapture(e.pointerId);
          renderer.domElement.style.cursor = 'grabbing';
        };
        const pointerMove = (e) => {
          if (!dragging) return;
          goalYaw = THREE.MathUtils.clamp(goalYaw + (e.clientX - lastX) * .003, -.44, .44);
          goalPitch = THREE.MathUtils.clamp(goalPitch + (e.clientY - lastY) * .002, -.12, .15);
          lastX = e.clientX; lastY = e.clientY; lastInteraction = performance.now();
        };
        const pointerUp = () => { dragging = false; renderer.domElement.style.cursor = 'grab'; };
        const keyDown = (e) => {
          if (document.activeElement !== el) return;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault(); goalYaw = THREE.MathUtils.clamp(goalYaw + (e.key === 'ArrowLeft' ? -.12 : .12), -.44, .44); lastInteraction = performance.now();
          }
        };
        renderer.domElement.style.cursor = 'grab';
        renderer.domElement.addEventListener('pointerdown', pointerDown);
        renderer.domElement.addEventListener('pointermove', pointerMove);
        renderer.domElement.addEventListener('pointerup', pointerUp);
        renderer.domElement.addEventListener('pointercancel', pointerUp);
        el.addEventListener('keydown', keyDown);
        release = () => {
          renderer.domElement.removeEventListener('pointerdown', pointerDown);
          renderer.domElement.removeEventListener('pointermove', pointerMove);
          renderer.domElement.removeEventListener('pointerup', pointerUp);
          renderer.domElement.removeEventListener('pointercancel', pointerUp);
          el.removeEventListener('keydown', keyDown);
        };
        const tick = (now) => {
          if (disposed) return;
          const idle = now - lastInteraction > 2700;
          const drift = idle ? Math.sin(now * .0002) * .055 : 0;
          yaw = THREE.MathUtils.lerp(yaw, goalYaw + drift, .028);
          pitch = THREE.MathUtils.lerp(pitch, goalPitch, .035);
          camera.position.set(Math.sin(yaw) * 6.55, 2.3 + pitch * 7, Math.cos(yaw) * 6.55);
          camera.lookAt(target);
          sun.position.x = -3.5 + Math.sin(now * .00011) * .8;
          if (inView && !document.hidden) renderer.render(scene, camera);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        complete = true;
        el.dataset.ready = 'true';
        release = ((prev) => () => {
          prev();
          scene.traverse((object) => {
            object.geometry?.dispose();
            if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose());
          });
        })(release);
      } catch { if (!disposed) onError(); }
    }
    start();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      observer?.disconnect(); visibilityObserver?.disconnect(); release();
      textures.forEach((t) => t.dispose());
      if (renderer) { if (!complete) renderer.forceContextLoss(); renderer.dispose(); renderer.domElement.remove(); }
    };
  }, [onError]);
  return <div className="gallery-canvas" ref={host} tabIndex={0} role="group" aria-label="Interactive gallery room. Drag to look around or focus here and use left and right arrow keys." />;
}

export function GalleryRoom() {
  const section = useRef(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!section.current || !window.IntersectionObserver) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '220px' });
    io.observe(section.current);
    return () => io.disconnect();
  }, []);
  const [staticOnly, setStaticOnly] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(max-width: 700px)').matches));
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 700px)');
    const update = () => setStaticOnly(motion.matches || narrow.matches);
    motion.addEventListener('change', update); narrow.addEventListener('change', update);
    return () => { motion.removeEventListener('change', update); narrow.removeEventListener('change', update); };
  }, []);
  return (
    <section className="gallery-visit" ref={section} aria-labelledby="gallery-visit-title">
      <div className="gallery-visit-top"><span className="eyebrow">Atelier Arc / The viewing room</span><span className="gallery-visit-index">A ROOM FOR LOOKING &nbsp; / &nbsp; 001</span></div>
      <div className="gallery-visit-stage">
        <div className="gallery-visit-poster" role="img" aria-label="Three framed works in a sunlit, white-walled gallery room." />
        {visible && !staticOnly && !failed && <GalleryCanvas onError={() => setFailed(true)} />}
        <div className="gallery-visit-frame" aria-hidden="true" />
        <div className="gallery-visit-overlay"><span>THE PRIVATE VIEWING</span><span>01 &nbsp; / &nbsp; 03</span></div>
        {!staticOnly && !failed && <div className="gallery-visit-hint" aria-hidden="true">DRAG TO LOOK AROUND &nbsp; · &nbsp; USE ARROW KEYS</div>}
      </div>
      <div className="gallery-visit-bottom"><div><h2 id="gallery-visit-title">Art changes <em>the room.</em></h2><p>Step closer. Stay a while. Some works ask to be lived with.</p></div><Link to="/artworks" className="gallery-visit-link">Explore the collection <ArrowUpRight aria-hidden="true" /></Link></div>
    </section>
  );
}
