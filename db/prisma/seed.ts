import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const users = [
  { username: "admin", email: "admin@kamp.us", password: "123123" },
  { username: "testuser", email: "user1a@kamp.us", password: "123123123" },
];

const posts = [
  {
    title: "Hacker News",
    slug: "hacker-news",
    url: "https://news.ycombinator.com",
    site: "news.ycombinator.com",
    content: "Code",
  },
  {
    title: "Reddit",
    slug: "reddit",
    url: "https://reddit.com",
    site: "reddit.com",
    content: "The front page of the internet",
  },
  {
    title: "Twitter",
    slug: "twitter",
    url: "https://twitter.com",
    site: "twitter.com",
    content: "What's happening?",
  },
  {
    title: "Facebook",
    slug: "facebook",
    url: "https://facebook.com",
    site: "facebook.com",
    content: "Connect with friends, family and other people you know.",
  },
  {
    title: "Kampus Twitch",
    slug: "kampus-twitch",
    url: "https://twitch.tv/usirin",
    site: "twitch.tv/usirin",
    content: "Twitch",
    comments: [{ content: "Takip etmeyi unutmayın" }],
  },
  {
    title: "discord.kamp.us",
    slug: "discord-kamp-us",
    url: "discord.kamp.us",
    site: "discord.kamp.us",
    content:
      "kampus: ortamlardaki pek $ukela yazilim toplulugu. bol pozitivite, motivasyon ve beraber gelisme mottolari. discord.kamp.us diye bir discord sunuculari var, icerisi adeta sampiyonlar ligi.",
    comments: [
      { content: "Kampüs discord sunucusu" },
      { content: "Discorda gelin" },
      {
        content: "Kampüsteki yazılımcıların motivasyonu o kadar yüksek ki, bazen hiç uyumuyorlar.",
      },
    ],
  },
  {
    title: "Github",
    slug: "github",
    url: "https://github.com/kamp-us/monorepo",
    site: "github.com/kamp-us/monorepo",
    content: "Dünyanın en iyi monoreposu",
    comments: [
      { content: "Bu monorepo çok güzel" },
      { content: "Bu monorepo inanılmaz" },
      { content: "Kampüs çoheyi" },
      { content: "!adam" },
    ],
  },
  {
    title: "Yüksek dozajlı şakalar",
    slug: "yuksek-dozajli-sakalar",
    site: "kamp.us",
    content: "aynen öyle",
    comments: [
      {
        content:
          "'Yarın kampusa gidiyorum' - 'Hangi kampa?' - 'Yok ya, kampus, yazılım topluluğu oraya gidiyorum.'",
      },
      {
        content:
          "Kampüsün yazılım topluluğu üyeleri arasında bir yarışma düzenlenmiş, ama kazananın ödülü yalnızca daha fazla kod yazmak olmuş.",
      },
      {
        content:
          "'Aslında bu bir feature, bug değil' diyen yazılımcılar, kampüsün yazılım topluluğu üyeleri tarafından 'bug' olarak kabul edilir.",
      },
    ],
  },
];

type User = { username: string; email: string; password: string };

type Post = {
  title: string;
  slug: string;
  url?: string;
  content?: string;
  site?: string;
  comments?: { content: string }[];
};

const prisma = new PrismaClient();

async function seedAll(users: User[], posts: Post[]) {
  let postOwnerIDs: string[] = [];
  for (const user of users) {
    const email: string = user.email;
    const username: string = user.username;

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const prismaUser = await prisma.user.upsert({
      where: {
        username,
      },
      update: {
        username,
        email,
        password: {
          update: {
            hash: hashedPassword,
          },
        },
      },
      create: {
        username,
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
    postOwnerIDs.push(prismaUser.id);

    await prisma.userPreference.upsert({
      where: {
        userID: prismaUser.id,
      },
      update: {
        userID: prismaUser.id,
      },
      create: {
        user: {
          connect: {
            id: prismaUser.id,
          },
        },
      },
    });
  }

  for (const post of posts) {
    const title: string = post.title;
    const slug: string = post.slug;
    const url: string | null = post.url || null;
    const site: string | null = post.site || null;
    const content: string | null = post.content || null;
    const comments: any[] = post.comments || [];
    const findPrismaPost = await prisma.post.findFirst({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });
    if (findPrismaPost) {
      return;
    }

    await prisma.post.create({
      data: {
        title,
        url,
        site,
        slug,
        content,
        owner: {
          connect: {
            id: postOwnerIDs[Math.floor(Math.random() * postOwnerIDs.length)],
          },
        },
        comments: {
          create: comments.map((comment) => {
            return {
              content: comment.content,
              owner: {
                connect: {
                  id: postOwnerIDs[Math.floor(Math.random() * postOwnerIDs.length)],
                },
              },
            };
          }),
        },
      },
    });
  }
}

seedAll(users, posts)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
