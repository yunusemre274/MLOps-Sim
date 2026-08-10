/**
 * TutorialHub.jsx — Eğitim merkezi bileşeni
 *
 * Tutorial dosyalarını listeler ve içeriklerini gösterir.
 * ComputerScene'de bir sekme olarak veya bağımsız kullanılabilir.
 */

import { useState } from 'react';
import linuxBasics from '../../data/tutorials/linux_basics.md?raw';
import dockerfileBasics from '../../data/tutorials/dockerfile_basics.md?raw';
import multistageBuild from '../../data/tutorials/multistage_build.md?raw';
import dockerCompose from '../../data/tutorials/docker_compose.md?raw';
import kubernetesBs from '../../data/tutorials/kubernetes_basics.md?raw';
import githubActions from '../../data/tutorials/github_actions.md?raw';
import cicdConcepts from '../../data/tutorials/cicd_concepts.md?raw';
import securityBP from '../../data/tutorials/security_best_practices.md?raw';
import './TutorialHub.css';

const TUTORIALS = [
  { id: 'linux',      title: '🐧 Linux Temel Komutlar',  content: linuxBasics },
  { id: 'dockerfile', title: '🐳 Dockerfile Temelleri',   content: dockerfileBasics },
  { id: 'multistage', title: '🏗️ Multi-Stage Build',      content: multistageBuild },
  { id: 'compose',    title: '🐙 Docker Compose',         content: dockerCompose },
  { id: 'k8s',        title: '☸️ Kubernetes Temelleri',    content: kubernetesBs },
  { id: 'actions',    title: '⚙️ GitHub Actions CI/CD',   content: githubActions },
  { id: 'cicd',       title: '🔄 CI/CD Kavramları',       content: cicdConcepts },
  { id: 'security',   title: '🔒 Güvenlik Pratikleri',    content: securityBP },
];

export default function TutorialHub() {
  const [activeId, setActiveId] = useState(TUTORIALS[0].id);
  const activeTutorial = TUTORIALS.find((t) => t.id === activeId);

  return (
    <div className="tutorial-hub">
      <div className="tutorial-hub__sidebar">
        <h3>📚 Eğitimler</h3>
        {TUTORIALS.map((t) => (
          <button
            key={t.id}
            className={`tutorial-hub__item ${activeId === t.id ? 'tutorial-hub__item--active' : ''}`}
            onClick={() => setActiveId(t.id)}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="tutorial-hub__content">
        <pre className="tutorial-hub__text">
          {activeTutorial?.content || 'Bir eğitim seçin.'}
        </pre>
      </div>
    </div>
  );
}
