export type EventItem={
  image: string,
  title: string,
  slug: string,
  location: string,
  date: string,
  time: string,

}
export const events = [
  {
    title: "Next.js Conf 2026",
    image: "/images/event1.png",
    slug: "nextjs-conf-2026",
    location: "San Francisco, CA",
    date: "October 25, 2026",
    time: "09:00 AM",
  },
  {
    title: "React Summit",
    image: "/images/event2.png",
    slug: "react-summit",
    location: "Amsterdam, NL",
    date: "June 14, 2026",
    time: "10:00 AM",
  },
  {
    title: "Global AI Hackathon",
    image: "/images/event3.png",
    slug: "global-ai-hackathon",
    location: "London, UK",
    date: "March 12, 2026",
    time: "08:30 AM",
  },
  {
    title: "Vue.js Amsterdam",
    image: "/images/event4.png",
    slug: "vuejs-amsterdam",
    location: "Amsterdam, NL",
    date: "February 10, 2026",
    time: "09:30 AM",
  },
  {
    title: "DevOps Days",
    image: "/images/event5.png",
    slug: "devops-days",
    location: "Austin, TX",
    date: "May 05, 2026",
    time: "09:00 AM",
  },
  {
    title: "Google I/O 2026",
    image: "/images/event6.png",
    slug: "google-io-2026",
    location: "Mountain View, CA",
    date: "May 20, 2026",
    time: "10:00 AM",
  },
];
