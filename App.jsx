import { useState, useEffect } from 'react'
import TaskList from './components/TaskList'
import Dashboard from './components/Dashboard'
import AddTask from './components/AddTask'

const STORAGE_KEY = 'my-tasks-data'

const today = () => new Date().toISOString().slice(0, 10)

const SAMPLE_TASKS = [
  { id: 1, title: '분기 보고서 초안 작성', priority: 1, date: today(), done: false },
  { id: 2, title: '클라이언트 미팅 자료 준비', priority: 2, date: today(), done: false },
  { id: 3, title: '팀 주간 회의', priority: 3, date: today(), done: true },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : SAMPLE_TASKS
    } catch {
      return SAMPLE_TASKS
    }
  })
  const [nextId, setNextId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const arr = JSON.parse(saved)
        return arr.length ? Math.max(...arr.map(t => t.id)) + 1 : 1
      }
    } catch {}
    return 4
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, id: nextId, done: false }])
    setNextId(n => n + 1)
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const todayStr = today()
  const todayTasks = tasks.filter(t => t.date === todayStr).sort((a, b) => a.priority - b.priority)
  const upcomingTasks = tasks.filter(t => t.date > todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
  const allTasks = [...tasks].sort((a, b) => a.priority - b.priority || a.date.localeCompare(b.date))

  const tabs = [
    { key: 'today', label: '오늘' },
    { key: 'all', label: '전체' },
    { key: 'dashboard', label: '대시보드' },
  ]

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <h1 style={styles.h1}>할 일 관리</h1>

        {/* 탭 */}
        <div style={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...styles.tab, ...(tab === t.key ? styles.tabActive : {}) }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 오늘 */}
        {tab === 'today' && (
          <div>
            <StatGrid tasks={tasks} todayTasks={todayTasks} />
            <AddTask onAdd={addTask} defaultDate={todayStr} />
            <SectionTitle>오늘 마감</SectionTitle>
            <TaskList tasks={todayTasks} onToggle={toggleTask} onDelete={deleteTask} />
            <SectionTitle style={{ marginTop: 24 }}>예정</SectionTitle>
            <TaskList tasks={upcomingTasks} onToggle={toggleTask} onDelete={deleteTask} />
          </div>
        )}

        {/* 전체 */}
        {tab === 'all' && (
          <div>
            <AddTask onAdd={addTask} defaultDate={todayStr} />
            <TaskList tasks={allTasks} onToggle={toggleTask} onDelete={deleteTask} />
          </div>
        )}

        {/* 대시보드 */}
        {tab === 'dashboard' && (
          <Dashboard tasks={tasks} />
        )}
      </div>
    </div>
  )
}

function StatGrid({ tasks, todayTasks }) {
  const total = tasks.length
  const done = tasks.filter(t => t.done).length
  const pct = total ? Math.round(done / total * 100) : 0
  const pending = total - done
  const stats = [
    { n: total, label: '전체' },
    { n: done, label: '완료' },
    { n: pending, label: '미완료' },
    { n: pct + '%', label: '진행률' },
  ]
  return (
    <div style={styles.statGrid}>
      {stats.map((s, i) => (
        <div key={i} style={styles.statCard}>
          <div style={styles.statN}>{s.n}</div>
          <div style={styles.statL}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ children, style }) {
  return <div style={{ ...styles.sectionTitle, ...style }}>{children}</div>
}

/* ── 스타일 ── */
const styles = {
  root: { minHeight: '100vh', background: '#f5f5f5', paddingBottom: 40 },
  container: { maxWidth: 640, margin: '0 auto', padding: '0 16px' },
  h1: { fontSize: 22, fontWeight: 600, padding: '20px 0 16px', color: '#111' },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid #e0e0e0', marginBottom: 20 },
  tab: { padding: '8px 18px', fontSize: 14, color: '#666', cursor: 'pointer', border: 'none', background: 'none', borderBottom: '2px solid transparent', marginBottom: -1, fontFamily: 'inherit' },
  tabActive: { color: '#111', borderBottom: '2px solid #111', fontWeight: 500 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 10, padding: '12px 8px', textAlign: 'center', border: '1px solid #ebebeb' },
  statN: { fontSize: 22, fontWeight: 600, color: '#111' },
  statL: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 },
}
