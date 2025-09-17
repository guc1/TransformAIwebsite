import { Container } from "@/components/container";
import { FadeIn } from "@/components/fade-in";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type OSSFriend = {
  href: string;
  name: string;
  description: string;
};

const FRIENDS_ENDPOINT = "https://formbricks.com/api/oss-friends";

async function loadFriends(): Promise<OSSFriend[]> {
  try {
    const response = await fetch(FRIENDS_ENDPOINT, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OSS friends: ${response.statusText}`);
    }

    const payload = (await response.json()) as { data?: OSSFriend[] };
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    console.error("Unable to load OSS friends", error);
    return [];
  }
}

export const dynamic = "force-dynamic";

const OpenSourceFriends = async () => {
  const friends = await loadFriends();

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40 mb-12 lg:mb-24">
      <FadeIn>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center">
          <h1 className="font-display text-5xl font-medium tracking-tight text-white [text-wrap:balance] sm:text-7xl font-sans">
            Our Open source friends
          </h1>
          <p className="font-sans text-white/60 text-lg mt-2">
            Unkey finds inspiration in open-source projects. Here&rsquo;s a list of our favorite ones
          </p>
          <div className="grid w-full grid-cols-1 gap-8 lg:w-3/4 lauto-rows-fr lg:grid-cols-2 mt-12 md:mt-24">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <Link
                  key={friend.name}
                  href={friend.href}
                  className="flex flex-col items-start overflow-hidden duration-200 border border-white/20 rounded-xl hover:shadow-md hover:scale-[1.01] shadow-md hover:shadow-purple-500/40 bg-white/5 hover:bg-white/10"
                >
                  <div className="flex flex-col justify-between h-full px-4 pb-4">
                    <div>
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-white group-hover:text-white/60 line-clamp-2">
                        {friend.name}
                      </h3>
                      <p className="mt-5 text-sm leading-6 text-white/60 line-clamp-2">
                        {friend.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-white/60">
                We&rsquo;re unable to load our open-source friends right now. Please try again
                soon.
              </p>
            )}
          </div>
        </div>
      </FadeIn>
    </Container>
  );
};

export default OpenSourceFriends;
