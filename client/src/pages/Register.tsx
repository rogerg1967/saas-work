import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { UserPlus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getIndustries } from "@/api/industries"

type RegisterForm = {
  email: string
  password: string
  name: string
  organization: {
    name: string
    industry: string
  }
}

export function Register() {
  const [loading, setLoading] = useState(false)
  const [industries, setIndustries] = useState<string[]>([])
  const [industryLoading, setIndustryLoading] = useState(true)
  const { toast } = useToast()
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setValue, watch } = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organization: {
        name: "",
        industry: ""
      }
    }
  })

  // Watch the industry value to update it when selected from dropdown
  const selectedIndustry = watch("organization.industry")

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustryLoading(true)
        const response = await getIndustries()
        setIndustries(response.industries)
      } catch (error) {
        console.error("Failed to fetch industries:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load industry options. Please try again.",
        })
      } finally {
        setIndustryLoading(false)
      }
    }

    fetchIndustries()
  }, [toast])

  const onSubmit = async (data: RegisterForm) => {
    console.log("Form submitted with data:", JSON.stringify(data))
    try {
      setLoading(true)
      await registerUser(data)
      toast({
        title: "Success",
        description: "Account created successfully",
      })
      navigate("/subscription")
    } catch (error) {
      console.log("Register error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle industry selection
  const handleIndustryChange = (value: string) => {
    setValue("organization.industry", value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password"
                {...register("password", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register("name", { required: true })}
              />
            </div>

            <div className="pt-2 border-t">
              <h3 className="text-lg font-medium mb-3">Organization Details</h3>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Enter your organization name"
                  {...register("organization.name", { required: true })}
                />
              </div>
              <div className="space-y-2 mt-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  disabled={industryLoading}
                  value={selectedIndustry}
                  onValueChange={handleIndustryChange}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}