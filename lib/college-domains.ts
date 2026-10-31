/**
 * Allowed college domains configuration for Campus BookShare.
 * Students signing up with an email matching any of these domains/suffixes
 * receive an automatic "College Verified" badge.
 */
export const ALLOWED_COLLEGE_DOMAINS: string[] = [
  // Generic educational suffixes
  ".edu",
  ".ac.in",
  ".edu.in",
  ".res.in",
  ".ernet.in",
  
  // Specific renowned Indian institutions
  "iitb.ac.in",
  "iitd.ac.in",
  "iitm.ac.in",
  "iitk.ac.in",
  "iitkgp.ac.in",
  "iitr.ac.in",
  "iitg.ac.in",
  "iith.ac.in",
  "iitbhu.ac.in",
  "bits-pilani.ac.in",
  "goa.bits-pilani.ac.in",
  "hyderabad.bits-pilani.ac.in",
  "nitt.edu",
  "nitk.edu.in",
  "nitw.ac.in",
  "du.ac.in",
  "jnu.ac.in",
  "bhu.ac.in",
  "iisc.ac.in",
  "iiit.ac.in",
  "iiitd.ac.in",
  "manipal.edu",
  "vit.ac.in",
  "srmist.edu.in",
  "amrita.edu",
  "thapar.edu",
  "christuniversity.in",
  "stxaviers.edu",
  "loyolacollege.edu",

  // International universities
  "stanford.edu",
  "mit.edu",
  "harvard.edu",
  "berkeley.edu",
  "ox.ac.uk",
  "cam.ac.uk",
];

export function isCollegeEmail(email?: string | null): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;

  return ALLOWED_COLLEGE_DOMAINS.some((allowed) => {
    if (allowed.startsWith(".")) {
      return domain.endsWith(allowed);
    }
    return domain === allowed || domain.endsWith("." + allowed);
  });
}

export function getCollegeNameFromEmail(email?: string | null): string | null {
  if (!email || !isCollegeEmail(email)) return null;
  const domain = email.trim().toLowerCase().split("@")[1];
  
  const knownColleges: Record<string, string> = {
    "iitb.ac.in": "IIT Bombay",
    "iitd.ac.in": "IIT Delhi",
    "iitm.ac.in": "IIT Madras",
    "iitk.ac.in": "IIT Kanpur",
    "iitkgp.ac.in": "IIT Kharagpur",
    "bits-pilani.ac.in": "BITS Pilani",
    "du.ac.in": "Delhi University",
    "iisc.ac.in": "IISc Bangalore",
    "stanford.edu": "Stanford University",
    "mit.edu": "MIT",
    "harvard.edu": "Harvard University",
  };

  for (const [key, name] of Object.entries(knownColleges)) {
    if (domain === key || domain.endsWith("." + key)) {
      return name;
    }
  }

  // Fallback nicely formatted domain
  return domain.replace(/\.(ac\.in|edu\.in|edu|org)$/, "").toUpperCase();
}

