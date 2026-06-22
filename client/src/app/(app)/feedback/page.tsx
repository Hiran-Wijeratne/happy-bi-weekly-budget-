'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TYPES = [
  { value: 'love',    label: 'I love it!',      emoji: '❤️' },
  { value: 'feature', label: 'Feature request', emoji: '✨' },
  { value: 'bug',     label: 'Bug report',       emoji: '🐛' },
  { value: 'general', label: 'General feedback', emoji: '💬' },
];

export default function FeedbackPage() {
  const [type,    setType]    = useState('');
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [done,    setDone]    = useState(false);

  const submit = useMutation({
    mutationFn: () => apiFetch('/feedback', {
      method: 'POST',
      body: JSON.stringify({ type, rating: rating || undefined, message }),
    }),
    onSuccess: () => setDone(true),
  });

  if (done) {
    return (
      <div>
        <Header title="Feedback" />
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-in">🌿</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you so much!</h2>
          <p className="text-gray-500 text-sm text-center max-w-xs">
            Your feedback helps us make Happy BudgetFlow better for everyone. We read every single submission.
          </p>
          <button
            onClick={() => { setDone(false); setType(''); setRating(0); setMessage(''); }}
            className="mt-6 text-sm font-medium hover:underline"
            style={{ color: '#2e7d52' }}
          >
            Submit another →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Feedback" subtitle="Help us improve Happy BudgetFlow" />

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Left column */}
          <div className="space-y-5">

            {/* Type */}
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-3">What kind of feedback is this?</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      type === t.value
                        ? 'border-[#2e7d52] text-[#2e7d52]'
                        : 'bg-white border-[#e8e3d8] text-[#6a7e6a] hover:border-[#2e7d52] hover:text-[#2e7d52]'
                    }`}
                    style={type === t.value ? { background: '#edf6f0' } : {}}
                  >
                    <span className="text-base">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Star rating */}
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-3">How would you rate your experience?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                    className="text-3xl transition-transform hover:scale-110 active:scale-95"
                  >
                    <span className={(hovered || rating) >= n ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {['', 'Needs work', 'Could be better', 'Pretty good', 'Really like it', 'Love it! ❤️'][rating]}
                </p>
              )}
            </Card>

          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Message */}
            <Card>
              <p className="text-sm font-semibold text-gray-700 mb-3">Tell us more</p>
              <textarea
                rows={7}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What's on your mind? The more detail, the better we can help…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#2e7d52' } as React.CSSProperties}
              />
            </Card>

            <Button
              className="w-full"
              disabled={!type || !message.trim()}
              loading={submit.isPending}
              onClick={() => submit.mutate()}
            >
              Send feedback
            </Button>

            {submit.isError && (
              <p className="text-sm text-red-600 text-center">Something went wrong — please try again.</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
