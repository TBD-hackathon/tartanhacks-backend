/**
 * Test suite for the User model
 */
import User from "../../src/models/User";
import { IUser } from "../../src/_types/User";
import { assert } from "chai";

describe("User", () => {
  let user: IUser;
  /**
   * Create a user for use
   */
  before("should save", async () => {
    user = new User({
      email: "tartanhacks@scottylabs.org",
      password: "abc123",
      admin: false,
    });
    const savedUser = await user.save();
    assert.notEqual(savedUser, null);
  });

  describe("Password hashing", () => {
    let userTest: IUser;
    const password = "abc123";
    const badPassword = "123abc";
    const hash = User.generateHash(password);

    before("setup user", async () => {
      userTest = new User({
        email: "tech@scottylabs.org",
        password: hash,
        admin: false,
      });
      await userTest.save();
    });

    it("good password should validate", async () => {
      const result = userTest.checkPassword(password);
      assert.strictEqual(result, true);
    });

    it("bad password should not validate", async () => {
      const result = userTest.checkPassword(badPassword);
      assert.strictEqual(result, false);
    });
  });

  describe("Email verification token", () => {
    it("should encrypt and decrypt properly", () => {
      const emailToken = user.generateEmailVerificationToken();
      const email = User.decryptEmailVerificationToken(emailToken);
      assert.equal(email, "tartanhacks@scottylabs.org");
    });
  });

  describe("Auth token", () => {
    it("Should encrypt and decrypt properly", () => {
      const authToken = user.generateAuthToken();
      const id = User.decryptAuthToken(authToken);
      assert.equal(id, user._id);
    });
  });

  describe("Password reset token", () => {
    it("Should encrypt and decrypt properly", () => {
      const resetToken = user.generatePasswordResetToken();
      const id = User.decryptPasswordResetToken(resetToken);
      assert.equal(id, user._id);
    });
  });
});