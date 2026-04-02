import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Cpu, HardDrive, Play, Square, Settings2, Trash2, Plus, Terminal as TerminalIcon, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface VMInstance {
  id: string;
  name: string;
  type: 'linux' | 'windows' | 'android' | 'macos';
  ram: number; // in GB
  disk: number; // in GB
  status: 'running' | 'stopped' | 'starting';
  color: string;
  usageData: { time: number; cpu: number; mem: number }[];
}

const VMVisualizer: React.FC<{ vms: VMInstance[] }> = ({ vms }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    cubes: Map<string, THREE.Mesh>;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.05);

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Grid Floor
    const grid = new THREE.GridHelper(20, 20, 0x3b82f6, 0x1e293b);
    grid.position.y = -2;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    scene.add(spotLight);

    camera.position.z = 10;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0);

    const cubes = new Map<string, THREE.Mesh>();
    const particles = new Map<string, THREE.Points>();
    sceneRef.current = { scene, camera, renderer, cubes };

    // Particle System for "Running" state
    const createParticles = (color: string) => {
      const geometry = new THREE.BufferGeometry();
      const count = 50;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 2;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: color,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Points(geometry, material);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      cubes.forEach((cube, id) => {
        const vm = vms.find(v => v.id === id);
        if (vm?.status === 'running') {
          cube.rotation.y += 0.01;
          cube.position.y = Math.sin(time * 2) * 0.1;
          
          let p = particles.get(id);
          if (!p) {
            p = createParticles(vm.color);
            scene.add(p);
            particles.set(id, p);
          }
          p.position.copy(cube.position);
          p.rotation.y -= 0.02;
          
          const positions = p.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i+1] += Math.sin(time + i) * 0.01;
          }
          p.geometry.attributes.position.needsUpdate = true;
        } else {
          const p = particles.get(id);
          if (p) {
            scene.remove(p);
            particles.delete(id);
          }
        }

        if (vm?.status === 'starting') {
          cube.rotation.y += 0.1;
          cube.scale.setScalar(0.8 + Math.sin(time * 10) * 0.1);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, cubes } = sceneRef.current;

    // Remove old cubes
    cubes.forEach((cube, id) => {
      if (!vms.find(v => v.id === id)) {
        scene.remove(cube);
        cubes.delete(id);
      }
    });

    // Add/Update cubes
    vms.forEach((vm, index) => {
      let cube = cubes.get(vm.id);
      if (!cube) {
        const geometry = new THREE.BoxGeometry(1.5, 2, 0.5);
        const material = new THREE.MeshPhongMaterial({ 
          color: vm.color,
          transparent: true,
          opacity: 0.8,
          shininess: 100
        });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubes.set(vm.id, cube);

        // Add wireframe
        const wireframe = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
        );
        cube.add(wireframe);
      }

      // Position based on index
      const x = (index - (vms.length - 1) / 2) * 2.5;
      cube.position.x = x;
      
      // Update color/opacity based on status
      const material = cube.material as THREE.MeshPhongMaterial;
      material.color.set(vm.color);
      material.opacity = vm.status === 'running' ? 0.9 : 0.4;
    });
  }, [vms]);

  return <div ref={containerRef} className="w-full h-64 bg-black/40 rounded-xl border border-white/5 overflow-hidden" />;
};

