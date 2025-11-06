import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navigation from './Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RevenuePage = ({ user, onLogout }) => {
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [editRevenue, setEditRevenue] = useState(null);
  const [editDate, setEditDate] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, date: '' });

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async () => {
    try {
      const response = await axios.get(`${API}/revenues`);
      setRevenues(response.data);
    } catch (error) {
      toast.error('Помилка завантаження виручок');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/revenues`, {
        date: selectedDate.toISOString(),
        amount: parseFloat(amount),
        user_id: user.id
      });
      toast.success('Виручку додано');
      setAmount('');
      fetchRevenues();
    } catch (error) {
      toast.error('Помилка додавання виручки');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/revenues/${editRevenue.id}`, {
        date: editDate.toISOString(),
        amount: parseFloat(editAmount)
      });
      toast.success('Виручку оновлено');
      setEditRevenue(null);
      fetchRevenues();
    } catch (error) {
      toast.error('Помилка оновлення');
    }
  };

  const handleDelete = (revenueId, revenueDate) => {
    setDeleteDialog({ open: true, id: revenueId, date: revenueDate });
  };

  const confirmDelete = async () => {
    const { id } = deleteDialog;
    setDeleteDialog({ open: false, id: null, date: '' });
    
    try {
      await axios.delete(`${API}/revenues/${id}`);
      toast.success('Виручку видалено');
      fetchRevenues();
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Revenue Form */}
          <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-heading)' }}>Додати виручку</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Дата
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        data-testid="revenue-date-picker"
                      >
                        {selectedDate ? format(selectedDate, 'PPP', { locale: uk }) : 'Оберіть дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Сума (грн)
                  </label>
                  <Input
                    data-testid="revenue-amount-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Введіть суму"
                    required
                  />
                </div>

                <Button
                  data-testid="submit-revenue-button"
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  Додати виручку
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Revenue List */}
          <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-heading)' }}>Історія виручок</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8" style={{ color: 'var(--color-text)' }}>Завантаження...</div>
              ) : revenues.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--color-text)' }} data-testid="no-revenues-message">
                  Немає виручок
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: 'var(--color-border)' }}>
                        <TableHead style={{ color: 'var(--color-heading)' }}>Дата</TableHead>
                        <TableHead style={{ color: 'var(--color-heading)' }}>Сума</TableHead>
                        <TableHead style={{ color: 'var(--color-heading)' }}>Користувач</TableHead>
                        {user.role === 'admin' && <TableHead style={{ color: 'var(--color-heading)' }}>Дії</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenues.map((revenue) => (
                        <TableRow key={revenue.id} style={{ borderColor: 'var(--color-border)' }} data-testid={`revenue-row-${revenue.id}`}>
                          <TableCell style={{ color: 'var(--color-text)' }}>{formatDate(revenue.date)}</TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }} data-testid={`revenue-amount-${revenue.id}`}>{revenue.amount.toFixed(2)} грн</TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>{revenue.user_name}</TableCell>
                          {user.role === 'admin' && (
                            <TableCell className="space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditRevenue(revenue);
                                      setEditDate(new Date(revenue.date));
                                      setEditAmount(revenue.amount.toString());
                                    }}
                                    data-testid={`edit-revenue-${revenue.id}`}
                                  >
                                    Редагувати
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Редагувати виручку</DialogTitle>
                                  </DialogHeader>
                                  {editRevenue && (
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-2">Дата</label>
                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                              {editDate ? format(editDate, 'PPP', { locale: uk }) : 'Оберіть дату'}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0">
                                            <Calendar
                                              mode="single"
                                              selected={editDate}
                                              onSelect={setEditDate}
                                              initialFocus
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-2">Сума</label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={editAmount}
                                          onChange={(e) => setEditAmount(e.target.value)}
                                          required
                                        />
                                      </div>
                                      <Button type="submit" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                                        Зберегти
                                      </Button>
                                    </form>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(revenue.id, formatDate(revenue.date))}
                                data-testid={`delete-revenue-${revenue.id}`}
                              >
                                Видалити
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;