import React from 'react';
import { ShieldCheck, FileCheck2, Wallet } from 'lucide-react';
import Brand from '../components/Brand';

/** Shared split-screen shell for Login and Register */
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-visual" aria-hidden="false">
        <Brand subtitle="Billing Suite" size={38} />

        <div className="auth-copy">
          <h1>
            Get paid faster,
            <br />
            <em>with less paperwork.</em>
          </h1>
          <p>Invoices, GST, payments and reporting in one focused workspace built for growing businesses.</p>

          <ul className="auth-points">
            <li>
              <FileCheck2 size={17} /> Professional, GST-ready invoices in minutes
            </li>
            <li>
              <Wallet size={17} /> Track every payment and outstanding balance
            </li>
            <li>
              <ShieldCheck size={17} /> Role-based access for admins, staff and clients
            </li>
          </ul>
        </div>

        {/* Decorative invoice illustration (no data) */}
        <div className="auth-paper" aria-hidden="true">
          <div className="paper-row head">
            <span className="bar w40" />
            <span className="stamp">Paid</span>
          </div>
          <span className="bar w60" />
          <div className="paper-lines">
            {[78, 64, 71, 52].map((w, i) => (
              <div className="paper-row" key={i}>
                <span className="bar" style={{ width: `${w}%` }} />
                <span className="bar w16" />
              </div>
            ))}
          </div>
          <div className="paper-total">
            <span className="bar w24" />
            <span className="bar w30 strong" />
          </div>
        </div>
      </aside>

      <main className="auth-panel" id="main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
