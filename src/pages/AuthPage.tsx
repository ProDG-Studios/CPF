import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Shield, Landmark, Users, Building2, Briefcase, ChevronRight } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center animate-pulse">
              <Shield className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Landmark className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CPF Settlement</h1>
              <p className="text-sm text-primary-foreground/70">Securitization Platform</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display leading-tight mb-4">
                Transforming Government
                <span className="block text-accent">Payment Solutions</span>
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-md">
                Secure, transparent, and efficient bill securitization for suppliers, MDAs, and financial institutions.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Bank-grade security & encryption' },
                { icon: Users, text: 'Multi-party verification workflow' },
                { icon: Building2, text: 'Direct treasury integration' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-primary-foreground/90">
                  <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-primary-foreground/60">
            © 2024 CPF Settlement Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Landmark className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CPF Settlement</h1>
              <p className="text-sm text-muted-foreground">Securitization Platform</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-secondary rounded-xl p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === 'login' 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === 'signup' 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground">Enter your credentials to access your account</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 bg-background border-border focus:border-accent focus:ring-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-12 bg-background border-border focus:border-accent focus:ring-accent"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                <h2 className="text-2xl font-bold text-foreground">Create account</h2>
                <p className="text-muted-foreground">Get started with the CPF Settlement Platform</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className="h-12 bg-background border-border focus:border-accent focus:ring-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-12 bg-background border-border focus:border-accent focus:ring-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="h-12 bg-background border-border focus:border-accent focus:ring-accent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSignupRole(option.value as AppRole)}
                        className={cn(
                          "flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left",
                          signupRole === option.value
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50 hover:bg-secondary/50"
                        )}
                      >
                        <option.icon className={cn(
                          "w-5 h-5 mb-2",
                          signupRole === option.value ? "text-accent" : "text-muted-foreground"
                        )} />
                        <span className="font-medium text-sm text-foreground">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
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
          
          {/* Demo Accounts */}
          <div className="p-4 bg-secondary/50 rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Supplier: <span className="text-foreground">supplier1@demo.com</span></div>
              <div>SPV: <span className="text-foreground">spv1@demo.com</span></div>
              <div>MDA: <span className="text-foreground">mda1@demo.com</span></div>
              <div>Treasury: <span className="text-foreground">treasury1@demo.com</span></div>
            </div>
            <p className="text-xs text-accent font-medium mt-2">Password: demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
