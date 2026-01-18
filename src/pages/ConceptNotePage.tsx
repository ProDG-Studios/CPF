import { useState } from 'react';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  Shield, 
  Landmark, 
  Users, 
  Building2, 
  Briefcase,
  TrendingUp,
  Coins,
  BarChart3,
  CheckCircle2,
  Globe,
  Lock,
  Zap,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { generateConceptNotePDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

const ConceptNotePage = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI feedback
      generateConceptNotePDF();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };


  const sections = [
    {
      id: 'problem',
      icon: BarChart3,
      title: 'The Problem',
      subtitle: '$2 Trillion Global Challenge',
      content: 'Government payment delays of 6-18 months cause supplier bankruptcy, project abandonment, and economic inefficiency. Traditional solutions like bank factoring have high costs (15-30% discount) and limited availability.'
    },
    {
      id: 'solution',
      icon: Zap,
      title: 'The CPF Solution',
      subtitle: 'Four-Pillar Digital Ecosystem',
      content: 'A transparent digital marketplace connecting Suppliers, SPVs (pension funds), MDAs, and Treasury. Converts government receivables into tradeable, blockchain-secured instruments.'
    },
    {
      id: 'stakeholders',
      icon: Users,
      title: 'Stakeholders',
      subtitle: 'Role-Based Access',
      content: 'Suppliers submit invoices for immediate liquidity. SPVs conduct due diligence and purchase receivables. MDAs verify and authorize claims. Treasury certifies and guarantees payment.'
    },
    {
      id: 'blockchain',
      icon: Lock,
      title: 'Blockchain Settlement',
      subtitle: 'Ethereum Smart Contracts',
      content: 'Tripartite Deed of Assignment with sequential signing. Receivable Notes minted as NFTs for trading. Immutable audit trail ensures transparency and reduces fraud.'
    },
    {
      id: 'market',
      icon: Globe,
      title: 'Market Opportunity',
      subtitle: 'Nigeria & Ghana Focus',
      content: 'Kenya: KES 500B+ contractor debt, KES 1.8T+ pension AUM. Ghana: GH₢15-20B arrears, GH₢50B+ pension funds. Scalable to all emerging markets with government payment delays.'
    }
  ];

  const stats = [
    { value: 'KES 500B+', label: 'Kenyan Contractor Debt' },
    { value: '6-18', label: 'Months Payment Delay' },
    { value: 'KES 1.8T+', label: 'Pension Fund AUM' },
    { value: '92%', label: 'Typical Advance Rate' },
  ];

  const phases = [
    { phase: '1', title: 'Proof of Concept', status: 'current', items: ['Platform complete', 'Demo operational', 'Testing underway'] },
    { phase: '2', title: 'Pilot Program', status: 'upcoming', items: ['2-3 pilot MDAs', '10-20 suppliers', 'KES 1-5B transactions'] },
    { phase: '3', title: 'National Rollout', status: 'future', items: ['All federal MDAs', 'Banking integration', 'Mobile app launch'] },
    { phase: '4', title: 'Regional Expansion', status: 'future', items: ['Ghana launch', 'West Africa', 'Multi-currency'] },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Landmark className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Receivables Securitisation
              </h1>
              <p className="text-xs text-neutral-500">Origination Platform</p>
            </div>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Platform
            </Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Concept Note 2026</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-display leading-tight text-white">
                Contractor Payment
                <span className="block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 bg-clip-text text-transparent">
                  Facility (CPF)
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-neutral-300 max-w-xl leading-relaxed">
                Transforming government debt into tradeable, blockchain-secured instruments. 
                Unlocking billions in working capital for suppliers while creating sovereign-grade 
                investment opportunities.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="h-14 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Full Document
                    </>
                  )}
                </Button>
                <Link to="/auth">
                  <Button 
                    variant="outline"
                    className="h-14 px-8 border-2 border-neutral-700 text-white hover:bg-neutral-800 hover:border-neutral-600 font-semibold transition-all duration-300"
                  >
                    View Live Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-3xl blur-xl"></div>
              <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">Market Opportunity</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-sm text-neutral-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Sections */}
      <div className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            How CPF <span className="text-amber-400">Works</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            A comprehensive solution addressing the $2 trillion global challenge of government payment delays
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div 
              key={section.id}
              className={cn(
                "group relative bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-amber-500/50 hover:bg-neutral-900/80",
                activeSection === section.id && "border-amber-500/50 bg-neutral-900/80"
              )}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-amber-500/10 transition-all duration-300">
                  <section.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-amber-400/80">{section.subtitle}</p>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-neutral-500 transition-transform duration-300",
                  activeSection === section.id && "rotate-180 text-amber-400"
                )} />
              </div>
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                activeSection === section.id ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}>
                <p className="text-neutral-400 text-sm leading-relaxed pt-2 border-t border-neutral-800">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="px-6 lg:px-12 py-16 lg:py-24 bg-gradient-to-b from-neutral-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Transaction <span className="text-amber-400">Lifecycle</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              From bill submission to blockchain settlement in five streamlined phases
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-amber-500/20 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { icon: Users, title: 'Supplier', subtitle: 'Bill Submission', step: '01' },
                { icon: Briefcase, title: 'SPV', subtitle: 'Due Diligence & Offer', step: '02' },
                { icon: Building2, title: 'MDA', subtitle: 'Verification', step: '03' },
                { icon: Landmark, title: 'Treasury', subtitle: 'Certification', step: '04' },
                { icon: Lock, title: 'Blockchain', subtitle: 'Settlement', step: '05' },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-all duration-300 group">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      {item.step}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-amber-500/10 transition-all duration-300">
                      <item.icon className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-400">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="px-6 lg:px-12 py-16 lg:py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Implementation <span className="text-amber-400">Roadmap</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            From proof of concept to regional expansion across West Africa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, index) => (
            <div 
              key={index} 
              className={cn(
                "relative bg-neutral-900/50 border rounded-2xl p-6 transition-all duration-300",
                phase.status === 'current' 
                  ? "border-amber-500/50 bg-amber-500/5" 
                  : "border-neutral-800 hover:border-neutral-700"
              )}
            >
              {phase.status === 'current' && (
                <div className="absolute -top-3 -right-3 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  CURRENT
                </div>
              )}
              <div className="text-4xl font-bold text-amber-500/30 mb-4">0{phase.phase}</div>
              <h3 className="text-lg font-semibold text-white mb-4">{phase.title}</h3>
              <ul className="space-y-2">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 text-sm text-neutral-400">
                    <CheckCircle2 className={cn(
                      "w-4 h-4 flex-shrink-0",
                      phase.status === 'current' ? "text-amber-400" : "text-neutral-600"
                    )} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-3xl p-8 lg:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Partnership Opportunity</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Ready to <span className="text-amber-400">Transform</span> Government Payments?
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                Join us in revolutionizing how governments pay their contractors. 
                Partner with CPF to unlock billions in working capital.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button 
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="h-14 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Concept Note
                    </>
                  )}
                </Button>
                <Link to="/auth">
                  <Button 
                    variant="outline"
                    className="h-14 px-8 border-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-semibold transition-all duration-300"
                  >
                    Access Demo Platform
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Receivables Securitisation Origination</p>
              <p className="text-xs text-neutral-500">Government Debt Securitization</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <Coins className="w-4 h-4 text-amber-500/50" />
            <span>© 2026 Receivables Securitisation Origination. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConceptNotePage;
