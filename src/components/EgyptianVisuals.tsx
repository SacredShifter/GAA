import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { EgyptianChapter } from '../utils/egyptianCodeFrequencies';

interface EgyptianVisualsProps {
  chapter: EgyptianChapter;
  progress: number;
  isPlaying: boolean;
  intensity: number;
}

export const EgyptianVisuals: React.FC<EgyptianVisualsProps> = ({
  chapter,
  progress,
  isPlaying,
  intensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const timeRef = useRef(0);

  const clearScene = useCallback(() => {
    objectsRef.current.forEach(obj => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
      sceneRef.current?.remove(obj);
    });
    objectsRef.current = [];
  }, []);

  const createExpandingCircles = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const numRings = 8;

    for (let i = 0; i < numRings; i++) {
      const radius = 1 + i * 0.8;
      const geometry = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.15, 0.9, 0.6 - i * 0.05),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8 - i * 0.08,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 0.1;
      scene.add(ring);
      objects.push(ring);
    }

    return objects;
  }, []);

  const createFibonacciSpiral = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const points: THREE.Vector3[] = [];

    const turns = 5;
    const segments = 200;
    const phi = 1.618033988749;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * turns * Math.PI * 2;
      const r = Math.pow(phi, t / (Math.PI * 2));
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);
      points.push(new THREE.Vector3(x, y, t * 0.2));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xFFD700,
      linewidth: 2,
      transparent: true,
      opacity: 0.9,
    });

    const spiral = new THREE.Line(geometry, material);
    spiral.scale.set(0.3, 0.3, 0.3);
    scene.add(spiral);
    objects.push(spiral);

    return objects;
  }, []);

  const createSunburstRays = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const numRays = 24;

    const centerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 1,
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerSphere);
    objects.push(centerSphere);

    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const geometry = new THREE.CylinderGeometry(0.05, 0.01, 4, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.7,
      });
      const ray = new THREE.Mesh(geometry, material);
      ray.position.set(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
      ray.lookAt(0, 0, 0);
      ray.rotateX(Math.PI / 2);
      scene.add(ray);
      objects.push(ray);
    }

    return objects;
  }, []);

  const createPyramid = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];

    const geometry = new THREE.ConeGeometry(2, 3, 4);
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xFFD700, linewidth: 2 })
    );
    line.rotation.y = Math.PI / 4;
    scene.add(line);
    objects.push(line);

    const material = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });
    const pyramid = new THREE.Mesh(geometry, material);
    pyramid.rotation.y = Math.PI / 4;
    scene.add(pyramid);
    objects.push(pyramid);

    return objects;
  }, []);

  const createVesicaPiscis = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];

    const geometry1 = new THREE.SphereGeometry(1.5, 32, 32);
    const geometry2 = new THREE.SphereGeometry(1.5, 32, 32);

    const material = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const sphere1 = new THREE.Mesh(geometry1, material.clone());
    const sphere2 = new THREE.Mesh(geometry2, material.clone());

    sphere1.position.x = -0.75;
    sphere2.position.x = 0.75;

    scene.add(sphere1);
    scene.add(sphere2);
    objects.push(sphere1, sphere2);

    return objects;
  }, []);

  const createEyeOfHorus = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];

    const eyeGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4169E1,
      emissive: 0x4169E1,
      emissiveIntensity: 0.5,
    });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    scene.add(eye);
    objects.push(eye);

    const pupilGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupil.position.z = 0.5;
    scene.add(pupil);
    objects.push(pupil);

    return objects;
  }, []);

  const createAuraSphere = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];

    for (let i = 0; i < 5; i++) {
      const radius = 2 + i * 0.5;
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.15, 0.9, 0.6),
        transparent: true,
        opacity: 0.1 / (i + 1),
        side: THREE.DoubleSide,
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      objects.push(sphere);
    }

    return objects;
  }, []);

  const createGeometryForChapter = useCallback((scene: THREE.Scene, visualType: string) => {
    switch (visualType) {
      case 'expanding_circles':
        return createExpandingCircles(scene);
      case 'fibonacci_spiral':
        return createFibonacciSpiral(scene);
      case 'sunburst_rays':
        return createSunburstRays(scene);
      case 'pyramid_pulse':
        return createPyramid(scene);
      case 'vesica_piscis':
        return createVesicaPiscis(scene);
      case 'eye_of_horus':
        return createEyeOfHorus(scene);
      case 'aura_sphere':
        return createAuraSphere(scene);
      case 'void_wavefront':
      case 'spiral_crown':
      case 'golden_ladder':
      case 'feather_scale':
      case 'solar_boat':
      case 'completion_circle':
      default:
        return createExpandingCircles(scene);
    }
  }, [
    createExpandingCircles,
    createFibonacciSpiral,
    createSunburstRays,
    createPyramid,
    createVesicaPiscis,
    createEyeOfHorus,
    createAuraSphere,
  ]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xFFD700, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      if (isPlaying) {
        timeRef.current += 0.01;
      }

      objectsRef.current.forEach((obj, i) => {
        const scale = 1 + Math.sin(timeRef.current + i * 0.5) * 0.1 * intensity;
        obj.scale.set(scale, scale, scale);

        obj.rotation.z += 0.001 * (i + 1);

        if (obj instanceof THREE.Mesh) {
          const material = obj.material as THREE.MeshBasicMaterial;
          if (material.opacity !== undefined) {
            const baseOpacity = 0.8 - i * 0.08;
            material.opacity = baseOpacity * (0.5 + Math.sin(timeRef.current) * 0.5);
          }
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearScene();
      renderer.dispose();
    };
  }, [clearScene, isPlaying, intensity]);

  useEffect(() => {
    if (!sceneRef.current) return;

    clearScene();
    const newObjects = createGeometryForChapter(sceneRef.current, chapter.visual.type);
    objectsRef.current = newObjects;
  }, [chapter.visual.type, clearScene, createGeometryForChapter]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
