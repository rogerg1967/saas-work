import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Shield,
  Bot,
  MessageSquare,
  LogIn,
  CheckCircle2,
  Lock,
  Globe,
  BrainCircuit,
  BarChart3,
  HeartHandshake
} from "lucide-react";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-8 mx-auto max-w-7xl">
        <div className="text-2xl font-bold">SaaS Work</div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            UK GDPR Compliant AI Chatbots for Organizations
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Empower your organization with intelligent, secure, and fully compliant conversational AI solutions that protect your data while enhancing customer engagement.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="hover:bg-secondary"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Our platform offers comprehensive AI chatbot solutions designed specifically for organizations requiring the highest standards of data protection and compliance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="UK GDPR Compliant"
              description="Full compliance with UK data protection regulations, ensuring your customers' data is handled securely and lawfully."
            />
            <FeatureCard
              icon={<Bot className="w-8 h-8" />}
              title="Advanced AI Models"
              description="Leverage the latest AI language models from leading providers, dynamically updated to ensure you always have access to cutting-edge technology."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8" />}
              title="Data Security"
              description="Enterprise-grade security measures to protect sensitive information with end-to-end encryption and secure data handling."
            />
            <FeatureCard
              icon={<BrainCircuit className="w-8 h-8" />}
              title="Intelligent Responses"
              description="AI-powered chatbots that learn from interactions to provide increasingly accurate and helpful responses to customer inquiries."
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Multi-channel Integration"
              description="Deploy chatbots across your website, mobile apps, and social media platforms for consistent customer experiences."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Analytics & Insights"
              description="Detailed analytics on chatbot performance, user interactions, and customer satisfaction to continuously improve your service."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Getting started with our GDPR-compliant AI chatbots is simple and straightforward
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Register Your Organization"
              description="Create an account and register your organization to get started with our platform."
            />
            <StepCard
              number="2"
              title="Configure Your Chatbots"
              description="Set up AI chatbots tailored to your specific business needs and compliance requirements."
            />
            <StepCard
              number="3"
              title="Deploy & Monitor"
              description="Deploy your chatbots across your digital channels and monitor their performance through our dashboard."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Transparent Pricing</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Choose the plan that best fits your organization's needs and scale as you grow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              title="Starter"
              price="£49"
              description="Perfect for small organizations just getting started with AI chatbots"
              features={[
                "Up to 3 AI chatbots",
                "Basic AI models",
                "Standard support",
                "5,000 messages per month",
                "GDPR compliance"
              ]}
              buttonText="Start with Starter"
              navigate={() => navigate("/register?plan=starter")}
              popular={false}
            />
            <PricingCard
              title="Professional"
              price="£99"
              description="Designed for growing organizations with increased AI chatbot needs"
              features={[
                "Up to 10 AI chatbots",
                "Advanced AI models",
                "Priority support",
                "25,000 messages per month",
                "GDPR compliance",
                "Custom chatbot training"
              ]}
              buttonText="Choose Professional"
              navigate={() => navigate("/register?plan=professional")}
              popular={true}
            />
            <PricingCard
              title="Enterprise"
              price="£249"
              description="Enterprise-grade solution for organizations requiring maximum capability"
              features={[
                "Unlimited AI chatbots",
                "Premium AI models",
                "24/7 dedicated support",
                "100,000 messages per month",
                "GDPR compliance",
                "Custom chatbot training",
                "Advanced analytics",
                "API access"
              ]}
              buttonText="Go Enterprise"
              navigate={() => navigate("/register?plan=enterprise")}
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Trusted by Organizations</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              See what our customers are saying about our GDPR-compliant AI chatbots
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="SaaS Work's AI chatbots have revolutionized our customer service while ensuring we maintain full GDPR compliance. Exceptional platform!"
              author="Sarah Johnson"
              role="CTO, FinTech Solutions"
            />
            <TestimonialCard
              quote="The ease of implementation and the quality of AI responses have exceeded our expectations. Our customers love the instant support."
              author="Mark Thompson"
              role="Head of Customer Experience, Retail Chain"
            />
            <TestimonialCard
              quote="As a healthcare provider, data protection is paramount. SaaS Work delivers both security and outstanding AI capabilities."
              author="Dr. Lisa Chen"
              role="Director of Digital Services, Healthcare Provider"
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Customer Engagement?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join organizations across the UK using our GDPR-compliant AI chatbots to enhance customer service while protecting sensitive data.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">SaaS Work</h3>
              <p className="text-sm text-muted-foreground">
                Providing GDPR-compliant AI chatbot solutions for organizations across the UK.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Documentation</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">GDPR Compliance</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SaaS Work. All rights reserved.</p>
            <p className="mt-2">
              Built by <a href="https://pythagora.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Pythagora</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-lg bg-background/95 backdrop-blur-sm border shadow-sm"
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-lg bg-background border shadow-sm text-center"
    >
      <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-lg font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function PricingCard({ title, price, description, features, buttonText, navigate, popular }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: popular ? 1.03 : 1.01 }}
      className={`p-6 rounded-lg border shadow-sm relative ${
        popular ? 'border-primary shadow-md' : 'bg-background'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-max bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={navigate}
        className={`w-full ${
          popular
            ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90'
            : ''
        }`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-lg bg-background border shadow-sm"
    >
      <div className="mb-4 text-primary">
        <HeartHandshake className="w-8 h-8" />
      </div>
      <p className="italic mb-4">{quote}</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </motion.div>
  );
}