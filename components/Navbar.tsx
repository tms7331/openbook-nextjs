import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  showBookButton?: boolean;
  showBackButton?: boolean;
}

export function Navbar({
  showBookButton = false,
  showBackButton = false,
}: NavbarProps) {
  return (
    <header className='border-b border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/20 sticky top-0 z-50'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <div className='w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center'>
          <Calendar className='w-5 h-5 text-white' />
        </div>
        <span className='font-bold text-xl text-white'>Book Meeting Room</span>
        <div className='flex items-center space-x-4'>
          {showBackButton && (
            <Link href='/calendars'>
              <Button
                variant='outline'
                size='sm'
                className='border-white/20 text-white hover:bg-white/10 bg-transparent'
              >
                Back to Home
              </Button>
            </Link>
          )}
          {showBookButton && (
            <Link href='/calendars'>
              <Button
                size='sm'
                className='bg-purple-600 hover:bg-purple-700 text-white'
              >
                View Rooms
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
