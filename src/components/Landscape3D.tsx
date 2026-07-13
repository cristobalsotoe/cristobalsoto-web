import { onMount, onCleanup, createSignal, Show } from "solid-js"
import * as THREE from "three"

const keys = { forward: false, back: false, left: false, right: false }

export default function Landscape3D() {
  let canvasRef: HTMLCanvasElement | undefined
  let containerRef: HTMLDivElement | undefined
  const [showHint, setShowHint] = createSignal(true)
  const [supported, setSupported] = createSignal(true)

  const press = (k: keyof typeof keys) => (e: Event) => {
    e.preventDefault()
    setShowHint(false)
    keys[k] = true
  }
  const release = (k: keyof typeof keys) => () => {
    keys[k] = false
  }

  onMount(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let gl: RenderingContext | null = null
    try {
      const test = document.createElement("canvas")
      gl = test.getContext("webgl2") || test.getContext("webgl")
    } catch {
      gl = null
    }
    if (reduceMotion || !gl || !canvasRef || !containerRef) {
      setSupported(false)
      return
    }

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400)
    camera.position.set(28, 26, 52)
    camera.lookAt(0, -2, 0)

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // en desktop el texto cubre el 48% izquierdo → componer la isla hacia la derecha
    let lookBias = 0
    const resize = () => {
      if (!containerRef) return
      const w = containerRef.clientWidth
      const h = containerRef.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
      lookBias = w >= 768 ? -7 : 0
    }
    resize()

    // ---------- luz: atardecer cálido, sombras largas (referencia: video diorama) ----------
    const sun = new THREE.DirectionalLight(0xffd9a3, 2.1)
    sun.position.set(-34, 22, 14)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -32
    sun.shadow.camera.right = 32
    sun.shadow.camera.top = 32
    sun.shadow.camera.bottom = -32
    sun.shadow.camera.far = 120
    sun.shadow.bias = -0.0005
    scene.add(sun)
    scene.add(new THREE.HemisphereLight(0xd8ecf2, 0xb98a5e, 0.85))

    const M = (color: number, opts: Record<string, unknown> = {}) =>
      new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1, ...opts })

    const island = new THREE.Group()
    scene.add(island)

    // ---------- isla-diorama: losa de pasto + capas de tierra/roca ----------
    const TOP_W = 40
    const TOP_D = 28
    const grass = new THREE.Mesh(new THREE.BoxGeometry(TOP_W, 1.6, TOP_D), M(0x8faf6b))
    grass.position.y = -0.8
    grass.receiveShadow = true
    island.add(grass)

    const dirt = new THREE.Mesh(new THREE.BoxGeometry(TOP_W - 2, 6, TOP_D - 2), M(0x8a6446))
    dirt.position.y = -4.6
    island.add(dirt)
    const dirt2 = new THREE.Mesh(new THREE.BoxGeometry(TOP_W - 12, 5, TOP_D - 10), M(0x74513a))
    dirt2.position.y = -9.6
    island.add(dirt2)
    const dirt3 = new THREE.Mesh(new THREE.BoxGeometry(TOP_W - 26, 4, TOP_D - 18), M(0x5e4030))
    dirt3.position.y = -13.5
    island.add(dirt3)

    // rocas colgando del borde del acantilado
    for (let i = 0; i < 14; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + Math.random() * 1.6, 0), M(0x9a9187))
      const side = Math.random() > 0.5
      rock.position.set(
        side ? (Math.random() - 0.5) * TOP_W : (Math.random() > 0.5 ? 1 : -1) * (TOP_W / 2 - 0.5),
        -1.6 - Math.random() * 5,
        side ? (Math.random() > 0.5 ? 1 : -1) * (TOP_D / 2 - 0.5) : (Math.random() - 0.5) * TOP_D
      )
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      island.add(rock)
    }

    // ---------- río: cruza la isla y cae en cascada por el borde ----------
    const riverPts = [
      new THREE.Vector3(-13, 0.05, -14.2),
      new THREE.Vector3(-10, 0.05, -6),
      new THREE.Vector3(-13.5, 0.05, 2),
      new THREE.Vector3(-9, 0.05, 9),
      new THREE.Vector3(-11, 0.05, 14.2),
    ]
    const riverCurve = new THREE.CatmullRomCurve3(riverPts)
    const river = new THREE.Mesh(
      new THREE.TubeGeometry(riverCurve, 40, 1.7, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x3d8f8a, roughness: 0.25, metalness: 0.2 })
    )
    river.scale.y = 0.03
    river.receiveShadow = true
    island.add(river)

    // cascada en el borde frontal
    const waterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 7),
      new THREE.MeshStandardMaterial({ color: 0x6fb5b0, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    )
    waterfall.position.set(-11, -3.4, TOP_D / 2 + 0.05)
    island.add(waterfall)

    const foam: THREE.Mesh[] = []
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), M(0xf3f7f2))
      f.position.set(-11 + (Math.random() - 0.5) * 2.4, -Math.random() * 7, TOP_D / 2 + 0.4)
      foam.push(f)
      island.add(f)
    }

    // ---------- camino de tierra: de las casas (Temuco) a la torre (Irvine) ----------
    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, 0.05, 10),
      new THREE.Vector3(-4, 0.05, 6),
      new THREE.Vector3(3, 0.05, -1),
      new THREE.Vector3(9, 0.05, -4),
      new THREE.Vector3(15, 0.05, -9),
    ])
    const road = new THREE.Mesh(
      new THREE.TubeGeometry(roadCurve, 40, 1.3, 8, false),
      M(0xcbb389)
    )
    road.scale.y = 0.02
    road.receiveShadow = true
    island.add(road)

    // ---------- montañas nevadas (centro-fondo, sin tapar UC Irvine) ----------
    const peaks = [
      { x: -1, z: -11, h: 13, r: 5.5 },
      { x: 5, z: -9.5, h: 9, r: 4 },
      { x: -7.5, z: -12, h: 10.5, r: 4.5 },
    ]
    peaks.forEach((p) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 6), M(0x7d8a80))
      cone.position.set(p.x, p.h / 2, p.z)
      cone.castShadow = true
      island.add(cone)
      const snow = new THREE.Mesh(new THREE.ConeGeometry(p.r * 0.42, p.h * 0.34, 6), M(0xf5f8f4))
      snow.position.set(p.x, p.h * 0.83, p.z)
      island.add(snow)
    })

    // ---------- araucarias (el árbol de Temuco) ----------
    const araucaria = (x: number, z: number, s = 1) => {
      const g = new THREE.Group()
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 2.6 * s, 6), M(0x6b4a33))
      trunk.position.y = 1.3 * s
      trunk.castShadow = true
      g.add(trunk)
      for (let i = 0; i < 3; i++) {
        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry((1.5 - i * 0.38) * s, 1.1 * s, 7),
          M(0x3e5f42)
        )
        canopy.position.y = (2.2 + i * 0.78) * s
        canopy.castShadow = true
        g.add(canopy)
      }
      g.position.set(x, 0, z)
      island.add(g)
    }
    araucaria(-16.5, -3, 1.15)
    araucaria(-15, 5.5, 0.9)
    araucaria(-6, -10, 1.05)
    araucaria(-2.5, 11, 0.85)
    araucaria(4, 8.5, 1.0)
    araucaria(-6.5, 3.5, 0.75)
    araucaria(12, 3, 0.9)
    araucaria(17, -2, 0.8)

    // ---------- casitas del lado Temuco ----------
    const house = (x: number, z: number, rot: number, bodyColor: number) => {
      const g = new THREE.Group()
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 1.8), M(bodyColor))
      body.position.y = 0.75
      body.castShadow = true
      g.add(body)
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.2, 4), M(0xa85a35))
      roof.position.y = 2.1
      roof.rotation.y = Math.PI / 4
      roof.castShadow = true
      g.add(roof)
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), M(0x8a6446))
      chimney.position.set(0.55, 2.35, 0.3)
      g.add(chimney)
      g.position.set(x, 0, z)
      g.rotation.y = rot
      island.add(g)
    }
    house(-16, 9.5, 0.4, 0xf0ead9)
    house(-13.2, 11.5, -0.3, 0xe6d9bc)
    house(-17.5, 12.3, 0.9, 0xf0ead9)

    // ---------- torre del lado Irvine (el campanil, guiño al campus) ----------
    const tower = new THREE.Group()
    const towerBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.6, 1.6), M(0xefe6cf))
    towerBody.position.y = 2.3
    towerBody.castShadow = true
    tower.add(towerBody)
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 1.3, 4), M(0x93712a))
    towerRoof.position.y = 5.25
    towerRoof.rotation.y = Math.PI / 4
    tower.add(towerRoof)
    tower.position.set(16.5, 0, -11)
    island.add(tower)

    // ---------- postes con cables siguiendo el camino ----------
    const polePositions = [
      { x: -3, z: 4.8 },
      { x: 4, z: 1.2 },
      { x: 11, z: -2.4 },
    ]
    const poleTops: THREE.Vector3[] = []
    polePositions.forEach((p) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 4.4, 5), M(0x6b5a44))
      pole.position.set(p.x, 2.2, p.z)
      pole.castShadow = true
      island.add(pole)
      const cross = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.09, 0.09), M(0x6b5a44))
      cross.position.set(p.x, 4.1, p.z)
      island.add(cross)
      poleTops.push(new THREE.Vector3(p.x, 4.1, p.z))
    })
    for (let i = 0; i < poleTops.length - 1; i++) {
      const a = poleTops[i]
      const b = poleTops[i + 1]
      const mid = a.clone().lerp(b, 0.5)
      mid.y -= 0.5
      const wireCurve = new THREE.CatmullRomCurve3([a, mid, b])
      const wire = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 12, 0.02, 4, false), M(0x3a3630))
      island.add(wire)
    }

    // ---------- matorrales y flores ----------
    for (let i = 0; i < 22; i++) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.28 + Math.random() * 0.3, 5, 4), M(0x74914f))
      bush.position.set((Math.random() - 0.5) * (TOP_W - 4), 0.25, (Math.random() - 0.5) * (TOP_D - 4))
      bush.scale.y = 0.7
      island.add(bush)
    }
    const flowerColors = [0xd9a13c, 0xc76b41, 0xe8d9b0]
    for (let i = 0; i < 16; i++) {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 4), M(flowerColors[i % 3]))
      fl.position.set((Math.random() - 0.5) * (TOP_W - 5), 0.14, (Math.random() - 0.5) * (TOP_D - 5))
      island.add(fl)
    }

    // ---------- banderas con texto flotante ----------
    const makeChileFlag = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 300, 100)
      ctx.fillStyle = "#d52b1e"
      ctx.fillRect(0, 100, 300, 100)
      ctx.fillStyle = "#0039a6"
      ctx.fillRect(0, 0, 100, 100)
      // estrella blanca
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      const cx = 50, cy = 50, spikes = 5, outer = 28, inner = 11
      let rot = -Math.PI / 2
      ctx.moveTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
      for (let i = 0; i < spikes; i++) {
        rot += Math.PI / spikes
        ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
        rot += Math.PI / spikes
        ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
      }
      ctx.closePath()
      ctx.fill()
      return new THREE.CanvasTexture(canvas)
    }

    const makeUsaFlag = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext("2d")!
      for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#b22234" : "#ffffff"
        ctx.fillRect(0, (i * 200) / 13, 300, 200 / 13 + 1)
      }
      ctx.fillStyle = "#3c3b6e"
      ctx.fillRect(0, 0, 120, 108)
      ctx.fillStyle = "#ffffff"
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 6; c++) {
          ctx.beginPath()
          ctx.arc(12 + c * 20 + (r % 2) * 10, 12 + r * 20, 3.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      return new THREE.CanvasTexture(canvas)
    }

    const makeFlag = (texture: THREE.CanvasTexture, x: number, z: number) => {
      const g = new THREE.Group()
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 6), M(0x8a8578))
      pole.position.y = 1.7
      pole.castShadow = true
      g.add(pole)
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.1, 8, 1),
        new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.9 })
      )
      cloth.position.set(0.88, 2.8, 0)
      g.add(cloth)
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), M(0xd9c98f))
      ball.position.y = 3.45
      g.add(ball)
      g.position.set(x, 0, z)
      island.add(g)
      return cloth
    }

    const makeFloatingText = (lines: string[], width: number) => {
      const canvas = document.createElement("canvas")
      canvas.width = 1024
      canvas.height = 300
      const ctx = canvas.getContext("2d")!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.textAlign = "center"
      ctx.fillStyle = "#1e2a26"
      const size = lines.length > 1 ? 88 : 120
      ctx.font = `italic ${size}px Georgia`
      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, size + 12 + i * (size + 14))
      })
      const texture = new THREE.CanvasTexture(canvas)
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(width, width * (300 / 1024)),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
      )
      return plane
    }

    const chileFlagCloth = makeFlag(makeChileFlag(), -11, 10.5)
    const temucoText = makeFloatingText(["Temuco"], 7)
    temucoText.position.set(-13.5, 4.6, 10.8)
    scene.add(temucoText)

    const usaFlagCloth = makeFlag(makeUsaFlag(), 13.5, -7.5)
    const irvineText = makeFloatingText(["University of California,", "Irvine"], 10)
    irvineText.position.set(14, 5.6, -8.5)
    scene.add(irvineText)

    // ---------- auto ----------
    const car = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.6), M(0xa85a35))
    body.position.y = 0.5
    body.castShadow = true
    car.add(body)
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.3), M(0xf0ead9))
    cabin.position.set(0, 0.95, -0.2)
    cabin.castShadow = true
    car.add(cabin)
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 10)
    const wheelMat = M(0x1e2a26)
    ;[
      [-0.8, 0.3, 0.85],
      [0.8, 0.3, 0.85],
      [-0.8, 0.3, -0.85],
      [0.8, 0.3, -0.85],
    ].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, y, z)
      car.add(wheel)
    })
    car.position.set(-4, 0, 7)
    car.rotation.y = Math.PI / 2.4
    scene.add(car)

    // ---------- nubes alrededor de la isla ----------
    const clouds: THREE.Group[] = []
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfaf7ef, roughness: 1, transparent: true, opacity: 0.92 })
    for (let i = 0; i < 6; i++) {
      const cl = new THREE.Group()
      const n = 3 + Math.floor(Math.random() * 2)
      for (let j = 0; j < n; j++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.4 + Math.random() * 1.3, 7, 6), cloudMat)
        puff.position.set(j * 1.9 - n, Math.random() * 0.7, (Math.random() - 0.5) * 1.6)
        puff.scale.y = 0.55
        cl.add(puff)
      }
      const angle = (i / 6) * Math.PI * 2
      cl.position.set(Math.cos(angle) * (24 + Math.random() * 8), -6 - Math.random() * 6, Math.sin(angle) * (18 + Math.random() * 6))
      clouds.push(cl)
      scene.add(cl)
    }

    // ---------- pájaros ----------
    const birds: THREE.Group[] = []
    for (let i = 0; i < 3; i++) {
      const bird = new THREE.Group()
      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.22), M(0x2e3a34, { side: THREE.DoubleSide }))
      wingL.position.x = -0.33
      wingL.rotation.z = 0.5
      const wingR = wingL.clone()
      wingR.position.x = 0.33
      wingR.rotation.z = -0.5
      bird.add(wingL, wingR)
      bird.position.set(0, 9 + i * 1.4, 0)
      birds.push(bird)
      scene.add(bird)
    }

    // ---------- controles ----------
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
        setShowHint(false)
        e.preventDefault()
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.forward = true
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.back = true
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.forward = false
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.back = false
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("resize", resize)

    let visible = true
    const onVisibility = () => {
      visible = document.visibilityState === "visible"
    }
    document.addEventListener("visibilitychange", onVisibility)

    // ---------- loop ----------
    let heading = Math.PI / 2.4
    let speed = 0
    const maxSpeed = 0.22
    const accel = 0.011
    const friction = 0.96
    const turnSpeed = 0.045
    let frameId = 0
    let t = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      if (!visible) return
      t += 0.016

      if (keys.forward) speed = Math.min(maxSpeed, speed + accel)
      else if (keys.back) speed = Math.max(-maxSpeed * 0.6, speed - accel)
      else speed *= friction

      if (Math.abs(speed) > 0.002) {
        const turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0)
        heading += turn * turnSpeed * Math.sign(speed)
      }

      car.rotation.y = heading
      car.position.x += Math.sin(heading) * speed
      car.position.z += Math.cos(heading) * speed
      car.position.x = Math.max(-(TOP_W / 2 - 2), Math.min(TOP_W / 2 - 2, car.position.x))
      car.position.z = Math.max(-(TOP_D / 2 - 2), Math.min(TOP_D / 2 - 2, car.position.z))

      // cámara fija de diorama con vaivén suave + leve seguimiento del auto
      camera.position.x = 28 + Math.sin(t * 0.12) * 1.2 + car.position.x * 0.06
      camera.position.y = 26 + Math.sin(t * 0.09) * 0.6
      camera.position.z = 52 + car.position.z * 0.05
      camera.lookAt(lookBias + car.position.x * 0.18, -1.5, car.position.z * 0.18)

      // textos flotantes siempre mirando a cámara + ondeo suave de banderas
      temucoText.lookAt(camera.position.x, temucoText.position.y, camera.position.z)
      irvineText.lookAt(camera.position.x, irvineText.position.y, camera.position.z)
      chileFlagCloth.rotation.y = Math.sin(t * 2.1) * 0.18
      usaFlagCloth.rotation.y = Math.sin(t * 2.4 + 1.3) * 0.18

      // nubes a la deriva
      clouds.forEach((cl, i) => {
        cl.position.x += Math.sin(t * 0.1 + i) * 0.004
        cl.position.y += Math.sin(t * 0.24 + i * 2) * 0.003
      })

      // pájaros en círculo
      birds.forEach((b, i) => {
        const a = t * 0.35 + (i * Math.PI * 2) / 3
        b.position.set(Math.cos(a) * (13 + i * 2), 9.5 + Math.sin(t * 0.8 + i) * 0.8, Math.sin(a) * (9 + i))
        b.rotation.y = -a
        const flap = Math.sin(t * 9 + i * 2) * 0.45
        ;(b.children[0] as THREE.Mesh).rotation.z = 0.35 + flap
        ;(b.children[1] as THREE.Mesh).rotation.z = -0.35 - flap
      })

      // espuma de la cascada cayendo en bucle
      foam.forEach((f, i) => {
        f.position.y -= 0.05 + i * 0.004
        if (f.position.y < -7.2) f.position.y = 0
      })

      // brillo sutil del agua
      ;(river.material as THREE.MeshStandardMaterial).metalness = 0.2 + Math.sin(t * 2.2) * 0.1

      renderer.render(scene, camera)
    }
    frameId = requestAnimationFrame(animate)

    onCleanup(() => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
      renderer.dispose()
    })
  })

  return (
    <div ref={containerRef} class="relative w-full h-full overflow-hidden">
      <Show when={supported()}>
        <canvas ref={canvasRef} class="w-full h-full block" aria-label="Diorama 3D interactivo: maneja un auto por una isla entre Temuco e Irvine" role="img" tabindex="0" />

        <Show when={showHint()}>
          <div class="absolute bottom-4 right-4 label px-3 py-1.5 rounded-full pointer-events-none" style="background: color-mix(in srgb, var(--ink) 80%, transparent); color: var(--paper);">
            flechas o WASD para manejar
          </div>
        </Show>

        <div class="sr-only">
          En septiembre de 2026 comienzo mi doctorado en UC Irvine, mudándome desde Temuco, Chile.
        </div>

        <div class="md:hidden absolute bottom-4 right-4 grid grid-cols-3 grid-rows-2 gap-1.5 w-32 select-none">
          <div />
          <button aria-label="Adelante" class="rounded-lg label py-2" style="background: color-mix(in srgb, var(--ink) 65%, transparent); color: var(--paper);" onPointerDown={press("forward")} onPointerUp={release("forward")} onPointerLeave={release("forward")}>&#9650;</button>
          <div />
          <button aria-label="Izquierda" class="rounded-lg label py-2" style="background: color-mix(in srgb, var(--ink) 65%, transparent); color: var(--paper);" onPointerDown={press("left")} onPointerUp={release("left")} onPointerLeave={release("left")}>&#9664;</button>
          <button aria-label="Atrás" class="rounded-lg label py-2" style="background: color-mix(in srgb, var(--ink) 65%, transparent); color: var(--paper);" onPointerDown={press("back")} onPointerUp={release("back")} onPointerLeave={release("back")}>&#9660;</button>
          <button aria-label="Derecha" class="rounded-lg label py-2" style="background: color-mix(in srgb, var(--ink) 65%, transparent); color: var(--paper);" onPointerDown={press("right")} onPointerUp={release("right")} onPointerLeave={release("right")}>&#9654;</button>
        </div>
      </Show>

      <Show when={!supported()}>
        <div class="w-full h-full flex items-center justify-center px-8" style="background: linear-gradient(180deg, var(--paper) 0%, var(--paper-raised) 100%);">
          <p class="serif italic text-2xl md:text-4xl text-center max-w-lg" style="color: var(--ink);">
            De Temuco a Irvine — en septiembre de 2026 empiezo mi PhD en UC Irvine.
          </p>
        </div>
      </Show>
    </div>
  )
}
