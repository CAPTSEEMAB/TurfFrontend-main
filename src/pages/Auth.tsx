import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // Signup state
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [token, setToken] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setIsLoading(true);
    try {
      const res = await apiFetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      
      // Debug logging
      console.log('🔐 Login Response:', {
        status: res.status,
        success: data.success,
        hasToken: !!(data.data && data.data.token),
        tokenPreview: data.data?.token ? `${data.data.token.substring(0, 20)}...` : null,
        fullData: data
      });
      
      if (data.success && data.data && data.data.token) {
        setLoginSuccess('Login successful!');
        setToken(data.data.token);
        login(data.data.token);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('✅ Token stored in localStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : null);
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        console.error('❌ Login failed:', data);
        setLoginError(data.error?.message || data.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setLoginError('Network error');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await apiFetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Signup successful! Please check your email to confirm your account.');
        setShowDialog(true);
        setForm({ email: '', password: '', name: '' });
      } else {
        setError(data.error?.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-primary p-3">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold">Welcome to TurfBook</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to book your favorite sports venues
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
                    {loginSuccess && <div className="text-green-500 text-sm">{loginSuccess}</div>}
                    <Button
                      type="submit"
                      className="w-full shadow-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up to start booking amazing turfs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button
                      type="submit"
                      className="w-full shadow-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                  {/* Success Dialog */}
                  {showDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-2">User Created</h2>
                        <p className="mb-4">{success}</p>
                        <Button onClick={() => setShowDialog(false)} className="w-full">OK</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
