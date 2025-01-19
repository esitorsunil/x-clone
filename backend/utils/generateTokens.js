import jwt from "jsonwebtoken";

const generateTokens = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});

    res.cookie("jwt", token, {
        httpOnly: true, //xss attack
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict", // csrf attack
        maxAge: 15 * 24 * 60 * 1000
    });
};

export default generateTokens;