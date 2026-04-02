import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal as TerminalIcon, 
  FileCode, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Send, 
  Cpu, 
  Code2, 
  History,
  Settings,
  Search,
  X,
  Maximize2,
  Plus,
  Save,
  Play,
  Layers,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  Box,
  Download,
  FileArchive,
  FileType,
  FileJson,
  FileText,
  Github,
  Cloud,
  Bot,
  Monitor,
  Smartphone,
  Server,
  BoxSelect,
  User,
  LogOut,
  ExternalLink,
  Eye,
  EyeOff,
  Wrench,
  Rocket,
  ShieldAlert
} from 'lucide-react';
import Markdown from 'react-markdown';
import { FileNode, ChatMessage, INITIAL_FILES, ProjectType, PROJECT_TEMPLATES, CustomProject } from './types';
import { generateResponse } from './services/geminiService';
import JSZip from 'jszip';
import { VMManager } from './components/VMVisualizer';

// --- Types ---
interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

// --- Components ---

// --- Components ---

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  setUserProfile,
  currentProject
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userProfile: UserProfile;
  setUserProfile: (p: UserProfile) => void;
  currentProject: string;
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'project' | 'advanced' | 'vms'>('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl h-[500px] flex overflow-hidden shadow-2xl"
      >
        {/* Sidebar */}
        <div className="w-48 border-r border-white/5 bg-black/20 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'profile' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'project' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Box className="w-4 h-4" />
            <span>Project</span>
          </button>
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'advanced' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Zap className="w-4 h-4" />
            <span>Advanced</span>
          </button>
          <div className="mt-auto">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Settings</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={userProfile.avatar} className="w-16 h-16 rounded-full border-2 border-blue-500/20" />
                  <button className="text-xs text-blue-400 hover:underline">Change Avatar</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'project' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                    <Github className="w-6 h-6 mb-2 text-gray-400 group-hover:text-white" />
                    <span className="text-xs font-medium">Push to GitHub</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                    <Cloud className="w-6 h-6 mb-2 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-xs font-medium">Publish Project</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                    <Save className="w-6 h-6 mb-2 text-gray-400 group-hover:text-green-400" />
                    <span className="text-xs font-medium">Save Template</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-lg hover:border-blue-500/50 transition-all group">
                    <Plus className="w-6 h-6 mb-2 text-gray-400 group-hover:text-purple-400" />
                    <span className="text-xs font-medium">Import Project</span>
                  </button>
                </div>
                <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Dependencies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['react', 'lucide-react', 'motion', 'jszip'].map(dep => (
                      <span key={dep} className="px-2 py-1 bg-black/40 rounded text-[10px] text-gray-400 border border-white/5">{dep}</span>
                    ))}
                    <button className="px-2 py-1 bg-blue-600/20 rounded text-[10px] text-blue-400 border border-blue-500/20 hover:bg-blue-600/30">+ Add</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div className="p-4 bg-pink-600/5 border border-pink-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Agent Swarms</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">Deploy multiple AI agents to work concurrently on complex architectural tasks.</p>
                  <button className="w-full py-2 bg-pink-600/20 text-pink-400 text-xs rounded border border-pink-500/20 hover:bg-pink-600/30 transition-all">Launch Swarm</button>
                </div>
                <div className="p-4 bg-yellow-600/5 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BoxSelect className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Virtual Sandbox</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">Isolated environment for testing untrusted code or experimental dependencies.</p>
                  <button className="w-full py-2 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-500/20 hover:bg-yellow-600/30 transition-all">Create Sandbox</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectIcon = ({ type, customIcon }: { type: ProjectType, customIcon?: string }) => {
  if (customIcon) {
    const Icon = {
      'Zap': Zap,
      'Globe': Globe,
      'Sparkles': Sparkles,
      'ShieldCheck': ShieldCheck,
      'Layers': Layers,
      'Cpu': Cpu,
      'Terminal': TerminalIcon,
      'Box': Box,
      'Code2': Code2,
      'Rocket': Rocket,
      'Bot': Bot,
      'Cloud': Cloud,
      'Server': Server,
      'Smartphone': Smartphone,
      'Monitor': Monitor
    }[customIcon] || Box;
    return <Icon className="w-4 h-4 text-blue-400" />;
  }

  switch (type) {
    case 'flare': return <Zap className="w-4 h-4 text-orange-400" />;
    case 'xrp': return <Globe className="w-4 h-4 text-blue-400" />;
    case 'solana': return <Sparkles className="w-4 h-4 text-purple-400" />;
    case 'openzeppelin': return <ShieldCheck className="w-4 h-4 text-green-400" />;
    case 'remix': return <Layers className="w-4 h-4 text-cyan-400" />;
    case 'ai-dev': return <Cpu className="w-4 h-4 text-pink-400" />;
    case 'clare': return <TerminalIcon className="w-4 h-4 text-gray-400" />;
    default: return <Box className="w-4 h-4 text-gray-400" />;
  }
};

