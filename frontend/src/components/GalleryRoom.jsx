import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';

const EXHIBIT = [
  { src: '/art/work-24.jpg', title: 'The Eleventh Tide', artist: 'Zoya Merchant', slug: 'the-eleventh-tide', wall: -1, z: 3.2, w: 1.54, h: 1.92 },
  { src: '/art/work-23.jpg', title: 'Night Swimming', artist: 'Zoya Merchant', slug: 'night-swimming', wall: 1, z: .3, w: 1.63, h: 2.04 },
  { src: '/art/work-25.jpg', title: 'Glass Harbour', artist: 'Dev Mehra', slug: 'glass-harbour', wall: -1, z: -6.2, w: 1.73, h: 1.98 },
  { src: '/art/work-08.jpg', title: '', artist: '', wall: 1, z: -9.5, w: 1.65, h: 2.02 },
];

function GalleryCanvas({ onError, onProgress, onArtwork }) {
  const host = useRef(null);
  const callbacks = useRef({ onError, onProgress, onArtwork });
  callbacks.current = { onError, onProgress, onArtwork };
  useEffect(() => {
    let disposed = false;
    let renderer;
    let frame;
    let resizeObserver;
    let intersectionObserver;
    let active = true;
    let canvasHost;
    const textures = [];
    const geometries = [];
    const materials = [];
    let clean = () => {};
    async function start() {
      try {
        const T = await import('three');
        const el = host.current;
        if (disposed || !el) return;
        canvasHost = el;
        renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, window.matchMedia('(max-width: 700px)').matches ? 1 : 1.5));
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.6;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        el.append(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const scene = new T.Scene();
        scene.background = new T.Color('#b8ab99');
        scene.fog = new T.FogExp2('#c2b4a3', .012);
        const camera = new T.PerspectiveCamera(65, 1, .1, 80);
        const group = new T.Group(); scene.add(group);
        const mat = (color, roughness = .92, metalness = 0) => {
          const m = new T.MeshStandardMaterial({ color, roughness, metalness });
          materials.push(m); return m;
        };
        const limestone = mat('#d5c9b8');
        const plaster = mat('#e9e2d7');
        const floor = mat('#b3a390', .56);
        const ceiling = mat('#d9cfbf');
        const trim = mat('#998b77');
        const bronze = mat('#b09259', .35, .63);
        const innerFrame = mat('#3a352f', .75);
        const pedestal = mat('#c9c1b6', .65);
        const box = (w, h, d, x, y, z, material, shadow = false) => {
          const g = new T.BoxGeometry(w, h, d); geometries.push(g);
          const m = new T.Mesh(g, material); m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = shadow;
          group.add(m); return m;
        };
        // A long, two-bay private gallery seen at eye level, not a dollhouse.
        box(8.4, .12, 32, 0, -.06, -3, floor);
        box(8.4, .16, 32, 0, 4.88, -3, ceiling);
        box(.18, 4.9, 32, -4.2, 2.45, -3, plaster);
        box(.18, 4.9, 32, 4.2, 2.45, -3, plaster);
        box(8.4, 4.9, .18, 0, 2.45, -18.95, limestone);
        for (const side of [-1, 1]) {
          // Stone dado, fine brass picture rail and paired pilasters.
          box(.085, .92, 31.5, side * 4.04, .46, -3, limestone);
          box(.09, .025, 31.5, side * 3.98, .93, -3, bronze);
          box(.08, .06, 31.5, side * 4.03, 3.78, -3, bronze);
          box(.16, .17, 31.5, side * 3.98, .11, -3, trim);
          for (const z of [7.4, 1.15, -5.4, -12.15, -18.1]) {
            box(.18, 4.36, .34, side * 3.91, 2.73, z, limestone);
            box(.24, .16, .48, side * 3.87, 4.42, z, bronze);
          }
        }
        // Floor has large stone flags with restrained dark joints and an inset brass spine.
        for (let z = -18; z <= 12; z += 2.4) box(7.95, .007, .013, 0, .008, z, trim);
        for (const x of [-2, 0, 2]) box(.012, .008, 31.5, x, .009, -3, trim);
        for (const x of [-3.35, 3.35]) box(.019, .008, 31.5, x, .011, -3, bronze);
        // Coiffed ceiling coves and a repeated run of light wells create depth and rhythm.
        for (const z of [8.2, 1.8, -4.6, -11, -17.4]) {
          box(8.15, .09, .15, 0, 4.71, z, plaster);
          box(4.4, .028, 2.75, 0, 4.76, z - 2.3, bronze);
          box(4.3, .019, 2.66, 0, 4.735, z - 2.3, mat('#fbf3e4', .95));
          const area = new T.PointLight('#ffe9c8', 13, 8, 2);
          area.position.set(0, 4.35, z - 2.3); scene.add(area);
        }
        box(7.7, .12, .13, 0, 4.65, -18.8, bronze);
        // A dark bronze portal divides the long sightline into separate rooms.
        for (const z of [-2.65, -13.65]) {
          box(.36, 4.8, .32, -3.86, 2.4, z, bronze);
          box(.36, 4.8, .32, 3.86, 2.4, z, bronze);
          box(7.65, .25, .32, 0, 4.66, z, bronze);
          box(.08, 4.2, .08, -3.63, 2.5, z + .19, innerFrame);
          box(.08, 4.2, .08, 3.63, 2.5, z + .19, innerFrame);
        }
        // A single abstract sculpture gives the second bay a proper sightline.
        box(1.4, .72, 1.4, .25, .36, -15.4, pedestal, true);
        box(1.46, .035, 1.46, .25, .74, -15.4, bronze);
        const artGeometry = new T.TorusKnotGeometry(.46, .12, 128, 12, 2, 3);
        geometries.push(artGeometry);
        const sculpture = new T.Mesh(artGeometry, bronze);
        sculpture.position.set(.25, 1.42, -15.4); sculpture.scale.set(.68, 1.35, .6);
        sculpture.castShadow = true; group.add(sculpture);
        const loader = new T.TextureLoader();
        await Promise.all(EXHIBIT.map((work) => new Promise((resolve) => {
          loader.load(work.src, (texture) => {
            if (disposed) { texture.dispose(); return resolve(); }
            textures.push(texture); texture.colorSpace = T.SRGBColorSpace;
            texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
            const { wall, z, w, h } = work;
            const x = wall * 3.96;
            box(.09, h + .3, w + .3, x, 2.55, z, innerFrame, true);
            box(.025, h + .18, w + .18, x - wall * .063, 2.55, z, bronze);
            box(.025, h + .055, w + .055, x - wall * .08, 2.55, z, limestone);
            const g = new T.PlaneGeometry(w, h); geometries.push(g);
            const m = new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide }); materials.push(m);
            const art = new T.Mesh(g, m);
            art.rotation.y = -wall * Math.PI / 2;
            art.position.set(x - wall * .103, 2.55, z);
            group.add(art);
            box(.024, .095, .44, x - wall * .057, 1.18, z + .25, bronze);
            const spot = new T.SpotLight('#fff3db', 28, 6.5, .61, .7, 2);
            spot.position.set(wall * 2.35, 4.08, z + .15); spot.target.position.set(wall * 3.93, 2.45, z);
            group.add(spot, spot.target);
            resolve();
          }, undefined, resolve);
        })));
        if (disposed) return;
        scene.add(new T.HemisphereLight('#fff9ec', '#776c5e', 2.15));
        const sun = new T.DirectionalLight('#ffebcd', 2.8);
        sun.position.set(-1.6, 7.5, 5);
        sun.castShadow = true; sun.shadow.mapSize.set(window.matchMedia('(max-width: 700px)').matches ? 512 : 1024, window.matchMedia('(max-width: 700px)').matches ? 512 : 1024);
        sun.shadow.camera.left = -7; sun.shadow.camera.right = 7;
        sun.shadow.camera.top = 15; sun.shadow.camera.bottom = -20;
        sun.shadow.bias = -.0006; sun.shadow.normalBias = .03;
        scene.add(sun);
        resizeObserver = new ResizeObserver(() => {
          if (!el.isConnected) return;
          const width = Math.max(1, el.clientWidth), height = Math.max(1, el.clientHeight);
          camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
        }); resizeObserver.observe(el);
        intersectionObserver = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { rootMargin: '100px' });
        intersectionObserver.observe(el);
        let z = 9.2, x = -.3, yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
        let drag = null, last = performance.now(), lastNotice = 0, lastWork = '';
        let dragDistance = 0;
        let walking = true, manualUntil = 0;
        const keys = new Set();
        const state = (now) => {
          const work = EXHIBIT.find((w) => w.title && Math.abs(z - w.z) < 1.75 && (w.wall < 0 ? yaw > .1 : yaw < -.1));
          if (work?.title !== lastWork) {
            lastWork = work?.title || '';
            callbacks.current.onArtwork(work || null);
          }
          if (now - lastNotice > 300) {
            callbacks.current.onProgress(Math.round(T.MathUtils.clamp((9.2 - z) / 25.1, 0, 1) * 100));
            lastNotice = now;
          }
        };
        const down = (e) => { if (e.pointerType === 'touch') e.preventDefault(); dragDistance = 0; drag = { x: e.clientX, y: e.clientY }; renderer.domElement.setPointerCapture(e.pointerId); renderer.domElement.style.cursor = 'grabbing'; manualUntil = performance.now() + 10000; };
        const move = (e) => {
          if (!drag) return;
          if (e.pointerType === 'touch') e.preventDefault();
          dragDistance += Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y);
          targetYaw = T.MathUtils.clamp(targetYaw - (e.clientX - drag.x) * .0036, -1.12, 1.12);
          targetPitch = T.MathUtils.clamp(targetPitch - (e.clientY - drag.y) * .0028, -.42, .42);
          drag = { x: e.clientX, y: e.clientY }; manualUntil = performance.now() + 10000;
        };
        const up = () => { drag = null; renderer.domElement.style.cursor = 'grab'; };
        const keyDown = (e) => {
          if (!active || document.activeElement?.matches('input, textarea, select, [contenteditable=true]')) return;
          const key = e.key.toLowerCase();
          if (!['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) return;
          e.preventDefault(); keys.add(key); manualUntil = performance.now() + 8000;
        };
        const keyUp = (e) => keys.delete(e.key.toLowerCase());
        const blur = () => keys.clear();
        const click = () => {
          if (dragDistance > 6) return;
          const item = EXHIBIT.find((w) => w.title && Math.abs(z - w.z) < 2.8 && (w.wall < 0 ? yaw > .15 : yaw < -.15));
          if (item) callbacks.current.onArtwork(item);
        };
        renderer.domElement.style.cursor = 'grab';
        renderer.domElement.style.touchAction = 'none';
        renderer.domElement.addEventListener('pointerdown', down);
        renderer.domElement.addEventListener('pointermove', move);
        renderer.domElement.addEventListener('pointerup', up);
        renderer.domElement.addEventListener('pointercancel', up);
        renderer.domElement.addEventListener('click', click);
        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);
        window.addEventListener('blur', blur);
        const reset = () => { z = 9.2; x = -.3; yaw = targetYaw = pitch = targetPitch = 0; walking = true; manualUntil = 0; };
        const onCommand = (e) => {
          if (e.detail === 'reset') reset();
          else if (e.detail === 'pause') walking = false;
          else if (e.detail === 'play') walking = true;
          else if (e.detail?.type === 'move') {
            if (e.detail.pressed) { keys.add(e.detail.key); manualUntil = performance.now() + 8000; }
            else keys.delete(e.detail.key);
          }
        };
        el.addEventListener('gallery-command', onCommand);
        clean = () => {
          renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointermove', move);
          renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointercancel', up);
          renderer.domElement.removeEventListener('click', click);
          window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp);
          window.removeEventListener('blur', blur); el.removeEventListener('gallery-command', onCommand);
        };
        const tick = (now) => {
          if (disposed) return;
          const dt = Math.min((now - last) / 1000, .05); last = now;
          if (active && !document.hidden) {
            const forward = ((keys.has('w') || keys.has('arrowup')) ? 1 : 0) - ((keys.has('s') || keys.has('arrowdown')) ? 1 : 0);
            const strafe = ((keys.has('d') || keys.has('arrowright')) ? 1 : 0) - ((keys.has('a') || keys.has('arrowleft')) ? 1 : 0);
            if (forward || strafe) {
              z -= forward * dt * 2.1 * Math.cos(targetYaw);
              x += (strafe * Math.cos(targetYaw) - forward * Math.sin(targetYaw)) * dt * 2.1;
            } else if (walking && now > manualUntil && z > -15.3) z -= dt * .74;
            z = T.MathUtils.clamp(z, -17.3, 9.2); x = T.MathUtils.clamp(x, -2.65, 2.65);
            if (walking && now > manualUntil) targetYaw = T.MathUtils.damp(targetYaw, Math.sin(now * .00027) * .12, .3, dt);
            yaw = T.MathUtils.damp(yaw, targetYaw, 5, dt); pitch = T.MathUtils.damp(pitch, targetPitch, 5, dt);
            const gait = (forward || strafe || (walking && now > manualUntil && z > -15.3)) ? Math.sin(now * .008) * .012 : 0;
            camera.position.set(x, 1.73 + gait, z);
            camera.rotation.order = 'YXZ'; camera.rotation.y = yaw; camera.rotation.x = pitch;
            sun.position.x = -1.6 + Math.sin(now * .00016) * .65;
            sculpture.rotation.y += dt * .075;
            state(now);
            renderer.render(scene, camera);
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        el.dataset.ready = 'true';
        el.closest('.gallery-visit-stage')?.classList.add('is-rendered');
      } catch { if (!disposed) callbacks.current.onError(); }
    }
    start();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      resizeObserver?.disconnect(); intersectionObserver?.disconnect(); clean();
      geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); textures.forEach((t) => t.dispose());
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
      canvasHost?.closest('.gallery-visit-stage')?.classList.remove('is-rendered');
    };
  }, []);
  return <div className="gallery-canvas" ref={host} tabIndex={0} role="group" aria-label="Walk-through gallery. Drag to look, use arrow keys to walk or the touch controls on mobile. The guided visit plays automatically; pause or reset below." />;
}

