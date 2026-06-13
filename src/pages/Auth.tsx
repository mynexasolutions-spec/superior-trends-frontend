import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function Field({
  label, icon, type = 'text', placeholder, value, onChange, required,
}: {
  label: string; icon: React.ReactNode; type?: string;
  placeholder: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  const { language } = useLanguage();
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center pl-4 rtl:pl-0 rtl:pr-4 text-neutral-300 group-focus-within:text-[#8b1a2a] transition-colors pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3.5 text-sm bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-[#8b1a2a] focus:ring-4 focus:ring-[#8b1a2a]/8 transition-all"
        />
      </div>
    </div>
  );
}

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') || 'login') as 'login' | 'register';
  const { login, signup, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleModeToggle = (newMode: 'login' | 'register') => {
    clearError();
    navigate(`/auth?mode=${newMode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      let user;
      if (mode === 'login') {
        user = await login({ email, password });
      } else {
        user = await signup({ name, email, password, phone });
      }
      const redirect = searchParams.get('redirect') || '/';
      const safeRedirect = redirect.startsWith('/') ? redirect : '/';
      navigate(user.role === 'ADMIN'
        ? (safeRedirect.startsWith('/admin') ? safeRedirect : '/admin')
        : safeRedirect
      );
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-brand-cream relative overflow-hidden isolate">
      {/* Luxury Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8b1a2a]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ── Main scrollable area ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-14 sm:py-20 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] border border-brand-border/25 overflow-hidden">

            {/* Card top accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#8b1a2a] via-[#c4364a] to-[#d4af37]" />

            <div className="px-8 pt-8 pb-9 space-y-7">

              {/* Brand + heading */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2">
                  <div className="w-px h-3 bg-[#d4af37]/60" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4af37]">
                    Superior Trends
                  </p>
                  <div className="w-px h-3 bg-[#d4af37]/60" />
                </div>

                <h2 className="font-display text-2xl font-black uppercase tracking-tight text-brand-charcoal leading-tight">
                  {mode === 'login'
                    ? (language === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back')
                    : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
                </h2>

                <p className="text-xs text-brand-text-muted leading-relaxed font-semibold">
                  {mode === 'login'
                    ? (language === 'ar' ? 'سجل الدخول للوصول إلى خزانة ملابسك الخاصة.' : 'Sign in to access your curated wardrobe.')
                    : (language === 'ar' ? 'انضم إلينا واكتشف المجموعات الحصرية.' : 'Join us and unlock exclusive collections.')}
                </p>
              </div>

              {/* Gold divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-sm shadow-[#d4af37]/50" />
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-xs text-red-650 font-extrabold leading-relaxed">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <Field label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} icon={<User size={15} />} placeholder={language === 'ar' ? 'الاسم' : 'Jane Doe'} value={name} onChange={setName} required />
                    <Field label={language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'} icon={<Phone size={15} />} type="tel" placeholder="+968 9000 0000" value={phone} onChange={setPhone} />
                  </>
                )}
                <Field label={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} icon={<Mail size={15} />} type="email" placeholder="you@domain.com" value={email} onChange={setEmail} required />
                <Field label={language === 'ar' ? 'كلمة المرور' : 'Password'} icon={<Lock size={15} />} type="password" placeholder="••••••••" value={password} onChange={setPassword} required />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-[#8b1a2a] hover:bg-[#7a1624] active:scale-[0.99] text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#8b1a2a]/30 shadow-md shadow-[#8b1a2a]/20 hover:shadow-lg"
                  >
                    {isLoading
                      ? <Loader2 className="animate-spin" size={16} />
                      : <>{mode === 'login' ? (language === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')} <ArrowRight size={13} className="rtl:rotate-180" /></>
                    }
                  </button>
                </div>
              </form>

              {/* Toggle */}
              <p className="text-center text-xs text-brand-text-muted pt-1 font-semibold">
                {mode === 'login'
                  ? (language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?")
                  : (language === 'ar' ? 'هل أنت عضو بالفعل؟' : 'Already a member?')}{' '}
                <button
                  type="button"
                  onClick={() => handleModeToggle(mode === 'login' ? 'register' : 'login')}
                  className="text-[#8b1a2a] font-black uppercase tracking-wider hover:underline underline-offset-2 transition-colors ml-0.5 rtl:mr-0.5"
                >
                  {mode === 'login' ? (language === 'ar' ? 'سجل الآن' : 'Register') : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
                </button>
              </p>
            </div>
          </div>

          {/* Below-card trust line */}
          <p className="text-center text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mt-6">
            {language === 'ar' ? 'آمن · مشفر · موثوق' : 'Secure · Encrypted · Trusted'}
          </p>
        </div>
      </div>

      {/* ── Footer peek ─────────────────────────────────────────────────── */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between shrink-0 relative z-10">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
          © {new Date().getFullYear()} {language === 'ar' ? 'سوبريور تريندز' : 'Superior Trends'}
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: language === 'ar' ? 'الخصوصية' : 'Privacy', key: 'Privacy' },
            { label: language === 'ar' ? 'الشروط' : 'Terms', key: 'Terms' },
            { label: language === 'ar' ? 'المساعدة' : 'Help', key: 'Help' },
          ].map((l) => (
            <a key={l.key} href="#" className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auth;