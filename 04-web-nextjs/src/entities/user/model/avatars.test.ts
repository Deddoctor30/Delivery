import { AVATAR_OPTIONS, avatarSrc } from "./avatars";

describe("avatarSrc", () => {
  it("возвращает null, если аватар не задан", () => {
    expect(avatarSrc(null)).toBeNull();
    expect(avatarSrc(undefined)).toBeNull();
  });

  it("строит same-origin путь к файлу аватара", () => {
    expect(avatarSrc("avatar-male")).toBe("/static/avatars/avatar-male.webp");
    expect(avatarSrc("avatar-female")).toBe("/static/avatars/avatar-female.webp");
  });
});

describe("AVATAR_OPTIONS", () => {
  it("содержит мужской и женский варианты", () => {
    expect(AVATAR_OPTIONS.map((o) => o.id)).toEqual(["avatar-male", "avatar-female"]);
  });
});
