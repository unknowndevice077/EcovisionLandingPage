// The team, shown on the classic page's profiles and in the explorer's Team
// panel. One list, so the two can't disagree.
export type TeamMember = { name: string; title: string; role: string; img: string; pos?: string; desc: string };

export const TEAM: TeamMember[] = [
  {
    name: "Fritz Rjhay Dela Cruz",
    title: "Lead System Architect",
    role: "AI & Model Training",
    img: "/fritz.jpg",
    // Square portrait, face in the upper-middle: keep the head in frame when a wide card crops it.
    pos: "center 35%",
    desc: "Created and trained the custom YOLOv11 AI model. Programmed the camera system to spot fights, weapons, theft, and vandalism instantly right on the pole.",
  },
  {
    name: "Angel Venice Torres",
    title: "Project Manager",
    role: "Leader",
    img: "/angel.jpg",
    desc: "Managed the overall schedule for the thesis, kept track of all deadlines, and helped out with every single part of the project whenever the team needed support.",
  },
  {
    name: "Reiss Mea Peres",
    title: "Documentation & Assembly",
    role: "Technical Writing & Hardware Support",
    img: "/reiss.jpg",
    desc: "Wrote the technical thesis documents, project reports, and paperwork while helping assemble the physical hardware parts of the pole.",
  },
];
