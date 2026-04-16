"use client";
/* eslint-disable */
import { useEffect } from "react";

function fairyDustCursor(options?: any) {
  let possibleColors = (options && options.colors) || ["#0000FF", "#000000", "#777777"];
  let hasWrapperEl = options && options.element;
  let element = hasWrapperEl || document.body;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const cursor = { x: width / 2, y: width / 2 };
  const lastPos = { x: width / 2, y: width / 2 };
  const particles: any[] = [];
  const canvImages: any[] = [];
  let canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, animationFrame: number;

  const char = options?.fairySymbol || "*";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  prefersReducedMotion.onchange = () => {
    if (prefersReducedMotion.matches) {
      destroy();
    } else {
      init();
    }
  };

  function init() {
    if (prefersReducedMotion.matches) return false;

    canvas = document.createElement("canvas");
    context = canvas.getContext("2d")!;
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options?.zIndex || "9999999999";
    canvas.style.position = "fixed";
    element.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;

    context.font = "21px serif";
    context.textBaseline = "middle";
    context.textAlign = "center";

    possibleColors.forEach((color: string) => {
      let measurements = context.measureText(char);
      let bgCanvas = document.createElement("canvas");
      let bgContext = bgCanvas.getContext("2d")!;

      bgCanvas.width = measurements.width;
      bgCanvas.height = measurements.actualBoundingBoxAscent + measurements.actualBoundingBoxDescent;

      bgContext.fillStyle = color;
      bgContext.textAlign = "center";
      bgContext.font = "21px serif";
      bgContext.textBaseline = "middle";
      bgContext.fillText(char, bgCanvas.width / 2, measurements.actualBoundingBoxAscent);

      canvImages.push(bgCanvas);
    });

    bindEvents();
    loop();
  }

  function bindEvents() {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove as any, { passive: true });
    document.addEventListener("touchstart", onTouchMove as any, { passive: true });
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      for (let i = 0; i < e.touches.length; i++) {
        addParticle(e.touches[i].clientX, e.touches[i].clientY, canvImages[Math.floor(Math.random() * canvImages.length)]);
      }
    }
  }

  function onMouseMove(e: MouseEvent) {
    window.requestAnimationFrame(() => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      const distBetweenPoints = Math.hypot(cursor.x - lastPos.x, cursor.y - lastPos.y);
      if (distBetweenPoints > 1.5) {
        addParticle(cursor.x, cursor.y, canvImages[Math.floor(Math.random() * possibleColors.length)]);
        lastPos.x = cursor.x;
        lastPos.y = cursor.y;
      }
    });
  }

  function addParticle(x: number, y: number, colorCanv: any) {
    particles.push(new (Particle as any)(x, y, colorCanv));
  }

  function updateParticles() {
    if (particles.length == 0 || !context) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(context);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].lifeSpan < 0) {
            particles.splice(i, 1);
        }
    }
    if (particles.length == 0) {
        context.clearRect(0, 0, width, height);
    }
  }

  function loop() {
    updateParticles();
    animationFrame = requestAnimationFrame(loop);
  }

  function destroy() {
    if (canvas && canvas.parentNode) canvas.remove();
    cancelAnimationFrame(animationFrame);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove as any);
    document.removeEventListener("touchstart", onTouchMove as any);
    window.removeEventListener("resize", onWindowResize);
  }

  function Particle(this: any, x: number, y: number, canvasItem: any) {
    const lifeSpan = Math.floor(Math.random() * 30 + 60);
    this.initialLifeSpan = lifeSpan;
    this.lifeSpan = lifeSpan;
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
      y: Math.random() * 0.7 + 0.9,
    };
    this.position = { x: x, y: y };
    this.canv = canvasItem;

    this.update = function (ctx: CanvasRenderingContext2D) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.lifeSpan--;
      this.velocity.y += 0.02;
      const scale = Math.max(this.lifeSpan / this.initialLifeSpan, 0);
      ctx.drawImage(
        this.canv,
        this.position.x - (this.canv.width / 2) * scale,
        this.position.y - this.canv.height / 2,
        this.canv.width * scale,
        this.canv.height * scale
      );
    };
  }

  init();

  return { destroy };
}

export default function CursorFairyDust() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Matching the theme: Bright Blue, Pure Black, and Soft Grey
    const cursor = fairyDustCursor({
      colors: ["#0000FF", "#000000", "#999999"],
      fairySymbol: "✦", 
    });

    return () => {
      if (cursor && cursor.destroy) cursor.destroy();
    };
  }, []);

  return null;
}
