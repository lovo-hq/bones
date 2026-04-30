import type { ReactNode } from "react";

export function bonesMockFactory() {
  return {
    createBones: <T,>(data: T) => ({
      bone: () => ({}),
      data: data ?? undefined,
      repeat: <U,>(
        arr: U[] | undefined,
        count: number,
        render: (item: U | undefined, index: number) => ReactNode,
      ): ReactNode[] => {
        const items: (U | undefined)[] = arr ?? Array.from({ length: count }, () => undefined);
        return items.map((item, i) => render(item, i));
      },
      lines: <V,>(
        value: V | null | undefined,
        _count: number,
        render: (item: V) => ReactNode,
      ): ReactNode[] => {
        if (value == null) return [];
        return [render(value)];
      },
    }),
    BonesForce: ({ children }: { children: ReactNode }) => <>{children}</>,
    Bones: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
}

export function bonesWithDataMockFactory() {
  return {
    createBones: <T,>(data: T) => ({
      bone: () => ({}),
      data: data ?? undefined,
      repeat: <U,>(
        arr: U[] | undefined,
        count: number,
        render: (item: U | undefined, index: number) => ReactNode,
      ): ReactNode[] => {
        const items: (U | undefined)[] = arr ?? Array.from({ length: count }, () => undefined);
        return items.map((item, i) => render(item, i));
      },
      lines: <V,>(
        value: V | null | undefined,
        _count: number,
        render: (item: V) => ReactNode,
      ): ReactNode[] => {
        if (value == null) return [];
        return [render(value)];
      },
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
      children: ReactNode;
      href: string;
      [key: string]: unknown;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
}
