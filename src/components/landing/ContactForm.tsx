'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormState {
  subject: string;
  message: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });
  const [touched, setTouched] = useState<{ subject: boolean; message: boolean }>({
    subject: false,
    message: false,
  });

  // Validation
  const errors = {
    subject:
      touched.subject && formData.subject.length < 3
        ? 'Minimum 3 characters'
        : touched.subject && formData.subject.length > 200
        ? 'Maximum 200 characters'
        : null,
    message:
      touched.message && formData.message.length < 10
        ? 'Minimum 10 characters'
        : touched.message && formData.message.length > 5000
        ? 'Maximum 5000 characters'
        : null,
  };

  const isValid = formData.subject.length >= 3 &&
                  formData.subject.length <= 200 &&
                  formData.message.length >= 10 &&
                  formData.message.length <= 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setTouched({ subject: true, message: true });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json() as { error?: string };

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully.'
        });
        setFormData({ subject: '', message: '' });
        setTouched({ subject: false, message: false });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus({ type: 'idle' });
        }, 5000);
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send message'
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject Field */}
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          onBlur={() => setTouched({ ...touched, subject: true })}
          disabled={status.type === 'loading'}
          placeholder="Question about the app"
          className={`
            w-full px-4 py-3.5 rounded-xl
            bg-white border-2
            ${errors.subject
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 focus:border-blue-500'
            }
            text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-500/10
            disabled:bg-gray-50 disabled:cursor-not-allowed
            text-base
          `}
        />
        <AnimatePresence>
          {errors.subject && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.subject}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Message Field */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          onBlur={() => setTouched({ ...touched, message: true })}
          disabled={status.type === 'loading'}
          placeholder="Describe your question or suggestion..."
          className={`
            w-full px-4 py-3.5 rounded-xl
            bg-white border-2
            ${errors.message
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 focus:border-blue-500'
            }
            text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-500/10
            disabled:bg-gray-50 disabled:cursor-not-allowed
            text-base resize-none
          `}
        />
        <div className="mt-2 flex items-center justify-between">
          <AnimatePresence>
            {errors.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.message}
              </motion.p>
            )}
          </AnimatePresence>
          <span
            className={`text-sm ${
              formData.message.length > 5000 ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {formData.message.length} / 5000
          </span>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              p-4 rounded-xl flex items-start gap-3
              ${status.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
              }
            `}
          >
            {status.type === 'success' ? (
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              className={`text-sm font-medium ${
                status.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {status.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status.type === 'loading' || !isValid}
        className="
          group relative w-full inline-flex items-center justify-center gap-3
          px-8 py-4 rounded-2xl overflow-hidden
          text-white text-base font-semibold
          shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
          hover:scale-[1.02] active:scale-[0.98]
        "
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-[length:200%_100%] bg-left transition-all duration-700 ease-in-out group-hover:bg-right" />

        {status.type === 'loading' ? (
          <>
            <svg
              className="relative w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="relative">Sending...</span>
          </>
        ) : (
          <>
            <span className="relative">Send Message</span>
            <svg
              className="relative w-5 h-5 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
