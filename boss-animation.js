/* Boss-wave character entrance animation. Loaded after script.js. */
(() => {
  const styles = document.createElement('style');
  styles.textContent = `
    #customerCard { position: relative; overflow: hidden; }
    #customerCard.boss-customer {
      border: 2px solid #ef6b5d;
      background: linear-gradient(135deg, #fff1dc, #ffe0d7 55%, #fff8df);
      box-shadow: 0 0 0 4px #ef6b5d22, 0 12px 30px #a8322450;
    }
    #customerCard.boss-customer::before {
      content: "🔥 BOSS CUSTOMER 🔥";
      display: block;
      width: max-content;
      margin: 0 auto 8px;
      padding: 4px 11px;
      border-radius: 999px;
      color: #fff;
      background: linear-gradient(90deg, #c8392b, #f28a2e);
      font-size: .72rem;
      font-weight: 800;
      letter-spacing: .08em;
      animation: boss-badge-glow 1s ease-in-out infinite alternate;
    }
    #customerCard.boss-customer .avatar {
      display: grid;
      place-items: center;
      width: 82px;
      height: 82px;
      margin: 8px auto;
      border-radius: 50%;
      background: radial-gradient(circle, #fff4b8 0 45%, #ffb34f 72%, #ef6b5d 100%);
      box-shadow: 0 0 0 5px #fff8, 0 0 26px #f28a2e99;
      font-size: 3.2rem;
      animation: boss-character-arrive .85s cubic-bezier(.2,1.7,.45,1) both, boss-character-idle 1.8s .9s ease-in-out infinite;
    }
    #customerCard.boss-enter { animation: boss-card-arrive .8s cubic-bezier(.2,1.4,.4,1) both; }
    #customerCard.boss-customer .order-chip { animation: boss-order-pop .45s both; }
    #customerCard.boss-customer .order-chip:nth-child(2) { animation-delay: .08s; }
    #customerCard.boss-customer .order-chip:nth-child(3) { animation-delay: .16s; }
    #customerCard.boss-customer .order-chip:nth-child(4) { animation-delay: .24s; }
    #speechBubble.boss-speech { border-color: #ef6b5d; box-shadow: 0 0 18px #ef6b5d55; animation: boss-speech-pop .45s cubic-bezier(.2,1.5,.4,1) both; }
    @keyframes boss-card-arrive { 0% { opacity: .35; transform: translateX(-45px) scale(.86) rotate(-3deg); } 55% { opacity: 1; transform: translateX(8px) scale(1.04) rotate(1deg); } 78% { transform: translateX(-3px) scale(.99); } 100% { transform: none; } }
    @keyframes boss-character-arrive { 0% { opacity: 0; transform: translateY(28px) scale(.2) rotate(-25deg); } 65% { opacity: 1; transform: translateY(-8px) scale(1.2) rotate(8deg); } 100% { transform: translateY(0) scale(1) rotate(0); } }
    @keyframes boss-character-idle { 0%,100% { translate: 0 0; } 50% { translate: 0 -7px; } }
    @keyframes boss-badge-glow { from { filter: drop-shadow(0 0 1px #ffb34f); } to { filter: drop-shadow(0 0 8px #ef6b5d); } }
    @keyframes boss-order-pop { from { opacity: 0; transform: scale(.65) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes boss-speech-pop { from { opacity: .3; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
    @media (prefers-reduced-motion: reduce) { #customerCard.boss-enter, #customerCard.boss-customer .avatar, #customerCard.boss-customer::before, #customerCard.boss-customer .order-chip, #speechBubble.boss-speech { animation: none; } }
  `;
  document.head.appendChild(styles);

  // state is a top-level lexical const in script.js, so detect boss mode from
  // the visible order label rather than trying to read window.state.
  const decorateCustomer = () => {
    const card = document.getElementById('customerCard');
    const bubble = document.getElementById('speechBubble');
    const number = document.getElementById('customerNumber');
    if (!card || !number) return;
    const isBoss = number.textContent.startsWith('Boss Wave');
    card.classList.toggle('boss-customer', isBoss);
    card.classList.toggle('boss-enter', isBoss);
    const avatar = card.querySelector('.avatar');
    if (isBoss && avatar) avatar.textContent = '👹';
    if (bubble) {
      bubble.classList.toggle('boss-speech', isBoss);
      if (isBoss) bubble.textContent = 'The Boss is here! Make my perfect pani puri!';
    }
    if (isBoss) window.setTimeout(() => card.classList.remove('boss-enter'), 850);
  };

  const card = document.getElementById('customerCard');
  if (card) new MutationObserver(decorateCustomer).observe(card, { childList: true });
  window.addEventListener('DOMContentLoaded', decorateCustomer);
})();
