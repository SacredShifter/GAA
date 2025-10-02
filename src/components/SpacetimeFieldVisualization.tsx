import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { CollectiveWaveFunction } from '../utils/quantumCoherenceEngine';
import type { BiometricReading } from '../utils/biometricMonitor';

export interface SpacetimeFieldVisualizationProps {
  collectiveWave: CollectiveWaveFunction | null;
  biometrics: Map<string, BiometricReading>;
  showPast?: boolean;
  showFuture?: boolean;
  timeWindowSeconds?: number;
  theme?: 'dark' | 'light';
}

interface ParticleData {
  userId: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  coherence: number;
  entanglementLinks: string[];
}

interface TimelineSnapshot {
  timestamp: number;
  particles: ParticleData[];
  fieldStrength: number;
  globalCoherence: number;
}

export const SpacetimeFieldVisualization: React.FC<SpacetimeFieldVisualizationProps> = ({
  collectiveWave,
  biometrics,
  showPast = true,
  showFuture = true,
  timeWindowSeconds = 60,
  theme = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const entanglementLinesRef = useRef<THREE.LineSegments | null>(null);
  const fieldMeshRef = useRef<THREE.Mesh | null>(null);
  const timelineRef = useRef<TimelineSnapshot[]>([]);
  const animationRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    initializeScene();

    const animate = () => {
      if (!isPaused) {
        updateVisualization();
        renderScene();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (collectiveWave && !isPaused) {
      captureSnapshot();
      updateParticles();
      updateEntanglementLinks();
      updateFieldMesh();
    }
  }, [collectiveWave, biometrics, isPaused]);

  const initializeScene = () => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x0a0a0f : 0xf0f0f5);
    scene.fog = new THREE.FogExp2(theme === 'dark' ? 0x0a0a0f : 0xf0f0f5, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(25);
    scene.add(axesHelper);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    initializeFieldMesh();
  };

  const initializeFieldMesh = () => {
    if (!sceneRef.current) return;

    const geometry = new THREE.SphereGeometry(15, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);
    fieldMeshRef.current = mesh;
  };

  const captureSnapshot = () => {
    if (!collectiveWave) return;

    const particles: ParticleData[] = [];

    collectiveWave.participants.forEach((userId, index) => {
      const angle = (index / collectiveWave.participants.length) * Math.PI * 2;
      const radius = 10;

      const biometric = biometrics.get(userId);
      const coherence = biometric?.coherenceScore || 0.5;

      const entangledWith = collectiveWave.entanglements
        .filter((e) => e.userA === userId || e.userB === userId)
        .map((e) => (e.userA === userId ? e.userB : e.userA));

      particles.push({
        userId,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (coherence - 0.5) * 10,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05
        ),
        coherence,
        entanglementLinks: entangledWith,
      });
    });

    const snapshot: TimelineSnapshot = {
      timestamp: Date.now(),
      particles,
      fieldStrength: collectiveWave.globalCoherence * 100,
      globalCoherence: collectiveWave.globalCoherence,
    };

    timelineRef.current.push(snapshot);

    const maxSnapshots = Math.floor((timeWindowSeconds * 1000) / 100);
    if (timelineRef.current.length > maxSnapshots) {
      timelineRef.current.shift();
    }
  };

  const updateParticles = () => {
    if (!collectiveWave || !sceneRef.current) return;

    const currentSnapshot = timelineRef.current[timelineRef.current.length - 1];
    if (!currentSnapshot) return;

    currentSnapshot.particles.forEach((particleData) => {
      let particle = particlesRef.current.get(particleData.userId);

      if (!particle) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: getCoherenceColor(particleData.coherence),
          emissive: getCoherenceColor(particleData.coherence),
          emissiveIntensity: particleData.coherence,
        });
        particle = new THREE.Mesh(geometry, material);
        sceneRef.current.add(particle);
        particlesRef.current.set(particleData.userId, particle);

        const glowGeometry = new THREE.SphereGeometry(1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: getCoherenceColor(particleData.coherence),
          transparent: true,
          opacity: 0.2,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        particle.add(glow);
      }

      particle.position.copy(particleData.position);

      const material = particle.material as THREE.MeshPhongMaterial;
      material.color.set(getCoherenceColor(particleData.coherence));
      material.emissive.set(getCoherenceColor(particleData.coherence));
      material.emissiveIntensity = particleData.coherence;

      const scale = 0.5 + particleData.coherence * 0.5;
      particle.scale.set(scale, scale, scale);
    });

    particlesRef.current.forEach((particle, userId) => {
      const exists = currentSnapshot.particles.some((p) => p.userId === userId);
      if (!exists && sceneRef.current) {
        sceneRef.current.remove(particle);
        particlesRef.current.delete(userId);
      }
    });
  };

  const updateEntanglementLinks = () => {
    if (!collectiveWave || !sceneRef.current) return;

    if (entanglementLinesRef.current) {
      sceneRef.current.remove(entanglementLinesRef.current);
    }

    const positions: number[] = [];
    const colors: number[] = [];

    collectiveWave.entanglements.forEach((entanglement) => {
      const particleA = particlesRef.current.get(entanglement.userA);
      const particleB = particlesRef.current.get(entanglement.userB);

      if (particleA && particleB) {
        positions.push(
          particleA.position.x,
          particleA.position.y,
          particleA.position.z,
          particleB.position.x,
          particleB.position.y,
          particleB.position.z
        );

        const color = new THREE.Color(0xffaa00);
        colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
      }
    });

    if (positions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      });

      const lines = new THREE.LineSegments(geometry, material);
      sceneRef.current.add(lines);
      entanglementLinesRef.current = lines;
    }
  };

  const updateFieldMesh = () => {
    if (!collectiveWave || !fieldMeshRef.current) return;

    const scale = 1 + collectiveWave.globalCoherence * 0.5;
    fieldMeshRef.current.scale.set(scale, scale, scale);

    const material = fieldMeshRef.current.material as THREE.MeshPhongMaterial;
    material.opacity = 0.1 + collectiveWave.globalCoherence * 0.2;
    material.color.setHSL(0.55 + collectiveWave.globalCoherence * 0.2, 0.8, 0.5);

    fieldMeshRef.current.rotation.y += 0.001;
  };

  const getCoherenceColor = (coherence: number): number => {
    const hue = 0.0 + coherence * 0.6;
    const color = new THREE.Color();
    color.setHSL(hue, 0.8, 0.5);
    return color.getHex();
  };

  const updateVisualization = () => {
    if (!cameraRef.current) return;

    cameraRef.current.position.x = Math.cos(Date.now() * 0.0001) * 40;
    cameraRef.current.position.z = Math.sin(Date.now() * 0.0001) * 40;
    cameraRef.current.lookAt(0, 0, 0);

    particlesRef.current.forEach((particle) => {
      particle.rotation.y += 0.02;
    });
  };

  const renderScene = () => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (rendererRef.current && containerRef.current) {
      containerRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    particlesRef.current.forEach((particle) => {
      particle.geometry.dispose();
      (particle.material as THREE.Material).dispose();
    });

    particlesRef.current.clear();
  };

  const jumpToTimestamp = (timestamp: number) => {
    const snapshot = timelineRef.current.find((s) => s.timestamp === timestamp);
    if (!snapshot || !sceneRef.current) return;

    particlesRef.current.forEach((particle) => {
      sceneRef.current?.remove(particle);
    });
    particlesRef.current.clear();

    snapshot.particles.forEach((particleData) => {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: getCoherenceColor(particleData.coherence),
        emissive: getCoherenceColor(particleData.coherence),
        emissiveIntensity: particleData.coherence,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(particleData.position);
      sceneRef.current.add(particle);
      particlesRef.current.set(particleData.userId, particle);
    });

    setIsPaused(true);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <div className="text-sm font-mono space-y-1">
          <div>Participants: {collectiveWave?.participants.length || 0}</div>
          <div>
            Global Coherence: {((collectiveWave?.globalCoherence || 0) * 100).toFixed(1)}%
          </div>
          <div>
            Entanglements: {collectiveWave?.entanglements.length || 0}
          </div>
          <div>
            Emergent Frequency: {collectiveWave?.emergentFrequency.toFixed(1) || 432} Hz
          </div>
        </div>
      </div>

      {showPast && timelineRef.current.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 p-4 rounded-lg">
          <div className="text-white text-sm mb-2">Timeline (Past → Present → Future)</div>
          <input
            type="range"
            min={0}
            max={timelineRef.current.length - 1}
            value={timelinePosition}
            onChange={(e) => {
              const pos = parseInt(e.target.value);
              setTimelinePosition(pos);
              jumpToTimestamp(timelineRef.current[pos].timestamp);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-white text-xs mt-2">
            <span>-{timeWindowSeconds}s</span>
            <span>Now</span>
            {showFuture && <span>+{timeWindowSeconds}s (predicted)</span>}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 space-x-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={() => {
            setTimelinePosition(timelineRef.current.length - 1);
            setIsPaused(false);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Live
        </button>
      </div>
    </div>
  );
};
