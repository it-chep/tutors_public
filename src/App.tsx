import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { LegalDocumentsPage } from './pages/legalDocuments';
import { LegalInfoPage } from './pages/legalInfo';
import './App.css';

const navigation = [
  { to: '/info', label: 'Юридическая информация' },
  { to: '/documents', label: 'Документы' },
];

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <nav className="app__navigation" aria-label="Основная навигация">
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                className={({ isActive }) => `app__navigation-link${isActive ? ' app__navigation-link--active' : ''}`}
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app__main">
        <Routes>
          <Route path="/info" element={<LegalInfoPage />} />
          <Route path="/documents" element={<LegalDocumentsPage />} />
          <Route path="/" element={<Navigate to="/info" replace />} />
          <Route path="*" element={<Navigate to="/info" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
