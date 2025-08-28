import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar showBookButton={true} />

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Meeting Room
            <br />
            <span className="text-accent">Booking</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto text-pretty">
            Book conference rooms quickly and easily
          </p>
          <Link href="/calendars">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Calendar className="w-5 h-5 mr-2" />
              View Meeting Rooms
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 bg-sidebar border-t border-sidebar-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">Meeting Room Booking</span>
          </div>
          <p className="text-sidebar-foreground/70 text-sm mb-4">All bookings are managed via Google Calendar</p>
          <div className="text-sm text-sidebar-foreground/70">© 2024 Meeting Room Booking System. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}