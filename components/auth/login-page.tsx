"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (userType: "user" | "admin") => {
    setIsLoading(true)

    // Mock authentication - in real app, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (userType === "admin") {
      // Mock admin credentials
      if (email === "admin@rentkaro.com" && password === "admin123") {
        toast({
          title: "Welcome Admin!",
          description: "Successfully logged in to admin dashboard.",
        })
        router.push("/admin")
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please use admin@rentkaro.com / admin123 for demo.",
          variant: "destructive",
        })
      }
    } else {
      // Mock user login
      if (email && password) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        })
        router.push("/")
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please enter valid email and password.",
          variant: "destructive",
        })
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Welcome to RentKaro</CardTitle>
            <CardDescription>Sign in to your account or access admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">User Login</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleLogin("user")} disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => toast({ title: "Coming Soon", description: "Registration will be available soon!" })}
                  >
                    Sign up
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                  <strong>Demo Credentials:</strong>
                  <br />
                  Email: admin@rentkaro.com
                  <br />
                  Password: admin123
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleLogin("admin")} disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Access Admin Panel"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
