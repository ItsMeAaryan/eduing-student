"use client";

import { UniversityDetails } from "@/types/universityDetails";
import { Calendar, Building, Award, Users, Map } from "lucide-react";

interface Props {
  university: UniversityDetails;
}

export default function OverviewTab({ university }: Props) {
  const { keyFacts } = university;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* About Section */}
      <section>
        <h3 className="text-xl font-bold text-white mb-4">About the University</h3>
        <p className="text-textSecondary leading-relaxed whitespace-pre-line">
          {university.about}
        </p>
      </section>

      {/* Key Facts */}
      {keyFacts && (
        <section>
          <h3 className="text-xl font-bold text-white mb-4">Key Facts</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Calendar className="text-primary mb-2" size={24} />
              <span className="text-xs text-textSecondary mb-1">Founded</span>
              <span className="text-white font-semibold">{keyFacts.foundedYear}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Building className="text-primary mb-2" size={24} />
              <span className="text-xs text-textSecondary mb-1">Type</span>
              <span className="text-white font-semibold">{keyFacts.type}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Award className="text-primary mb-2" size={24} />
              <span className="text-xs text-textSecondary mb-1">Accreditation</span>
              <span className="text-white font-semibold">{keyFacts.accreditation}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Users className="text-primary mb-2" size={24} />
              <span className="text-xs text-textSecondary mb-1">Students</span>
              <span className="text-white font-semibold">{keyFacts.totalStudents.toLocaleString()}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <Map className="text-primary mb-2" size={24} />
              <span className="text-xs text-textSecondary mb-1">Campus Size</span>
              <span className="text-white font-semibold">{keyFacts.campusSize}</span>
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      {university.facilities && university.facilities.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-white mb-4">Campus Facilities</h3>
          <div className="flex flex-wrap gap-3">
            {university.facilities.map((facility, index) => (
              <span key={index} className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium">
                {facility}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {university.gallery && university.gallery.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-white mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {university.gallery.map((photo, index) => (
              <div key={index} className="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative">
                <img 
                  src={photo} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
