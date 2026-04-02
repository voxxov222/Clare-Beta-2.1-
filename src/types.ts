/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface CustomProject {
  id: string;
  label: string;
  description: string;
  icon: string;
  templates: FileNode[];
  dependencies: string[];
  buildCommand: string;
}

export type ProjectType = string;

export const PROJECT_TEMPLATES: Record<string, FileNode[]> = {
  flare: [
    {
      name: 'contracts',
      type: 'directory',
      children: [
        { name: 'FlareSmartContract.sol', type: 'file', content: '// Flare Network Smart Contract\npragma solidity ^0.8.0;\n\ncontract FlareApp {\n    // Implementation\n}' }
      ]
    },
    { name: 'flare-config.json', type: 'file', content: '{\n  "network": "flare-mainnet",\n  "version": "1.0.0"\n}' }
  ],
  xrp: [
    {
      name: 'xrpl',
      type: 'directory',
      children: [
        { name: 'wallet.ts', type: 'file', content: 'import { Client, Wallet } from "xrpl";\n\nconst client = new Client("wss://s.altnet.rippletest.net:51233");' }
      ]
    },
    { name: 'xrp-ledger.config.js', type: 'file', content: 'module.exports = {\n  network: "testnet"\n};' }
  ],
  solana: [
    {
      name: 'program',
      type: 'directory',
      children: [
        { name: 'lib.rs', type: 'file', content: 'use anchor_lang::prelude::*;\n\ndeclare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");' }
      ]
    },
    { name: 'Anchor.toml', type: 'file', content: '[programs.localnet]\nmy_program = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"' }
  ],
  openzeppelin: [
    {
      name: 'contracts',
      type: 'directory',
      children: [
        { name: 'MyToken.sol', type: 'file', content: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n\ncontract MyToken is ERC20 {\n    constructor() ERC20("MyToken", "MTK") {}\n}' }
      ]
    }
  ],
  remix: [
    {
      name: 'app',
      type: 'directory',
      children: [
        { name: 'root.tsx', type: 'file', content: 'import { Outlet } from "@remix-run/react";\n\nexport default function App() {\n  return <Outlet />;\n}' },
        { name: 'routes', type: 'directory', children: [{ name: '_index.tsx', type: 'file', content: 'export default function Index() { return <h1>Remix App</h1>; }' }] }
      ]
    }
  ],
  'ai-dev': [
    {
      name: 'agents',
      type: 'directory',
      children: [
        { name: 'coder.ts', type: 'file', content: 'export class CodingAgent {\n  async solve(task: string) {\n    // AI Logic\n  }\n}' }
      ]
    },
    { name: 'model-config.json', type: 'file', content: '{\n  "model": "gemini-pro",\n  "temperature": 0.2\n}' }
  ],
  'clare': [
    {
      name: 'src',
      type: 'directory',
      children: [
        {
          name: 'App.tsx',
          type: 'file',
          content: `import React from 'react';\n\nexport default function App() {\n  return <div>Hello Clare!</div>;\n}`,
        },
        {
          name: 'main.tsx',
          type: 'file',
          content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);`,
        },
      ],
    },
    {
      name: 'package.json',
      type: 'file',
      content: `{\n  "name": "clare-web",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}`,
    },
    {
      name: 'README.md',
      type: 'file',
      content: `# Clare Web\n\nAn agentic coding interface.`,
    },
  ]
};

export const INITIAL_FILES: FileNode[] = PROJECT_TEMPLATES['clare'];
