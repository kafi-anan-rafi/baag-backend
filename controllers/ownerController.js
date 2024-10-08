const ownerModel = require("../models/ownerModel");
const {
  hashPassword,
  generateToken,
  comparePassword,
} = require("../utils/authUlits");
const {
  registrationSchema,
  loginSchema,
} = require("../validations/ownerSchema");

async function Login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const allMessages = error.details.map((err) => err.message);
      return res.status(400).json({ message: allMessages });
    }

    // find the owner from the database
    const owner = await ownerModel.findOne({ email: value.email });
    if (!owner) {
      return res.status(404).send({ message: "Owner not found" });
    }

    // hash owner supplied password
    const { isHashed, hashedPassword, hashError } = await hashPassword(
      value.password
    );
    if (!isHashed) {
      return res.status(401).json({ message: hashError });
    }

    // compare hashed password with the database password
    const { status, isMatch, comparisonError } = await comparePassword(
      value.password,
      hashedPassword
    );
    if (!status) {
      return res.status(401).json({ mesasge: comparisonError });
    }
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const { valid, token, message } = generateToken(owner);
    if (!valid) {
      return res.status(401).json({ message });
    }

    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    next(error);
  }
}

async function Registration(req, res, next) {
  try {
    const { filename: picture } = req.file;
    const { name, email, password, address } = req.body;
    const { error, value } = registrationSchema.validate(
      { name, email, password, address, picture },
      {
        abortEarly: false,
      }
    );
    if (error) {
      const allMessages = error.details.map((err) => err.message);
      return res.status(400).json({ message: allMessages });
    }

    // check whether the email exist before or not
    const owner = await ownerModel.findOne({ email: value.email });
    if (owner) {
      return res.status(400).json({ message: "Owner already exists!" });
    }
    const { isHashed, hashedPassword, hashError } = await hashPassword(
      value.password
    );
    if (!isHashed) {
      return res.status(401).json({ message: hashError });
    }
    value.password = hashedPassword;
    const newOwner = await ownerModel.create(value);
    const { valid, token, message } = generateToken(newOwner);
    if (!valid) {
      return res.status(401).json({ message });
    }
    res.status(201).send({ message: "Registration succeful", token });
  } catch (error) {
    next(error);
  }
}

async function ViewProfile(req, res, next) {
  try {
    const { _id: ownerId } = req.user;
    const owner = await ownerModel.findById(ownerId).select("-password");
    if (!owner) {
      return res.status(404).json({ message: "Owner doesn't exist!" });
    }

    // Generate the profile photo URL
    const profilePhotoUrl = `${req.protocol}://${req.get("host")}/uploads/${
      owner.picture
    }`;
    res.status(200).json({
      name: owner.name,
      email: owner.email,
      profilePhoto: profilePhotoUrl,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { Login, Registration, ViewProfile };