export function GalleryRoom() {
  const section = useRef(null);
  const stage = useRef(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [staticOnly, setStaticOnly] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [work, setWork] = useState(null);
  useEffect(() => {
    if (!section.current || !window.IntersectionObserver) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '220px' });
    io.observe(section.current); return () => io.disconnect();
  }, []);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setStaticOnly(motion.matches);
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);
  const command = (name) => stage.current?.querySelector('.gallery-canvas')?.dispatchEvent(new CustomEvent('gallery-command', { detail: name }));
  const toggle = () => { command(playing ? 'pause' : 'play'); setPlaying(!playing); };
  const moveButton = (key, Icon, label) => <button key={key} type="button" aria-label={label} onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); command({ type: 'move', key, pressed: true }); }} onPointerUp={() => command({ type: 'move', key, pressed: false })} onPointerCancel={() => command({ type: 'move', key, pressed: false })} onLostPointerCapture={() => command({ type: 'move', key, pressed: false })}><Icon aria-hidden="true" /></button>;
  return (
    <section className="gallery-visit" ref={section} aria-labelledby="gallery-visit-title">
      <div className="gallery-visit-top"><span className="eyebrow">Atelier Arc / The private viewing</span><span className="gallery-visit-index">A WALK THROUGH THE COLLECTION &nbsp; / &nbsp; 001</span></div>
      <div className="gallery-visit-stage" ref={stage}>
        <div className="gallery-visit-poster" role="img" aria-label="A first-person view down a stone-floored private gallery lined with contemporary art." />
        {visible && !staticOnly && !failed && <GalleryCanvas onError={() => setFailed(true)} onProgress={setProgress} onArtwork={setWork} />}
        <div className="gallery-visit-frame" aria-hidden="true" />
        <div className="gallery-visit-overlay"><span>THE PRIVATE VIEWING</span><span>01 &nbsp; / &nbsp; 03</span></div>
        {!staticOnly && !failed && <div className="gallery-visit-ui">
          {work && <div className="gallery-visit-work"><span>NOW VIEWING</span><strong>{work.title}</strong><small>{work.artist}</small>{work.slug && <Link to={`/artworks/${work.slug}`}>Discover the work <ArrowUpRight size={15} aria-hidden="true" /></Link>}</div>}
          <div className="gallery-visit-controls"><span className="gallery-visit-hint">A PRIVATE WALK THROUGH ART &nbsp; · &nbsp; DRAG TO LOOK &nbsp; · &nbsp; ARROW KEYS TO MOVE</span><div className="gallery-visit-touch" aria-label="Walk controls">{moveButton('arrowleft', ArrowLeft, 'Walk left')}{moveButton('arrowup', ArrowUp, 'Walk forward')}{moveButton('arrowdown', ArrowDown, 'Walk backward')}{moveButton('arrowright', ArrowRight, 'Walk right')}</div><div><button onClick={toggle} type="button" aria-label={playing ? 'Pause guided visit' : 'Play guided visit'}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button><button type="button" onClick={() => { command('reset'); setProgress(0); setPlaying(true); }} aria-label="Restart guided visit"><RotateCcw aria-hidden="true" /></button></div></div>
          <div className="gallery-visit-progress" role="progressbar" aria-label="Gallery walk progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
        </div>}
      </div>
      <div className="gallery-visit-bottom"><div><h2 id="gallery-visit-title">Enter the <em>collection.</em></h2><p>Not simply a room to see art. A space to meet it.</p></div><Link to="/artworks" className="gallery-visit-link">Explore the collection <ArrowUpRight aria-hidden="true" /></Link></div>
    </section>
  );
}
