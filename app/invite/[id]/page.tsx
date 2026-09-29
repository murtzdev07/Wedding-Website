'use client';
import { useState, useEffect, use ,useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Great_Vibes, Alex_Brush } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] });
const alexBrush = Alex_Brush({ weight: '400', subsets: ['latin'] });

// Wedding Events Data (Title updated to match Admin Panel exactly)
const allEvents = [
  {
    title: "Mehendi",
    day: "Wednesday",
    date: "30",
    monthYear: "DEC. 2026",
    hijri: "22nd Rajab al-Asab 1448",
    time: "LUNCH : 12:00 pm",
    venue: "Paradise Farm",
  },
  {
    title: "Darees & Katha",
    day: "Thursday",
    date: "31",
    monthYear: "DEC. 2026",
    hijri: "23rd Rajab al-Asab 1448",
    time: "DINNER : 8:00 pm",
    venue: "Burhani Mohalla Masjid",
    extra: "Khatamat • Sehra • Hussain",
  },
  {
    title: "Walima",
    day: "Friday",
    date: "1",
    monthYear: "JANUARY 2027",
    hijri: "24th Rajab al-Asab 1448",
    time: "LUNCH : 1:00 pm",
    venue: "Burhani Mohalla Masjid",
  },
  {
    title: "Pannat",
    day: "Friday",
    date: "1",
    monthYear: "JANUARY 2027",
    hijri: "24th Rajab al-Asab 1448",
    time: "DINNER : 8:00 pm",
    venue: "Saifee Mohalla Masjid",
  }
];

