import React, { useState } from 'react';
import { Loader2, Mail, Trash2, ChevronRight, Inbox, Clock, Reply } from 'lucide-react';
import { useContactMessagesAdmin, useContactAdminMutations } from '../../hooks/useContact';
import type { ContactMessage } from '../../lib/blogTypes';

export const AdminContact: React.FC = () => {
  const { data: messages, isLoading } = useContactMessagesAdmin();
  const { markRead, remove } = useContactAdminMutations();
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === 'NEW') {
      markRead.mutate({ id: msg.id, status: 'READ' });
    }
  };

  const unreadCount = messages?.filter((m: ContactMessage) => m.status === 'NEW').length ?? 0;

  return (
    <div className="max-w-5xl font-display">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8b1a2a]">Admin</span>
          <ChevronRight size={10} className="text-neutral-300" />
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Inbox</span>
        </div>
        <div className="flex items-end gap-4">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">
            Contact Messages
          </h1>
          {unreadCount > 0 && (
            <span className="mb-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-[#8b1a2a] text-white text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Inquiries submitted through the storefront contact form.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#8b1a2a]" size={22} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Loading inbox…</p>
        </div>
      ) : !messages?.length ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-200 rounded-2xl bg-white gap-3">
          <div className="size-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <Inbox size={22} className="text-neutral-300" />
          </div>
          <p className="text-sm font-bold text-neutral-500">No messages yet</p>
          <p className="text-xs text-neutral-400">Messages from your contact form will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">

          {/* ── Message list ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="h-1 bg-gradient-to-r from-[#8b1a2a] via-[#c0364a] to-[#8b1a2a]" />
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                All Messages
              </span>
              <span className="text-[9px] font-bold text-neutral-400">{messages.length} total</span>
            </div>
            <div className="divide-y divide-neutral-100 max-h-[65vh] overflow-y-auto">
              {messages.map((msg: ContactMessage) => {
                const isNew = msg.status === 'NEW';
                const isActive = selected?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left px-4 py-3.5 transition-colors relative
                      ${isActive ? 'bg-[#8b1a2a]/5' : 'hover:bg-neutral-50/80'}
                    `}
                  >
                    {/* New indicator bar */}
                    {isNew && (
                      <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#8b1a2a] rounded-r-full" />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs truncate ${isNew ? 'font-extrabold text-neutral-900' : 'font-semibold text-neutral-700'}`}>
                        {msg.name}
                      </p>
                      <span className={`shrink-0 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md tracking-wider ${
                        isNew
                          ? 'bg-[#8b1a2a]/10 text-[#8b1a2a]'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        {isNew ? 'New' : 'Read'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">{msg.email}</p>
                    {msg.subject && (
                      <p className="text-[10px] text-neutral-500 truncate mt-1 font-medium">{msg.subject}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={9} className="text-neutral-300" />
                      <p className="text-[9px] text-neutral-400">
                        {new Date(msg.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Message detail ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] sticky top-6">
            <div className="h-1 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200" style={selected ? { backgroundImage: 'linear-gradient(to right, #8b1a2a, #c0364a, #8b1a2a)' } : {}} />

            {selected ? (
              <div className="p-6">
                {/* Sender info */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-[#8b1a2a]/10 flex items-center justify-center shrink-0 text-[#8b1a2a] font-extrabold text-sm">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-neutral-900 leading-tight truncate">
                        {selected.name}
                      </h2>
                      <a
                        href={`mailto:${selected.email}`}
                        className="text-xs text-[#8b1a2a] hover:underline truncate block"
                      >
                        {selected.email}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this message?')) {
                        remove.mutate(selected.id);
                        setSelected(null);
                      }
                    }}
                    className="shrink-0 size-8 flex items-center justify-center rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Subject */}
                {selected.subject && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-0.5">Subject</p>
                    <p className="text-xs font-semibold text-neutral-700">{selected.subject}</p>
                  </div>
                )}

                {/* Message body */}
                <div className="mb-5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400 mb-2">Message</p>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-neutral-300" />
                    <p className="text-[9px] text-neutral-400">
                      {new Date(selected.createdAt).toLocaleString('en-IN', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your enquiry')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8b1a2a] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#6f1522] transition-colors shadow-sm"
                  >
                    <Reply size={11} />
                    Reply
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-neutral-300">
                <Mail size={28} className="opacity-40" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};