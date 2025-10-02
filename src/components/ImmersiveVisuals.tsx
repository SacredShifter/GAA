import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import type { SpectrumData } from '../hooks/useEnhancedAudio';

interface ImmersiveVisualsProps {
  frequency: number;
  intensity: number;
  isPlaying: boolean;
  getSpectrumData: () => SpectrumData;
  mode: 'warpTunnel' | 'coralBarrier' | 'normal';
  onModeChange?: (mode: 'warpTunnel' | 'coralBarrier' | 'normal') => void;
  theme?: 'dark' | 'light';
}

export const ImmersiveVisuals: React.FC<ImmersiveVisualsProps> = ({
  frequency,
  intensity,
  isPlaying,
  getSpectrumData,
  mode,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const tunnelRef = useRef<THREE.Mesh[]>([]);
  const coralRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);

  useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setIsVRSupported(supported);
      });
    }
  }, []);

  const createWarpTunnel = (scene: THREE.Scene) => {
    const tunnelSegments: THREE.Mesh[] = [];
    const segmentCount = 50;

    for (let i = 0; i < segmentCount; i++) {
      const geometry = new THREE.RingGeometry(2, 2.5, 32);
      const hue = (i / segmentCount + 0.5) % 1;
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.5),
        transparent: true,
        opacity: 0.7 - (i / segmentCount) * 0.5,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 2;
      scene.add(ring);
      tunnelSegments.push(ring);
    }

    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 0.5;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = -Math.random() * 100;

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 1, 0.7);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    tunnelSegments.push(particles as any);

    return tunnelSegments;
  };

  const createCoralBarrier = (scene: THREE.Scene) => {
    const coralGroup = new THREE.Group();

    const barrierCount = 12;
    const radius = 8;

    for (let i = 0; i < barrierCount; i++) {
      const angle = (i / barrierCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const coralHeight = 3 + Math.random() * 2;
      const geometry = new THREE.ConeGeometry(0.5, coralHeight, 8);
      const hue = (i / barrierCount + 0.1) % 1;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color().setHSL(hue, 0.8, 0.3),
      });

      const coral = new THREE.Mesh(geometry, material);
      coral.position.set(x, coralHeight / 2 - 2, z);
      coral.rotation.y = angle;

      for (let j = 0; j < 3; j++) {
        const branchGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1.5, 6);
        const branch = new THREE.Mesh(branchGeometry, material.clone());
        branch.position.set(
          Math.random() * 0.5 - 0.25,
          Math.random() * coralHeight * 0.3,
          Math.random() * 0.5 - 0.25
        );
        branch.rotation.set(
          Math.random() * Math.PI / 4,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI / 4
        );
        coral.add(branch);
      }

      coralGroup.add(coral);
    }

    const energyFieldGeometry = new THREE.TorusGeometry(radius, 0.2, 16, 100);
    const energyFieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x44ffdd,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const energyField = new THREE.Mesh(energyFieldGeometry, energyFieldMaterial);
    energyField.rotation.x = Math.PI / 2;
    coralGroup.add(energyField);

    scene.add(coralGroup);
    return coralGroup;
  };

  const clearScene = () => {
    if (!sceneRef.current) return;

    tunnelRef.current.forEach(obj => {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => mat.dispose());
      } else {
        obj.material.dispose();
      }
      sceneRef.current?.remove(obj);
    });
    tunnelRef.current = [];

    if (coralRef.current) {
      coralRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      sceneRef.current.remove(coralRef.current);
      coralRef.current = null;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x000510 : 0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    if (isVRSupported) {
      const vrButton = VRButton.createButton(renderer);
      vrButton.style.position = 'absolute';
      vrButton.style.bottom = '20px';
      vrButton.style.left = '50%';
      vrButton.style.transform = 'translateX(-50%)';
      containerRef.current.appendChild(vrButton);

      renderer.xr.addEventListener('sessionstart', () => setIsVRActive(true));
      renderer.xr.addEventListener('sessionend', () => setIsVRActive(false));
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x44ffdd, 1, 100);
    pointLight.position.set(0, 5, 5);
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

      timeRef.current += 0.01;
      const spectrumData = getSpectrumData();
      const normalizedAmplitude = spectrumData.averageEnergy;

      if (mode === 'warpTunnel' && tunnelRef.current.length > 0) {
        const speed = 0.5 + intensity * 2 + normalizedAmplitude * 3;

        tunnelRef.current.forEach((obj, index) => {
          if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.RingGeometry) {
            obj.position.z += speed * 0.1;

            if (obj.position.z > 5) {
              obj.position.z = -tunnelRef.current.length * 2;
            }

            const scale = 1 + Math.sin(timeRef.current * 2 + index * 0.5) * 0.1 * intensity;
            obj.scale.set(scale, scale, 1);

            const hue = ((frequency - 20) / 1980 + timeRef.current * 0.1 + index * 0.02) % 1;
            (obj.material as THREE.MeshBasicMaterial).color.setHSL(hue, 0.8, 0.5);
          } else if (obj instanceof THREE.Points) {
            const positions = obj.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
              positions[i + 2] += speed * 0.5;
              if (positions[i + 2] > 5) {
                positions[i + 2] = -100;
              }
            }
            obj.geometry.attributes.position.needsUpdate = true;
          }
        });

        if (!isVRActive) {
          cameraRef.current.position.z = 5 + Math.sin(timeRef.current) * 0.5;
        }
      }

      if (mode === 'coralBarrier' && coralRef.current) {
        coralRef.current.rotation.y += 0.001;

        const threshold = 0.7;
        const energyIntensity = intensity > threshold ? (intensity - threshold) / (1 - threshold) : 0;

        coralRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry instanceof THREE.ConeGeometry) {
              const scale = 1 + energyIntensity * 0.3 + normalizedAmplitude * 0.2;
              child.scale.y = scale;

              if (energyIntensity > 0) {
                const material = child.material as THREE.MeshPhongMaterial;
                material.emissiveIntensity = 1 + energyIntensity * 2;
                material.opacity = 0.8 + energyIntensity * 0.2;
              }
            }

            if (child.geometry instanceof THREE.TorusGeometry) {
              const material = child.material as THREE.MeshBasicMaterial;
              material.opacity = 0.3 + energyIntensity * 0.5;
              child.rotation.z = timeRef.current;
            }
          }
        });

        if (!isVRActive) {
          cameraRef.current.position.x = Math.cos(timeRef.current * 0.2) * 2;
          cameraRef.current.position.z = 10 + Math.sin(timeRef.current * 0.2) * 2;
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearScene();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [theme, isVRSupported]);

  useEffect(() => {
    if (!sceneRef.current) return;

    clearScene();

    if (mode === 'warpTunnel') {
      tunnelRef.current = createWarpTunnel(sceneRef.current);
    } else if (mode === 'coralBarrier') {
      coralRef.current = createCoralBarrier(sceneRef.current);
    }
  }, [mode]);

  return <div ref={containerRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />;
};
