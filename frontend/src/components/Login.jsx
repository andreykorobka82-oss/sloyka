import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pin.length !== 4) {
      toast.error('ПІН-код повинен містити 4 цифри');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { pin });
      toast.success(response.data.message);
      onLogin(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <Card className="w-full max-w-md shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }}>
        <CardHeader className="text-center pb-8">
          <div className="mb-4">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold" style={{ color: 'var(--color-heading)' }}>Слойка</CardTitle>
          <CardDescription className="text-base mt-2" style={{ color: 'var(--color-text)' }}>Облік запасів товарів</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Введіть ПІН-код
              </label>
              <Input
                data-testid="pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handlePinChange}
                placeholder="••••"
                className="text-center text-2xl tracking-widest h-14"
                style={{ borderColor: 'var(--color-border)' }}
                required
              />
            </div>
            <Button
              data-testid="login-button"
              type="submit"
              className="w-full h-12 text-base font-semibold"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              disabled={loading || pin.length !== 4}
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;