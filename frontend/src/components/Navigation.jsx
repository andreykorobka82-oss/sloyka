import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const navLinks = [
    { to: '/dashboard', label: 'Головна', testid: 'nav-dashboard' },
    { to: '/income', label: 'Надходження', testid: 'nav-income' },
    { to: '/expense', label: 'Списання', testid: 'nav-expense' },
    { to: '/income-archive', label: 'Архів надх.', testid: 'nav-income-archive' },
    { to: '/expense-archive', label: 'Архів спис.', testid: 'nav-expense-archive' },
    { to: '/revenue', label: 'Виручка', testid: 'nav-revenue' },
    { to: '/recount', label: 'Переоблік', testid: 'nav-recount' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Адмін-панель', testid: 'nav-admin' });
  }

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: `1px solid var(--color-border)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard">
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-heading)' }}>Слойка</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" style={navLinkStyle(link.to)} data-testid={link.testid}>
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop User Info */}
          <div className="hidden lg:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="mobile-menu-button"
            style={{ color: 'var(--color-text)' }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={handleLinkClick}>
                <Button 
                  variant="ghost" 
                  style={navLinkStyle(link.to)} 
                  data-testid={link.testid}
                  className="w-full text-left justify-start"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            
            {/* Mobile User Info */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm px-4" style={{ color: 'var(--color-text)' }}>{user?.name}</span>
                <Button
                  data-testid="logout-button-mobile"
                  onClick={() => {
                    handleLinkClick();
                    onLogout();
                  }}
                  variant="outline"
                  size="sm"
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                >
                  Вийти
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;