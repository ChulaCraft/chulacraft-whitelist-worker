(function () {
  if (customElements.get('croissant-3d')) return;
  // Ported from the Claude Design handoff; three now comes from npm instead of the CDN.
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  // left tip → right tip of the croissant
  const PARTS = [
    { title: 'Certificate', color: '#E0B03A', land: 215, port: 240, nb: 7, tw: 1.2, depth: 0.05, bake: 0.45, top: 'pearl' },
    { title: 'Experience', color: '#D9782B', land: 160, port: 140, nb: 14, tw: 2.4, depth: 0.075, bake: 0.8, top: 'deep' },
    { title: 'About me', color: '#A5323F', land: 90, port: 90, nb: 9, tw: 1.6, depth: 0.06, bake: 0.6, top: 'dust' },
    { title: 'Activity', color: '#3C8C68', land: 20, port: 40, nb: 10, tw: -1.9, depth: 0.055, bake: 0.55, top: 'almond' },
    { title: 'Interest', color: '#2F63B0', land: 325, port: 300, nb: 8, tw: 1.4, depth: 0.05, bake: 0.65, top: 'drizzle' }
  ];

  class Croissant3D extends HTMLElement {
    connectedCallback() {
      if (this._alive) return;
      this._alive = true;
      Object.assign(this.style, { display: 'block', position: 'absolute', inset: '0', overflow: 'hidden' });
      import('three').then(T => { if (this._alive) this.setup(T); }).catch(() => { window.__croissantReady = true; this.dispatchEvent(new CustomEvent('croissant-ready', { bubbles: true, composed: true })); });
    }
    disconnectedCallback() {
      this._alive = false;
      cancelAnimationFrame(this._raf);
      (this._cleanup || []).forEach(f => f());
      if (this._renderer) this._renderer.dispose();
      this.innerHTML = '';
    }
    setup(T) {
      const attr = (n, d) => this.getAttribute(n) ?? d;
      const size = parseFloat(attr('size', '1'));
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const coarse = matchMedia('(pointer: coarse)').matches;
      const mobile = coarse || innerWidth < 700;
      const cleanup = this._cleanup = [];
      const labelFont = attr('label-font', "italic 500 26px 'Cormorant Garamond', serif");
      const labelColor = attr('label-color', 'var(--color-text)');

      const renderer = this._renderer = new T.WebGLRenderer({ antialias: !mobile, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
      this.appendChild(renderer.domElement);
      const overlay = document.createElement('div');
      Object.assign(overlay.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
      this.appendChild(overlay);

      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 8.5);
      scene.add(new T.HemisphereLight(0xffe2b8, 0x9a8470, 1.25));
      const key = new T.DirectionalLight(0xffd6a0, 2.6); key.position.set(-3, 5, 4); scene.add(key);
      const rim = new T.DirectionalLight(0xff8a3c, 1.2); rim.position.set(3, 1.5, -4); scene.add(rim);
      const fill = new T.DirectionalLight(0xffc890, 0.5); fill.position.set(4, -2, 3); scene.add(fill);

      const root = new T.Group(); scene.add(root);
      const tilt = new T.Group(); root.add(tilt);
      const spin = new T.Group(); tilt.add(spin);
      const BASE_X = -1.05;

      const N = PARTS.length, R = 1.55, seg = mobile ? [56, 40] : [140, 100];
      const cDust = new T.Color('#FBF7F0'), cChoc = new T.Color('#3B2014');
      const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })();
      const cPale = new T.Color('#F0CD8C'), cGold = new T.Color('#D2903F'), cBrown = new T.Color('#7C3F16');
      const mat = new T.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.32, sheen: 0.4, sheenColor: new T.Color('#ffd79a'), sheenRoughness: 0.6 });
      const lobes = [], hitMeshes = [];
      for (let i = 0; i < N; i++) {
        const P = PARTS[i];
        const s = i / (N - 1) * 2 - 1;
        const ang = s * 1.12 + Math.sign(s) * Math.pow(Math.abs(s), 3) * 0.3;
        const r = 0.24 + 0.56 * Math.pow(1 - s * s, 0.75);
        const len = 0.72 + 0.12 * (1 - Math.abs(s)) + 0.1 * Math.pow(Math.abs(s), 2);
        const geo = new T.SphereGeometry(1, seg[0], seg[1]);
        const pos = geo.attributes.position;
        const col = new Float32Array(pos.count * 3);
        const TAU = Math.PI * 2;
        for (let k = 0; k < pos.count; k++) {
          const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k);
          const th = Math.atan2(z, y);
          const band = th * P.nb / TAU + x * P.tw;
          const f = band - Math.floor(band);
          const ledge = smooth(0, 0.1, f);
          const sheet = P.depth * ledge * (1 - f * 0.65);
          const fine = 0.012 * Math.sin(th * 47 + x * 31 + i) * Math.sin(x * 23 - th * 11) + 0.006 * Math.sin(th * 97 + x * 61);
          const tipK = 1 - Math.pow(Math.abs(x), 3) * 0.7;
          let drizzle = 0;
          if (P.top === 'drizzle' && z > 0.15) { const d = Math.abs(Math.sin(x * 9 + y * 2.5 + Math.sin(x * 4) * 0.8)); if (d < 0.2) drizzle = (1 - d / 0.2); }
          const b = 1 + (sheet + fine) * tipK + drizzle * 0.02;
          let pz = z * r * 0.84 * b; if (pz < 0) pz *= 0.55;
          pos.setXYZ(k, x * len, y * r * b, pz);
          const c = cGold.clone().lerp(cPale, smooth(0.5, 1, Math.abs(x)) * 0.85);
          c.lerp(cPale, (1 - ledge) * 0.55);
          c.lerp(cBrown, clamp(Math.max(0, z) * (1 - Math.abs(x)) * P.bake + Math.abs(s) * 0.3 * Math.max(0, z) + ledge * (1 - f) * 0.35 * P.bake, 0, 0.85));
          if (z < -0.3) c.lerp(cGold, 0.4);
          if (P.top === 'dust' && z > 0.3) { const n = 0.5 + 0.5 * Math.sin(x * 37 + th * 29) * Math.sin(th * 17 - x * 13); if (n > 0.5) c.lerp(cDust, clamp((z - 0.3) * 2.2 * (n - 0.3), 0, 0.92)); }
          if (drizzle > 0) c.lerp(cChoc, smooth(0, 0.4, drizzle) * 0.95);
          col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
        }
        geo.setAttribute('color', new T.BufferAttribute(col, 3));
        geo.computeVertexNormals();
        // outline hull: same shape pushed out along normals, drawn back-facing in the part's color
        const hull = new T.SphereGeometry(1, seg[0] >> 1, seg[1] >> 1);
        const hp = hull.attributes.position;
        for (let k = 0; k < hp.count; k++) { let z = hp.getZ(k) * r * 0.84; if (z < 0) z *= 0.55; hp.setXYZ(k, hp.getX(k) * len, hp.getY(k) * r, z); }
        hull.computeVertexNormals();
        const hn = hull.attributes.normal;
        for (let k = 0; k < hp.count; k++) hp.setXYZ(k, hp.getX(k) + hn.getX(k) * 0.07, hp.getY(k) + hn.getY(k) * 0.07, hp.getZ(k) + hn.getZ(k) * 0.07);
        const hullMat = new T.MeshBasicMaterial({ color: new T.Color(P.color), side: T.BackSide, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
        const m = new T.Group();
        const body = new T.Mesh(geo, mat); body.userData.i = i;
        const hullMesh = new T.Mesh(hull, hullMat);
        m.add(hullMesh); m.add(body);
        if (P.top === 'pearl' || P.top === 'almond') {
          const nrm = geo.attributes.normal, spots = [];
          for (let k = 0; k < pos.count; k += 3) if (nrm.getZ(k) > 0.6 && Math.abs(pos.getX(k) / len) < 0.78) spots.push(k);
          const cnt = P.top === 'pearl' ? (mobile ? 40 : 80) : (mobile ? 12 : 22);
          const tg = P.top === 'pearl' ? new T.IcosahedronGeometry(0.032, 0) : new T.CylinderGeometry(0.1, 0.1, 0.02, 16);
          const tm = new T.MeshStandardMaterial({ color: P.top === 'pearl' ? 0xfbf8f2 : 0xe8cfa4, roughness: P.top === 'pearl' ? 0.35 : 0.6 });
          const inst = new T.InstancedMesh(tg, tm, cnt);
          const q = new T.Quaternion(), sp = new T.Quaternion(), up = new T.Vector3(0, 1, 0), n = new T.Vector3(), pp = new T.Vector3(), sc3 = new T.Vector3(), mm = new T.Matrix4();
          for (let j = 0; j < cnt; j++) {
            const k = spots[Math.floor(Math.random() * spots.length)];
            n.fromBufferAttribute(nrm, k); pp.fromBufferAttribute(pos, k).addScaledVector(n, 0.012);
            q.setFromUnitVectors(up, n); sp.setFromAxisAngle(up, Math.random() * 6.28); q.multiply(sp);
            if (P.top === 'almond') { const tiltQ = new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.9); q.multiply(tiltQ); sc3.set(0.8 + Math.random() * 0.4, 1, 0.55 + Math.random() * 0.2); }
            else sc3.setScalar(0.7 + Math.random() * 0.7);
            mm.compose(pp, q, sc3); inst.setMatrixAt(j, mm);
          }
          m.add(inst);
        }
        const glow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: glowTex, color: new T.Color(P.color), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        glow.renderOrder = -1; spin.add(glow);
        const base = new T.Vector3(R * Math.sin(ang), R * Math.cos(ang) - R * 0.46, 0);
        m.position.copy(base); m.rotation.z = -ang;
        spin.add(m); hitMeshes.push(body);
        const el = document.createElement('div');
        el.innerHTML = `<span style="display:inline-block;padding-bottom:4px;border-bottom:2px solid ${P.color}">${P.title}</span>`;
        Object.assign(el.style, { position: 'absolute', left: '0', top: '0', whiteSpace: 'nowrap', opacity: '0', font: labelFont, color: labelColor, willChange: 'transform' });
        overlay.appendChild(el);
        lobes.push({ glow, m, geo, hullMat, hullMesh, ang, base, r, len, s, el, i, h: 0, P, rs: clamp(0.5 / r, 0.62, 1.25), nx: 0, ny: 0, samples: (() => { const out = []; for (let k = 0; k < hp.count; k += 7) out.push(new T.Vector3(hp.getX(k), hp.getY(k), hp.getZ(k))); return out; })() });
      }

      // background world, revealed as the croissant unwraps
      let accentReady = false;
      const accent = getComputedStyle(this).getPropertyValue('--color-accent').trim() || '#b68235';
      const floor = new T.Group(); scene.add(floor);
      floor.position.set(0, -0.9, -2.2); floor.rotation.x = -1.2;
      const rings = [];
      const RN = mobile ? 16 : 26;
      for (let j = 0; j < RN; j++) {
        const pts = [], rr = 0.9 + j * 0.38, seed = j * 1.7;
        for (let a = 0; a < 200; a++) { const t2 = a / 200 * Math.PI * 2; const w = 1 + 0.04 * Math.sin(t2 * 3 + seed) + 0.02 * Math.sin(t2 * 7 - seed * 2) + 0.01 * Math.sin(t2 * 17 + seed); pts.push(new T.Vector3(Math.cos(t2) * rr * w * 1.25, Math.sin(t2) * rr * w, 0)); }
        const lm = new T.LineBasicMaterial({ color: new T.Color(j % 5 === 0 ? accent : '#8a7f72'), transparent: true, opacity: 0, depthWrite: false });
        const line = new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), lm);
        floor.add(line); rings.push({ line, lm, j, dir: j % 2 ? 1 : -1 });
      }
      const PC = mobile ? 500 : 1400;
      const pgeo = new T.BufferGeometry(), pp = new Float32Array(PC * 3), pc = new Float32Array(PC * 3);
      const tones = ['#c9a36a', '#b68235', '#8a7f72', '#e6d3b0'].map(h => new T.Color(h)), partCols = PARTS.map(x => new T.Color(x.color));
      for (let j = 0; j < PC; j++) {
        const u = Math.random() * 2 - 1, ph = Math.random() * Math.PI * 2, rad = 2.6 + Math.pow(Math.random(), 0.7) * 7;
        const sq = Math.sqrt(1 - u * u);
        pp[j * 3] = Math.cos(ph) * sq * rad * 1.4; pp[j * 3 + 1] = u * rad * 0.8; pp[j * 3 + 2] = Math.sin(ph) * sq * rad * 0.6 - 3;
        const cc = Math.random() < 0.22 ? partCols[j % partCols.length] : tones[j % tones.length];
        pc[j * 3] = cc.r; pc[j * 3 + 1] = cc.g; pc[j * 3 + 2] = cc.b;
      }
      pgeo.setAttribute('position', new T.BufferAttribute(pp, 3)); pgeo.setAttribute('color', new T.BufferAttribute(pc, 3));
      const pmat = new T.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true, toneMapped: false });
      const dust = new T.Points(pgeo, pmat); scene.add(dust);
      accentReady = true;

      const flakes = [];
      if (!reduce) {
        const fGeo = new T.PlaneGeometry(0.07, 0.045);
        for (let i = 0; i < 24; i++) {
          const fm = new T.Mesh(fGeo, new T.MeshStandardMaterial({ color: i % 2 ? 0xd9a052 : 0xf0cd8c, side: T.DoubleSide, transparent: true, opacity: 0, roughness: 0.6 }));
          fm.visible = false; scene.add(fm);
          flakes.push({ m: fm, v: new T.Vector3(), life: 0, spin: new T.Vector3() });
        }
      }
      let fi = 0;
      const spawnFlake = () => {
        const f = flakes[fi++ % flakes.length]; if (!f) return;
        lobes[Math.floor(Math.random() * N)].m.getWorldPosition(f.m.position);
        f.m.position.x += (Math.random() - .5) * .4; f.m.position.y += (Math.random() - .5) * .3;
        f.v.set((Math.random() - .5) * 1.2, Math.random() * .6 + .2, (Math.random() - .2) * .8);
        f.spin.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        f.life = 1; f.m.visible = true;
      };

      let bitten = false;
      const bite = () => {
        if (bitten || mobile || reduce) return; bitten = true;
        const L = lobes[N - 1], g = L.geo, pos = g.attributes.position, col = g.attributes.color;
        const c = new T.Vector3(L.len * 1.05, L.r * 0.3, L.r * 0.4), rb = 0.34, p = new T.Vector3();
        for (let k = 0; k < pos.count; k++) {
          p.fromBufferAttribute(pos, k);
          if (p.distanceTo(c) < rb) {
            p.sub(c).normalize().multiplyScalar(rb * (0.95 + 0.05 * Math.sin(Math.atan2(p.y, p.x) * 7))).add(c);
            pos.setXYZ(k, p.x, p.y, p.z); col.setXYZ(k, 0.97, 0.86, 0.62);
          }
        }
        pos.needsUpdate = true; col.needsUpdate = true; g.computeVertexNormals();
        for (let i = 0; i < 10; i++) spawnFlake();
      };

      // pointer + hover
      const ray = new T.Raycaster(), ndc = new T.Vector2();
      let nx = 0, ny = 0, lastX = 0, lastY = 0, lastT = 0, hovered = -1, e = 0;
      const pick = ev => {
        const rc = renderer.domElement.getBoundingClientRect();
        ndc.set((ev.clientX - rc.left) / rc.width * 2 - 1, -((ev.clientY - rc.top) / rc.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(hitMeshes, false)[0];
        return hit ? hit.object.userData.i : -1;
      };
      const onMove = ev => {
        nx = ev.clientX / innerWidth * 2 - 1; ny = ev.clientY / innerHeight * 2 - 1;
        const now = performance.now(), dt = now - lastT;
        if (dt > 0 && dt < 100 && e < 0.2) { const sp = Math.hypot(ev.clientX - lastX, ev.clientY - lastY) / dt; if (sp > 2.2 && Math.random() < 0.5) spawnFlake(); }
        lastX = ev.clientX; lastY = ev.clientY; lastT = now;
      };
      const onCanvasMove = ev => {
        if (ev.pointerType === 'touch') return;
        hovered = e > 0.6 ? pick(ev) : -1;
        renderer.domElement.style.cursor = hovered >= 0 || (e < 0.1 && !mobile && !bitten) ? 'pointer' : 'default';
      };
      const onLeave = () => { hovered = -1; };
      const onClick = ev => {
        if (e < 0.1) return bite();
        if (e > 0.6) {
          const i = pick(ev);
          if (ev.pointerType === 'touch' || coarse) hovered = i === hovered ? -1 : i;
          if (i >= 0) this.dispatchEvent(new CustomEvent('part-select', { bubbles: true, detail: { index: i, title: PARTS[i].title } }));
        }
      };
      if (!coarse) { addEventListener('pointermove', onMove); cleanup.push(() => removeEventListener('pointermove', onMove)); }
      renderer.domElement.addEventListener('pointermove', onCanvasMove);
      renderer.domElement.addEventListener('pointerleave', onLeave);
      renderer.domElement.addEventListener('click', onClick);

      let W = 1, H = 1, ringRX = 3, ringRY = 1.8, portrait = false, wpp = 0.01;
      const resize = () => {
        W = Math.max(1, this.clientWidth); H = Math.max(1, this.clientHeight);
        renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
        const halfH = camera.position.z * Math.tan(camera.fov * Math.PI / 360), halfW = halfH * camera.aspect;
        portrait = camera.aspect < 0.9;
        const sc = Math.min(1, (halfW * 2 * 0.9) / 4.4) * size;
        root.scale.setScalar(sc);
        wpp = (2 * halfH / H) / sc;
        ringRX = Math.min(halfW * (portrait ? 0.72 : 0.72), halfH * 1.9) / sc;
        ringRY = halfH * (portrait ? 0.68 : 0.7) / sc;
      };
      const ro = new ResizeObserver(resize); ro.observe(this); cleanup.push(() => ro.disconnect());
      resize();

      let visible = true;
      const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; });
      io.observe(this); cleanup.push(() => io.disconnect());

      const pin = this.closest('[data-pin]');
      const boxEl = pin && pin.querySelector('[data-center]');
      let p = 0, last = performance.now();
      const v = new T.Vector3(), qa = new T.Quaternion(), qb = new T.Quaternion(), zAxis = new T.Vector3(0, 0, 1), yAxis = new T.Vector3(0, 1, 0);
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (!visible) return;
        let target = 0;
        if (pin) { const rc = pin.getBoundingClientRect(); target = clamp(-rc.top / Math.max(1, rc.height - innerHeight) / 0.75, 0, 1); }
        target = Math.max(target, parseFloat(attr('force', '0')) || 0);
        if (reduce) target = 1;
        p += (target - p) * (reduce ? 1 : Math.min(1, dt * 6));
        e = smooth(0, 1, p);
        if (e <= 0.6) hovered = -1;
        if (pin) pin.style.setProperty('--unfold', e.toFixed(3));
        const t = now / 1000;
        spin.rotation.z = reduce ? 0 : Math.sin(t * 0.35) * 0.45 * (1 - e);
        tilt.rotation.x = BASE_X * (1 - e * 0.85) + ny * 0.16 * (1 - e * 0.6);
        tilt.rotation.y = nx * 0.28 * (1 - e * 0.7);
        root.position.z = reduce ? 0 : Math.sin(now / 1400) * 0.06;
        const anyHover = hovered >= 0;
        const proj = (x, y) => { v.set(x, y, 0); spin.localToWorld(v); v.project(camera); return [(v.x * .5 + .5) * W, (-v.y * .5 + .5) * H]; };
        const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
        let box = null;
        if (boxEl && e > 0.05) {
          const cr = renderer.domElement.getBoundingClientRect();
          let l = 1e9, tp = 1e9, r = -1e9, b = -1e9;
          for (const ch of boxEl.children) { const q = ch.getBoundingClientRect(); if (!q.width) continue; l = Math.min(l, q.left); tp = Math.min(tp, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
          if (r > l) box = { l: l - cr.left - 14, t: tp - cr.top - 10, r: r - cr.left + 14, b: b - cr.top + 10 };
        }
        // layout pass: push each lobe's ring target outward until its screen footprint clears the centre text
        for (const L of lobes) {
          const th = (portrait ? L.P.port : L.P.land) * Math.PI / 180;
          const grow = 1 + L.h * 0.12;
          let k = 1, rect = null, c = [0, 0];
          for (let it = 0; it < 10; it++) {
            const tx = ringRX * Math.cos(th) * k, ty = ringRY * Math.sin(th) * k;
            c = proj(tx, ty);
            const ex = proj(tx + L.len * L.rs * 1.15 * grow, ty), ey = proj(tx, ty + L.r * L.rs * 1.25 * grow);
            const rw = Math.abs(ex[0] - c[0]), rh = Math.abs(ey[1] - c[1]);
            rect = { l: c[0] - rw, r: c[0] + rw, t: c[1] - rh, b: c[1] + rh };
            L.tx = tx; L.ty = ty;
            if (!box || !overlap(rect, box)) break;
            k += 0.06;
          }
          L.th = th; L.rect = rect; L.c = c;
        }
        for (const L of lobes) {
          L.h += ((L.i === hovered ? 1 : 0) - L.h) * Math.min(1, dt * (reduce ? 60 : 9));
          const alt = L.i % 2 ? 1 : -1;
          const th = L.th, tx = L.tx, ty = L.ty;
          const wob = reduce ? 0 : Math.sin(t * 0.8 + L.i);
          L.m.position.set(L.base.x + (tx + L.nx - L.base.x) * e, L.base.y + (ty + L.ny - L.base.y) * e, e * (alt * 0.2 + wob * 0.08) + L.h * 0.35);
          qa.setFromAxisAngle(zAxis, -L.ang * (1 - e * 0.5) + L.h * 0.12);
          qb.setFromAxisAngle(yAxis, e * (alt * 0.3 + (reduce ? 0 : Math.sin(t * 0.7 + L.i * 1.3) * 0.15)));
          L.m.quaternion.copy(qa).multiply(qb);
          L.m.scale.setScalar((1 + (L.rs - 1) * e) * (1 + L.h * 0.12) * (anyHover && L.i !== hovered ? 0.94 : 1));
          L.hullMesh.scale.setScalar(1 + L.h * 0.05);
          L.hullMat.opacity = e * (anyHover ? (L.i === hovered ? 1 : 0.45) : 0.9);
        }
        // label pass: true projected footprint of every lobe's outline hull
        spin.updateMatrixWorld(true);
        const pad = 12;
        for (const L of lobes) {
          const mw = L.hullMesh.matrixWorld;
          let l = 1e9, tp = 1e9, r = -1e9, bt = -1e9;
          for (const sp of L.samples) { v.copy(sp).applyMatrix4(mw).project(camera); const x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H; if (x < l) l = x; if (x > r) r = x; if (y < tp) tp = y; if (y > bt) bt = y; }
          L.F = { l, t: tp, r, b: bt };
          // keep the lobe inside the canvas: nudge inward by any overflow
          const ox = l < pad ? pad - l : r > W - pad ? (W - pad) - r : 0;
          const oy = tp < pad ? pad - tp : bt > H - pad ? (H - pad) - bt : 0;
          L.nx += (ox * wpp - 0 ) * Math.min(1, dt * 6) * e; L.ny += (-oy * wpp) * Math.min(1, dt * 6) * e;
          if (e < 0.05) { L.nx = 0; L.ny = 0; }
        }
        for (const L of lobes) {
          if (L.h > 0.01) {
            const R0 = L.F, cx = (R0.l + R0.r) / 2, cy = (R0.t + R0.b) / 2, th = L.th;
            const lw = L.el.offsetWidth, lh = L.el.offsetHeight, g = 10, up = Math.sin(th) > 0, side = Math.cos(th) < -0.2 ? -1 : 1;
            const cands = [
              [side > 0 ? R0.r + g : R0.l - g - lw, cy - lh / 2],
              [cx - lw / 2, up ? R0.t - g - lh : R0.b + g],
              [cx - lw / 2, up ? R0.b + g : R0.t - g - lh],
              [side > 0 ? R0.l - g - lw : R0.r + g, cy - lh / 2],
              [side > 0 ? R0.l - g - lw : R0.r + g, up ? R0.b - lh : R0.t],
              [side > 0 ? R0.r + g - lw : R0.l - g, up ? R0.b + g : R0.t - g - lh]
            ].map(([x, y]) => ({ l: x, t: y, r: x + lw, b: y + lh }));
            const inView = q => q.l >= pad && q.t >= pad && q.r <= W - pad && q.b <= H - pad;
            const noBox = q => !box || !overlap(q, box);
            const clear = q => noBox(q) && !overlap(q, L.F) && lobes.every(o => o === L || !overlap(q, o.F));
            const pickQ = cands.find(q => inView(q) && clear(q)) || cands.find(q => inView(q) && noBox(q) && !overlap(q, L.F)) || cands.find(inView) || cands[0];
            const sx = clamp(pickQ.l, pad, W - lw - pad), sy = clamp(pickQ.t, pad, H - lh - pad);
            L.el.style.transform = `translate(${sx}px, ${sy}px) translateY(${(1 - L.h) * 8}px)`;
          }
          L.el.style.opacity = L.h.toFixed(3);
        }
        for (const f of flakes) {
          if (f.life <= 0) continue;
          f.life -= dt * 0.6; f.v.y -= dt * 0.9;
          f.m.position.addScaledVector(f.v, dt);
          f.m.rotation.x += f.spin.x * dt; f.m.rotation.y += f.spin.y * dt;
          f.m.material.opacity = Math.max(0, f.life);
          if (f.life <= 0) f.m.visible = false;
        }
        const eo = 1 - Math.pow(1 - e, 3);
        for (const g of rings) {
          const rv = smooth(0, 1, e * 1.5 - g.j * 0.02);
          const ease = 1 - Math.pow(1 - rv, 3);
          g.line.scale.setScalar(0.12 + 0.88 * ease);
          g.line.rotation.z = reduce ? 0 : t * 0.02 * g.dir;
          g.lm.opacity = rv * (g.j % 5 === 0 ? 0.5 : 0.28) * (1 - g.j / RN * 0.6);
        }
        dust.scale.setScalar(0.05 + 0.95 * eo);
        if (!reduce) dust.rotation.y = t * 0.015;
        pmat.opacity = eo * 0.85;
        for (const L of lobes) {
          L.glow.position.set(L.m.position.x, L.m.position.y, L.m.position.z - 0.6);
          L.glow.scale.setScalar((L.len * 3.4) * (1 + L.h * 0.25));
          L.glow.material.opacity = e * (0.22 + L.h * 0.3);
        }
        renderer.render(scene, camera);
        if (!this._readySent) { this._readySent = true; window.__croissantReady = true; requestAnimationFrame(() => this.dispatchEvent(new CustomEvent('croissant-ready', { bubbles: true, composed: true }))); }
      };
      tick();
    }
  }
  customElements.define('croissant-3d', Croissant3D);
})();
