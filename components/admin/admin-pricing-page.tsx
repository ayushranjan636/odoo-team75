"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Clock, Calendar, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface PricingRule {
  id: string
  name: string
  category: string
  hourlyRate: number
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  deposit: number
  isActive: boolean
}

interface Discount {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minAmount: number
  validFrom: string
  validTo: string
  isActive: boolean
}

export function AdminPricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: "1",
      name: "Furniture Standard",
      category: "furniture",
      hourlyRate: 50,
      dailyRate: 300,
      weeklyRate: 1800,
      monthlyRate: 6000,
      deposit: 20,
      isActive: true,
    },
    {
      id: "2",
      name: "Electronics Premium",
      category: "electronics",
      hourlyRate: 100,
      dailyRate: 600,
      weeklyRate: 3600,
      monthlyRate: 12000,
      deposit: 30,
      isActive: true,
    },
  ])

  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: "1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minAmount: 1000,
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      isActive: true,
    },
  ])

  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false)
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    name: "",
    category: "",
    hourlyRate: 0,
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    deposit: 0,
    isActive: true,
  })
  const [newDiscount, setNewDiscount] = useState<Partial<Discount>>({
    code: "",
    type: "percentage",
    value: 0,
    minAmount: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
  })

  const handleAddRule = () => {
    if (!newRule.name || !newRule.category) {
      toast.error("Please fill in all required fields")
      return
    }

    const rule: PricingRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      category: newRule.category!,
      hourlyRate: newRule.hourlyRate || 0,
      dailyRate: newRule.dailyRate || 0,
      weeklyRate: newRule.weeklyRate || 0,
      monthlyRate: newRule.monthlyRate || 0,
      deposit: newRule.deposit || 0,
      isActive: newRule.isActive || true,
    }

    setPricingRules([...pricingRules, rule])
    setNewRule({
      name: "",
      category: "",
      hourlyRate: 0,
      dailyRate: 0,
      weeklyRate: 0,
      monthlyRate: 0,
      deposit: 0,
      isActive: true,
    })
    setIsAddRuleOpen(false)
    toast.success("Pricing rule added successfully")
  }

  const handleAddDiscount = () => {
    if (!newDiscount.code || !newDiscount.validFrom || !newDiscount.validTo) {
      toast.error("Please fill in all required fields")
      return
    }

    const discount: Discount = {
      id: Date.now().toString(),
      code: newDiscount.code!,
      type: newDiscount.type || "percentage",
      value: newDiscount.value || 0,
      minAmount: newDiscount.minAmount || 0,
      validFrom: newDiscount.validFrom!,
      validTo: newDiscount.validTo!,
      isActive: newDiscount.isActive || true,
    }

    setDiscounts([...discounts, discount])
    setNewDiscount({
      code: "",
      type: "percentage",
      value: 0,
      minAmount: 0,
      validFrom: "",
      validTo: "",
      isActive: true,
    })
    setIsAddDiscountOpen(false)
    toast.success("Discount code added successfully")
  }

  const toggleRuleStatus = (id: string) => {
    setPricingRules(pricingRules.map((rule) => (rule.id === id ? { ...rule, isActive: !rule.isActive } : rule)))
    toast.success("Pricing rule status updated")
  }

  const toggleDiscountStatus = (id: string) => {
    setDiscounts(
      discounts.map((discount) => (discount.id === id ? { ...discount, isActive: !discount.isActive } : discount)),
    )
    toast.success("Discount status updated")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">Manage rental rates, deposits, and discount codes</p>
        </div>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pricing Rules</h2>
            <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pricing Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Pricing Rule</DialogTitle>
                  <DialogDescription>Create a new pricing rule for a product category</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        placeholder="e.g., Furniture Standard"
                        value={newRule.name}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-category">Category</Label>
                      <Select
                        value={newRule.category}
                        onValueChange={(value) => setNewRule({ ...newRule, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="appliances">Appliances</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="baby-kids">Baby & Kids</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourly-rate">Hourly Rate (₹)</Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        placeholder="50"
                        value={newRule.hourlyRate}
                        onChange={(e) => setNewRule({ ...newRule, hourlyRate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="daily-rate">Daily Rate (₹)</Label>
                      <Input
                        id="daily-rate"
                        type="number"
                        placeholder="300"
                        value={newRule.dailyRate}
                        onChange={(e) => setNewRule({ ...newRule, dailyRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekly-rate">Weekly Rate (₹)</Label>
                      <Input
                        id="weekly-rate"
                        type="number"
                        placeholder="1800"
                        value={newRule.weeklyRate}
                        onChange={(e) => setNewRule({ ...newRule, weeklyRate: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly-rate">Monthly Rate (₹)</Label>
                      <Input
                        id="monthly-rate"
                        type="number"
                        placeholder="6000"
                        value={newRule.monthlyRate}
                        onChange={(e) => setNewRule({ ...newRule, monthlyRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Deposit Percentage (%)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="20"
                      value={newRule.deposit}
                      onChange={(e) => setNewRule({ ...newRule, deposit: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRule}>Add Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {pricingRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Category: {rule.category}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.isActive} onCheckedChange={() => toggleRuleStatus(rule.id)} />
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Hourly</p>
                        <p className="text-sm text-muted-foreground">₹{rule.hourlyRate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Daily</p>
                        <p className="text-sm text-muted-foreground">₹{rule.dailyRate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Weekly</p>
                        <p className="text-sm text-muted-foreground">₹{rule.weeklyRate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Monthly</p>
                        <p className="text-sm text-muted-foreground">₹{rule.monthlyRate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Deposit</p>
                        <p className="text-sm text-muted-foreground">{rule.deposit}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discount Codes</h2>
            <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Discount Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Discount Code</DialogTitle>
                  <DialogDescription>Create a new discount code for customers</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount-code">Discount Code</Label>
                    <Input
                      id="discount-code"
                      placeholder="e.g., WELCOME10"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount-type">Type</Label>
                      <Select
                        value={newDiscount.type}
                        onValueChange={(value: "percentage" | "fixed") =>
                          setNewDiscount({ ...newDiscount, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-value">Value {newDiscount.type === "percentage" ? "(%)" : "(₹)"}</Label>
                      <Input
                        id="discount-value"
                        type="number"
                        placeholder={newDiscount.type === "percentage" ? "10" : "100"}
                        value={newDiscount.value}
                        onChange={(e) => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-amount">Minimum Order Amount (₹)</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="1000"
                      value={newDiscount.minAmount}
                      onChange={(e) => setNewDiscount({ ...newDiscount, minAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valid-from">Valid From</Label>
                      <Input
                        id="valid-from"
                        type="date"
                        value={newDiscount.validFrom}
                        onChange={(e) => setNewDiscount({ ...newDiscount, validFrom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid-to">Valid To</Label>
                      <Input
                        id="valid-to"
                        type="date"
                        value={newDiscount.validTo}
                        onChange={(e) => setNewDiscount({ ...newDiscount, validTo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDiscountOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDiscount}>Add Discount</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {discount.code}
                        <Badge variant={discount.isActive ? "default" : "secondary"}>
                          {discount.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {discount.type === "percentage" ? `${discount.value}% off` : `₹${discount.value} off`}
                        {" • "}Min order: ₹{discount.minAmount}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={discount.isActive} onCheckedChange={() => toggleDiscountStatus(discount.id)} />
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Valid: {discount.validFrom} to {discount.validTo}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Pricing Settings</CardTitle>
              <CardDescription>Configure global pricing parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" placeholder="18" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="late-fee">Late Fee (₹/day)</Label>
                  <Input id="late-fee" type="number" placeholder="50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grace-period">Grace Period (days)</Label>
                <Input id="grace-period" type="number" placeholder="1" />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
