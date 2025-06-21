import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  Minus,
  Plus,
  ArrowRight,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSnippets() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-start">
      <MoveGoalCard className="lg:col-span-1" />
      <GetSourceCodeCard className="lg:col-span-2" />
      <TeamMembersCard className="lg:col-span-2" />
      <ChatCard className="lg:col-span-1" />
    </div>
  )
}

function MoveGoalCard({ className }: { className?: string }) {
  const chartData = [40, 60, 30, 80, 50, 70, 45, 90, 65]
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Move Goal</CardTitle>
        <CardDescription>Set your daily activity goal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <p className="text-6xl font-bold">350</p>
            <p className="text-sm text-muted-foreground tracking-widest">
              CALORIES/DAY
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-end justify-center gap-2 h-24 mt-6">
          {chartData.map((height, i) => (
            <div
              key={i}
              className="w-4 bg-primary/90 rounded-t-sm"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Set Goal</Button>
      </CardFooter>
    </Card>
  )
}

function GetSourceCodeCard({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-2xl">Get the source code</CardTitle>
        <p className="font-medium pt-3 text-primary">
          🎉 70% off for the first 20 orders (11 left)
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside">
          <li>Early-bird discount for pre-orders</li>
          <li>Save days of dev time</li>
          <li>Full source code behind the shadcn/ui theme generator</li>
          <li>Quickly enhance your white-label product</li>
        </ul>
        <div className="flex items-baseline gap-2 mt-6">
          <span className="text-muted-foreground line-through text-2xl">
            $158
          </span>
          <span className="text-foreground font-bold text-5xl">$47.40</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <ArrowRight className="mr-2 h-4 w-4" />
          Pre-order
        </Button>
      </CardFooter>
    </Card>
  )
}

const teamMembers = [
  {
    name: "Sofia Davis",
    email: "m@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    role: "Owner",
  },
  {
    name: "Jackson Lee",
    email: "p@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290267072",
    role: "Member",
  },
  {
    name: "Isabella Nguyen",
    email: "i@example.com",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    role: "Member",
  },
]

function TeamMembersCard({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Invite your team members to collaborate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <Button variant="outline">
              {member.role}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ChatCard({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col h-[500px]", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Sofia Davis</p>
            <p className="text-sm text-muted-foreground">m@example.com</p>
          </div>
        </div>
        <Button variant="outline" size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 overflow-y-auto p-4 my-4 custom-scrollbar">
        <div className="flex justify-start">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
            Hi, how can I help you today?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
            Hey, I'm having trouble with my account.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
            What seems to be the problem?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
            I can't log in.
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Input placeholder="Type your message..." />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 