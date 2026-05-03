import { UniversityDetails, Program, Review } from "@/types/universityDetails";

const MOCK_PROGRAMS: Program[] = [
  {
    id: "p1",
    name: "B.Tech in Computer Science",
    level: "UG",
    duration: "4 Years",
    totalSeats: 120,
    eligibility: "10+2 with 75% in PCM",
    applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    applicationFee: 1500,
    entranceExamRequired: true,
  },
  {
    id: "p2",
    name: "Master of Business Administration (MBA)",
    level: "MBA",
    duration: "2 Years",
    totalSeats: 60,
    eligibility: "Graduation with 50%",
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days
    applicationFee: 2000,
    entranceExamRequired: true,
  },
  {
    id: "p3",
    name: "M.Tech in Artificial Intelligence",
    level: "PG",
    duration: "2 Years",
    totalSeats: 30,
    eligibility: "B.Tech/B.E. in relevant field",
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    applicationFee: 1000,
    entranceExamRequired: true,
  },
  {
    id: "p4",
    name: "B.A. in Psychology",
    level: "UG",
    duration: "3 Years",
    totalSeats: 50,
    eligibility: "10+2 passing marks",
    applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    applicationFee: 500,
    entranceExamRequired: false,
  }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    authorName: "Rahul Sharma",
    rating: 4.5,
    comment: "Excellent faculty and great placement opportunities. The campus life is vibrant but hostel food could be better.",
    date: "2023-10-15T00:00:00.000Z",
    categories: { academics: 5, infrastructure: 4, placements: 5, faculty: 5, campusLife: 4 }
  },
  {
    id: "r2",
    authorName: "Priya Patel",
    rating: 3.8,
    comment: "Good university overall. Infrastructure is a bit old in some departments, but the new library is world-class.",
    date: "2023-11-02T00:00:00.000Z",
    categories: { academics: 4, infrastructure: 3, placements: 4, faculty: 4, campusLife: 4 }
  }
];

export const generateMockDetails = (baseProfile: any): UniversityDetails => {
  return {
    ...baseProfile,
    bannerUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
    logoUrl: "https://ui-avatars.com/api/?name=" + encodeURIComponent(baseProfile.name) + "&background=3B82F6&color=fff&size=128",
    rating: 4.2,
    about: `${baseProfile.name} is a premier educational institution committed to academic excellence and holistic development. Established to foster innovation and leadership, we offer a diverse range of undergraduate, postgraduate, and doctoral programs. Our state-of-the-art campus, experienced faculty, and strong industry connections provide students with the perfect environment to thrive and build successful careers.`,
    keyFacts: {
      foundedYear: 1995,
      type: "Private",
      accreditation: "NAAC A++",
      totalStudents: 15000,
      campusSize: "150 Acres"
    },
    facilities: ["Central Library", "A/C Hostels", "Sports Complex", "Innovation Lab", "Medical Center", "Cafeteria", "Gymnasium", "Wi-Fi Campus"],
    gallery: [
      "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1000&auto=format&fit=crop"
    ],
    programsList: MOCK_PROGRAMS,
    reviewsList: MOCK_REVIEWS,
  };
};
