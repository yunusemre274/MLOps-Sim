/**
 * PhoneGmailApp.jsx — Gmail E-Posta İstemcisi
 *
 * Şirket yazışmaları, mülakat davetleri, teklifler ve resmi e-posta arayüzü.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import './PhoneGmailApp.css';

const DEFAULT_GMAIL_EMAILS = [
  {
    id: 'em_1',
    sender: 'TechStart HR Ekibi <kariyer@techstart.co>',
    subject: 'FastAPI Containerize Başvurunuz Alındı 🎉',
    preview: 'Merhaba, MLOps stajyer/junior pozisyonu için yaptığınız başvuru başarıyla alındı...',
    body: 'Sayın Aday,\n\nTechStart Co. bünyesindeki FastAPI Containerize görevi için başvurunuz değerlendirmeye alınmıştır.\n\nLütfen ilgili depoyu terminalinizden klonlayıp Dockerfile ve Compose yapılandırmasını tamamlayınız. CI/CD testleri başarılı olduğunda nihai mülakat aşamasına geçilecektir.\n\nBaşarılar dileriz,\nTechStart İnsan Kaynakları',
    time: '10:15',
    day: 1,
    read: false,
    starred: true,
  },
  {
    id: 'em_2',
    sender: 'CloudPeak Tech <noreply@cloudpeak.io>',
    subject: 'Haftalık MLOps & Kubernetes Bülteni #42 📰',
    preview: 'Bu hafta: Helm chart best practices, ArgoCD ile GitOps entegrasyonu ve...',
    body: 'Merhaba MLOps Mühendisi,\n\nBu haftaki bültenimizde:\n1. Docker multi-stage build teknikleri ile %80 boyut tasarrufu\n2. Kubernetes Liveness/Readiness probe yapılandırması\n3. Prometheus & Grafana ile model izleme\n\nKeyifli okumalar!\nCloudPeak Editör Masası',
    time: 'Dün',
    day: 1,
    read: true,
    starred: false,
  },
  {
    id: 'em_3',
    sender: 'DevBank Güvenlik <guvenlik@devbank.com>',
    subject: 'Hesap Güvenlik Bildirimi: Başarılı Giriş',
    preview: 'Yeni bir cihazdan (MLOps Phone 16 Pro) hesabınıza başarıyla erişim sağlandı...',
    body: 'Sayın Müşterimiz,\n\nHesabınıza 08:00 saatinde yeni bir mobil oturum ile giriş yapılmıştır. Eğer bu işlemi siz yapmadıysanız lütfen derhal müşteri hizmetleri ile iletişime geçiniz.\n\nDevBank Güvenlik Ekibi',
    time: 'Dün',
    day: 1,
    read: true,
    starred: false,
  },
];

export default function PhoneGmailApp() {
  const storeEmails = useGameStore((s) => s.emails) || [];
  const [emails, setEmails] = useState(() => (storeEmails.length > 0 ? storeEmails : DEFAULT_GMAIL_EMAILS));
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId);

  const handleOpenEmail = (email) => {
    setSelectedEmailId(email.id);
    setEmails((prev) =>
      prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    );
  };

  const handleToggleStar = (e, emailId) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((em) => (em.id === emailId ? { ...em, starred: !em.starred } : em))
    );
  };

  return (
    <div className="phone-gmail-app">
      {/* Üst Bar */}
      <div className="pga-header">
        {selectedEmail ? (
          <div className="pga-detail-header">
            <button className="pga-back-btn" onClick={() => setSelectedEmailId(null)}>
              ← Gelen Kutusu
            </button>
            <div className="pga-detail-actions">
              <button onClick={(e) => handleToggleStar(e, selectedEmail.id)}>
                {selectedEmail.starred ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        ) : (
          <div className="pga-inbox-header">
            <div className="pga-brand">
              <span className="pga-logo">📧</span>
              <h3>Gmail</h3>
            </div>
            <span className="pga-badge">{emails.filter((e) => !e.read).length} Okunmamış</span>
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="pga-body">
        {selectedEmail ? (
          /* E-Posta Detayı */
          <div className="pga-email-detail">
            <h3>{selectedEmail.subject}</h3>
            <div className="pga-sender-card">
              <div className="pga-sender-avatar">👤</div>
              <div>
                <strong>{selectedEmail.sender}</strong>
                <span className="pga-email-date">Gün {selectedEmail.day || 1} • {selectedEmail.time}</span>
              </div>
            </div>
            <div className="pga-email-content">
              {selectedEmail.body.split('\n').map((para, i) => (
                <p key={i}>{para || '\u00A0'}</p>
              ))}
            </div>
            <div className="pga-reply-box">
              <button className="pga-reply-btn" onClick={() => alert('Yanıt gönderildi simülasyonu')}>
                ↩️ Yanıtla
              </button>
              <button className="pga-forward-btn" onClick={() => alert('İletildi')}>
                ↪️ İlet
              </button>
            </div>
          </div>
        ) : (
          /* E-Posta Listesi */
          <div className="pga-email-list">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`pga-email-item ${email.read ? 'pga-email-item--read' : 'pga-email-item--unread'}`}
                onClick={() => handleOpenEmail(email)}
              >
                <div className="pga-item-left">
                  <span className="pga-star" onClick={(e) => handleToggleStar(e, email.id)}>
                    {email.starred ? '⭐' : '☆'}
                  </span>
                </div>
                <div className="pga-item-main">
                  <div className="pga-item-top">
                    <strong className="pga-item-sender">{email.sender.split('<')[0]}</strong>
                    <span className="pga-item-time">{email.time}</span>
                  </div>
                  <div className="pga-item-subject">{email.subject}</div>
                  <div className="pga-item-preview">{email.preview}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
