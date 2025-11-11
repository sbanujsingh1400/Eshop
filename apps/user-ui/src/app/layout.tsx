import { Toaster } from 'react-hot-toast';
// @ts-ignore
import './global.css';
import Providers from './Providers';
import Header from './shared/widgets';
import {Poppins,Roboto} from 'next/font/google'
import Footer from './shared/modules/footer/Footer';
export const metadata = {
  title: 'Eshop',
  description: 'Ecommerce Website',
}

const roboto = Roboto({
  subsets:["latin"],
  weight:["100","300","400","500","700","900"],
  variable:"--font-roboto"
})

const poppins = Poppins({
  subsets:["latin"],
  weight:["100","300","400","500","700","900"],
  variable:"--font-poppins"
})
const toastOptions:any={
  duration: 3000,

  // 🔥 The new style
  style: {
    borderRadius: '8px',
    // Sampled from the darkest part of your background
    // background: '#1A434A', 
    color: '#222222', // White text
    padding: '16px',
    // A subtle border to lift it off the page
    border: '1px solid rgba(255, 255, 255, 0.2)', 
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // A slightly stronger shadow
  },

  // 🎨 For this design, we ONLY change the icon color, not the background
  success: {
    iconTheme: {
      primary: '#28a745', // Bright green icon
      secondary: '#FFFFFF',
    },
  },
  error: {
    iconTheme: {
      primary: '#dc3545', // Bright red icon
      secondary: '#FFFFFF',
    },
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`} >
      <Providers>
      <Toaster
   // Let's try a different position
  toastOptions={toastOptions}
/>
        <Header />
        {children}
        <Footer />
        </Providers>
   </body>
    </html>
  )
}
