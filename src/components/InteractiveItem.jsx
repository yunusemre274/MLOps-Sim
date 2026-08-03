/**
 * InteractiveItem.jsx — Tıklanabilir kutucuk bileşeni
 *
 * Ev ve diğer sahnelerde kullanılan genel etkileşim kutucuğu.
 * Tıklama efekti, devre dışı durumu, tooltip desteği.
 */

import './InteractiveItem.css';

export default function InteractiveItem({
  id,
  icon,
  label,
  onClick,
  disabled = false,
  badge = null,
  tooltip = null,
}) {
  return (
    <button
      id={`item-${id}`}
      className={`interactive-item ${disabled ? 'interactive-item--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      title={tooltip || label}
      disabled={disabled}
    >
      <span className="interactive-item__icon">{icon}</span>
      <span className="interactive-item__label">{label}</span>
      {badge && <span className="interactive-item__badge">{badge}</span>}
    </button>
  );
}
