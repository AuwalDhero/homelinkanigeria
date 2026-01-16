import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, Search, PlusCircle, User, ShieldCheck, MessageSquare, 
  MapPin, CheckCircle2, XCircle, LogOut, ChevronRight, 
  Sparkles, TrendingUp, Building, X, Briefcase, Edit3, Trash2,
  LayoutDashboard, Building2, Settings
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { formatNaira, getWhatsAppLink } from './frontend/lib/utils';
import PropertyCard from './frontend/components/PropertyCard';
import FileUploader, { UploadedFile } from './frontend/components/FileUploader';
import Badge from './frontend/components/Badge';


// --- Types ---
type UserRole = 'ADMIN' | 'AGENT' | 'PUBLIC';
export type Status = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
export type PropertyType = 'HOUSE' | 'ROOM' | 'APARTMENT' | 'PLOT';
export type ListingType = 'RENT' | 'SALE';
type AgentView = 'DASHBOARD' | 'LISTINGS' | 'LEADS' | 'SETTINGS';


export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: Status;
  phone: string;
  joinedAt: number;
}

export interface Property {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  location: { state: string; city: string; area: string; };
  images: string[];
  status: Status;
  views: number;
  contacts: number;
  createdAt: number;
}

// --- Mock Data ---
const initialData: { users: AppUser[], properties: Property[] } = {
  users: [
    { id: 'admin-1', email: 'admin@homelinka.ng', name: 'Platform Admin', role: 'ADMIN', status: 'APPROVED', phone: '08000000000', joinedAt: Date.now() },
    { id: 'agent-1', email: 'musa@agent.ng', name: 'Musa Ibrahim', role: 'AGENT', status: 'APPROVED', phone: '2348012345678', joinedAt: Date.now() - 1000000 },
  ],
  properties: [
    {
      id: 'p-1', agentId: 'agent-1', agentName: 'Musa Ibrahim', agentPhone: '2348012345678',
      title: 'Modern 4 Bedroom Terrace', description: 'Luxury living in the heart of Maitama. 24/7 power, premium finishing with imported marble tiles and smart home automation.',
      type: 'HOUSE', listingType: 'SALE', price: 150000000,
      location: { state: 'FCT', city: 'Abuja', area: 'Maitama' },
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'],
      status: 'APPROVED', views: 1250, contacts: 42, createdAt: Date.now() - 86400000
    },
    {
      id: 'p-2', agentId: 'agent-1', agentName: 'Musa Ibrahim', agentPhone: '2348012345678',
      title: 'Luxury 2 Bedroom Apartment', description: 'Modern apartment with city views in Gwarinpa. Perfect for young professionals seeking comfort and style.',
      type: 'APARTMENT', listingType: 'RENT', price: 3500000,
      location: { state: 'FCT', city: 'Abuja', area: 'Gwarinpa' },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'],
      status: 'APPROVED', views: 890, contacts: 15, createdAt: Date.now() - 172800000
    }
  ]
};

