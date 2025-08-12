"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Save,
  Building,
  DollarSign,
  Bell,
  Plug,
  Users,
  Plus,
  Edit,
  Trash2,
  Clock,
  Mail,
  MessageSquare,
  Webhook,
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "operator"
  status: "active" | "inactive"
  lastLogin: string
}

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [generalSettings, setGeneralSettings] = useState({
    businessName: "RentKaro",
    contactEmail: "support@rentkaro.com",
    contactPhone: "+91 98765 43210",
    address: "123 Business Street, Mumbai, Maharashtra 400001",
    operatingHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "10:00", close: "16:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: true },
    },
    termsUrl: "https://rentkaro.com/terms",
    privacyUrl: "https://rentkaro.com/privacy",
  })

  const [pricingSettings, setPricingSettings] = useState({
    categories: [
      { name: "Furniture", hourlyRate: 50, dailyRate: 200, weeklyRate: 1200, monthlyRate: 4000 },
      { name: "Electronics", hourlyRate: 75, dailyRate: 300, weeklyRate: 1800, monthlyRate: 6000 },
      { name: "Appliances", hourlyRate: 60, dailyRate: 250, weeklyRate: 1500, monthlyRate: 5000 },
      { name: "Fitness", hourlyRate: 40, dailyRate: 150, weeklyRate: 900, monthlyRate: 3000 },
    ],
    depositPercentage: 20,
    lateFeePerDay: 100,
    graceDays: 1,
    discounts: {
      weekly: 10,
      monthly: 20,
      bulk: 15,
    },
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: true,
    reminderDays: 2,
    webhookUrl: "https://api.rentkaro.com/webhooks",
    emailTemplates: {
      orderConfirmation: {
        subject: "Order Confirmed - {orderId}",
        body: "Dear {customerName},\n\nYour order {orderId} has been confirmed...",
      },
      pickupReminder: {
        subject: "Pickup Reminder - {orderId}",
        body: "Hi {customerName},\n\nThis is a reminder that your pickup is scheduled...",
      },
      returnReminder: {
        subject: "Return Reminder - {orderId}",
        body: "Hi {customerName},\n\nPlease remember to return your items...",
      },
    },
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    razorpay: {
      enabled: true,
      keyId: "rzp_test_1234567890",
      keySecret: "••••••••••••••••",
    },
    stripe: {
      enabled: false,
      publishableKey: "",
      secretKey: "",
    },
    delivery: {
      dunzo: { enabled: true, apiKey: "••••••••••••••••" },
      swiggy: { enabled: false, apiKey: "" },
      shadowfax: { enabled: false, apiKey: "" },
    },
    analytics: {
      googleAnalytics: { enabled: true, trackingId: "GA-123456789" },
      mixpanel: { enabled: false, projectToken: "" },
      hotjar: { enabled: false, siteId: "" },
    },
  })

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@rentkaro.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15 10:30 AM",
    },
    {
      id: "2",
      name: "Manager User",
      email: "manager@rentkaro.com",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-14 03:45 PM",
    },
    {
      id: "3",
      name: "Operator User",
      email: "operator@rentkaro.com",
      role: "operator",
      status: "inactive",
      lastLogin: "2024-01-10 09:15 AM",
    },
  ])

  const handleSaveSettings = (section: string) => {
    toast.success(`${section} settings saved successfully`)
  }

  const handleUserSave = () => {
    toast.success("User saved successfully")
    setIsUserModalOpen(false)
    setSelectedUser(null)
  }

  const handleUserDelete = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    toast.success("User deleted successfully")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "manager":
        return "secondary"
      case "operator":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings & Configuration</h2>
        <p className="text-muted-foreground">Manage your platform settings and configurations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={generalSettings.businessName}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Business Address</Label>
                  <Textarea
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Terms & Conditions URL</Label>
                  <Input
                    value={generalSettings.termsUrl}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, termsUrl: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Privacy Policy URL</Label>
                  <Input
                    value={generalSettings.privacyUrl}
                    onChange={(e) => setGeneralSettings((prev) => ({ ...prev, privacyUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(generalSettings.operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24 capitalize font-medium">{day}</div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          operatingHours: {
                            ...prev.operatingHours,
                            [day]: { ...hours, closed: !checked },
                          },
                        }))
                      }
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              operatingHours: {
                                ...prev.operatingHours,
                                [day]: { ...hours, open: e.target.value },
                              },
                            }))
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              operatingHours: {
                                ...prev.operatingHours,
                                [day]: { ...hours, close: e.target.value },
                              },
                            }))
                          }
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && <span className="text-muted-foreground">Closed</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSaveSettings("General")}>
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </Button>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rental Rates by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Weekly Rate</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingSettings.categories.map((category, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={category.hourlyRate}
                          onChange={(e) => {
                            const newCategories = [...pricingSettings.categories]
                            newCategories[idx].hourlyRate = Number.parseInt(e.target.value)
                            setPricingSettings((prev) => ({ ...prev, categories: newCategories }))
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={category.dailyRate}
                          onChange={(e) => {
                            const newCategories = [...pricingSettings.categories]
                            newCategories[idx].dailyRate = Number.parseInt(e.target.value)
                            setPricingSettings((prev) => ({ ...prev, categories: newCategories }))
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={category.weeklyRate}
                          onChange={(e) => {
                            const newCategories = [...pricingSettings.categories]
                            newCategories[idx].weeklyRate = Number.parseInt(e.target.value)
                            setPricingSettings((prev) => ({ ...prev, categories: newCategories }))
                          }}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={category.monthlyRate}
                          onChange={(e) => {
                            const newCategories = [...pricingSettings.categories]
                            newCategories[idx].monthlyRate = Number.parseInt(e.target.value)
                            setPricingSettings((prev) => ({ ...prev, categories: newCategories }))
                          }}
                          className="w-24"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fees & Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Deposit Percentage (%)</Label>
                  <Input
                    type="number"
                    value={pricingSettings.depositPercentage}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({ ...prev, depositPercentage: Number.parseInt(e.target.value) }))
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Late Fee Per Day (₹)</Label>
                  <Input
                    type="number"
                    value={pricingSettings.lateFeePerDay}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({ ...prev, lateFeePerDay: Number.parseInt(e.target.value) }))
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Grace Days</Label>
                  <Input
                    type="number"
                    value={pricingSettings.graceDays}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({ ...prev, graceDays: Number.parseInt(e.target.value) }))
                    }
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discounts (%)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Weekly Rental Discount</Label>
                  <Input
                    type="number"
                    value={pricingSettings.discounts.weekly}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({
                        ...prev,
                        discounts: { ...prev.discounts, weekly: Number.parseInt(e.target.value) },
                      }))
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Monthly Rental Discount</Label>
                  <Input
                    type="number"
                    value={pricingSettings.discounts.monthly}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({
                        ...prev,
                        discounts: { ...prev.discounts, monthly: Number.parseInt(e.target.value) },
                      }))
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label>Bulk Order Discount (5+ items)</Label>
                  <Input
                    type="number"
                    value={pricingSettings.discounts.bulk}
                    onChange={(e) =>
                      setPricingSettings((prev) => ({
                        ...prev,
                        discounts: { ...prev.discounts, bulk: Number.parseInt(e.target.value) },
                      }))
                    }
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handleSaveSettings("Pricing")}>
              <Save className="h-4 w-4 mr-2" />
              Save Pricing Settings
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Send email notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, emailEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable WhatsApp integration</p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsappEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, whatsappEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Reminder Days Before Return</Label>
                  <Input
                    type="number"
                    value={notificationSettings.reminderDays}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({ ...prev, reminderDays: Number.parseInt(e.target.value) }))
                    }
                    className="w-32"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Webhook className="h-4 w-4" />
                    Webhook URL
                  </Label>
                  <Input
                    value={notificationSettings.webhookUrl}
                    onChange={(e) => setNotificationSettings((prev) => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notificationSettings.emailTemplates).map(([key, template]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    placeholder="Subject"
                    value={template.subject}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailTemplates: {
                          ...prev.emailTemplates,
                          [key]: { ...template, subject: e.target.value },
                        },
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Email body"
                    value={template.body}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailTemplates: {
                          ...prev.emailTemplates,
                          [key]: { ...template, body: e.target.value },
                        },
                      }))
                    }
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSaveSettings("Notifications")}>
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Payment Gateways
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Razorpay</Label>
                  <Switch
                    checked={integrationSettings.razorpay.enabled}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        razorpay: { ...prev.razorpay, enabled: checked },
                      }))
                    }
                  />
                </div>
                {integrationSettings.razorpay.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label>Key ID</Label>
                      <Input
                        value={integrationSettings.razorpay.keyId}
                        onChange={(e) =>
                          setIntegrationSettings((prev) => ({
                            ...prev,
                            razorpay: { ...prev.razorpay, keyId: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Key Secret</Label>
                      <Input
                        type="password"
                        value={integrationSettings.razorpay.keySecret}
                        onChange={(e) =>
                          setIntegrationSettings((prev) => ({
                            ...prev,
                            razorpay: { ...prev.razorpay, keySecret: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Stripe</Label>
                  <Switch
                    checked={integrationSettings.stripe.enabled}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings((prev) => ({
                        ...prev,
                        stripe: { ...prev.stripe, enabled: checked },
                      }))
                    }
                  />
                </div>
                {integrationSettings.stripe.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label>Publishable Key</Label>
                      <Input
                        value={integrationSettings.stripe.publishableKey}
                        onChange={(e) =>
                          setIntegrationSettings((prev) => ({
                            ...prev,
                            stripe: { ...prev.stripe, publishableKey: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input
                        type="password"
                        value={integrationSettings.stripe.secretKey}
                        onChange={(e) =>
                          setIntegrationSettings((prev) => ({
                            ...prev,
                            stripe: { ...prev.stripe, secretKey: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Partners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(integrationSettings.delivery).map(([partner, config]) => (
                <div key={partner} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{partner}</Label>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) =>
                        setIntegrationSettings((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            [partner]: { ...config, enabled: checked },
                          },
                        }))
                      }
                    />
                  </div>
                  {config.enabled && (
                    <div className="ml-6">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) =>
                          setIntegrationSettings((prev) => ({
                            ...prev,
                            delivery: {
                              ...prev.delivery,
                              [partner]: { ...config, apiKey: e.target.value },
                            },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleSaveSettings("Integrations")}>
              <Save className="h-4 w-4 mr-2" />
              Save Integration Settings
            </Button>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Admin Users
                </CardTitle>
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input placeholder="Enter user name" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="Enter email address" />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUserSave}>Save User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsUserModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleUserDelete(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
