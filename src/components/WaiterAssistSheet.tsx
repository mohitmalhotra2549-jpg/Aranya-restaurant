import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Droplets,
  Flame,
  MessageSquare,
  ScrollText,
  Utensils,
  X,
} from 'lucide-react';
import { waiterServiceOptions, type ServiceOption } from '@/data/serviceRequests';
import { useApp } from '@/store/AppContext';
import { Glass } from '@/components/ui/Glass';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { RequestType } from '@/types';

const iconMap = {
  bell: Bell,
  droplets: Droplets,
  utensils: Utensils,
  napkin: ScrollText,
  flame: Flame,
  message: MessageSquare,
  receipt: Bell,
} as const;

interface WaiterAssistSheetProps {
  open: boolean;
  onClose: () => void;
  onSent?: (label: string) => void;
}

export function WaiterAssistSheet({ open, onClose, onSent }: WaiterAssistSheetProps) {
  const { createRequest, tableNumber } = useApp();
  const [noteMode, setNoteMode] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const reset = () => {
    setNoteMode(false);
    setNote('');
    setSending(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const send = (type: RequestType, message: string, label: string) => {
    setSending(true);
    createRequest(type, message || undefined);
    onSent?.(label);
    setTimeout(() => {
      reset();
      onClose();
    }, 280);
  };

  const handleOption = (option: ServiceOption) => {
    if (option.id === 'other') {
      setNoteMode(true);
      return;
    }
    send(option.type, option.message, option.label);
  };

  const sendNote = () => {
    const text = note.trim();
    if (!text) return;
    send('other', text, 'Custom request');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative z-10 w-full max-w-md px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4"
          >
            <Glass intensity="strong" className="overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/50">
                    Table {tableNumber}
                  </p>
                  <h2 className="mt-1 font-serif text-xl text-white">
                    {noteMode ? 'Tell us what you need' : 'How can we help?'}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    {noteMode
                      ? 'Your note goes straight to the floor staff'
                      : 'Choose a quick request for your table'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/8 hover:text-white"
                  aria-label="Close sheet"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[min(70vh,520px)] overflow-y-auto p-3">
                <AnimatePresence mode="wait">
                  {!noteMode ? (
                    <motion.div
                      key="options"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="grid gap-2"
                    >
                      {waiterServiceOptions.map((option, i) => {
                        const Icon = iconMap[option.icon];
                        return (
                          <motion.button
                            key={option.id}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            disabled={sending}
                            onClick={() => handleOption(option)}
                            className={cn(
                              'flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 text-left transition',
                              'hover:border-amber-400/25 hover:bg-white/[0.06] active:scale-[0.99]',
                              'disabled:opacity-50',
                            )}
                          >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-200">
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-white/90">
                                {option.label}
                              </span>
                              <span className="mt-0.5 block text-xs text-white/40">
                                {option.description}
                              </span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="note"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="space-y-4 p-2"
                    >
                      <textarea
                        autoFocus
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        placeholder="e.g. Extra plates, baby high chair, soft music..."
                        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/30"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={() => {
                            setNoteMode(false);
                            setNote('');
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="gold"
                          fullWidth
                          disabled={!note.trim() || sending}
                          onClick={sendNote}
                        >
                          Send request
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
