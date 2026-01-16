import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { formatNaira } from '../lib/utils';
import { Property } from '../../index';

const PropertyCard = ({ property, onClick }: { property: Property, onClick: () => void }) => (
  <div onClick={onClick} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <div className="h-64 relative overflow-hidden bg-slate-200">
      <img src={property.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={property.title} />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full font-black text-slate-900 text-[10px] uppercase shadow-sm">{property.type}</span>
        <span className={`px-3 py-1 rounded-full font-black text-white text-[10px] uppercase shadow-sm ${property.listingType === 'SALE' ? 'bg-orange-500' : 'bg-emerald-600'}`}>For {property.listingType}</span>
      </div>
    </div>
    <div className="p-8">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase mb-2 tracking-widest">
        <MapPin size={12} strokeWidth={3} /> {property.location.area}, Abuja
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1 group-hover:text-emerald-600 transition-colors">{property.title}</h3>
      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
        <div className="text-xl font-black text-slate-950">{formatNaira(property.price)}</div>
        <div className="text-slate-400 p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <ChevronRight size={18} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
);

export default PropertyCard;
