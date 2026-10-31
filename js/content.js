/* All editable copy and config lives here. index.html also contains the full
   static text (for no-JS / SEO); this file drives dynamic bits (form target,
   marquee loop count, mailto fallback) and is the single source to edit. */
window.TSL_CONTENT = {
  contactEmail: "hello@tensenlab.com", // TODO: confirm real contact email
  formEndpoint: null, // TODO: add form endpoint (e.g. Formspree URL); null = mailto fallback
  social: {
    instagram: null, // TODO: Instagram URL
    linkedin: null,  // TODO: LinkedIn URL
    twitter: null    // TODO: X / Twitter URL
  },
  services: [
    "Strategy",
    "Identity & Design",
    "Digital Presence",
    "Content",
    "Personal Branding",
    "Marketing & Growth",
    "Automation & Tech",
    "Maintenance"
  ],

  /* Portfolio / Work gallery.
     The cards are also written statically in index.html (#work) so they work
     with no JS and for SEO — this array is the single, documented source of
     truth to keep in sync. To add a project: add an entry here AND a matching
     <article class="work-card"> in index.html using the same fields, then drop
     the preview image in assets/work/. Keep the image ~16:9 (e.g. 1430x667). */
  projects: [
    {
      id: "gupta-interior",
      name: "Gupta Interior",
      category: "Digital presence",
      description: "A full storefront for a 15-year architectural surfaces business — catalogue, enquiry flow and brand, built from the ground up.",
      image: "assets/work/gupta-interior.jpg",
      video: null,
      client: "guptainterior.in",
      url: "https://www.guptainterior.in/",
      scope: ["Brand & art direction", "Catalogue storefront", "Enquiry & lead flow"]
    },
    {
      id: "dhruva-car-care",
      name: "Dhruva Car Care",
      category: "Digital presence · Product",
      description: "Brand and booking platform for a managed car-wash subscription service across Delhi NCR residential societies.",
      image: "assets/work/dhruva.jpg",
      video: null,
      client: "Dhruva · Delhi NCR",
      url: "https://smart-cash-wash.vercel.app/",
      scope: ["Brand & positioning", "Marketing site", "Subscription & booking flow"]
    },
    {
      id: "gtbit-careers",
      name: "GTBIT Careers",
      category: "Digital presence · Automation",
      description: "A placement and internship portal for an engineering institute's training & placement cell — live drives, hackathons and resources in one place.",
      image: "assets/work/gtbit-careers.jpg",
      video: null,
      client: "git-careers.vercel.app",
      url: "https://git-careers.vercel.app/",
      scope: ["Portal UX & build", "Live opportunity board", "Resource hub"]
    }
  ]
};
