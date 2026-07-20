export interface University {
  id: string; name: string; shortName: string; location: string; state: string; country: string;
  type: 'Public' | 'Private' | 'Deemed'; established: number; category: string;
  nirf: number; qs: number | null; naac: string; rating: number;
  heroImage: string; logoColor: string; logoText: string;
  program: string; tuition: string; duration: string; seats: number; deadline: string;
  aiMatch: number; admissionProb: number; careerROI: number; placementScore: number;
  researchScore: number; campusLife: number; globalExposure: number; difficulty: string;
  avgPackage: string; topRecruiter: string;
  chips: string[]; studentCount: string; reviews: number;
  scholarships: boolean; hostel: boolean; placements: boolean; research: boolean;
  exchange: boolean; international: boolean; incubation: boolean;
}

export const UNIVERSITIES: University[] = [
  {
    id:'bits-pilani', name:'BITS Pilani', shortName:'BITS', location:'Pilani, Rajasthan', state:'Rajasthan', country:'India',
    type:'Deemed', established:1964, category:'Engineering',
    nirf:1, qs:null, naac:'A++', rating:4.8,
    heroImage:'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80&auto=format&fit=crop',
    logoColor:'#F59E0B', logoText:'B',
    program:'B.Tech Computer Science', tuition:'₹4.8L', duration:'4 years', seats:120, deadline:'Mar 2025',
    aiMatch:96, admissionProb:78, careerROI:94, placementScore:96, researchScore:88, campusLife:92, globalExposure:85, difficulty:'Very High',
    avgPackage:'₹22 LPA', topRecruiter:'Google',
    chips:['Scholarships','Hostel','Placements','Research','Exchange'],
    studentCount:'+12K', reviews:1840, scholarships:true, hostel:true, placements:true, research:true, exchange:true, international:true, incubation:true,
  },
  {
    id:'iit-bombay', name:'Indian Institute of Technology Bombay', shortName:'IIT-B', location:'Mumbai, Maharashtra', state:'Maharashtra', country:'India',
    type:'Public', established:1958, category:'Engineering',
    nirf:2, qs:149, naac:'A++', rating:4.7,
    heroImage:'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80&auto=format&fit=crop',
    logoColor:'#3B82F6', logoText:'I',
    program:'B.Tech Computer Science', tuition:'₹2.4L', duration:'4 years', seats:90, deadline:'Apr 2025',
    aiMatch:94, admissionProb:42, careerROI:98, placementScore:99, researchScore:99, campusLife:94, globalExposure:97, difficulty:'Extremely High',
    avgPackage:'₹28 LPA', topRecruiter:'Microsoft',
    chips:['Placements','Research','Hostel','Exchange','International'],
    studentCount:'+18K', reviews:3210, scholarships:true, hostel:true, placements:true, research:true, exchange:true, international:true, incubation:true,
  },
  {
    id:'delhi-university', name:'Delhi University', shortName:'DU', location:'New Delhi, Delhi', state:'Delhi', country:'India',
    type:'Public', established:1922, category:'Sciences',
    nirf:3, qs:521, naac:'A++', rating:4.6,
    heroImage:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&auto=format&fit=crop',
    logoColor:'#8B5CF6', logoText:'D',
    program:'B.Sc (Hons) Computer Science', tuition:'₹72K', duration:'3 years', seats:200, deadline:'Jun 2025',
    aiMatch:93, admissionProb:55, careerROI:82, placementScore:84, researchScore:87, campusLife:96, globalExposure:78, difficulty:'High',
    avgPackage:'₹9 LPA', topRecruiter:'TCS',
    chips:['Scholarships','Hostel','Placements'],
    studentCount:'+25K', reviews:4120, scholarships:true, hostel:true, placements:true, research:false, exchange:false, international:false, incubation:false,
  },
  {
    id:'vit-vellore', name:'VIT Vellore', shortName:'VIT', location:'Vellore, Tamil Nadu', state:'Tamil Nadu', country:'India',
    type:'Deemed', established:1984, category:'Engineering',
    nirf:4, qs:null, naac:'A++', rating:4.5,
    heroImage:'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80&auto=format&fit=crop',
    logoColor:'#10B981', logoText:'V',
    program:'B.Tech Computer Science', tuition:'₹2.1L', duration:'4 years', seats:300, deadline:'May 2025',
    aiMatch:92, admissionProb:72, careerROI:88, placementScore:91, researchScore:78, campusLife:90, globalExposure:80, difficulty:'High',
    avgPackage:'₹14 LPA', topRecruiter:'Infosys',
    chips:['Scholarships','Hostel','Placements','Exchange'],
    studentCount:'+15K', reviews:2560, scholarships:true, hostel:true, placements:true, research:true, exchange:true, international:true, incubation:false,
  },
  {
    id:'iisc-bangalore', name:'Indian Institute of Science', shortName:'IISc', location:'Bengaluru, Karnataka', state:'Karnataka', country:'India',
    type:'Public', established:1909, category:'Sciences',
    nirf:5, qs:225, naac:'A++', rating:4.8,
    heroImage:'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80&auto=format&fit=crop',
    logoColor:'#EF4444', logoText:'I',
    program:'B.Sc Research', tuition:'₹94K', duration:'4 years', seats:45, deadline:'Mar 2025',
    aiMatch:90, admissionProb:28, careerROI:96, placementScore:95, researchScore:100, campusLife:85, globalExposure:95, difficulty:'Extremely High',
    avgPackage:'₹32 LPA', topRecruiter:'ISRO',
    chips:['Research','Scholarships','Hostel','International','Exchange'],
    studentCount:'+8K', reviews:980, scholarships:true, hostel:true, placements:true, research:true, exchange:true, international:true, incubation:true,
  },
  {
    id:'jadavpur-university', name:'Jadavpur University', shortName:'JU', location:'Kolkata, West Bengal', state:'West Bengal', country:'India',
    type:'Public', established:1955, category:'Engineering',
    nirf:6, qs:null, naac:'A', rating:4.4,
    heroImage:'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&auto=format&fit=crop',
    logoColor:'#F97316', logoText:'J',
    program:'B.Tech Computer Science', tuition:'₹1.1L', duration:'4 years', seats:60, deadline:'Jun 2025',
    aiMatch:90, admissionProb:60, careerROI:84, placementScore:86, researchScore:84, campusLife:82, globalExposure:72, difficulty:'High',
    avgPackage:'₹11 LPA', topRecruiter:'Wipro',
    chips:['Scholarships','Hostel','Placements'],
    studentCount:'+10K', reviews:1420, scholarships:true, hostel:true, placements:true, research:false, exchange:false, international:false, incubation:false,
  },
  {
    id:'anna-university', name:'Anna University', shortName:'AU', location:'Chennai, Tamil Nadu', state:'Tamil Nadu', country:'India',
    type:'Public', established:1978, category:'Engineering',
    nirf:7, qs:null, naac:'A', rating:4.3,
    heroImage:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop',
    logoColor:'#DC2626', logoText:'A',
    program:'B.E Computer Science', tuition:'₹55K', duration:'4 years', seats:180, deadline:'May 2025',
    aiMatch:89, admissionProb:65, careerROI:80, placementScore:82, researchScore:76, campusLife:80, globalExposure:68, difficulty:'Medium-High',
    avgPackage:'₹9 LPA', topRecruiter:'HCL',
    chips:['Scholarships','Hostel','Placements'],
    studentCount:'+20K', reviews:3100, scholarships:true, hostel:true, placements:true, research:false, exchange:false, international:false, incubation:false,
  },
  {
    id:'amity-university', name:'Amity University', shortName:'Amity', location:'Noida, Uttar Pradesh', state:'Uttar Pradesh', country:'India',
    type:'Private', established:2005, category:'Management',
    nirf:8, qs:null, naac:'A+', rating:4.2,
    heroImage:'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80&auto=format&fit=crop&crop=entropy&cs=srgb&ixid=1',
    logoColor:'#FBBF24', logoText:'A',
    program:'B.Tech Computer Science', tuition:'₹3.2L', duration:'4 years', seats:240, deadline:'Apr 2025',
    aiMatch:88, admissionProb:80, careerROI:76, placementScore:79, researchScore:70, campusLife:88, globalExposure:82, difficulty:'Medium',
    avgPackage:'₹10 LPA', topRecruiter:'Deloitte',
    chips:['Scholarships','Hostel','Placements','Exchange','International'],
    studentCount:'+9K', reviews:1890, scholarships:true, hostel:true, placements:true, research:false, exchange:true, international:true, incubation:true,
  },
  {
    id:'manipal-institute', name:'Manipal Institute of Technology', shortName:'MIT', location:'Manipal, Karnataka', state:'Karnataka', country:'India',
    type:'Private', established:1957, category:'Engineering',
    nirf:9, qs:null, naac:'A+', rating:4.2,
    heroImage:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80&auto=format&fit=crop',
    logoColor:'#7C3AED', logoText:'M',
    program:'B.Tech Computer Science', tuition:'₹2.6L', duration:'4 years', seats:180, deadline:'Mar 2025',
    aiMatch:87, admissionProb:75, careerROI:82, placementScore:85, researchScore:74, campusLife:91, globalExposure:84, difficulty:'Medium-High',
    avgPackage:'₹12 LPA', topRecruiter:'Amazon',
    chips:['Hostel','Placements','Scholarships','Exchange'],
    studentCount:'+11K', reviews:2340, scholarships:true, hostel:true, placements:true, research:false, exchange:true, international:true, incubation:true,
  },
];

export const SORT_OPTIONS = ['AI Match','Highest Placement','Best ROI','Lowest Fees','Highest Ranking','Most Popular'];
export const COURSE_FILTERS = ['All Courses','B.Tech','MBA','B.Sc','M.Tech','B.E'];
export const COUNTRY_FILTERS = ['All Countries','India','USA','UK','Canada','Australia'];
export const TYPE_FILTERS = ['All Types','Public','Private','Deemed'];
