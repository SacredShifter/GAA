import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SpectrumData } from '../hooks/useEnhancedAudio';

export type GeometryMode = 'waves' | 'lattice' | 'sacredGeometry' | 'particles' | 'dome';

interface EnhancedVisualsProps {
  frequency: number;
  intensity: number;
  pulseSpeed: number;
  isPlaying: boolean;
  geometryMode: GeometryMode;
  getSpectrumData: () => SpectrumData;
  enableOrbitControls?: boolean;
}

export const EnhancedVisuals: React.FC<EnhancedVisualsProps> = ({
  frequency,
  intensity,
  pulseSpeed,
  isPlaying,
  geometryMode,
  getSpectrumData,
  enableOrbitControls = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const timeRef = useRef(0);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frequencyRef = useRef(frequency);
  const intensityRef = useRef(intensity);
  const pulseSpeedRef = useRef(pulseSpeed);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    frequencyRef.current = frequency;
    intensityRef.current = intensity;
    pulseSpeedRef.current = pulseSpeed;
    isPlayingRef.current = isPlaying;
  }, [frequency, intensity, pulseSpeed, isPlaying]);

  const createWavesGeometry = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const numRings = 12;

    for (let i = 0; i < numRings; i++) {
      const geometry = new THREE.RingGeometry(0.5 + i * 0.3, 0.52 + i * 0.3, 64);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6, 0.8, 0.5),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6 - i * 0.04,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 0.2;
      scene.add(ring);
      objects.push(ring);
    }

    return objects;
  }, []);

  const createLatticeGeometry = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const gridSize = 20;
    const spacing = 0.5;

    const material = new THREE.LineBasicMaterial({
      color: 0xbd93f9,
      transparent: true,
      opacity: 0.6,
    });

    for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
      const points = [];
      for (let j = -gridSize / 2; j <= gridSize / 2; j++) {
        points.push(new THREE.Vector3(i * spacing, j * spacing, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      objects.push(line);
    }

    for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
      const points = [];
      for (let j = -gridSize / 2; j <= gridSize / 2; j++) {
        points.push(new THREE.Vector3(j * spacing, i * spacing, 0));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      objects.push(line);
    }

    return objects;
  }, []);

  const createSacredGeometry = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];
    const numCircles = 7;
    const radius = 1;

    for (let i = 0; i < numCircles; i++) {
      const angle = (i / numCircles) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const geometry = new THREE.TorusGeometry(radius, 0.02, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL((i / numCircles), 0.8, 0.5),
        transparent: true,
        opacity: 0.7,
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.position.set(x, y, 0);
      scene.add(torus);
      objects.push(torus);
    }

    const centerGeometry = new THREE.TorusGeometry(radius, 0.02, 16, 100);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const centerTorus = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerTorus);
    objects.push(centerTorus);

    return objects;
  }, []);

  const createParticleSystem = useCallback((scene: THREE.Scene) => {
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    return [particles];
  }, []);

  const createDomeGeometry = useCallback((scene: THREE.Scene) => {
    const objects: THREE.Object3D[] = [];

    const geometry = new THREE.SphereGeometry(5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xbd93f9,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const dome = new THREE.Mesh(geometry, material);
    scene.add(dome);
    objects.push(dome);

    for (let i = 0; i < 5; i++) {
      const ringGeometry = new THREE.TorusGeometry(i + 1, 0.05, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.05, 0.8, 0.5),
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      objects.push(ring);
    }

    return objects;
  }, []);

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
    particlesRef.current = null;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282a36);
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
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    if (enableOrbitControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const currentFrequency = frequencyRef.current;
      const currentIntensity = intensityRef.current;
      const currentPulseSpeed = pulseSpeedRef.current;
      const currentIsPlaying = isPlayingRef.current;

      timeRef.current += 0.01 * currentPulseSpeed;

      const spectrumData = getSpectrumData();
      const normalizedAmplitude = spectrumData.averageEnergy;

      if (geometryMode === 'particles' && particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const distance = Math.sqrt(
            positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
          );
          const wave = Math.sin(distance * (currentFrequency / 200) - timeRef.current * 2) * normalizedAmplitude * 2;
          const scale = 1 + wave * 0.5 * currentIntensity;
          positions[i] *= scale / (scale - wave * 0.5);
          positions[i + 1] *= scale / (scale - wave * 0.5);
          positions[i + 2] *= scale / (scale - wave * 0.5);

          const hue = ((currentFrequency - 20) / 1980 + (i / positions.length)) % 1;
          const color = new THREE.Color().setHSL(hue, 0.8, 0.5 + normalizedAmplitude * 0.3);
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.geometry.attributes.color.needsUpdate = true;
        particlesRef.current.rotation.y += 0.001 * currentPulseSpeed;
      }

      objectsRef.current.forEach((obj, i) => {
        if (geometryMode === 'waves') {
          const scale = 1 + Math.sin(timeRef.current - i * 0.3) * 0.1 * currentIntensity;
          const amplitudeScale = currentIsPlaying ? 1 + normalizedAmplitude * 0.5 : 1;
          obj.scale.set(scale * amplitudeScale, scale * amplitudeScale, 1);

          const hue = (0.6 + (currentFrequency - 400) / 1000) % 1;
          if (obj instanceof THREE.Mesh) {
            const material = obj.material as THREE.MeshBasicMaterial;
            material.color.setHSL(hue, 0.8, 0.5 + normalizedAmplitude * 0.3);
          }

          obj.rotation.z = timeRef.current * 0.2 + i * 0.1;
        } else if (geometryMode === 'lattice') {
          if (obj instanceof THREE.Line) {
            const positions = obj.geometry.attributes.position.array as Float32Array;
            for (let j = 0; j < positions.length; j += 3) {
              const wave = Math.sin(positions[j] + positions[j + 1] + timeRef.current * (currentFrequency / 400)) * normalizedAmplitude;
              positions[j + 2] = wave * 2 * currentIntensity;
            }
            obj.geometry.attributes.position.needsUpdate = true;

            if (obj.material instanceof THREE.LineBasicMaterial) {
              const hue = (0.6 + (currentFrequency - 400) / 1000) % 1;
              obj.material.color.setHSL(hue, 0.8, 0.6);
            }
          }
        } else if (geometryMode === 'sacredGeometry') {
          const scale = 1 + Math.sin(timeRef.current + i) * 0.1 * currentIntensity + normalizedAmplitude * 0.3;
          obj.scale.set(scale, scale, scale);
          obj.rotation.z += 0.005 * currentPulseSpeed;

          if (obj instanceof THREE.Mesh) {
            const material = obj.material as THREE.MeshBasicMaterial;
            const hue = (i / 7 + (currentFrequency - 400) / 2000) % 1;
            material.color.setHSL(hue, 0.8, 0.5 + normalizedAmplitude * 0.2);
          }
        } else if (geometryMode === 'dome') {
          obj.rotation.y += 0.002 * currentPulseSpeed;
          if (obj instanceof THREE.Mesh) {
            const material = obj.material as THREE.MeshBasicMaterial;
            const hue = (0.6 + (currentFrequency - 400) / 1000) % 1;
            material.color.setHSL(hue, 0.8, 0.5 + normalizedAmplitude * 0.2);
          }
        }
      });

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearScene();
      controlsRef.current?.dispose();
      renderer.dispose();
    };
  }, [enableOrbitControls, clearScene, getSpectrumData, geometryMode]);

  useEffect(() => {
    if (!sceneRef.current) return;

    clearScene();

    let newObjects: THREE.Object3D[] = [];

    switch (geometryMode) {
      case 'lattice':
        newObjects = createLatticeGeometry(sceneRef.current);
        break;
      case 'sacredGeometry':
        newObjects = createSacredGeometry(sceneRef.current);
        break;
      case 'particles':
        newObjects = createParticleSystem(sceneRef.current);
        break;
      case 'dome':
        newObjects = createDomeGeometry(sceneRef.current);
        break;
      default:
        newObjects = createWavesGeometry(sceneRef.current);
    }

    objectsRef.current = newObjects;
  }, [geometryMode, clearScene, createWavesGeometry, createLatticeGeometry, createSacredGeometry, createParticleSystem, createDomeGeometry]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
