'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] });

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#EBE3DA] flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      
      {/* Background Watermarks */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center grayscale opacity-[0.03] mix-blend-multiply">
        <Image src="/top-floral.png" alt="watermark" fill className="object-cover scale-150" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Top Leaf Decoration */}
        <div className="relative w-[120px] h-[80px] mb-6">
          <Image src="/pill-top-leaf.png" alt="leaf" fill className="object-contain" />
        </div>

        <p className="text-[#68715D] text-[9px] uppercase tracking-[0.3em] font-bold mb-6">
          Welcome to the wedding of
        </p>

        <h1 className={`${greatVibes.className} text-[72px] text-[#9C4A42] leading-[0.8] mb-8 drop-shadow-sm`}>
          Abdeali <br/>
          <span className="text-[40px] text-[#657059] leading-[2]">&</span> <br/>
          Sarrah
        </h1>

        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#B38B4D] to-transparent mb-8" />

        <div className="bg-[#FCFAF8]/60 backdrop-blur-md border border-[#B38B4D]/30 p-6 rounded-3xl shadow-[0_10px_30px_rgba(90,46,46,0.05)] max-w-[320px]">
          <p className="text-[#5A2E2E] text-[10px] uppercase tracking-[0.2em] leading-relaxed font-bold">
            Please use the personalized link provided by the family to view your invitation and RSVP.
          </p>
        </div>

        {/* Bottom Floral Decoration */}
        <div className="relative w-[100px] h-[100px] mt-12 opacity-80">
          <Image src="/pill-bottom-floral.png" alt="floral" fill className="object-contain" />
        </div>

      </motion.div>
    </main>
  );
}