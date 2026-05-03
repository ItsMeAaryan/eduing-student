"use client";

import { MapPin, Mail, Phone, Globe } from "lucide-react";

interface Props {
  university: any;
}

export default function ContactTab({ university }: Props) {
  const uni = university as any;

  return (
    <div className="space-y-6">
      <div className="bg-card/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Contact Information
        </h3>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>

            <div>
              <span className="block text-sm text-textSecondary mb-1">
                Address
              </span>

              <span className="text-white">
                {uni.city || "Unknown City"},{" "}
                {uni.state || "Unknown State"}, India
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary" />
            </div>

            <div>
              <span className="block text-sm text-textSecondary mb-1">
                Email
              </span>

              <span className="text-white">
                {uni.email || "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-primary" />
            </div>

            <div>
              <span className="block text-sm text-textSecondary mb-1">
                Phone
              </span>

              <span className="text-white">
                {uni.phone || "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-primary" />
            </div>

            <div>
              <span className="block text-sm text-textSecondary mb-1">
                Website
              </span>

              <a
                href={uni.website || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {uni.website || "Not Available"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}"use client";

import { UniversityDetails } from "@/types/universityDetails";
import { MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";

interface Props {
  university: UniversityDetails;
}

export default function ContactTab({ university }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Contact Details Card */}
        <div className="md:col-span-1 space-y-6 bg-white/[0.02] border border-white/5 rounded-3xl p-6 h-fit">
          <h3 className="text-xl font-bold text-white mb-2">Contact Info</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                <MapPin className="text-primary" size={18} />
              </div>
              <div>
                <span className="block text-sm text-textSecondary mb-1">Address</span>
                <span className="text-white">{university.city}, {university.state}, India</span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                <Phone className="text-primary" size={18} />
              </div>
              <div>
                <span className="block text-sm text-textSecondary mb-1">Phone Number</span>
                <span className="text-white">{university.phone || "Not available"}</span>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                <Mail className="text-primary" size={18} />
              </div>
              <div>
                <span className="block text-sm text-textSecondary mb-1">Email Address</span>
                <a href={`mailto:${university.email}`} className="text-primary hover:underline">{university.email}</a>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4 mt-1">
                <Globe className="text-primary" size={18} />
              </div>
              <div>
                <span className="block text-sm text-textSecondary mb-1">Website</span>
                <a href={university.website} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center">
                  Visit Official Website <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="md:col-span-2">
          <div className="w-full h-full min-h-[400px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center text-center p-6">
             <MapPin size={48} className="text-white/20 mb-4" />
             <h3 className="text-lg font-bold text-white mb-2">Map View</h3>
             <p className="text-textSecondary text-sm max-w-sm">
               Interactive Google Maps integration will appear here, showing the exact location of {university.name} in {university.city}, {university.state}.
             </p>
          </div>
        </div>

      </div>

    </div>
  );
}
