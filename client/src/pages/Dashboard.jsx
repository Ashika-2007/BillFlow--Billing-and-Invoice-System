import StatusBadge from '../components/StatusBadge';
import React, { useEffect, useState } from 'react';

import {
  DollarSign,
  FileText,
  Clock3,
  AlertTriangle,
  Users,
  Package,
  ArrowRight,
  Plus,
  ReceiptText,
  CreditCard,
  UserPlus,
  Sparkles,
  TrendingUp,
  Activity,
  CalendarDays
} from 'lucide-react';

import { Link } from 'react-router-dom';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';


const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);


/* =========================================================
   ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
  value,
  duration = 900
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const numericValue = Number(value) || 0;

    const startTime = performance.now();

    const animate = currentTime => {
      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplay(
        Math.floor(
          numericValue * eased
        )
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <>
      {display.toLocaleString('en-IN')}
    </>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/dashboard/stats')
      .then(response => {
        setData(response.data.data);
      })
      .catch(error => {
        setError(
          error.response?.data?.message ||
          'Unable to load dashboard'
        );
      });

  useEffect(() => {
    load();
  }, []);


  /* =======================================================
     LOADING / ERROR
  ======================================================= */

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setError('');
          load();
        }}
      />
    );
  }

  if (!data) {
    return (
      <LoadingSpinner
        label="Preparing your dashboard..."
      />
    );
  }


  /* =======================================================
     INVOICE STATUS DATA
  ======================================================= */

  const pie = [
    {
      name: 'Paid',
      value: data.paidInvoices
    },
    {
      name: 'Pending',
      value: data.pendingInvoices
    },
    {
      name: 'Overdue',
      value: data.overdueInvoices
    }
  ];

  const pieColors = [
    '#34D399',
    '#FBBF24',
    '#FB7185'
  ];


  const firstName =
    user?.name?.split(' ')[0] || 'there';


  const isClient =
    user?.role === 'CLIENT';

  const canManageBilling =
    user?.role === 'ADMIN' ||
    user?.role === 'STAFF';


  return (
    <div className="dashboard-page">


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="dashboard-hero">

        <div className="hero-glow hero-glow-one" />

        <div className="hero-glow hero-glow-two" />


        <div className="hero-content">

          <div className="hero-small">
            <Sparkles size={13} />
            BILLING OVERVIEW
          </div>


          <h1>
            Good evening,
            <br />

            <span>
              {firstName}.
            </span>
          </h1>


          <p>
            {isClient
              ? "Here's an overview of your invoices, payments and outstanding balance."
              : "Here's your financial snapshot. Everything important, right where you need it."
            }
          </p>


          {/* ================================================
              ROLE BASED HERO ACTIONS
          ================================================ */}

          <div className="hero-actions">

            {canManageBilling && (
              <Link
                to="/invoices/new"
                className="hero-primary"
              >
                <Plus size={17} />
                Create invoice
              </Link>
            )}


            {canManageBilling && (
              <Link
                to="/reports"
                className="hero-secondary"
              >
                <TrendingUp size={16} />
                View analytics
              </Link>
            )}


            {isClient && (
              <Link
                to="/invoices"
                className="hero-primary"
              >
                <ReceiptText size={17} />
                View my invoices
              </Link>
            )}


            {isClient && (
              <Link
                to="/payments"
                className="hero-secondary"
              >
                <CreditCard size={16} />
                View payments
              </Link>
            )}

          </div>

        </div>


        {/* =================================================
            HERO VISUAL
        ================================================= */}

        <div className="hero-visual">

          <div className="floating-orb orb-one" />

          <div className="floating-orb orb-two" />

          <div className="hero-ring ring-one" />

          <div className="hero-ring ring-two" />


          <div className="hero-finance-card">

            <div className="finance-card-top">

              <span>
                <Activity size={13} />
                {isClient
                  ? 'Account'
                  : 'Revenue'
                }
              </span>

              <span className="live-dot">
                LIVE
              </span>

            </div>


            <div className="finance-value">

              {isClient
                ? money(data.outstandingAmount)
                : money(data.totalRevenue)
              }

            </div>


            <div className="finance-label">

              {isClient
                ? 'Outstanding balance'
                : 'Total revenue generated'
              }

            </div>


            <div className="mini-chart">

              <div className="mini-line line-one" />

              <div className="mini-line line-two" />

              <div className="mini-line line-three" />

              <div className="mini-line line-four" />

              <div className="mini-line line-five" />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <section className="dashboard-stats">


        {/* REVENUE */}

        <div className="visual-stat stat-purple">

          <div className="visual-stat-top">

            <div className="visual-stat-icon">
              <DollarSign size={19} />
            </div>

            <span className="stat-tag">
              REVENUE
            </span>

          </div>


          <div className="visual-stat-value">
            {money(data.totalRevenue)}
          </div>


          <div className="visual-stat-bottom">

            <span>
              Total revenue
            </span>

            <TrendingUp size={14} />

          </div>


          <div className="stat-decoration" />

        </div>


        {/* INVOICES */}

        <div className="visual-stat stat-blue">

          <div className="visual-stat-top">

            <div className="visual-stat-icon">
              <FileText size={19} />
            </div>

            <span className="stat-tag">
              INVOICES
            </span>

          </div>


          <div className="visual-stat-value">

            <AnimatedNumber
              value={data.totalInvoices}
            />

          </div>


          <div className="visual-stat-bottom">

            <span>
              Total invoices
            </span>

            <ReceiptText size={14} />

          </div>


          <div className="stat-decoration" />

        </div>


        {/* OUTSTANDING */}

        <div className="visual-stat stat-cyan">

          <div className="visual-stat-top">

            <div className="visual-stat-icon">
              <Clock3 size={19} />
            </div>

            <span className="stat-tag">
              OUTSTANDING
            </span>

          </div>


          <div className="visual-stat-value">

            {money(data.outstandingAmount)}

          </div>


          <div className="visual-stat-bottom">

            <span>
              Awaiting payment
            </span>

            <Clock3 size={14} />

          </div>


          <div className="stat-decoration" />

        </div>


        {/* OVERDUE */}

        <div className="visual-stat stat-coral">

          <div className="visual-stat-top">

            <div className="visual-stat-icon">
              <AlertTriangle size={19} />
            </div>

            <span className="stat-tag">
              ATTENTION
            </span>

          </div>


          <div className="visual-stat-value">

            <AnimatedNumber
              value={data.overdueInvoices}
            />

          </div>


          <div className="visual-stat-bottom">

            <span>
              Overdue invoices
            </span>

            <AlertTriangle size={14} />

          </div>


          <div className="stat-decoration" />

        </div>


        {/* ================================================
            ADMIN / STAFF ONLY
        ================================================ */}

        {!isClient && (
          <>


            {/* CLIENTS */}

            <div className="visual-stat stat-green">

              <div className="visual-stat-top">

                <div className="visual-stat-icon">
                  <Users size={19} />
                </div>

                <span className="stat-tag">
                  CLIENTS
                </span>

              </div>


              <div className="visual-stat-value">

                <AnimatedNumber
                  value={data.totalClients}
                />

              </div>


              <div className="visual-stat-bottom">

                <span>
                  Active customers
                </span>

                <Users size={14} />

              </div>


              <div className="stat-decoration" />

            </div>


            {/* PRODUCTS */}

            <div className="visual-stat stat-orange">

              <div className="visual-stat-top">

                <div className="visual-stat-icon">
                  <Package size={19} />
                </div>

                <span className="stat-tag">
                  PRODUCTS
                </span>

              </div>


              <div className="visual-stat-value">

                <AnimatedNumber
                  value={data.totalProducts}
                />

              </div>


              <div className="visual-stat-bottom">

                <span>
                  Products & services
                </span>

                <Package size={14} />

              </div>


              <div className="stat-decoration" />

            </div>

          </>
        )}

      </section>


      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section className="analytics-grid">


        {/* =================================================
            REVENUE CHART
        ================================================= */}

        <div className="visual-panel revenue-panel">

          <div className="visual-panel-head">

            <div>

              <div className="section-label">
                FINANCIAL PERFORMANCE
              </div>

              <h2>
                Revenue overview
              </h2>

              <p>
                Successful payments across your billing workspace.
              </p>

            </div>


            {canManageBilling && (
              <Link
                to="/reports"
                className="round-arrow"
              >
                <ArrowRight size={17} />
              </Link>
            )}

          </div>


          <div className="revenue-total">

            {money(data.totalRevenue)}

            <span>
              total revenue
            </span>

          </div>


          <div className="big-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={data.revenueByMonth}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}
              >

                <defs>

                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#8B5CF6"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="70%"
                      stopColor="#6366F1"
                      stopOpacity={0.12}
                    />

                    <stop
                      offset="100%"
                      stopColor="#6366F1"
                      stopOpacity={0}
                    />

                  </linearGradient>

                  <filter id="glow">

                    <feGaussianBlur
                      stdDeviation="4"
                      result="coloredBlur"
                    />

                    <feMerge>

                      <feMergeNode
                        in="coloredBlur"
                      />

                      <feMergeNode
                        in="SourceGraphic"
                      />

                    </feMerge>

                  </filter>

                </defs>


                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94A3B8',
                    fontSize: 10
                  }}
                />


                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#94A3B8',
                    fontSize: 9
                  }}
                  tickFormatter={value =>
                    `₹${Math.round(value / 1000)}k`
                  }
                />


                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow:
                      '0 15px 40px rgba(15,23,42,.12)',
                    fontSize: 11
                  }}
                  formatter={value => [
                    money(value),
                    'Revenue'
                  ]}
                />


                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C5CFC"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  filter="url(#glow)"
                  animationDuration={1400}
                  animationEasing="ease-out"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            INVOICE STATUS
        ================================================= */}

        <div className="visual-panel status-panel">

          <div className="visual-panel-head">

            <div>

              <div className="section-label">
                INVOICE HEALTH
              </div>

              <h2>
                Invoice status
              </h2>

              <p>
                Current portfolio breakdown.
              </p>

            </div>

          </div>


          <div className="status-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={pie}
                  dataKey="value"
                  innerRadius={78}
                  outerRadius={105}
                  paddingAngle={5}
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1200}
                >

                  {pie.map(
                    (item, index) => (
                      <Cell
                        key={item.name}
                        fill={pieColors[index]}
                      />
                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>


            <div className="status-center">

              <strong>
                {data.totalInvoices}
              </strong>

              <span>
                TOTAL
              </span>

            </div>

          </div>


          <div className="status-list">

            {pie.map(
              (item, index) => (

                <div
                  className="status-row"
                  key={item.name}
                >

                  <div className="status-name">

                    <i
                      style={{
                        background:
                          pieColors[index]
                      }}
                    />

                    <span>
                      {item.name}
                    </span>

                  </div>


                  <strong>
                    {item.value}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="quick-actions">


        {/* ADMIN / STAFF */}

        {canManageBilling && (
          <Link
            to="/invoices/new"
            className="quick-action purple"
          >

            <div className="quick-action-icon">
              <ReceiptText size={20} />
            </div>

            <div>

              <strong>
                Create invoice
              </strong>

              <span>
                Generate a new bill
              </span>

            </div>

            <ArrowRight size={17} />

          </Link>
        )}


        {canManageBilling && (
          <Link
            to="/clients"
            className="quick-action blue"
          >

            <div className="quick-action-icon">
              <UserPlus size={20} />
            </div>

            <div>

              <strong>
                Add client
              </strong>

              <span>
                Add a new customer
              </span>

            </div>

            <ArrowRight size={17} />

          </Link>
        )}


        {/* CLIENT / EVERYONE */}

        <Link
          to="/payments"
          className="quick-action green"
        >

          <div className="quick-action-icon">
            <CreditCard size={20} />
          </div>

          <div>

            <strong>
              Payments
            </strong>

            <span>
              Track recent payments
            </span>

          </div>

          <ArrowRight size={17} />

        </Link>


        {isClient && (
          <Link
            to="/invoices"
            className="quick-action purple"
          >

            <div className="quick-action-icon">
              <ReceiptText size={20} />
            </div>

            <div>

              <strong>
                My invoices
              </strong>

              <span>
                View your billing history
              </span>

            </div>

            <ArrowRight size={17} />

          </Link>
        )}

      </section>


      {/* =====================================================
          RECENT INVOICES
      ===================================================== */}

      <section className="visual-panel recent-panel">


        <div className="visual-panel-head">

          <div>

            <div className="section-label">
              RECENT ACTIVITY
            </div>

            <h2>
              Recent invoices
            </h2>

            <p>
              {isClient
                ? 'Your latest billing activity.'
                : 'Latest billing activity across your workspace.'
              }
            </p>

          </div>


          <Link
            to="/invoices"
            className="view-all"
          >
            View all

            <ArrowRight size={15} />

          </Link>

        </div>


        <div className="table-wrap">

          <table className="premium-table">

            <thead>

              <tr>

                <th>
                  Invoice
                </th>

                <th>
                  Client
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Status
                </th>

                <th>
                  Due date
                </th>

              </tr>

            </thead>


            <tbody>

              {data.recentInvoices.length > 0 ? (

                data.recentInvoices.map(
                  (invoice, index) => (

                    <tr
                      key={invoice._id}
                      className="animated-row"
                      style={{
                        animationDelay:
                          `${index * 70}ms`
                      }}
                    >

                      <td>

                        <Link
                          className="invoice-id"
                          to={`/invoices/${invoice._id}`}
                        >

                          <span className="invoice-icon">

                            <ReceiptText
                              size={14}
                            />

                          </span>

                          {invoice.invoiceNumber}

                        </Link>

                      </td>


                      <td>

                        <div className="client-cell">

                          <span className="client-avatar">

                            {(
                              invoice.client
                                ?.companyName ||
                              invoice.client?.name ||
                              'C'
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </span>


                          <span>

                            {
                              invoice.client
                                ?.companyName ||
                              invoice.client?.name
                            }

                          </span>

                        </div>

                      </td>


                      <td>

                        <strong className="amount">

                          {money(
                            invoice.totalAmount
                          )}

                        </strong>

                      </td>


                      <td>

                        <StatusBadge
                          status={
                            invoice.status
                          }
                        />

                      </td>


                      <td>

                        <div className="date-cell">

                          <CalendarDays
                            size={13}
                          />

                          {new Date(
                            invoice.dueDate
                          ).toLocaleDateString(
                            'en-IN'
                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="dashboard-empty"
                  >

                    <ReceiptText
                      size={30}
                    />

                    <span>
                      No recent invoices yet.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}