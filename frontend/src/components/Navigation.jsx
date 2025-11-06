import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    backgroundColor: isActive(path) ? 'var(--color-accent)' : 'transparent',
    color: isActive(path) ? 'white' : 'var(--color-text)',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s, color 0.2s',
  });

  return (
    <nav className="shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: `1px solid var(--color-border)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            <Link to="/dashboard">
              <h1 className="text-xl font-bold mr-6" style={{ color: 'var(--color-heading)' }}>Слойка</h1>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" style={navLinkStyle('/dashboard')} data-testid="nav-dashboard">
                Головна
              </Button>
            </Link>
            <Link to="/income">
              <Button variant="ghost" style={navLinkStyle('/income')} data-testid="nav-income">
                Надходження
              </Button>
            </Link>
            <Link to="/expense">
              <Button variant="ghost" style={navLinkStyle('/expense')} data-testid="nav-expense">
                Списання
              </Button>
            </Link>
            <Link to="/income-archive">
              <Button variant="ghost" style={navLinkStyle('/income-archive')} data-testid="nav-income-archive">
                Архів надходжень
              </Button>
            </Link>
            <Link to="/expense-archive">
              <Button variant="ghost" style={navLinkStyle('/expense-archive')} data-testid="nav-expense-archive">
                Архів списань
              </Button>
            </Link>
            <Link to="/revenue">
              <Button variant="ghost" style={navLinkStyle('/revenue')} data-testid="nav-revenue">
                Виручка
              </Button>
            </Link>
            <Link to="/recount">
              <Button variant="ghost" style={navLinkStyle('/recount')} data-testid="nav-recount">
                Переоблік
              </Button>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" style={navLinkStyle('/admin')} data-testid="nav-admin">
                  Адмін-панель
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm" style={{ color: 'var(--color-text)' }} data-testid="user-name">{user?.name}</span>
            <Button
              data-testid="logout-button"
              onClick={onLogout}
              variant="outline"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              className="hover:bg-red-50"
            >
              Вийти
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;