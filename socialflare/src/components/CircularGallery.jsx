// src/components/CircularGallery.jsx
import React, { useEffect, useRef, useState } from "react";
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { ChevronLeft, ChevronRight } from 'lucide-react';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createCardTexture(gl, name, title) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  canvas.width = 400;
  canvas.height = 500;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Trending badge
  const badgeWidth = 120;
  const badgeHeight = 32;
  const badgeX = 20;
  const badgeY = 20;
  context.fillStyle = "#000000";
  context.beginPath();
  context.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 16);
  context.fill();
  context.fillStyle = "#00ff00";
  context.font = "bold 14px Inter, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Trending", badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

  // Placeholder image area
  context.fillStyle = "#e5e5e5";
  context.fillRect(20, 70, canvas.width - 40, 280);

  // Bottom black section
  const bottomHeight = 120;
  const bottomY = canvas.height - bottomHeight;
  context.fillStyle = "#000000";
  context.beginPath();
  context.roundRect(0, bottomY, canvas.width, bottomHeight, [0, 0, 20, 20]);
  context.fill();

  // Name and title
  context.fillStyle = "#00ff00";
  context.font = "bold 20px Inter, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(name, 20, bottomY + 20);
  context.fillStyle = "#00ff00";
  context.font = "14px Inter, sans-serif";
  context.fillText(title, 20, bottomY + 50);

  // Arrow circle
  const circleX = canvas.width - 50;
  const circleY = bottomY + 40;
  const circleRadius = 20;
  context.fillStyle = "#00ff00";
  context.beginPath();
  context.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#000000";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(circleX - 6, circleY);
  context.lineTo(circleX + 2, circleY - 6);
  context.lineTo(circleX + 2, circleY + 6);
  context.closePath();
  context.stroke();

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;

  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.createMesh();
  }

  createMesh() {
    const nameParts = this.text.split("\n");
    const name = nameParts[0] || "Name";
    const title = nameParts[1] || "Title";

    const { texture, width, height } = createCardTexture(this.gl, name, title);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });

    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    this.mesh.scale.set(this.plane.scale.x, this.plane.scale.x / aspect, 1);
    this.mesh.position.set(0, 0, 0.01);
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.speed = 0;
    this.isBefore = false;
    this.isAfter = false;

    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `,
      uniforms: {},
      transparent: true,
    });
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
    });
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);

      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;

    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, { items, bend = 1, scrollSpeed = 2, scrollEase = 0.05, onIndexChange }) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.onIndexChange = onIndexChange;
    this.medias = [];
    this.mediasImages = [];
    this.raf = 0;

    // --- DRAG STATE ---
    this.isDragging = false;
    this.startX = 0;
    this.dragStartTarget = 0;

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend);
    this.update();
    this.addEventListeners();

    // --- ATTACH POINTER EVENTS ---
    container.style.touchAction = 'pan-y'; // ensure vertical page scroll works
    container.addEventListener('mousedown', this.onDragStart);
    container.addEventListener('mousemove', this.onDragMove);
    container.addEventListener('mouseup', this.onDragEnd);
    container.addEventListener('mouseleave', this.onDragEnd);
    container.addEventListener('touchstart', this.onDragStart, { passive: true });
    container.addEventListener('touchmove', this.onDragMove, { passive: true });
    container.addEventListener('touchend', this.onDragEnd);
  }

  onDragStart(e) {
    e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    this.isDragging = true;
    this.startX = x;
    this.dragStartTarget = this.scroll.target;
  }

  onDragMove(e) {
    if (!this.isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = this.startX - x;
    this.scroll.target = this.dragStartTarget + delta;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.onCheckDebounce();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(items, bend = 1) {
    const defaultItems = [
      { image: "https://picsum.photos/seed/1/800/600", text: "Daniel Lee\nGraphic Designer" },
      { image: "https://picsum.photos/seed/2/800/600", text: "Emily Taylor\nSocial Media Manager" },
      { image: "https://picsum.photos/seed/3/800/600", text: "Sarah Collins\nSocial Media Analyst" },
      { image: "https://picsum.photos/seed/4/800/600", text: "Michael Chen\nUX Designer" },
      { image: "https://picsum.photos/seed/5/800/600", text: "Jessica Wong\nContent Creator" },
    ];

    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);

    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
      });
    });
  }

  scrollTo(direction) {
    if (!this.medias || !this.medias[0]) return;

    const width = this.medias[0].width;
    const currentIndex = Math.round(Math.abs(this.scroll.target) / width);
    let newIndex;

    if (direction === "right") {
      newIndex = currentIndex + 1;
    } else {
      newIndex = Math.max(0, currentIndex - 1);
    }

    const item = width * newIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;

    if (this.onIndexChange) {
      this.onIndexChange(newIndex % (this.mediasImages.length / 2));
    }
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;

    if (this.onIndexChange) {
      this.onIndexChange(itemIndex % (this.mediasImages.length / 2));
    }
  }

  onResize = () => {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  };

  update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  };

  addEventListeners() {
    window.addEventListener("resize", this.onResize);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener('mousedown', this.onDragStart);
    this.container.removeEventListener('mousemove', this.onDragMove);
    this.container.removeEventListener('mouseup', this.onDragEnd);
    this.container.removeEventListener('mouseleave', this.onDragEnd);
    this.container.removeEventListener('touchstart', this.onDragStart);
    this.container.removeEventListener('touchmove', this.onDragMove);
    this.container.removeEventListener('touchend', this.onDragEnd);

    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  scrollSpeed = 2,
  scrollEase = 0.05,
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const defaultItems = [
      { image: "https://picsum.photos/seed/1/800/600", text: "Daniel Lee\nGraphic Designer" },
      { image: "https://picsum.photos/seed/2/800/600", text: "Emily Taylor\nSocial Media Manager" },
      { image: "https://picsum.photos/seed/3/800/600", text: "Sarah Collins\nSocial Media Analyst" },
      { image: "https://picsum.photos/seed/4/800/600", text: "Michael Chen\nUX Designer" },
      { image: "https://picsum.photos/seed/5/800/600", text: "Jessica Wong\nContent Creator" },
    ];

    const galleryItems = items && items.length ? items : defaultItems;
    setTotalItems(galleryItems.length);

    appRef.current = new App(containerRef.current, {
      items,
      bend,
      scrollSpeed,
      scrollEase,
      onIndexChange: setCurrentIndex,
    });

    return () => {
      if (appRef.current) {
        appRef.current.destroy();
      }
    };
  }, [items, bend, scrollSpeed, scrollEase]);

  const handlePrevious = () => {
    if (appRef.current) appRef.current.scrollTo("left");
  };

  const handleNext = () => {
    if (appRef.current) appRef.current.scrollTo("right");
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="w-full h-full overflow-hidden"
        ref={containerRef}
        style={{ touchAction: 'pan-y' }} // allow normal vertical page scroll
      />

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-green-500/50 hover:bg-green-500/20 text-green-500 hover:text-green-400 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalItems }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-green-500" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-green-500/50 hover:bg-green-500/20 text-green-500 hover:text-green-400 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
