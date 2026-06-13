import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { PageShell } from '../components/PageShell';
import { useSubmitContact } from '../hooks/useContact';
import { useToast } from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';

export const Contact: React.FC = () => {
  const { language, t } = useLanguage();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitContact = useSubmitContact();
  const { showToast } = useToast();

  const INFO_ITEMS = [
    { 
      icon: Mail,  
      label: language === 'ar' ? 'البريد الإلكتروني' : 'Email',   
      value: 'support@superiortrends.com', 
      href: 'mailto:support@superiortrends.com' 
    },
    { 
      icon: Phone, 
      label: language === 'ar' ? 'الهاتف' : 'Phone',   
      value: '+968 9876 5432',             
      href: 'tel:+96898765432' 
    },
    { 
      icon: MapPin,
      label: language === 'ar' ? 'الموقع' : 'Studio',  
      value: language === 'ar' ? 'مسقط، سلطنة عمان' : 'Muscat, Sultanate of Oman',  
      href: '#' 
    },
    { 
      icon: Clock, 
      label: language === 'ar' ? 'أوقات العمل' : 'Hours',   
      value: language === 'ar' ? 'الإثنين - السبت، ١٠ صباحاً - ٧ مساءً' : 'Mon – Sat, 10 am – 7 pm',   
      href: '#' 
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    try {
      const res = await submitContact.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      showToast(res.message || (language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!'), 'success');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'ar' ? 'تعذر إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Could not send message. Please try again.');
      showToast(msg, 'error');
    }
  };

  return (
    <PageShell className="pb-24">
      <PageHeader
        eyebrow={language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
        title={language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        subtitle={language === 'ar' ? 'لديك استفسار عن الطلبات، المقاسات، أو البيع بالجملة؟ نحن هنا للمساعدة.' : "Questions about orders, sizing, or wholesale? We're here to help."}
      />

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start text-left rtl:text-right">

        {/* ── Info column ─────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-3 w-full">
          {INFO_ITEMS.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              className="group flex items-center gap-4 bg-white border border-brand-border/40 rounded-2xl px-5 py-4 hover:border-[#8b1a2a]/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8b1a2a]/6 text-[#8b1a2a] flex items-center justify-center shrink-0 group-hover:bg-[#8b1a2a] group-hover:text-white transition-all duration-300">
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d4af37] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#111111] group-hover:text-[#8b1a2a] transition-colors truncate">{value}</p>
              </div>
            </a>
          ))}

          {/* Brand note */}
          <div className="mt-6 pt-6 border-t border-brand-border/30">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {language === 'ar' ? (
                <>
                  نقوم بالرد عادةً خلال <span className="text-[#8b1a2a] font-semibold">٢٤ ساعة</span>. للمسائل العاجلة، يرجى الاتصال بنا مباشرة.
                </>
              ) : (
                <>
                  We typically respond within <span className="text-[#8b1a2a] font-semibold">24 hours</span>. For urgent matters, please call us directly.
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── Form column ─────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white border border-brand-border/30 rounded-3xl p-6 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.05)] w-full"
        >
          <div className="mb-7">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#111111]">
              {language === 'ar' ? 'إرسال رسالة' : 'Send a Message'}
            </h2>
            <div className="flex gap-1.5 mt-3">
              <div className="w-8 h-[3px] bg-[#8b1a2a] rounded-full" />
              <div className="w-3 h-[3px] bg-[#d4af37] rounded-full" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} required>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم الكامل الخاص بك' : 'Your full name'}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#FDFAF7] border border-brand-border/50 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#8b1a2a] focus:ring-2 focus:ring-[#8b1a2a]/10 focus:bg-white transition-all"
                />
              </Field>
              <Field label={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} required>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#FDFAF7] border border-brand-border/50 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#8b1a2a] focus:ring-2 focus:ring-[#8b1a2a]/10 focus:bg-white transition-all"
                />
              </Field>
            </div>

            <Field label={language === 'ar' ? 'الموضوع' : 'Subject'} optional>
              <input
                type="text" value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={language === 'ar' ? 'استفسار عن طلب، المقاس، البيع بالجملة...' : 'Order inquiry, sizing, wholesale…'}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#FDFAF7] border border-brand-border/50 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#8b1a2a] focus:ring-2 focus:ring-[#8b1a2a]/10 focus:bg-white transition-all"
              />
            </Field>

            <Field label={language === 'ar' ? 'الرسالة' : 'Message'} required>
              <textarea
                required rows={5} value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'ar' ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#FDFAF7] border border-brand-border/50 text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#8b1a2a] focus:ring-2 focus:ring-[#8b1a2a]/10 focus:bg-white resize-none transition-all"
              />
            </Field>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitContact.isPending}
                className="inline-flex items-center gap-2.5 bg-[#8b1a2a] text-white px-9 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#6b1420] hover:shadow-lg hover:shadow-[#8b1a2a]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                {submitContact.isPending ? (
                  <><Loader2 size={14} className="animate-spin" /><span>{language === 'ar' ? 'جاري الإرسال...' : 'Sending…'}</span></>
                ) : (
                  <><span>{language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span><Send size={13} className="shrink-0 rtl:rotate-180" /></>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </PageShell>
  );
};

function Field({ label, required, optional, children }: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
        {label}
        {required && <span className="text-[#8b1a2a] mx-0.5">*</span>}
        {optional && <span className="mx-1 font-normal normal-case tracking-normal text-neutral-400">{language === 'ar' ? '(اختياري)' : '(optional)'}</span>}
      </label>
      {children}
    </div>
  );
}