const FileIcon = ({ name }: { name: string }) => {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return <Code2 className="w-4 h-4 text-blue-400" />;
  if (name.endsWith('.json')) return <Settings className="w-4 h-4 text-yellow-400" />;
  if (name.endsWith('.md')) return <FileCode className="w-4 h-4 text-green-400" />;
  if (name.endsWith('.sol')) return <ShieldCheck className="w-4 h-4 text-orange-400" />;
  if (name.endsWith('.rs')) return <Box className="w-4 h-4 text-red-400" />;
  return <FileCode className="w-4 h-4 text-gray-400" />;
};

const FileTree = ({ 
  nodes, 
  onFileSelect, 
  selectedFile,
  depth = 0 
}: { 
  nodes: FileNode[], 
  onFileSelect: (file: FileNode) => void,
  selectedFile: FileNode | null,
  depth?: number 
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'src': true, 'contracts': true, 'app': true, 'program': true, 'agents': true });

  const toggle = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="select-none">
      {nodes.map((node) => (
        <div key={node.name}>
          <div 
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-white/5 transition-colors text-sm ${selectedFile?.name === node.name ? 'bg-white/10 text-white' : 'text-gray-400'}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => node.type === 'directory' ? toggle(node.name) : onFileSelect(node)}
          >
            {node.type === 'directory' ? (
              <>
                {expanded[node.name] ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                <Folder className="w-4 h-4 mr-2 text-blue-500 fill-blue-500/20" />
              </>
            ) : (
              <>
                <span className="w-3 mr-1" />
                <FileIcon name={node.name} />
                <span className="ml-2 truncate">{node.name}</span>
              </>
            )}
            {node.type === 'directory' && <span className="ml-1 truncate">{node.name}</span>}
          </div>
          {node.type === 'directory' && expanded[node.name] && node.children && (
            <FileTree 
              nodes={node.children} 
              onFileSelect={onFileSelect} 
              selectedFile={selectedFile}
              depth={depth + 1} 
            />
          )}
        </div>
      ))}
    </div>
  );
};

