export default function Footer() {
  return (
    <footer className='mt-auto py-4 px-4 text-center text-sm text-gray-600 border-t border-gray-200'>
      Made with joy for{' '}
      <a
        href='https://frontiertower.io'
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-600 hover:text-blue-800 underline'
      >
        FT
      </a>{' '}
      and beyond, by Thomas and{' '}
      <a
        href='https://www.linkedin.com/in/kellj/'
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-600 hover:text-blue-800 underline'
      >
        Kelly
      </a>
    </footer>
  );
}
