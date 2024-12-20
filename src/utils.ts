export function joinPaths(paths: string[]): string {
  // Create new array of paths.
  // For every path except the start, check if it starts with a slash. If it does, remove it.
  // For every path except the end, check if it ends with a slash. If it does, remove it.
  // Join the paths with a slash.
  // Return the resulting path.
  return paths
    .map((path, index) => {
      let p = path;
      if (index > 0 && p.startsWith("/")) {
        p = p.slice(1);
      }
      if (index < paths.length - 1 && p.endsWith("/")) {
        p = p.slice(0, -1);
      }
      return p;
    })
    .join("/");
}
