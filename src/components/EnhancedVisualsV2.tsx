import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import type { SpectrumData } from '../hooks/useEnhancedAudio';
import { performanceDetector, type QualityLevel } from '../utils/performanceDetector';

export type GeometryMode = 'waves' | 'lattice' | 'sacredGeometry' | 'particles' | 'dome' | 'fractal' | 'nebula';

interface EnhancedVisualsV2Props {
  frequency: number;
  intensity: number;
  pulseSpeed: number;
  isPlaying: boolean;
  geometryMode: GeometryMode;
  getSpectrumData: () => SpectrumData;
  enableOrbitControls?: boolean;
  quality?: QualityLevel;
  adaptiveQuality?: boolean;
}

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 offset = amount * vec2(1.0, 0.0);
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cga = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
    }
  `,
};

export const EnhancedVisualsV2: React.FC<EnhancedVisualsV2Props> = ({
  frequency,
  intensity,
  pulseSpeed,
  isPlaying,
  geometryMode,
  getSpectrumData,
  enableOrbitControls = false,
  quality,
  adaptiveQuality = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const trailsRef = useRef<THREE.Line[]>([]);
  const timeRef = useRef(0);
  const frequencyRef = useRef(frequency);
  const intensityRef = useRef(intensity);
  const pulseSpeedRef = useRef(pulseSpeed);
  const isPlayingRef = useRef(isPlaying);
  const frameCountRef = useRef(0);

  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(
    quality || performanceDetector.getRecommendedQuality()
  );

  useEffect(() => {
    frequencyRef.current = frequency;
    intensityRef.current = intensity;
    pulseSpeedRef.current = pulseSpeed;
    isPlayingRef.current = isPlaying;
  }, [frequency, intensity, pulseSpeed, isPlaying]);

  const createFractalTree = useCallback((scene: THREE.Scene, qualitySettings: any) => {
    const objects: THREE.Object3D[] = [];
    const branchCount = qualitySettings.particleCount > 3000 ? 6 : 4;
    const depth = qualitySettings.particleCount > 5000 ? 4 : 3;

    const createBranch = (
      parent: THREE.Object3D,
      level: number,
      angle: number,
      length: number
    ) => {
      if (level === 0) return;

      for (let i = 0; i < branchCount; i++) {
        const branchAngle = (i / branchCount) * Math.PI * 2;
        const geometry = new THREE.CylinderGeometry(0.05 * level, 0.08 * level, length, 8);
        const hue = (angle + branchAngle) / (Math.PI * 2);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(hue, 0.8, 0.5),
          emissive: new THREE.Color().setHSL(hue, 0.8, 0.3),
          emissiveIntensity: 0.5,
        });

        const branch = new THREE.Mesh(geometry, material);
        branch.position.y = length / 2;
        branch.rotation.z = branchAngle;
        branch.rotation.x = Math.PI / 6;

        const pivot = new THREE.Object3D();
        pivot.add(branch);
        pivot.rotation.y = angle;
        parent.add(pivot);
        objects.push(pivot);

        createBranch(branch, level - 1, branchAngle, length * 0.7);
      }
    };

    const root = new THREE.Object3D();
    createBranch(root, depth, 0, 2);
    scene.add(root);
    objects.push(root);

    return objects;
  }, []);

  const createNebula = useCallback((scene: THREE.Scene, qualitySettings: any) => {
    const objects: THREE.Object3D[] = [];
    const cloudCount = qualitySettings.particleCount > 5000 ? 8 : 4;

    for (let i = 0; i < cloudCount; i++) {
      const particleCount = Math.floor(qualitySettings.particleCount / cloudCount);
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const centerX = (Math.random() - 0.5) * 10;
      const centerY = (Math.random() - 0.5) * 10;
      const centerZ = (Math.random() - 0.5) * 10;

      for (let j = 0; j < particleCount; j++) {
        const radius = Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        positions[j * 3] = centerX + radius * Math.sin(phi) * Math.cos(theta);
        positions[j * 3 + 1] = centerY + radius * Math.sin(phi) * Math.sin(theta);
        positions[j * 3 + 2] = centerZ + radius * Math.cos(phi);

        const hue = (i / cloudCount + Math.random() * 0.1) % 1;
        const color = new THREE.Color().setHSL(hue, 0.9, 0.6);
        colors[j * 3] = color.r;
        colors[j * 3 + 1] = color.g;
        colors[j * 3 + 2] = color.b;

        sizes[j] = Math.random() * 0.3 + 0.1;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const cloud = new THREE.Points(geometry, material);
      cloud.userData.center = { x: centerX, y: centerY, z: centerZ };
      cloud.userData.cloudIndex = i;
      scene.add(cloud);
      objects.push(cloud);
    }

    return objects;
  }, []);

  const createParticleTrails = useCallback((scene: THREE.Scene, count: number) => {
    const trails: THREE.Line[] = [];

    for (let i = 0; i < count; i++) {
      const points: THREE.Vector3[] = [];
      const trailLength = 20;

      for (let j = 0; j < trailLength; j++) {
        points.push(new THREE.Vector3(0, 0, 0));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(i / count, 0.8, 0.5),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geometry, material);
      line.userData.trailIndex = i;
      scene.add(line);
      trails.push(line);
    }

    return trails;
  }, []);

  const clearScene = useCallback(() => {
    if (!sceneRef.current) return;

    objectsRef.current.forEach(obj => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      sceneRef.current?.remove(obj);
    });
    objectsRef.current = [];

    trailsRef.current.forEach(trail => {
      trail.geometry.dispose();
      (trail.material as THREE.Material).dispose();
      sceneRef.current?.remove(trail);
    });
    trailsRef.current = [];
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qualitySettings = performanceDetector.getQualitySettings(currentQuality);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    scene.fog = new THREE.FogExp2(0x000510, 0.02);
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
      antialias: qualitySettings.antialias,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(qualitySettings.pixelRatio);
    rendererRef.current = renderer;

    if (qualitySettings.postProcessing) {
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      if (qualitySettings.bloomEnabled) {
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          currentQuality === 'ultra' ? 2.0 : 1.5,
          currentQuality === 'ultra' ? 0.6 : 0.4,
          currentQuality === 'ultra' ? 0.2 : 0.85
        );
        composer.addPass(bloomPass);
      }

      if (qualitySettings.chromaticAberration) {
        const chromaPass = new ShaderPass(ChromaticAberrationShader);
        chromaPass.uniforms['amount'].value = 0.003;
        composer.addPass(chromaPass);
      }

      composerRef.current = composer;
    }

    if (enableOrbitControls) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    for (let i = 0; i < qualitySettings.maxLights; i++) {
      const pointLight = new THREE.PointLight(
        new THREE.Color().setHSL(i / qualitySettings.maxLights, 0.8, 0.5),
        1,
        50
      );
      const angle = (i / qualitySettings.maxLights) * Math.PI * 2;
      pointLight.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 5);
      scene.add(pointLight);
    }

    if (geometryMode === 'fractal') {
      objectsRef.current = createFractalTree(scene, qualitySettings);
    } else if (geometryMode === 'nebula') {
      objectsRef.current = createNebula(scene, qualitySettings);
      if (qualitySettings.particleCount > 3000) {
        trailsRef.current = createParticleTrails(scene, 20);
      }
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      if (composerRef.current) {
        composerRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      const currentFrequency = frequencyRef.current;
      const currentIntensity = intensityRef.current;
      const currentPulseSpeed = pulseSpeedRef.current;

      timeRef.current += 0.01 * currentPulseSpeed;
      frameCountRef.current++;

      if (adaptiveQuality && frameCountRef.current % 60 === 0) {
        const fps = performanceDetector.recordFrame();

        if (frameCountRef.current > 180) {
          const newQuality = performanceDetector.shouldDowngradeQuality(currentQuality) ||
                            performanceDetector.shouldUpgradeQuality(currentQuality);
          if (newQuality && newQuality !== currentQuality) {
            setCurrentQuality(newQuality);
            performanceDetector.reset();
          }
        }
      }

      const spectrumData = getSpectrumData();
      const normalizedAmplitude = spectrumData.averageEnergy;

      if (geometryMode === 'fractal') {
        objectsRef.current.forEach((obj, i) => {
          obj.rotation.y += 0.001 * currentPulseSpeed * (1 + normalizedAmplitude);
          obj.rotation.z = Math.sin(timeRef.current + i) * 0.1 * currentIntensity;

          obj.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
              const hue = ((currentFrequency - 20) / 1980 + i * 0.1 + timeRef.current * 0.05) % 1;
              child.material.color.setHSL(hue, 0.8, 0.5);
              child.material.emissive.setHSL(hue, 0.8, 0.3);
              child.material.emissiveIntensity = 0.5 + normalizedAmplitude * 0.5;
            }
          });
        });
      } else if (geometryMode === 'nebula') {
        objectsRef.current.forEach((cloud, i) => {
          if (cloud instanceof THREE.Points) {
            const positions = cloud.geometry.attributes.position.array as Float32Array;
            const colors = cloud.geometry.attributes.color.array as Float32Array;
            const center = cloud.userData.center;

            for (let j = 0; j < positions.length; j += 3) {
              const dx = positions[j] - center.x;
              const dy = positions[j + 1] - center.y;
              const dz = positions[j + 2] - center.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

              const wave = Math.sin(distance * (currentFrequency / 200) - timeRef.current * 2) * currentIntensity;
              positions[j] += Math.sin(timeRef.current + j) * 0.01 * currentPulseSpeed;
              positions[j + 1] += Math.cos(timeRef.current + j) * 0.01 * currentPulseSpeed;
              positions[j + 2] += wave * 0.02;

              const hue = ((currentFrequency - 20) / 1980 + (cloud.userData.cloudIndex / objectsRef.current.length)) % 1;
              const color = new THREE.Color().setHSL(hue, 0.9, 0.6 + normalizedAmplitude * 0.3);
              colors[j] = color.r;
              colors[j + 1] = color.g;
              colors[j + 2] = color.b;
            }

            cloud.geometry.attributes.position.needsUpdate = true;
            cloud.geometry.attributes.color.needsUpdate = true;
            cloud.rotation.y += 0.0005 * currentPulseSpeed;
          }
        });

        trailsRef.current.forEach((trail, i) => {
          const angle = (i / trailsRef.current.length) * Math.PI * 2;
          const radius = 5 + Math.sin(timeRef.current + i) * 2;
          const x = Math.cos(angle + timeRef.current * 0.5) * radius;
          const y = Math.sin(timeRef.current * 0.3 + i) * 3;
          const z = Math.sin(angle + timeRef.current * 0.5) * radius;

          const positions = trail.geometry.attributes.position.array as Float32Array;
          for (let j = positions.length - 3; j > 2; j -= 3) {
            positions[j] = positions[j - 3];
            positions[j + 1] = positions[j - 2];
            positions[j + 2] = positions[j - 1];
          }
          positions[0] = x;
          positions[1] = y;
          positions[2] = z;

          trail.geometry.attributes.position.needsUpdate = true;

          if (trail.material instanceof THREE.LineBasicMaterial) {
            const hue = ((currentFrequency - 20) / 1980 + i / trailsRef.current.length) % 1;
            trail.material.color.setHSL(hue, 0.8, 0.5 + normalizedAmplitude * 0.3);
          }
        });
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearScene();
      controlsRef.current?.dispose();
      composerRef.current?.dispose();
      renderer.dispose();
    };
  }, [geometryMode, enableOrbitControls, currentQuality, adaptiveQuality, clearScene, createFractalTree, createNebula, createParticleTrails, getSpectrumData]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      {adaptiveQuality && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm z-10">
          Quality: {currentQuality} | FPS: {Math.round(performanceDetector.getAverageFPS())}
        </div>
      )}
    </div>
  );
};
