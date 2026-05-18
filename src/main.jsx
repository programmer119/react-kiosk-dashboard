import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CreditCard,
  CupSoda,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Utensils
} from 'lucide-react';
import './styles.css';

const categories = [
  { id: 'signature', label: 'Signature', icon: Sparkles },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'beverage', label: 'Beverage', icon: CupSoda },
  { id: 'food', label: 'Food', icon: Utensils }
];

const products = [
  {
    id: 'mint-latte',
    category: 'signature',
    name: 'Mint Cream Latte',
    ko: '민트 크림 라떼',
    price: 6200,
    badge: 'Best',
    color: '#22b78f'
  },
  {
    id: 'black-sesame',
    category: 'signature',
    name: 'Black Sesame Cloud',
    ko: '흑임자 클라우드',
    price: 6800,
    badge: 'New',
    color: '#4b5563'
  },
  {
    id: 'americano',
    category: 'coffee',
    name: 'Americano',
    ko: '아메리카노',
    price: 4200,
    badge: 'Hot/Ice',
    color: '#76553f'
  },
  {
    id: 'flat-white',
    category: 'coffee',
    name: 'Flat White',
    ko: '플랫 화이트',
    price: 5400,
    badge: 'Milk',
    color: '#b08a62'
  },
  {
    id: 'grapefruit',
    category: 'beverage',
    name: 'Grapefruit Ade',
    ko: '자몽 에이드',
    price: 5900,
    badge: 'Ice',
    color: '#ef755f'
  },
  {
    id: 'matcha',
    category: 'beverage',
    name: 'Matcha Frappe',
    ko: '말차 프라페',
    price: 6500,
    badge: 'Blend',
    color: '#5f8f5f'
  },
  {
    id: 'croissant',
    category: 'food',
    name: 'Butter Croissant',
    ko: '버터 크루아상',
    price: 4300,
    badge: 'Bakery',
    color: '#d28b3f'
  },
  {
    id: 'sandwich',
    category: 'food',
    name: 'Chicken Sandwich',
    ko: '치킨 샌드위치',
    price: 7200,
    badge: 'Meal',
    color: '#d45d4c'
  }
];

const steps = ['메뉴 선택', '주문 확인', '결제'];

function money(value) {
  return value.toLocaleString('ko-KR');
}

function App() {
  const [category, setCategory] = useState('signature');
  const [cart, setCart] = useState([
    { id: 'mint-latte', quantity: 1, option: 'Ice' },
    { id: 'croissant', quantity: 1, option: 'Warm' }
  ]);
  const [step, setStep] = useState(0);
  const [pickup, setPickup] = useState('store');

  const visibleProducts = products.filter((item) => item.category === category);

  const cartItems = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.id)
      })),
    [cart]
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = pickup === 'takeout' ? 300 : 0;
  const total = subtotal + serviceFee;

  function addProduct(product) {
    setStep(1);
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { id: product.id, quantity: 1, option: product.category === 'food' ? 'Warm' : 'Ice' }];
    });
  }

  function updateQuantity(id, delta) {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  return (
    <main className="kiosk-shell">
      <section className="kiosk-frame">
        <header className="topbar">
          <button className="ghost-button" type="button" aria-label="이전">
            <ChevronLeft size={22} />
          </button>
          <div>
            <span>Self Order Kiosk</span>
            <h1>오늘의 주문</h1>
          </div>
          <button className="ghost-button" type="button" aria-label="다음">
            <ChevronRight size={22} />
          </button>
        </header>

        <div className="stepper">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index === step ? 'step active' : index < step ? 'step done' : 'step'}
              onClick={() => setStep(index)}
            >
              <b>{index + 1}</b>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <section className="hero-panel">
          <div>
            <span>Order faster</span>
            <h2>터치 한 번으로 메뉴 선택부터 결제까지</h2>
            <p>카페, 푸드코트, 매장형 키오스크에 맞춘 대형 터치 UI 프로토타입입니다.</p>
          </div>
          <div className="order-number">
            <span>대기 번호</span>
            <strong>042</strong>
          </div>
        </section>

        <section className="menu-layout">
          <aside className="category-rail">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={category === item.id ? 'category active' : 'category'}
                  onClick={() => setCategory(item.id)}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          <section className="product-area">
            <div className="search-row">
              <Search size={20} />
              <span>메뉴를 선택하면 오른쪽 주문서에 바로 추가됩니다</span>
            </div>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <button className="product-card" key={product.id} type="button" onClick={() => addProduct(product)}>
                  <div className="cup-visual" style={{ '--item-color': product.color }}>
                    <i />
                  </div>
                  <span className="badge">{product.badge}</span>
                  <strong>{product.ko}</strong>
                  <em>{product.name}</em>
                  <b>{money(product.price)}원</b>
                </button>
              ))}
            </div>
          </section>

          <aside className="cart-panel">
            <div className="cart-title">
              <div>
                <span>Order Sheet</span>
                <h2>주문 내역</h2>
              </div>
              <ShoppingBag size={26} />
            </div>

            <div className="pickup-toggle">
              <button
                type="button"
                className={pickup === 'store' ? 'active' : ''}
                onClick={() => setPickup('store')}
              >
                매장
              </button>
              <button
                type="button"
                className={pickup === 'takeout' ? 'active' : ''}
                onClick={() => setPickup('takeout')}
              >
                포장
              </button>
            </div>

            <div className="cart-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.product.ko}</strong>
                    <span>{item.option}</span>
                  </div>
                  <div className="quantity">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label="수량 감소">
                      {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                    </button>
                    <b>{item.quantity}</b>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label="수량 증가">
                      <Plus size={16} />
                    </button>
                  </div>
                  <em>{money(item.product.price * item.quantity)}원</em>
                </article>
              ))}
            </div>

            <div className="summary">
              <div>
                <span>상품 금액</span>
                <b>{money(subtotal)}원</b>
              </div>
              <div>
                <span>포장 수수료</span>
                <b>{money(serviceFee)}원</b>
              </div>
              <div className="total">
                <span>결제 금액</span>
                <strong>{money(total)}원</strong>
              </div>
            </div>

            <div className="pay-actions">
              <button type="button" onClick={() => setStep(2)}>
                <CreditCard size={20} />
                카드 결제
              </button>
              <button type="button" onClick={() => setStep(2)}>
                <Banknote size={20} />
                현금 결제
              </button>
            </div>

            <button className="receipt-button" type="button">
              <ReceiptText size={20} />
              영수증 출력
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
