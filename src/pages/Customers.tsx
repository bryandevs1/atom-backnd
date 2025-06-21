import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Badge from '../components/ui/badge/Badge';
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import Input from "../components/form/input/InputField";
import Select from '../components/form/Select';

interface Payout {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  payment_details: string;
  created_at: string;
  processed_at: string | null;
}

interface Balance {
  available: number;
  pending: number;
}

export default function PayoutHistory() {
  const { token } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState<Balance>({ available: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    payment_details: ''
  });
  const [formErrors, setFormErrors] = useState({
    amount: '',
    payment_details: ''
  });

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const [payoutsResponse, balanceResponse] = await Promise.all([
        axios.get('https://nexodus.tech/api/vendor/payouts', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('https://nexodus.tech/api/vendor/balance', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
  
      const payoutsData = payoutsResponse.data.data.payouts || [];
      const balanceData = balanceResponse.data.data;
  
      setPayouts(payoutsData);
      setBalance({
        available: balanceData.available_balance,
        pending: balanceData.pending_balance
      });
      
    } catch (err) {
      setError('Failed to fetch payout history');
      console.error('Error fetching payouts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPayouts();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      amount: '',
      payment_details: ''
    };

    if (!formData.amount || isNaN(Number(formData.amount))) {
      newErrors.amount = 'Please enter a valid amount';
      valid = false;
    } else if (Number(formData.amount) > balance.available) {
      newErrors.amount = 'Amount exceeds available balance';
      valid = false;
    }

    if (!formData.payment_details) {
      newErrors.payment_details = 'Payment details are required';
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        'https://nexodus.tech/api/vendor/payouts/request',
        {
          ...formData,
          amount: Number(formData.amount),
        },        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchPayouts();
      setIsModalOpen(false);
      setFormData({
        amount: '',
        payment_method: 'bank_transfer',
        payment_details: ''
      });
    } catch (err) {
      console.error('Error requesting payout:', err);
      setError('Failed to submit payout request');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div>Loading payout history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Payout History</h2>
          <div className="flex items-center mt-2 space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Available: <span className="font-medium text-green-600 dark:text-green-400">${balance?.available?.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Pending: <span className="font-medium text-yellow-600 dark:text-yellow-400">${balance?.pending?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Request Payout
        </Button>
      </div>

      {/* Updated Payout History Table */}
      <div className="overflow-hidden">
        <div className="max-w-full px-5 overflow-x-auto sm:px-6">
          <Table>
            <TableHeader className="border-gray-100 border-y dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Payment Method
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Request Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                >
                  Processed Date
                </TableCell>

              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {payouts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No payout history found
                  </TableCell>
                </TableRow>
              )}
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                    #{payout.id}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    ${payout.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    {payout.payment_method?.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusBadgeColor(payout.status)}
                    >
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                    {formatDate(payout.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
                    {payout.processed_at ? formatDate(payout.processed_at) : '-'}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Request Payout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Payout"
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Available Balance: ${balance?.available?.toFixed(2)}
              </label>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                max={balance.available}
              />
              {formErrors.amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
              )}
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <Select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div>
              <label htmlFor="payment_details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Details
              </label>
              <Input
                type="text"
                id="payment_details"
                name="payment_details"
                value={formData.payment_details}
                onChange={handleInputChange}
                placeholder="Account number, PayPal email, etc."
              />
              {formErrors.payment_details && (
                <p className="mt-1 text-sm text-red-600">{formErrors.payment_details}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Submit Request
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}