// NEW: Helper function to generate native Calendar events
const downloadCalendarEvent = (e: React.MouseEvent, event: any) => {
  e.stopPropagation();

  // Map your specific events to standard calendar date formats (YYYYMMDDTHHmmss)
  let start = "";
  let end = "";

  if (event.title.includes("Mehendi")) {
    start = "20261230T120000"; end = "20261230T160000";
  } else if (event.title.includes("Darees")) {
    start = "20261231T200000"; end = "20261231T233000";
  } else if (event.title.includes("Walima")) {
    start = "20270101T130000"; end = "20270101T163000";
  } else if (event.title.includes("Pannat")) {
    start = "20270101T200000"; end = "20270101T233000";
  }

  // Construct the industry-standard .ics file format
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:Abdeali & Sarrah - ${event.title}`,
    `LOCATION:${event.venue}`,
    `DESCRIPTION:We look forward to celebrating with you!`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join('\r\n');

  // Create a blob and trigger an invisible download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Abdeali_Sarrah.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function EventFlipCard({ 
  event, 
  guest, 
  onRsvpSuccess 
}: { 
  event: any; 
  guest: any; 
  onRsvpSuccess?: () => void; 
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Extract this event's specific RSVP state from the JSONB column
  const eventConfig = guest.event_rsvps?.[event.title] || {
    max_guests: guest.max_guests || 2,
    status: 'Pending',
    pax: 1
  };

  const [decision, setDecision] = useState<'Attending' | 'Declined'>(
    eventConfig.status === 'Declined' ? 'Declined' : 'Attending'
  );
  const [paxCount, setPaxCount] = useState<number>(
    eventConfig.pax > 0 ? eventConfig.pax : Math.min(eventConfig.max_guests, 1)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(eventConfig.status !== 'Pending');

  const maxAllowed = eventConfig.max_guests || 2;

  const handleSaveRsvp = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);

    const updatedRsvps = {
      ...(guest.event_rsvps || {}),
      [event.title]: {
        allowed: true,
        max_guests: maxAllowed,
        status: decision,
        pax: decision === 'Attending' ? paxCount : 0
      }
    };

    try {
      const { error } = await supabase
        .from('guests')
        .update({ event_rsvps: updatedRsvps })
        .eq('id', guest.id);

      if (error) throw error;
      setSaveSuccess(true);
      if (onRsvpSuccess) onRsvpSuccess();
    } catch (err) {
      console.error("RSVP error:", err);
      alert("Unable to save RSVP. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative w-[350px] h-[580px] my-6"
      style={{ perspective: "2000px" }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 45, damping: 15 }}
        className="w-full h-full relative"
        // Force GPU rendering to prevent blurring
        style={{ transformStyle: "preserve-3d" }} 
      >
        {/* FRONT OF CARD */}
        <div
          onClick={() => setIsFlipped(true)}
          className="absolute inset-0 bg-[#FCFAF8] rounded-t-full rounded-b-[40px] shadow-[0_20px_50px_rgba(90,46,46,0.12)] flex flex-col items-center justify-between py-10 px-6 overflow-hidden cursor-pointer"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1px)", WebkitFontSmoothing: "antialiased" }}
        >
          <div className="absolute inset-3 border border-[#B38B4D]/30 rounded-t-full rounded-b-[30px] pointer-events-none" />

          <div className="flex flex-col items-center z-10">
            <div className="relative w-[120px] h-[80px] mb-1 -mt-4">
              <Image src="/pill-top-leaf.png" alt="leaf detail" fill className="object-contain object-bottom scale-[1.25] -translate-y-4" />
            </div>
            <p className="text-[#68715D] text-[11px] tracking-[0.3em] uppercase font-bold drop-shadow-sm">{event.day}</p>
          </div>

          <div className="flex flex-col items-center z-10 w-full -mt-1">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-[#8B3A43] text-[100px] font-serif leading-[0.8] tracking-tighter drop-shadow-sm">{event.date}</h2>
              <div className="flex flex-col justify-center">
                <p className="text-[#B38B4D] text-[12px] tracking-[0.25em] font-bold font-sans uppercase leading-tight">
                  {event.monthYear.split(' ')[0]}
                </p>
                <p className="text-[#B38B4D] text-[12px] tracking-[0.25em] font-bold font-sans uppercase leading-tight mt-0.5">
                  {event.monthYear.split(' ')[1]}
                </p>
              </div>
            </div>
            <p className="text-[#68715D] text-[9.5px] tracking-[0.2em] uppercase mt-8 font-medium">{event.hijri}</p>
          </div>

          <div className="flex-1 flex items-center justify-center w-full z-10 mt-6">
            <h3 className={`${greatVibes.className} text-[#8B3A43] text-[58px] leading-none text-center drop-shadow-md`}>
              {event.title}
            </h3>
          </div>

          <div className="flex flex-col items-center z-10 mb-2">
            <div className="relative w-[80px] h-[80px] mb-4">
              <Image src="/pill-bottom-floral.png" alt="floral" fill className="object-contain" />
            </div>
            <span className="text-[8px] text-[#8B3A43] uppercase tracking-[0.3em] font-bold animate-pulse bg-[#FCFAF8] border border-[#B38B4D]/30 px-6 py-2 rounded-full shadow-sm hover:bg-[#F3E8DF] transition-colors">
              Tap to RSVP & Info
            </span>
          </div>
        </div>

        {/* BACK OF CARD: DETAILS + INLINE RSVP */}
        <div
          // RESTORED: Clicking anywhere on the background flips the card back
          onClick={() => setIsFlipped(false)}
          className="absolute inset-0 bg-gradient-to-br from-[#8B3A43] to-[#6b2c33] rounded-t-full rounded-b-[40px] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between pt-12 pb-6 px-7 text-center overflow-hidden cursor-pointer"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)", WebkitFontSmoothing: "antialiased" }}
        >
          <div className="absolute inset-3 border border-[#B38B4D]/30 rounded-t-full rounded-b-[30px] pointer-events-none z-0" />

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute top-6 right-6 z-50 p-2 text-[#B38B4D] hover:text-[#FCFAF8] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          {/* INNER CONTENT WRAPPER: Protects the form and buttons from triggering the flip-back */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative z-20 flex flex-col items-center w-[270px] mt-4 cursor-default"
          >
            {/* FIXED: Dynamic font size. Long titles (length > 10) shrink to fit perfectly */}
            <p className={`${greatVibes.className} text-[#FCFAF8] ${event.title.length > 10 ? 'text-[38px]' : 'text-[45px]'} leading-none mb-5 drop-shadow-lg whitespace-nowrap`}>
              {event.title}
            </p>

            {/* Time & Venue Mini Box */}
            <div className="w-full bg-[#FCFAF8]/10 rounded-xl border border-[#B38B4D]/30 overflow-hidden mb-5 text-xs shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#B38B4D]/20">
                <span className="text-[#B38B4D] uppercase tracking-widest font-bold text-[8.5px]">Time</span>
                <span className="text-[#FCFAF8] font-medium tracking-wide text-[11px]">{event.time}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#5A2E2E]/30">
                <span className="text-[#B38B4D] uppercase tracking-widest font-bold text-[8.5px]">Venue</span>
                <span className="text-[#FCFAF8] font-medium text-right truncate max-w-[160px] text-[11px]">{event.venue}</span>
              </div>
            </div>

            {/* Map & Save Date Actions */}
            <div 
              className="flex gap-3 w-full mb-5"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={`https://maps.google.com/?q=${event.venue}`}
                target="_blank"
                className="flex-1 py-2.5 bg-[#B38B4D] text-[#5A2E2E] rounded-lg text-[8.5px] uppercase tracking-widest font-bold shadow-md transition-colors flex items-center justify-center"
              >
                Map
              </motion.a>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => downloadCalendarEvent(e, event)}
                className="flex-1 py-2.5 bg-transparent border border-[#B38B4D] text-[#FCFAF8] rounded-lg text-[8.5px] uppercase tracking-widest font-bold shadow-md transition-colors"
              >
                Calendar
              </motion.button>
            </div>

            {/* MODERN INLINE RSVP PANEL */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full bg-[#FCFAF8]/10 border border-[#B38B4D]/40 rounded-2xl p-4 shadow-xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-[#B38B4D]/20 pb-2.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#B38B4D] font-bold">
                  RSVP For Event
                </span>
                {saveSuccess && (
                  <span className="text-[8.5px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    ✓ Saved
                  </span>
                )}
              </div>

              {/* Attending vs Decline Segmented Control */}
              <div className="grid grid-cols-2 gap-2 bg-[#5A2E2E]/50 p-1.5 rounded-xl border border-[#B38B4D]/20">
                <button
                  type="button"
                  onClick={() => setDecision('Attending')}
                  className={`py-2 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all ${
                    decision === 'Attending'
                      ? 'bg-[#B38B4D] text-[#5A2E2E] shadow-sm'
                      : 'text-[#FCFAF8]/70 hover:text-[#FCFAF8]'
                  }`}
                >
                  Attending
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('Declined')}
                  className={`py-2 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all ${
                    decision === 'Declined'
                      ? 'bg-[#5A2E2E] text-[#FCFAF8] shadow-sm border border-[#B38B4D]/30'
                      : 'text-[#FCFAF8]/70 hover:text-[#FCFAF8]'
                  }`}
                >
                  Decline
                </button>
              </div>

              {/* Pax Stepper (Visible only if attending) */}
              {decision === 'Attending' && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#FCFAF8]/90 font-bold">
                    Guests (Max {maxAllowed}):
                  </span>
                  <div className="flex items-center gap-3 bg-[#5A2E2E]/50 border border-[#B38B4D]/40 rounded-lg px-2.5 py-1">
                    <button
                      type="button"
                      disabled={paxCount <= 1}
                      onClick={() => setPaxCount(p => Math.max(1, p - 1))}
                      className="text-base font-bold text-[#B38B4D] hover:text-[#FCFAF8] disabled:opacity-30 px-1 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-[#FCFAF8] w-4 text-center">
                      {paxCount}
                    </span>
                    <button
                      type="button"
                      disabled={paxCount >= maxAllowed}
                      onClick={() => setPaxCount(p => Math.min(maxAllowed, p + 1))}
                      className="text-base font-bold text-[#B38B4D] hover:text-[#FCFAF8] disabled:opacity-30 px-1 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSaving}
                onClick={handleSaveRsvp}
                className="w-full py-3 bg-[#FCFAF8] text-[#8B3A43] rounded-xl text-[9.5px] uppercase tracking-[0.25em] font-bold shadow-lg hover:bg-[#EBE3DA] transition-all flex items-center justify-center mt-1"
              >
                {isSaving ? "Saving..." : saveSuccess ? "Update RSVP" : "Confirm Attendance"}
              </motion.button>
            </div>
          </div>
          
          <span className="text-[7.5px] text-[#FCFAF8]/60 uppercase tracking-[0.2em] font-medium z-20 pointer-events-none mt-4">
            Tap background to close
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
// UPDATED INTERACTIVE DROPDOWN COMPONENT (Dynamic Max Guests)
function GuestDropdown({ selected, setSelected, maxGuests }: { selected: string, setSelected: (val: string) => void, maxGuests: number }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Dynamically generate options based on the maxGuests database limit
  const options = [
    ...Array.from({ length: maxGuests }, (_, i) => ({
      label: `${i + 1} Person${i === 0 ? '' : 's'}`,
      value: String(i + 1)
    })),
    { label: "Regretfully Decline", value: "0" }
  ];

  return (
    <div className="relative group w-full mt-2 z-30">
      <input type="hidden" name="guests" value={selected} required />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-b border-[#B38B4D]/40 py-3 flex items-center justify-between cursor-pointer transition-colors hover:border-[#8B3A43]"
      >
        <span className={`text-base ${selected ? 'text-[#8B3A43] font-medium' : 'text-[#68715D]'}`}>
          {selected ? options.find(o => o.value === selected)?.label : "Number of Guests Attending"}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="text-[#B38B4D]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full mt-2 bg-[#FCFAF8] border border-[#B38B4D]/20 rounded-xl shadow-[0_15px_40px_rgba(139,58,67,0.15)] overflow-hidden origin-top z-40"
          >
            {options.map((option) => (
              <div 
                key={option.value}
                onClick={() => { setSelected(option.value); setIsOpen(false); }}
                className="px-5 py-3.5 text-[#5A2E2E] text-sm hover:bg-[#EBE3DA]/50 hover:text-[#8B3A43] cursor-pointer transition-colors border-b border-[#B38B4D]/5 last:border-0"
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UPDATED RSVP FORM (Passes the max_guests down)
function RSVPForm({ guest }: { guest: { id: string; name: string; allowed_events: string[]; max_guests: number; } }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedGuests, setSelectedGuests] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGuests) return alert("Please select the number of guests attending.");
    
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    const guestCount = Number(formData.get('guests'));
    const message = formData.get('message') as string;

    try {
      const { error } = await supabase
        .from('guests')
        .update({ 
          status: 'Accepted', 
          guest_count: guestCount, 
          notes: message 
        })
        .eq('id', guest.id);

      if (error) throw error;
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="bg-[#FCFAF8] p-10 rounded-[40px] border border-[#B38B4D]/40 text-center shadow-[0_20px_50px_rgba(139,58,67,0.1)]"
      >
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 bg-[#8B3A43]/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-[#8B3A43]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
        </motion.div>
        <h3 className={`${greatVibes.className} text-6xl text-[#8B3A43] mb-4 drop-shadow-sm`}>Thank You, {guest.name.split(' ')[0]}!</h3>
        <p className="text-[#68715D] text-sm tracking-[0.2em] font-medium uppercase">Your RSVP is confirmed.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
      <div className="w-full bg-[#FCFAF8] shadow-[inset_0_0_20px_rgba(179,139,77,0.1)] border border-[#B38B4D]/30 rounded-2xl py-5 px-4 flex flex-col justify-center text-center">
        <p className="text-[#68715D] text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Invitation For</p>
        <p className="text-[#8B3A43] text-2xl font-serif italic drop-shadow-sm">{guest.name}</p>
      </div>

      {/* Passing down maxGuests from the database to strictly limit the dropdown */}
      <GuestDropdown selected={selectedGuests} setSelected={setSelectedGuests} maxGuests={guest.max_guests} />

      <div className="mt-2">
        <p className="text-[#68715D] text-[11px] uppercase tracking-[0.25em] mb-5 font-bold border-b border-[#B38B4D]/30 pb-3">Events You Are Attending</p>
        <div className="flex flex-col gap-4">
          {guest.allowed_events.map((event) => (
            <label key={event} className="flex items-center gap-4 cursor-pointer group">
              <input type="checkbox" name="events" value={event} defaultChecked className="w-5 h-5 accent-[#8B3A43] cursor-pointer shadow-sm" />
              <span className="text-[#5A2E2E] text-base font-medium tracking-wide group-hover:text-[#8B3A43] transition-colors">{event}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="relative group mt-2">
        <textarea name="message" rows={3} placeholder=" " className="peer w-full bg-transparent border-b border-[#B38B4D]/40 py-3 text-[#5A2E2E] text-base focus:outline-none focus:border-[#8B3A43] transition-colors resize-none placeholder-transparent"></textarea>
        <label className="absolute left-0 top-3 text-[#68715D] text-base transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#8B3A43] peer-focus:font-bold">
          Wishes or Dietary Requirements
        </label>
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">Something went wrong. Please try again.</p>
      )}

      <motion.button 
        whileHover={{ scale: 1.02, backgroundColor: "#6b2c33", boxShadow: "0 15px 30px rgba(139,58,67,0.3)" }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        disabled={status === 'loading'}
        className="mt-4 w-full bg-[#8B3A43] text-[#FCFAF8] py-5 rounded-2xl text-[12px] uppercase tracking-[0.3em] font-bold shadow-[0_10px_20px_rgba(139,58,67,0.2)] transition-all flex justify-center items-center h-16"
      >
        {status === 'loading' ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-[#FCFAF8]/30 border-t-[#FCFAF8] rounded-full" />
        ) : (
          "Send RSVP"
        )}
      </motion.button>
    </form>
  );
}
// NEW: High-End Live Countdown Component
function WeddingCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Target Date: Mehendi Event (Dec 30, 2026 at 12:00 PM)
    const targetDate = new Date("December 30, 2026 12:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return <div className="h-[150px] w-full" />; // Prevents layout shift while loading

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds }
  ];

  return (
    <div className="flex justify-center gap-4 sm:gap-6 w-full px-4 relative z-20">
      {timeBlocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center group">
          <div className="relative w-[65px] h-[85px] sm:w-[85px] sm:h-[105px] bg-gradient-to-b from-[#FCFAF8] to-[#EBE3DA]/40 rounded-2xl border border-[#B38B4D]/40 shadow-[0_15px_30px_rgba(90,46,46,0.08)] flex items-center justify-center mb-4 overflow-hidden">
            {/* Elegant Glass Reflection Effect */}
            <div className="absolute top-0 w-full h-[50%] bg-white/60 border-b border-[#B38B4D]/10 backdrop-blur-sm z-0" />
            
            <span className="relative z-10 text-3xl sm:text-5xl font-serif text-[#8B3A43] drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[#68715D] text-[8px] sm:text-[9px] uppercase tracking-[0.3em] font-bold transition-colors group-hover:text-[#8B3A43]">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// MAIN PAGE COMPONENT - NOW PROPERLY UNWRAPPING THE PROMISE PARAMS
export default function PersonalizedWeddingInvite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [isOpen, setIsOpen] = useState(false);
  const [guest, setGuest] = useState<{ id: string; name: string; allowed_events: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: Audio References
  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const doorSfxRef = useRef<HTMLAudioElement>(null);

  // NEW: The Interaction Handler
  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (doorSfxRef.current) doorSfxRef.current.play();
    if (bgMusicRef.current) {
       bgMusicRef.current.volume = 0.4; // Keep background music soft
       bgMusicRef.current.play();
    }
  };

  useEffect(() => {
    async function fetchGuest() {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setGuest(data);
      setLoading(false);
    }
    fetchGuest();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#EBE3DA] flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-8 h-8 border-2 border-[#B38B4D]/30 border-t-[#8B3A43] rounded-full mb-4" />
        <p className="text-[#8B3A43] text-[9px] uppercase tracking-[0.2em] font-bold">Unsealing Invitation...</p>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="w-full min-h-screen bg-[#EBE3DA] flex items-center justify-center text-center px-6">
        <div>
          <h1 className={`${greatVibes.className} text-5xl text-[#8B3A43] mb-4`}>Invitation Not Found</h1>
          <p className="text-[#68715D] text-xs uppercase tracking-widest">Please verify the link provided to you.</p>
        </div>
      </div>
    );
  }

  const filteredEvents = allEvents.filter(event => guest.allowed_events.includes(event.title));

  // NEW: Ambient Live Background
function AmbientDust() {
  // Generates 20 random particles
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#B38B4D] rounded-full mix-blend-overlay"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [null, 0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

  return (
<main className="relative w-full min-h-screen bg-[#EBE3DA] overflow-x-hidden flex flex-col">
      {/* Hidden Audio Elements */}
      <audio ref={bgMusicRef} src="/bg-music.mp3" loop preload="auto" />
      <audio ref={doorSfxRef} src="/door-open.mp3" preload="auto" />
      <AmbientDust/>

      <section className="relative w-full h-[100dvh] flex justify-center shrink-0">
        
        <AnimatePresence>
          {!isOpen && (
            <div className="absolute bottom-0 flex justify-center w-full max-w-[390px] h-[95dvh] z-10 perspective-[1400px]">
              
              {/* LEFT DOOR */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isOpen ? -120 : 0 }}
                exit={{ rotateY: -120, opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'left' }}
                className="relative w-1/2 h-full bg-[#EBE3DA] rounded-tl-[195px] shadow-[-15px_10px_30px_rgba(0,0,0,0.15)] overflow-hidden z-20 border-r border-[#5A2E2E]/10"
              >
                {/* Subtle Breathing Animation for Top Floral */}
                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-2 left-0 w-[390px] h-[220px] pointer-events-none origin-top-left"
                >
                  <Image src="/top-floral.png" alt="Top Flora" fill className="object-contain object-top scale-[0.75]" />
                </motion.div>
                
                {/* Subtle Breathing Animation for Bottom Floral */}
                <motion.div 
                  animate={{ scale: [1, 1.03, 1] }} 
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-0 left-0 w-[390px] h-[280px] pointer-events-none origin-bottom-left"
                >
                  <Image src="/bottom-floral.png" alt="Bottom Flora" fill className="object-contain object-bottom scale-[0.85]" />
                </motion.div>
              </motion.div>

              {/* RIGHT DOOR */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isOpen ? 120 : 0 }}
                exit={{ rotateY: 120, opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'right' }}
                className="relative w-1/2 h-full bg-[#EBE3DA] rounded-tr-[195px] shadow-[15px_10px_30px_rgba(0,0,0,0.15)] overflow-hidden z-20"
              >
                {/* Subtle Breathing Animation for Top Floral */}
                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-2 right-0 w-[390px] h-[220px] pointer-events-none origin-top-right"
                >
                  <Image src="/top-floral.png" alt="Top Flora" fill className="object-contain object-top scale-[0.75]" />
                </motion.div>
                
                {/* Subtle Breathing Animation for Bottom Floral */}
                <motion.div 
                  animate={{ scale: [1, 1.03, 1] }} 
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-0 right-0 w-[390px] h-[280px] pointer-events-none origin-bottom-right"
                >
                  <Image src="/bottom-floral.png" alt="Bottom Flora" fill className="object-contain object-bottom scale-[0.85]" />
                </motion.div>
              </motion.div>

              {/* CENTER PILL BADGE - Upgraded with Light Sweep, Audio Trigger, and Surrounding Glow Particles */}
              <motion.div
                onClick={handleOpenInvitation}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
              >
                {/* Ambient glowing orb behind the badge */}
                <motion.div 
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-20px] bg-[#B38B4D]/20 rounded-[70px] blur-xl -z-10 pointer-events-none"
                />

                <div className="relative w-[130px] h-[220px] bg-[#FCFAF8] rounded-[55px] border border-[#B38B4D]/40 shadow-[0_15px_35px_rgba(40,20,20,0.2)] flex flex-col items-center justify-center overflow-hidden">
                  
                  {/* Continuous Golden Light Sweep */}
                  <motion.div 
                    animate={{ left: ['-100%', '200%'] }} 
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} 
                    className="absolute top-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-[30deg] z-40 pointer-events-none" 
                  />

                  {/* Gentle Floating Animation for Inner Leaf */}
                  <motion.div 
                    animate={{ y: [0, -3, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-7px] left-2 w-full h-[75px] pointer-events-none z-10"
                  >
                    <Image src="/pill-top-leaf.png" alt="Top Leaf" fill className="object-contain object-left-top p-2 scale-110" />
                  </motion.div>

                  <div className="absolute -bottom-8 left-[-13px] w-full h-[95px] pointer-events-none z-10">
                    <Image src="/pill-bottom-floral.png" alt="Bottom Floral" fill className="object-contain object-bottom scale-[1.15]" />
                  </div>
                  
                  {/* Slowly Rotating Curved Text */}
                  <motion.svg 
                    animate={{ rotate: [0, 2, -2, 0] }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-full h-full pointer-events-none z-20 origin-center" 
                    viewBox="0 0 130 220"
                  >
                    <path id="textCurve" d="M 65 14 A 51 51 0 0 1 116 65 L 116 155 A 51 51 0 0 1 65 206" fill="transparent" stroke="transparent"/>
                    <text className="font-serif text-[10px] font-medium uppercase" style={{ letterSpacing: '0.16em' }}>
                      <textPath href="#textCurve" startOffset="46%" textAnchor="middle">
                        <tspan fill="#68715D">Abdeali</tspan><tspan fill="#B38B4D"> • </tspan><tspan fill="#994B4E">Weds</tspan><tspan fill="#B38B4D"> • </tspan><tspan fill="#68715D">Sarrah</tspan>
                      </textPath>
                    </text>
                  </motion.svg>
                  
                  <div className="relative w-[75px] h-[75px] scale-[1.3] z-20 -ml-2 mt-1">
                    <Image src="/monogram.png" alt="AS Monogram" fill className="object-contain drop-shadow-sm transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  
                  <span className="absolute bottom-2 px-3 py-1.5 bg-gradient-to-r from-[#B38B4D] to-[#9C4A42] rounded-full text-[7px] font-bold tracking-[0.25em] text-[#FCFAF8] uppercase shadow-md animate-pulse z-30">
                    Tap to Open
                  </span>
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>

        {/* ========================================= */}
        {/* 📱 MANUAL DEVICE CONFIGURATION PANEL      */}
        {/* Change values below to perfectly fit any phone */}
        {/* ========================================= */}
        <style dangerouslySetInnerHTML={{__html: `
          /* 1. DEFAULT / MEDIUM PHONES (iPhone 14 Pro, 15 Pro, Google Pixel) */
          /* Approx Screen Width: 390px to 410px */
          .inner-envelope { border-radius: 195px 195px 0 0; }
          .top-floral     { width: 320px; height: 220px; top: -25px; }
          .bottom-floral  { width: 200px; height: 200px; bottom: 20px; left: -12px; }
          .text-container { padding-top: 128px;  }
          .name-text      { font-size: 58px; }
          .ampersand-box  { margin-top: 12px;  }
          .ampersand      { font-size: 40px;}
          .sarrah-box     { margin-top: 12px; }
          .bottom-section { margin-top: 20px; }

          /* 2. SMALL PHONES (Samsung S24, iPhone 12 Mini, 13 Mini) */
          /* Approx Screen Width: 360px to 375px */
          @media screen and (max-width: 380px) {
            .inner-envelope { border-radius: 175px 175px 0 0; }
            .top-floral     { width: 270px; height: 180px; top: -5px; }
            .bottom-floral  { width: 180px; height: 180px; bottom: 98px; left: -16px; }
            .text-container { padding-top: 110px; }
            .name-text      { font-size: 65px; }
            .ampersand-box  { margin-top: 25px; }
            .ampersand      { font-size: 36px; }
            .sarrah-box     { margin-top: 25px; }
            .bottom-section { margin-top: 25px; }
          }

          /* 3. LARGE PHONES (iPhone 14 Pro Max, 15 Pro Max, S24/S27 Ultra) */
          /* Approx Screen Width: 412px to 430px+ */
          @media screen and (min-width: 412px) {
            .inner-envelope { border-radius: 195px 195px 0 0; }
            .top-floral     { width: 300px; height: 200px; top: -20px; }
            .bottom-floral  { width: 190px; height: 190px; bottom: 80px; left: -18px; }
            .text-container { padding-top: 120px; }
            .name-text      { font-size: 78px; }
            .ampersand-box  { margin-top: 16px; }
            .ampersand      { font-size: 48px; }
            .sarrah-box     { margin-top: 16px; }
            .bottom-section { margin-top: 25px; }
        }
          /* 4. EXTRA LARGE PHONES (iPhone 16 Pro Max, 17/18 Pro Max) */
          /* Approx Screen Width: 436px+ */
          @media screen and (min-width: 436px) {
            .inner-envelope { border-radius: 205px 205px 0 0; }
            .top-floral     { width: 360px; height: 260px; top: -12px; }
            .bottom-floral  { width: 240px; height: 240px; bottom: 115px; left: -8px; }
            .text-container { padding-top: 155px; }
            .name-text      { font-size: 84px; }
            .ampersand-box  { margin-top: 24px; }
            .ampersand      { font-size: 52px; }
            .sarrah-box     { margin-top: 24px; }
            .bottom-section { margin-top:170px; }
          }
        `}} />

        <div className="inner-envelope absolute bottom-0 flex flex-col items-center justify-start w-full max-w-[390px] h-[95dvh] mx-auto z-0 bg-[#EBE3DA] overflow-hidden border-t border-x border-[#C3B3A3]/70 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
          
          <motion.div animate={{ opacity: isOpen ? 0.04 : 0 }} transition={{ duration: 2, delay: 0.8 }} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center grayscale">
            <Image src="/top-floral.png" alt="watermark" fill className="object-cover scale-150 opacity-50" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -30 }} animate={isOpen ? { opacity: 0.9, y: [0, -5, 0] } : { opacity: 0, y: -30 }} transition={{ opacity: { duration: 1, delay: 0.6 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }} className="top-floral absolute left-1/2 -translate-x-1/2 pointer-events-none z-0">
            <Image src="/top-floral.png" alt="Inner Top Floral" fill className="object-contain object-top scale-[0.65]" />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -20, y: 20 }} animate={isOpen ? { opacity: 1, x: 0, y: [0, 4, 0] } : { opacity: 0, x: -20, y: 20 }} transition={{ opacity: { duration: 1, delay: 0.6 }, x: { duration: 1, delay: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }} className="bottom-floral absolute pointer-events-none z-0">
            <Image src="/inner-bottom-floral.png" alt="Inner Bottom Floral" fill className="object-contain object-left-bottom scale-[0.9] -rotate-[85deg]" />
          </motion.div>

          <div className="text-container relative z-10 flex flex-col items-center justify-start text-center px-4 w-full h-full">
            <motion.div initial={{ opacity: 0, y: 15, filter: "blur(4px)" }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 15, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.8 }} className="mb-4 space-y-2 cursor-default group relative z-10">
              <p className="text-[8.5px] text-[#B38B4D] uppercase tracking-[0.25em] leading-relaxed font-sans font-bold transition-colors duration-500 group-hover:text-[#8B3A43]">
                By The Grace of Almighty Allah & Dua mubarak of
              </p>
              <motion.p whileHover={{ scale: 1.02, textShadow: "0px 4px 12px rgba(139,58,67,0.2)" }} className="text-[11px] text-[#8B3A43] font-bold leading-relaxed tracking-[0.08em] font-sans drop-shadow-[0_2px_4px_rgba(139,58,67,0.15)] transition-all duration-300">
                Al Hayyul Muqaddas Dr. Syedna Mohammed Burhanuddin (R.A.)<br/>
                & H.H. Syedna Aali Qadar Mufaddal Saifuddin Aqa (T.U.S)
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15, filter: "blur(4px)" }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 15, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 1.0 }} className="mb-4 space-y-1 cursor-default">
              <motion.h3 whileHover={{ scale: 1.05, textShadow: "0px 2px 8px rgba(156,74,66,0.3)" }} className={`${alexBrush.className} text-[22px] text-[#9C4A42] transition-all duration-300`}>Sugra bai Late Qamruddin bhai Tambawala</motion.h3>
              <motion.h3 whileHover={{ scale: 1.05, textShadow: "0px 2px 8px rgba(156,74,66,0.3)" }} className={`${alexBrush.className} text-[22px] text-[#9C4A42] transition-all duration-300`}>Hamida ben Khuzema bhai Tambawala</motion.h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15, filter: "blur(4px)" }} animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 15, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 1.2 }} className="mb-4 cursor-default">
              <p className="text-[8px] text-[#68715D] uppercase tracking-[0.2em] leading-loose font-sans">Cordially invite you on the Auspicious Occasion of the<br/>Wedding Ceremony of Our Beloved Son</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }} animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95, filter: "blur(0px)" }} transition={{ duration: 1, delay: 1.4, ease: "easeOut" }} className="flex flex-col w-full relative mt-2 mb-2 px-2">
              <motion.div whileHover={{ scale: 1.04, x: 3, textShadow: "0px 4px 12px rgba(156,74,66,0.4)" }} className="w-full flex justify-start pl-2 cursor-pointer transition-shadow duration-300">
                <h1 className={`name-text ${greatVibes.className} text-[#9C4A42] leading-[0.7] drop-shadow-sm`}>Abdeali</h1>
              </motion.div>
              
              <motion.div animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="ampersand-box w-full flex justify-center -ml-6">
                <span className={`ampersand ${greatVibes.className} text-[#657059] leading-[0.7] opacity-80`}>&</span>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.04, x: -3 }} className="sarrah-box w-full flex flex-col items-end pr-2 cursor-pointer group">
                <motion.h1 whileHover={{ textShadow: "0px 4px 12px rgba(156,74,66,0.4)" }} className={`name-text ${greatVibes.className} text-[#9C4A42] leading-[0.7] drop-shadow-sm transition-shadow duration-300`}>Sarrah</motion.h1>
                <p className="text-[7.5px] text-[#657059] text-right mt-2 font-medium tracking-[0.05em] font-sans pr-4 opacity-80 group-hover:opacity-100 transition-opacity">(D/o Late Tasneem ben &<br/>Late Yusuf bhai Bandookwala)</p>
              </motion.div>
            </motion.div>

            {/* BOTTOM SECTION: Niqah Badge + Modern Scroll Hint */}
            <div className="bottom-section flex flex-col items-center w-full pb-6 z-20 cursor-default">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }} 
                whileHover={{ scale: 1.03, y: -2 }} 
                transition={{ duration: 1, delay: 1.8, ease: "easeOut" }} 
                className="px-2 mb-2"
              >
                <div className="relative overflow-hidden px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-[#B38B4D]/50 shadow-[0_8px_20px_rgba(156,74,66,0.12)] flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#B38B4D]/60 to-transparent"></div>
                  <p className="text-[7.5px] text-[#8B3A43] uppercase tracking-[0.25em] leading-relaxed font-sans font-bold drop-shadow-sm">Niqah Performed at Khandala on the hands of Aqa Maula (T.U.S)</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 1, delay: 2.5 }}
                onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                className="flex flex-col items-center gap-2.5 cursor-pointer group"
              >
                <span className="text-[#68715D] text-[6.5px] uppercase tracking-[0.4em] font-bold group-hover:text-[#8B3A43] transition-colors">
                  Scroll To Explore
                </span>
                
                <div className="w-[16px] h-[28px] rounded-full border border-[#B38B4D]/50 flex justify-center p-[2px] group-hover:border-[#8B3A43] transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
                  <motion.div 
                    animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} 
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} 
                    className="w-1 h-1.5 bg-[#8B3A43] rounded-full shadow-sm"
                  />
                </div>
              </motion.div>
              
            </div>
            
          </div>
        </div>
      </section>

