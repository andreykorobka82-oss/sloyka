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
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import CoffeeMachineInput from './CoffeeMachineInput';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecountPage = ({ user, onLogout }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [beverages, setBeverages] = useState([]);
  const [finalStocks, setFinalStocks] = useState({});
  const [coffeeMachineData, setCoffeeMachineData] = useState({});
  const [recountData, setRecountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideZeroStock, setHideZeroStock] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, beveragesRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/beverages`)
      ]);
      
      setProducts(productsRes.data);
      setBeverages(beveragesRes.data);
      
      const stocks = {};
      const coffeeData = {};
      productsRes.data.forEach(product => {
        stocks[product.id] = product.current_stock;
        if (product.product_type === 'coffee_machine') {
          coffeeData[product.id] = {
            initial_counter: 0,
            final_counter: 0,
            failed_portions: 0,
            beverages_sold: {}
          };
        }
      });
      setFinalStocks(stocks);
      setCoffeeMachineData(coffeeData);
    } catch (error) {
      toast.error('Помилка завантаження даних');
    }
  };

  const handleCoffeeMachineDataChange = (productId, data) => {
    setCoffeeMachineData({
      ...coffeeMachineData,
      [productId]: data
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/recount/generate`, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        final_stocks: finalStocks,
        coffee_machine_data: coffeeMachineData
      });
      setRecountData(response.data);
      toast.success('Звіт згенеровано');
    } catch (error) {
      toast.error('Помилка генерації звіту');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API}/recount/export`, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        final_stocks: finalStocks,
        coffee_machine_data: coffeeMachineData
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recount_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Звіт експортовано');
    } catch (error) {
      toast.error('Помилка експорту звіту');
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
        {/* Input Section */}
        <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-heading)' }}>Параметри переобліку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Початкова дата
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="start-date-picker"
                    >
                      {startDate ? format(startDate, 'PPP', { locale: uk }) : 'Оберіть дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Кінцева дата
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="end-date-picker"
                    >
                      {endDate ? format(endDate, 'PPP', { locale: uk }) : 'Оберіть дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-heading)' }}>
                  Кінцеві залишки товарів
                </h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-zero-input"
                    checked={hideZeroStock}
                    onCheckedChange={setHideZeroStock}
                    data-testid="hide-zero-stock-toggle"
                  />
                  <Label htmlFor="hide-zero-input" className="cursor-pointer text-sm" style={{ color: 'var(--color-text)' }}>
                    Приховати нульові залишки
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(p => p.product_type !== 'coffee_machine')
                  .filter(p => !hideZeroStock || p.current_stock > 0)
                  .map((product) => (
                  <div key={product.id}>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      {product.name} {product.product_type === 'weighted_loss' && <span className="text-xs text-orange-600">(ваг. -15%)</span>}
                    </label>
                    <Input
                      data-testid={`final-stock-${product.id}`}
                      type="number"
                      step="0.01"
                      value={finalStocks[product.id] || 0}
                      onChange={(e) => setFinalStocks({
                        ...finalStocks,
                        [product.id]: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Coffee Machine Products */}
            {products.filter(p => p.product_type === 'coffee_machine').map((product) => (
              <div key={product.id}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-heading)' }}>
                  {product.name} - Кінцевий залишок (кг)
                </h3>
                <Input
                  data-testid={`final-stock-${product.id}`}
                  type="number"
                  step="0.01"
                  value={finalStocks[product.id] || 0}
                  onChange={(e) => setFinalStocks({
                    ...finalStocks,
                    [product.id]: parseFloat(e.target.value) || 0
                  })}
                  className="mb-4 max-w-xs"
                />
                <CoffeeMachineInput
                  product={product}
                  beverages={beverages}
                  machineData={coffeeMachineData[product.id]}
                  onDataChange={handleCoffeeMachineDataChange}
                />
              </div>
            ))}

            <Button
              data-testid="generate-recount-button"
              onClick={handleGenerate}
              className="w-full"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              disabled={loading}
            >
              {loading ? 'Генерація...' : 'Згенерувати звіт'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {recountData && (
          <Card style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle style={{ color: 'var(--color-heading)' }}>
                  Результати переобліку ({formatDate(recountData.start_date)} - {formatDate(recountData.end_date)})
                </CardTitle>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                  Всього товарів: {recountData.products.length}
                </p>
              </div>
              {user.role === 'admin' && (
                <Button
                  data-testid="export-excel-button"
                  onClick={handleExport}
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  Експортувати в Excel
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-6">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: 'var(--color-border)' }}>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Товар</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Категорія</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Початковий залишок</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Кінцевий залишок</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Різниця</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Ціна</TableHead>
                      <TableHead style={{ color: 'var(--color-heading)' }}>Сума продажу</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recountData.products.map((product) => (
                      <>
                        <TableRow key={product.product_id} style={{ borderColor: 'var(--color-border)' }} data-testid={`recount-product-${product.product_id}`}>
                          <TableCell style={{ color: 'var(--color-text)' }}>
                            {product.product_name}
                            {product.product_type === 'weighted_loss' && <span className="ml-2 text-xs text-orange-600">(ваг.)</span>}
                            {product.product_type === 'coffee_machine' && <span className="ml-2 text-xs text-blue-600">(кава)</span>}
                          </TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>{product.category_name}</TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>{product.initial_stock.toFixed(2)}</TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>{product.final_stock.toFixed(2)}</TableCell>
                          <TableCell style={{ color: product.difference < 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                            {product.difference.toFixed(2)}
                          </TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>
                            {product.product_type === 'coffee_machine' && product.coffee_calc_details 
                              ? `${product.coffee_calc_details.price_per_kg} грн/кг`
                              : `${product.price.toFixed(2)} грн`
                            }
                          </TableCell>
                          <TableCell style={{ color: 'var(--color-text)' }}>{product.sale_amount.toFixed(2)} грн</TableCell>
                        </TableRow>
                        {product.coffee_calc_details && product.coffee_calc_details.type === 'coffee_machine' && (
                          <TableRow key={`${product.product_id}-details`} style={{ backgroundColor: '#f9fafb' }}>
                            <TableCell colSpan={7} className="text-xs" style={{ color: 'var(--color-text)' }}>
                              <div className="p-2 space-y-1">
                                <div><strong>Розрахунок кавомашини:</strong></div>
                                <div>• Вага проданої кави: {product.coffee_calc_details.coffee_sold_weight.toFixed(2)} кг</div>
                                <div>• Загальна кількість порцій: {product.coffee_calc_details.total_portions}</div>
                                <div>• Вага на порцію: {product.coffee_calc_details.weight_per_portion.toFixed(4)} кг</div>
                                <div>• Порцій на 1 кг: {product.coffee_calc_details.portions_per_kg.toFixed(2)}</div>
                                <div>• Середня ціна порції: {product.coffee_calc_details.avg_price_per_portion.toFixed(2)} грн</div>
                                <div>• Списано невдалих: {product.coffee_calc_details.failed_portions}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {product.coffee_calc_details && product.coffee_calc_details.type === 'weighted_loss' && (
                          <TableRow key={`${product.product_id}-details`} style={{ backgroundColor: '#fef3c7' }}>
                            <TableCell colSpan={7} className="text-xs" style={{ color: 'var(--color-text)' }}>
                              <div className="p-2">
                                <strong>Ваговий товар:</strong> Продано {product.coffee_calc_details.actual_sold.toFixed(2)} кг, 
                                відходи 15% = {product.coffee_calc_details.waste_15_percent.toFixed(2)} кг
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-4 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card style={{ borderColor: 'var(--color-border)' }}>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-heading)' }}>
                        Продажі по категоріям
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(recountData.categories_sales).map(([category, amount]) => (
                          <div key={category} className="flex justify-between">
                            <span style={{ color: 'var(--color-text)' }}>{category}:</span>
                            <span style={{ color: 'var(--color-text)' }} className="font-semibold">{amount.toFixed(2)} грн</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card style={{ borderColor: 'var(--color-border)' }}>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-heading)' }}>
                        Загальні підсумки
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--color-text)' }}>Загальна виручка:</span>
                          <span style={{ color: 'var(--color-text)' }} className="font-semibold" data-testid="total-revenue">
                            {recountData.total_revenue.toFixed(2)} грн
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--color-text)' }}>Загальна сума продажів:</span>
                          <span style={{ color: 'var(--color-text)' }} className="font-semibold" data-testid="total-sales">
                            {recountData.total_sales.toFixed(2)} грн
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <span className="font-bold" style={{ color: 'var(--color-heading)' }}>Результат переобліку:</span>
                          <span
                            className="font-bold text-lg"
                            style={{ color: recountData.result < 0 ? 'var(--color-danger)' : 'var(--color-accent)' }}
                            data-testid="recount-result"
                          >
                            {recountData.result.toFixed(2)} грн
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecountPage;
