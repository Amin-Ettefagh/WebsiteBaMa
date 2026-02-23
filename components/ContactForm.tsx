'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setMessage(data?.message || 'Thanks! Your request has been received.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <section className="contact-panel">
      <div className="contact-panel__title">Request a Consultation</div>
      <p className="status">
        Tell us about your project and we will get back to you within one business day.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__grid">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" placeholder="e.g. Jordan Smith" required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. +1 555 000 0000"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <input id="topic" name="topic" placeholder="Website redesign" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">Project details</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Share your goals, timeline, and budget..."
            required
          />
        </div>
        <div className="contact-form__actions">
          <button className="button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send request'}
          </button>
          {message ? <span className="status">{message}</span> : null}
        </div>
      </form>
    </section>
  );
}
