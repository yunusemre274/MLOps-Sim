/**
 * WindowErrorBoundary.jsx — XP Pencere İçi Hata Yakalama (Error Boundary)
 *
 * Herhangi bir uygulamanın (Dosya Gezgini, Editör, vb.) çökmesi durumunda
 * tüm uygulamanın / masaüstünün çökmesini engeller.
 * Sadece ilgili pencere içinde XP tarzı hata paneli gösterir.
 */

import { Component } from 'react';

export default class WindowErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[WindowErrorBoundary] Pencere içi bileşen hatası yakalandı:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24,
          background: '#ece9d8',
          color: '#000',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: 'Tahoma, sans-serif',
          fontSize: 12,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#cc0000' }}>Uygulama Yanıt Vermiyor</h3>
          <p style={{ margin: '0 0 16px 0', opacity: 0.8, maxWidth: 360 }}>
            {this.props.appName || 'Bu uygulama'} beklenmeyen bir hatayla karşılaştı ve durduruldu.
          </p>
          <div style={{ fontSize: 10, background: '#fff', border: '1px solid #716f64', padding: 8, maxWidth: 380, overflowX: 'auto', marginBottom: 16, textAlign: 'left' }}>
            <code>{this.state.error?.message || 'Bilinmeyen Hata'}</code>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '4px 16px',
              background: '#d4d0c8',
              border: '1px solid #716f64',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Uygulamayı Yeniden Başlat
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
