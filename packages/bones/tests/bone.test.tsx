import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { Bone } from "../src/bone.tsx";
import { Bones } from "../src/bones.tsx";

afterEach(cleanup);

describe("Bone", () => {
  test("renders children when truthy", () => {
    render(<Bone as="h2">Hello</Bone>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  test("renders skeleton when children are undefined", () => {
    const { container } = render(<Bone as="span">{undefined}</Bone>);
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("renders skeleton when children are null", () => {
    const { container } = render(<Bone as="span">{null}</Bone>);
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("renders skeleton when children are false", () => {
    const { container } = render(<Bone as="span">{false}</Bone>);
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("renders skeleton when children are empty string", () => {
    const { container } = render(<Bone as="span">{""}</Bone>);
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("does not render skeleton for children={0}", () => {
    render(<Bone as="span">{0}</Bone>);
    expect(screen.getByText("0")).toBeTruthy();
  });

  test("renders the correct element via as prop", () => {
    render(<Bone as="h2">Title</Bone>);
    const el = screen.getByText("Title");
    expect(el.tagName).toBe("H2");
  });

  test("defaults to span element", () => {
    render(<Bone>Content</Bone>);
    const el = screen.getByText("Content");
    expect(el.tagName).toBe("SPAN");
  });

  test("preserves className in both states", () => {
    const { container, rerender } = render(
      <Bone as="div" className="my-class">
        {undefined}
      </Bone>,
    );
    expect(container.querySelector(".my-class")).toBeTruthy();

    rerender(
      <Bone as="div" className="my-class">
        Loaded
      </Bone>,
    );
    expect(screen.getByText("Loaded").className).toContain("my-class");
  });

  test("renders multiple lines", () => {
    const { container } = render(
      <Bone as="p" lines={3}>
        {undefined}
      </Bone>,
    );
    const placeholders = container.querySelectorAll(".bone-placeholder");
    expect(placeholders.length).toBe(3);
  });

  test("last line in multi-line is 80% width", () => {
    const { container } = render(
      <Bone as="p" lines={3}>
        {undefined}
      </Bone>,
    );
    const placeholders = container.querySelectorAll<HTMLElement>(".bone-placeholder");
    expect(placeholders[2]?.style.width).toBe("80%");
    expect(placeholders[0]?.style.width).toBe("100%");
  });

  test("sets aria-busy on skeleton container", () => {
    const { container } = render(<Bone as="div">{undefined}</Bone>);
    expect(container.querySelector("[aria-busy='true']")).toBeTruthy();
  });

  test("sets aria-hidden on placeholder spans", () => {
    const { container } = render(<Bone as="div">{undefined}</Bone>);
    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy();
  });

  test("does not set aria-busy when loaded", () => {
    const { container } = render(<Bone as="div">Content</Bone>);
    expect(container.querySelector("[aria-busy]")).toBeNull();
  });

  test("applies circle border-radius", () => {
    const { container } = render(
      <Bone as="div" circle>
        {undefined}
      </Bone>,
    );
    const placeholder = container.querySelector(".bone-placeholder") as HTMLElement;
    expect(placeholder?.style.borderRadius).toBe("50%");
  });

  test("renders skeleton inside Bones provider even with truthy children", () => {
    const { container } = render(
      <Bones>
        <Bone as="span">Truthy content</Bone>
      </Bones>,
    );
    expect(container.querySelector(".bone-placeholder")).toBeTruthy();
  });

  test("renders normally outside Bones provider with truthy children", () => {
    render(<Bone as="span">Normal content</Bone>);
    expect(screen.getByText("Normal content")).toBeTruthy();
  });
});