export const VMManager: React.FC = () => {
  const [vms, setVms] = useState<VMInstance[]>([
    { id: '1', name: 'Primary Linux', type: 'linux', ram: 4, disk: 40, status: 'stopped', color: '#f97316', usageData: [] },
    { id: '2', name: 'Dev Windows', type: 'windows', ram: 8, disk: 100, status: 'stopped', color: '#3b82f6', usageData: [] },
  ]);

  const [editingVm, setEditingVm] = useState<string | null>(null);
  const [activeConsole, setActiveConsole] = useState<string | null>(null);

  // Simulate real-time usage data
  useEffect(() => {
    const interval = setInterval(() => {
      setVms(currentVms => currentVms.map(vm => {
        if (vm.status === 'running') {
          const newData = {
            time: Date.now(),
            cpu: Math.floor(Math.random() * 60) + 20,
            mem: Math.floor(Math.random() * 40) + 30
          };
          return {
            ...vm,
            usageData: [...vm.usageData.slice(-19), newData]
          };
        }
        return vm;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const addVm = () => {
    const newVm: VMInstance = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Instance ${vms.length + 1}`,
      type: 'linux',
      ram: 2,
      disk: 20,
      status: 'stopped',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      usageData: []
    };
    setVms([...vms, newVm]);
  };

  const toggleVm = (id: string) => {
    setVms(vms.map(vm => {
      if (vm.id === id) {
        if (vm.status === 'stopped') {
          return { ...vm, status: 'starting' };
        } else {
          return { ...vm, status: 'stopped', usageData: [] };
        }
      }
      return vm;
    }));

    // Simulate starting
    setTimeout(() => {
      setVms(currentVms => currentVms.map(vm => {
        if (vm.id === id && vm.status === 'starting') {
          return { ...vm, status: 'running' };
        }
        return vm;
      }));
    }, 2000);
  };

  const updateVm = (id: string, updates: Partial<VMInstance>) => {
    setVms(vms.map(vm => vm.id === id ? { ...vm, ...updates } : vm));
  };

  const deleteVm = (id: string) => {
    setVms(vms.filter(vm => vm.id !== id));
    if (editingVm === id) setEditingVm(null);
    if (activeConsole === id) setActiveConsole(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Virtual Machine Cluster
          </h3>
          <p className="text-xs text-gray-500">Manage multiple isolated environments with dynamic resource allocation and real-time telemetry.</p>
        </div>
        <button 
          onClick={addVm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 hover:bg-blue-600/30 transition-all shadow-lg shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Instance</span>
        </button>
      </div>

      <VMVisualizer vms={vms} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {vms.map((vm) => (
            <motion.div
              key={vm.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 bg-white/5 border rounded-2xl transition-all relative overflow-hidden group ${vm.status === 'running' ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'}`}
            >
              {vm.status === 'running' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-all ${vm.status === 'running' ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-500'}`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{vm.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-black tracking-widest ${vm.status === 'running' ? 'text-green-400' : vm.status === 'starting' ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}`}>
                        {vm.status}
                      </span>
                      {vm.status === 'running' && (
                        <span className="flex gap-0.5">
                          {[1, 2, 3].map(i => (
                            <motion.span 
                              key={i}
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-1 h-1 rounded-full bg-green-400"
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveConsole(activeConsole === vm.id ? null : vm.id)}
                    className={`p-2 rounded-lg transition-colors ${activeConsole === vm.id ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-gray-400'}`}
                    title="Open Console"
                  >
                    <TerminalIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setEditingVm(editingVm === vm.id ? null : vm.id)}
                    className={`p-2 rounded-lg transition-colors ${editingVm === vm.id ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400'}`}
                    title="Settings"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleVm(vm.id)}
                    className={`p-2 rounded-lg transition-all ${vm.status === 'running' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                  >
                    {vm.status === 'running' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                </div>
              </div>

              {activeConsole === vm.id ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/60 rounded-xl p-4 font-mono text-[10px] h-32 overflow-y-auto border border-white/5"
                >
                  <div className="text-green-400 mb-1">[SYSTEM] Booting kernel...</div>
                  <div className="text-gray-400 mb-1">[INFO] Initializing network stack</div>
                  <div className="text-gray-400 mb-1">[INFO] Mounting file systems</div>
                  <div className="text-blue-400 mb-1">[AUTH] User 'clare' logged in</div>
                  <div className="text-gray-200 animate-pulse">clare@vm:~$ _</div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-black">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                        <span>RAM Allocation</span>
                      </div>
                      <span className="text-gray-300">{vm.ram}GB</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(vm.ram / 32) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      />
                    </div>
                    {vm.status === 'running' && (
                      <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={vm.usageData}>
                            <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-black">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                        <span>Disk Capacity</span>
                      </div>
                      <span className="text-gray-300">{vm.disk}GB</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(vm.disk / 500) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                      />
                    </div>
                    {vm.status === 'running' && (
                      <div className="h-16 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={vm.usageData}>
                            <Line type="monotone" dataKey="mem" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {editingVm === vm.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-6 pt-6 border-t border-white/5 space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Memory</label>
                          <span className="text-[10px] text-blue-400 font-bold">{vm.ram} GB</span>
                        </div>
                        <input 
                          type="range" min="1" max="32" step="1" 
                          value={vm.ram}
                          onChange={(e) => updateVm(vm.id, { ram: parseInt(e.target.value) })}
                          className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Storage</label>
                          <span className="text-[10px] text-purple-400 font-bold">{vm.disk} GB</span>
                        </div>
                        <input 
                          type="range" min="10" max="500" step="10" 
                          value={vm.disk}
                          onChange={(e) => updateVm(vm.id, { disk: parseInt(e.target.value) })}
                          className="w-full accent-purple-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'].map(c => (
                          <button 
                            key={c}
                            onClick={() => updateVm(vm.id, { color: c })}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${vm.color === c ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            style={{ backgroundColor: c, boxShadow: vm.color === c ? `0 0 10px ${c}` : 'none' }}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={() => deleteVm(vm.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Terminate Instance</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
