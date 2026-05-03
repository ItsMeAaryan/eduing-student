// --- THREE.JS HERO SCENE ---
const canvas = document.getElementById('heroCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const blue = new THREE.PointLight(0x6366f1, 2); blue.position.set(-4, 4, 4); scene.add(blue);
const purple = new THREE.PointLight(0x8b5cf6, 1.5); purple.position.set(4, -3, 3); scene.add(purple);
const cyan = new THREE.PointLight(0x06b6d4, 1); cyan.position.set(0, 5, -2); scene.add(cyan);

const geo = new THREE.IcosahedronGeometry(2, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15, wireframe: false, flatShading: true });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Particles
const pGeo = new THREE.BufferGeometry();
const pCount = 300;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ size: 0.015, color: 0x6366f1, transparent: true, opacity: 0.4 });
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

let mx = 0, my = 0;
document.addEventListener('mousemove', e => { mx = (e.clientX / window.innerWidth - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2; });

// Click interaction
canvas.addEventListener('mousedown', () => { mesh.scale.set(1.15, 1.15, 1.15); mat.emissive.set(0x3b82f6); });
canvas.addEventListener('mouseup', () => { mesh.scale.set(1, 1, 1); mat.emissive.set(0x000000); });

function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.004;
  mesh.rotation.x += 0.002;
  mesh.rotation.y += (mx * 0.3 - mesh.rotation.y) * 0.02;
  mesh.rotation.x += (-my * 0.2 - mesh.rotation.x) * 0.02;
  mesh.scale.x += (1 - mesh.scale.x) * 0.05;
  mesh.scale.y += (1 - mesh.scale.y) * 0.05;
  mesh.scale.z += (1 - mesh.scale.z) * 0.05;
  mat.emissive.r *= 0.95; mat.emissive.g *= 0.95; mat.emissive.b *= 0.95;
  particles.rotation.y += 0.0005;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- CUSTOM CURSOR ---
const co = document.querySelector('.cursor-outer'), ci = document.querySelector('.cursor-inner');
let cx = 0, cy = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; ci.style.left = tx + 'px'; ci.style.top = ty + 'px'; });
function cursorLoop() { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; co.style.left = cx + 'px'; co.style.top = cy + 'px'; requestAnimationFrame(cursorLoop); }
cursorLoop();

document.querySelectorAll('a, button, .mq-card, .bento-card').forEach(el => {
  el.addEventListener('mouseenter', () => co.classList.add('hover'));
  el.addEventListener('mouseleave', () => co.classList.remove('hover'));
});

// --- NAVBAR SCROLL ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 50); });

// --- HAMBURGER ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

// --- SCROLL REVEALS ---
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 100); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
reveals.forEach(el => revealObs.observe(el));

// Divider line
const divider = document.querySelector('.divider-line');
if (divider) {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) divider.classList.add('visible'); }, { threshold: 0.5 }).observe(divider);
}

// --- MARQUEE CARDS ---
const cardData = [
  { emoji: '🎮', label: 'Game UI', user: '@studio3d' },
  { emoji: '🏠', label: 'Architecture', user: '@archviz' },
  { emoji: '🎧', label: 'Product', user: '@designr' },
  { emoji: '🌐', label: 'Website', user: '@webgl' },
  { emoji: '📱', label: 'Mobile', user: '@appdev' },
  { emoji: '🚀', label: 'Landing', user: '@launch' },
  { emoji: '🎨', label: 'Abstract', user: '@artflow' },
  { emoji: '💎', label: 'Jewelry', user: '@gems3d' },
];

function buildMarquee(id) {
  const track = document.getElementById(id);
  const cards = [...cardData, ...cardData].map(c =>
    `<div class="mq-card"><div class="mq-card-img">${c.emoji}</div><div class="mq-card-info"><span>${c.label}</span><small>${c.user}</small></div></div>`
  ).join('');
  track.innerHTML = cards;
}
buildMarquee('mq1');
buildMarquee('mq2');

// --- CODE TABS ---
const codeSnippets = {
  react: `import Spline from '@splinetool/react-spline';\n\nexport default function App() {\n  return (\n    <Spline scene="https://prod.spline.design/abc" />\n  );\n}`,
  nextjs: `import dynamic from 'next/dynamic';\n\nconst Spline = dynamic(\n  () => import('@splinetool/react-spline'),\n  { ssr: false }\n);\n\nexport default function Page() {\n  return <Spline scene="https://prod.spline.design/abc" />;\n}`,
  html: `<script src="https://unpkg.com/@splinetool/viewer"></script>\n\n<spline-viewer\n  url="https://prod.spline.design/abc"\n  style="width:100%;height:500px"\n></spline-viewer>`,
  swift: `import SplineRuntime\n\nstruct ContentView: View {\n  var body: some View {\n    SplineView(url: "https://prod.spline.design/abc")\n      .frame(maxWidth: .infinity, maxHeight: .infinity)\n  }\n}`
};

const tabs = document.querySelectorAll('.tab');
const codeEl = document.getElementById('codeContent');
codeEl.textContent = codeSnippets.react;

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    codeEl.style.opacity = '0';
    codeEl.style.transform = 'translateX(10px)';
    setTimeout(() => {
      codeEl.textContent = codeSnippets[tab.dataset.lang];
      codeEl.style.opacity = '1';
      codeEl.style.transform = 'translateX(0)';
    }, 200);
  });
});
codeEl.style.transition = 'opacity .2s ease, transform .2s ease';

// --- STAT COUNTERS ---
const statNums = document.querySelectorAll('.stat-num');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const suffix = target >= 1000 ? (target >= 1000000 ? 'M+' : 'K+') : target === 99 ? '%' : '+';
    const divisor = target >= 1000000 ? 1000000 : target >= 1000 ? 1000 : 1;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      const display = divisor > 1 ? (current / divisor).toFixed(divisor === 1000000 ? 1 : 0) : current;
      el.textContent = display + suffix;
    }, 25);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObs.observe(el));

// --- PAGE LOADER ---
window.addEventListener('load', () => { document.querySelector('.page-loader').classList.add('done'); });
