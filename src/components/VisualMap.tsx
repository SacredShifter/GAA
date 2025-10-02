import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SyncSession } from '../hooks/useSync';

type MapMode = 'globe' | 'lattice';

interface VisualMapProps {
  sessions: SyncSession[];
  mode?: MapMode;
  theme?: 'dark' | 'light';
  onSessionClick?: (session: SyncSession) => void;
}

interface SessionNode {
  session: SyncSession;
  mesh: THREE.Mesh;
  rippleTime: number;
  isNew: boolean;
}

export const VisualMap: React.FC<VisualMapProps> = ({
  sessions,
  mode = 'globe',
  theme = 'dark',
  onSessionClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sessionNodesRef = useRef<Map<string, SessionNode>>(new Map());
  const timeRef = useRef(0);
  const butterfliesRef = useRef<THREE.Points | null>(null);
  const [syncThreshold, setSyncThreshold] = useState(false);

  useEffect(() => {
    if (sessions.length >= 5 && !syncThreshold) {
      setSyncThreshold(true);
    } else if (sessions.length < 5 && syncThreshold) {
      setSyncThreshold(false);
    }
  }, [sessions.length, syncThreshold]);

  const createGlobe = (scene: THREE.Scene) => {
    const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
    const globeMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x1a1a2e : 0xe0e0e0,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const circleGeometry = new THREE.RingGeometry(5, 5.05, 128);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x44ffdd,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const equator = new THREE.Mesh(circleGeometry, circleMaterial);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    return globe;
  };

  const createLattice = (scene: THREE.Scene) => {
    const gridSize = 20;
    const spacing = 1;
    const material = new THREE.LineBasicMaterial({
      color: theme === 'dark' ? 0x44ffdd : 0x4488ff,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = -gridSize / 2; i <= gridSize / 2; i += 2) {
      for (let j = -gridSize / 2; j <= gridSize / 2; j += 2) {
        const points = [
          new THREE.Vector3(i * spacing, j * spacing, 0),
          new THREE.Vector3((i + 2) * spacing, j * spacing, 0),
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);

        const points2 = [
          new THREE.Vector3(i * spacing, j * spacing, 0),
          new THREE.Vector3(i * spacing, (j + 2) * spacing, 0),
        ];
        const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const line2 = new THREE.Line(geometry2, material);
        scene.add(line2);
      }
    }
  };

  const createSessionNode = (scene: THREE.Scene, session: SyncSession, position: THREE.Vector3) => {
    const hue = ((session.frequency - 20) / 1980) % 1;
    const size = 0.1 + session.intensity * 0.3;

    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, 0.6),
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);

    const glowGeometry = new THREE.SphereGeometry(size * 2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, 0.6),
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);

    return mesh;
  };

  const createRippleEffect = (scene: THREE.Scene, position: THREE.Vector3, hue: number) => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const rippleGeometry = new THREE.RingGeometry(0.5, 0.6, 32);
        const rippleMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(hue, 0.8, 0.6),
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(position);

        if (mode === 'globe') {
          const normal = position.clone().normalize();
          ripple.lookAt(normal.multiplyScalar(10).add(position));
        }

        scene.add(ripple);

        const startTime = Date.now();
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed > 2) {
            scene.remove(ripple);
            ripple.geometry.dispose();
            (ripple.material as THREE.Material).dispose();
            return;
          }

          const scale = 1 + elapsed * 2;
          ripple.scale.set(scale, scale, 1);
          (ripple.material as THREE.MeshBasicMaterial).opacity = 0.8 - elapsed * 0.4;

          requestAnimationFrame(animate);
        };
        animate();
      }, i * 200);
    }
  };

  const createButterflySwarm = (scene: THREE.Scene) => {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = mode === 'globe' ? 5 + Math.random() * 2 : Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      if (mode === 'globe') {
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
      } else {
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 5;
      }

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    scene.add(particles);
    butterfliesRef.current = particles;

    return particles;
  };

  const getNodePosition = (index: number, total: number): THREE.Vector3 => {
    if (mode === 'globe') {
      const phi = Math.acos(-1 + (2 * index) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const radius = 5.2;

      return new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );
    } else {
      const gridSize = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const spacing = 2;
      const offset = (gridSize - 1) * spacing / 2;

      return new THREE.Vector3(
        col * spacing - offset,
        row * spacing - offset,
        0
      );
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x0a0a0f : 0xffffff);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x44ffdd, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    if (mode === 'globe') {
      createGlobe(scene);
    } else {
      createLattice(scene);
    }

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

      sessionNodesRef.current.forEach((node) => {
        if (node.isNew && timeRef.current - node.rippleTime < 2) {
          const pulse = 1 + Math.sin(timeRef.current * 5) * 0.2;
          node.mesh.scale.set(pulse, pulse, pulse);
        } else {
          node.isNew = false;
          const pulse = 1 + Math.sin(timeRef.current * 2) * 0.1;
          node.mesh.scale.set(pulse, pulse, pulse);
        }
      });

      if (butterfliesRef.current && syncThreshold) {
        const positions = butterfliesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = butterfliesRef.current.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          positions[i] += velocities[idx].x;
          positions[i + 1] += velocities[idx].y;
          positions[i + 2] += velocities[idx].z;

          if (mode === 'globe') {
            const dist = Math.sqrt(
              positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
            );
            if (dist < 4 || dist > 8) {
              velocities[idx].x *= -1;
              velocities[idx].y *= -1;
              velocities[idx].z *= -1;
            }
          } else {
            if (Math.abs(positions[i]) > 10) velocities[idx].x *= -1;
            if (Math.abs(positions[i + 1]) > 10) velocities[idx].y *= -1;
            if (Math.abs(positions[i + 2]) > 3) velocities[idx].z *= -1;
          }
        }

        butterfliesRef.current.geometry.attributes.position.needsUpdate = true;
        butterfliesRef.current.rotation.y += 0.001;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      sessionNodesRef.current.forEach((node) => {
        node.mesh.geometry.dispose();
        (node.mesh.material as THREE.Material).dispose();
      });
      sessionNodesRef.current.clear();
    };
  }, [mode, theme]);

  useEffect(() => {
    if (!sceneRef.current) return;

    const currentSessionIds = new Set(sessions.map(s => s.id));
    const existingSessionIds = new Set(sessionNodesRef.current.keys());

    existingSessionIds.forEach(id => {
      if (!currentSessionIds.has(id)) {
        const node = sessionNodesRef.current.get(id);
        if (node) {
          sceneRef.current?.remove(node.mesh);
          node.mesh.geometry.dispose();
          (node.mesh.material as THREE.Material).dispose();
          sessionNodesRef.current.delete(id);
        }
      }
    });

    sessions.forEach((session, index) => {
      const position = getNodePosition(index, sessions.length);
      const hue = ((session.frequency - 20) / 1980) % 1;

      if (!sessionNodesRef.current.has(session.id)) {
        const mesh = createSessionNode(sceneRef.current!, session, position);
        sessionNodesRef.current.set(session.id, {
          session,
          mesh,
          rippleTime: timeRef.current,
          isNew: true,
        });
        createRippleEffect(sceneRef.current!, position, hue);
      } else {
        const node = sessionNodesRef.current.get(session.id)!;
        node.mesh.position.copy(position);
      }
    });
  }, [sessions, mode]);

  useEffect(() => {
    if (!sceneRef.current) return;

    if (syncThreshold && !butterfliesRef.current) {
      createButterflySwarm(sceneRef.current);
    } else if (!syncThreshold && butterfliesRef.current) {
      sceneRef.current.remove(butterfliesRef.current);
      butterfliesRef.current.geometry.dispose();
      (butterfliesRef.current.material as THREE.Material).dispose();
      butterfliesRef.current = null;
    }
  }, [syncThreshold, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};
