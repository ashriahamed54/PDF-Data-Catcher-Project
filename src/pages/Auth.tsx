import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthError = (error: any) => {
    console.error("Authentication error:", error);
    
    const errorCode = error.code || "";
    const errorMessage = error.message || "An unknown error occurred";
    
    switch (errorCode) {
      case "auth/user-not-found":
        toast.error("No user found with this email address");
        break;
      case "auth/wrong-password":
        toast.error("Invalid password");
        break;
      case "auth/invalid-credential":
        toast.error("Invalid credentials. Please check your email and password.");
        break;
      case "auth/email-already-in-use":
        toast.error("Email already registered");
        break;
      case "auth/weak-password":
        toast.error("Password is too weak");
        break;
      case "auth/network-request-failed":
        toast.error("Network error - please check your connection");
        break;
      default:
        toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const isAdmin = await signIn(email, password);
        toast.success("Logged in successfully!");
        
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        await signUp(email, password);
        toast.success("Account created successfully! Please log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4 pt-safe pb-safe">
      <Card className="w-full max-w-md p-6 bg-card space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Enter your information to create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined });
              }}
              disabled={isLoading}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={isLogin ? "Enter your password" : "Choose a strong password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: undefined });
              }}
              disabled={isLoading}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Sign up
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setEmail("");
              setPassword("");
            }}
            disabled={isLoading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
