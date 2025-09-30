import type { Post } from "content-collections";

export function filterProjectPosts(posts: Post[]) {
  return posts.filter((post) => post.isProjectPost);
}
