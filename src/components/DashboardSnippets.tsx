import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  // BarChart,
  ChevronDown,
  Minus,
  Plus,
  ArrowRight,
  Send,
} from "lucide-react"

export function DashboardSnippets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-8">
      <MoveGoalCard />
      <GetSourceCodeCard />
      <TeamMembersCard />
      <ChatCard />
    </div>
  )
}

function MoveGoalCard() {
  const chartData = [40, 60, 30, 80, 50, 70, 45, 90, 65]
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <h3 className="font-bold text-lg">Move Goal</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Set your daily activity goal.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
          <Minus className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-6xl font-bold">350</p>
          <p className="text-sm text-muted-foreground tracking-widest">
            CALORIES/DAY
          </p>
        </div>
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
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
      <Button className="w-full mt-6">Set Goal</Button>
    </div>
  )
}

function GetSourceCodeCard() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <h3 className="font-bold text-2xl">Get the source code</h3>
      <p className="font-medium my-3">
        🎉 70% off for the first 20 orders (11 left)
      </p>
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
      <Button className="w-full mt-6">
        <ArrowRight className="mr-2 h-4 w-4" />
        Pre-order
      </Button>
    </div>
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

function TeamMembersCard() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <h3 className="font-bold text-xl">Team Members</h3>
      <p className="text-muted-foreground mb-4">
        Invite your team members to collaborate.
      </p>
      <div className="space-y-4">
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
      </div>
    </div>
  )
}

function ChatCard() {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border flex flex-col h-[500px]">
      <div className="flex items-center justify-between pb-4 border-b">
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
      </div>
      <div className="flex-grow space-y-4 overflow-y-auto p-4 my-4">
        <div className="flex justify-start">
          <div className="bg-muted p-3 rounded-lg max-w-[80%]">
            Hi, how can I help you today?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
            Hey, I'm having trouble with my account.
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-muted  p-3 rounded-lg max-w-[80%]">
            What seems to be the problem?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
            I can't log in.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t">
        <Input placeholder="Type your message..." />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 