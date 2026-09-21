import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Electron Configuration Smoke Test', () => {
  it('verifies main and preload source files exist and have required exports', () => {
    const mainPath = path.resolve(__dirname, '../src/main/index.ts');
    const preloadPath = path.resolve(__dirname, '../src/preload/index.ts');

    expect(fs.existsSync(mainPath)).toBe(true);
    expect(fs.existsSync(preloadPath)).toBe(true);

    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    const preloadContent = fs.readFileSync(preloadPath, 'utf-8');

    expect(mainContent).toContain('BrowserWindow');
    expect(preloadContent).toContain('contextBridge');
  });
});
