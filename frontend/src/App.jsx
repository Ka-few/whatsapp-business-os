import React, { useEffect, useMemo, useState } from 'react';
import { createItem, deleteItem, fetchCollection, fetchDashboardSummary, updateItem } from './services/api';

const fallbackStats = [
  { label: 'Today appointments', value: '—' },
  { label: 'Revenue today', value: '—' },
  { label: 'Pending bookings', value: '—' },
  { label: 'New customers', value: '—' },
];

const collectionSchemas = {
  appointments: {
    title: 'Appointments',
    description: 'Create and manage salon bookings from one place.',
    fields: [
      { key: 'customerName', label: 'Customer', type: 'text' },
      { key: 'service', label: 'Service', type: 'text' },
      { key: 'stylist', label: 'Stylist', type: 'text' },
      { key: 'time', label: 'Time', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'cancelled'] },
      { key: 'paymentMethod', label: 'Payment method', type: 'select', options: ['Cash', 'M-Pesa', 'Card'] },
      { key: 'paymentStatus', label: 'Payment status', type: 'select', options: ['pending', 'paid', 'refunded'] },
      { key: 'revenue', label: 'Revenue (KES)', type: 'number' },
    ],
    renderSummary: (item) => {
      const paymentLabel = item.paymentStatus === 'pending' && item.paymentMethod === 'Cash'
        ? 'pending (pay when visiting)'
        : item.paymentStatus || 'pending';

      return (
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white">{item.customerName || item.phoneNumber || 'Guest'}</p>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300' : item.status === 'pending' ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>
            {item.status || 'pending'}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">{item.service || 'Service'} • {item.stylist || 'Stylist'} • {item.time || 'TBD'}</p>
        <p className="mt-1 text-sm text-slate-500">{item.phoneNumber || item.phone || 'No contact yet'} • KES {item.revenue || 0}</p>
        <p className="mt-1 text-sm text-slate-400">{item.paymentMethod || 'Cash'} payment: {paymentLabel}</p>
        {item.source ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-pink-300">Source: {item.source}</p> : null}
      </div>
      );
    },
  },
  customers: {
    title: 'Customers',
    description: 'Keep customer contact details and notes in sync.',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'text' },
    ],
    renderSummary: (item) => (
      <div>
        <p className="font-medium text-white">{item.name}</p>
        <p className="text-sm text-slate-400">{item.phone} • {item.notes || 'No notes yet'}</p>
      </div>
    ),
  },
  services: {
    title: 'Services',
    description: 'Add and price the services your team offers.',
    fields: [
      { key: 'name', label: 'Service name', type: 'text' },
      { key: 'price', label: 'Price (KES)', type: 'number' },
      { key: 'duration', label: 'Duration', type: 'text' },
    ],
    renderSummary: (item) => (
      <div>
        <p className="font-medium text-white">{item.name}</p>
        <p className="text-sm text-slate-400">KES {item.price} • {item.duration || 'Duration TBD'}</p>
      </div>
    ),
  },
  stylists: {
    title: 'Stylists',
    description: 'Manage the team roster and their specialties.',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'specialty', label: 'Specialty', type: 'text' },
    ],
    renderSummary: (item) => (
      <div>
        <p className="font-medium text-white">{item.name}</p>
        <p className="text-sm text-slate-400">{item.specialty || 'Add a specialty'}</p>
      </div>
    ),
  },
  payments: {
    title: 'Payments',
    description: 'Track payments and keep your revenue view current.',
    fields: [
      { key: 'customerName', label: 'Customer', type: 'text' },
      { key: 'amount', label: 'Amount (KES)', type: 'number' },
      { key: 'method', label: 'Method', type: 'select', options: ['Cash', 'M-Pesa', 'Card'] },
      { key: 'status', label: 'Status', type: 'select', options: ['paid', 'pending', 'refunded'] },
    ],
    renderSummary: (item) => (
      <div>
        <p className="font-medium text-white">{item.customerName}</p>
        <p className="text-sm text-slate-400">KES {item.amount} • {item.method || 'Cash'} • {item.status}</p>
      </div>
    ),
  },
};

function getDefaultValues(collection) {
  switch (collection) {
    case 'appointments':
      return { customerName: '', service: '', stylist: '', time: '', status: 'pending', paymentMethod: 'Cash', paymentStatus: 'pending', revenue: '' };
    case 'customers':
      return { name: '', phone: '', notes: '' };
    case 'services':
      return { name: '', price: '', duration: '' };
    case 'stylists':
      return { name: '', specialty: '' };
    case 'payments':
      return { customerName: '', amount: '', method: 'Cash', status: 'paid' };
    default:
      return {};
  }
}

