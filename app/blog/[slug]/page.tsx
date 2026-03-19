"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

// ─────────────────────────────────────────────
// Shared blog post data (single source of truth)
// ─────────────────────────────────────────────
const ALL_BLOG_POSTS = [
  {
    slug: "yolngu-art-symbols",
    title: "Understanding Yolŋu Art: Symbols, Stories & Sacred Meaning",
    excerpt:
      "Every dot, line, and colour in Yolŋu art carries generations of knowledge. We explore the visual language behind some of our most celebrated works.",
    tags: ["Culture", "Art"],
    readTime: "5 min read",
    date: "12 Mar 2026",
    author: "Alpa Editorial Team",
    image: "/images/about2.png",
    href: "/blog/yolngu-art-symbols",
    cta: "Read the story",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "For the Yolŋu people of Arnhem Land, art is not decoration — it is language. Every geometric mark, concentric circle, and crosshatch pattern carries ancestral meaning that has been passed down across thousands of generations. To view a Yolŋu artwork without understanding its visual grammar is to read a letter in an unknown script.",
      },
      {
        type: "heading",
        text: "The Language of Dots",
      },
      {
        type: "paragraph",
        text: "Dots are perhaps the most internationally recognised element of Aboriginal art, but their function is far more nuanced than aesthetic. In Yolŋu tradition, dots can represent waterholes, gathering places, campsites, or stars. The spacing, size, and colour of each dot communicates something specific to those who know how to read them.",
      },
      {
        type: "paragraph",
        text: "Critically, the number of dots in a cluster, their arrangement around a central motif, and the relationship between clusters across the canvas can narrate a complete Dreamtime story — one that an initiated viewer can follow like a map.",
      },
      {
        type: "heading",
        text: "Rarrk: The Sacred Crosshatch",
      },
      {
        type: "paragraph",
        text: "Rarrk — the distinctive crosshatch infill used in bark painting and body decoration — is one of the most codified visual elements in Yolŋu art. Each clan group has its own rarrk pattern, and its use on a painting identifies the work as belonging to a specific family lineage. Displaying another clan's rarrk without permission is a serious cultural transgression.",
      },
      {
        type: "quote",
        text: "The pattern is not just beautiful. It is a name. It says: this Country belongs to us, and this story was given to us to care for.",
        attribution: "Yolŋu elder, Arnhem Land",
      },
      {
        type: "heading",
        text: "Colour and Country",
      },
      {
        type: "paragraph",
        text: "Traditional Yolŋu pigments are derived directly from the land — white from kaolin clay, yellow and red from ochre, black from charcoal. These aren't simply materials; they are Country itself being used to speak. The choice of pigment in a traditional work often corresponds to the specific geographic location being depicted in the narrative.",
      },
      {
        type: "paragraph",
        text: "Contemporary Yolŋu artists increasingly work with acrylic on canvas but maintain the sacred visual vocabulary. When you purchase an authentic Yolŋu artwork from our marketplace, you are acquiring not just an object, but a living document — one that holds real cultural weight and responsibility.",
      },
      {
        type: "heading",
        text: "Why Provenance Matters",
      },
      {
        type: "paragraph",
        text: "Understanding the symbolism is also why provenance matters deeply. A work produced by an artist from the wrong clan using another clan's sacred symbols is not merely a copy — it is a cultural harm. Every artist on our platform is verified as a genuine community member, and every artwork carries documentation of its origin story.",
      },
    ],
  },
  {
    slug: "how-we-ship",
    title: "From Arnhem Land to Your Doorstep: How We Ship with Care",
    excerpt:
      "Sending fragile, handcrafted pieces across Australia isn't simple. Here's how our fulfilment team ensures every order arrives safely and on time.",
    tags: ["Delivery", "Behind the Scenes"],
    readTime: "4 min read",
    date: "28 Feb 2026",
    author: "Alpa Operations Team",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/how-we-ship",
    cta: "Learn how we do it",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Arnhem Land is one of the most remote regions in Australia. For many of our artists, the nearest major city is more than a thousand kilometres away. And yet, every week, hundreds of carefully made pieces make that journey — arriving at doorsteps across the country, intact and on time.",
      },
      {
        type: "heading",
        text: "The Challenge of Remote Fulfilment",
      },
      {
        type: "paragraph",
        text: "Shipping from remote communities involves layers of complexity that urban fulfilment centres never face. Road conditions change with the wet season. Air freight is often the only viable option for certain communities. And the artworks themselves — bark paintings, woven baskets, ceramic vessels — are fragile in ways that standard packaging systems aren't designed for.",
      },
      {
        type: "heading",
        text: "Our Packaging Standards",
      },
      {
        type: "paragraph",
        text: "Every artwork is assessed individually before packing. Flat works like bark paintings and canvases are wrapped in acid-free tissue, sandwiched between rigid foam boards, and boxed with at least 5 cm of cushioning on all sides. Three-dimensional pieces — sculptures, instruments, woven goods — are custom-formed in biodegradable moulded pulp inserts.",
      },
      {
        type: "quote",
        text: "We treat every package like it's carrying something irreplaceable. Because it is.",
        attribution: "Sarah M., Head of Fulfilment",
      },
      {
        type: "heading",
        text: "Partnering with Australia Post",
      },
      {
        type: "paragraph",
        text: "Our primary shipping partner is Australia Post, whose extensive regional network gives us reliable reach into and out of remote NT communities. For high-value or oversized pieces, we supplement with specialist art couriers who provide white-glove handling and climate-controlled transport.",
      },
      {
        type: "paragraph",
        text: "Every order above $200 includes automatic signature-on-delivery and full insurance coverage. For international orders, we work with certified customs brokers to ensure artworks are correctly classified and protected under cultural heritage export regulations.",
      },
      {
        type: "heading",
        text: "What Happens if Something Goes Wrong",
      },
      {
        type: "paragraph",
        text: "If your order arrives damaged, our team will arrange an immediate replacement or full refund — no questions asked, no long claim forms. We photograph every item before dispatch so we can move fast if there's an issue. Our goal is simple: you should feel confident ordering something precious from a world away.",
      },
    ],
  },
  {
    slug: "meet-the-makers",
    title: "Meet the Makers: Spotlight on Three Aboriginal Artists",
    excerpt:
      "We sat down with three creators from our seller community to hear their stories, their craft, and what inspires their most iconic pieces.",
    tags: ["Makers", "Community"],
    readTime: "6 min read",
    date: "15 Feb 2026",
    author: "Alpa Editorial Team",
    image: "/images/main.png",
    href: "/blog/meet-the-makers",
    cta: "Meet the artists",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Behind every product on our marketplace is a person — someone with a name, a story, a Country, and a craft that has roots deeper than most of us can imagine. This month, we sat down with three members of our seller community to hear directly from them.",
      },
      {
        type: "heading",
        text: "Djuwalpi: Weaver of the Wetlands",
      },
      {
        type: "paragraph",
        text: "Djuwalpi has been weaving pandanus baskets since she was seven years old, learning beside her grandmother at the edge of a freshwater billabong in northeast Arnhem Land. Today, her work sells to collectors across Australia and the world — but she still harvests the same pandanus leaves her grandmother showed her, dried in the same way, dyed with the same natural pigments.",
      },
      {
        type: "quote",
        text: "When I weave, I am talking to my grandmother. Every stitch is a conversation across time.",
        attribution: "Djuwalpi, Arnhem Land",
      },
      {
        type: "heading",
        text: "Gapanbulu: The Bark Painter",
      },
      {
        type: "paragraph",
        text: "Gapanbulu's bark paintings are instantly recognisable for their bold rarrk crosshatching and the quiet intensity of the figures within them. He describes painting as a responsibility rather than a craft: each work depicts a segment of his clan's ancestral narrative, and painting it correctly — in the right sequence, with the right patterns — is an act of cultural maintenance.",
      },
      {
        type: "paragraph",
        text: "He works at dawn, before the heat sets in, using brushes made from chewed bark ends. A single large bark painting can take two to three weeks to complete.",
      },
      {
        type: "heading",
        text: "Yirrkala: Carver and Storyteller",
      },
      {
        type: "paragraph",
        text: "Yirrkala carves didgeridoos from hollow eucalyptus branches he finds during walks across his family's Country. No two instruments are the same — each carries the particular resonance of the wood it came from and the stories its creator has embedded in its painted surface. He laughs when asked about playing technique: 'The didge teaches you. You don't teach it.'",
      },
      {
        type: "paragraph",
        text: "All three artists are currently listing work on our marketplace. Each product page includes a personal statement from the maker and a map showing the Country their work comes from.",
      },
    ],
  },
  {
    slug: "bark-painting-ceremony",
    title: "The Significance of Bark Painting in Yolŋu Ceremony",
    excerpt:
      "Bark paintings are far more than decorative artworks — they are sacred maps, ancestral records, and living connections to Country. Discover their deeper meaning.",
    tags: ["Culture", "Art"],
    readTime: "7 min read",
    date: "5 Feb 2026",
    author: "Alpa Editorial Team",
    image: "/images/about2.png",
    href: "/blog/bark-painting-ceremony",
    cta: "Explore the tradition",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "In the ceremonial life of the Yolŋu people, bark paintings occupy a role that sits far outside what Western culture considers 'art'. They are not objects made to be admired — they are records, proofs of title, and living instruments of ceremony. To understand a bark painting is to understand something profound about the Yolŋu relationship with Country and time.",
      },
      {
        type: "heading",
        text: "Origins in Ceremony",
      },
      {
        type: "paragraph",
        text: "Traditionally, designs that now appear on bark were first used in body painting for ceremony. The shift to bark as a permanent medium occurred gradually, accelerating in the mid-twentieth century as anthropologists and collectors began documenting and acquiring works. This transition allowed ancestral knowledge to be preserved in physical form — but it also introduced complex questions about what could be shown and to whom.",
      },
      {
        type: "heading",
        text: "Sacred vs. Public Knowledge",
      },
      {
        type: "paragraph",
        text: "Yolŋu society operates on a layered system of sacred and public knowledge. Some ceremonial designs may never be reproduced on artworks for sale. Others can be shown in modified form. The knowledge of which elements are sacred and which are permissible for public display rests with clan elders, and every authentic artwork has been produced within this framework of permission.",
      },
      {
        type: "quote",
        text: "Every painting has a shallow meaning and a deep meaning. The shallow meaning is what everyone can see. The deep meaning is for those who have earned the right to know.",
        attribution: "Senior Yolŋu elder",
      },
      {
        type: "heading",
        text: "The Bark Itself",
      },
      {
        type: "paragraph",
        text: "The bark used is the inner bark of the stringybark eucalyptus, harvested during the wet season when it peels cleanly. It is flattened and dried, then sealed with a fixative wash before painting begins. The physical impermanence of the medium — bark eventually dries, cracks, and degrades — is philosophically significant: artworks are not meant to be eternal objects, but moments of cultural transmission.",
      },
    ],
  },
  {
    slug: "identify-authentic-art",
    title: "How to Identify Authentic Aboriginal Art When You Shop",
    excerpt:
      "With the rise of inauthentic replicas, knowing how to recognise genuine Aboriginal artwork is more important than ever. Here's your practical guide.",
    tags: ["Art", "Guide"],
    readTime: "5 min read",
    date: "22 Jan 2026",
    author: "Alpa Editorial Team",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/identify-authentic-art",
    cta: "Read the guide",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "The market for Aboriginal art has grown enormously over the past two decades — and unfortunately, so has the market for inauthentic replicas. Mass-produced imitations made overseas are regularly sold as 'Aboriginal-style' art, often without clear disclosure. Knowing how to spot the difference protects both you and the communities whose culture is being represented.",
      },
      {
        type: "heading",
        text: "1. Look for Artist Attribution",
      },
      {
        type: "paragraph",
        text: "Authentic Aboriginal artwork should always be accompanied by the artist's name, language group or clan, and Country of origin. If a work is sold without this information — or with only a vague label like 'Indigenous-inspired' — treat it with scepticism. Genuine community art centres provide provenance certificates as standard.",
      },
      {
        type: "heading",
        text: "2. Understand the Source",
      },
      {
        type: "paragraph",
        text: "Artworks sold directly through community art centres, or platforms vetted by those centres, are the most reliable sources of authentic work. Souvenir shops, airport retail, and general marketplaces without verification processes are high-risk environments for replicas.",
      },
      {
        type: "quote",
        text: "Buying a fake doesn't just waste your money. It takes income away from the artist whose culture it exploits.",
        attribution: "ANCA (Aboriginal Art Codes of Australia)",
      },
      {
        type: "heading",
        text: "3. Check for the Indigenous Art Code",
      },
      {
        type: "paragraph",
        text: "The Indigenous Art Code is a voluntary industry standard in Australia that commits dealers to ethical practice. Dealers who subscribe to the Code — and galleries that display its logo — have agreed to transparent dealing, fair payments to artists, and honest representation. It's not a guarantee, but it's a meaningful signal.",
      },
      {
        type: "heading",
        text: "4. Ask Questions",
      },
      {
        type: "paragraph",
        text: "A legitimate seller will always be able to answer: Who made this? Where are they from? What does this work depict? If a seller is evasive or vague about these basic questions, walk away. The story behind a work is as much a part of it as the paint.",
      },
    ],
  },
  {
    slug: "didgeridoo-voice-of-ancestors",
    title: "The Didgeridoo: Voice of the Ancestors",
    excerpt:
      "One of the world's oldest musical instruments, the didgeridoo carries ceremony, healing, and story within every breath. We trace its origins and its makers.",
    tags: ["Culture", "Music"],
    readTime: "4 min read",
    date: "10 Jan 2026",
    author: "Alpa Editorial Team",
    image: "/images/main.png",
    href: "/blog/didgeridoo-voice-of-ancestors",
    cta: "Listen to the story",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "The didgeridoo — known as the yidaki in the Yolŋu languages of northeast Arnhem Land — is one of humanity's oldest wind instruments, with origins stretching back at least 1,500 years and possibly much further. But to describe it simply as a musical instrument is to fundamentally misunderstand its place in Yolŋu culture.",
      },
      {
        type: "heading",
        text: "More Than Music",
      },
      {
        type: "paragraph",
        text: "The yidaki is first and foremost a ceremonial instrument. Its deep drone, produced through a technique of circular breathing that takes years to master, is used to accompany song and dance in ceremony. Different tones and rhythms carry specific ceremonial meanings. Playing the wrong rhythm at the wrong ceremony is not a musical mistake — it is a cultural one.",
      },
      {
        type: "heading",
        text: "How a Yidaki is Made",
      },
      {
        type: "paragraph",
        text: "A genuine yidaki is made from a eucalyptus branch or trunk that has been hollowed by termites. The maker walks Country listening and knocking — selecting only branches whose internal cavity has the right resonance. The exterior is then painted with clan designs that tell the story of the instrument's Country and lineage.",
      },
      {
        type: "quote",
        text: "The termites do the work. We just listen for the right one.",
        attribution: "Yidaki carver, Yirrkala community",
      },
      {
        type: "heading",
        text: "Buying a Yidaki Ethically",
      },
      {
        type: "paragraph",
        text: "Mass-produced didgeridoos made from bamboo or machined timber are widely available and unproblematic as musical tools. But if you are seeking a genuine yidaki with cultural significance, provenance matters enormously. Our marketplace lists only instruments made by verified Yolŋu carvers, each with full documentation of its maker and Country.",
      },
    ],
  },
  {
    slug: "sustainable-packaging",
    title: "Sustainable Packaging: Our Journey Toward Zero Waste",
    excerpt:
      "We've been quietly reimagining how we pack and ship your orders without adding to landfill. Here's a transparent look at where we are and where we're headed.",
    tags: ["Behind the Scenes", "Sustainability"],
    readTime: "3 min read",
    date: "29 Dec 2025",
    author: "Alpa Operations Team",
    image: "/images/about-us-what-we-offer.jpg",
    href: "/blog/sustainable-packaging",
    cta: "See our commitment",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "When you open a package from us, we want you to feel good about everything inside — including the packaging itself. Over the past eighteen months, we've been systematically replacing conventional packaging materials with sustainable alternatives, and we want to share where that journey has brought us.",
      },
      {
        type: "heading",
        text: "What We've Changed",
      },
      {
        type: "paragraph",
        text: "We've eliminated all single-use polystyrene from our fulfilment process, replacing it with moulded pulp inserts made from recycled paper. Our outer boxes are now 100% recycled cardboard, and our tape is paper-based and plastic-free. For artwork wrapping, we use acid-free tissue that is also recyclable.",
      },
      {
        type: "heading",
        text: "What We're Still Working On",
      },
      {
        type: "paragraph",
        text: "We're honest about where we haven't yet reached our goals. Water-activated tape, while better than plastic, still requires specific composting conditions to break down fully. And for some of our larger artworks, we're still relying on a small amount of plastic bubble wrap in specific areas — we're actively testing compostable foam alternatives.",
      },
      {
        type: "quote",
        text: "We don't want to greenwash. We'd rather tell you honestly what we've done and what we're still figuring out.",
        attribution: "Emma R., Sustainability Lead",
      },
      {
        type: "heading",
        text: "Our 2026 Targets",
      },
      {
        type: "paragraph",
        text: "By the end of 2026, we're targeting 100% plastic-free packaging across all order sizes, a take-back scheme for reusable padded mailers, and carbon-offset shipping on all domestic orders. We'll report back on progress every quarter — here on the journal.",
      },
    ],
  },
  {
    slug: "community-stories",
    title: "Community Stories: Life and Craft in Arnhem Land",
    excerpt:
      "Through the eyes of artists, elders, and families, we share what everyday life looks like in the remote communities that power this marketplace.",
    tags: ["Community", "Culture"],
    readTime: "8 min read",
    date: "14 Dec 2025",
    author: "Alpa Editorial Team",
    image: "/images/about2.png",
    href: "/blog/community-stories",
    cta: "Hear their stories",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Arnhem Land is not a monolith. It is a mosaic of dozens of distinct clan groups, each with their own language, ceremonial life, and artistic traditions — bound together by deep connections to Country and to each other. In this piece, we share stories from three communities whose artists are at the heart of our marketplace.",
      },
      {
        type: "heading",
        text: "Yirrkala: Where It Began",
      },
      {
        type: "paragraph",
        text: "Yirrkala, on the northeastern tip of Arnhem Land, is widely considered the birthplace of the Aboriginal art movement. The Yirrkala Art Centre — established in 1962 and among the oldest in Australia — continues to represent over 200 active artists. The community maintains a fiercely local economy: nearly every family has at least one active artist, and sales from the art centre are a primary income source.",
      },
      {
        type: "heading",
        text: "Maningrida: The Weaving Community",
      },
      {
        type: "paragraph",
        text: "Further west, Maningrida is home to one of Australia's most celebrated weaving traditions. The women of Maningrida weave pandanus baskets, mats, and fish traps using techniques passed down over thousands of years. The work is extraordinarily time-intensive — a single large basket can represent more than 80 hours of labour — and its value is only beginning to be recognised by the broader art market.",
      },
      {
        type: "quote",
        text: "People see a basket and think it is simple. But every strand has a name. Every pattern has a story.",
        attribution: "Senior weaver, Maningrida",
      },
      {
        type: "heading",
        text: "Ramingining: Sculpture and Ceremony",
      },
      {
        type: "paragraph",
        text: "Ramingining, a smaller community in central Arnhem Land, is known for its sculptural tradition — hollow log coffins, carved animals, and ceremonial objects that blur the line between functional and sacred. The community's artists have been shown in major galleries worldwide, yet most continue to work in exactly the same way their grandparents did: on Country, for Country.",
      },
    ],
  },
  {
    slug: "weaving-textiles-guide",
    title: "A Complete Buyer's Guide to Aboriginal Weaving & Textiles",
    excerpt:
      "From pandanus baskets to woven mats, Aboriginal textiles are tactile stories of land and lineage. Learn what to look for before you buy.",
    tags: ["Guide", "Art"],
    readTime: "6 min read",
    date: "1 Dec 2025",
    author: "Alpa Editorial Team",
    image: "/images/main.png",
    href: "/blog/weaving-textiles-guide",
    cta: "Start reading",
    featured: false,
    content: [
      {
        type: "paragraph",
        text: "Aboriginal weaving is one of the oldest continuously practised craft traditions on Earth — and one of the least understood by buyers. Whether you're shopping for a pandanus basket, a woven mat, or a fish trap turned wall sculpture, this guide will help you understand what you're buying, what makes it valuable, and how to care for it.",
      },
      {
        type: "heading",
        text: "Key Materials to Know",
      },
      {
        type: "paragraph",
        text: "Pandanus palm is the most common weaving material across Arnhem Land — its long, flat leaves are stripped, dried, and in many communities dyed with natural pigments. Sedge grass, lawyer cane, and paperbark are also used, each carrying regional associations. The material used often tells you where a piece is from before anything else does.",
      },
      {
        type: "heading",
        text: "Natural vs. Commercial Dyes",
      },
      {
        type: "paragraph",
        text: "Traditionally dyed works use plant-based pigments — roots, bark, berries — that produce earthy ochres, warm yellows, and deep blacks. These natural dyes fade gently over time, which many collectors consider part of the work's living quality. More contemporary weavers sometimes use commercial dyes that produce brighter, more saturated colours. Neither is more or less authentic — they simply represent different moments in a continuous tradition.",
      },
      {
        type: "quote",
        text: "My grandmother used the same plants she showed me. I use those and sometimes others. Both are true.",
        attribution: "Pandanus weaver, Maningrida",
      },
      {
        type: "heading",
        text: "What to Look for in Quality",
      },
      {
        type: "paragraph",
        text: "In high-quality woven works, strands are even and consistent in width, tension is uniform across the surface, and pattern transitions are clean and deliberate. Loose ends should be tucked and secured, not left exposed. The base and rim of a basket should be structurally sound — gently press the sides: a well-made basket resists deformation.",
      },
      {
        type: "heading",
        text: "Caring for Your Piece",
      },
      {
        type: "paragraph",
        text: "Keep woven works away from direct sunlight, which breaks down natural fibres and fades dyes. In very dry conditions, a light mist of water can prevent brittleness — pandanus in particular benefits from occasional humidity. Store or display flat woven pieces without folding, and never hang a basket from a single point that places stress on one section of the weave.",
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution: string };

// ─────────────────────────────────────────────
// Page component
// ─────────────────────────────────────────────
export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const post = ALL_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    // Trigger 404 via notFound() would require server component,
    // so we render a graceful not-found UI on the client.
    return (
      <main className="min-h-screen bg-[#EAD7B7] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-[#e8d5c0] flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-[#803512]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-[#3a1208] mb-3">Post not found</h1>
        <p className="text-[#803512]/60 mb-8">This story doesn't exist or may have been moved.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 px-7 py-3 bg-[#5A1E12] text-white rounded-full font-semibold text-sm hover:bg-[#7a2a1a] transition-colors">
          Back to Journal
        </Link>
      </main>
    );
  }

  const related = ALL_BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))
  ).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#EAD7B7]">

      {/* ── HERO ── */}
      <section className="relative bg-[#3a1208] overflow-hidden">
        {/* Dot-grid watermark */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="post-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#post-dots)" />
        </svg>

        {/* Hero image */}
        <div className="relative w-full h-72 sm:h-96 lg:h-[520px] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1208] via-[#3a1208]/60 to-transparent" />
        </div>

        {/* Header content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 -mt-32 sm:-mt-40 lg:-mt-52 pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#ead7b7]/40 mb-5">
            <Link href="/" className="hover:text-[#ead7b7]/70 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#ead7b7]/70 transition-colors">Journal</Link>
            <span>/</span>
            <span className="text-[#ead7b7]/60 truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#ead7b7] text-[11px] font-bold tracking-wide uppercase backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#ead7b7]/50">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.author}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#ead7b7]/30" />
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.date}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#ead7b7]/30" />
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Excerpt / lead */}
          <p className="text-lg sm:text-xl text-[#3a1208]/70 leading-relaxed font-medium border-l-4 border-[#803512] pl-5 mb-12">
            {post.excerpt}
          </p>

          {/* Content blocks */}
          <div className="space-y-8">
            {(post.content as ContentBlock[]).map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2
                    key={i}
                    className="text-2xl sm:text-3xl font-black text-[#3a1208] leading-snug tracking-tight pt-4"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="relative my-10 pl-6 border-l-4 border-[#803512]"
                  >
                    <svg
                      className="absolute -top-2 -left-1 w-6 h-6 text-[#803512]/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-xl sm:text-2xl font-bold italic text-[#3a1208] leading-snug mb-3">
                      "{block.text}"
                    </p>
                    <cite className="text-sm font-semibold text-[#803512]/70 not-italic">
                      — {block.attribution}
                    </cite>
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-base sm:text-lg text-[#3a1208]/70 leading-relaxed">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* Tags footer */}
          <div className="flex flex-wrap gap-2 mt-14 pt-8 border-t border-[#803512]/20">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#803512]/50 mr-2 self-center">Tags:</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-4 py-1.5 rounded-full bg-white border border-[#e8d5c0] text-[#803512] text-[11px] font-bold tracking-wide uppercase hover:bg-[#F4E9DC] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] hover:text-[#5A1E12] transition-colors group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to all articles
            </Link>
          </div>
        </div>
      </section>

      {/* ── RELATED POSTS ── */}
      {related.length > 0 && (
        <section className="bg-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#803512]/60 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#803512] animate-pulse" />
                  Keep Reading
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#3a1208] leading-tight tracking-tight">
                  Related <span className="text-[#803512]">Stories</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="shrink-0 inline-flex items-center gap-2 font-semibold underline underline-offset-4 text-[#803512] hover:text-[#5A1E12] transition-colors group text-sm"
              >
                View all articles
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Cards — same design as homepage / blog listing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((relPost) => (
                <article
                  key={relPost.slug}
                  className="group flex flex-col bg-[#EAD7B7] border border-[#e8d5c0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-video overflow-hidden bg-[#F4E9DC]">
                    <Image
                      src={relPost.image}
                      alt={relPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Read time pill */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-semibold text-white/90">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {relPost.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {relPost.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-white text-[#803512] text-[11px] font-semibold tracking-wide border border-[#e8d5c0]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#803512]/50 font-medium mb-2 tracking-wide">
                      {relPost.date}
                    </p>
                    <h3 className="text-lg font-bold text-[#1a0a06] leading-snug mb-3 group-hover:text-[#803512] transition-colors duration-200">
                      {relPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
                      {relPost.excerpt}
                    </p>

                    {/* CTA */}
                    <div className="pt-4 border-t border-[#e8d5c0]">
                      <Link
                        href={relPost.href}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#803512] hover:text-[#5A1E12] transition-colors group/cta"
                      >
                        {relPost.cta}
                        <svg
                          className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA STRIP ── */}
      <section className="bg-[#3a1208] py-16 px-4 relative overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="cta-dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#EAD7B7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-dots2)" />
        </svg>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Explore Our <span className="text-[#ead7b7]">Marketplace</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Discover authentic Aboriginal art, crafts, and cultural products — each with a story directly from Arnhem Land.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ead7b7] hover:bg-white text-[#3a1208] font-bold text-sm rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            Shop Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

    </main>
  );
}
