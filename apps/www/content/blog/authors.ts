export type Author = {
  name: string;
  role: string;
  image: {
    src: string;
    alt?: string;
  };
};

type Authors = {
  [key: string]: Author;
};

export const authors: Authors = {
  dom: {
    name: "Dom Eccleston",
    role: "Engineer",
    image: { src: "/images/team/dom.jpeg" },
  },
  james: {
    name: "James Perkins",
    role: "Co-Founder / CEO",
    image: { src: "/images/team/james.jpg" },
  },
  andreas: {
    name: "Andreas Thomas",
    role: "Co-Founder",
    image: { src: "/images/team/andreas.jpeg" },
  },
  yergush: {
    name: "Yergush",
    role: "Founder & Product",
    image: { src: "/images/NewTeam/gush.JPG", alt: "Yergush" },
  },
  david: {
    name: "David",
    role: "AI Integrations Lead",
    image: { src: "/images/NewTeam/david.png", alt: "David" },
  },
  tim: {
    name: "Tim",
    role: "Corporate Transformation",
    image: { src: "/images/NewTeam/tim.png", alt: "Tim" },
  },
  sara: {
    name: "Sara",
    role: "Brand & Marketing",
    image: { src: "/images/NewTeam/sara.png", alt: "Sara" },
  },
  jasper: {
    name: "Jasper",
    role: "Engineering & Data",
    image: { src: "/images/NewTeam/jasper.png", alt: "Jasper" },
  },
  chiHueng: {
    name: "Chi-hueng",
    role: "Research & Automation",
    image: { src: "/images/NewTeam/Chi-hueng.png", alt: "Chi-hueng" },
  },
  aiAgents: {
    name: "AI Agents",
    role: "AI Systems Crew",
    image: { src: "/images/NewTeam/Aiagents.png", alt: "AI Agents" },
  },
  wilfred: {
    name: "Wilfred Almeida",
    role: "Freelance Writer",
    image: { src: "/images/blog-images/ocr-post/wilfred.jpg" },
  },
  michael: {
    name: "Michael Silva",
    role: "Developer",
    image: { src: "/images/team/michael.jpg" },
  },
  oz: {
    name: "Oguzhan Olguncu",
    role: "Developer",
    image: { src: "/images/team/oz.jpeg" },
  },
  meg: {
    name: "Meg Stepp",
    role: "Senior Engineer",
    image: { src: "/images/team/meg.jpg", alt: "Meg Stepp" },
  },
};
