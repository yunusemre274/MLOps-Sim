import { describe, it, expect, beforeEach } from 'vitest';
import {
  simulateDockerBuild,
  dockerRun,
  dockerPs,
  analyzeFrameworkAndEntrypoint,
  resetContainers,
} from '../src/engine/DockerSimulator';
import VirtualFileSystem from '../src/engine/VirtualFileSystem';
import { verifyMission } from '../src/engine/MissionEngine';
import { executeCommand } from '../src/engine/CommandRouter';

describe('Round 10: Task Group 1 — Content-Aware Runtime & Framework Analysis', () => {
  let vfs;

  beforeEach(() => {
    resetContainers();
    vfs = new VirtualFileSystem();
  });

  it('correctly detects FastAPI framework and missing self-boot block', () => {
    const fastApiCode = `
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
`;
    const analysis = analyzeFrameworkAndEntrypoint(fastApiCode);
    expect(analysis.framework).toBe('fastapi');
    expect(analysis.isSelfBooting).toBe(false);
  });

  it('correctly detects FastAPI framework WITH uvicorn.run self-boot block', () => {
    const fastApiWithMain = `
from fastapi import FastAPI
import uvicorn

app = FastAPI()

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8080)
`;
    const analysis = analyzeFrameworkAndEntrypoint(fastApiWithMain);
    expect(analysis.framework).toBe('fastapi');
    expect(analysis.isSelfBooting).toBe(true);
  });

  it('marks container isListening=false when running FastAPI via python without self-boot', () => {
    vfs.writeFile('/app.py', `
from fastapi import FastAPI
app = FastAPI()
`);
    vfs.writeFile('/requirements.txt', 'fastapi\nuvicorn\n');
    vfs.writeFile('/Dockerfile', `
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
`);

    const buildRes = simulateDockerBuild(vfs, '/Dockerfile', { tag: 'fastapi-app:latest' });
    expect(buildRes.success).toBe(true);

    const runRes = dockerRun('fastapi-app:latest', { port: 8080, vfs });
    expect(runRes.success).toBe(true);
    expect(runRes.isListening).toBe(false);

    const ps = dockerPs();
    const container = ps.find((c) => c.port === 8080);
    expect(container).toBeDefined();
    expect(container.isListening).toBe(false);
  });

  it('marks container isListening=true when running FastAPI via uvicorn CLI', () => {
    vfs.writeFile('/app.py', `
from fastapi import FastAPI
app = FastAPI()
`);
    vfs.writeFile('/requirements.txt', 'fastapi\nuvicorn\n');
    vfs.writeFile('/Dockerfile', `
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
`);

    simulateDockerBuild(vfs, '/Dockerfile', { tag: 'fastapi-uvicorn:latest' });
    const runRes = dockerRun('fastapi-uvicorn:latest', { port: 8080, vfs });
    expect(runRes.success).toBe(true);
    expect(runRes.isListening).toBe(true);
  });

  it('curl returns connection refused when container isListening is false', () => {
    vfs.writeFile('/app.py', 'from fastapi import FastAPI\napp = FastAPI()');
    vfs.writeFile('/Dockerfile', 'FROM python:3.11\nCOPY app.py .\nCMD ["python", "app.py"]');
    simulateDockerBuild(vfs, '/Dockerfile', { tag: 'dummy:latest' });
    dockerRun('dummy:latest', { port: 8080, vfs });

    const curlOutput = executeCommand('curl http://localhost:8080', vfs);
    expect(curlOutput[0]).toContain('Connection refused');
  });

  it('verifyMission fails when container is running but not listening', () => {
    vfs.writeFile('/app.py', 'from fastapi import FastAPI\napp = FastAPI()');
    vfs.writeFile('/Dockerfile', 'FROM python:3.11\nCOPY app.py .\nCMD ["python", "app.py"]');
    simulateDockerBuild(vfs, '/Dockerfile', { tag: 'dummy:latest' });
    dockerRun('dummy:latest', { port: 8080, vfs });

    const dummyMission = { id: 'ts_mission_1', requiredPort: 8080 };
    const verifyRes = verifyMission(dummyMission, vfs, dockerPs());
    expect(verifyRes.passed).toBe(false);
    expect(verifyRes.message).toContain('hiçbir web sunucusu dinlemiyor');
  });
});
