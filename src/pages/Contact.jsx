import React, { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="page-wrapper">
      <div className="page-title-section">
        <div className="container">
          <h1>Get in Touch</h1>
          <p className="text-muted">We'd love to hear from you</p>
        </div>
      </div>

      <div className="container contact-page">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Let's Chat ☕</h2>
            <p>Have a question about our sauces? Need help with an order? We're here for you!</p>
            <div className="contact-methods">
              <div className="contact-method"><span>📧</span><div><strong>Email</strong><p>hello@bizysdrizzles.com</p></div></div>
              <div className="contact-method"><span>📞</span><div><strong>Phone</strong><p>+2 0100 123-4567</p></div></div>
            </div>
          </div>

          <div className="card contact-form-wrap">
            {sent ? (
              <div className="text-center" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3>Message Sent!</h3>
                <p className="text-muted">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send a Message</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group"><label>Name</label><input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Subject</label><input type="text" className="form-control" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
                <div className="form-group"><label>Message</label><textarea className="form-control" rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required /></div>
                <button type="submit" className="btn btn-accent">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
