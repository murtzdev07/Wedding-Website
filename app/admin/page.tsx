'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type EventRSVPData = {
  allowed: boolean;
  max_guests: number;
  status: 'Pending' | 'Attending' | 'Declined';
  pax: number;
};

type Guest = {
  id: string;
  name: string;
  allowed_events: string[];
  status: string;
  event_rsvps: Record<string, EventRSVPData>;
  created_at?: string;
};

const ALL_EVENTS = ["Mehendi", "Darees & Katha", "Walima", "Pannat"];

export default function AdminPanel() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [eventConfigs, setEventConfigs] = useState<Record<string, { enabled: boolean; maxPax: number }>>(
    ALL_EVENTS.reduce((acc, event) => ({ ...acc, [event]: { enabled: false, maxPax: 2 } }), {})
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGuests() {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching guests:", error);
      else setGuests(data || []);
      setIsLoading(false);
    }
    fetchGuests();
  }, []);

  const handleToggleEvent = (event: string) => {
    setEventConfigs(prev => ({
      ...prev,
      [event]: { ...prev[event], enabled: !prev[event].enabled }
    }));
  };

  const handlePaxChange = (event: string, pax: number) => {
    setEventConfigs(prev => ({
      ...prev,
      [event]: { ...prev[event], maxPax: Math.max(1, pax) }
    }));
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeEvents = ALL_EVENTS.filter(ev => eventConfigs[ev].enabled);
    if (activeEvents.length === 0) return alert("Select at least one event.");

    // Build the initial event_rsvps JSON object
    const initialRsvps: Record<string, EventRSVPData> = {};
    activeEvents.forEach(ev => {
      initialRsvps[ev] = {
        allowed: true,
        max_guests: eventConfigs[ev].maxPax,
        status: 'Pending',
        pax: 0
      };
    });

    const { data, error } = await supabase
      .from('guests')
      .insert([
        {
          name: newGuestName,
          allowed_events: activeEvents,
          status: 'Pending',
          guest_count: 0,
          event_rsvps: initialRsvps
        }
      ])
      .select();

    if (error) {
      alert(`Error generating invite: ${error.message}`);
    } else if (data) {
      setGuests([data[0], ...guests]);
      setNewGuestName('');
      // Reset form
      setEventConfigs(
        ALL_EVENTS.reduce((acc, ev) => ({ ...acc, [ev]: { enabled: false, maxPax: 2 } }), {})
      );
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/invite/${id}`;
    navigator.clipboard.writeText(link);
    alert('Unique Invite Link Copied to Clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#FCFAF8] p-6 md:p-12 font-sans text-[#5A2E2E]">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 border-b border-[#B38B4D]/30 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#8B3A43] mb-2">RSVP Admin</h1>
            <p className="text-[#68715D] text-xs uppercase tracking-widest font-bold">Event-Wise Guest Management</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-serif text-[#8B3A43]">{guests.length}</p>
            <p className="text-[#68715D] text-xs uppercase tracking-widest font-bold">Total Invites</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* CREATE INVITE FORM */}
          <div className="lg:col-span-1 bg-white p-7 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#B38B4D]/20 h-fit">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] mb-6 text-[#68715D] border-b border-[#B38B4D]/10 pb-3">
              New Invite
            </h2>

            <form onSubmit={handleGenerateInvite} className="flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest mb-2 block font-bold text-[#8B3A43]">
                  Guest / Family Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Murtaza & Family"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-[#B38B4D]/40 py-2.5 text-base focus:outline-none focus:border-[#8B3A43] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest mb-3 block font-bold text-[#8B3A43]">
                  Select Events & Max Pax
                </label>
                
                <div className="flex flex-col gap-3">
                  {ALL_EVENTS.map(event => {
                    const isSelected = eventConfigs[event].enabled;
                    return (
                      <div
                        key={event}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#8B3A43] bg-[#FCFAF8] shadow-sm'
                            : 'border-[#B38B4D]/20 hover:border-[#B38B4D]/50'
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleEvent(event)}
                            className="w-4 h-4 accent-[#8B3A43] cursor-pointer"
                          />
                          <span className={`text-sm font-semibold ${isSelected ? 'text-[#8B3A43]' : 'text-[#5A2E2E]'}`}>
                            {event}
                          </span>
                        </label>

                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-[#68715D] tracking-wider">Pax:</span>
                            <div className="flex items-center border border-[#B38B4D]/40 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => handlePaxChange(event, eventConfigs[event].maxPax - 1)}
                                className="px-2 py-1 text-xs hover:bg-[#EBE3DA] text-[#8B3A43] font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold text-[#5A2E2E]">
                                {eventConfigs[event].maxPax}
                              </span>
                              <button
                                type="button"
                                onClick={() => handlePaxChange(event, eventConfigs[event].maxPax + 1)}
                                className="px-2 py-1 text-xs hover:bg-[#EBE3DA] text-[#8B3A43] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-[#8B3A43] text-white py-3.5 rounded-xl uppercase tracking-[0.2em] text-xs font-bold shadow-md hover:bg-[#6b2c33] transition-all active:scale-95"
              >
                Generate Link
              </button>
            </form>
          </div>

          {/* GUEST LIST & TRACKING */}
          <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-[#B38B4D]/20">
            <h2 className="text-lg font-bold uppercase tracking-[0.2em] mb-6 text-[#68715D] border-b border-[#B38B4D]/10 pb-3">
              Live RSVP Status
            </h2>

            <div className="overflow-x-auto">
              {isLoading ? (
                <p className="text-center py-12 text-[#B38B4D] animate-pulse font-medium">Loading Database...</p>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[11px] uppercase tracking-widest text-[#B38B4D] border-b-2 border-[#B38B4D]/20">
                    <tr>
                      <th className="pb-3 px-3 font-bold">Guest</th>
                      <th className="pb-3 px-3 font-bold">Event Breakdown (Status & Pax)</th>
                      <th className="pb-3 px-3 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map(guest => (
                      <tr key={guest.id} className="border-b border-[#B38B4D]/10 hover:bg-[#FCFAF8] transition-colors">
                        <td className="py-4 px-3 font-serif text-lg text-[#8B3A43] align-top">
                          {guest.name}
                        </td>
                        <td className="py-4 px-3 align-top">
                          <div className="flex flex-col gap-1.5">
                            {guest.allowed_events.map(ev => {
                              const rsvp = guest.event_rsvps?.[ev] || {
                                status: 'Pending',
                                pax: 0,
                                max_guests: 1
                              };
                              const isAttending = rsvp.status === 'Attending';
                              const isDeclined = rsvp.status === 'Declined';

                              return (
                                <div key={ev} className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-[#5A2E2E] w-32 truncate">{ev}:</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                      isAttending
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isDeclined
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {rsvp.status}
                                  </span>
                                  {isAttending && (
                                    <span className="text-[11px] font-bold text-[#68715D]">
                                      ({rsvp.pax}/{rsvp.max_guests} Pax)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-right align-top">
                          <button
                            onClick={() => copyLink(guest.id)}
                            className="border border-[#8B3A43] text-[#8B3A43] px-3.5 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest hover:bg-[#8B3A43] hover:text-white transition-colors"
                          >
                            Copy Link
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}