import UserEntity from "@business-logic/User";

import { hashPassword } from "@helpers/auth";
import prisma from "@helpers/prisma";
import { teardown } from "@helpers/tests/teardown";

let hashedPassword: string;
const email = "doe@email.com";

describe("User", () => {
  beforeEach(async () => {
    await teardown();
    hashedPassword = await hashPassword("Doe@2022^3");
  });

  describe("#create", () => {
    it("should create user", async () => {
      const requestParams = {
        name: "John Doe",
        email,
        password: hashedPassword,
      };
      const entity = new UserEntity();
      const result = await entity.create(requestParams);
      const { message } = result;
      expect(message).toBe("User created");
    }, 60000);
    it("Should not create user when email exists", async () => {
      const requestParams = {
        name: "John Doe",
        email,
        password: hashedPassword,
      };
      const entity = new UserEntity();
      await entity.create(requestParams);
      await expect(async () => {
        await entity.create(requestParams);
      }).rejects.toThrowError("Email address is already registered.");
    }, 60000);
    it("Should not create user when password is invalid", async () => {
      const requestParams = {
        name: "John Doe",
        email: "doe2@email.com",
        password: "",
      };
      const entity = new UserEntity();
      await expect(async () => {
        await entity.create(requestParams);
      }).rejects.toThrowError("Invalid input - password should be at least 7 characters long.");
    }, 60000);
    it("Should not create user when email is invalid", async () => {
      const requestParams = {
        name: "John Doe",
        email: "doeemail.com",
        password: hashedPassword,
      };
      const entity = new UserEntity();
      await expect(async () => {
        await entity.create(requestParams);
      }).rejects.toThrowError("Invalid email");
    }, 60000);
  });
});

describe("#getOne", () => {
  it("Should get single user", async () => {
    const company = await prisma.company.create({
      data: {
        name: "John Doe",
      },
    });
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "doe@email.com",
        password: hashedPassword,
        companyId: company.id,
      },
    });
    const entity = new UserEntity();
    const result = await entity.find(user.id);
    expect(result?.name).toBe(user.name);
  }, 60000);
});
