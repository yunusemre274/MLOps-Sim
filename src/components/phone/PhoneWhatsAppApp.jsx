/**
 * PhoneWhatsAppApp.jsx — WhatsApp NPC Mesajlaşma Uygulaması
 *
 * NPC sohbet listesi, mesaj geçmişi, hızlı yanıt seçim ağacı (choice tree)
 * ve ilişki barı (+ilişki puanı) entegrasyonu.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import npcs from '../../data/npcs.json';
import './PhoneWhatsAppApp.css';

const DEFAULT_CHATS = {
  ayse: {
    messages: [
      { id: 'm1', from: 'npc', text: 'Selam! Yeni bir FastAPI servisini Dockerize ediyordum, senin container bilginden faydalanabilir miyim? ☕', time: '09:15' },
    ],
    quickReplies: [
      { id: 'r1', text: 'Tabii ki! Multi-stage build kullanarak imaj boyutunu küçültebilirsin.', reply: 'Harika bir fikir! Şimdi deniyorum, çok sağ ol! 🙏', points: 4 },
      { id: 'r2', text: 'Öğleden sonra kahve içerken detaylıca bakalım mı? ☕', reply: 'Süper olur, saat 14:00 gibi kafede buluşalım!', points: 5 },
      { id: 'r3', text: 'Şu an yoğun bir CI/CD pipeline üzerindeyim, sonra yazsam olur mu?', reply: 'Anladım kolay gelsin, sonra görüşürüz.', points: 1 },
    ],
  },
  mehmet: {
    messages: [
      { id: 'm1', from: 'npc', text: 'Dostum selam, Production ortamında Docker Compose mu Kubernetes mi sence?', time: '10:30' },
    ],
    quickReplies: [
      { id: 'r1', text: 'Küçük servisler için Compose yeterli, ama ölçeklenebilirlik için K8s şart.', reply: 'Kesinlikle katılıyorum! Cluster kurulumuna başladım bile.', points: 4 },
      { id: 'r2', text: 'Akşam pubda bir şeyler içerken tartışalım mı? 🍻', reply: 'Bana uyar! Akşam görüşürüz.', points: 5 },
    ],
  },
  zeynep: {
    messages: [
      { id: 'm1', from: 'npc', text: 'Hey! Yeni MLOps Dashboard arayüz tasarımını Figma üzerinde bitirdim, göz atmak ister misin? 🎨', time: '11:00' },
    ],
    quickReplies: [
      { id: 'r1', text: 'Harika görünüyor! Renk paleti ve karanlık mod çok şık.', reply: 'Beğenmene çok sevindim! Backend API hazır olunca entegre edelim.', points: 4 },
      { id: 'r2', text: 'Sanat sergisine ne zaman gidiyoruz?', reply: 'Hafta sonu galeride yeni bir sergi var, birlikte gideriz!', points: 5 },
    ],
  },
  burak: {
    messages: [
      { id: 'm1', from: 'npc', text: 'Model inference süresini 120ms altına düşürmek için ONNX runtime deniyorum.', time: '08:45' },
    ],
    quickReplies: [
      { id: 'r1', text: 'TensorRT veya TorchScript ile daha da hızlandırabilirsin.', reply: 'Mantıklı, benchmark testlerine ekliyorum.', points: 4 },
      { id: 'r2', text: 'Harika optimizasyon, eline sağlık!', reply: 'Teşekkürler, sonuçları paylaşırım.', points: 3 },
    ],
  },
};

export default function PhoneWhatsAppApp() {
  const relationships = useGameStore((s) => s.relationships);
  const updateRelationship = useGameStore((s) => s.updateRelationship);
  const pushNotification = useGameStore((s) => s.pushNotification);

  const [chats, setChats] = useState(DEFAULT_CHATS);
  const [activeNpcId, setActiveNpcId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Tanışılan veya varsayılan NPC'ler
  const chatList = npcs.map((npc) => {
    const rel = relationships[npc.id] || { level: 10, status: 'tanıdık' };
    const chatData = chats[npc.id] || { messages: [{ id: 'm0', from: 'npc', text: npc.greeting, time: '08:00' }], quickReplies: [] };
    const lastMsg = chatData.messages[chatData.messages.length - 1];

    return {
      ...npc,
      relLevel: rel.level,
      lastMessage: lastMsg ? lastMsg.text : npc.greeting,
      lastTime: lastMsg ? lastMsg.time : '08:00',
    };
  });

  const activeNpc = npcs.find((n) => n.id === activeNpcId);
  const currentChat = activeNpcId ? (chats[activeNpcId] || { messages: [], quickReplies: [] }) : null;

  const handleSendQuickReply = (option) => {
    if (!activeNpcId || isTyping) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      from: 'user',
      text: option.text,
      time: 'Şimdi',
    };

    // Kullanıcı mesajını ekle ve ilişkiyi güncelle
    setChats((prev) => ({
      ...prev,
      [activeNpcId]: {
        ...prev[activeNpcId],
        messages: [...(prev[activeNpcId]?.messages || []), userMsg],
        quickReplies: (prev[activeNpcId]?.quickReplies || []).filter((q) => q.id !== option.id),
      },
    }));

    updateRelationship(activeNpcId, option.points || 3);

    // NPC yazıyor simülasyonu
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const npcMsg = {
        id: `npc_${Date.now()}`,
        from: 'npc',
        text: option.reply || 'Harika, teşekkürler!',
        time: 'Şimdi',
      };

      setChats((prev) => ({
        ...prev,
        [activeNpcId]: {
          ...prev[activeNpcId],
          messages: [...(prev[activeNpcId]?.messages || []), npcMsg],
        },
      }));

      pushNotification({
        app: 'whatsapp',
        title: `WhatsApp: ${activeNpc?.name || 'Mesaj'}`,
        body: option.reply,
        icon: '💬',
        onTapApp: 'whatsapp',
      });
    }, 900);
  };

  return (
    <div className="phone-whatsapp-app">
      {/* Başlık Barı */}
      <div className="pwa-header">
        {activeNpc ? (
          <div className="pwa-chat-header">
            <button className="pwa-back-btn" onClick={() => setActiveNpcId(null)}>
              ← Sohbetler
            </button>
            <span className="pwa-avatar">{activeNpc.avatar}</span>
            <div className="pwa-contact-info">
              <h4>{activeNpc.name}</h4>
              <span className="pwa-status">{isTyping ? 'yazıyor...' : 'çevrimiçi • İlişki: ' + (relationships[activeNpc.id]?.level || 10) + '/100'}</span>
            </div>
          </div>
        ) : (
          <div className="pwa-list-header">
            <div className="pwa-brand">
              <span className="pwa-logo">💬</span>
              <h3>WhatsApp</h3>
            </div>
            <span className="pwa-badge">{chatList.length} Kişi</span>
          </div>
        )}
      </div>

      {/* Ana Gövde */}
      <div className="pwa-body">
        {activeNpc && currentChat ? (
          /* Sohbet Ekranı */
          <div className="pwa-chat-view">
            <div className="pwa-messages-container">
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`pwa-bubble ${msg.from === 'user' ? 'pwa-bubble--user' : 'pwa-bubble--npc'}`}
                >
                  <p>{msg.text}</p>
                  <span className="pwa-msg-time">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="pwa-bubble pwa-bubble--npc pwa-typing-bubble">
                  <span>{activeNpc.name} yazıyor</span>
                  <span className="pwa-dot">.</span>
                  <span className="pwa-dot">.</span>
                  <span className="pwa-dot">.</span>
                </div>
              )}
            </div>

            {/* Hızlı Yanıt Seçenekleri (Choice Tree) */}
            <div className="pwa-reply-bar">
              <div className="pwa-reply-title">Hızlı Yanıt Seçin:</div>
              <div className="pwa-quick-replies">
                {currentChat.quickReplies && currentChat.quickReplies.length > 0 ? (
                  currentChat.quickReplies.map((reply) => (
                    <button
                      key={reply.id}
                      className="pwa-reply-chip"
                      onClick={() => handleSendQuickReply(reply)}
                      disabled={isTyping}
                    >
                      {reply.text} <small>+{reply.points} İlişki</small>
                    </button>
                  ))
                ) : (
                  <div className="pwa-no-replies">Şu an için yeni konuşma konusu yok.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sohbet Listesi */
          <div className="pwa-chat-list">
            {chatList.map((contact) => (
              <div
                key={contact.id}
                className="pwa-chat-item"
                onClick={() => setActiveNpcId(contact.id)}
              >
                <span className="pwa-avatar">{contact.avatar}</span>
                <div className="pwa-chat-details">
                  <div className="pwa-chat-top">
                    <h4>{contact.name}</h4>
                    <span className="pwa-time">{contact.lastTime}</span>
                  </div>
                  <p className="pwa-last-msg">{contact.lastMessage}</p>
                </div>
                <div className="pwa-rel-indicator" title={`İlişki: ${contact.relLevel}/100`}>
                  <div className="pwa-rel-bar" style={{ width: `${Math.min(100, contact.relLevel)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
