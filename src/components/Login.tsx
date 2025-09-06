import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Mail, Phone, Shield, Users, Store, Calendar } from 'lucide-react';

const Login = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [userRole, setUserRole] = useState<string>('');

  const roles = [
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage everything' },
    { value: 'family', label: 'Family', icon: Users, description: 'Plan & coordinate' },
    { value: 'vendor', label: 'Vendor', icon: Store, description: 'Provide services' },
    { value: 'guest', label: 'Guest', icon: Calendar, description: 'View & RSVP' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Heart className="h-12 w-12 text-primary animate-glow" fill="currentColor" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-float"></div>
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            ShaadiMate
          </h1>
          <p className="text-muted-foreground text-lg">
            Your Perfect Wedding Planner
          </p>
        </div>

        {/* Login Form */}
        <Card className="wedding-card animate-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue planning your special day</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Role</label>
                  <Select value={userRole} onValueChange={setUserRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center space-x-3">
                            <role.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Contact Method Toggle */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    type="button"
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Button>
                </div>

                {/* Input Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <Input
                    type={authMethod === 'email' ? 'email' : 'tel'}
                    placeholder={authMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                    className="wedding-input"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="wedding-input"
                  />
                </div>

                {/* Login Button */}
                <Button className="hero-button w-full mt-6">
                  Sign In
                </Button>

                {/* OTP Option */}
                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    Login with OTP instead
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="First name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="Enter your email" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input type="tel" placeholder="Enter your phone number" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="Create a password" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center space-x-3">
                            <role.icon className="h-4 w-4" />
                            <span>{role.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button className="hero-button w-full">
                  Create Account
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default Login;