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
        throw new Error(data?.message || '????? ??? ?? ??? ????? ??.');
      }

      setStatus('success');
      setMessage(data?.message || '??????? ??? ??? ??.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : '????? ??? ?? ??? ????? ??.'
      );
    }
  };

  return (
    <section className="contact-panel">
      <div className="contact-panel__title">??????? ?????? ? ??? ??????</div>
      <p className="status">
        ??? ??? ?? ????? ???? ?? ??? ??????? ?? ?? ?? ??? ???? ?????.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__grid">
          <div className="field">
            <label htmlFor="name">??? ? ??? ????????</label>
            <input id="name" name="name" placeholder="????: ???? ?????" required />
          </div>
          <div className="field">
            <label htmlFor="phone">????? ????</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="????: ???????????"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">?????</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
            />
          </div>
          <div className="field">
            <label htmlFor="topic">?????</label>
            <input id="topic" name="topic" placeholder="?????? ???????" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">???? ???</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="???? ??? ?? ????? ????..."
            required
          />
        </div>
        <div className="contact-form__actions">
          <button className="button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? '?? ??? ?????...' : '????? ???????'}
          </button>
          {message ? <span className="status">{message}</span> : null}
        </div>
      </form>
    </section>
  );
}