function validateCollectionValues(collection, values) {
  const nextErrors = {};

  if (collection === 'appointments') {
    if (!values.customerName?.trim()) nextErrors.customerName = 'Customer is required';
    if (!values.service?.trim()) nextErrors.service = 'Service is required';
    if (!values.stylist?.trim()) nextErrors.stylist = 'Stylist is required';
    if (!values.time?.trim()) nextErrors.time = 'Time is required';
    if (values.revenue !== '' && Number(values.revenue) < 0) nextErrors.revenue = 'Revenue cannot be negative';
  }

  if (collection === 'customers') {
    if (!values.name?.trim()) nextErrors.name = 'Customer name is required';
    if (!values.phone?.trim()) nextErrors.phone = 'Phone number is required';
  }

  if (collection === 'services') {
    if (!values.name?.trim()) nextErrors.name = 'Service name is required';
    if (!values.price || Number(values.price) <= 0) nextErrors.price = 'Price must be greater than zero';
  }

  if (collection === 'stylists') {
    if (!values.name?.trim()) nextErrors.name = 'Stylist name is required';
    if (!values.specialty?.trim()) nextErrors.specialty = 'Specialty is required';
  }

  if (collection === 'payments') {
    if (!values.customerName?.trim()) nextErrors.customerName = 'Customer is required';
    if (!values.amount || Number(values.amount) <= 0) nextErrors.amount = 'Amount must be greater than zero';
  }

  return nextErrors;
}

