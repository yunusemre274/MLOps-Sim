/**
 * PhoneMarketApp.jsx — Online Market (GetirMLOps / Hızlı Sipariş)
 *
 * Evden hızlı sipariş: Buzdolabına ürün ekler, paradan düşer,
 * Mesajlar'a ve Bildirim Merkezi'ne teslimat bildirimi gönderir.
 */

import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { FINANCE } from '../../config/gameBalance.config.js';
import './PhoneMarketApp.css';

const MARKET_PRODUCTS = [
  { id: 'bread', name: 'Taze Ekmek', category: 'fırın', basePrice: FINANCE.MARKET_PRICES.bread || 5, icon: '🍞', hunger: 15 },
  { id: 'eggs', name: 'Organik Yumurta (10lu)', category: 'kahvaltı', basePrice: FINANCE.MARKET_PRICES.eggs || 25, icon: '🥚', hunger: 25 },
  { id: 'cheese', name: 'Kaşar Peyniri', category: 'kahvaltı', basePrice: FINANCE.MARKET_PRICES.cheese || 40, icon: '🧀', hunger: 20 },
  { id: 'chicken', name: 'Tavuk Göğsü (500g)', category: 'yemek', basePrice: FINANCE.MARKET_PRICES.chicken || 60, icon: '🍗', hunger: 45 },
  { id: 'rice', name: 'Pilavlık Pirinç (1kg)', category: 'yemek', basePrice: FINANCE.MARKET_PRICES.rice || 30, icon: '🍚', hunger: 35 },
  { id: 'vegetables', name: 'Taze Sebze Paketi', category: 'manav', basePrice: FINANCE.MARKET_PRICES.vegetables || 20, icon: '🥗', hunger: 20 },
  { id: 'fruit', name: 'Meyve Sepeti', category: 'manav', basePrice: FINANCE.MARKET_PRICES.fruit || 25, icon: '🍎', hunger: 15 },
  { id: 'milk', name: 'Süt (1L)', category: 'içecek', basePrice: FINANCE.MARKET_PRICES.milk || 15, icon: '🥛', hunger: 10 },
  { id: 'water', name: 'Doğal Kaynak Suyu', category: 'içecek', basePrice: FINANCE.MARKET_PRICES.water || 5, icon: '💧', hunger: 5 },
  { id: 'energy_drink', name: 'MLOps Monster Energy', category: 'içecek', basePrice: FINANCE.MARKET_PRICES.energy_drink || 30, icon: '⚡', hunger: 10 },
];

export default function PhoneMarketApp() {
  const balance = useGameStore((s) => s.finance.balance);
  const spendMoney = useGameStore((s) => s.spendMoney);
  const addToFridge = useGameStore((s) => s.addToFridge);
  const sendSms = useGameStore((s) => s.sendSms);
  const pushNotification = useGameStore((s) => s.pushNotification);

  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const markup = FINANCE.ONLINE_MARKET_MARKUP || 1.25;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOrder = (product) => {
    const cost = Math.ceil(product.basePrice * markup);
    if (balance < cost) {
      showToast(`⚠️ Yetersiz bakiye! ₺${cost} gerekli.`);
      return;
    }

    spendMoney(cost, `Online Market: ${product.name}`, 'food');
    addToFridge(product.id);

    // Mesajlar (SMS) sistemine bildirim ekle
    sendSms({
      from: 'GetirMLOps',
      text: `Siparişiniz yola çıktı! "${product.name}" buzdolabınıza teslim edildi. (₺${cost})`,
      category: 'market',
    });

    // Merkezi Bildirim Merkezi'ne push et
    pushNotification({
      app: 'market',
      title: '🛵 Kurye Teslimatı',
      body: `"${product.name}" kapınıza ulaştı ve buzdolabına eklendi!`,
      icon: '🛵',
      onTapApp: 'messages',
    });

    showToast(`🛵 "${product.name}" sipariş edildi! (-₺${cost})`);
  };

  const filteredProducts = selectedCategory === 'all'
    ? MARKET_PRODUCTS
    : MARKET_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="phone-market-app">
      {/* Üst Bar */}
      <div className="pma-top-bar">
        <div className="pma-brand">
          <span className="pma-logo">🛵</span>
          <div>
            <h3>GetirMLOps</h3>
            <span className="pma-subtitle">10 Dakikada Kapında</span>
          </div>
        </div>
        <div className="pma-balance-pill">
          💰 ₺{Math.floor(balance)}
        </div>
      </div>

      {toast && <div className="pma-toast">{toast}</div>}

      {/* Kategori Seçimi */}
      <div className="pma-cats">
        {['all', 'kahvaltı', 'yemek', 'manav', 'içecek', 'fırın'].map((cat) => (
          <button
            key={cat}
            className={`pma-cat-btn ${selectedCategory === cat ? 'pma-cat-btn--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Ürün Grid */}
      <div className="pma-product-grid">
        {filteredProducts.map((p) => {
          const finalPrice = Math.ceil(p.basePrice * markup);
          return (
            <div key={p.id} className="pma-product-card">
              <span className="pma-p-icon">{p.icon}</span>
              <h4>{p.name}</h4>
              <span className="pma-p-hunger">+{p.hunger} Doygunluk</span>
              <div className="pma-p-footer">
                <span className="pma-p-price">₺{finalPrice}</span>
                <button
                  className="pma-order-btn"
                  onClick={() => handleOrder(p)}
                  disabled={balance < finalPrice}
                >
                  Sipariş Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
