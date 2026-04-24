export function bonesMockFactory() {
  return {
    createBones: () => ({
      bone: () => ({}),
      repeat: <T,>(arr: T[] | undefined, count: number): (T | undefined)[] =>
        arr ?? Array.from({ length: count }, () => undefined),
    }),
    BonesForce: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
}

export function bonesWithDataMockFactory() {
  return {
    createBones: <T,>(data: T) => ({
      bone: () => ({}),
      data: data ?? undefined,
      repeat: <U,>(arr: U[] | undefined, count: number): (U | undefined)[] =>
        arr ?? Array.from({ length: count }, () => undefined),
    }),
  };
}

export function nextLinkMockFactory() {
  return {
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
      [key: string]: unknown;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
}
