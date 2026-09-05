export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/technologies", label: "Technologies" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/process", label: "Process" },
  { to: "/careers", label: "Careers" },
  { to: "/learning", label: "Learning" },

  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

/** Fallbacks used only until website_settings loads. Editable in Admin → Settings. */
export const FALLBACK_SETTINGS = {
  company_name: "Bennufly Technology Pvt. Ltd.",
  tagline: "Building Ideas. Engineering the Future.",
  email: "supportbennufly@gmail.com",
  phone: "+91 94041 44550",
  whatsapp: "+919404144550",
  whatsapp_message: "Hello Bennufly Technology, I would like to discuss a project.",
  address: "IT Park, Nagpur, Maharashtra, India",
  linkedin: "https://www.linkedin.com/company/bennuflytech/",
  instagram: "https://www.instagram.com/officialbennufly/",
  working_hours: "Mon - Fri: 9:30 AM - 6:30 PM IST | Sat: 10:00 AM - 2:00 PM IST | Sun: Closed",
  footer_text: "Transforming Ideas into Powerful Digital Products.",
  copyright: "2026 Bennufly Technology Pvt. Ltd. All rights reserved.",
};

export const MISSION =
  "To build reliable, innovative and accessible technology solutions that help businesses transform their ideas into impactful digital products, while creating opportunities for the next generation of technology professionals.";

export const VISION =
  "To become a globally trusted technology company known for building innovative software products, AI-powered solutions and digital experiences while nurturing the next generation of technology talent.";

export const PROCESS_STEPS = [
  { no: "01", title: "Discovery", text: "Understand business requirements and goals." },
  { no: "02", title: "Planning", text: "Architecture, scope and roadmap." },
  { no: "03", title: "Design", text: "UI/UX and product experience." },
  { no: "04", title: "Development", text: "Build scalable software." },
  { no: "05", title: "Testing", text: "Quality assurance and security testing." },
  { no: "06", title: "Deployment", text: "Production deployment and monitoring." },
  { no: "07", title: "Support", text: "Maintenance, improvements and support." },
];

export const WHY_BENNUFLY = [
  { title: "Modern Technology", text: "Current, well-supported tooling — not legacy stacks you inherit." },
  { title: "Practical Solutions", text: "We solve the problem in front of you, without unnecessary complexity." },
  { title: "Scalable Architecture", text: "Systems designed to survive growth, not just the first release." },
  { title: "Client-Focused Development", text: "We build around your operations, users and constraints." },
  { title: "Continuous Learning", text: "A team that keeps pace with the tools and techniques it ships with." },
  { title: "Long-Term Support", text: "Maintenance and improvement after launch, not a handoff." },
];

export const BUDGETS = [
  "Under ₹1,00,000",
  "₹1,00,000 – ₹5,00,000",
  "₹5,00,000 – ₹15,00,000",
  "₹15,00,000+",
  "Not sure yet",
];

export const TIMELINES = ["ASAP", "1 – 3 months", "3 – 6 months", "6+ months", "Exploring"];

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];
export const APPLICATION_STATUSES = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

export function whatsappHref(_number?: string | null, _message?: string | null) {
  // Always use the official wa.me deep link to avoid the blocked WhatsApp API domain.
  return "https://wa.me/919404144550?text=Hello%20Bennufly%20Technology%2C%20I%20would%20like%20to%20discuss%20a%20project.";
}