export default function App() {
  const [stats, setStats] = useState(fallbackStats);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [itemsByCollection, setItemsByCollection] = useState({
    appointments: [],
    customers: [],
    services: [],
    stylists: [],
    payments: [],
  });
  const [formValues, setFormValues] = useState({
    appointments: getDefaultValues('appointments'),
    customers: getDefaultValues('customers'),
    services: getDefaultValues('services'),
    stylists: getDefaultValues('stylists'),
    payments: getDefaultValues('payments'),
  });
  const [editingId, setEditingId] = useState(null);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const [summary, appointments] = await Promise.all([
          fetchDashboardSummary(),
          fetchCollection('appointments'),
        ]);
        if (!isMounted) return;

        setStats([
          { label: 'Today appointments', value: summary.todayAppointments },
          { label: 'Revenue today', value: `KES ${summary.revenueToday}` },
          { label: 'Pending bookings', value: summary.pendingBookings },
          { label: 'New customers', value: summary.newCustomers },
        ]);
        setItemsByCollection((prev) => ({ ...prev, appointments: appointments || [] }));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshDashboard() {
    try {
      const summary = await fetchDashboardSummary();
      setStats([
        { label: 'Today appointments', value: summary.todayAppointments },
        { label: 'Revenue today', value: `KES ${summary.revenueToday}` },
        { label: 'Pending bookings', value: summary.pendingBookings },
        { label: 'New customers', value: summary.newCustomers },
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (activeView === 'dashboard') {
      return;
    }

    loadCollection(activeView);
  }, [activeView]);

  async function loadCollection(collection) {
    setLoadingCollection(collection);
    try {
      const items = await fetchCollection(collection);
      setItemsByCollection((prev) => ({ ...prev, [collection]: items || [] }));
      setFeedback('');
    } catch (error) {
      setFeedback(error.message || 'Unable to load records');
    } finally {
      setLoadingCollection(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setErrors({});
    setFormValues((prev) => ({ ...prev, [activeView]: getDefaultValues(activeView) }));
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [activeView]: { ...prev[activeView], [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validateForm() {
    const nextErrors = validateCollectionValues(activeView, formValues[activeView]);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      setFeedback('Please fix the highlighted fields');
      return;
    }

    const payload = { ...formValues[activeView] };
    if (payload.price) payload.price = Number(payload.price);
    if (payload.amount) payload.amount = Number(payload.amount);
    if (payload.revenue) payload.revenue = Number(payload.revenue);

    try {
      let savedItem;
      if (editingId) {
        savedItem = await updateItem(activeView, editingId, payload);
        setItemsByCollection((prev) => ({
          ...prev,
          [activeView]: prev[activeView].map((item) => (item.id === editingId ? savedItem : item)),
        }));
        setFeedback('Record updated');
      } else {
        savedItem = await createItem(activeView, payload);
        setItemsByCollection((prev) => ({ ...prev, [activeView]: [savedItem, ...prev[activeView]] }));
        setFeedback('Record added');
      }

      await refreshDashboard();
      resetForm();
    } catch (error) {
      setFeedback(error.message || 'Unable to save record');
    }
  }

  async function handleDelete(collection, id) {
    try {
      await deleteItem(collection, id);
      setItemsByCollection((prev) => ({ ...prev, [collection]: prev[collection].filter((item) => item.id !== id) }));
      setFeedback('Record deleted');
      await refreshDashboard();
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFeedback(error.message || 'Unable to delete record');
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setFormValues((prev) => ({ ...prev, [activeView]: { ...item } }));
  }

  const currentSchema = collectionSchemas[activeView];
  const currentItems = useMemo(() => {
    const items = itemsByCollection[activeView] || [];
    const query = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = !query || JSON.stringify(item).toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [activeView, itemsByCollection, searchText, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:flex-row">
        <aside className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:w-72">
          <h1 className="text-2xl font-semibold">Glow Salon CRM</h1>
          <p className="mt-2 text-sm text-slate-400">WhatsApp-first salon operations</p>
          <nav className="mt-8 space-y-2 text-sm">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'customers', label: 'Customers' },
              { id: 'services', label: 'Services' },
              { id: 'stylists', label: 'Stylists' },
              { id: 'payments', label: 'Payments' },
            ].map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/70'}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-400">MVP dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold">{activeView === 'dashboard' ? 'Welcome back, salon manager' : collectionSchemas[activeView]?.title || 'Records'}</h2>
            <p className="mt-3 text-slate-400">{activeView === 'dashboard' ? 'Track bookings, payments, and customer conversations from one place.' : currentSchema?.description}</p>
          </header>

          {activeView === 'dashboard' ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{loading ? '…' : item.value}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-xl font-semibold">Upcoming appointments</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {itemsByCollection.appointments.slice(0, 4).map((appointment) => (
                    <li key={appointment.id} className="flex flex-col gap-2 rounded-xl bg-slate-800 px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-white">{appointment.customerName || appointment.phoneNumber || 'Guest'}</p>
                        <p className="text-sm text-slate-400">{appointment.service || 'Service'} • {appointment.stylist || 'Stylist'} • {appointment.time || 'TBD'}</p>
                      </div>
                      <div className="text-sm text-slate-400">
                        <p>{appointment.phoneNumber || appointment.phone || 'No contact yet'}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-pink-300">{appointment.status || 'pending'}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {appointment.paymentMethod || 'Cash'}: {appointment.paymentStatus === 'pending' && appointment.paymentMethod === 'Cash' ? 'pending pay on visit' : appointment.paymentStatus || 'pending'}
                        </p>
                        {appointment.source ? <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{appointment.source}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentSchema?.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{currentSchema?.description}</p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {editingId ? 'Cancel edit' : 'Reset form'}
                </button>
              </div>

              {feedback ? <p className="mt-4 rounded-lg border border-pink-500/20 bg-pink-500/10 px-3 py-2 text-sm text-pink-300">{feedback}</p> : null}

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                {currentSchema?.fields.map((field) => {
                  if (field.type === 'select') {
                    return (
                      <label key={field.key} className="flex flex-col gap-2 text-sm text-slate-300">
                        <span>{field.label}</span>
                        <select
                          name={field.key}
                          value={formValues[activeView][field.key] || ''}
                          onChange={handleInputChange}
                          className={`rounded-lg border bg-slate-950 px-3 py-2 ${errors[field.key] ? 'border-rose-500' : 'border-slate-700'}`}
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors[field.key] ? <span className="text-xs text-rose-300">{errors[field.key]}</span> : null}
                      </label>
                    );
                  }

                  return (
                    <label key={field.key} className="flex flex-col gap-2 text-sm text-slate-300">
                      <span>{field.label}</span>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        name={field.key}
                        value={formValues[activeView][field.key] || ''}
                        onChange={handleInputChange}
                        className={`rounded-lg border bg-slate-950 px-3 py-2 ${errors[field.key] ? 'border-rose-500' : 'border-slate-700'}`}
                      />
                      {errors[field.key] ? <span className="text-xs text-rose-300">{errors[field.key]}</span> : null}
                    </label>
                  );
                })}

                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 font-medium text-white hover:bg-pink-600">
                    {editingId ? 'Update record' : `Add ${activeView.slice(0, -1)}`}
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder={`Search ${activeView}...`}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                />
                {activeView === 'appointments' || activeView === 'payments' ? (
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                ) : null}
              </div>

              <div className="mt-6 space-y-3">
                {loadingCollection ? (
                  <p className="text-sm text-slate-400">Loading {activeView}…</p>
                ) : currentItems.length === 0 ? (
                  <p className="text-sm text-slate-400">No {activeView} match your criteria right now.</p>
                ) : (
                  currentItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between">
                      {currentSchema?.renderSummary(item)}
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(activeView, item.id)} className="rounded-lg border border-rose-700 px-3 py-2 text-sm text-rose-300 hover:bg-rose-900/30">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
