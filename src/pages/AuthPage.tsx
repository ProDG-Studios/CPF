import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Shield, Landmark, Users, Building2, Briefcase, TrendingUp, Coins, BarChart3, Wallet } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['supplier', 'spv', 'mda', 'treasury', 'admin']),
});

const roleOptions = [
  { value: 'supplier', label: 'Supplier', description: 'Submit and manage invoices', icon: Users },
  { value: 'spv', label: 'SPV', description: 'Special Purpose Vehicle', icon: Briefcase },
  { value: 'mda', label: 'MDA', description: 'Ministry/Department/Agency', icon: Building2 },
  { value: 'treasury', label: 'Treasury', description: 'National Treasury Office', icon: Landmark },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, role, loading, signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole>('supplier');

  useEffect(() => {
    if (!loading && user && role) {
      const redirectPath = getRedirectPath(role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const getRedirectPath = (userRole: AppRole): string => {
    switch (userRole) {
      case 'supplier': return '/supplier';
      case 'spv': return '/spv';
      case 'mda': return '/mda';
      case 'treasury': return '/treasury';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      setIsSubmitting(true);
      
      const { error } = await signIn(validated.email, validated.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back!');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        fullName: signupFullName,
        role: signupRole,
      });
      
      setIsSubmitting(true);
      
      const { error } = await signUp(validated.email, validated.password, validated.fullName, validated.role);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please login instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully!');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/20">
              <Coins className="w-7 h-7 text-black" />
            </div>
          </div>
          <p className="text-sm text-neutral-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Left Panel - Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Floating Icons */}
        <div className="absolute top-20 right-20 opacity-10">
          <BarChart3 className="w-32 h-32 text-amber-500" />
        </div>
        <div className="absolute bottom-32 right-32 opacity-10">
          <TrendingUp className="w-24 h-24 text-amber-500" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Landmark className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">CPF Settlement</h1>
              <p className="text-sm text-neutral-400">Securitization Platform</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display leading-tight mb-4 text-white">
                Transforming Government
                <span className="block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 bg-clip-text text-transparent">Payment Solutions</span>
              </h2>
              <p className="text-lg text-neutral-300 max-w-md">
                Secure, transparent, and efficient bill securitization for suppliers, MDAs, and financial institutions.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Bank-grade security & encryption' },
                { icon: Wallet, text: 'Blockchain-backed transactions' },
                { icon: Building2, text: 'Direct treasury integration' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-4 text-neutral-200">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <Coins className="w-4 h-4 text-amber-500/50" />
            <span>© 2026 CPF Settlement Platform. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-neutral-900 to-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Landmark className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">CPF Settlement</h1>
              <p className="text-sm text-neutral-400">Securitization Platform</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-neutral-800/50 rounded-xl p-1 border border-neutral-700/50">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === 'login' 
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === 'signup' 
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                <p className="text-neutral-400">Enter your credentials to access your account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-neutral-300">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-neutral-300">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Create account</h2>
                <p className="text-neutral-400">Get started with the CPF Settlement Platform</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium text-neutral-300">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className="h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-neutral-300">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-neutral-300">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="h-12 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-amber-500 focus:ring-amber-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-300">Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSignupRole(option.value as AppRole)}
                        className={cn(
                          "flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left",
                          signupRole === option.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-neutral-700 hover:border-amber-500/50 hover:bg-neutral-800/50"
                        )}
                      >
                        <option.icon className={cn(
                          "w-5 h-5 mb-2",
                          signupRole === option.value ? "text-amber-400" : "text-neutral-400"
                        )} />
                        <span className="font-medium text-sm text-white">{option.label}</span>
                        <span className="text-xs text-neutral-400">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
          
          {/* Demo Accounts - Identifiable */}
          <div className="p-4 bg-neutral-800/30 rounded-xl border border-amber-500/20">
            <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Demo Accounts (Password: demo1234)
            </p>
            
            <div className="space-y-3 text-xs">
              {/* Suppliers */}
              <div>
                <p className="text-amber-400 font-semibold mb-1">Suppliers</p>
                <div className="grid grid-cols-2 gap-1 text-neutral-400">
                  <div><span className="text-amber-200">apex@demo.com</span> (Apex Construction)</div>
                  <div><span className="text-amber-200">techsupply@demo.com</span> (TechSupply Co)</div>
                </div>
              </div>
              
              {/* SPVs */}
              <div>
                <p className="text-amber-400 font-semibold mb-1">SPVs</p>
                <div className="grid grid-cols-2 gap-1 text-neutral-400">
                  <div><span className="text-amber-200">alpha.capital@demo.com</span></div>
                  <div><span className="text-amber-200">beta.investments@demo.com</span></div>
                </div>
              </div>
              
              {/* MDAs */}
              <div>
                <p className="text-amber-400 font-semibold mb-1">MDAs (use matching MDA for bills)</p>
                <div className="grid grid-cols-2 gap-1 text-neutral-400">
                  <div><span className="text-amber-200">fmw@demo.com</span> (Ministry of Works)</div>
                  <div><span className="text-amber-200">fmh@demo.com</span> (Ministry of Health)</div>
                  <div><span className="text-amber-200">fme@demo.com</span> (Ministry of Education)</div>
                  <div><span className="text-amber-200">fmit@demo.com</span> (Ministry of IT)</div>
                </div>
              </div>
              
              {/* Treasury */}
              <div>
                <p className="text-amber-400 font-semibold mb-1">Treasury</p>
                <div className="text-neutral-400">
                  <span className="text-amber-200">federal.treasury@demo.com</span> (Federal Treasury)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;