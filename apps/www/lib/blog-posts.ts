import type { Post } from "content-collections";

export function filterProjectPosts(posts: Post[]) {
  return posts.filter((post) => post.isProjectPost);
}

export function selectRandomPosts(posts: Post[], count: number) {
  if (posts.length <= count) {
    return [...posts];
  }

  const shuffled = [...posts];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}
