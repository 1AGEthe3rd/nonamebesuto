/**
 * NNB / Soul District gym: illustrative architecture inspired by the
 * storefront and converted-industrial character of NE MLK Jr. Blvd, Portland.
 *
 * This is an original 3D interpretation, NOT a replica or claim of occupancy,
 * address, ownership, partnership or real-world availability. It is scenery
 * only: the ring, bags, locker coordinates, interaction markers, camera,
 * controls, training module and HQ1 entry/return behavior remain untouched.
 */
export function addMlkGymEnvironment(THREE, scene, { box, cyl, text, light }) {
  const charcoal = 0x263032;
  const steel = 0x343d3e;
  const white = 0xf2ebe0;
  const rust = 0xa86549;

  function proceduralTexture(width, height, paint) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return null;
    let seed = 1977;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    paint(context, width, height, random);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 2;
    return texture;
  }

  // Exposed, weathered brick — textured instead of adding thousands of meshes.
  const brickTexture = proceduralTexture(768, 512, (ctx, w, h, random) => {
    ctx.fillStyle = '#b5a49a';
    ctx.fillRect(0, 0, w, h);
    const palette = ['#995640', '#ae6c50', '#b67859', '#95503d', '#ab6249', '#a86248'];
    const bw = 96;
    const bh = 38;
    for (let row = -1; row < 15; row++) {
      for (let col = -1; col < 10; col++) {
        const x = col * bw + (row % 2 ? bw / 2 : 0) + 2;
        const y = row * bh + 2;
        ctx.fillStyle = palette[Math.floor(random() * palette.length)];
        ctx.fillRect(x, y, bw - 4, bh - 4);
        ctx.fillStyle = 'rgba(255,229,200,.10)';
        ctx.fillRect(x + 4, y + 4, bw - 13, 2);
        ctx.fillStyle = 'rgba(20,10,9,.15)';
        ctx.fillRect(x + 4, y + bh - 9, bw - 13, 2);
      }
    }
  });

  function brickWall(width, height, x, y, z, rotation = 0) {
    if (!brickTexture) return;
    const map = brickTexture.clone();
    map.repeat.set(width / 11, height / 6);
    map.needsUpdate = true;
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({
        map, color: 0xfff5eb, roughness: .98, metalness: 0,
        side: THREE.DoubleSide
      })
    );
    wall.position.set(x, y, z);
    wall.rotation.y = rotation;
    scene.add(wall);
  }

  brickWall(29.7, 6.84, 0, 3.52, -15.80);
  brickWall(31.6, 6.84, -14.81, 3.52, 0, Math.PI / 2);
  brickWall(31.6, 6.84, 14.81, 3.52, 0, -Math.PI / 2);

  // A continuous dark kickplate and concrete foundation anchor the room.
  box(29.7, .78, .13, 0, .39, -15.68, charcoal);
  for (const side of [-1, 1]) {
    box(.13, .78, 31.6, side * 14.72, .39, 0, charcoal);
    for (const z of [-13.5, -5, 3, 11.8]) {
      box(.22, 6.9, .3, side * 14.5, 3.47, z, steel);
    }
  }

  // Speckled rubberized training surface. Existing ring base/lines sit above it.
  const rubber = proceduralTexture(512, 512, (ctx, w, h, random) => {
    ctx.fillStyle = '#343a38';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4100; i++) {
      const v = Math.round(38 + random() * 57);
      ctx.fillStyle = 'rgba(' + v + ',' + (v + 2) + ',' + (v - 1) + ',.42)';
      const side = .6 + random() * 2.4;
      ctx.fillRect(random() * w, random() * h, side, side);
    }
    ctx.strokeStyle = 'rgba(205,205,195,.06)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  });
  if (rubber) {
    rubber.repeat.set(6, 7);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(29.45, 31.3),
      new THREE.MeshStandardMaterial({ map: rubber, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, .004, -.05);
    scene.add(floor);
  }
  // Original ring and existing markers remain visually and physically unchanged.
  for (const z of [5.25, 5.29, 10.8]) {
    box(18.8, .015, .025, 1.5, .025, z, 0x555b56);
  }

  // Exposed ceiling, transverse beams and warm suspended workshop light strips.
  for (const z of [-13.4, -7.6, -1.8, 4.0, 9.8, 14.2]) {
    box(29.45, .26, .26, 0, 6.84, z, steel);
    for (const x of [-10, 0, 10]) {
      box(.07, .38, .07, x, 6.59, z, 0x586060);
    }
  }
  for (const z of [-10.6, -3.4, 3.8, 10.7]) {
    for (const x of [-7.0, 7.0]) {
      box(5.2, .09, .23, x, 6.46, z, 0xe3dfcf, {
        emissive: 0xffedd3, emissiveIntensity: .55, roughness: .95
      });
      box(5.3, .11, .34, x, 6.58, z, 0x414a48);
    }
  }


  // Daylight storefront: working central exit remains unobstructed.
  const glass = new THREE.MeshStandardMaterial({
    color: 0x94b6bb, transparent: true, opacity: .14,
    roughness: .18, metalness: .05, depthWrite: false, side: THREE.DoubleSide
  });
  for (const [center, width] of [[-10, 8.4], [10, 8.4], [-4.7, 1.7], [4.7, 1.7]]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(width, 4.15), glass);
    pane.position.set(center, 3.20, 15.26);
    scene.add(pane);
    box(width + .09, .12, .19, center, 5.36, 15.3, steel);
    box(width + .09, .12, .19, center, 1.05, 15.3, steel);
    box(width + .09, .09, .19, center, 3.2, 15.3, steel);
  }
  for (const x of [-14.35, -6, -3.7, 3.7, 6, 14.35]) {
    box(.16, 5.0, .24, x, 3.52, 15.28, steel);
  }
  box(29.3, .37, .3, 0, 6.0, 15.26, charcoal);
  box(29.3, .68, .25, 0, .40, 15.24, charcoal);
  // Push plate, side lights and an exit sign suggest a real street-level facility.
  for (const x of [-1.62, 1.62]) {
    box(.12, 2.55, .21, x, 2.17, 15.31, 0x778887);
    box(.20, .45, .17, x, 1.33, 15.17, 0xbcb9a9);
  }
  box(1.65, .50, .13, 0, 4.09, 15.31, 0x274734);
  text('EXIT TO HQ1', 0, 4.05, 15.13, .20, '#e9dfbd', Math.PI);

  // A glimpse of NE MLK outside the glass — a conceptual street, not exact GIS.
  // The scene extends behind the existing exit, without modifying HQ1's own map.
  box(58, .17, 6.0, 0, -.15, 19.2, 0x929087);     // concrete sidewalk
  box(58, .16, .35, 0, -.18, 22.43, 0xb7b29d);   // curb
  box(86, .18, 28, 0, -.24, 37.3, 0x313b40);     // boulevard
  for (const x of [-21, -13, -5, 5, 13, 21]) {
    box(2.8, .013, .14, x, -.12, 32.2, 0xe5c78c);
  }
  for (const x of [-21, -10, 11, 22]) {
    box(.28, 4.1, .28, x, 2.05, 21, 0x594d42);
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.65, 1),
      new THREE.MeshStandardMaterial({ color: 0x526b4a, roughness: 1 })
    );
    crown.position.set(x, 4.65, 21);
    scene.add(crown);
  }
  // Scenic dusk sky and storefront daylight exist only beyond the gym windows.
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 16;
  skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext('2d');
  if (skyCtx) {
    const gradient = skyCtx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#405c77');
    gradient.addColorStop(.66, '#8fa8ad');
    gradient.addColorStop(1, '#d4b99a');
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, 16, 256);
    const skyMap = new THREE.CanvasTexture(skyCanvas);
    skyMap.colorSpace = THREE.SRGBColorSpace;
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 48),
      new THREE.MeshBasicMaterial({map:skyMap, side:THREE.DoubleSide, fog:false})
    );
    sky.position.set(0, 11, 62);
    scene.add(sky);
  }
  // Stylized anonymous commercial facades across the street.
  for (const [x, width, height, color] of [
    [-18, 15, 8, 0x7e7668], [0, 17, 9, 0x665e56], [18, 15, 8, 0x777a74]
  ]) {
    box(width, height, 2.6, x, height / 2 - .2, 53.1, color);
    brickWall(width - .12, height - .6, x, height / 2 - .25, 51.77, Math.PI);
    box(width - .5, .25, .19, x, height - 1.1, 51.65, 0x424947);
    for (let wx = x - width / 2 + 2.5; wx < x + width / 2 - 1; wx += 3.4) {
      box(2.5, 3.05, .23, wx, 2.60, 51.60, 0x333e43);
      box(2.25, 2.75, .07, wx, 2.63, 51.47, 0x8eabb2, {
        emissive:0x3e5c68, emissiveIntensity:.38, metalness:.18, roughness:.27
      });
      box(2.45, .10, .25, wx, 2.58, 51.43, 0xc3c8bf);
      box(.09, 2.85, .26, wx, 2.62, 51.40, 0xc3c8bf);
    }
  }
  // A modest street-name marker is located outside, not attached to a real address.
  box(.10, 4.2, .10, 9.1, 2.05, 24.5, 0x666c67);
  box(4.1, .72, .20, 7.15, 4.09, 24.5, 0x225244);
  text('NE MLK JR BLVD', 7.15, 4.08, 24.37, .23, '#edf4e7', Math.PI);
  box(.10, 3.2, .10, -9.1, 1.55, 24, 0x626762);
  box(.15, .54, .15, -9.1, 3.28, 24, 0xb5aa89);

  // Local gym texture: equipment storage, a corner bench and original poster art.
  // The playable bag, lockers and ring are deliberately NOT recreated or moved.
  box(4.5, .17, .70, 9.1, .78, 3.2, 0x725c48);
  for (const x of [7.15, 11.0]) box(.14, .73, .50, x, .35, 3.2, steel);
  for (const x of [6.5, 8, 9.5, 11]) {
    cyl(.24, .24, .12, x, .51, -12.15, 0x222626, 12);
    box(.44, .10, .14, x, .58, -12.15, 0x777e7c);
  }
  // Old boxing photos / posters are original typographic graphics, not borrowed artwork.
  for (const [z, heading, ink] of [
    [-10.5, 'TRAIN HARD', '#e5d2aa'],
    [-4.7, 'STAY READY', '#e5d2aa'],
    [1.0, 'BOXING CLUB', '#e5d2aa']
  ]) {
    box(.12, 2.1, 3.3, 14.63, 3.4, z, 0x202728);
    text(heading, 14.53, 3.37, z, .25, ink, -Math.PI / 2);
  }
  // Analog training clock on the back masonry between high sign and ring.
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(.45, 32),
    new THREE.MeshStandardMaterial({ color: white, roughness: .85, side: THREE.DoubleSide })
  );
  clockFace.position.set(-11.7, 5.4, -15.62);
  scene.add(clockFace);
  box(.045, .27, .05, -11.7, 5.5, -15.54, 0x1f2829);
  box(.20, .045, .05, -11.6, 5.4, -15.52, 0x1f2829);

  // Exposed chain suspension for existing bag locations, but not attached
  // to the moving training bag (so its existing punch physics remain intact).
  for (const x of [-11, -7.9, -4.8, -1.7]) {
    box(.11, .22, .11, x, 6.74, 2, steel);
    for (let y = 5.25; y <= 6.5; y += .22) {
      const chain = new THREE.Mesh(
        new THREE.TorusGeometry(.095, .022, 5, 9),
        new THREE.MeshStandardMaterial({ color: 0x838b87, metalness: .6, roughness: .45 })
      );
      chain.rotation.x = Math.PI / 2;
      chain.position.set(x, y, 2);
      scene.add(chain);
    }
  }

  // The green NNB identity becomes an accent over warm industrial light.
  // Existing green ring ropes, bag response glow, markers and logo remain unchanged.
  const daylight = new THREE.DirectionalLight(0xdbe9e9, .60);
  daylight.position.set(2, 16, 30);
  scene.add(daylight);
  scene.add(new THREE.HemisphereLight(0xffe7ca, 0x424d46, .45));
  light(0xffedcc, 28, -4.5, 5.85, 8.5, 25);
  light(0xffe1b4, 22, 9.7, 5.8, -6, 22);
}