{/* SECTION 1.2: PERSONALIZED WELCOME (High-Contrast VIP Reveal) */}
      {isOpen && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          // Deep espresso background completely separates this from the envelope and countdown
          className="w-full pt-20 pb-20 flex flex-col items-center justify-center relative z-20 bg-[#5A2E2E] shadow-[0_15px_40px_rgba(0,0,0,0.15)]"
        >
          {/* Faint floral watermark for luxury texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
            <Image src="/top-floral.png" alt="texture" fill className="object-cover grayscale" />
          </div>

          <div className="flex flex-col items-center justify-center w-full max-w-[500px] px-6 relative z-10">
            
            <p className="text-[#B38B4D] text-[11px] sm:text-[12px] uppercase tracking-[0.6em] font-bold mb-6 text-center drop-shadow-sm">
              Specially Invited
            </p>
            
            {/* Massive, crisp text in Cream/White for maximum contrast */}
            <h2 className={`${alexBrush.className} text-[75px] sm:text-[100px] text-[#FCFAF8] text-center leading-[1.1] drop-shadow-[0_4px_15px_rgba(0,0,0,0.4)] px-2`}>
              {guest.name}
            </h2>
            
            {/* Elegant luxury double-line divider with a center diamond */}
            <div className="flex items-center gap-3 mt-10 w-full justify-center opacity-80">
              <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent to-[#B38B4D]" />
              <div className="w-1.5 h-1.5 bg-[#B38B4D] rotate-45 shadow-sm" />
              <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent to-[#B38B4D]" />
            </div>
            
          </div>
        </motion.section>
      )}

      {/* SECTION 1.5: THE COUNTDOWN */}
      {isOpen && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="w-full py-28 flex flex-col items-center justify-center relative z-20 bg-[#FCFAF8] border-y border-[#B38B4D]/20 overflow-hidden"
        >
          {/* Subtle Background Watermarks */}
          <div className="absolute top-[-50%] right-[-30%] w-[600px] h-[600px] opacity-[0.03] pointer-events-none grayscale">
            <Image src="/top-floral.png" alt="bg decoration" fill className="object-contain" />
          </div>
          <div className="absolute bottom-[-50%] left-[-30%] w-[600px] h-[600px] opacity-[0.03] pointer-events-none grayscale">
            <Image src="/bottom-floral.png" alt="bg decoration" fill className="object-contain" />
          </div>

          <div className="text-center mb-12 relative z-10">
            <h2 className={`${greatVibes.className} text-[65px] sm:text-[80px] text-[#8B3A43] leading-none mb-4 drop-shadow-sm`}>
              The Countdown
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#B38B4D] to-transparent mx-auto mb-6" />
            <p className="text-[#68715D] text-[10px] uppercase tracking-[0.3em] font-bold">
              To the beginning of forever
            </p>
          </div>

          <WeddingCountdown />
        </motion.section>
      )}

      {isOpen && filteredEvents.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-full min-h-screen pt-32 pb-40 flex flex-col items-center justify-start relative z-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute top-[5%] -left-[30%] w-[900px] h-[900px] opacity-[0.04] mix-blend-multiply">
              <Image src="/top-floral.png" fill alt="bg decorative" className="object-contain" />
            </motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 220, repeat: Infinity, ease: "linear" }} className="absolute top-[50%] -right-[30%] w-[1100px] h-[1100px] opacity-[0.04] mix-blend-multiply">
              <Image src="/bottom-floral.png" fill alt="bg decorative" className="object-contain" />
            </motion.div>
          </div>

          <div className="mb-20 text-center relative z-10">
            <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className={`${greatVibes.className} text-7xl text-[#9C4A42] mb-6 drop-shadow-md`}>
              Wedding Events
            </motion.h2>
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#B38B4D] to-transparent mx-auto" />
            <p className="text-[#68715D] text-[10px] uppercase tracking-[0.4em] mt-6 font-bold">Join us in our celebrations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-16 px-4 max-w-[1000px] relative z-10 items-center justify-items-center">
            {filteredEvents.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: index * 0.15, type: "spring", stiffness: 40 }}
                className={index % 2 !== 0 ? "lg:mt-40" : ""}
              >
                <EventFlipCard event={event} guest={guest} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

    {/* SECTION 4: ELEGANT FOOTER (Cinematic & Modern) */}
      {isOpen && (
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="w-full bg-[#5A2E2E] py-20 flex flex-col items-center justify-center z-20 relative overflow-hidden shadow-[inset_0_20px_40px_rgba(0,0,0,0.2)]"
        >
          {/* Subtle floral watermark for luxury texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <Image src="/top-floral.png" alt="texture" fill className="object-cover grayscale" />
          </div>

          {/* Interactive Scroll-to-Top Button */}
          <button 
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mb-10 w-12 h-12 rounded-full border border-[#B38B4D]/30 flex items-center justify-center text-[#B38B4D] hover:bg-[#B38B4D] hover:text-[#5A2E2E] transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
          </button>

          <p className="text-[#B38B4D] text-[10px] sm:text-xs uppercase tracking-[0.4em] font-bold mb-4 z-10 text-center px-4">
            Looking forward to celebrating with you
          </p>
          
          <h4 className={`${greatVibes.className} text-5xl sm:text-6xl text-[#FCFAF8] mb-8 z-10 drop-shadow-md`}>
            Abdeali & Sarrah
          </h4>
          
          <div className="flex items-center gap-5 text-[#EBE3DA]/70 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-medium mb-12 z-10">
            <span>Ratlam</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B38B4D] shadow-[0_0_8px_rgba(179,139,77,0.8)]" />
            <span>2026-27</span>
          </div>

          {/* Developer Signature - High End Digital Agency Style */}
          <div className="flex flex-col items-center text-center mt-6 z-10 border-t border-[#B38B4D]/20 pt-8 w-[80%] max-w-[350px]">
            <span className="text-[#FCFAF8]/40 text-[8px] sm:text-[9px] uppercase tracking-[0.4em] font-medium mb-3">
              Digitally Crafted By
            </span>
            <a 
              href="https://murtaza-info.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-2 px-4 py-2"
            >
              <span className="text-[#B38B4D] text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold group-hover:text-[#FCFAF8] transition-colors duration-300">
                Murtaza Dawoodjeewala
              </span>
              <svg className="w-3.5 h-3.5 text-[#B38B4D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </motion.footer>
      )}

    </main>
  );
}