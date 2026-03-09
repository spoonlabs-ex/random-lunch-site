import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RefreshCcw, Trash2, UserPlus2, Users } from 'lucide-react';

const FOOD_ITEMS = [
  { label: '피자', emoji: '🍕' },
  { label: '햄버거', emoji: '🍔' },
  { label: '초밥', emoji: '🍣' },
  { label: '라멘', emoji: '🍜' },
  { label: '샐러드', emoji: '🥗' },
  { label: '치킨', emoji: '🍗' },
  { label: '타코', emoji: '🌮' },
  { label: '샌드위치', emoji: '🥪' },
  { label: '도넛', emoji: '🍩' },
  { label: '커피', emoji: '☕' },
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createFallingFoods() {
  return Array.from({ length: 16 }, (_, index) => ({
    id: `food-${Date.now()}-${index}`,
    left: `${randomBetween(4, 92)}%`,
    duration: randomBetween(3.5, 6.8),
    delay: randomBetween(0, 1.4),
    rotate: randomBetween(-180, 180),
    size: randomBetween(30, 54),
    item: FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)],
  }));
}

function createFallingName(name) {
  return {
    id: `name-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    left: `${randomBetween(8, 78)}%`,
    duration: randomBetween(4.6, 7.4),
    rotate: randomBetween(-18, 18),
    name,
  };
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

export default function App() {
  const [name, setName] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [fallingFoods, setFallingFoods] = useState([]);
  const [fallingNames, setFallingNames] = useState([]);

  const uniqueNames = useMemo(() => entries.map((item) => item.name), [entries]);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [message]);

  function launchAnimation(submittedName) {
    setFallingFoods(createFallingFoods());
    setFallingNames((prev) => [...prev, createFallingName(submittedName)]);
    window.setTimeout(() => {
      setFallingFoods([]);
      setFallingNames([]);
    }, 8500);
  }

  async function loadEntries() {
    try {
      setLoading(true);
      const data = await requestJson('/.netlify/functions/getEntries');
      setEntries(data.entries || []);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(mode) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage('이름을 입력해 주세요.');
      setMessageType('error');
      return;
    }

    if (entries.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())) {
      setMessage('이미 신청된 이름입니다.');
      setMessageType('error');
      launchAnimation(trimmedName);
      return;
    }

    try {
      setSubmitting(true);
      const data = await requestJson('/.netlify/functions/submitEntry', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, mode }),
      });
      setEntries(data.entries || []);
      setName('');
      setMessage(mode === 'group' ? '같이 신청 완료!' : '신청 완료!');
      setMessageType('success');
      launchAnimation(trimmedName);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(entry) {
    try {
      setCancellingId(entry.id);
      const data = await requestJson('/.netlify/functions/cancelEntry', {
        method: 'POST',
        body: JSON.stringify({ id: entry.id, name: entry.name }),
      });
      setEntries(data.entries || []);
      setMessage(`${entry.name} 신청이 취소되었습니다.`);
      setMessageType('success');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setCancellingId('');
    }
  }

  return (
    <div className="page-shell">
      <div className="hero-pattern" />

      <main className="page-content">
        <section className="hero-card">
          <div className="hero-copy">
            <p className="hero-kicker">🍽️ SpoonLabs Event</p>
            <h1>랜덤런치 신청하기</h1>
            <p className="hero-description">
              기존 랜딩페이지의 간결한 구조를 유지하면서, 신청자 이름과 음식 아이템이 화면에 떨어지는
              인터랙션과 Google Sheet 저장 기능을 붙인 버전입니다.
            </p>
          </div>

          <div className="input-panel">
            <label htmlFor="name" className="input-label">이름</label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSubmit('solo');
                }
              }}
              placeholder="이름을 입력해 주세요"
              className="name-input"
            />

            <div className="button-row">
              <button className="primary-button" onClick={() => handleSubmit('solo')} disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : <UserPlus2 size={18} />}
                신청
              </button>
              <button className="secondary-button" onClick={() => handleSubmit('group')} disabled={submitting}>
                <Users size={18} />
                같이 신청
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`toast ${messageType}`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="content-grid">
          <article className="fall-zone-card">
            <div className="section-head">
              <h2>낙하 애니메이션</h2>
              <button className="refresh-button" onClick={loadEntries} disabled={loading}>
                <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                새로고침
              </button>
            </div>

            <div className="fall-zone">
              <div className="pill-summary">현재 신청자 {entries.length}명</div>

              <AnimatePresence>
                {fallingFoods.map((food) => (
                  <motion.div
                    key={food.id}
                    initial={{ y: -120, opacity: 0, rotate: 0 }}
                    animate={{ y: 500, opacity: [0, 1, 1, 0.95], rotate: food.rotate }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: food.duration, delay: food.delay, ease: 'easeIn' }}
                    className="food-drop"
                    style={{ left: food.left, width: food.size, height: food.size, fontSize: food.size / 2.1 }}
                  >
                    <span aria-hidden>{food.item.emoji}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {fallingNames.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: -80, opacity: 0, scale: 0.85 }}
                    animate={{ y: 470, opacity: [0, 1, 1, 0.95], scale: 1, rotate: item.rotate }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: item.duration, ease: 'easeIn' }}
                    className="name-drop"
                    style={{ left: item.left }}
                  >
                    {item.name}
                  </motion.div>
                ))}
              </AnimatePresence>

              {!fallingFoods.length && !fallingNames.length && (
                <div className="fall-zone-empty">
                  <div className="emoji-large">🥢</div>
                  <strong>신청하면 이름과 음식이 떨어집니다</strong>
                  <p>실제 운영 시 PNG 음식 이미지로 바꾸면 더 기존 사이트 느낌에 가깝게 만들 수 있습니다.</p>
                </div>
              )}
            </div>
          </article>

          <article className="entry-card">
            <div className="section-head">
              <h2>신청 현황</h2>
              <span className="entry-count">{entries.length}명</span>
            </div>

            <div className="cancel-help">신청을 취소하고 싶으신가요?</div>

            {loading ? (
              <div className="empty-state">
                <Loader2 className="spin" size={20} /> 불러오는 중...
              </div>
            ) : entries.length === 0 ? (
              <div className="empty-state">아직 신청자가 없습니다.</div>
            ) : (
              <div className="entry-list">
                {entries.map((entry) => (
                  <div className="entry-item" key={entry.id}>
                    <div>
                      <div className="entry-name">{entry.name}</div>
                      <div className="entry-meta">{entry.mode === 'group' ? '같이 신청' : '혼자 신청'}</div>
                    </div>
                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(entry)}
                      disabled={cancellingId === entry.id}
                    >
                      {cancellingId === entry.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                      취소
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uniqueNames.length > 0 && (
              <div className="tag-list">
                {uniqueNames.map((participant) => (
                  <span className="tag-item" key={participant}>{participant}</span>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
