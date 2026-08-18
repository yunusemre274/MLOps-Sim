/**
 * PhoneLinkedInApp.jsx — Telefonda LinkedIn Sosyal & Network Uygulaması
 *
 * Akış (Feed), NPC gönderileri, beğeni etkileşimi ve kariyer profil sekmesi.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import './PhoneLinkedInApp.css';

const INITIAL_POSTS = [
  {
    id: 'post_1',
    author: 'Ayşe Kaya',
    title: 'Senior Frontend & MLOps Enthusiast • TechStart',
    avatar: '👩‍💻',
    time: '2 saat önce',
    content: 'Bugün FastAPI ve React ile geliştirdiğimiz ML inference arayüzünü Docker container olarak başarıyla canlıya aldık! 🎉 CI/CD süreçleri hayat kurtarıyor.',
    likes: 24,
    comments: 5,
    liked: false,
    tag: '#MLOps #Docker #DevOps',
  },
  {
    id: 'post_2',
    author: 'Mehmet Demir',
    title: 'Lead DevOps Engineer • CloudPeak Solutions',
    avatar: '👨‍🔧',
    time: '4 saat önce',
    content: 'Multi-stage Dockerfile optimizasyonu ile image boyutunu 1.2 GB seviyesinden 145 MB seviyesine düşürdük. Alpine ve distroless imajları mutlaka deneyin! 🚀',
    likes: 58,
    comments: 12,
    liked: false,
    tag: '#Kubernetes #Optimization #ContainerSecurity',
  },
  {
    id: 'post_3',
    author: 'Burak Yılmaz',
    title: 'Data Scientist • DataForge Analytics',
    avatar: '👨‍🔬',
    time: 'Dün',
    content: 'Yeni modelimizin test F1 skoru %96.8 olarak gerçekleşti. Şimdi sırada Redis kuyruğu ile batch inference pipeline kurmak var. 📊',
    likes: 41,
    comments: 7,
    liked: false,
    tag: '#MachineLearning #DataScience #Pipeline',
  },
  {
    id: 'post_4',
    author: 'Selin Arslan',
    title: 'Tech Talent Partner & Recruiter',
    avatar: '👩‍💼',
    time: '2 gün önce',
    content: 'Hızla büyüyen fintech projelerimiz için Junior ve Mid-Level MLOps Mühendisleri arıyoruz! Docker, Compose ve Linux deneyimi olanlar DevJobs üzerinden başvurabilir. 💼',
    likes: 89,
    comments: 34,
    liked: false,
    tag: '#Hiring #MLOpsJobs #Career',
  },
];

export default function PhoneLinkedInApp() {
  const rank = useGameStore((s) => s.character.rank);
  const careerPoints = useGameStore((s) => s.character.careerPoints);
  const totalCompletedMissions = useGameStore((s) => s.character.totalCompletedMissions);
  const relationships = useGameStore((s) => s.relationships);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'profile' | 'network'
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      })
    );
  };

  const knownCount = Object.keys(relationships).length;

  return (
    <div className="phone-linkedin-app">
      {/* Üst Navigasyon */}
      <div className="pli-topbar">
        <div className="pli-brand">
          <span className="pli-logo">in</span>
          <span>LinkedIn Mobile</span>
        </div>
        <div className="pli-tabs">
          <button
            className={`pli-tab ${activeTab === 'feed' ? 'pli-tab--active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            📰 Akış
          </button>
          <button
            className={`pli-tab ${activeTab === 'profile' ? 'pli-tab--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profilim
          </button>
          <button
            className={`pli-tab ${activeTab === 'network' ? 'pli-tab--active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            🌐 Ağım ({knownCount})
          </button>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="pli-content">
        {activeTab === 'feed' && (
          <div className="pli-feed">
            {posts.map((post) => (
              <div key={post.id} className="pli-post-card">
                <div className="pli-post-header">
                  <span className="pli-avatar">{post.avatar}</span>
                  <div>
                    <h4>{post.author}</h4>
                    <p className="pli-author-title">{post.title}</p>
                    <span className="pli-time">{post.time}</span>
                  </div>
                </div>
                <div className="pli-post-body">
                  <p>{post.content}</p>
                  <span className="pli-tag">{post.tag}</span>
                </div>
                <div className="pli-post-actions">
                  <button
                    className={`pli-action-btn ${post.liked ? 'pli-action-btn--liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.liked ? '👍 Beğendin' : '👍 Beğen'} ({post.likes})
                  </button>
                  <button className="pli-action-btn">
                    💬 Yorum ({post.comments})
                  </button>
                  <button className="pli-action-btn">
                    ↗️ Paylaş
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pli-profile">
            <div className="pli-profile-card">
              <div className="pli-profile-banner" />
              <div className="pli-profile-avatar">👨‍💻</div>
              <h3>MLOps Engineer (Oyuncu)</h3>
              <p className="pli-profile-headline">{rank.toUpperCase()} MLOps & DevOps Specialist</p>
              <div className="pli-profile-badges">
                <span className="pli-badge">🏆 {careerPoints} Kariyer Puanı</span>
                <span className="pli-badge">✅ {totalCompletedMissions} Tamamlanan Görev</span>
                <span className="pli-badge">🌐 {knownCount + 12} Bağlantı</span>
              </div>
            </div>

            <div className="pli-skills-card">
              <h4>Yetenekler & Uzmanlıklar</h4>
              <div className="pli-skill-tags">
                <span>Docker & Multi-stage</span>
                <span>Docker Compose</span>
                <span>CI/CD Pipelines</span>
                <span>Linux VFS</span>
                <span>Python / FastAPI</span>
                <span>Kubernetes Ready</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="pli-network">
            <h4>Tanıdığınız ve Önerilen Bağlantılar</h4>
            <div className="pli-network-list">
              <div className="pli-network-item">
                <span className="pli-avatar">👩‍💻</span>
                <div>
                  <strong>Ayşe Kaya</strong>
                  <p>Frontend Developer • TechStart</p>
                </div>
                <button className="pli-connect-btn">✓ Bağlandı</button>
              </div>
              <div className="pli-network-item">
                <span className="pli-avatar">👨‍🔧</span>
                <div>
                  <strong>Mehmet Demir</strong>
                  <p>DevOps Engineer • CloudPeak</p>
                </div>
                <button className="pli-connect-btn">✓ Bağlandı</button>
              </div>
              <div className="pli-network-item">
                <span className="pli-avatar">👩‍💼</span>
                <div>
                  <strong>Selin Arslan</strong>
                  <p>Tech Recruiter • Global Tech</p>
                </div>
                <button className="pli-connect-btn pli-connect-btn--add">+ Bağlantı Kur</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
