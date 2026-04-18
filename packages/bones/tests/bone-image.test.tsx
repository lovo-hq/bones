import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { BoneImage } from "../src/bone-image.tsx";
import { Bones } from "../src/bones.tsx";

afterEach(cleanup);

describe("BoneImage", () => {
  test("renders img when src is provided", () => {
    render(<BoneImage src="/avatar.png" width={64} height={64} alt="avatar" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.src).toContain("/avatar.png");
  });

  test("renders placeholder when src is undefined", () => {
    const { container } = render(<BoneImage src={undefined} width={64} height={64} alt="avatar" />);
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("placeholder has correct dimensions", () => {
    const { container } = render(<BoneImage src={undefined} width={64} height={64} alt="avatar" />);
    const placeholder = container.querySelector(".bone-placeholder") as HTMLElement;
    expect(placeholder?.style.width).toBe("64px");
    expect(placeholder?.style.height).toBe("64px");
  });

  test("placeholder has circle border-radius when circle prop is set", () => {
    const { container } = render(
      <BoneImage src={undefined} width={64} height={64} circle alt="avatar" />,
    );
    const placeholder = container.querySelector(".bone-placeholder") as HTMLElement;
    expect(placeholder?.style.borderRadius).toBe("50%");
  });

  test("placeholder has aria-busy and aria-label", () => {
    const { container } = render(
      <BoneImage src={undefined} width={64} height={64} alt="User avatar" />,
    );
    const placeholder = container.querySelector("[aria-busy='true']");
    expect(placeholder).toBeTruthy();
    expect(placeholder?.getAttribute("aria-label")).toBe("User avatar");
  });

  test("renders skeleton inside Bones provider even with src", () => {
    const { container } = render(
      <Bones>
        <BoneImage src="/avatar.png" width={64} height={64} alt="avatar" />
      </Bones>,
    );
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("preserves className on placeholder", () => {
    const { container } = render(
      <BoneImage src={undefined} width={64} height={64} className="rounded-full" alt="avatar" />,
    );
    const placeholder = container.querySelector(".bone-placeholder");
    expect(placeholder?.className).toContain("rounded-full");
  });
});