// --- Main App Component ---
const App = () => {
  const [view, setView] = useState('HOME');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [db, setDb] = useState(initialData);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedFile[]>([]);
  const [agentView, setAgentView] = useState<AgentView>('DASHBOARD');

  const approvedProperties = useMemo(() => db.properties.filter(p => p.status === 'APPROVED'), [db.properties]);
  const agentProperties = useMemo(() => db.properties.filter(p => p.agentId === currentUser?.id), [db.properties, currentUser]);


  const handleLogin = (email: string, role: UserRole) => {
    const user = db.users.find(u => u.email === email && u.role === role);
    if (!user) return alert("Demo: Use musa@agent.ng or admin@homelinka.ng");
    if (user.status === 'PENDING') return alert("Application pending admin approval.");
    setCurrentUser(user);
    setView(role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'AGENT_DASHBOARD');
  };

  const handleRegisterAgent = (data: any) => {
    const newUser: AppUser = {
      id: `u-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'AGENT',
      status: 'PENDING',
      phone: data.phone,
      joinedAt: Date.now()
    };
    setDb({ ...db, users: [...db.users, newUser] });
    alert("Application submitted! Admin will review your profile shortly.");
    setView('HOME');
  };

  const handleCreateProperty = (prop: Partial<Property>) => {
    const imageFiles = uploadedAssets.filter(a => a.type === 'image' && a.status === 'completed');
    const displayImage = imageFiles.length > 0 ? imageFiles[0].preview : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';
    const newProp = {
      ...prop,
      id: `p-${Date.now()}`,
      agentId: currentUser?.id!,
      agentName: currentUser?.name!,
      agentPhone: currentUser?.phone!,
      status: 'PENDING' as Status,
      views: 0,
      contacts: 0,
      createdAt: Date.now(),
      images: [displayImage]
    } as Property;
    setDb({ ...db, properties: [newProp, ...db.properties] });
    setUploadedAssets([]);
    alert("Listing submitted for moderation.");
    setView('AGENT_DASHBOARD');
    setAgentView('LISTINGS');
  };

  const handleUpdateProperty = (id: string, updatedData: Partial<Property>) => {
    setDb(prevDb => ({
        ...prevDb,
        properties: prevDb.properties.map(p =>
            p.id === id
                ? { ...p, ...updatedData, status: 'PENDING' as Status }
                : p
        )
    }));
    setPropertyToEdit(null);
    alert("Property updated and re-submitted for moderation.");
    setView('AGENT_DASHBOARD');
    setAgentView('LISTINGS');
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      setDb(prevDb => ({
          ...prevDb,
          properties: prevDb.properties.filter(p => p.id !== id)
      }));
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFC]">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-slate-200/60 py-5 px-6 md:px-12 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('HOME')}>
          <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-xl shadow-emerald-600/20">
            <Home size={26} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">HomeLinka<span className="text-emerald-600">NG</span></span>
        </div>
        <div className="flex items-center gap-8">
          {!currentUser ? (
            <>
              <button onClick={() => setView('AGENT_LOGIN')} className="hidden md:block text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600">Agent Portal</button>
              <button onClick={() => setView('AGENT_REGISTER')} className="bg-slate-950 text-white px-7 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Become an Agent</button>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{currentUser.role}</div>
              </div>
              <button onClick={() => { setCurrentUser(null); setView('HOME'); }} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"><LogOut size={20} /></button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        
        {view === 'HOME' && (
          <div className="space-y-16">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[120px] rounded-full"></div>
              <div className="relative z-10 max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 border border-emerald-500/20">
                  <Sparkles size={14} /> FCT Pilot - Abuja Verified
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-left">Your Link to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Nigeria's Best.</span></h1>
                <p className="text-slate-400 text-xl mb-12 font-medium leading-relaxed">Verified Abuja agents. Zero hunter fees. Direct WhatsApp.</p>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-12">
                   <div className="flex flex-1 bg-white/5 backdrop-blur-2xl rounded-3xl p-2 border border-white/10 shadow-2xl">
                    <div className="flex items-center px-4 text-emerald-500"><Search size={24} /></div>
                    <input className="bg-transparent border-none text-white py-4 w-full font-bold outline-none placeholder:text-slate-600" placeholder="Search areas like Maitama..." />
                  </div>
                  <button onClick={() => setView('AGENT_REGISTER')} className="bg-emerald-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">Become an Agent</button>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Verified Listings</h2>
                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest">{approvedProperties.length} Homes in Abuja</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {approvedProperties.map(p => <PropertyCard key={p.id} property={p} onClick={() => { setSelectedProperty(p); setView('DETAILS'); }} />)}
              </div>
            </div>
          </div>
        )}

        {view === 'AGENT_REGISTER' && (
          <div className="max-w-xl mx-auto py-12">
            <div className="bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border border-slate-50 text-center">
              <Briefcase className="mx-auto mb-8 text-emerald-600" size={60} />
              <h1 className="text-4xl font-black text-slate-950 mb-4 tracking-tighter uppercase">Become an Agent</h1>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-12">Join the HomeLinka Network</p>
              <form onSubmit={(e: any) => {
                e.preventDefault();
                const d = e.target;
                handleRegisterAgent({ name: d.name.value, email: d.email.value, phone: d.phone.value });
              }} className="space-y-6 text-left">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label><input name="name" required className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold" placeholder="e.g. Ibrahim Musa" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label><input name="email" required type="email" className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold" placeholder="ibrahim@example.ng" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">WhatsApp Phone</label><input name="phone" required className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold" placeholder="234..." /></div>
                <button className="w-full bg-slate-950 text-white py-7 rounded-[2.2rem] font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest mt-8">Apply for Partner Access</button>
              </form>
            </div>
          </div>
        )}

        {(view === 'AGENT_LOGIN' || view === 'ADMIN_LOGIN') && (
          <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-slate-50 text-center relative overflow-hidden">
              <div className="bg-slate-950 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-emerald-400 shadow-2xl">
                {view === 'ADMIN_LOGIN' ? <ShieldCheck size={48} /> : <User size={48} />}
              </div>
              <h1 className="text-4xl font-black text-slate-950 mb-3 tracking-tighter uppercase">{view.replace('_', ' ')}</h1>
              <form onSubmit={(e: any) => { e.preventDefault(); handleLogin(e.target.email.value, view === 'ADMIN_LOGIN' ? 'ADMIN' : 'AGENT'); }} className="space-y-6 text-left">
                <input name="email" required type="email" className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold" placeholder="Email" />
                <input name="password" required type="password" className="w-full p-6 bg-slate-50 border-none rounded-3xl font-bold" placeholder="Password" />
                <button className="w-full bg-slate-950 text-white py-7 rounded-[2.2rem] font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest mt-8">Sign In</button>
              </form>
              <button onClick={() => setView(view === 'AGENT_LOGIN' ? 'ADMIN_LOGIN' : 'AGENT_LOGIN')} className="mt-8 text-[10px] font-black text-slate-400 uppercase hover:text-emerald-600 transition-colors">Switch Portal</button>
            </div>
          </div>
        )}

        {view === 'AGENT_DASHBOARD' && currentUser && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Sidebar */}
            <aside className="w-full md:w-80 flex-shrink-0 bg-slate-900 text-white p-8 rounded-[3rem] sticky top-36">
              <div className="text-center mb-10">
                <h2 className="text-xl font-black tracking-tighter">{currentUser.name}</h2>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Agent Portal</p>
              </div>
              <button onClick={() => setView('AGENT_CREATE_LISTING')} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50 hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs mb-10">
                <PlusCircle size={16} /> New Listing
              </button>
              <nav className="space-y-3">
                {(Object.keys({DASHBOARD: LayoutDashboard, LISTINGS: Building2, LEADS: MessageSquare, SETTINGS: Settings}) as AgentView[]).map(navItem => {
                  const Icon = {DASHBOARD: LayoutDashboard, LISTINGS: Building2, LEADS: MessageSquare, SETTINGS: Settings}[navItem];
                  const isActive = agentView === navItem;
                  return (
                    <button key={navItem} onClick={() => setAgentView(navItem)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left text-sm font-black transition-all ${isActive ? 'bg-emerald-600/20 text-emerald-300' : 'hover:bg-white/5 text-slate-400'}`}>
                      <Icon size={20} />
                      <span>{navItem.charAt(0) + navItem.slice(1).toLowerCase()}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 w-full">
              {agentView === 'DASHBOARD' && (
                <div className="space-y-8">
                  <h1 className="text-5xl font-black text-slate-950 tracking-tighter">Dashboard</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[{ label: 'Market Reach', val: 1250, icon: TrendingUp }, { label: 'Leads Secured', val: 42, icon: MessageSquare }, { label: 'Active Ads', val: agentProperties.length, icon: Building }].map((stat, i) => (
                      <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
                        <div className="p-5 bg-slate-50 rounded-[1.8rem] text-emerald-600"><stat.icon size={36} /></div>
                        <div><div className="text-4xl font-black text-slate-950">{stat.val}</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">{stat.label}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {agentView === 'LISTINGS' && (
                 <div className="space-y-8">
                  <h1 className="text-5xl font-black text-slate-950 tracking-tighter">My Listings</h1>
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    {agentProperties.map(p => (
                      <div key={p.id} className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-3xl hover:bg-slate-50/80 transition-colors">
                        <img src={p.images[0]} alt={p.title} className="w-full md:w-24 h-24 object-cover rounded-2xl" />
                        <div className="flex-1 text-center md:text-left">
                          <div className="font-black text-slate-900">{p.title}</div>
                          <div className="text-sm font-bold text-slate-500">{formatNaira(p.price)}</div>
                        </div>
                        <div className="flex-shrink-0"><Badge status={p.status} /></div>
                        <div className="flex gap-4">
                          <button onClick={() => { setPropertyToEdit(p); setView('AGENT_EDIT_LISTING'); }} className="flex items-center gap-2 bg-slate-200 text-slate-800 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 transition-all"><Edit3 size={14}/> Edit</button>
                          <button onClick={() => handleDeleteProperty(p.id)} className="flex items-center gap-2 bg-rose-100 text-rose-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-200 transition-all"><Trash2 size={14}/> Delete</button>
                        </div>
                      </div>
                    ))}
                    {agentProperties.length === 0 && <div className="p-12 text-center text-slate-400 font-black uppercase text-xs tracking-widest">You have not created any listings yet.</div>}
                  </div>
                </div>
              )}
              {agentView === 'LEADS' && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900">Leads Feature Coming Soon</h2>
                  <p className="text-slate-500">This section will display contacts from interested house hunters.</p>
                </div>
              )}
              {agentView === 'SETTINGS' && (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900">Settings Feature Coming Soon</h2>
                  <p className="text-slate-500">Manage your profile, notifications, and account settings here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'AGENT_CREATE_LISTING' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-slate-50">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">New Property Intelligence</h2>
                <button onClick={() => setView('AGENT_DASHBOARD')} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900"><XCircle size={28} /></button>
              </div>
              <form onSubmit={(e: any) => {
                e.preventDefault();
                const d = e.target;
                handleCreateProperty({ title: d.title.value, description: d.description.value, price: parseFloat(d.price.value), type: d.type.value as PropertyType, listingType: d.listingType.value as ListingType, location: { state: 'FCT', city: 'Abuja', area: d.area.value } });
              }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input name="title" required className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Listing Title" />
                  <input name="area" required className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Neighborhood (e.g. Jabi)" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <input name="price" required type="number" className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Price (NGN)" />
                  <div className="relative">
                    <select name="type" required defaultValue="" className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black appearance-none cursor-pointer">
                      <option value="" disabled>Property Type</option>
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment / Flat</option>
                      <option value="ROOM">Single Room</option>
                      <option value="PLOT">Plot of Land</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={20} strokeWidth={3}/>
                  </div>
                  <div className="relative">
                    <select name="listingType" required defaultValue="" className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black appearance-none cursor-pointer">
                      <option value="" disabled>Listing Type</option>
                      <option value="RENT">For Rent</option>
                      <option value="SALE">For Sale</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={20} strokeWidth={3}/>
                  </div>
                </div>
                <div className="space-y-3 relative">
                  <textarea
                    name="description"
                    required
                    rows={6}
                    className="w-full p-10 bg-slate-50 border-none rounded-[3rem] font-medium"
                    placeholder="Describe the property... key features, power situation, etc."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Property Assets</label>
                  <FileUploader onFilesChange={setUploadedAssets} />
                </div>
                <button className="w-full bg-slate-950 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all mt-10">Verify & Submit</button>
              </form>
            </div>
          </div>
        )}

        {view === 'AGENT_EDIT_LISTING' && propertyToEdit && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-slate-50">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Edit Property Intelligence</h2>
                <button onClick={() => setView('AGENT_DASHBOARD')} className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900"><XCircle size={28} /></button>
              </div>
              <form onSubmit={(e: any) => {
                e.preventDefault();
                const d = e.target;
                const updatedData = {
                    title: d.title.value,
                    description: d.description.value,
                    price: parseFloat(d.price.value),
                    type: d.type.value as PropertyType,
                    listingType: d.listingType.value as ListingType,
                    location: { ...propertyToEdit.location, area: d.area.value }
                };
                handleUpdateProperty(propertyToEdit.id, updatedData);
              }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <input name="title" required defaultValue={propertyToEdit.title} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Listing Title" />
                  <input name="area" required defaultValue={propertyToEdit.location.area} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Neighborhood (e.g. Jabi)" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <input name="price" required type="number" defaultValue={propertyToEdit.price} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black" placeholder="Price (NGN)" />
                  <div className="relative">
                    <select name="type" required defaultValue={propertyToEdit.type} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black appearance-none cursor-pointer">
                      <option value="HOUSE">House</option>
                      <option value="APARTMENT">Apartment / Flat</option>
                      <option value="ROOM">Single Room</option>
                      <option value="PLOT">Plot of Land</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={20} strokeWidth={3}/>
                  </div>
                  <div className="relative">
                    <select name="listingType" required defaultValue={propertyToEdit.listingType} className="w-full p-6 bg-slate-50 border-none rounded-[2rem] font-black appearance-none cursor-pointer">
                      <option value="RENT">For Rent</option>
                      <option value="SALE">For Sale</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={20} strokeWidth={3}/>
                  </div>
                </div>
                <div className="space-y-3 relative">
                  <textarea
                    name="description"
                    required
                    rows={6}
                    defaultValue={propertyToEdit.description}
                    className="w-full p-10 bg-slate-50 border-none rounded-[3rem] font-medium"
                    placeholder="Describe the property... key features, power situation, etc."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Property Assets (Add New)</label>
                  <FileUploader onFilesChange={setUploadedAssets} />
                </div>
                <button className="w-full bg-slate-950 text-white py-8 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all mt-10">Update & Re-Submit</button>
              </form>
            </div>
          </div>
        )}

        {view === 'ADMIN_DASHBOARD' && currentUser && (
          <div className="space-y-16">
            <h1 className="text-6xl font-black text-slate-950 tracking-tighter">Global Control</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-50 bg-slate-50/50 font-black text-xl uppercase tracking-widest">Agent Verification</div>
                <div className="divide-y divide-slate-50">
                  {db.users.filter(u => u.status === 'PENDING').map(u => (
                    <div key={u.id} className="p-8 flex justify-between items-center">
                      <div><div className="font-black text-slate-900 text-lg">{u.name}</div><div className="text-xs text-slate-400 font-bold">{u.email}</div></div>
                      <div className="flex gap-4">
                        <button onClick={() => setDb({ ...db, users: db.users.map(x => x.id === u.id ? { ...x, status: 'APPROVED' as Status } : x) })} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"><CheckCircle2 size={24} /></button>
                        <button onClick={() => setDb({ ...db, users: db.users.map(x => x.id === u.id ? { ...x, status: 'REJECTED' as Status } : x) })} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"><XCircle size={24} /></button>
                      </div>
                    </div>
                  ))}
                  {db.users.filter(u => u.status === 'PENDING').length === 0 && <div className="p-12 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No pending applications</div>}
                </div>
              </div>
              <div className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-50 bg-slate-50/50 font-black text-xl uppercase tracking-widest">Listing Moderation</div>
                <div className="divide-y divide-slate-50">
                  {db.properties.filter(p => p.status === 'PENDING').map(p => (
                    <div key={p.id} className="p-8 flex items-center gap-6">
                      <img src={p.images[0]} className="w-16 h-16 rounded-2xl object-cover" alt={p.title} />
                      <div className="flex-1 font-black text-slate-950 uppercase text-xs">{p.title}</div>
                      <div className="flex gap-2">
                        <button onClick={() => setDb({ ...db, properties: db.properties.map(x => x.id === p.id ? { ...x, status: 'APPROVED' as Status } : x) })} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100"><CheckCircle2 size={24} /></button>
                        <button onClick={() => setDb({ ...db, properties: db.properties.map(x => x.id === p.id ? { ...x, status: 'REJECTED' as Status } : x) })} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100"><XCircle size={24} /></button>
                      </div>
                    </div>
                  ))}
                  {db.properties.filter(p => p.status === 'PENDING').length === 0 && <div className="p-12 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No pending listings</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'DETAILS' && selectedProperty && (
          <div className="py-8">
            <button onClick={() => setView('HOME')} className="flex items-center gap-3 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] mb-12 hover:text-emerald-600 transition-all group">
              <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} strokeWidth={3} /> Back to Search
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
              <div className="lg:col-span-2 space-y-12">
                <div className="rounded-[4rem] overflow-hidden shadow-2xl aspect-[16/10] border border-slate-100 bg-slate-200">
                  <img src={selectedProperty.images[0]} className="w-full h-full object-cover" alt={selectedProperty.title} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase mb-4 tracking-[0.3em]"><MapPin size={20} strokeWidth={4} /> {selectedProperty.location.area}, Abuja</div>
                  <h1 className="text-5xl md:text-7xl font-black text-slate-950 leading-tight mb-12 tracking-tighter">{selectedProperty.title}</h1>
                  <p className="text-slate-600 text-xl leading-relaxed bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm font-medium italic">"{selectedProperty.description}"</p>
                </div>
              </div>
              <aside className="space-y-8 sticky top-36 h-fit">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl text-center">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Price</div>
                  <div className="text-5xl font-black text-slate-950 mb-12">{formatNaira(selectedProperty.price)}</div>
                  <div className="space-y-4">
                    <a href={`tel:${selectedProperty.agentPhone}`} className="block w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Call Agent</a>
                    <a href={getWhatsAppLink(selectedProperty.agentPhone, selectedProperty.title)} target="_blank" className="block w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl">WhatsApp</a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-slate-200/50 py-32 px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl shadow-emerald-600/20"><Home size={28} strokeWidth={3} /></div>
              <span className="text-3xl font-black tracking-tighter text-slate-900">HomeLinka<span className="text-emerald-600">NG</span></span>
            </div>
            <p className="text-slate-400 font-black text-2xl tracking-tighter italic leading-[1.2]">"Redefining premium real estate in the Federal Capital Territory."</p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div><h4 className="font-black text-slate-950 mb-8 uppercase text-[11px] tracking-widest">Districts</h4><ul className="text-slate-500 font-bold space-y-4"><li>Maitama</li><li>Wuse II</li><li>Asokoro</li></ul></div>
            <div><h4 className="font-black text-slate-950 mb-8 uppercase text-[11px] tracking-widest">Governance</h4><ul className="text-slate-500 font-bold space-y-4"><li>Safety Hub</li><li>Privacy Charter</li><li>Compliance</li></ul></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
          <div>© 2025 HomeLinka Nigeria - FCT Pilot</div>
          <div className="flex gap-8"><span>Compliance</span><span>Security Dept</span></div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);