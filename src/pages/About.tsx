import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Store, Users, Award, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-subtle">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About ModernStore</h1>
              <p className="text-xl text-muted-foreground">
                Your trusted destination for premium products
              </p>
            </div>

            <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Card className="p-8 shadow-soft">
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded with a passion for quality and innovation, ModernStore has been serving customers 
                  with the finest selection of products since our inception. We believe in delivering not just 
                  products, but experiences that enrich lives.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our commitment to excellence drives us to carefully curate every item in our collection, 
                  ensuring that each product meets our high standards of quality, design, and value.
                </p>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <Card className="p-6 text-center shadow-soft animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
                <p className="text-muted-foreground">
                  Thousands of products across multiple categories
                </p>
              </Card>

              <Card className="p-6 text-center shadow-soft animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Customer First</h3>
                <p className="text-muted-foreground">
                  Dedicated support team ready to help you
                </p>
              </Card>

              <Card className="p-6 text-center shadow-soft animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Only the best products make it to our store
                </p>
              </Card>

              <Card className="p-6 text-center shadow-soft animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Always Growing</h3>
                <p className="text-muted-foreground">
                  Constantly expanding our collection
                </p>
              </Card>
            </div>

            <Card className="p-8 bg-gradient-hero text-primary-foreground shadow-glow animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-primary-foreground/90 leading-relaxed">
                To make premium shopping accessible to everyone by offering high-quality products 
                at competitive prices, backed by exceptional customer service. We strive to create 
                a seamless shopping experience that exceeds expectations at every touchpoint.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