const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onCreate: (project: CustomProject) => void 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Box');
  const [dependencies, setDependencies] = useState('');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [templateFiles, setTemplateFiles] = useState<{ name: string, content: string }[]>([
    { name: 'App.tsx', content: 'export default function App() { return <div>Custom Project</div>; }' },
    { name: 'package.json', content: '{\n  "name": "custom-project",\n  "version": "1.0.0"\n}' }
  ]);

  const handleCreate = () => {
    const project: CustomProject = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      label: name,
      description,
      icon,
      dependencies: dependencies.split(',').map(d => d.trim()).filter(Boolean),
      buildCommand,
      templates: templateFiles.map(f => ({ name: f.name, type: 'file', content: f.content }))
    };
    onCreate(project);
    setName('');
    setDescription('');
    setDependencies('');
    setBuildCommand('npm run build');
    setTemplateFiles([
      { name: 'App.tsx', content: 'export default function App() { return <div>Custom Project</div>; }' },
      { name: 'package.json', content: '{\n  "name": "custom-project",\n  "version": "1.0.0"\n}' }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-white">Create Custom Project</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. My Custom Framework"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this project for?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Icon</label>
                <select 
                  value={icon} 
                  onChange={e => setIcon(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                >
                  {['Box', 'Zap', 'Globe', 'Sparkles', 'ShieldCheck', 'Layers', 'Cpu', 'Terminal', 'Code2', 'Rocket', 'Bot', 'Cloud', 'Server', 'Smartphone', 'Monitor'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dependencies (comma separated)</label>
                <input 
                  value={dependencies} 
                  onChange={e => setDependencies(e.target.value)}
                  placeholder="e.g. lodash, axios, tailwindcss"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Build Command</label>
                <input 
                  value={buildCommand} 
                  onChange={e => setBuildCommand(e.target.value)}
                  placeholder="e.g. npm run build"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Template Files</label>
              <button 
                onClick={() => setTemplateFiles([...templateFiles, { name: 'new-file.ts', content: '' }])}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add File
              </button>
            </div>
            <div className="space-y-3">
              {templateFiles.map((file, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      value={file.name}
                      onChange={e => {
                        const newFiles = [...templateFiles];
                        newFiles[idx].name = e.target.value;
                        setTemplateFiles(newFiles);
                      }}
                      className="flex-1 bg-transparent border-b border-white/10 text-xs py-1 focus:outline-none focus:border-blue-500/50"
                      placeholder="filename.ts"
                    />
                    <button 
                      onClick={() => setTemplateFiles(templateFiles.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <textarea 
                    value={file.content}
                    onChange={e => {
                      const newFiles = [...templateFiles];
                      newFiles[idx].content = e.target.value;
                      setTemplateFiles(newFiles);
                    }}
                    className="w-full bg-black/20 border border-white/5 rounded p-2 text-[10px] font-mono h-24 focus:outline-none"
                    placeholder="File content..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!name}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20"
          >
            Create Project
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [currentProject, setCurrentProject] = useState<ProjectType>('clare');
  const [files, setFiles] = useState<FileNode[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Clare. I can help you understand, write, and debug your code. What are we working on today?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'terminal' | 'output'>('terminal');
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isVMManagerOpen, setIsVMManagerOpen] = useState(false);
  const [isShipZeroOpen, setIsShipZeroOpen] = useState(false);
  const [isVisualEditor, setIsVisualEditor] = useState(false);
  const [customProjects, setCustomProjects] = useState<CustomProject[]>(() => {
    const saved = localStorage.getItem('custom_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Developer',
    email: 'dev@clare.ai',
    avatar: 'https://picsum.photos/seed/clare/100/100'
  });
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close download menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected file
  useEffect(() => {
    const firstFile = findFirstFile(files);
    setSelectedFile(firstFile);
  }, [files]);

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, output]);

  const handleProjectSwitch = (type: ProjectType) => {
    setCurrentProject(type);
    
    // Check built-in templates
    if (PROJECT_TEMPLATES[type]) {
      setFiles(PROJECT_TEMPLATES[type]);
    } else {
      // Check custom projects
      const custom = customProjects.find(p => p.id === type);
      if (custom) {
        setFiles(custom.templates);
      }
    }

    setOutput('');
    setActiveTab('terminal');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `Switched to **${type.toUpperCase()}** project template.`,
      timestamp: Date.now()
    }]);
  };

  const handleCreateCustomProject = (project: CustomProject) => {
    setCustomProjects(prev => [...prev, project]);
    setIsCreateProjectModalOpen(false);
    handleProjectSwitch(project.id);
  };

  const handleRun = async () => {
    if (!selectedFile || isRunning) return;
    
    setIsRunning(true);
    setActiveTab('output');
    setOutput(`$ clare run ${selectedFile.name}\n`);
    
    const simulateOutput = async (lines: string[]) => {
      for (const line of lines) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
        setOutput(prev => prev + line + '\n');
      }
    };

    try {
      switch (currentProject) {
        case 'flare':
          await simulateOutput([
            'Compiling FlareSmartContract.sol...',
            'Compiled successfully (0.8.0)',
            'Deploying to Flare Coston Testnet...',
            'Transaction Hash: 0x7a2b...c9e4',
            'Contract Address: 0x1234...5678',
            'Deployment complete!'
          ]);
          break;
        case 'xrp':
          await simulateOutput([
            'Connecting to XRPL Testnet...',
            'Connected to wss://s.altnet.rippletest.net:51233',
            'Generating test wallet...',
            'Wallet Address: rHb9CJA...7z',
            'Balance: 1000 XRP',
            'Ready for transactions.'
          ]);
          break;
        case 'solana':
          await simulateOutput([
            'Building Solana program...',
            'Finished release [optimized] target(s) in 2.45s',
            'Deploying to devnet...',
            'Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
            'Deployment successful.'
          ]);
          break;
        case 'openzeppelin':
          await simulateOutput([
            'Compiling MyToken.sol...',
            'Importing @openzeppelin/contracts/token/ERC20/ERC20.sol',
            'Compiled successfully.',
            'Ready for deployment.'
          ]);
          break;
        case 'remix':
          await simulateOutput([
            'Starting Remix dev server...',
            'Remix App ready at http://localhost:3000',
            'Watching for changes...',
            '[GET] / 200 OK (45ms)'
          ]);
          break;
        case 'ai-dev':
          await simulateOutput([
            'Initializing CodingAgent...',
            'Loading model: gemini-pro',
            'Agent online.',
            'Task: "Write a hello world script"',
            'Thinking...',
            'Result: console.log("Hello World");'
          ]);
          break;
        case 'clare':
          await simulateOutput([
            'Starting Clare Web development environment...',
            'Vite v6.2.0 ready in 124ms',
            'Local: http://localhost:3000/',
            'Network: use --host to expose',
            'HMR enabled.'
          ]);
          break;
        default:
          await simulateOutput(['Running generic script...', 'Execution finished.']);
      }
    } catch (error) {
      setOutput(prev => prev + `Error: ${error}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    
    const addFilesToZip = (nodes: FileNode[], path = '') => {
      nodes.forEach(node => {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        if (node.type === 'file') {
          zip.file(fullPath, node.content || '');
        } else if (node.children) {
          addFilesToZip(node.children, fullPath);
        }
      });
    };

    addFilesToZip(files);
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject}-project.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };

  const handleDownloadHtml = () => {
    if (!selectedFile) return;
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${selectedFile.name}</title>
    <style>
        body { font-family: monospace; background: #0d0d0d; color: #ccc; padding: 20px; white-space: pre-wrap; }
    </style>
</head>
<body>
${selectedFile.content}
</body>
</html>`;
    downloadFile(htmlContent, `${selectedFile.name}.html`, 'text/html');
    setIsDownloadMenuOpen(false);
  };

  const handleDownloadOriginal = () => {
    if (!selectedFile) return;
    downloadFile(selectedFile.content || '', selectedFile.name, 'text/plain');
    setIsDownloadMenuOpen(false);
  };

  const handleDownloadAs = (ext: string) => {
    if (!selectedFile) return;
    const baseName = selectedFile.name.split('.')[0];
    downloadFile(selectedFile.content || '', `${baseName}.${ext}`, 'text/plain');
    setIsDownloadMenuOpen(false);
  };

  const handleCreatePage = () => {
    const pageName = prompt('Enter page name (e.g., about.tsx):');
    if (!pageName) return;
    
    const newFile: FileNode = {
      name: pageName,
      type: 'file',
      content: `import React from 'react';\n\nexport default function ${pageName.split('.')[0]}() {\n  return <div>New Page: ${pageName}</div>;\n}`
    };

    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `Created new page: **${pageName}**`,
      timestamp: Date.now()
    }]);
  };

  useEffect(() => {
    localStorage.setItem('custom_projects', JSON.stringify(customProjects));
  }, [customProjects]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const command = input.trim();
    setHistory(prev => [command, ...prev.filter(h => h !== command)].slice(0, 50));
    setHistoryIndex(-1);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare context
    const context = files.map(f => {
      if (f.type === 'file') return `File: ${f.name}\nContent:\n${f.content}`;
      return `Directory: ${f.name} (${f.children?.length} items)`;
    }).join('\n\n');

    const responseText = await generateResponse(input, context);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const commands = ['clare', 'run', 'save', 'help', 'ls', 'cd', 'git', 'npm', 'publish', 'deploy'];
      const currentInput = input.toLowerCase();
      const match = commands.find(c => c.startsWith(currentInput));
      if (match) {
        setInput(match);
      }
    }
  };

  const renderHighlightedInput = () => {
    const parts = input.split(' ');
    return (
      <div className="absolute inset-0 flex items-center px-8 pointer-events-none text-sm font-mono whitespace-pre">
        {parts.map((part, i) => {
          let color = 'text-gray-300';
          if (i === 0) {
            const cmd = part.toLowerCase();
            if (['clare', 'run', 'save', 'help', 'ls', 'cd', 'git', 'npm'].includes(cmd)) {
              color = 'text-blue-400 font-bold';
            }
          } else if (part.startsWith('-')) {
            color = 'text-pink-400';
          } else if (part.includes('/') || part.includes('.')) {
            color = 'text-green-400';
          }
          return (
            <span key={i} className={color}>
              {part}{i < parts.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    );
  };

  const projectTypes: { id: ProjectType; label: string; customIcon?: string }[] = [
    { id: 'flare', label: 'Flare Network' },
    { id: 'xrp', label: 'XRP Ledger' },
    { id: 'solana', label: 'Solana' },
    { id: 'openzeppelin', label: 'OpenZeppelin' },
    { id: 'remix', label: 'Remix Framework' },
    { id: 'ai-dev', label: 'AI Developer' },
    { id: 'clare', label: 'Clare' },
    ...customProjects.map(p => ({ id: p.id, label: p.label, customIcon: p.icon }))
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="border-r border-white/10 bg-[#0d0d0d] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white tracking-tight">CLARE</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-white/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Project Type Selector */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 block">Project Type</span>
              <button 
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-blue-400 transition-colors"
                title="Create Custom Project"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleProjectSwitch(type.id)}
                  className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs transition-colors ${
                    currentProject === type.id 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <ProjectIcon type={type.id} customIcon={type.customIcon} />
                  <span className="truncate">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">Explorer</span>
            <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
          </div>
          <FileTree 
            nodes={files} 
            onFileSelect={setSelectedFile} 
            selectedFile={selectedFile}
          />

          <div className="px-4 mt-6 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">Virtualization</span>
            <Monitor className="w-3 h-3 text-gray-500" />
          </div>
          <div className="px-4 space-y-1 pb-4">
            <button 
              onClick={() => setIsVMManagerOpen(true)}
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-blue-400 hover:bg-blue-500/5 transition-colors border border-transparent hover:border-blue-500/20 group"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="truncate">VM Cluster Manager</span>
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          <div className="px-4 mt-6 mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">Tools</span>
            <Wrench className="w-3 h-3 text-gray-500" />
          </div>
          <div className="px-4 space-y-1 pb-4">
            <a 
              href="https://github.com/AmirSoleimani/openberth.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-blue-400 hover:bg-blue-500/5 transition-colors border border-transparent hover:border-blue-500/20"
            >
              <Box className="w-3.5 h-3.5" />
              <span className="truncate">OpenBerth</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://github.com/cordwainersmith/Claudoscope.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-purple-400 hover:bg-purple-500/5 transition-colors border border-transparent hover:border-purple-500/20"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate">Claudoscope</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://github.com/whatnickcodes/clappie.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-green-400 hover:bg-green-500/5 transition-colors border border-transparent hover:border-green-500/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="truncate">Clappie</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://github.com/mboss37/claude-launchpad.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-orange-400 hover:bg-orange-500/5 transition-colors border border-transparent hover:border-orange-500/20"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span className="truncate">Claude Launchpad</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://ccleaks.com/explore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors border border-transparent hover:border-red-500/20"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="truncate">CC Leaks</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://github.com/instructkr/claw-code.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors border border-transparent hover:border-cyan-500/20"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="truncate">Claw Code</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
            <a 
              href="https://github.com/virtualgenius/codecohesion.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/5 transition-colors border border-transparent hover:border-yellow-500/20"
            >
              <BoxSelect className="w-3.5 h-3.5" />
              <span className="truncate">CodeCohesion</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button 
            onClick={handleCreatePage}
            className="w-full flex items-center gap-3 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-4 p-2 bg-blue-500/5 border border-blue-500/10 rounded"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Page</span>
          </button>
          <div className="flex items-center gap-3 text-xs text-gray-500 hover:text-gray-300 cursor-pointer mb-3">
            <History className="w-4 h-4" />
            <span>Recent Activity</span>
          </div>
          <div 
            onClick={() => setIsShipZeroOpen(true)}
            className="flex items-center gap-3 text-xs text-gray-500 hover:text-gray-300 cursor-pointer mb-3"
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>ShipZero</span>
          </div>
          <div 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-[#1a1a1a] border border-white/10 rounded-md hover:bg-[#252525] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="h-10 border-b border-white/10 bg-[#111] flex items-center px-4 justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedFile && <FileIcon name={selectedFile.name} />}
              <span className="text-sm font-medium text-gray-200 truncate">{selectedFile?.name || 'No file selected'}</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <button 
                onClick={() => setIsVisualEditor(!isVisualEditor)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${isVisualEditor ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                title={isVisualEditor ? "Switch to Code View" : "Switch to Visual Editor"}
              >
                {isVisualEditor ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{isVisualEditor ? 'Code' : 'Visual'}</span>
              </button>
              
              <div className="relative" ref={downloadMenuRef}>
                <button 
                  onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <AnimatePresence>
                  {isDownloadMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Current File</div>
                        <button onClick={handleDownloadOriginal} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded transition-colors">
                          <Download className="w-3.5 h-3.5" />
                          <span>Original Format</span>
                        </button>
                        <button onClick={handleDownloadHtml} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded transition-colors">
                          <FileType className="w-3.5 h-3.5" />
                          <span>As HTML</span>
                        </button>
                        <button onClick={() => handleDownloadAs('js')} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded transition-colors">
                          <FileCode className="w-3.5 h-3.5" />
                          <span>As JavaScript</span>
                        </button>
                        <button onClick={() => handleDownloadAs('ts')} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded transition-colors">
                          <FileCode className="w-3.5 h-3.5 text-blue-400" />
                          <span>As TypeScript</span>
                        </button>
                        <button onClick={() => handleDownloadAs('txt')} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                          <span>As Text</span>
                        </button>
                        
                        <div className="h-px bg-white/5 my-1" />
                        <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Project</div>
                        <button onClick={handleDownloadZip} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
                          <FileArchive className="w-3.5 h-3.5" />
                          <span>Download as ZIP</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={handleRun}
                disabled={!selectedFile || isRunning}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30"
              >
                <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse' : ''}`} />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#0d0d0d] overflow-auto relative">
            {isVisualEditor ? (
              <div className="h-full w-full bg-[#111] p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center text-center">
                  <BoxSelect className="w-16 h-16 text-blue-500 mb-6 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">Visual Editor</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                    Drag and drop components to build your interface visually. Changes are synced with your code in real-time.
                  </p>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                    {['Layout', 'Buttons', 'Forms', 'Charts', 'Media', 'Advanced'].map(cat => (
                      <div key={cat} className="p-4 bg-black/40 border border-white/5 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-600">
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 font-mono text-sm leading-relaxed">
                {selectedFile?.content ? (
                  <pre className="text-gray-400">
                    <code>{selectedFile.content}</code>
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <Code2 className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a file from the explorer to view its content</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Terminal / Chat Area */}
        <div className="h-[40%] border-t border-white/10 bg-[#080808] flex flex-col">
          <div className="h-8 border-b border-white/5 bg-[#111] flex items-center px-4 gap-4">
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                activeTab === 'terminal' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <TerminalIcon className="w-3 h-3" />
              <span>Terminal</span>
            </button>
            <button 
              onClick={() => setActiveTab('output')}
              className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                activeTab === 'output' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>Output</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4">
            {activeTab === 'terminal' ? (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} ${msg.role === 'system' ? 'items-center' : ''}`}
                    >
                      {msg.role === 'system' ? (
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                          {msg.content}
                        </div>
                      ) : (
                        <div className={`max-w-[85%] p-3 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100' 
                            : 'bg-white/5 border border-white/10 text-gray-300'
                        }`}>
                          <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-tighter">
                            {msg.role === 'assistant' ? <Cpu className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center">●</span>}
                            <span>{msg.role === 'assistant' ? 'Clare' : 'User'}</span>
                            <span>•</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                    <Cpu className="w-4 h-4" />
                    <span className="text-xs">Clare is thinking...</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </>
            ) : (
              <div className="whitespace-pre-wrap text-gray-400">
                {output || 'No output yet. Click "Run" to execute the current file.'}
                {isRunning && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                )}
                <div ref={outputEndRef} />
              </div>
            )}
          </div>

          <div className="p-4 bg-[#0d0d0d] border-t border-white/5">
            <div className="relative flex items-center group">
              <span className="absolute left-3 text-blue-500 font-bold z-10">$</span>
              
              {/* Highlight Overlay */}
              {renderHighlightedInput()}

              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Clare about your project..."
                className="w-full bg-black/40 border border-white/10 rounded-md py-2 pl-8 pr-12 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-mono text-transparent caret-blue-500 relative z-0"
              />
              
              <div className="absolute right-12 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] text-gray-600 bg-white/5 px-1 rounded border border-white/10">TAB to complete</span>
                <span className="text-[10px] text-gray-600 bg-white/5 px-1 rounded border border-white/10">↑↓ for history</span>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-1.5 text-gray-500 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors z-10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        currentProject={currentProject}
      />

      <ShipZeroModal 
        isOpen={isShipZeroOpen} 
        onClose={() => setIsShipZeroOpen(false)} 
      />

      <CreateProjectModal 
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreate={handleCreateCustomProject}
      />

      <AnimatePresence>
        {isVMManagerOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVMManagerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#111] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Monitor className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white">Advanced VM Management</h2>
                    <p className="text-[10px] text-gray-500">High-performance virtual instance orchestration</p>
                  </div>
                </div>
                <button onClick={() => setIsVMManagerOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <VMManager />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ShipZeroModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const handleInstall = () => {
    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      setIsInstalled(true);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">ShipZero Integration</h2>
                  <p className="text-xs text-gray-500">Accelerate your deployment workflow with Zero.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ship projects in seconds</h3>
                <p className="text-gray-400 max-w-md text-sm">
                  ShipZero is a high-performance deployment tool designed for modern web applications. 
                  Connect your repository and deploy to any cloud provider instantly.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-lg p-4 mb-8 font-mono text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Installation Command</span>
                  <button className="text-blue-400 hover:text-blue-300">Copy</button>
                </div>
                <code className="text-yellow-500/80">
                  curl -fsSL https://shipzero.sh/install.sh | sudo bash
                </code>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleInstall}
                  disabled={isInstalling || isInstalled}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isInstalled 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                      : 'bg-yellow-500 text-black hover:bg-yellow-400'
                  }`}
                >
                  {isInstalling ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <span>Installing...</span>
                    </>
                  ) : isInstalled ? (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>ShipZero Ready</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Install ShipZero</span>
                    </>
                  )}
                </button>
                <a 
                  href="https://github.com/shipzero/zero" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-gray-600">
              <span>Version 1.2.4-stable</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>System Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
