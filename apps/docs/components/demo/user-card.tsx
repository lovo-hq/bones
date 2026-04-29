import { createBones } from "bones";

interface User {
  name: string;
  avatar: string;
  bio: string;
}

const mockUser: User = {
  name: "Alex Morgan",
  avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Alex",
  bio: "Design engineer who loves building UI primitives.",
};

export function DemoUserCard({ user }: { user?: Promise<User> }) {
  const { bone, data, lines } = createBones(user ?? Promise.resolve(mockUser));

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <img
        src={data?.avatar}
        alt=""
        width={48}
        height={48}
        style={{ borderRadius: "50%" }}
        {...bone("block")}
      />
      <div>
        <h3
          style={{ margin: 0, fontSize: 16, fontWeight: 600 }}
          {...bone("text", { length: 12 })}
        >
          {data?.name}
        </h3>
        {lines(data?.bio, 2, (item) => (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#888" }}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
