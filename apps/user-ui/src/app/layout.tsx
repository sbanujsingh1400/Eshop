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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable}`} >
      <Providers>
        <Toaster toastOptions={{duration:2000}}  />
        <Header />
        {children}
        <Footer />
        </Providers>
   </body>
    </html>
  )
}
