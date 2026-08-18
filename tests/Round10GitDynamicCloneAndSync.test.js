import { describe, it, expect, beforeEach } from 'vitest';
import VirtualFileSystem from '../src/engine/VirtualFileSystem';
import { executeCommand, findGitRepoRoot, getVfsGitState } from '../src/engine/CommandRouter';

describe('Round 10: Task Groups 2 & 3 — Git Dynamic Clone & VFS State Synchronization', () => {
  let vfs;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
  });

  it('clones distinct repository URLs into distinct folders without defaulting to ts_mission_1', () => {
    // Clone first mission repo
    const clone1 = executeCommand('git clone https://git.devjobs.io/mlops/ts_mission_1.git', vfs);
    expect(clone1[0]).toContain("Cloning into 'ts_mission_1'");
    expect(vfs.ls('ts_mission_1').success).toBe(true);

    // Clone second mission repo
    const clone2 = executeCommand('git clone https://git.devjobs.io/mlops/ts_mission_2.git', vfs);
    expect(clone2[0]).toContain("Cloning into 'ts_mission_2'");
    expect(vfs.ls('ts_mission_2').success).toBe(true);

    // Verify both directories exist and have their own .git directories
    expect(vfs.ls('ts_mission_1/.git').success).toBe(true);
    expect(vfs.ls('ts_mission_2/.git').success).toBe(true);
  });

  it('detects git repository root by traversing upward in VFS', () => {
    vfs.mkdir('/workspace/nested/child', true);
    vfs.cd('/workspace');
    executeCommand('git init', vfs);

    // Check from root
    expect(findGitRepoRoot(vfs, '/workspace')).toBe('/workspace');

    // Check from child directory
    expect(findGitRepoRoot(vfs, '/workspace/nested/child')).toBe('/workspace');

    // Check outside workspace
    expect(findGitRepoRoot(vfs, '/other')).toBe(null);
  });

  it('synchronizes git operations across simulated separate terminal instances via shared VFS', () => {
    vfs.mkdir('/my-project', true);
    vfs.cd('/my-project');

    // Terminal 1: Initialises git and adds a file
    executeCommand('git init', vfs);
    vfs.writeFile('/my-project/index.py', 'print("hello world")');
    executeCommand('git add index.py', vfs);

    // Terminal 2: Queries status in the same VFS
    const statusOutput = executeCommand('git status', vfs);
    expect(statusOutput[0]).toContain('On branch main');
    expect(statusOutput[1]).toContain('staged: index.py');

    // Terminal 2 commits
    const commitOutput = executeCommand('git commit -m "feat: first commit"', vfs);
    expect(commitOutput[0]).toContain('feat: first commit');

    // Terminal 1 checks log
    const logOutput = executeCommand('git log', vfs);
    expect(logOutput[0]).toContain('feat: first commit');
  });

  it('returns fatal error when running git status outside any git repository', () => {
    vfs.mkdir('/non-git-dir', true);
    vfs.cd('/non-git-dir');
    const output = executeCommand('git status', vfs);
    expect(output[0]).toContain('fatal: not a git repository');
  });
});
